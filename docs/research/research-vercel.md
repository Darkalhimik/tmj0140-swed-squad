# Vercel side of the Swedbank concept: Geist design system and dashboard UX

Research date: 2026-10-29. Scope: Vercel only (Geist + Vercel dashboard). Revolut and Swedbank are covered by other agents.

**How to read this**
- **Verified** = read directly from vercel.com pages, Markdown docs (`.md` endpoints) or the production Geist CSS bundle fetched on 2026-10-29. Exact values come from the CSS.
- **Unverified** = recalled from memory of the product, from third-party sources, or inferred. These are marked *(unverified)*.
- **Proposal** = my recommendation for the Swedbank concept. These are not Vercel facts.
- Geist docs now publish an agent-friendly Markdown copy of every page. Append `.md` to any URL, for example `https://vercel.com/geist/button.md`. Most component facts below come from those pages, which include a "Best Practices" section per component. That section is the closest thing to Vercel's internal UX rulebook.

---

## TL;DR: the 12 findings that matter most

1. **Geist uses a 10-step semantic color ladder.** Every scale (gray, blue, red, amber, green, teal, purple, pink) has steps 100 to 1000, and each step has one job. 100/200/300 are default, hover and active backgrounds. 400/500/600 are default, hover and active borders. 700/800 are high-contrast fills and their hover. 900 is secondary text and 1000 is primary text. Copy this ladder for the Swedbank scales and theming becomes mechanical.
2. **Vercel's primary color is ink, not a brand hue.** The primary button is `gray-1000` with a `background-100` label. Blue is functional only: focus ring, links, info. For Swedbank, **Swedbank brown becomes the "ink"** (primary buttons, primary text), cream becomes the background, and **orange is the single sparing accent**.
3. **Accessibility trap: white text on a saturated Swedbank orange fails WCAG AA.** With placeholder `#FF5F00`, white on orange measures **3.05:1** and brown on orange **3.98:1**. Both are below 4.5:1 for 14 px labels. Use orange for non-text accents (focus ring, selection, progress fills, active indicator, logo). If you need an orange text CTA, use a darker step (`#B73D10` with white measures 5.69:1).
4. **Typography is precise and tight.** All headings are weight 600 with negative tracking of about 4–6% of the font size (for example `heading-32` = 32/40, −1.28 px). Labels and buttons are 500, body copy is 400, and `<strong>` inside copy is **550**. Mono is used for code, IDs and timestamps; tabular numbers for comparisons.
5. **"Materials" give an elevation ladder.** Surfaces are 6 px radius (base, small) or 12 px (medium, large). Floating layers are tooltip 6 px, menu 12 px, modal 12 px and fullscreen 16 px. Borders are drawn as **1 px box-shadow rings** (`0 0 0 1px #00000014`) plus very soft layered translucent shadows. No heavy drop shadows.
6. **Controls are compact.** Button heights are 24, 32, 36 (default) and 40 px. Badges are 20, 24 and 32 px pills. Inputs are 32–40 px. The default transition is **150 ms** `cubic-bezier(.4,0,.2,1)`. Overlays animate in 300 ms from scale .96 with a slight overshoot easing.
7. **The new dashboard has a sidebar (default since 2026-02-26).** Horizontal tabs moved into a resizable, hideable sidebar. The same links appear at team and project level. **"Projects as filters"** lets one click switch between the team and project version of a page. On mobile a floating bottom bar replaces the sidebar. The team switcher shows the **plan next to the team name**.
8. **The copy rules are strict and worth copying wholesale.** Buttons use Title Case Verb + Noun ("Invite Member", never "OK" or "Confirm"). Toasts use "{Noun} {past participle}" ("Member removed", never "successfully"). Errors use "Couldn't … Try again." Placeholders show an example value, not an instruction.
9. **Destructive friction scales with the stakes.** `DestructiveActionModal` gates the action behind typing the resource name ("To confirm, type the project name 'my-project'"). Focus defaults to Cancel. The success toast verb matches the button verb 1:1.
10. **Transparency is a first-class product surface.**
    - **Usage page:** each metered line shows an allotment indicator plus projected cost, broken down by product, project and region. There is a time-range picker and CSV export.
    - **Spend Management:** you set an "On-Demand Budget". Alerts fire at **50/75/100%**, with SMS at 100%. Optional "Pause Production Deployments" is confirmed by typing the team name, and a webhook can be called.
    - **Honest delay disclosure:** the docs openly say the budget check runs "every few minutes" and actions can trigger late.
11. **The audit log has a defined anatomy.** Fields are timestamp, `action` (dot-namespaced, for example `team.member.left`), actor id/name/email, IP location, user agent, request_id, and `previous` and `next` JSON. Export is CSV for a chosen timeframe, delivered by email link valid 24 h. A separate Activity Log is available on all plans, covers 100% of settings changes since Feb 2026, and has had a project-level view since Jul 2026.
12. **Implementation reality for a Next.js mockup:**
    - The Geist **font** is public: npm `geist` v1.8.2 (peer `next >= 13.2.0`), or `next/font/google` (`Geist`, `Geist_Mono`).
    - The Geist **React components** (`@vercel/geistcn`) are **not on public npm** (registry returns "Not found"). Rebuild them with Tailwind and Radix/shadcn using the tokens in this report.

---

## 0. Implementation notes for the Next.js mockup

