# GETUPP Landing Page — Redesign Spec v1

**Status:** Ready for implementation
**Repo:** `getupp-website/`
**Stack:** Astro (unchanged), Vercel (unchanged), Supabase (unchanged), Meta Pixel (unchanged)
**Reference design:** `design-ref/getupp-beast-7a.html` (block `7a` only) + `design-ref/getupp-beast-final.png`

---

## 1. What this is

A **full visual redesign** of getupp.co. Same page, same purpose, new look and new voice: harder, louder, more tabloid. The current page tested as too soft.

This is a UI redesign with **one** functional change (the waitlist modal flow). Everything else — Supabase, Pixel, hosting, routing — stays exactly as it is.

### Goals

1. Ship a punchier landing page that matches the brand's cornerman voice.
2. Ship it fast — this is feeding live ad spend, not a portfolio piece.
3. Lose zero existing measurement (Pixel history, Supabase waitlist rows, campaign learning).

### Non-goals (explicitly out of scope for v1)

| Not doing | Why |
|---|---|
| Android / Google Play anything | iOS-only launch |
| A blog, changelog, or extra routes | Single-page product |
| Animation / scroll effects | Adds time, unproven lift |
| Real App Store link | App isn't shipped; badge goes to the waitlist modal for now (accepted risk, revisit in ~2 weeks) |
| Dark/light mode toggle | The design is already high-contrast by nature |
| CMS-ing the copy | Copy changes by editing components |
| Server-side CAPI | Separate initiative, already tracked |

---

## 2. Hard boundaries (do not violate)

These exist because breaking them costs more than the redesign is worth.

- **Do not modify the existing Meta Pixel `Lead` event.** It fires today on successful waitlist submit. Its name, its trigger point, and its parameters stay identical. Live campaigns are optimising against it; renaming or re-scoping it resets learning. Add new events alongside it — never in place of it.
- **Do not modify the Supabase table schema, RLS policies, or `supabase-setup.sql`.** The insert-only waitlist table works. The redesign changes *when* the form appears, not what it writes.
- **Do not change `astro.config.mjs`, Vercel config, env var names, or `.env.local`.**
- **Do not delete the old components until the new page is verified on a preview deploy.** Move them to `src/components/_legacy/` if they're in the way.
- **Work on a branch.** `redesign/beast-v1`. `main` stays live throughout.

---

## 2b. Asset manifest

All in `getupp-website/public/images/`. These are the real filenames — use them verbatim.

| File | Used in | Role |
|---|---|---|
| `selfie-in-bed-1.png` | §4.3 ThreeScreens card 2 | The "ABSOLUTELY NOT. THAT IS A BED." rejection mock |
| `selfie-in-bed-2.png` | §4.4 TheMaths | The "FORTY-ONE MINUTES GONE." photo — the one with the phone visible |
| `ceiling.png` | §4.5 NotFooled tile 1 | REJECTED — `LOVELY CEILING.` |
| `still-in-bedroom.png` | §4.5 NotFooled tile 2 | REJECTED — `STILL THE BEDROOM. NICE YAWN.` |
| `look-at-you.png` | §4.5 NotFooled tile 3 | APPROVED — `WELL, LOOK AT YOU.` |
| `showing-off.png` | §4.5 NotFooled tile 4 | APPROVED — `OK, NOW YOU'RE SHOWING OFF.` |
| `badges/badge-appstore.png` | §4.2 Hero, §4.6 Pricing FREE | App Store badge |

No Google Play badge. No hero phone mock image — that's built in HTML/CSS.

**Do not clear or overwrite `public/fonts/`.** It contains the Pangram Pangram files the current live page depends on. New Google fonts get added alongside; the old ones are removed only after cutover in phase 6.

---

## 3. Design tokens

Extracted from the reference. These go in **one** file (`src/styles/tokens.css`) and everything else consumes them. No hardcoded hex values in components.

### Colour

| Token | Value | Role |
|---|---|---|
| `--ink` | `#131313` | Near-black. Primary text on light, primary background on dark sections. |
| `--acid` | `#ffe100` | The yellow. Primary background, primary accent, highlight blocks. |
| `--bone` | `#f6f4ee` | Off-white. Text on dark, footer background. |
| `--bone-dim` | `#ded9cd` | Muted cream. Card backgrounds, dividers on light. |
| `--ink-soft` | `#57554e` | Secondary text on light backgrounds. |
| `--ink-fade` | `#8b8880` | Tertiary / footer text. |
| `--rule` | `#c4c1b8` | Hairline borders. |

The page is only ever one of two temperatures: **acid-on-ink** or **ink-on-acid**. There is no third scheme. If a component needs a colour not in this table, that's a signal the design is being misread — flag it rather than inventing one.

