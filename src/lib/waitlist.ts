/**
 * Shared waitlist-signup logic. Extracted from the old inline SignupForm so
 * WaitlistModal.astro (and anything else that ever needs it) doesn't
 * duplicate the Supabase insert. The insert itself is untouched from the
 * pre-redesign implementation: same table, same REST endpoint, same
 * "201 or 409 both count as success" handling — the redesign changes where
 * the form appears, not what it writes (redesign-spec-v1.md §2).
 */

export interface WaitlistResult {
  /** True if this email was already on the list (409), false if freshly inserted (201). */
  alreadyOnList: boolean;
}

/** Posts an email to the waitlist table. Throws on any non-201/409 response or network error. */
export async function submitToWaitlist(email: string, source: string): Promise<WaitlistResult> {
  const SUPABASE_URL = import.meta.env.PUBLIC_SUPABASE_URL;
  const SUPABASE_ANON_KEY = import.meta.env.PUBLIC_SUPABASE_ANON_KEY;

  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
    throw new Error('Supabase env vars are not configured (PUBLIC_SUPABASE_URL / PUBLIC_SUPABASE_ANON_KEY).');
  }

  const response = await fetch(`${SUPABASE_URL}/rest/v1/waitlist`, {
    method: 'POST',
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      'Content-Type': 'application/json',
      Prefer: 'return=minimal',
    },
    body: JSON.stringify({ email, source }),
  });

  // 201 = inserted. 409 = unique violation (already on the list) — treat as success too.
  if (response.ok || response.status === 409) {
    return { alreadyOnList: response.status === 409 };
  }

  throw new Error(`Unexpected status ${response.status}`);
}

const STORAGE_KEY = 'getupp-waitlist-joined';

/** Whether this browser has ever successfully joined the waitlist. */
export function hasJoinedWaitlist(): boolean {
  try {
    return localStorage.getItem(STORAGE_KEY) === '1';
  } catch {
    // Storage disabled/unavailable (private mode, etc.) — fall back to always showing the form.
    return false;
  }
}

/** Call once, right after a successful submitToWaitlist(). */
export function markWaitlistJoined(): void {
  try {
    localStorage.setItem(STORAGE_KEY, '1');
  } catch {
    // Ignore — worst case the user sees the form again next visit.
  }
}
