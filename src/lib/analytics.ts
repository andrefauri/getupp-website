/**
 * Meta Pixel / dataset config. Single source of truth: import from here,
 * never hardcode the pixel ID or re-paste the base snippet elsewhere.
 */
export const META_PIXEL_ID = '2083252295613312';

/**
 * Set true to require consent before the pixel initializes (e.g. once a
 * cookie banner is wired up). Defaults to active. See MetaPixel.astro —
 * when true, it defines `window.getuppGrantPixelConsent()` instead of
 * initializing immediately; call that function once consent is granted.
 */
export const PIXEL_REQUIRE_CONSENT = false;

/**
 * Derives a variant label from a route when a page doesn't set one
 * explicitly. `/` -> "home", `/lp/morning-v2` -> "lp-morning-v2".
 * This is what lets a new landing page "just work" with no analytics
 * wiring beyond an optional explicit `variant` prop on BaseLayout.
 */
export function variantFromPathname(pathname: string): string {
  const trimmed = pathname.replace(/^\/+|\/+$/g, '');
  return trimmed === '' ? 'home' : trimmed.replace(/\//g, '-');
}