### Type

| Token | Stack | Use |
|---|---|---|
| `--font-display` | `Anton, sans-serif` | All headlines, verdict labels, numbers, buttons. Uppercase always. |
| `--font-body` | `Archivo, sans-serif` | Body copy, descriptions, subheads. |
| `--font-mono` | `'DM Mono', monospace` | Nav links, timestamps, status labels, footer, all "system chrome" text. |

All three are Google Fonts. **Self-host them** in `public/fonts/` rather than linking `fonts.googleapis.com` — one less render-blocking third-party request, and it avoids a layout shift on the biggest headline on the page. Use `font-display: swap`.

Weights needed: Anton 400 (only weight), Archivo 400/500/600, DM Mono 400/500.

### Type scale (desktop → mobile)

Define these as tokens with a `clamp()` so mobile falls out mostly automatically:

| Token | Desktop | Mobile floor | Font |
|---|---|---|---|
| `--fs-hero` | 112px | 44px | display |
| `--fs-section` | 84px | 38px | display |
| `--fs-headline` | 56px | 30px | display |
| `--fs-stat` | 48px | 34px | display |
| `--fs-card-title` | 40px | 28px | display |
| `--fs-label` | 24px | 20px | display |
| `--fs-body` | 17px | 16px | body |
| `--fs-small` | 15px | 14px | body |
| `--fs-mono` | 13px | 12px | mono |
| `--fs-mono-sm` | 11px | 10px | mono |

Letter-spacing: `0.04em` on all mono text. Zero on display. Display line-height `0.92`; body `1.5`.

### Spacing

4px base. Section padding: `64px 40px` desktop, `40px 20px` mobile. Grid gaps: 64px desktop / 32px mobile for major layout, 22px / 16px for card grids.

---

## 4. Page structure

Seven blocks, top to bottom. Each becomes one Astro component in `src/components/`.

### 4.1 `Nav.astro`
Acid background. Wordmark left (Anton, with the two eye-rectangles above the PP — this is an inline SVG, take it verbatim from the reference). Right: `HOW IT WORKS` · `PRICE` in mono, then the ink-filled `GET THE APP — FREE` button.

**Mobile:** wordmark left, `GET THE APP` button right. Drop the two text links entirely — no hamburger menu, the page is short enough to scroll. Button label shortens to `GET THE APP`.

### 4.2 `Hero.astro`
Acid background. Desktop grid `1fr 320px`.

Left column:
- H1, three lines, display: `GET UP. / GET YOUR / MORNING BACK.`
- Body paragraph.
- App Store badge (single — Google Play removed) + mono microcopy `FREE TO USE. / NO TRIAL, NO CARD.`

Right column: the phone mock. Built in HTML/CSS, not an image — ink body, 40px radius, acid screen. Contains status row `6.47 / ALARM JUST WENT`, lock glyph, `YOUR APPS ARE SHUT.`, three status rows (`INSTAGRAM · TIKTOK — LOCKED` / `X · YOUTUBE — LOCKED` / `CALLS · MAPS · MUSIC — YOURS`), the ink `PROVE YOU'RE UP` button, and the mono caption.

**REMOVED from this section:** the three-column `1 — APPS BLOCKED / 2 — PROVE IT / 3 — TIMER RUNS` strip at the bottom of the hero. It duplicates section 4.3. Delete it and close the vertical gap — the acid block should end cleanly below the CTA/phone row.

**Mobile:** single column. H1 → body → badge + microcopy → phone mock last. Phone mock caps at 280px wide, centred.

### 4.3 `ThreeScreens.astro`
Ink background, acid headline. `THREE SCREENS. / ONE MORNING.` left, intro paragraph top-right in bone.

Three cards below, grid `repeat(3, 1fr)`, each with a mono numbered label above (`1 — THE ALARM GOES`), a one-line description, then a mock screen:
1. Acid card — `FIVE APPS, SHUT.` + ink `FINE, I'M UP` button.
2. Photo card (`selfie-in-bed-1.png`) with the acid verdict sticker `ABSOLUTELY NOT. THAT IS A BED.` and a dashed acid detection box overlay. Mono caption below.
3. Bone card — timer `26:41` + `OF MORNING LEFT.` + progress bar + mono endpoints.

**Mobile:** stack to one column. Cards keep their internal layout. Intro paragraph moves below the headline, left-aligned.

### 4.4 `TheMaths.astro`
Acid background. Desktop grid `1fr 520px`.

Left: headline `250 HOURS A YEAR, / WASTED / DOOMSCROLLING.` with `GET IT BACK.` in an inverted ink block on its own line. Below, three stats in a `repeat(3, 1fr)` grid separated by vertical hairlines: `41 MIN`, `89%`, `10.4`, each with a small body caption.