| Need | Answer | Status |
|---|---|---|
| Geist Sans / Mono in Next.js | `npm i geist`, then `import { GeistSans } from 'geist/font/sans'` and `import { GeistMono } from 'geist/font/mono'`. Put `${GeistSans.variable} ${GeistMono.variable}` on `<html>`. CSS vars are `--font-geist-sans` and `--font-geist-mono`. Exports also include `geist/font/pixel` and the `*-non-variable` variants. Peer dependency `next >= 13.2.0`. Latest version 1.8.2 (modified 2026-10-21). | Verified ([vercel.com/font](https://vercel.com/font), [npm geist](https://www.npmjs.com/package/geist)) |
| Alternative font import | `import { Geist, Geist_Mono } from 'next/font/google'` | Verified ([vercel.com/font](https://vercel.com/font)) |
| Font license | SIL OFL 1.1. Repo [github.com/vercel/geist-font](https://github.com/vercel/geist-font): about 3.7k stars, pushed 2026-10-26. | Verified |
| Families | Geist Sans: 9 weights, 652 glyphs. Geist Mono: 9 weights, 669 glyphs. Geist Pixel: 5 variants. | Verified |
| Geist React components | Published as `@vercel/geistcn` and icons as `@vercel/geistcn-assets`, but **not available on public npm** (404). `@geist-ui/core` is an unrelated community library, last modified 2022. Do not use it as "Geist". | Verified (npm registry query) |
| Icons | Geist icons ship in `@vercel/geistcn-assets/icons` (not public). Nearest public proxy: `lucide-react` at 16 px with a 1.5 px stroke *(similarity unverified)*. | Partly verified |
| Markdown docs | Append `.md` to any `vercel.com/geist/*` or `vercel.com/docs/*` URL. | Verified |

Font stacks from production CSS (verified):
- `--font-sans: var(--font-geist-sans), "Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Roboto", …, sans-serif`
- `--font-mono: "Geist Mono", ui-monospace, SFMono-Regular, Menlo, Monaco, Liberation Mono, DejaVu Sans Mono, Courier New, monospace`

---

## 1. Geist tokens

### 1.1 Color system

Sources: [vercel.com/geist/colors](https://vercel.com/geist/colors) for the semantics. Raw values come from the production CSS bundle served with the Geist pages (`/_next/static/immutable/chunks/03c2ofdjk0hta.css`, fetched 2026-10-29; the hashed filename will change).

**Scales:** `backgrounds`, `gray`, `gray-alpha`, `blue`, `red`, `amber`, `green`, `teal`, `purple`, `pink`. "P3 colors are used on supported browsers and displays." The CSS defines each color four times: hex sRGB fallback, `lab()`, HSL triplets, and final `oklch()`. The oklch values win on modern browsers.

**Step semantics (verified, verbatim from the docs):**

| Step | Usage |
|---|---|
| 100 | Default background |
| 200 | Hover background |
| 300 | Active background |
| 400 | Default border |
| 500 | Hover border |
| 600 | Active border |
| 700 | High contrast background (solid fills such as a primary badge or button) |
| 800 | Hover high contrast background |
| 900 | Secondary text and icons |
| 1000 | Primary text and icons |

Rules from the colors page (verified):
- "Gray for text, icons, fills, borders, and dividers by default. Gray-alpha only when the background should show through, such as in shadows or overlays."
- "Draw each border once": keep the divider inside the border, because overlapping alpha borders make intersections stand out.
- "Keep material shadows translucent": opaque shadows leave a gray halo.
- Backgrounds: "In most instances, you should use Background 1, especially when color is being placed on top of the background. Background 2 should be used sparingly when a subtle background differentiation is needed."
- "If your UI component's default background is Background 1, you can use Color 1 as your hover background and Color 2 as your active background. On smaller UI elements like badges, you can use Color 2 or Color 3 as the background."

#### Gray and backgrounds (verified HSL; hex derived)

| Token | Light HSL | Light hex | Dark HSL | Dark hex |
|---|---|---|---|---|
| `--ds-background-100` | 0 0% 100% | `#ffffff` | 0 0% 4% | `#0a0a0a` |
| `--ds-background-200` | 0 0% 98% | `#fafafa` | 0 0% 0% | `#000000` |
| `--ds-gray-100` | 95% | `#f2f2f2` | 10% | `#1a1a1a` |
| `--ds-gray-200` | 92% | `#ebebeb` | 12% | `#1f1f1f` |
| `--ds-gray-300` | 90% | `#e6e6e6` | 16% | `#292929` |
| `--ds-gray-400` | 92% | `#ebebeb` | 18% | `#2e2e2e` |
| `--ds-gray-500` | 79% | `#c9c9c9` | 27% | `#454545` |
| `--ds-gray-600` | 66% | `#a8a8a8` | 53% | `#878787` |
| `--ds-gray-700` | 56% | `#8f8f8f` | 56% | `#8f8f8f` |
| `--ds-gray-800` | 49% | `#7d7d7d` | 49% | `#7d7d7d` |
| `--ds-gray-900` | 30% | `#4d4d4d` | 63% | `#a1a1a1` |
| `--ds-gray-1000` | 9% | `#171717` | 93% | `#ededed` |

Note: in light mode `gray-400` equals `gray-200` (92%) in the current CSS, so the light border is very faint. In practice most borders use `gray-alpha-400` as a box-shadow ring.

**Gray-alpha (verified):**

| Step | Light | Dark |
|---|---|---|
| 100 | `#0000000d` | `#ffffff0f` |
| 200 | `#00000014` | `#ffffff17` |
| 300 | `#0000001a` | `#ffffff21` |
| 400 | `#00000014` | `#ffffff24` |
| 500 | `#00000036` | `#ffffff3d` |
| 600 | `#00000057` | `#ffffff82` |
| 700 | `#00000070` | `#ffffff8a` |
| 800 | `#00000082` | `#ffffff78` |
| 900 | `#000000b3` | `#ffffff9c` |
| 1000 | `#000000e8` | `#ffffffeb` |

#### Color scales: sRGB hex fallbacks (verified), light / dark

| Step | blue | red | amber | green | teal | purple | pink |
|---|---|---|---|---|---|---|---|
| 100 | `#f0f7ff` / `#06193a` | `#ffeef0` / `#330a11` | `#fff6e1` / `#291800` | `#ecfdec` / `#00250a` | `#dffffb` / `#00211b` | `#f9f0ff` / `#290c33` | `#ffeaf5` / `#310d1e` |
| 200 | `#eaf4ff` / `#022248` | `#ffe9ea` / `#440d13` | `#fff4d4` / `#331b00` | `#e5fce7` / `#003110` | `#ddfef6` / `#002922` | `#f9f1ff` / `#341142` | `#ffeaf2` / `#420c25` |
| 300 | `#e0efff` / `#002f62` | `#ffe4e5` / `#5d0e17` | `#fff1c8` / `#4f2900` | `#d3fad1` / `#003814` | `#ccf9f1` / `#003b33` | `#f5e8ff` / `#47185e` | `#ffe0eb` / `#571032` |
| 400 | `#cce7ff` / `#003771` | `#ffd8d7` / `#6f101b` | `#ffdd84` / `#573200` | `#b9f5bc` / `#004616` | `#b1f7ec` / `#003f35` | `#f1d9ff` / `#541a76` | `#ffd5e1` / `#5d0c34` |
| 500 | `#97ccff` / `#004287` | `#ffb5b6` / `#88151f` | `#ffc85e` / `#6c4100` | `#82eb8d` / `#00661d` | `#52f0db` / `#005f53` | `#dda9ff` / `#642290` | `#fdb3cc` / `#76063f` |
| 600 | `#51aeff` / `#0090ff` | `#ff6a6e` / `#f32e40` | `#ffaa00` / `#e99c00` | `#4ce15e` / `#009431` | `#00e2c4` / `#009885` | `#c77dff` / `#9440d5` | `#f97ea7` / `#b90056` |
| 700 | `#0070f7` / `#0071f6` | `#fc0035` / `#f13242` | `#ffb200` / `#ffb200` | `#28a948` / `#00ab3e` | `#00a694` / `#00a794` | `#9f00f4` / `#9440d5` | `#f22782` / `#f12b82` |
| 800 | `#005edc` / `#005fd8` | `#e70022` / `#e2162a` | `#ff9900` / `#ff9900` | `#279141` / `#009335` | `#008d7d` / `#008d7d` | `#8400cd` / `#7d2bba` | `#e4106e` / `#e6006e` |
| 900 | `#0064e2` / `#50a8ff` | `#d60020` / `#ff5e63` | `#a64f00` / `#ff9900` | `#107d32` / `#00ca52` | `#007a6e` / `#00c9b5` | `#7c00c9` / `#c472fb` | `#c41562` / `#ff518d` |
| 1000 | `#002453` / `#ebf6ff` | `#46000c` / `#ffeaed` | `#541c00` / `#fff3d9` | `#00370d` / `#daffe5` | `#003d34` / `#cefff5` | `#2e004d` / `#faedff` | `#460523` / `#ffeaf4` |

P3 values for the key 700 steps (verified, light): blue-700 `oklch(57.61% .2508 258.23)`, red-700 `oklch(62.56% .2524 23.03)`, amber-700 `oklch(81.87% .1969 76.46)`, green-700 `oklch(64.58% .1746 147.27)`.

**Semantic meanings of the colored scales.** These are verified from the Badge, Note, Gauge and Status Dot best practices:
- **Blue**: informational, "production", links, and the **focus color** (`--ds-focus-color: var(--ds-blue-700)` light, `blue-900` dark).
- **Red**: error, destructive.
- **Amber**: warning, in-progress (building).
- **Green**: healthy, success.
- **Gray**: neutral.
- **Teal, purple, pink**: categorical or brand moments (for example the `violet` and `cyan` Note variants, and the `trial` badge gradient).
- Quote: "Map meaning to color: `green` for healthy, `red` for error, `amber` for warning, `blue` for informational or production, `gray` for neutral."

**Focus and interaction tokens (verified):**
- `--ds-focus-ring: 0 0 0 2px var(--ds-background-100), 0 0 0 4px var(--ds-focus-color)`. This is a 2 px gap in the background color plus a 2 px ring.
- `--ds-focus-border` for inputs: light `0 0 0 1px var(--ds-gray-alpha-600), 0 0 0 4px #00000029`; dark `… 0 0 0 4px #ffffff3d`.
- Legacy `--geist-*` tokens are still present and are used by older components such as Status Dot:
  - `--geist-success: #0070f3`
  - `--geist-warning: #f5a623`
  - `--geist-error: #ee0000`
  - `--geist-cyan: #50e3c2`
  - `--accents-2: #eaeaea` (light) / `#333` (dark)

**How Vercel uses a brand accent sparingly (verified plus observed):**
- Vercel's brand is black and white. Color appears only for state (status dots, badges), function (blue focus and links), or data (charts, gauges).
- [vercel.com/design.md](https://vercel.com/design.md) is Vercel's own design brief for report pages. It says: "Design in monochrome. Use color only when it adds significant meaning to state, action, or data, and pair it with a non-color cue. Do not turn a recommendation, savings figure, cost component, or longer bar green merely because it is favorable or important."
- The same brief says "Hard reject decorative gradients, gradient text, glows, blobs, stripes, textures, grid backgrounds, glass effects … ornamental shadows, and fake depth."

### 1.2 Typography

Source: [vercel.com/geist/typography](https://vercel.com/geist/typography) for the names and usage. Exact metrics come from the production CSS (verified). All classes set `font-family`, `font-size`, `line-height`, `letter-spacing` and `font-weight`. The weight variables are `normal 400`, `medium 500`, `semibold 600` and `bold 700`.

**Headings** are always Geist Sans, weight 600, with negative tracking. "Used to introduce pages or sections."

| Class | Size / line-height | Tracking | `<strong>` modifier ("Subtle") |
|---|---|---|---|
| `text-heading-72` | 72 / 72 | −4.32 px | – |
| `text-heading-64` | 64 / 64 | −3.84 px | – |
| `text-heading-56` | 56 / 56 | −3.36 px | – |
| `text-heading-48` | 48 / 56 | −2.88 px | – |
| `text-heading-40` | 40 / 48 | −2.40 px | – |
| `text-heading-32` | 32 / 40 | −1.28 px | weight 500, color gray-900 |
| `text-heading-24` | 24 / 32 | −0.96 px | weight 500, color gray-900 |
| `text-heading-20` | 20 / 26 | −0.40 px | weight 500, color gray-900 |
| `text-heading-16` | 16 / 24 | −0.32 px | weight 500, color gray-900 |
| `text-heading-14` | 14 / 20 | −0.28 px | – |

Note the "Subtle" trick: `<h1 class="text-heading-32">Usage <strong>this cycle</strong></h1>` renders the second half at 500 weight in gray-900. It is a two-tone heading without a second element style.

**Buttons:** weight 500. "Only to be used within components that render buttons."
- `text-button-16`: 16/20. Largest button.
- `text-button-14`: 14/20. Default.
- `text-button-12`: 12/16. "Only used when a tiny button is placed inside an input field."

**Labels:** weight 400; `<strong>` gives 500 and gray-1000. "Designed for single-lines, and given ample line-height for highlighting & marrying up with icons."

| Class | Size / LH | Notes (verbatim where quoted) |
|---|---|---|
| `text-label-20` | 20 / 32 | |
| `text-label-18` | 18 / 20 | |
| `text-label-16` | 16 / 20 | "Used in titles to help differentiate from regular." |
| `text-label-14` | 14 / 20 | "Most common text style of all. Used in many menus." |
| `text-label-14-mono` | 14 / 20, mono | "Largest form of mono, to pair with larger (>14) text." |
| `text-label-13` | 13 / 16 | "Used as a secondary line next to other labels. Tabular is used when conveying numbers for consistent spacing." |
| `text-label-13-mono` | 13 / 20, mono | "Used to pair with Label 14, as the smaller mono size looks better in that pairing." |
| `text-label-12` | 12 / 16 | "Used for tertiary level text in busy views, like Comments, Show More and the capitals in Calendars." |
| `text-label-12-mono` | 12 / 16, mono | |

**Copy:** weight 400; `<strong>` gives **550** and gray-1000. "Designed for multiple lines of text, having a higher line height than Label."

| Class | Size / LH | Usage |
|---|---|---|
| `text-copy-24` | 24 / 36 | Marketing hero |
| `text-copy-20` | 20 / 36 | Marketing hero |
| `text-copy-18` | 18 / 28 | Marketing, big quotes |
| `text-copy-16` | 16 / 24 | "Simpler, larger views like Modals where text can breathe." |
| `text-copy-14` | 14 / 20 | "Most commonly used text style." |
| `text-copy-14-mono` | 14 / 20 | |
| `text-copy-13` | 13 / 18 | "Secondary text and views where space is a premium." |
| `text-copy-13-mono` | 13 / 18 | "Inline code mentions." |

**When to use Geist Mono:**
- [design.md](https://vercel.com/design.md) (verified): "Use Geist Sans for prose, headings, labels, controls, tables, KPIs, dates, counts, percentages, durations, and financial figures. Use Geist Mono only for code, commands, paths, raw tokens, timestamps, and short operational identifiers such as region, plan, SKU, account, or environment IDs. Set only the identifier in Mono, not its sentence or entire table."
- [Web Interface Guidelines](https://vercel.com/design/guidelines): "Use `font-variant-numeric: tabular-nums` or a monospace like Geist Mono" for comparisons.
- Badges set `tabular-nums` by default (verified from markup).
- **Implication for banking:** amounts stay in Geist Sans with `tabular-nums`, right-aligned. IBANs, card last-4, reference numbers, BIC and timestamps go in Geist Mono.

### 1.3 Materials, radii, borders, shadows

Source: [vercel.com/geist/materials](https://vercel.com/geist/materials) for the names and usage. Exact definitions come from the CSS (verified).

| Material | Radius | Box-shadow token | Usage |
|---|---|---|---|
| `material-base` | 6 px | `--ds-shadow-border` | "Everyday use." Flat card or surface on the page |
| `material-small` | 6 px | `--ds-shadow-border-small` | "Slightly raised." |
| `material-medium` | 12 px | `--ds-shadow-border-medium` | "Further raised." |
| `material-large` | 12 px | `--ds-shadow-border-large` | "Further raised." |
| `material-tooltip` | 6 px | `--ds-shadow-tooltip` | "Lightest shadow." "Tooltips will be the only floating element with a triangular stem." |
| `material-menu` | 12 px | `--ds-shadow-menu` | "Lift from page." Dropdowns, popovers |
| `material-modal` | 12 px | `--ds-shadow-modal` | "Further lift." |
| `material-fullscreen` | 16 px | `--ds-shadow-fullscreen` | "Biggest lift." |

All materials use `background-color: var(--ds-background-100)`.

**Shadow definitions, light (verified):**
```
--ds-shadow-border-base: 0 0 0 1px #00000014            /* the 1px hairline, as a ring */
--ds-shadow-background-border: 0 0 0 1px var(--ds-background-200)
--ds-shadow-border: var(--ds-shadow-border-base), var(--ds-shadow-background-border)
--ds-shadow-small:  0px 2px 2px #0000000a
--ds-shadow-medium: 0px 2px 2px #0000000a, 0px 8px 8px -8px #0000000a
--ds-shadow-large:  0px 2px 2px #0000000a, 0px 8px 16px -4px #0000000a
--ds-shadow-tooltip: border-base, 0 1px 1px #00000005, 0 4px 8px #0000000a, bg-border
--ds-shadow-menu:    border-base, 0 1px 1px #00000005, 0 4px 8px -4px #0000000a, 0 16px 24px -8px #0000000f, bg-border
--ds-shadow-modal:   border-base, 0 1px 1px #00000005, 0 8px 16px -4px #0000000a, 0 24px 32px -8px #0000000f, bg-border
```
Dark mode swaps the ring to `#ffffff25` and uses stronger black shadows (for example `--ds-shadow-small: 0 1px 2px #00000029`).

Takeaways:
- **Borders are 1 px rings at 8% black**, painted as box-shadow so they never shift layout.
- **Shadows are multi-layer and at most 2–6% opacity.**
- **Radii:** 4 px for tiny buttons and keyboard hints, 6 px for controls and flat surfaces, 8 px for large buttons, 12 px for cards, menus and modals, 16 px for fullscreen, full for pills, badges and avatars.
- The guideline: "Nested radii. Child radius ≤ parent radius & concentric so curves align."

### 1.4 Spacing, sizes, layout, motion (verified from CSS)

- **Spacing:** Tailwind base `--spacing: .25rem` (4 px grid). Legacy space scale: `--geist-space-2x 8px`, `3x 12px`, `4x 16px`, `6x 24px`, `8x 32px`, `10x 40px`, `16x 64px`, `24x 96px`, `32x 128px`, `48x 192px`, `64x 256px`. `--geist-gap: 24px`, `--geist-gap-half: 12px`, `--geist-gap-quarter: 8px`.
- **Control heights:** `--geist-space-small: 32px`, `--geist-space-medium: 36px`, `--geist-space-large: 40px`. These map to `--ds-size-small/medium/large`.
  - Form fonts: `--geist-form-font: .875rem` (14 px), `--geist-form-large-font: 1rem`.
  - *(Unverified: older Geist versions used a 40 px default; current CSS says 36 px.)*
- **Page:** `--geist-page-width: 1200px`, `--ds-page-width: 1400px`, `--geist-page-margin: 24px`, `--header-height: 64px`.
- **Motion:**
  - `--default-transition-duration: .15s`
  - `--default-transition-timing-function: cubic-bezier(.4,0,.2,1)`
  - `--ds-motion-overlay-duration: .3s`
  - `--ds-motion-overlay-scale: .96`
  - `--ds-motion-popover-duration: .2s`
  - `--ds-motion-timing-swift: cubic-bezier(.175,.885,.32,1.1)` (slight overshoot)
  - Buttons transition `border-color, background, color, transform, box-shadow` over 150 ms and drop the transition on focus.
- **Grid** ([vercel.com/geist/grid](https://vercel.com/geist/grid)): the `Grid`/`GridSystem`/`GridCell`/`GridCross` components draw visible guide lines and crosses. Breakpoints are `sm/md/lg`.
  - Best practice: "use Tailwind `grid grid-cols-*` utilities directly; Grid is overkill when guides aren't visible." Grid is for marketing and docs landing pages, not dashboards.
  - design.md: "12 columns on desktop, 6 on tablet, and 4 on mobile. Reading prose normally occupies 6–7 desktop columns."

### Patterns to adopt for the Swedbank concept: tokens (proposal)

**Principle.** Keep Geist's **step semantics and variable names** (`--ds-gray-*`, `--ds-background-*`) so Geist-style components port 1:1. Change the values:
- Gray becomes a warm **"sand"** neutral that ends in Swedbank brown.
- Background becomes cream.
- Add one brand scale, `--ds-orange-*`, used sparingly.
- Keep Geist's functional blue, red, amber and green for status. **Never use brand orange for status.** It sits between red (hue 23) and amber (hue 77) and would be ambiguous.

The Swedbank base hexes below are **placeholders**: orange `#FF5F00`, brown `#512B2B`, cream `#FDF6EE`. Confirm them with the Swedbank research agent and regenerate the scales with the same lightness profile. Contrast values are computed against `background-100`.

| Step | sand light | sand dark | orange light | orange dark | Role |
|---|---|---|---|---|---|
| bg-100 | `#FFFDFA` oklch(99.4% .004 75) | `#130D0A` | – | – | Default surface: content, cards, tables |
| bg-200 | `#FDF6EE` oklch(97.6% .013 71) **cream** | `#0B0605` | – | – | Sidebar, table header, inset areas, onboarding canvas |
| 100 | `#F7F2ED` | `#1C1512` | `#FFF4EB` | `#301407` | Hover background / subtle tint |
| 200 | `#F2ECE5` | `#231B18` | `#FFEDE0` | `#3D1706` | Hover / active background |
| 300 | `#EEE6DF` | `#2C231F` | `#FFE3D0` | `#501D04` | Active background, badge bg |
| 400 | `#E7DED7` | `#332924` | `#FFD1B4` | `#602102` | Default border |
| 500 | `#CFC3BA` | `#493D37` | `#FFAF85` | `#7D2A00` | Hover border |
| 600 | `#AB9D93` | `#7F7168` | `#FF8A50` | `#DF5200` | Active border |
| 700 | `#917F76` | `#8F8076` | **`#FF5F00` brand** | `#FF5F00` | High-contrast fill (orange: non-text accent only) |
| 800 | `#806D64` | `#7D6E64` | `#EA4D00` | `#EA4D00` | Hover fill; orange-800 = **focus ring** (3.72:1) |
| 900 | `#674F49` (7.4:1) | `#AEA298` (7.7:1) | `#B73D10` (5.6:1) | `#FF9044` | Secondary text; orange-900 = **orange text / links** |
| 1000 | **`#512B2B` brown ink** (11.95:1) | `#F1ECE6` (16.4:1) | `#4D1708` | `#FFEEDE` | Primary text, **primary button background** |

Contrast checks (computed):
- White on `#FF5F00` = **3.05:1**: fails AA for normal text. Brown ink on orange = **3.98:1**: also fails.
- White on orange-900 `#B73D10` = 5.69:1: passes.
- Cream on brown = 11.95:1: passes AAA.
- **Rule:** no small text on brand orange.

**Minimal token CSS (proposal):**
```css
:root {
  --ds-background-100: #FFFDFA;  --ds-background-200: #FDF6EE;
  --ds-gray-100: #F7F2ED; --ds-gray-200: #F2ECE5; --ds-gray-300: #EEE6DF;
  --ds-gray-400: #E7DED7; --ds-gray-500: #CFC3BA; --ds-gray-600: #AB9D93;
  --ds-gray-700: #917F76; --ds-gray-800: #806D64; --ds-gray-900: #674F49; --ds-gray-1000: #512B2B;
  --ds-gray-alpha-400: rgb(81 43 43 / .10);  /* hairline ring, replaces #00000014 */
  --ds-orange-700: #FF5F00; --ds-orange-800: #EA4D00; --ds-orange-900: #B73D10;
  --ds-focus-color: var(--ds-orange-800);
  --ds-focus-ring: 0 0 0 2px var(--ds-background-100), 0 0 0 4px var(--ds-focus-color);
  --ds-shadow-border: 0 0 0 1px var(--ds-gray-alpha-400);
  --radius-control: 6px; --radius-card: 12px; --radius-fullscreen: 16px;
  --ease-swift: cubic-bezier(.175,.885,.32,1.1); --dur-fast: 150ms;
}
```

**Where orange is allowed (proposal, about 1% of pixels):**
- The logo.
- The 2 px active indicator in sidebar and tabs. Vercel uses gray-1000 here; using orange is the one deliberate brand moment.
- Focus ring (orange-800).
- Selected Choicebox border and corner check.
- Progress and gauge fill for neutral, healthy quotas.
- The single hero metric underline on the Overview page.
- Onboarding step "current" marker.

**Where orange is forbidden:** status (use red, amber, green, blue), body text, large fills, gradients, and destructive actions.

---

## 2. Component anatomy

Sources: `https://vercel.com/geist/<component>.md` for the best practices, plus production markup and CSS for dimensions. Quotes are verbatim. The full component list (verified from the navigation) is:

Address Input, Avatar, Badge, Banner, Book, Breadcrumbs, Browser, Button, Calendar, Checkbox, Choicebox, Clearable Input, Code, Code Block, Collapse, Combobox, Command Menu, Context Card, Context Menu, Copy Button, Description, Destructive Action Modal, Destructive Confirmation Input, Dots Menu, Drawer, Empty State, Entity, Error, Error Card, Feedback, Fieldset, File Tree, Filter Params, Gauge, Grid, Input, JSON View, Keyboard Input, Label, Load More Button, Loading Dots, Menu, MiddleTruncate, Modal, Multi Select, Note, Pagination, Phone, Pie Gauge, Pill, Progress, Project Banner, Radio, Relative Time Card, Scroller, Search Input, Select, Separator, Sheet, Show More, Skeleton, Slider, Snippet, Spinner, Split Button, Status Dot, Switch, Table, Tabs, Text With Copy Button, Textarea, Theme Switcher, Toast, Toggle, Tooltip, Video.

### Button ([/geist/button](https://vercel.com/geist/button))
- **Variants:** `default` (primary), `secondary`, `tertiary`, `error`, `warning`.
  - Docs: "`primary`, `success`, `ghost`, and `violet` are not valid."
  - Also `ButtonLink` for navigation and `CustomButton` for overriding fg, bg and border per state.
- **Sizes and shapes** (verified markup and CSS):

  | Size | Height | Horizontal padding | Radius | Font |
  |---|---|---|---|---|
  | tiny (icon only) | 24 px | – | 4 px | – |
  | small | 32 px | 6 px + 6 px label padding | 6 px | 14 px |
  | medium (default) | 36 px | 10 px + 6 px | 6 px | 14 px |
  | large | 40 px | 14 px + 6 px | 8 px | 16 px |

  - Shapes: `square` and `circle` for icon-only (needs `svgOnly` plus `aria-label`), and `rounded` with `shadow` (pill, "often used on marketing pages").
  - `prefix` and `suffix` icons at 16 px.
- **Colors and states** (verified):
  - Primary: background `gray-1000`, text `background-100`, hover `hsl(0 0% 22%)` (dark mode `hsl(0 0% 80%)`).
  - Secondary: background `background-100`, text `gray-1000`, ring `gray-alpha-400`, hover `gray-alpha-200`.
  - Disabled: text `gray-700`, background `gray-100`, ring `gray-400`, cursor not-allowed.
  - Focus: `--ds-focus-ring`.
  - `loading` keeps the label and shows a spinner.
- **Rules:**
  - "Pass `loading` instead of swapping in a spinner so the button stays focusable."
  - "Disable a button only when the action is impossible right now … pair with a `Tooltip` that explains why."
  - "Title Case the label and name what happens: `Deploy Project`, `Invite Member`, `Rotate Key`. Avoid bare verbs (`Submit`) and generic confirms (`OK`, `Confirm`)."
  - "Destructive buttons follow `Verb + Noun` and pair 1:1 with their toast."
  - Use `Split Button` when one default action has 1–4 variants. Destructive variants are blocked in a Split Button.

### Badge ([/geist/badge](https://vercel.com/geist/badge))
- **Shape:** pill (`rounded-full`), `font-medium`, `capitalize`, `tabular-nums`.
- **Sizes:**
  - sm: 20 px high, 8 px padding, 11 px text, +0.2 px tracking, 12 px icon.
  - md: 24 px high, 12 px padding, 12 px text, 14 px icon.
  - lg: 32 px high, 12 px padding, 14 px text, 16 px icon.
- **Variants:** gray, blue, purple, amber, red, pink, green, teal, inverted, `trial` (gradient), `turbo` (gradient), and the `pill` link variant.
- **High contrast** (default): solid `{color}-900` (blue-800, amber-700) with white text; dark mode uses a lighter step (for example green-600).
- **Low contrast** (`contrast="low"`): bg = `{color}-200` re-lit in oklch (L .94, chroma ×1.3), text = `{color}-900`.
- **Rules:**
  - "One badge per row."
  - "Badges are static labels. Don't wire `onClick` onto them."
  - "Title Case, one word when possible, two max: `Active`, `Pending`, `Pro`, `Enterprise Trial`."
  - "Don't add a checkmark icon for success states or an X for errors; the variant carries that signal."
  - "Pair lifecycle badges (`Alpha`, `Beta`) with a `Tooltip` that names the limit."

### Status Dot ([/geist/status-dot](https://vercel.com/geist/status-dot))
- **Anatomy:** a 10 px circle (`size-2.5`), optionally followed by a `text-label-14` label 8 px to the right.

  | State | Color | Hex |
  |---|---|---|
  | QUEUED | `--accents-2` | `#eaeaea` |
  | BUILDING | `--geist-warning` | `#f5a623` (animated) |
  | READY | `--geist-cyan` | `#50e3c2` (note: cyan/teal, not green) |
  | ERROR | `--geist-error` | `#ee0000` |
  | CANCELED | `--accents-2` | gray |

  Each state has a title, for example "This deployment is building."
- **Rules:**
  - "Deployment lifecycle only."
  - "The dot animates while `BUILDING` or `QUEUED` and goes static once the deployment reaches a terminal state."
  - "Don't flash the color through every transitional state on a polling tick."
  - "Pair with `RelativeTimeCard` when timing matters (`Building · 12s ago`)."
  - "Don't wrap the dot in extra prose like `Status: Ready`."
  - For non-deployment statuses, use a Badge.

### Tabs ([/geist/tabs](https://vercel.com/geist/tabs))
- **Primary variant** (verified classes): `text-sm`, 14 px vertical padding, `gray-900` text. Selected tab is `gray-1000` with a **2 px bottom border in gray-1000**. Hover moves to `gray-1000`. Focus shows the ring.
- **Secondary variant:** 32 px high pills, 12 px padding, 6 px radius, `text-label-13`, selected background `gray-200`.
- **Rules:**
  - "Selecting a tab is instant; don't trigger network confirmation or toast."
  - "Reflect the active tab in the URL."
  - "Cap a Tabs row at 5–7 entries on desktop and 3–4 on mobile."
  - Titles are nouns, not verbs.
  - "Don't append a count to the title (`Logs (12)`); use a badge slot instead and drop the badge at zero."

### Table ([/geist/table](https://vercel.com/geist/table))
- **Parts:** `TableRoot > Table > TableColgroup/TableCol > TableHeader > TableRow > TableHead`, `TableBody` (`striped`, `bordered`, `interactive`), and `TableCell`. A virtualized variant exists. The full-featured example is a billing table with Product, Usage, Price and Charge columns.
- **Rules:**
  - Use Entity, not Table, for "membership row, integration row"; use Description for key/value blocks.
  - "Render `—` in cells where a value is unknown … Don't substitute `N/A`."
  - "Apply `tabular-nums` (or Geist Mono) to numeric columns."
  - Relative time is "`2m ago`, `5h ago`; switch to `Mar 14, 2026` past 7 days."
  - Pagination copy: "`Page 2 of 7` or `21–40 of 142`."
  - Empty data: "render `Empty State` outside the table."
- **From design.md:** right-align numeric columns **including the header**, and baseline-align cells.

### Input / Search ([/geist/input](https://vercel.com/geist/input))
- **Wrapper:** 6 px radius, `0 0 0 1px gray-alpha-400` ring.
  - Hover: `gray-alpha-500`.
  - Focus: `0 0 0 1px gray-alpha-600, 0 0 0 4px rgba(0,0,0,.16)` (dark mode `rgba(255,255,255,.24)`).
  - Placeholder `gray-700`. Disabled background `gray-100`.
- **Sizes:** small 32, medium 36, large 40 px.
- **Prefix and suffix segments:** for example `https://` + input + `.com`.
- **⌘K hint:** the search input embeds a Kbd chip (20 px high, 4 px radius, `gray-alpha-400` ring, `text-xs`, `gray-900`).
- **Rules:**
  - "Validate on blur, not on every keystroke."
  - Labels are short Title Case nouns.
  - "Placeholders show an example value (`my-awesome-project`), never instructions."
  - Validation messages "name the field and the constraint, end in a period, skip `please`."

### Select, Combobox, Multi Select
- **Select:** "under ~10 items"; placeholder is action-oriented ("Select a framework"), never "Choose one…".
- **Combobox:** for type-to-filter lists. Empty state reads `No {items} match "{query}"`. Supports async loading without collapsing the list. Becomes a Dialog on mobile inside a Modal.
- **Multi Select:** the trigger shows a count ("3 regions selected"). Supports `Select All` / `Select Only` actions and keyboard checkbox navigation.

### Modal ([/geist/modal](https://vercel.com/geist/modal))
- **Material:** `material-modal` (12 px radius). Enters at scale .96 → 1 over 300 ms with the swift easing.
- **Documented sections:** Default, **Sticky** (sticky header and footer), Single button, Disabled actions, **Inset** (inset content area), Control initial focus, Focus an input on open, Mobile sheet with inputs, Combobox focus, Toasts and focus trap.
- **Footer** *(unverified visual)*: a full-width band in `background-200` with a top hairline. Cancel is secondary on the left; the primary action is on the right.
- **Rules:**
  - "Use Modal when a decision must block the rest of the page."
  - "Skip Modal for routine create flows that have a dedicated page."
  - "Default focus to `Cancel` on any destructive Modal."
  - "`Modal.Title` is a Title Case statement, never a question." ("Transfer Project", not "Transfer Project?")
  - Body is "1–3 sentences. State the consequence first."
  - Acknowledgment modals use "`Done`, never `OK` or `Close`."
  - "Close irreversible bodies with `This cannot be undone.`"

### Destructive Action Modal / Destructive Confirmation Input
- **Anatomy:**
  - Title: Verb + Noun.
  - Description that interpolates the resource in bold.
  - Typed verification field: "To confirm, type the project name 'my-project'". It gets focus on open, and submit stays disabled until there is an exact match.
  - Optional "irreversibility band" with a warning icon ("Deleting my-project cannot be undone.").
  - `loading` disables both buttons. Errors render in place: "Couldn't save settings. Try again."
- **Accessibility detail:** the phrase and input use `translate="no"`, `lang="zxx"` and `dir="ltr"` so auto-translate cannot break the exact match.
- **Use it for** delete, rotate, revoke, disconnect, downgrade, and disabling security settings. Do not use it for routine confirmations ("reads as melodrama").

### Sheet (desktop side panel) and Drawer (mobile bottom sheet)
- **Sheet:** "persistent associated context like deployment details, log row inspection, or a member profile."
  - `modal=false` by default, so the page stays interactive.
  - A row inspector slides from the right.
  - Outside-click does not close it, so always render a Close button and support Escape.
  - Never use it for destructive confirmation.
- **Drawer:** "renders as a bottom sheet on small viewports only."
  - Swipe-down and tap-outside dismiss it.
  - Use `verticalScroll` for long content.
  - One primary Verb + Noun button plus `Cancel`.

### Toast ([/geist/toast](https://vercel.com/geist/toast))
- **API:** `toasts.message / success / warning / error`, plus `preserve` (no auto-dismiss), action, and **Undo**.
  - *(Position is bottom-right and stacked; unverified)*
- **Rules:**
  - Completion toasts read "{Noun} {past-participle}": "`Domain added`", never "successfully".
  - Error toasts are "two sentences with periods and end with a recovery step: `Couldn't verify domain. Try again.`"
  - "Use `Couldn't` for user-state errors and `Failed to` for system or infra errors."
  - "Undo snackbars stay on screen for 5–10 seconds."
  - "Don't stack toasts to narrate one async flow."
  - Do not use a toast alone for billing failures or permission denials. Pair a short toast with a persistent row.

### Tooltip / Context Card / Relative Time Card
- **Tooltip:** `material-tooltip` with a triangular stem. About 150 ms entry delay. Types `success`, `error`, `warning`, `violet`; positions on all four sides.
  - "Use a Tooltip to explain **why** something exists, not **what** it is."
  - "Don't wrap a labelled Input in a Tooltip."
  - Lifecycle format: "`{Label}: {one-line meaning}. {Specific limit}.`"
- **Context Card:** a hover or focus card showing an entity name, one identifying line, and "2–4 metadata rows of `Label: value`". At most one action. Never destructive.
- **Relative Time Card:** renders "2m ago" and on hover shows absolute UTC and local time. Pass a Unix ms value.

### Command Menu (⌘K) ([/geist/command-menu](https://vercel.com/geist/command-menu))
- **Anatomy:** full-screen overlay with an input, grouped items (`heading`) with optional dividers, suffix and keybind slots (Kbd), and nested pages with breadcrumbs. A result count is announced with `aria-live`.
- **Rules:**
  - "Bind `⌘K` on macOS and `Ctrl+K` elsewhere."
  - "Show a recent or default item set when the input is empty."
  - "Backspace at an empty input pops the page stack."
  - Items are Title Case verb phrases ("Deploy Project", "Invite Team Member"), not "Go to project page".
  - Placeholders name the scope ("Search projects…", "Type a command or search…").
- **History:** launched 2021-09-09 to "Navigate to a specific Project … Search the documentation … Invite others … Create new Projects" ([changelog](https://vercel.com/changelog/quickly-navigate-the-dashboard-with-shortcuts)). The Vercel Toolbar on deployments uses ⌘K, or ⌘⇧K when the site has its own ⌘K ([changelog](https://vercel.com/changelog/command-menu-now-available-in-deployments)).

### Skeleton, Spinner, Loading Dots
- **Skeleton:** variants `pill`, `rounded`, `squared`, and no-animation. It can wrap children with a fixed size.
  - "Set `width` and `height` to match the final content."
  - "Don't use Skeleton … as a placeholder for empty states."
  - Wrap the region in `aria-busy`.
- **Spinner** for a single in-flight action. **Loading Dots** for inline "Saving…".
- **Guideline:** use a show-delay of about 150–300 ms and a minimum visible time of about 300–500 ms to avoid flicker ([Web Interface Guidelines](https://vercel.com/design/guidelines)).

### Empty State ([/geist/empty-state](https://vercel.com/geist/empty-state))
- **Variants:**
  - "no-results for a filtered list"
  - "blank slate or informational for a resource the user hasn't created"
  - "cleared for completed work"
  - "permission for role or tier denials"
  - "error for a failed load"
- **Anatomy:** icon, Title Case title, a sentence-case description that adds information, one primary CTA, and an optional secondary CTA ("Three CTAs is a smell").
- **Copy patterns:**
  - "`No logs match "${query}". Clear the filter to see all logs.`"
  - Onboarding: "name the next action that creates the first item."
  - Tier-gated: "`{Feature value} with the {Plan} plan.`"
  - CTAs: never "Get Started", "Continue" or "OK".

### Note (inline callout) and Banners
- **Note:**
  - Variants: default (info icon; there is no `variant="info"`), `secondary`, `success`, `error`, `warning`, `violet`, `cyan`.
  - Sizes, disabled state, custom icon.
  - `NoteLabel` is a 1–2 word Title Case prefix ("Rate Limit", "Plan Limit"; never "Heads Up").
  - `NoteContent` is one active sentence naming the impact.
  - At most one `NoteAction`.
  - **Not dismissible:** "persistent until the underlying state changes." "One Note per concept."
- **Project Banner:** a full-width, non-dismissible strip for "overdue billing, an active rollback, attack mitigation, an expiring trial blocking deploys."
  - Variants `error`, `warning`, `success`, `gray`.
  - It must have a `callToAction` that resolves the state ("Update Payment Method").
  - One at a time.
- **Banner:** a page-level announcement with a CTA.

### Progress, Gauge, Pie Gauge
- **Progress** (bar):
  - `max` is the real ceiling.
  - `colors` maps thresholds to colors (dynamic colors).
  - `stops` are labelled stages ("Step 2 of 4 · Building").
  - Supports width, height and themed variants; uses `role=progressbar`.
  - "Pair the bar with text naming the work and units: `Building · 1.2 GB / 4 GB`."
  - "For usage against a quota or ratio, use `Gauge`; the circle reads as health, the bar reads as progress."
- **Gauge** (ring):
  - Sizes tiny, small, medium, large; `showValue`.
  - Default color scale observed: value 14 → `red-800`, 34 → `amber-700`, 68 → `green-700`, track `gray-alpha-400` (exact breakpoints unverified).
  - Custom color ranges (keyed 0–100), `arcPriority="equal"`, and `indeterminate`.
  - "Threshold colors should match the same numeric breakpoints used elsewhere in the product (`>=80%` warning, `>=95%` error)."
  - "Never inject a `%` or unit string into the prop."
- **Pie Gauge:** an inline icon-sized pie inside a ring, colored for example `blue-900`, `amber-900`, `red-900`. Use it for table cells.

### Avatar and Avatar Group
- **Avatar:**
  - Image `src`, falling back to `letter` (1–2 uppercase characters), with `placeholder` only while loading.
  - Sizes: "20–24px next to `text-label-14`, 32px next to `text-label-16`, 48–64px in headers and onboarding."
  - Git and custom-icon badges can be overlaid on the avatar.
- **AvatarGroup:** stacked with automatic or fixed overlap and a `shadow-border` ring. Height 32 px (24 px in the small variant). A stacking order is defined.

### Entity (list row) ([/geist/entity](https://vercel.com/geist/entity))
- **Layout:** two columns.
  - Left: avatar or icon, Title Case label, and sentence-case metadata ("Last used 10min ago").
  - Right: "at most one or two controls"; further actions go in a Dots Menu.
- **Variants:** with Skeleton, with List, with List + Checkbox (multi-select; each checkbox labelled "Select {entity name}"), with Fill, bordered rows. Renders as `li` or `button`.
- **Right-column buttons are Verb + Noun:** "`Remove Member`, `Resend Invite`." This is **the** pattern for member lists.

### Menu, Dots Menu, Context Menu, Split Button
- **Menu:**
  - Opens on click, never on hover.
  - About 10 items maximum, grouped with `MenuSection`.
  - `MenuItemLocked` shows a lock icon for permission-gated actions.
  - Destructive items go at the bottom after a divider.
  - Items are Verb + Noun.
  - "End an item with `…` only when activating it opens a follow-up dialog (`Rename…`)."
- **Context Menu:** opens on right-click or long-press. It "must never be the only entry point for an action."
- **Split Button:** "`Deploy` paired with `Deploy to Preview`." The first menu item mirrors the primary label.

### Switch (segmented), Toggle (boolean), Choicebox, Radio, Checkbox
- **Switch:** a segmented control for "2–3 mutually exclusive options that show different views of the same surface". Uses radio semantics; sizes small and large; supports icon-only with tooltips.
- **Toggle:**
  - For a boolean that "takes effect immediately".
  - "Persist on change and surface the result in a … toast (`Password protection enabled`)."
  - The label names what is true when ON ("Password Protection", not "Enable …").
  - Custom colors are amber or red.
- **Choicebox:**
  - A large radio or checkbox tile with title and description, for example plan comparison: "`$20/mo · 100 GB bandwidth`".
  - 4–6 tiles maximum.
  - "Selected state shows a check or filled dot in the corner. The border highlight alone isn't enough."
  - "Disabled tiles need a Tooltip naming why (`Available on Pro`)."
  - Variants `blue` and `trial`.

### Feedback widget ([/geist/feedback](https://vercel.com/geist/feedback))
- **Anatomy:** a trigger button ("Feedback") opens a panel with an emoji row ("text feedback with an associated emotion"), a textarea with the fixed placeholder "Your feedback...", and Send.
  - Variants: inline, topic Select ("Bug, Pricing, Documentation"), metadata (non-PII route, build ID, plan, viewport), prefix and suffix.
  - Docs-page instance (verified classes): 32 px round emoji buttons; hover and checked background `blue-300` with a `blue-900` icon.
  - *(Exact emoji set unverified; historically four faces.)*
- **Rules:**
  - "Place Feedback at the end of a page, doc, or completed flow."
  - "Keep the panel collapsed until the user clicks."
  - "Submit closes the panel … Don't replace the panel with a generic acknowledgment toast; the close itself is the acknowledgment."

### Fieldset: the settings-card pattern ([/geist/fieldset](https://vercel.com/geist/fieldset))
- **Parts:** `Fieldset > FieldsetContent (FieldsetTitle, FieldsetSubtitle, controls) + FieldsetFooter (FieldsetFooterStatus on the left: help text or a link; FieldsetFooterActions on the right: "Save Changes")`.
- **Variants:** `type="error"` and `type="warning"` (danger zone), `FieldsetFooter highlight`, `FieldsetContent disabled` (disabled wall, for example for plan-gated settings), without footer, without title.
- This is the canonical Vercel settings page: a vertical stack of these cards, each saved independently.

### Others worth reusing
- **Description:** a `dl` key/value list ("Last Deployed", "Region", "Plan").
- **MiddleTruncate:** for "`dpl_…abc123`", paths and URLs; copying yields the full string.
- **Snippet / Text With Copy Button / Copy Button:** for IBANs and reference numbers.
- **Keyboard Input (Kbd).**
- **Calendar:** range picker with **presets** ("Last 7 Days", "Month to Date"), min/max, and pinned timezone. "Keep the trigger label as the chosen range (`Apr 1 – Apr 28, 2026`)."
- **Filter Params:** a URL-backed filter bar with removable pills, suggestions and an "AI" natural-language mode.
- **Pagination** ("Previous"/"Next") and **Load More Button**.
- **Error / Error Card:** "Couldn't Load Deployments" with a request ID in mono under `<details>` and Try Again.
- **Breadcrumbs:** `text` and `menu` types; the menu type is a breadcrumb segment that opens a switcher.
- **Theme Switcher:** system, light, dark.
- **Phone, Address Input:** useful for KYC forms.

### Patterns to adopt for the Swedbank concept: components (proposal)

| Component | Swedbank spec |
|---|---|
| **Primary button** | Height 36 (default) / 40 (large, onboarding). Radius 6 (8 at large). Background `gray-1000` (brown `#512B2B`), text `background-100`, hover `oklch(40% .06 22)`, active scale .98. Focus ring 2 px bg + 2 px `orange-800`. `text-button-14` (500). Label Verb + Noun: "Pay Invoice", "Invite Member", "Open Account". Loading keeps the label. |
| **Secondary button** | `background-100` + ring `gray-alpha-400` (brown 10%), text `gray-1000`, hover `gray-100`. |
| **Tertiary** | Transparent; hover `gray-alpha-200`. Used in tables and toolbars. |
| **Error button** | `red-800` with white text, only inside Destructive Action Modal. |
| **Badge** | Pill 20/24/32 px. Low contrast by default in dense tables (`{c}-200` bg + `{c}-900` text); high contrast only for a plan tier in the scope switcher. Vocabulary: `Pending`, `Approved`, `Rejected`, `Scheduled`, `Completed`, `Business`, `Premium`, `Owner`. |
| **Status Dot** (payments) | 10 px dot + `label-14`. Map lifecycle: Queued → **Scheduled** (gray, pulsing), Building → **Processing / Awaiting approval** (amber `#f5a623`, pulsing), Ready → **Completed** (green-700 `#28a948`; deviate from Vercel's cyan because banking users read green as done), Error → **Rejected / Failed** (red `#ee0000`), Canceled → **Canceled** (gray). Always pair with a label. |
| **Amounts** | Geist Sans, `tabular-nums`, right-aligned. Debit in `gray-1000` with a minus sign; credit in `green-900` with a plus sign *(proposal: color plus sign, never color alone)*. Currency code in `label-13` `gray-900` after the number with a non-breaking space ("1 250,00&nbsp;SEK"). |
| **Identifiers** | IBAN, OCR, card last-4, BIC and reference IDs in `text-label-13-mono` with a Copy Button; long ones via MiddleTruncate. |
| **Tabs** | Underline style; 2 px indicator in `orange-700` (the brand moment) or `gray-1000` (strict Vercel). URL-synced. |
| **Inputs** | 36 px, radius 6, ring `gray-alpha-400`, focus = ring `gray-alpha-600` + 4 px halo `rgb(81 43 43 / .16)`. Mobile font ≥ 16 px. Placeholders show examples ("5560000000", "SE45 5000 0000 0583 9825 7466"). |
| **Modal / Sheet / Drawer** | Modal = blocking decisions (approve payment batch, delete signatory). Sheet (right, 480 px) = transaction detail, member profile. Drawer = mobile only. |
| **Toast** | "Payment scheduled", "Member invited", "Card frozen" + Undo for reversible actions (freeze card, archive). Errors: "Couldn't send payment. Try again." |
| **Note** | Inline: "Daily Limit · You have used 80% of today's card limit." Project Banner for blocking states: "Your company's KYC review expires in 3 days." + "Update Information". |
| **Gauge / Progress** | Limits use Gauge (ring) with thresholds ≥ 80% amber, ≥ 95% red (otherwise neutral `gray-1000` or orange). Onboarding uses Progress with labelled stops. |
| **Entity rows** | Members, cards, connected banks, API keys, beneficiaries. |
| **Fieldset cards** | Every settings page: title, subtitle, control, footer (help link left, "Save Changes" right). Danger zone = `type="error"` fieldset with "Close Account". |
| **Command Menu** | ⌘K / Ctrl+K: "Pay Invoice", "Transfer Between Accounts", "Freeze Card", "Invite Member", "Download Statement"; recent items on empty input. |
| **Feedback** | Bottom of the onboarding success page and statement pages, with metadata (route, plan) but no PII. |

---

## 3. Dashboard information architecture

### What Vercel ships today (verified unless marked)

- **Sidebar navigation is the default** since 2026-02-26; it was opt-in from 2026-01-22. Quote:
  > "New sidebar with horizontal tabs moved to a resizable sidebar that can be hidden when not needed · Consistent tabs for unified navigations across both team and project levels · Improved order with navigation items prioritized the most common developer workflows · Projects as filters so you can switch between team and project versions of the same page in one click · Optimized for mobile with floating bottom bar optimized for one-handed use."

  Sources: [rollout](https://vercel.com/changelog/dashboard-navigation-redesign-rollout), [opt-in](https://vercel.com/changelog/new-dashboard-navigation-available).
- **Sidebar items** mentioned across the docs, by frequency of "in the sidebar" phrasing: Settings, Usage, Storage, Deployments, Logs, Integrations, Domains, Firewall, Support, Observability, Flags, Access, AI, Activity, Analytics, CDN, Projects.
  - Settings sub-navigation includes General, Members, Access Groups, Billing (with Invoices), My Notifications, Security & Privacy (SAML, Audit Log), Activity, Pending Invitations, Team Members, and Authentication.
- **Team switcher / scope selector:**
  - "Click on the team switcher at the top left of the nav bar."
  - "Next to your team name, you will see the plan you are on" ([usage docs](https://vercel.com/docs/pricing/manage-and-optimize-usage)).
  - The bottom of the list contains **Create Team** ([trials docs](https://vercel.com/docs/plans/pro-plan/trials)).
  - Since 2023 the switcher also switches **projects** without changing teams, supports **favorites**, and "Switch between projects without losing context … if you're viewing Web Analytics, you can change projects while remaining on the same view" ([changelog 2023-05-18](https://vercel.com/changelog/improved-experience-for-moving-between-your-teams-and-projects)).
  - Organizations (Enterprise beta) also appear in the switcher ([docs](https://vercel.com/docs/organizations)).
  - *(Unverified visual: team avatar 20–24 px, team name `label-14` 500, plan badge (Hobby / Pro / Enterprise / Trial), and an up-down chevron. In the classic top bar it was rendered as a breadcrumb "▲ / team ⌄ / project ⌄" separated by slanted slashes.)*
- **Overview page:**
  - The team overview shows a project grid and list with search.
  - "Projects can be filtered by git repository."
  - "Usage for the team is now shown as a card on the overview directly."
  - "Activity is now sorted by your activity only" ([2025-06-12](https://vercel.com/changelog/improved-team-overview-page)).
  - Earlier (2021): cards show the framework icon or favicon, "which change is currently available in Production", and "hover to quickly visit Production". The header and activity stream were removed "to help you get to what matters faster" ([2021-08-06](https://vercel.com/changelog/a-new-dashboard-overview-is-now-available)).
  - Favorited projects appear on the overview ([2023-11-07](https://vercel.com/changelog/favorite-teams-and-projects-to-appear-in-your-dashboard)).
  - Primary action: an **"Add New"** button with a dropdown that includes **Repository** and others (docs). *(Other items such as Project, Domain, Store and Team are unverified.)*
- **Page header pattern** *(unverified, consistent observation):*
  - Left: H1 in `heading-24` or `heading-32`, optionally with a muted subtitle.
  - Right: 1–2 actions; secondary first, primary last.
  - Below: a filter bar (search input with ⌘K-style hint, dropdown filters, view toggle, date range).
  - Content max width about 1200–1400 px (tokens verified: `--geist-page-width 1200px`, `--ds-page-width 1400px`).
- **Filter bars:**
  - Deployments filters: **Branch, Date Range, All Environments, Status** ([docs](https://vercel.com/docs/deployments/managing-deployments)), plus Author (2025-09).
  - **Redesigned 2026-08-27**: "Apply suggested filters for common searches. Type to find an option instead of scrolling. Describe what you're looking for in natural language, and Vercel automatically applies the matching filters" ([changelog](https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters)).
  - Runtime logs (2026-02-18): typed filters like `level:error` become **visual pills** that can be removed with a click; values are suggested from real data; recent queries are saved; typos are validated with a tooltip; pasting a Request ID auto-converts to a filter ([changelog](https://vercel.com/changelog/redesigned-search-and-filtering-for-runtime-logs)).
- **Search and shortcuts:** ⌘K Command Menu, documented above. Logs support **deep links to log lines** (`#L6`, Shift-click for `#L6-L9`) ([docs](https://vercel.com/docs/deployments/logs)). *(Single-key shortcuts beyond ⌘K are unverified.)*
- **Notifications:** a bell popover with an unread counter and an **Archive** tab (365 days). Channels are Web, Email, Push (desktop and mobile web, 2025-12) and SMS (spend only). There are per-user preferences, and critical alerts cannot be fully disabled ([docs](https://vercel.com/docs/notifications)).
- **Performance as UX:** the 2019 redesign cut First Meaningful Paint by 1.2 s using preconnect, prioritized API calls, memoization and **SWR for real-time updates** ([blog](https://vercel.com/blog/dashboard-redesign)). Browser tab favicons reflect deployment status (queued, building, error, ready).

### Patterns to adopt for the Swedbank concept: IA (proposal)

**Shell layout (desktop ≥ 1024 px)**

The sidebar is 240 px wide (resizable 200–320, collapsible to a 56 px icon rail) on `background-200` cream with a 1 px right hairline. Content sits on `background-100`.

```
┌ Sidebar 240px (bg-200 cream, 1px right hairline) ┬ Content (bg-100) ─────────────────────────┐
│ [Swedbank logo]                                  │ Breadcrumb: Acme AB / Payments           │
│ ┌ Scope switcher ─────────────────────────────┐  │ ┌ Page header ───────────────────────┐   │
│ │ (A) Acme AB  [Business]               ⇅     │  │ │ Payments            [Export] [New ▸]│   │
│ └─────────────────────────────────────────────┘  │ └────────────────────────────────────┘   │
│ [⌕ Search…                         ⌘K]          │ Filter bar: [Account ▾][Status ▾][Date ▾] │
│ Overview                                         │ ─────────────────────────────────────── │
│ Accounts                                         │ Table / Entity list                      │
│ Payments                                         │                                          │
│ Approvals                       (3)              │                                          │
│ Cards                                            │                                          │
│ Activity                                         │                                          │
│ Fees & Limits                                    │                                          │
│ Team                                             │                                          │
│ Settings                                         │                                          │
│ ─────                                            │                                          │
│ Help · Feedback · Theme                          │                                          │
│ (BO) Bohdan O.  ⋯                                │                                          │
└──────────────────────────────────────────────────┴──────────────────────────────────────────┘
```

**Scope switcher**
- Anatomy: 32 px button. Avatar 20 px (company logo or letter avatar, 6 px radius for a company and round for a person), name in `label-14` 500 with truncation, plan badge `sm` low contrast (Private / Business / Premium), and an up-down chevron icon. Hover background `gray-alpha-200`.
- Menu (`material-menu`) contents:
  1. Search field.
  2. "Personal" section (the private account).
  3. "Companies" section with favorites (star).
  4. A divider, then **"Add Company"** (starts onboarding).
- The switcher keeps context: switching company while on Payments stays on Payments.

**"Accounts as filters"** (copying Vercel's "Projects as filters")
- Payments, Activity and Fees & Limits exist at company level.
- An "Account: All ▾" filter narrows the same page to one account in one click.
- Do not create separate per-account copies of pages.

**Sidebar rules**
- 32 px rows, 16 px icons, `label-14`. Item states:
  - Default: `gray-900` text.
  - Hover: `gray-1000` text on `gray-alpha-100`.
  - Active: `gray-1000` text, `gray-alpha-200` background, plus a 2 px orange indicator on the left (proposal).
- Count badges are low-contrast `sm` pills on the right (Approvals 3) and are hidden at 0.

**Mobile**
- A floating bottom bar (Vercel 2026 pattern) with five items: Overview, Payments, Approvals, Cards, More.
- The scope switcher becomes the top app-bar title with a chevron.

**Page header**
- `text-heading-24` (tracking −0.96 px) title. Optional `copy-14` `gray-900` subtitle.
- Actions right-aligned: secondary first, primary last.
- A Split Button for "New Payment ▾" (Payment, Transfer Between Accounts, Bulk Payment File…).

**Overview page**
- Hierarchy is set by typography, not cards. Top row: total balance in `heading-48` with tabular numbers, then account Entity rows with a sparkline.
- One "Fees & Limits" summary card (copying Vercel's usage card on the overview), a "Needs your approval" list, and Recent activity (your own first).
- Favorites (pinned accounts) appear first.

**Shortcuts**
- ⌘K palette; `/` focuses search *(proposal)*.
- Kbd hints are shown in menus.
- Every filter, tab and selected row is in the URL (deep links).

---

## 4. Onboarding flows

### What Vercel ships (verified unless marked)

**New project / import flow** (`vercel.com/new`)
- "Connect your GitHub, GitLab, or Bitbucket account, select a repo, and click **Deploy**" ([docs](https://vercel.com/docs/getting-started-with-vercel)). The alternative entry is "Clone Template".
- The configure step exposes:
  - Project Name.
  - Framework Preset (auto-detected).
  - Root Directory.
  - Collapsible **Build and Output Settings** and **Environment Variables**. These are progressive disclosure with sensible defaults.
- *(Field list is from product memory; unverified in current docs.)*
- A redesign (community post 2024-10-29) focused on "making Vercel and git scope selection clearer" and asked "Is it clear to you when and why an upgrade might be required to deploy?" ([community](https://community.vercel.com/t/call-for-feedback-on-the-new-vercel-project-creation-flow/1734)).
- Older import docs ended with "Vercel will create the Project and deploy it … Enjoy the confetti!" (celebratory success; current presence unverified).
- After deploy *(unverified detail):* a success screen ("Congratulations!") with a screenshot preview of the live site, a "Continue to Dashboard" CTA, and next-step suggestions (add domain, enable analytics).

**Live status during a deploy**
- The Deployment Details page shows step accordions, each with its own status and duration:
  - **Provisioning Integrations** (can be skipped while pending).
  - **Building** (expand to see logs).
  - **Deployment Summary** (artifacts).
  - Checks.
  - Assigning Domains.
- "The total build duration … includes all three steps: building, checking, and assigning domains. Each step also shows the individual duration." ([troubleshoot docs](https://vercel.com/docs/deployments/troubleshoot-a-build))
- Logs:
  - Stream live.
  - Warnings in yellow and errors in red.
  - Timestamps on the left are permalinks.
  - Secrets of 32+ characters are `[REDACTED]`.
  - Truncated at 4 MB ([docs](https://vercel.com/docs/deployments/logs)).
- Deployment states (API): `QUEUED`, `INITIALIZING`, `BUILDING`, `READY`, `ERROR`, `CANCELED`, `BLOCKED`.
- The favicon and tab title reflect status, so users can watch from another tab.

**Team creation and plan selection**
- Steps: team switcher → **Create Team** → name the team → select a plan option ("Pro Trial" appears only if not yet used; one trial per user) ([accounts](https://vercel.com/docs/accounts), [trials](https://vercel.com/docs/plans/pro-plan/trials)).
- **Trial transparency:** the trial lasts 14 days with a $20 credit and has a clear limits table (Owner Members 1, Team Members 10, Projects 200, Function Invocations 1,000,000/month, …). The trial **pauses** at 100% of certain resources. After the trial, the user chooses Upgrade or Revert to Hobby.
- Joining a team: by invitation, by identity provider (SAML/SCIM), or by pushing to a private repo with **Auto Approval** or **Manual Approval** (owners approve join requests from a notification).

### Patterns to adopt for the Swedbank concept: "Open a company account" (proposal)

Map Vercel's import → configure → deploy model onto company onboarding.

**Step 0: entry points** (Choicebox, 3 tiles, `blue` selected variant replaced with orange border plus corner check)
- "Import from Bolagsverket": the analog of Import Git Repository. It is the recommended path and auto-fills everything from the org number.
- "Start a New Company": the analog of Clone Template, with templates such as AB, Enskild firma, HB.
- "Move From Another Bank".

**Layout**
- Centered column, max width 880.
- A left rail stepper at ≥ 1024 px; a top Progress with stops on mobile.
- Steps: `Company`, `Owners & Signatories`, `Accounts & Cards`, `Review & Sign`. Each step has a status icon: empty circle → spinner → check.
- The stepper shows each step's state and, once done, its duration in `label-13-mono` `gray-900` (for example "Verified · 1.2s").

**Configure step**
- The "Company Details" Fieldset is prefilled (Org Number in mono, Name, Address via Address Input). Edits validate on blur.
- Collapsible advanced sections, mirroring Build & Output Settings:
  - "Beneficial Owners" (prefilled, editable).
  - "Tax Residency".
  - "Expected Activity" (KYC questions as Choicebox tiles with descriptions).
- Defaults are sensible so most users never open them.

**Plan selection**
- 3–4 Choicebox tiles: title, one-sentence differentiator with price ("Business Plus · 99 kr/mån · 2 cards, free domestic payments").
- A disabled tile carries a tooltip ("Available for companies with turnover over 10 MSEK").
- Fees are shown before commitment; a "Compare plans" link opens a Sheet.

**"Deploy" step: Open Account with live log**
- One primary button, "Open Company Account" (Verb + Noun, large 40 px).
- After clicking, the page becomes a live checklist styled like the Building accordion. Each row has: status icon, step name (`label-14`), right-aligned duration (`label-13-mono`), and an expandable mono log of human-readable events.

  ```
  ✓ Verifying company with Bolagsverket          0.8s
  ✓ Screening owners (PEP & sanctions)           2.1s
  ◌ Creating accounts…                            ▸ live
  ○ Issuing virtual cards
  ○ Setting up BankID signatories
  ```
- Failures expand automatically and show a reference ID in mono, a cause, and one fix CTA ("Upload Certificate of Registration").
- The browser tab title and favicon reflect the state ("Creating accounts… · Swedbank").

**Success**
- A restrained celebration: one-time confetti burst *(Vercel precedent; respect `prefers-reduced-motion`)*, or a simple animated check.
- Heading "Acme AB Is Ready". A preview card shows the new account (IBAN in mono with Copy) and virtual card last-4.
- Primary "Continue to Dashboard". A next-steps checklist: Invite Team Members, Order Physical Cards, Connect Accounting, each with a check state.
- The Feedback widget sits at the bottom ("How did opening your account go?").

**Trial-like transparency**
- If there is a review period (for example manual KYC), show it like the Vercel trial: a Project Banner "Your account is under review. Card limits are 10 000 SEK/day until approved." with "View Limits".
- Show a limits table, not marketing copy.

**Add Company from the switcher**
- Name, then plan, then "Invite Team Members" (optional; Skip allowed).
- Vercel's Manual Approval maps to "Require owner approval for new members".

---

## 5. Team and access management

### What Vercel ships (verified)

**Roles** ([access-roles](https://vercel.com/docs/rbac/access-roles))

Team-level roles:

| Role | One-line definition (verbatim) |
|---|---|
| Owner | "Have the highest level of control. They can manage, modify, and oversee the team's settings, all projects, team members and roles." At least two owners recommended. |
| Member | "Have full control over projects and most team settings, but cannot invite or manage users by default." |
| Developer | "Can deploy to projects and manage environment settings but lacks the comprehensive team oversight." Pro since 2026-02-26. |
| Security | "Can manage security features, IP blocking, firewall. Cannot create deployments by default." Enterprise. |
| Billing | "Primarily responsible for the team's financial management and oversight. … read-only access to every project." Pro: one member. |
| Pro Viewer / Enterprise Viewer | Read-only. Pro Viewer is free and cannot see usage, billing or logs. Enterprise Viewer sees everything read-only ("ideal for compliance officers, auditors"). |
| Contributor | "Can be configured to have any of the project level roles or none … Only contributors can have configurable project roles." |

- Project-level roles: Project Administrator, Project Developer, Project Viewer.
- **Extended permissions** (2025-10-10) layer on top of roles: Create Project, Full Production Deployment, **Usage Viewer** ("View usage, prices, and invoices (read-only)"), Integration Manager, Environment Manager, Environment Variable Manager. Enterprise users can hold **multiple roles** ([changelog](https://vercel.com/changelog/expanded-role-based-access-control-rbac-for-enterprise-teams)).

**Members page and invite flow** ([managing team members](https://vercel.com/docs/rbac/managing-team-members))
1. Settings → Members.
2. "Enter the email address … assign their role, and select the **Invite** button. You can invite multiple people at once using the **Add more** button."
3. Choosing Contributor reveals **Assign Project Roles** (project + role pairs).
4. **Pending Invitations** list: an invite expires after **7 days** (30 for SAML-enforced teams) and then "will show as expired".
5. **Manage Role** button next to each member's role.
6. Removal via the row's "…" menu → **Remove from Team**.
7. **Manage Access** on a member edits their Access Groups.

**Access Groups** ([docs](https://vercel.com/docs/rbac/access-groups))
- A named set of projects × project roles plus members.
- Create flow: Create Access Group → name → select projects and roles → add members (Developer or Contributor) → Create.
- Computed role = the **highest** grant across groups and direct assignments ("can increase … but never reduce").
- Directory Sync can map IdP groups to access groups.

**SSO**
- Settings → Security & Privacy → "Authentication and User Provisioning" → SAML row → **Configure** (guided walkthrough per IdP).
- **Enforce SAML** toggle ("Require Team Members to login with SAML"). The owner must be authenticated via SAML first, and enforcement switches off automatically when the configuration changes.
- Directory Sync (SCIM) for provisioning ([saml](https://vercel.com/docs/saml)).

**Audit log UI** ([audit-log](https://vercel.com/docs/audit-log), Enterprise, owner only)
- Location: Team Settings → Security & Privacy → Audit Log.
- Export: select a timeframe → **Export CSV** → the requesting owner gets an **email link valid 24 h**.
- CSV fields: `timestamp`, `action` (for example `project.created`, `team.member.left`, `auditlog.export.downloaded`), `actor_vercel_id`, `actor_name`, `actor_email`, `location` (IP), `user_agent`, `request_id`, `previous` (JSON), `next` (JSON).
- Streaming to a SIEM (Datadog, Splunk, S3, GCS, HTTP) is moving to Audit Log Drains (2026).
- Even exports are audited (`auditlog.export.requested`).

**Activity Log** ([activity-log](https://vercel.com/docs/activity-log), all plans)
- A chronological list of all team events showing user(s), event type, account type and time. "Hover over the time to reveal the exact timestamp."
- **100% coverage** of team and project settings changes since 2026-02-25 (88 new events) ([changelog](https://vercel.com/changelog/activity-log-now-tracks-100-of-team-and-project-changes)).
- **Project-level view** inside project settings since 2026-07-07 ([changelog](https://vercel.com/changelog/you-can-now-view-the-activity-log-at-a-project-level)).
- CLI `vercel activity` has filters.
- *(Row format "avatar · actor bolded · action sentence · target link · relative time" is unverified but consistent with Entity + RelativeTimeCard.)*

### Patterns to adopt for the Swedbank concept (proposal)

**Role mapping** (pick wording with the Swedbank agent; legal terms such as firmatecknare need validation)

| Vercel | Swedbank concept role | Notes |
|---|---|---|
| Owner | **Owner** (authorised signatory) | Can invite, change roles, close accounts. Recommend ≥ 2. |
| Member | **Admin** | Full operations, cannot manage people by default. |
| Developer | **Payer** | Can create payments; production action (send) needs approval. |
| Billing / Usage Viewer | **Accountant** | Read-only on all accounts; fees, invoices, statements, exports. |
| Enterprise Viewer | **Auditor** | Read-only everything, including the audit log; time-boxed access *(proposal)*. |
| Pro Viewer | **Viewer** | Free seat, balances only, no statements. |
| Contributor + project roles | **Limited** + per-account roles (Account Admin / Payer / Viewer) | Access only to assigned accounts. |
| Extended permissions | **Add-on permissions**: "Approve Payments up to 50 000 SEK", "Manage Cards", "Export Statements" | Layered on a base role. |
| Access Groups | **Approval Groups** (for example "Finance Nordics": accounts × roles × members) | Computed permission = highest grant; show "Effective access" in member detail. |

**Members page anatomy**
- Header: "Team" with an [Invite Member] primary button.
- Tabs: `Members`, `Pending Invitations` (with count badge), `Approval Groups`.
- Filter bar: search by name or email, Role, Account access.
- Row (Entity): avatar 32 + name (`label-14` strong) + email (`label-13` `gray-900`) | role Select (inline, owner only; others see a Badge) | "Last active 2h ago" (RelativeTimeCard) | Dots menu: Manage Access, Change Role…, Remove Member….
- Locked items (`MenuItemLocked`) for non-owners, with a tooltip "Only owners can change roles."

**Invite flow** (Modal, not a page, because it is short)
- Title "Invite Members".
- Repeating rows: Email input (chips when pasting multiple addresses *(proposal)*) + Role Select + remove icon; "Add More" link-button.
- "Assign Account Access" appears when Limited is chosen, the analog of Assign Project Roles.
- Footer: "Invitations expire after 7 days." on the left; Cancel and **Invite Members** on the right.
- Toast "2 members invited". Pending rows show "Expires in 6d" plus Resend Invite / Revoke Invite.

**Four-eyes approvals** (bank-specific, built from Vercel parts)
- An "Approvals" page lists Entity rows with a Status Dot (Awaiting approval, amber, pulsing), amount, initiator avatar, and a Split Button "Approve ▾ (Approve, Approve with Comment…, Reject…)".
- Reject uses a Modal with a reason. Large amounts require BankID signing (step-up) *(proposal)*.

**Destructive actions**
- Remove Member, Close Account and Revoke API Key use the **Destructive Action Modal**: "To confirm, type the member's email 'anna@acme.se'". Cancel is focused.
- The toast mirrors the button: Remove Member → "Member removed".

**SSO**
- A Fieldset in Settings → Security: "SAML Single Sign-On" row with [Configure].
- "Require SSO" Toggle, disabled until the owner has signed in via SSO, with a Tooltip explaining why.

**Audit log page**
- Table columns: Time (RelativeTimeCard; hover shows UTC + local) | Actor (avatar + name) | Action (human sentence plus the code `payment.approved` in `label-12-mono` `gray-900`) | Target (link) | IP / Device (mono, truncated) | ▸.
- Row click opens a **Sheet** with a before/after diff of the `previous` and `next` JSON (JSON View).
- Filters: Actor, Action category, Account, Date range (Calendar with presets), all URL-backed.
- **Export CSV** button: choose a timeframe, then the toast "Export requested. We'll email a link valid for 24 hours." The export itself is logged.

---

## 6. Transparency: usage, spend, invoices, status

### What Vercel ships (verified)

**Usage page** ([manage and optimize usage](https://vercel.com/docs/pricing/manage-and-optimize-usage))
- Team-level ("Usage belongs to the team, because bills belong to the team", [Academy](https://vercel.com/academy/optimize-your-vercel-account/read-the-usage-page)).
- Controls: a billing-cycle dropdown (current cycle or "Last 30 days") and a project dropdown.
- An **allotment indicator** shows consumption in the current cycle and **projected cost** per item.
- Breakdown by project and region. Viewing options: **Count, Project, Region, Ratio** (cached vs uncached, success vs error), and **Average**.
- 2025-07 redesign: breakdown by product, team and project, plus **CSV export** ([changelog](https://vercel.com/changelog/new-usage-dashboard-for-pro-customers)).
- One-click links from a usage metric to the matching Observability dashboard. A usage card on the team overview. A billing usage and cost API (2026-02).
- Usage updates on a slower billing cadence than Observability. The Academy openly explains the lag ("Observability tells you what just happened and Usage tells you what you'll pay for").

**Pro credit model** ([pro plan](https://vercel.com/docs/plans/pro-plan))
- $20 monthly credit, usable across resources from the first unit. It expires at month end.
- Automatic notification at **75% of credit**, then daily and weekly summaries once on-demand.

**Spend Management** ([docs](https://vercel.com/docs/spend-management); owner and billing roles; enabled by default for new Pro since 2025-09)
- Location: Settings → Billing → Spend Management toggle → **On-Demand Budget** (USD, per billing cycle).
- Actions:
  - Notifications at **50%, 75%, 100%** (web and email).
  - **SMS at 100%**, per user, with a verified phone.
  - **Webhook** (POST `{budgetAmount, currentSpend, teamId, thresholdPercent}`, signed with `x-vercel-signature`).
  - **Pause Production Deployments**, confirmed "by entering the team name". Changes save automatically.
- Honest caveats in the UI copy:
  - "Setting a spend amount does not stop usage on its own."
  - The check "happens every few minutes … consider setting your spend amount below the absolute maximum."
  - Paused projects must be resumed individually.
  - Storage keeps billing while paused.
- All spend actions appear in the Activity log. The CLI has `vercel budgets` (2026-10).

**Invoices** ([docs](https://vercel.com/docs/pricing/understanding-my-invoice))
- Settings → Billing → **Invoices** tab.
- Each row has a PDF download icon, invoice number, issue date and due date. The detail view gives a line-item breakdown: "On-demand Charges" split into Managed Infrastructure and Developer Experience Platform.
- **Partial invoices** (threshold billing, 2026-06) carry a clear **"Partial" label**, and "you are never billed twice for the same usage."
- Notification "Invoice payment failed" is non-configurable and goes to users who can manage billing.

**Notifications for usage**
- "Usage increased" and "Usage limit reached" notification types.
- Pro owners can set thresholds per category by percentage or absolute dollars.
- Warning shown when disabling: "you won't receive alerts for any excessive charges … may result in unexpected additional costs."

**Deployment status colors:** see the Status Dot section. Badges: green = healthy, red = error, amber = warning, blue = info/production, gray = neutral.

**Status page** *(unverified):* Vercel runs a hosted status page with per-component uptime bars and incident history. Inside the dashboard, incidents surface through a Project Banner or Banner rather than toasts.

### Patterns to adopt for the Swedbank concept: "Fees & Limits" (proposal)

**Fees & Limits page** (the analog of Usage)
- Header: "Fees & Limits", a cycle selector ("October 2026 ▾" with presets: This Month, Last Month, Last 30 Days, Custom…), an Account filter (All ▾), and [Export CSV].
- **Summary row**, typographic and not card-heavy:
  - Big number "Fees this month 247,50 kr", `heading-40` tabular.
  - Secondary text "Projected 312,00 kr by Oct 31", `label-14` `gray-900`.
  - "Included in plan: 25 of 30 free domestic payments". Gauge small, neutral until ≥ 80%.
- **Metered lines**: a table grouped by product (Payments, Cards, FX, Cash). Columns:
  - Item.
  - Used / Included (`tabular-nums`, for example `25 / 30`).
  - Progress bar (shared scale, 120 px).
  - Unit price.
  - **Charge** (right-aligned).
  - ▸ drill-down to the transactions that produced the fee (copying Vercel's click-through to Observability).
- Bars are `gray-1000` (or orange) under 80%, `amber-700` at 80–95%, `red-800` at 95%+, with the same thresholds everywhere (Note, Gauge, notifications).
- **Limits section**:
  - Entity rows for Card daily limit, Payment limit per transaction, Monthly transfer limit.
  - Each has a Gauge, "Used 8 000 / 10 000 kr today", "Resets in 6 h" (RelativeTimeCard), and a [Change Limit] button.
  - Reasons are shown when disabled ("Limits above 100 000 kr require an owner").
- **Spend controls** (the analog of Spend Management), a Fieldset card:
  - "Monthly Budget" toggle and amount input (kr).
  - Alert threshold checkboxes **50% / 75% / 100%**; channels Web, Email, Push, SMS.
  - Action Toggle: "Freeze Cards at 100%". Confirmed by typing the company name, the analog of pausing projects.
  - Optional webhook for accounting systems.
  - Footer help: "Budgets are checked every few minutes, so card payments may exceed the budget slightly." This is honest, Vercel-style.
- **Invoices and statements**: a Table with columns Period, Number (mono), Issued, Due, Amount, Status badge (Paid / Due / **Partial**), and ⤓ PDF. Row click opens a detail Sheet with the line-item breakdown.
- **Status vocabulary** (one canonical set; Title Case; American single-L "Canceled" only if you follow Vercel, otherwise pick one spelling and enforce it):

  | Domain | States (color) |
  |---|---|
  | Payments | Scheduled (gray) · Awaiting Approval (amber) · Processing (amber, animated) · Completed (green) · Rejected (red) · Canceled (gray) |
  | Cards | Active (green) · Frozen (blue) · Blocked (red) · Expired (gray) |
  | KYC / Company | Verified (green) · In Review (amber) · Action Required (red) |

- **Service status:** a non-dismissible Banner at the top of the content area during incidents ("Card payments are delayed. Updates every 30 minutes." + [View Status]). Never use a toast for this.

---

## 7. What makes it feel "Vercel": 20 principles to apply

Each principle is grounded in a Vercel source; the concrete application follows it.

1. **Monochrome first; color only for meaning.** Ninety percent of the UI is sand and brown. Color appears only on status, focus and data ([design.md](https://vercel.com/design.md)).
2. **One accent, rationed.** Swedbank orange appears on about 1% of pixels: logo, active indicator, focus ring, selection. Never a background wash, gradient or status color.
3. **Ink is the primary action.** The primary button is the darkest neutral (brown), exactly as Vercel's is black. Brand color is not used for the CTA.
4. **Hierarchy through type, not boxes.** Size, weight (600 / 500 / 400 / 550 strong) and gray-900 vs gray-1000 do the work before borders and cards. Avoid cards-in-cards ("Prefer spacing, alignment, typography … before borders or boxes").
5. **Tight headings, calm body.** Negative tracking on every heading (about −0.02 to −0.06 em), normal tracking on body, and a 20–24 px line height for 14–16 px copy.
6. **Numbers are first-class.** Use `tabular-nums` everywhere amounts appear, right-align them including headers, and keep currency precision consistent (0 or 2 decimals, never mixed; Vercel copywriting rule). Put a space between number and unit (`10 MB` → `1 250 kr`).
7. **Mono only for identifiers.** IBAN, OCR, reference and request IDs, and timestamps in logs. Never whole tables.
8. **Hairlines, not borders.** 1 px translucent rings drawn as box-shadow, each border drawn once, and shadows layered and nearly invisible (2–6% opacity).
9. **Few, consistent radii.** 6 px for controls and flat surfaces, 12 px for cards, menus and modals, 16 px for fullscreen, full for pills. Nested radii are concentric.
10. **A clear elevation ladder.** Base → small → medium → large on the page; tooltip → menu → modal → fullscreen above it. Only floating things float.
11. **Instant feedback.** 150 ms transitions. **Optimistic updates** with rollback or Undo. Loading buttons keep their label. POST/PATCH/DELETE should complete in under 500 ms ([Web Interface Guidelines](https://vercel.com/design/guidelines)).
12. **No flicker, no layout shift.** Skeletons mirror the final layout. Spinners use a 150–300 ms show-delay and a 300–500 ms minimum visible time.
13. **Live, not refreshed.** Statuses stream (build logs, payment processing). Dots animate only while in progress, and the tab favicon and title reflect state.
14. **URL is state.** Filters, tabs, selected rows, date ranges and open sheets are deep-linkable; back and forward restore scroll.
15. **Keyboard-first.** ⌘K palette with verbs, visible `:focus-visible` rings everywhere, arrow-key menus, Escape closes, focus returns to the trigger.
16. **Copy is a design system.** Title Case Verb + Noun buttons, "{Noun} {past participle}" toasts, "Couldn't X. Try again." errors, example-value placeholders, the "…" character for follow-up dialogs and in-progress states, no "successfully", no "OK", no "please".
17. **Friction proportional to stakes.** Toggles save instantly with a toast. Modals are for blocking decisions. Type-to-confirm with the resource name is reserved for irreversible or high-stakes actions, and Cancel has default focus.
18. **No dead ends; every state designed.** Empty (with the next action), sparse, dense, error (with request ID and Try Again), permission (with who can grant it), and loading.
19. **Radical honesty about money and limits.** Show projected cost, thresholds, delays ("checked every few minutes"), what is not covered, and the exact CSV fields. Disclose before the user commits.
20. **Restraint in motion and decoration.** Animate only to explain a state change (overlay scale .96 → 1, 300 ms). Honor reduced motion. No gradients, glows, glass, all-caps eyebrows or decorative icon tiles. "Vercel restraint is precise hierarchy, excellent typography, clear evidence, strong alignment, and deliberate tension. It is not merely black, white, thin rules, and large empty margins." ([design.md](https://vercel.com/design.md))

Bonus anti-patterns that Vercel explicitly rejects (design.md, "Reject generated-design reflexes"):
- All-caps tracked eyebrows.
- Em dashes in headings.
- Generic centered hero followed by a card grid.
- Repeated metric boxes.
- Badges for ordinary metadata.
- Nested cards.
- Tiny muted prose.
- Legends instead of direct labels.
- Visible theme toggles on formal pages.

---

## Appendix A: source list

**Geist**
- [vercel.com/geist/introduction](https://vercel.com/geist/introduction)
- [colors](https://vercel.com/geist/colors)
- [typography](https://vercel.com/geist/typography)
- [materials](https://vercel.com/geist/materials)
- [grid](https://vercel.com/geist/grid)
- Component pages `https://vercel.com/geist/<name>` (and `.md`): button, badge, status-dot, tabs, table, input, select, combobox, multi-select, modal, destructive-action-modal, destructive-confirmation-input, sheet, drawer, toast, tooltip, context-card, command-menu, skeleton, empty-state, note, project-banner, error, progress, gauge, pie-gauge, avatar, entity, menu, context-menu, split-button, switch, toggle, choicebox, feedback, fieldset, description, relative-time-card, middle-truncate, calendar, filter-params, breadcrumbs
- Production CSS tokens: `https://vercel.com/vc-ap-b3331f/_next/static/immutable/chunks/03c2ofdjk0hta.css` (fetched 2026-10-29; hashed path changes)
- [vercel.com/design.md](https://vercel.com/design.md): Vercel's designer brief for report sites, including its visual-system rules
- [Web Interface Guidelines](https://vercel.com/design/guidelines) / [GitHub](https://github.com/vercel-labs/web-interface-guidelines)

**Font**
- [vercel.com/font](https://vercel.com/font)
- [npm geist](https://www.npmjs.com/package/geist)
- [github.com/vercel/geist-font](https://github.com/vercel/geist-font)

**Docs**
- [access roles](https://vercel.com/docs/rbac/access-roles)
- [access groups](https://vercel.com/docs/rbac/access-groups)
- [managing team members](https://vercel.com/docs/rbac/managing-team-members)
- [accounts](https://vercel.com/docs/accounts)
- [SAML](https://vercel.com/docs/saml)
- [directory sync](https://vercel.com/docs/directory-sync)
- [organizations](https://vercel.com/docs/organizations)
- [usage](https://vercel.com/docs/pricing/manage-and-optimize-usage)
- [spend management](https://vercel.com/docs/spend-management)
- [invoices](https://vercel.com/docs/pricing/understanding-my-invoice)
- [Pro plan](https://vercel.com/docs/plans/pro-plan)
- [trials](https://vercel.com/docs/plans/pro-plan/trials)
- [audit log](https://vercel.com/docs/audit-log)
- [activity log](https://vercel.com/docs/activity-log)
- [notifications](https://vercel.com/docs/notifications)
- [managing deployments](https://vercel.com/docs/deployments/managing-deployments)
- [build logs](https://vercel.com/docs/deployments/logs)
- [troubleshoot a build](https://vercel.com/docs/deployments/troubleshoot-a-build)
- [projects](https://vercel.com/docs/projects)
- [getting started](https://vercel.com/docs/getting-started-with-vercel)

**Changelog and blog**
- Navigation redesign: [rollout 2026-02-26](https://vercel.com/changelog/dashboard-navigation-redesign-rollout), [opt-in 2026-01-22](https://vercel.com/changelog/new-dashboard-navigation-available)
- Overview and switcher: [team overview 2025-06-12](https://vercel.com/changelog/improved-team-overview-page), [overview 2021](https://vercel.com/changelog/a-new-dashboard-overview-is-now-available), [switcher 2023](https://vercel.com/changelog/improved-experience-for-moving-between-your-teams-and-projects), [favorites 2023](https://vercel.com/changelog/favorite-teams-and-projects-to-appear-in-your-dashboard)
- Command menu: [⌘K 2021](https://vercel.com/changelog/quickly-navigate-the-dashboard-with-shortcuts), [⌘K in deployments 2023](https://vercel.com/changelog/command-menu-now-available-in-deployments)
- Usage: [usage dashboard 2025-07](https://vercel.com/changelog/new-usage-dashboard-for-pro-customers)
- Filters: [deployment filters 2026-08](https://vercel.com/changelog/find-deployments-faster-with-redesigned-filters), [log filters 2026-02](https://vercel.com/changelog/redesigned-search-and-filtering-for-runtime-logs)
- Activity log: [activity 100% 2026-02](https://vercel.com/changelog/activity-log-now-tracks-100-of-team-and-project-changes), [project activity 2026-07](https://vercel.com/changelog/you-can-now-view-the-activity-log-at-a-project-level)
- Billing and access: [spend default 2025-09](https://vercel.com/changelog/spend-management-now-enabled-by-default-on-pro), [RBAC 2025-10](https://vercel.com/changelog/expanded-role-based-access-control-rbac-for-enterprise-teams), [threshold billing 2026-06](https://vercel.com/changelog/threshold-billing-is-now-enabled-for-pro-teams)
- Notifications: [push 2025-12](https://vercel.com/changelog/push-notifications-support-on-desktop-and-mobile)
- [Dashboard redesign blog 2019](https://vercel.com/blog/dashboard-redesign)

**Community and education**
- [New project creation flow feedback (2024-10-29)](https://community.vercel.com/t/call-for-feedback-on-the-new-vercel-project-creation-flow/1734)
- [Academy: Read the Usage Page](https://vercel.com/academy/optimize-your-vercel-account/read-the-usage-page)

## Appendix B: open questions and unverified items to check in a logged-in dashboard

- Exact visual of the new sidebar: item order, the group headings, how the team switcher and plan badge render, and the resize handle.
- The current `vercel.com/new` steps and copy, whether confetti still appears, and the success screen layout.
- The Members page invite UI: whether it uses email chips or rows, and how the role Select is styled.
- The Activity page row format and filter set in the UI.
- Usage page chart types: bar vs area, and the exact look of the allotment indicator.
- Toast position and stacking behavior. Modal footer styling.
- Single-key keyboard shortcuts beyond ⌘K.
- Swedbank brand hexes: placeholders `#FF5F00` / `#512B2B` / `#FDF6EE` need confirmation. Regenerate the sand and orange scales with the same OKLCH lightness profile once confirmed.
