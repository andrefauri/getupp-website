/**
 * Shared conversion-tracking helper. Every landing page fires the waitlist
 * "Lead" event through this one function — never call fbq() directly from
 * a page or component — so variant tagging and event_id generation stay
 * consistent as new landing pages are added.
 */

declare global {
  interface Window {
    fbq?: (...args: unknown[]) => void;
  }
}

function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID();
  }
  // Fallback for environments without crypto.randomUUID (older browsers).
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

/** Reads the page's variant label, set by BaseLayout via <meta name="page-variant">. */
function getPageVariant(): string {
  const meta = document.querySelector<HTMLMetaElement>('meta[name="page-variant"]');
  return meta?.content || 'unknown';
}

/**
 * Fires the "Lead" standard event for a successful waitlist signup. Call
 * this after the Supabase insert resolves (not on button click / on
 * validation) so it reflects actual conversions.
 *
 * Returns the generated event_id. CAPI HOOK: to dedupe with a future
 * server-side send, a Supabase Edge Function triggered by the waitlist
 * insert should send the same event_id (+ event name "Lead") via the
 * Conversions API — Meta matches on (pixel, event name, event_id).
 */
export function trackLead(params?: { source?: string }): string {
  const eventId = uuid();

  window.fbq?.(
    'track',
    'Lead',
    {
      content_name: getPageVariant(), // the A/B dimension to break down by in Events Manager
      content_category: params?.source, // section-level origin, e.g. "hero" | "cta"
    },
    { eventID: eventId },
  );

  return eventId;
}

/**
 * Fires the "WaitlistOpen" custom event when any of the four modal-opening
 * CTAs is clicked (redesign-spec-v1.md §6). Deliberately trackCustom, not
 * track — standard events carry optimisation semantics that must stay
 * exclusive to "Lead", which remains the only event campaigns optimise for.
 */
export function trackWaitlistOpen(source: string): void {
  window.fbq?.('trackCustom', 'WaitlistOpen', { source });
}