Right: `selfie-in-bed-2.png` with a mono timestamp bar top (`07.29 · ALARM WENT AT 06.48`) and the acid sticker `FORTY-ONE MINUTES GONE.` overlapping the bottom-left edge.

**Mobile:** headline → photo → stats. Stats go to a single column with horizontal rules between them instead of vertical. The photo before the stats keeps the emotional hit above the fold-equivalent.

### 4.5 `NotFooled.astro`
Ink background. Headline `IT IS NOT / FOOLED BY YOU.` left, bone paragraph top-right.

Four-up photo grid, `repeat(4, 1fr)`. Each tile: a corner chip (`✕ REJECTED` in acid-on-ink, `✓ APPROVED` in ink-on-acid) and a bottom verdict sticker in Anton 25px.

Order and copy, exactly:
1. `ceiling.png` — REJECTED — `LOVELY CEILING.`
2. `still-in-bedroom.png` — REJECTED — `STILL THE BEDROOM. NICE YAWN.`
3. `look-at-you.png` — APPROVED — `WELL, LOOK AT YOU.`
4. `showing-off.png` — APPROVED — `OK, NOW YOU'RE SHOWING OFF.`

**Mobile:** 2×2 grid, not 1×4. Four full-width photos is too much scroll for the payoff. Verdict sticker font drops to 16px so the longest line still fits on one or two lines at half-width.

### 4.6 `Pricing.astro`
Bone/ink section. Two cards, `1fr 1fr`.

Left — `FREE`: ink card, bone text, description, App Store badge (Google Play removed).
Right — `PLUS`: acid card, mono `PAID · PRICE TBC` beside the title, three hairline-separated rows (`Custom morning time settings` / `Weekend rules` / `Premium extras, coming soon`), then the ink `GET UPP PLUS` button.

**Mobile:** stack, FREE first.

**Note:** the `GET UPP PLUS` button also opens the waitlist modal. There is nothing to buy yet.

### 4.7 `Footer.astro`
Bone background, faded text. Oversized ghost wordmark left with the tagline under it. Right: three mono columns of links.

**Change:** `iOS + ANDROID` → `iOS`.

**Mobile:** wordmark scales down, link columns stack to a single column.

---

## 5. The waitlist modal (the one functional change)

### Current behaviour
Inline email form on the page → Supabase insert → `Lead` fires.

### New behaviour
Every CTA on the page opens a modal containing the form.

**CTAs that trigger it (all four):**
1. Nav `GET THE APP — FREE`
2. Hero App Store badge
3. Pricing FREE App Store badge
4. Pricing `GET UPP PLUS`

### Modal content

Acid background, ink text, matching the page. Not a rounded soft dialog — a hard-edged block.

- Headline (display): `NOT OUT YET.`
- Body: `We're letting people in in batches. Leave your email and you're in the queue for the next one.`
- Email input + submit button `GET IN THE QUEUE`
- Close: `✕` top-right, plus Esc key, plus backdrop click.

> **Copy note.** The original brief said "we've reached maximum users." I'd push back on that — it's a fabricated scarcity claim, and this brand's entire premise is that it doesn't lie to you at 7am. "Not out yet, we let people in in batches" is true, does the same job, and can't blow up. Final call is yours; if you want the original line, swap the copy, nothing structural changes.

### States

| State | Behaviour |
|---|---|
| Default | Form, empty, autofocus the email input |
| Invalid email | Inline error under the field, ink text: `That's not an email.` Do not submit. |
| Submitting | Button label → `SENDING...`, button disabled |
| Success | Replace form body with display text `YOU'RE IN.` + body `We'll email you when the next batch opens. Go get up in the meantime.` |
| Error | Keep the form, show `Something broke. Try again?` under the button. Do not clear the field. |
| Already submitted (return visit) | Skip the form, open straight to the success state. Detect via a `localStorage` flag written on first success. |

### Accessibility floor
Focus trap inside the modal, focus returns to the triggering button on close, `role="dialog"` + `aria-modal="true"`, Esc closes. Not optional — it's twenty minutes and it also stops screen-reader-adjacent bugs from tanking the mobile experience.

---

## 6. Pixel events

Three events. **`Lead` is untouched.**

| Event | Type | Fires when | Params |
|---|---|---|---|
| `PageView` | standard, existing | Page load | — (unchanged) |
| `WaitlistOpen` | **custom** (`trackCustom`) | Any of the four CTAs opens the modal | `{ source: 'nav' \| 'hero' \| 'pricing_free' \| 'pricing_plus' }` |
| `Lead` | standard, **existing** | Supabase insert returns success | Unchanged. Same name, same trigger point, same params as today. |

