# getupp-website

Marketing/waitlist site for Getupp, built with Astro (static output) + Tailwind. Deployed on
Vercel. Waitlist signups POST directly to Supabase (see `src/components/ui/SignupForm.astro`).

## Analytics (Meta Pixel)

The site runs a single Meta Pixel (dataset ID in `src/lib/analytics.ts`) across every page,
for comparing waitlist conversion across A/B-tested landing-page variants in Events Manager.

When adding a new landing page:

- **Render it through `BaseLayout`** (directly, or via a wrapper like `LegalLayout` that itself
  wraps `BaseLayout`). That's what installs the pixel and fires `PageView` — never paste the
  Meta base snippet or a different pixel ID into a page directly.
- **Set a variant label if you want one.** `BaseLayout` derives a `content_name` label from the
  route automatically (e.g. `/lp/morning-v2` → `lp-morning-v2`). Pass an explicit
  `variant="your-label"` prop to `BaseLayout` only if you want something else in Events Manager.
  Nothing else needs wiring.
- **Conversions go through `trackLead()`** in `src/lib/tracking.ts`, called after an async
  success resolves (e.g. after the Supabase insert succeeds) — not on click. Don't call `fbq(...)`
  directly from a page or component; that's how variant tagging and the CAPI-ready `event_id`
  stay consistent everywhere.
- **One pixel ID for all variants.** Do not create a second pixel/dataset for a new landing page.