`WaitlistOpen` is a custom event because standard events carry optimisation semantics you don't want to muddy. `Lead` remains the conversion event campaigns optimise for.

The `source` param is the point of the exercise — it tells you whether the hero badge or the nav button is doing the work, which feeds your creative decisions. Verify it lands in Events Manager before you scale spend.

**Acceptance:** open Meta Pixel Helper on the preview deploy. Click each of the four CTAs, confirm four `WaitlistOpen` fires with four distinct `source` values. Submit once, confirm exactly one `Lead`.

---

## 7. Responsive rules

One breakpoint: **`768px`**. Below is mobile, above is desktop. Do not build a tablet-specific layout — it's a landing page, not an app, and every extra breakpoint is surface area for bugs.

Global mobile rules:
- Section padding `40px 20px`.
- Every multi-column grid collapses to one column, **except** `NotFooled` which goes 2×2.
- No horizontal scroll, ever. The 1440px wrapper in the reference must not survive into the build — the page container is `width: 100%; max-width: 1440px; margin: 0 auto`.
- Tap targets minimum 44px tall.
- The hero H1 must not break awkwardly. At 44px on a 375px screen, `MORNING BACK.` fits on one line — verify on a real iPhone, not just devtools.

**Reality check:** the reference design has zero media queries and every dimension hardcoded in pixels. Mobile is being invented at build time, not translated. Expect the first mobile pass to be ~70% right and budget a polish round. That's why it's phased this way.

---

## 8. Implementation phases

Each phase is independently verifiable. Do not start the next until the previous passes its gate.

| Phase | Scope | Gate |
|---|---|---|
| **0** | Branch created. Assets pasted into `public/images/`. Fonts self-hosted in `public/fonts/`. Reference HTML + PNG in `design-ref/`. | Files present, `npm run dev` still boots the old page |
| **1** | `tokens.css` + font-face declarations only. No visual change. | Token file exists, every value traceable to §3, old page unaffected |
| **2** | `Nav` + `Hero` + `Footer` on a new route `/preview`. Desktop **and** mobile. | Side-by-side against the PNG on desktop; opened on a real iPhone. This is the calibration gate — if the interpretation is wrong, it's wrong here and costs one section, not seven |
| **3** | `ThreeScreens`, `TheMaths`, `NotFooled`, `Pricing`. One commit each. | Each section reviewed individually before the next starts |
| **4** | Waitlist modal + Supabase wiring + Pixel events | All states in §5 manually walked; Pixel Helper check in §6 |
| **5** | Polish: copy tweaks, colour richness, spacing. Then `/preview` becomes `/`. | Full page review, both viewports, then merge |

Phase 5 exists so you have a designated place to put "this feels rough." Resist doing it during phases 2–4 — refining a section that later gets restructured is the main way this kind of project doubles in length.

---

## 9. Open questions

| # | Question | Blocking? | Owner |
|---|---|---|---|
| Q1 | Modal copy — "not out yet, batches" (recommended) or the original "maximum users"? | No — swap a string in phase 4 | André + cofounder |
| Q2 | Does the acid `#ffe100` hold up on a real phone at 7am brightness, or does it need dropping a few points? | No — phase 5 | André |
| Q3 | The `250 HOURS`, `41 MIN`, `89%`, `10.4` figures — are these sourced or placeholder? If a journalist or a user asks for a citation, is there one? | No, but answer before scaling spend | André |
| Q4 | Nav `HOW IT WORKS` / `PRICE` links — anchor scroll to sections, or delete? Reference has them as links to nothing. | Yes, phase 2 | André |

---

## 10. Acceptance criteria (full page, before merge)

- [ ] Renders identically to `getupp-beast-final.png` at 1440px, minus the removed hero step-strip and minus Google Play
- [ ] No Google Play badge anywhere; footer reads `iOS`
- [ ] No hero three-step strip; the acid hero block closes cleanly
- [ ] Zero horizontal scroll at 320px, 375px, 390px, 768px, 1440px
- [ ] Verified on a physical iPhone, not just devtools
- [ ] All four CTAs open the modal
- [ ] Modal: valid submit writes a row to Supabase; invalid email blocks submit; Esc/backdrop/✕ all close; focus returns to trigger
- [ ] Return visit opens straight to the success state
- [ ] `WaitlistOpen` fires with the correct `source` from each of the four CTAs
- [ ] `Lead` fires exactly once per successful submit, unchanged from its current definition
- [ ] Lighthouse mobile performance ≥ 85
- [ ] No hardcoded hex values outside `tokens.css`
- [ ] `supabase-setup.sql`, `astro.config.mjs`, `.env.local` unmodified (`git diff` proves it)
