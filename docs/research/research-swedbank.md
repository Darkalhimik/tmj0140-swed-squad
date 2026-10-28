# Swedbank research for the concept mockup (Estonia-first)

Research date: 2026-10-29. Scope: the Swedbank side only. Revolut and Vercel are covered by other agents.

**Scope note.** A mid-task update moved the target market to **Swedbank AS Estonia (swedbank.ee)**, with an **English-only UI**. Estonia is covered in depth below; Sweden is kept as short context (section 9). The brand-identity work (section 1) applies to both markets.

**How this was researched.**
- I downloaded the live CSS from swedbank.se (68 stylesheets) and swedbank.ee (webcomponents 4.0.0 `shared-styles.min.css` + `shared.css`) and extracted the CSS custom properties.
- I read the public Swedbank Pay design-system repo on GitHub.
- I downloaded and parsed the swedbank.ee price lists and onboarding pages, and the PDFs they link to.
- I extracted the internationalisation (i18n) string dictionary that the swedbank.ee **User rights and payment limits** page embeds. It contains the real labels used inside the business internet bank.
- I pulled 279 App Store reviews for the Estonian app through Apple's public RSS feed, plus the Google Play listing.
- Anything I could not confirm is marked **(unverified)**.

---

## 0. TL;DR: the 12 facts that matter most for the mockup

1. **The current brand palette is bark-brown plus a vivid orange, not #EE7023.** The live web token is `--ui-color-redesign-bark: #512b2b`, used for text and icons. Primary CTA buttons are orange **`#FF5F00`**, and orange text uses **`#FB4F00`**. The interactive and link colour is teal **`#257886`**, with turquoise `#31A3AE` as its lighter partner. The yellow is "pineapple" **`#FDC92A`**, not #FDC129. The legacy orange `#EE7023` survives only in Swedbank Pay and as one chart colour on swedbank.ee. Sources: swedbank.ee and swedbank.se CSS (§1.2).
2. **Fonts.**
   - Headings and display: **Swedbank Headline** (Bold/Black).
   - Body: **Roboto**, on both swedbank.se and swedbank.ee.
   - A **Swedbank Sans** family (Regular/Medium/Bold) is also loaded.
   - Google Fonts stand-ins: **Roboto** for body (an exact match) and **Rubik 700/800** for headlines (my visual judgment).
3. **Shapes.**
   - Buttons are **pills** (`border-radius: 100px`), 56px min-height, 19px bold, orange fill, white text.
   - Secondary buttons are a teal 2px outline pill.
   - Cards use 16–32px radii on an 8px grid.
   - swedbank.se already ships a full **dark theme** with `#121212` background and `#272727` elevated surfaces.
4. **Logo.** The wordmark "Swedbank" is set in orange `#FF5F00`. To its right sits a round, coin-like orange-gradient emblem with an oak tree and "SINCE 1820" along the bottom arc. A stand-in SVG is in §1.5.
5. **Founding an Estonian OÜ is fast and needs no bank.**
   - It is done fully online in the e-Business Register portal with ID-card, Smart-ID or Mobile-ID. e-Residency cards work too.
   - The state fee is **€265**. Minimum capital is **€0.01 per shareholder** (since 1 Feb 2023).
   - For contributions **≤ €50,000**, founders pay in and board members simply *confirm* it; no bank certificate is needed. Above €50,000, the money goes to a state deposit account, not a bank.
   - So unlike Sweden, the bank is not on the critical path to registration.
6. **Swedbank Estonia business account, resident path.**
   - Log in to the internet bank as an existing private customer, click **"Open an account"**, and fill in the application.
   - Swedbank promises to **"contact you within an hour"** if you apply on a working day between 08:30 and 16:00.
   - Contracts are signed with Smart-ID, Mobile-ID or ID-card.
7. **Non-resident path (e-residents, foreign owners).**
   - Branch appointment at **Arter branch, Tallinn**.
   - A non-refundable **enhanced due diligence fee of €300** (Estonian or EEA companies with non-resident links), or **€500** (other states and high-risk sectors).
   - Decision within **10 working days** after the fee is paid.
   - CVs, contracts with Estonian partners and a business plan are required.
   - A **€50/month** "servicing a client" fee applies for non-EEA-linked owners.
8. **Business pricing is account-free.**
   - €0 monthly account fee. The **first 1,000 euro payments per month are free** in digital channels; payment 1,001 onwards costs €0.16 (intrabank) or €0.38 (SEPA).
   - The first business debit card is free; later cards cost €4 to issue and **€2/month**.
   - Business Credit Card: €5 issue, €3/month. Business Gold Credit Card: €10 issue, €10/month.
   - Branch payments cost €5 each.
9. **Private plans (since 01.11.2025).**
   - **Essential Plan €1/month**, **Purchase plan €2/month**, **Travel plan €6/month**. Each includes unlimited euro payments and a free debit card.
   - Without a plan, each intrabank payment costs €0.16 and each SEPA/instant payment €0.38.
10. **The business internet bank's rights model is rich but bureaucratic.**
    - Users get profiles: *Information*, *Preparation of payments*, *Information and payments*, *All services*, *Agreement signing*, *Agreement signing with other user*.
    - Each user has a daily/monthly limit, and the company has an instant-payment limit.
    - A **"second user to accept payments starting from a certain limit"** can be required.
    - IP and country login restrictions are available.
    - Every change is signed as an amendment to a **"Digital Services Agreement"** with a qualified e-signature.
    - Several actions are **branch-only**: admin rights where representation is joint, the right to sign agreements, and limits beyond **€50,000/day** or **€100,000/month**.
11. **App sentiment is two-faced.**
    - Ratings: **4.83 stars (1,940 ratings)** on the Estonian App Store and **3.8 stars (7.04K reviews)** on Google Play.
    - The written reviews are overwhelmingly negative. Recurring themes: vague "Tekkis viga" ("An error occurred") messages, login and biometric breakage after updates, the app being a wrapper that keeps opening the web bank, broken widgets, and redesigns that remove features.
12. **Outages are a recurring theme in Estonian news.** ERR reported web, app and card-payment disruption in Sept and Oct 2024 (likely cyberattacks, per ERR). A partner status page logged a payments incident on 6 Sept 2026. Swedbank's own site announced IT-maintenance disruption for the early morning of 15 Oct 2026.

---

## 1. Brand identity

### 1.1 Three distinct palettes exist; don't mix them up

| Source | What it is | Primary accent | Text colour |
|---|---|---|---|
| **swedbank.se / swedbank.ee web (current "redesign" tokens)** | Retail bank websites and the internet bank shell | Orange `#FF5F00` (CTA), `#FB4F00` (orange text) | Bark `#512B2B` |
| **Swedbank Pay Design Guide** (design.swedbankpay.com) | Payments subsidiary design system | Yellow `#FDC92A` (primary button bg) | Solid brown `#2F2424` |
| Legacy and print (pre-redesign) | Old Swedbank orange | `#EE7023` | Brown |

**Recommendation.** Use the **swedbank.ee/.se redesign palette**, because it is what the Estonian bank actually ships today. Swedbank Pay's yellow-first system is a sister brand.

### 1.2 Exact colour tokens extracted from live CSS

#### A. swedbank.ee, named palette (webcomponents 4.0.0)

Source: `https://www.swedbank.ee/webjars/webcomponents/4.0.0/assets/styles/shared-styles.min.css` and `/shared.css`, fetched 2026-10-29.

| Token | Hex | Notes |
|---|---|---|
| `--ui-color-redesign-bark` (= bark-70) | **#512B2B** | Primary text and icon colour ("Bark" brown) |
| bark-60 | #715151 | Secondary text, neutral icons (7.0:1 on white) |
| bark-50 | #917877 | Muted text and lines (4.07:1 on white, AA for large text only) |
| bark-40 | #B19F9E | |
| bark-30 | #D1C6C4 | Dividers |
| bark-20 | #E5DCD7 | |
| bark-10 | #F2EDEB | Subtle surfaces |
| bark-05 | #F9F8F6 | Page background tint |
| bark transparents | rgba(81,43,43,.04/.06/.08/.12/.14/.16/.24/.40/.56) | Used for shadows and overlays (brown-tinted shadows, not grey) |
| `--ui-color-redesign-orange` | **#FF5F00** | Brand and CTA orange |
| `--ui-color-redesign-orange-text` | **#FB4F00** | Orange used for text and headlines |
| `--ui-color-redesign-tangerine` | #FF9100 | |
| `--ui-color-redesign-pineapple` | **#FDC92A** | Yellow; also `alert-yellow` |
| `--ui-color-redesign-peach` | #FFF1CD | Yellow tint; hover |
| `--ui-color-redesign-apricot` | #FDF6EE | Warm off-white surface |
| `--ui-color-redesign-turquoise` | **#31A3AE** | |
| `--ui-color-redesign-teal` | **#257886** | Links and interactive elements (5.11:1 on white) |
| `--ui-color-redesign-seafoam` | #8ACDC3 | |
| `--ui-color-redesign-aqua` | #BBEAD9 | |
| `--ui-color-redesign-sky` | #DBF8ED | |
| `--ui-color-redesign-mist` | #ECF9F3 | |
| `--ui-color-redesign-lilac` | #C5569A | |
| `--ui-color-redesign-tulip` | #990066 | |
| `--ui-color-redesign-lavender` | #D28AC5 | |
| `--ui-color-redesign-iris` | #F8DBF5 | |
| `--ui-color-redesign-rose` | #FFECFF | |
| `--ui-color-redesign-thistle` | #FBF3F7 | |
| `--ui-color-redesign-blue` | #5B8AD6 | |
| alert-red / tint | #C5131C / #FFEEE7 | |
| alert-green / tint | #457C0E / #F2F7EB | |
| alert-blue / tint | #3865B5 / #EBF1FA | |
| alert-yellow / tint | #FDC92A / #FFF1CD | |
| alert-brown | #995700 | |
| `--ui-color-pfm-pfm` | #EE7023 | Legacy orange, still used in the "My Budget" charts |
| `--ui-color-grey` | #EBE7E2 | |
| `--ui-color-lightgrey` | #F9F8F6 | |
| input background / border | #F1FAF6 / #BCD8DB | Form fields have a faint mint fill |

Chart order (`--ui-color-chart-0..16`): orange, pineapple, turquoise, lilac, blue, teal, tulip, red-subtint, seafoam, lavender, orange-text, …

#### B. swedbank.se semantic tokens, light and dark

These are semantic tokens with a `[data-theme="dark"]` override block. They were extracted from the swedbank.se `/etc.clientlibs/wcms/...` CSS bundle.

| Semantic token | Light | Dark |
|---|---|---|
| `--background-system` | #FFFFFF | #121212 |
| `--background-systemBar` | #FDF6EE | #2E2E2E |
| `--surface-elevation` | #FFFFFF | #272727 |
| `--text-regularHigh` | **#512B2B** | #F2EDEB |
| `--text-regularMedium` | #512B2BC7 (78% alpha) | #F2EDEBC7 |
| `--text-brand` | #FB4F00 | #FB4F00 |
| `--text-interactive` / `--line-focus` | #257886 | #31A3AE |
| `--text-error` | #C5131C | #FF7980 |
| `--text-success` / `--text-positive` | #457C0E | #A3DC77 |
| `--text-negative` | #A61E00 | #FF8676 |
| `--surface-brandHigh` (primary button) | **#FF5F00** | #FF5F00 |
| `--surface-brandLow` | #FFF1CD | #232323 |
| `--surface-brandBright` | #FDF6EE | #232323 |
| `--surface-interactiveHigh` | #257886 | #31A3AE |
| `--surface-turquiseBright` / `Low` / `High` | #ECF9F3 / #DBF8ED / #31A3AE | dark: #232323 / #232323 / #31A3AE |
| `--surface-lilacHigh` | #C5569A | #C5569A |
| `--surface-warningContrast` | #FDC92A | #FDDF8C |
| `--surface-infoContrast` | #4572C0 | #8AB5FF |
| `--surface-errorContrast` | #C5131C | #FF7980 |
| `--surface-disabled` | #D8D8D8 | #2E2E2E |
| `--line-default` | #917877 | #B19F9E |
| `--line-regularLow` | #512B2B29 | #F2EDEB29 |
| `--line-tabFocus` | #0000FF | #5757FF |
| `--overlay-scrim` | #00000033 | #00000033 |
| dataVisualisation-categorical 1–8 | #FB4F00, #FDC92A, #990066, #D28AC5, #31A3AE, #8ACDC3, #FF9100, #C5569A | same |

#### C. Swedbank Pay Design Guide (sister brand)

Source: GitHub `SwedbankPay/design.swedbankpay.com` (default branch `develop`, last push 2026-10-12), files `src/App/Identity/identity/Color/swedbankpay-colors.js` and `src/less/variables-swedbankpay.less`.

- Brand: primary `#FDC92A`; light `#FBDD91`; lighter `#FFF3D5`.
- Accents: brown `#2F2424`, orange `#EE7023`, pink `#EFB7B6`, turquoise `#31A3AE`, turquoise-light `#8ACDC3`, turquoise-dark `#257886`.
- Text: default `#2F2424`, muted `#72605E`, muted-light `#A38B80`, disabled `#D4C4BC`.
- Backgrounds: orange `#FFF1E4`, brown `#EBE7E2`, turquoise `#EBF8F2`, grey `#F9F8F6`.
- System colours: success `#4D9C0F`, warning `#EE7023`, info `#335BB1`, error `#D82E2A`.
- `--border-radius: 8px`.
- Buttons are 3.5rem (56px) tall. Primary button background is `--brown-solid` (`#2F2424`) with white text in the newer tokens. Older LESS used yellow `@btn-primary-bg: @brand-primary`.
- Fonts: `--brand-headline: "Swedbank Headline", Arial`; `--brand-black: "Swedbank Headline Black"`; mono `"Akkurat Mono"`; default body **Arial**.

#### D. Verification of the guesses in the brief

| Guess | Verdict |
|---|---|
| Brown #512B2B | **Confirmed.** It is the swedbank.se/.ee primary text colour ("bark"). Swedbank Pay uses a darker #2F2424. |
| Orange #EE7023 | **Legacy.** Still Swedbank Pay's orange and a chart colour on .ee. The live CTA orange is **#FF5F00**, and orange text is **#FB4F00**. The logo wordmark fill is **#FF5F00** (from the logo SVG, class `.st105{fill:#FF5F00}`). |
| Yellow #FDC129 | **Wrong by one digit.** The real value is **#FDC92A** ("pineapple"). |
| Turquoise | **Confirmed.** #31A3AE, with teal #257886 for links and interactive elements. |

#### E. Contrast checks (computed with the WCAG 2.x formula)

| Foreground on background | Ratio | Passes |
|---|---|---|
| White on #FF5F00 | **3.05:1** | AA for large text only. Swedbank's 19px bold button text just qualifies as "large". Keep the CTA label ≥ 18.66px bold, or use bark text on orange. |
| White on #FB4F00 | 3.38:1 | AA large only |
| #512B2B on #FF5F00 | 3.98:1 | AA large only |
| #000 on #FF5F00 | 6.89:1 | |
| #512B2B on white | **12.14:1** | AA and AAA |
| #257886 on white | 5.11:1 | AA (safe for links and small text) |
| #31A3AE on white | 3.01:1 | Use for fills, not text |
| #512B2B on #FDC92A | 7.84:1 | Good for warning or "pending" chips |
| #F2EDEB on #121212 | 16.1:1 | Dark mode text |
| #FF5F00 on #121212 | 6.15:1 | Dark mode accent text is fine |

**Implication for a Vercel/Revolut-style UI.** Use bark `#512B2B` (or near-black) for body text, orange `#FF5F00` sparingly for the single primary action and brand moments, and teal `#257886` for links and focus. Use apricot `#FDF6EE` or bark-05 `#F9F8F6` as quiet surfaces. Dark mode can reuse the swedbank.se dark tokens exactly.

### 1.3 Suggested token set for the Next.js mockup

These are derived from the real tokens above:

```css
:root {
  --sb-orange: #FF5F00;        /* primary action, brand */
  --sb-orange-text: #FB4F00;   /* orange headings/text */
  --sb-bark: #512B2B;          /* text */
  --sb-bark-60: #715151;       /* secondary text */
  --sb-bark-50: #917877;       /* tertiary text, lines */
  --sb-bark-30: #D1C6C4;       /* dividers */
  --sb-bark-10: #F2EDEB;       /* subtle surface */
  --sb-bark-05: #F9F8F6;       /* app background */
  --sb-apricot: #FDF6EE;       /* warm surface / top bar */
  --sb-peach: #FFF1CD;         /* highlight / pending */
  --sb-pineapple: #FDC92A;     /* warning */
  --sb-teal: #257886;          /* links, focus, interactive */
  --sb-turquoise: #31A3AE;     /* secondary accent, charts */
  --sb-mist: #ECF9F3;          /* success-ish surface */
  --sb-lilac: #C5569A;  --sb-tulip: #990066;   /* tertiary accents, tags */
  --sb-success: #457C0E; --sb-success-tint: #F2F7EB;
  --sb-error: #C5131C;   --sb-error-tint: #FFEEE7;
  --sb-info: #3865B5;    --sb-info-tint: #EBF1FA;
  --sb-shadow: 0 2px 12px rgba(81,43,43,.08), 0 0 1px rgba(81,43,43,.16); /* real .ee --ui-shadow-down */
  --sb-radius-sm: 8px; --sb-radius-md: 12px; --sb-radius-lg: 16px; --sb-radius-xl: 24px; --sb-radius-2xl: 32px; --sb-radius-full: 1000px;
}
[data-theme="dark"] {
  --bg: #121212; --surface: #272727; --surface-2: #232323; --text: #F2EDEB;
  --text-muted: #F2EDEBC7; --line: #B19F9E; --interactive: #31A3AE; --error: #FF7980; --success: #A3DC77;
}
```

### 1.4 Typography

| Role | Production font | Evidence | Free stand-in |
|---|---|---|---|
| Display, headlines, buttons ("action" font) | **Swedbank Headline Bold** / **Swedbank Headline Black** | swedbank.ee `--ui-font-family-headlinebold: "HeadlineBold"` (file `SwedbankHeadline-Bold.woff2`), `--ui-font-family-headlineblack`. swedbank.se uses `SwedbankHeadlineBold` and `SwedbankHeadlineBlack` 27 and 18 times. | **Rubik 700/800** (a similar chunky humanist sans with soft corners; my visual judgment, unverified). Alternative: Nunito 800, which is more rounded. |
| Body | **Roboto** 400/500/700 (900 also loaded) | `.ee --ui-font-family-body: "Roboto",Helvetica,Arial`; swedbank.se `body{font-family:Roboto,sans-serif;font-size:1rem;line-height:1.375rem}` | **Roboto** (exact match, Google Fonts) |
| Brand sans (also loaded) | **Swedbank Sans** Regular/Medium/Bold | `.ee @font-face SwedbankRegular → SwedbankSans-Regular.woff2`; `.se SwedbankSansRegular/Medium` | Roboto or Inter |
| Mono (Swedbank Pay only) | Akkurat Mono | Swedbank Pay LESS | JetBrains Mono / Geist Mono |

- **Type designer.** Swedbank Headline is plausibly by Stefan Hattenbach (Mac Rhino Fonts), per a Luc Devroye type-design listing (https://luc.devroye.org/fonts-26108.html). **Unverified.**
- **swedbank.ee type scale** (the second value applies at desktop breakpoints):
  - Display large 44/52 → 56/64; display medium 38/46 → 48/56.
  - Headline large 28 → 32; medium 24; small 20.
  - Title large 24; medium 20.
  - Body large 16/24; medium 14/22; small 12/16.
  - Action large 19/24 bold Headline; action medium 16/24 bold Headline.
  - Weights: regular 400, semibold 500, semibold-dark 600, bold 700, black 900.
- **Headline style in practice** (screenshots of swedbank.ee and swedbank.se, §1.7): headlines are set in **orange** (#FB4F00) Swedbank Headline Black, sentence case. Body text is bark brown Roboto.

### 1.5 Logo

**Current lockup.** Rendered from the official SVG `https://www.swedbank.se/content/dam/global/brand/logotypes/8999-swedbank-logo-default.svg`, viewBox 598×130. A white version (`8999-swedbank-logo-white.svg`) is served for `prefers-color-scheme: dark`.

- **Wordmark (left).** "Swedbank" with a capital S, in a soft humanist sans. Fill is **#FF5F00**.
- **Emblem (right).** A circular, coin-like medallion. It has a radial orange-gold gradient: highlights around #FFD68E/#FFC278, mid-tones #F29B40/#E5872B, and the rim and shadows in deep #B43C19/#7A2C13/#56220C. About 60 fills are used, so it is a skeuomorphic, embossed coin.
  - In the centre is a **broad oak tree**: a wide, cloud-like crown with cut-out gaps and a short, thick trunk. Its colour is close to the background, with depth from shading.
  - "**SINCE 1820**" in small caps runs along the bottom curve.
- **History** (logos-world.net/swedbank-logo):
  - The oak has been a savings-bank trademark since 1932.
  - The FöreningsSparbanken coin with the oak was designed by Lars Hall in 1997.
  - Swedbank was named on 8 Sept 2006, the coin was kept, and **orange became the main colour**, combining the FöreningsSparbanken and Hansabank symbols.
  - Hansabank, Estonia's predecessor brand, was renamed Swedbank in 2008 (Swedbank press release 2008-09-15).

**Simple stand-in SVG** (flat, emblem only; it does not reproduce the trademark):

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64" width="32" height="32" role="img" aria-label="Oak coin (stand-in)">
  <defs>
    <radialGradient id="coin" cx="35%" cy="30%" r="75%">
      <stop offset="0" stop-color="#FFD68E"/>
      <stop offset=".55" stop-color="#F29B40"/>
      <stop offset="1" stop-color="#B43C19"/>
    </radialGradient>
  </defs>
  <circle cx="32" cy="32" r="31" fill="url(#coin)"/>
  <circle cx="32" cy="32" r="27.5" fill="none" stroke="#FFC278" stroke-opacity=".6"/>
  <g fill="#B46027">
    <circle cx="22" cy="27" r="7"/><circle cx="32" cy="21" r="9"/><circle cx="42" cy="27" r="7"/>
    <circle cx="27" cy="31" r="6"/><circle cx="37" cy="31" r="6"/>
  </g>
  <path d="M29.5 33h5l1.5 11h4v2.5H24V44h4z" fill="#8D4428"/>
  <path id="arc" d="M14 40A19 19 0 0 0 50 40" fill="none"/>
  <text font-family="Arial,sans-serif" font-size="4.2" letter-spacing=".6" fill="#7A2C13">
    <textPath href="#arc" startOffset="50%" text-anchor="middle">SINCE 1820</textPath>
  </text>
</svg>
```

For the lockup, place `<span style="color:#FF5F00;font:700 28px Rubik">Swedbank</span>` to the left of the coin, with the coin about 1.15× the cap height. In dark mode, use a white wordmark with the same coin.

### 1.6 Shape, spacing, elevation, components on the live sites

- **Grid.** `--ui-grid-base-point: 8px`. The increments are 2, 4, 6, 8, 10, 12, 16, 24, 32, 40 … 96px.
- **Radii on swedbank.ee:** xsmall 4px, small 8px, medium 12px, large 16px, xlarge 24px, xxlarge 32px, full ≈1000px.
- **Radii on swedbank.se,** by frequency in the CSS: 16px (37×), 32px (25×), 28px (22×), 24px (20×), 100px pills (20×). Content cards on swedbank.se use roughly 28–32px radii, with image halves bleeding to the edge.
- **Primary button (swedbank.se `.button` / `.button-link`):**
  - `background: var(--surface-brandHigh)` (#FF5F00), white text, `border-radius:100px`, `min-height:56px`, `padding:10px 32px`.
  - `font: 700 1.1875rem/1.5rem SwedbankHeadlineBold`.
  - Hover is a black overlay (`::before` at low opacity, 0.25s ease-in-out).
  - The arrow icon after the label slides on hover (`icon-arrow-large` with a transform transition).
- **Secondary button.** Transparent background, teal text `#257886`, a `2px solid currentColor` border, and a pill shape.
- **Focus ring.** `outline: 2px solid var(--line-tabFocus)` (#0000FF in light mode, #5757FF in dark) with `outline-offset:2px`. It is a deliberately pure-blue accessibility ring.
- **Shadows on swedbank.ee** are brown-tinted:
  - `--ui-shadow-down: 0 2px 12px rgba(81,43,43,.08), 0 0 1px rgba(81,43,43,.16)`
  - level-2: `0 4px 16px rgba(81,43,43,.16)`
  - swedbank.se also uses `0 2px 24px rgba(0,0,0,.08)`.
- **Links** are teal and often carry a trailing "→" arrow, for example "Ansök om nytt bolån →".
- **Lists** use orange round bullets.
- **Accordions** use full-width rows with chevrons. A yellow (pineapple) header bar marks highlighted callouts, for example "For existing customers".
- **Numbered steps** use small lilac/tulip number badges.
- **Cookie banner** on swedbank.ee: three stacked full-width teal outline pills. On swedbank.se: two orange filled pills plus a teal outline pill.

### 1.7 Layout, imagery, tone of voice

**swedbank.ee business page structure** (screenshot taken 2026-10-29):
- Top utility row: ENG ▾ and "Log in".
- Main row: logo, then **Private | Business** segment tabs (the active one is underlined orange), then "Contact us" and "Become a customer".
- Mega-nav row: Home icon · **Everyday banking · Cards · Payment collection · Financing · Insurance, pension · Investment, Savings · Traderoom · Group account · Partners offers** · search.
- Then breadcrumbs, a large orange H1, and hero cards split between text and photo.

**swedbank.se** (rendered in dark theme):
- Header: "Privat | Företag | Private Banking", a pill search field, "Bli kund" and "Logga in".
- A second bar: "Meny · Våra tjänster · Händelser i livet · Kundservice".
- A "Snabbvägar" (shortcuts) chip row and a floating turquoise chat bubble.

**Photography.** Natural-light lifestyle photos of real, diverse Nordic people: a small-business team in a café or roastery, a couple moving into an empty flat, a parent and child on a sofa with a phone. The tone is warm and unstaged. Product shots appear too: the business debit card is a **dark teal card with a tonal oak-tree pattern and a Mastercard logo**.

**Tone of voice.**
- Friendly, plain-language, second person, short benefit bullets. Examples: "Let's make money matters easy!", "We are here for you", "You won't be paying a penny for your card in the first year!", "Start your business in a right company" (sic, on swedbank.ee).
- Estonian copy uses the capitalised polite-informal **"Sina/Sinu"**, as in "võtame Sinuga ühe tunni jooksul ühendust" ("we will contact you within one hour").
- **Group purpose:** "We empower the many people and businesses to create a better future". **Vision:** "A financially sound and sustainable society".
- **Values: Open** ("a straightforward, honest and reliable partner"), **Simple** ("Our services and employees must be easily accessible and easy to understand"), **Caring** ("Everything we do, we base on our customers' needs"). Source: https://www.swedbank.com/about-swedbank/strategic-direction.
- **Pitch hook.** "Open, Simple, Caring" maps directly onto the transparency theme.

**Icons.** swedbank.ee uses a custom icon font, **"Iconique"** (`/stylebook/font/swedbank-iconique.woff2`). Material Icons is used in Swedbank Pay.

---

## 2. Company formation in Estonia (OÜ)

### 2.1 Official step-by-step in the e-Business Register portal

Source: RIK help page "Establishment of a private limited company", https://abiinfo.rik.ee/index.php/en/node/230/. The portal is also known as ettevotjaportaal.rik.ee. The numbering below is mine; the screen labels are RIK's.

1. **Log in** to the e-Business Register portal as a private person with an **Estonian ID card (including the e-Residency card), Smart-ID or Mobile-ID**, then choose **"Establishment"**.
2. **Choose the legal form**, compare the types, and press **"Start registering"**.
3. **Activity.** Search EMTAK (the Estonian NACE classification) by name or code. Only **one** planned principal activity is allowed at founding; activities are later reported in the annual report.
4. **Financial year.** Defaults to the calendar year.
5. **Name.** The portal shows similar names and trademarks; the registrar decides. The name must contain "Osaühing" or "OÜ" at the start or end. Then **Save → Next**.
6. **Address.** Pick from the Estonian address data, with map disambiguation for multi-building sites. A foreign address needs a note **and a contact person** added under persons.
7. **Means of communication.** At least an e-mail, which is confirmed through a link.
8. **Persons.** At least one **board member** ("+ Add board member") and at least one **founder** ("Add founder"), who can be a natural or legal person.
   - **Every person must be able to sign digitally.**
   - With two or more board members, representation rules can be specified; the default is **joint representation**.
9. **Capital.** Enter the share capital. The minimum share per shareholder is **€0.01**. Set each founder's contribution. Special share classes are optional.
10. **Articles of association.** A template with mandatory fields; edits are optional.
11. **Documents.** Generally none are mandatory.
12. **Optional add-ons:**
    - **Voluntary VAT registration**, forwarded to the Tax and Customs Board (EMTA) after registration.
    - **Beneficial owners** ("Add beneficial owner").
    - **Employees**, which creates an employment-register entry at EMTA.
13. **Sign.** Signatories get a portal notification and open it under Dashboard → My applications. Signing works **only with an Estonian ID card (including e-Residency), Smart-ID or Mobile-ID**, using PIN2. Going "Back to change the application" **cancels all signatures**.
14. **Contribution:**
    - **≤ €50,000:** founders **pay in full before submission** and **board members confirm** it in the application. "The entrepreneur is responsible for the accuracy of the data." No bank certificate is needed.
    - **> €50,000:** pay into the state **deposit account**, by bank link or a transfer with a unique reference number. After registration, apply to have the deposit returned to the company's current account.
15. **State fee: €265** for electronic founding. Pay by bank link or transfer with the shown reference, and wait for the Treasury to receive it.
16. **Submit,** or tick "submit automatically once the fee is received". There is an option to subscribe to e-Financials information.
17. **Processing.** The application page shows the registrar's review deadline. If the registrar requires corrections, use "Change the application".

### 2.2 Numbers and rules

| Item | Value | Source |
|---|---|---|
| State fee, online founding | **€265** | RIK help (above); e-Residency "Costs & fees" (learn.e-resident.gov.ee). The RIK 2022 notice lists "expedited processing 265 EUR (regular processing 200 EUR)" and a €25 amendment fee (https://abiinfo.rik.ee/en/uudised/state-fees-will-change-01012022). |
| Notary route | €200 state fee plus notary fees | RIK 2022 notice; third-party guides |
| Minimum share capital | **€0.01 per shareholder** since **1 Feb 2023** (previously €2,500) | e-Residency blog, 21 Oct 2022 (https://www.e-resident.gov.ee/blog/posts/upcoming-changes-to-the-commercial-code-make-it-easier-to-start-and-run-a-company/); RIK help |
| Bank certificate of contribution | **Only needed above €50,000.** "The Ministry of Justice has confirmed that a banking certificate isn't required below that threshold." | e-Residency blog (above) |
| Founding with unpaid capital | **Conflicting.** RIK says founders must pay before submission and board members confirm. A 2022 e-Residency blog said "it is enough for the founder to confirm that they have made the contribution **or will make it in the future**". Crowe (403 to fetch; cited via search snippet) says it is not allowed since 1 Feb 2023. **Treat as "pay and confirm" (RIK is authoritative).** | RIK; e-Residency; Crowe (unverified) |
| Business name reservation | €150, valid up to 6 months, in force since 1 Mar 2024 | e-Residency blog (above) |
| Typical processing time | **About 1 business day**, often a few hours for clean digitally-signed filings; up to 5 working days if flagged. **Unverified/vendor:** enty.io (https://enty.io/blog/how-long-estonian-company-registration-takes-2026). e-Residency says company registration "takes up to a day". | enty.io; e-Residency/Narvi blog, 11 Aug 2025 (https://www.e-resident.gov.ee/blog/posts/what-to-do-if-you-cant-get-a-business-bank-account/) |
| e-Residency card fee | €150 | learn.e-resident.gov.ee "Costs & fees" |
| Contact person | "Most e-residents need a designated contact person in Estonia, as required by the Commercial Code" (≈ €200–400/yr via virtual office) | learn.e-resident.gov.ee "Costs & fees" |
| Corporate income tax | "generally a flat 22%", payable only when profits are distributed | learn.e-resident.gov.ee "Costs & fees" |
| VAT registration threshold | **€40,000** taxable supply per calendar year (registration threshold from 1 Jan 2025). Apply within **3 working days** of the obligation arising. | EMTA (https://www.emta.ee/en/business-client/taxes-and-payment/value-added-tax/registration-vat-payer/obligation-register-taxable-person); EMTA threshold page (https://www.emta.ee/en/business-client/taxes-and-payment/value-added-tax/registration-vat-payer/threshold-calculation-1-january-2025) |
| VAT rates | 24% standard (also 13%, 9%, 0%). The effective date of 24% is **1 July 2025** per third-party sources (**unverified** on EMTA). | EMTA rates page via search; 1Office |
| Beneficial owners | Declared in the founding application. Changes must be filed within 30 days (**the 30-day deadline is unverified**, third-party). | RIK help; e-Residency blog (https://www.e-resident.gov.ee/blog/posts/know-your-legal-duties-as-an-e-resident-company-owner/) |
| Annual report | Mandatory for all Estonian companies, including inactive ones | learn.e-resident.gov.ee "Costs & fees" |
| Do you need an Estonian bank account? | No; an EEA account is acceptable (third-party claim). The bank is **not required to register** for contributions ≤ €50k. | Search snippets (unverified) |

### 2.3 After registration: what a founder must do (mockup checklist)

1. Get the registry code (8 digits). The company **automatically exists** in the Business Register and is visible to EMTA.
2. **Open a business account.** The bank is now where friction lives (§3).
3. **Pay in or confirm the share contribution**, if that was not already done before submission.
4. **VAT registration**, voluntarily at founding or mandatorily when taxable supply exceeds €40k (3 working days).
5. **Employment register (TÖR) entries** at EMTA before anyone starts work. Board-member fees count as payroll (third-party).
6. **Beneficial owner data** must be kept current.
7. **Contact person and address**, if the board is abroad.
8. **Annual report** via e-Financials (e-Äriregister) after the financial year ends. The deadline is commonly six months after year-end (**unverified here**).

---

## 3. Swedbank Estonia business onboarding

### 3.1 The official flow on swedbank.ee

Source: https://www.swedbank.ee/business/d2d/accounts/open?language=ENG, fetched 2026-10-29. The Estonian version is at `?language=EST`.

**Page title:** "Open a new business account". **Hero:** "Start your business in a right company".
- "Up to 1,000 free payments per month"
- "A free card for a year"
- "Compatibility with most financial software and online stores"
- "Opening a business account in the Internet bank in a few quick steps"
- "Special offer! Sending an e-invoices for 6 months free of charge."
- Primary CTA: **"Open an account"**.

**Resident path ("For existing customers"):**
> "Submit your application on a working day from 8:30 a.m. to 4 p.m., and **we will contact you within an hour**. If you submit your application at a different time, we will call you the next working day."
> 1. "Log in, click 'Open an account', and fill out the application."
> 2. "We will contact you within an hour and you'll have a new account."
> "Contracts can be signed in the Internet bank by company representatives using **Smart ID, Mobile ID or an ID card**."

**Not yet a private customer?** "To open a business account in the Internet Bank, you first need to confirm your identity, which can be done remotely here." In other words, the **representative must first onboard as a private customer**; remote identity verification is in the app (§6.2).

**Non-resident path:**
> "If the owners of the company include non-residents or foreign companies, the most convenient way to open an account is to book an appointment at the **Arter branch in Tallinn**. … **We will make the decision within 10 working days after receiving the enhanced due diligence fee.**"

**First-year price box** on the page:

| Item | First year |
|---|---|
| Opening an account | free |
| Opening a start-up account | free |
| Monthly account fee | €0 |
| Euro payments | €0 |
| Corporate debit card (monthly fee) | €0 |

"In the first year, debit cards are free of charge for start-up companies."

**Business contact:** 613 2222 (Mon–Fri 9:00–17:00), ariklient@swedbank.ee. Private customer service: +372 6 310 310.

### 3.2 Required documents

Source: Swedbank PDF "Documents for opening an account", effective 26.03.2026, https://swedbank.ee/static/pdf/business/d2d/accounts/info_account_openingdocs_eng.pdf.

**Estonian legal persons:** a document identifying the legal representative(s). Register data comes from the e-Business Register.

**Estonian legal persons with non-resident connections:**
- ID of the representative(s).
- **CV** (education and career) of each non-resident representative and/or owner.
- **Agreements or contracts with Estonian business partners.**
- **Business plan** or short description of the company.
- ID of the beneficial owner, if necessary.
- > "For companies with non-residential connections we do not open the account directly at the branch. While making the decision … Bank will take into account the **business links with Estonia** (business partners/business activity in Estonia). The decision … will be made within 10 working days after paying fee of enhanced due diligence measures in case all necessary documents are submitted."

**Legal persons of other countries:**
- A register extract or certificate of incorporation (original or notarised). It must show name, activity, address, registration number and date; directors with residence, ID codes and tax residencies; and owners and beneficial owners with tax IDs and share amounts.
- If the extract lacks any of that: memorandum/resolution, articles, registration certificate, and a board resolution on representation.
- **Apostille or legalisation**, unless a treaty applies.
- Sworn translations into Estonian, Russian or English may be demanded.

**Start-up account (Estonian: *stardikonto*):**
> "Start-up accounts are opened for companies in foundation (pursuant to the Commercial Code) and for that purpose, we ask you to submit a **notarized memorandum of association**. Until the registration of companies, the founders/shareholders can only make payments to the start-up account."

This is used on the **notary founding route**. The online portal route usually does not need it (§2.2).

### 3.3 Fees tied to onboarding

Source: the business price list, https://www.swedbank.ee/business/useful/important/pricesrates?language=ENG, "Opening accounts" effective 01.11.2023.

| Fee | Amount |
|---|---|
| Opening an account | free |
| Opening a start-up account | free |
| **Enhanced due diligence fee**: Estonian legal persons with non-residents as representatives or owners | **€300** |
| Enhanced due diligence fee: legal persons from the EEA | **€300** |
| Enhanced due diligence fee: legal persons from other states | **€500** |
| Enhanced due diligence fee: high-risk activities (payment or e-money institutions, weapons, currency exchange, military vehicles, cash transport, crowdfunding, fast credit, mining, strategic goods) | **€500** |
| | "The fee will be paid **before** bank makes an account opening decision. The fee is **not returned** if the bank decides not to open the account." |
| **Monthly fee for servicing a client** (regular enhanced due diligence): companies registered in Cyprus, Liechtenstein or outside the EEA; owners or beneficial owners with ID from Cyprus, Liechtenstein or outside the EEA who are not Estonian residents; high-risk sectors including gambling | **€50/month**, announced 30 days in advance |
| Closing a legal person's account at the bank's initiative (AML obligations) | up to €130 |
| Opening an account in another Swedbank Group bank via Swedbank Estonia | €200 + courier |

### 3.4 What the KYC questionnaire asks

**Business.** Source: https://www.swedbank.ee/business/useful/bank/aml?language=ENG ("Know Your Customer principle"; there is an "Update Customer Questionnaire for Legal Entities" link).
> "We ask questions about a company's registration details, tax residence, tax identification number, and beneficial owners, as well as the area of business activity, main contracting partners, contact details, etc. From time to time, we send requests to provide or update information. If necessary, we ask for additional details and documents constituting the basis for transactions (e.g., the origin of funds, sales, lease and supply agreements, documents related to the goods, etc.)…"

The page also covers:
- **CRS/FATCA** tax-residency questions.
- An extensive **sanctions** section. The prohibited countries and regions are Afghanistan, Crimea, Cuba, Iran, North Korea, Belarus, Russia, Syria, the Russian-occupied Ukrainian regions, and Venezuela.
- Internet Bank and app access blocked from North Korea, Syria and Iran IPs.

**Private customer-data wizard.** The step names come from the embedded i18n strings:
1. **Introduction**
2. **Contacts**: phone verified with a 6-digit SMS code ("Once you verify your number … you can then use new and innovative solutions like **Proxy Pay** and **Apple Pay**"), plus e-mail.
3. **Address**: with Omniva postcode search.
4. **Tax information**: "Connection to [country]", residency, and a file upload of 5 MB maximum.
5. **PEP status**: "Are you a Politically Exposed Person (PEP)?", with close-associate relation types.
6. **Work**: field of activity, position held, employment type (salaried, self-employed, "Company owner, shareholder", student, pensioner…), work experience, education, marital status, family type, dwelling place.

Buttons: "Confirm and continue" and "Confirm and finish". Final screen: "Thank you for your time!"

This is a useful template for a **"progressive KYC" redesign screen**.

### 3.5 Friction and complaints (business onboarding)

- **Non-residents and e-residents:**
  - Branch-only, with a **non-refundable** €300–500 fee and a 10-working-day decision clock.
  - An "Estonian connection" test, plus a €50/month surcharge for non-EEA-linked owners.
  - All of the above is official (§3.3).
  - Third-party guides: "Traditional Estonian banks (LHV, Swedbank, SEB) are cautious with pure non-residents who have no local ties … often decline or require an in-person meeting" (enty.io, unverified vendor). Also: "For non-resident founders and e-Residents, Swedbank can be challenging. The bank places significant emphasis on local economic substance, Estonian management involvement, and physical presence" (search snippet from a formation vendor, unverified).
- **e-Residency programme view.** "Opening a business bank account that can actually process your payments takes, on average, several weeks – and for some founders, several rejections." Traditional banks: "Weeks or longer". Source: e-Residency blog, 11 Aug 2025, https://www.e-resident.gov.ee/blog/posts/what-to-do-if-you-cant-get-a-business-bank-account/.
- **e-Residency 2021 survey.** "46% of respondents perceived that Estonian bank accounts were difficult to open". 16% needed two or more attempts. Source: https://www.e-resident.gov.ee/blog/posts/business-banking-options-for-e-residents/ (June 2022).
- **Trustpilot (swedbank.ee).** TrustScore **2.0/5 from only 10 reviews**, so this is a small sample. Quotes:
  - On a start-up account (Oct 2024): "I was sent into loops on their site trying to do this"
  - Oct 2025: "Dont recommend it because of account blocking for a month without a reasoning."
  - Jul 2024: "Got my account blocked 3 times … especially if you deal with crypto in any way. Use LHV."
  - Source: https://www.trustpilot.com/review/swedbank.ee
- **Reddit (r/Eesti, r/eResidency).** Reddit blocked automated access (HTTP 403), and site-restricted web search returned no Swedbank-specific threads. **No Reddit quotes could be verified.** This is a gap.

---

## 4. Business internet bank: users, rights, limits, approvals

Source: https://www.swedbank.ee/business/d2d/ebanking/admin?language=ENG ("User rights and payment limits"), plus the i18n dictionary embedded in that page. Strings are quoted verbatim.

### 4.1 The model

- Everything hangs off one **"Digital Services Agreement"** per company (or per person, on the private side).
- Adding a user, changing rights or changing limits means pressing **"Edit agreement"**. The change becomes an unsigned amendment, which you **"Sign changes"** with a qualified e-signature:
  > "All the changes to the agreement can only be confirmed with a qualified electronic signature (Smart-ID, eID card, Mobile-ID)."
- Signed documents are downloadable as **ASiC-E** containers ("Download ASICE").
- "All additional users need to have a user ID. To get a user ID, the person needs to be identified. It can be done remotely."
- Internally the code still carries the Hansapank heritage: error classes such as `ee.hansa.bank.payments.PaymentValidationException`, `ee.hansa.bank.agreements.teleagreements.TeleAgreementException`. This is a nice "legacy core" talking point; it is an observation from page source.

### 4.2 Capabilities listed on the page

- "Add and remove users"
- "Suspend user rights with or without term"
- "Assign and amend user rights"
- "Add and remove user accounts"
- "Set daily and monthly limits for user accounts"
- "**Assign a second user to accept payments starting from a certain limit**"
- "Change your company's daily and monthly payment limits": increase up to a maximum of **€50,000 per day or €100,000 per month**, or decrease to a preferred amount.
- "Instant payment limit": a max per day or per transaction, shared across all users and accounts, that can be disabled. A disabled instant limit means payments go as ordinary SEPA.
- "New limits apply as soon as they are digitally signed."
- "If you need higher limits, send us a bank message, call us, or visit the nearest bank branch."
- "Important: This functionality is available only with Smart-ID, ID card or Mobile-ID authentication tools!"

### 4.3 Who becomes administrator

- > "If a company has one or more individuals with **individual rights of representation** in the commercial register and internet bank user-id has been added to digital services agreement, they will **automatically be granted administrator rights**."
- > "If a company has several persons with **joint representation** in the commercial register, the administrator's rights are validated **at the branch** or by the company's manager."
- > "If you wish to enable the user administration feature for another person, then the authorized signatory **must visit a branch**."
- **Right to sign agreements:** "a legal representative of the company (a member of the management board) **must visit a branch or contact the company's account manager**… Agreements can be signed when logged in to the Internet Bank with Smart-ID, ID card, Mobile ID or Digi-ID."

### 4.4 Exact UI vocabulary (from the embedded i18n; use this in the mockup)

**Rights profiles** (`profile_*`):

| Code | Label |
|---|---|
| 101 | **Information** |
| 100 | **Preparation of payments** |
| 102 | **Information and payments** |
| 103 | **All services** |
| 107 | All services in the group |
| 112 | **Agreement signing** |
| 113 | **Agreement signing with other user** |
| 105 | Exceptions |
| 106 | E-Teller |
| 110 | Traderoom |
| 114 | Custody |

The public page's matrix rows are: Preparation of payments · Information on currency exchange rates · Information on account transactions · Currency exchange · Approval of payments · Signing agreements.

**Operations** (`operation_*`): Domestic payment · Defined payment · International payment · SWIFT payment · Card payment · Preparation of payments · Limits · Agreements signing · Agreement signing with other user · Sign contracts of E-invoice standing order · SEC transactions import without accept · SEC transactions import with accept · Consolidated payment contents view.

**Administration of user rights** (`adminRights_*`): **No** · **Yes** · **With double acceptance** · **Preparation of changes** · **Read-only rights**.
- Help text: "administrator has the right to change and sign the digital services agreement in business internet bank independently."
- "User administration rights can be changed only in the branch."

**User status** (`status_*`): **Active** (A) · **Suspended** (S) · **Waiting second accept** (W). Also "Suspended until %1", "Suspended indefinitely", "Authorisation valid until", "Waiting for the second signature.", and "Other user's accept required".

**Limits:**
- Labels: "Daily limit" · "Monthly limit" · "Instant payment daily limit" · "Instant payment one transaction limit" · "Not set". Instant-limit scope: "Daily" / "Transactional".
- Validation errors:
  - "Daily limit cannot exceed monthly limit"
  - "Invalid daily limit. The limit must be non-negative and without Euro cents."
  - "Instant payment limit cannot be higher than daily limit."
  - "Daily limit is higher than allowed maximum"
  - "Limits editing is restricted and can be enabled only in a branch."

**Login restrictions:**
- "Allowed countries to enter the Internet Bank"
- "List of IPs from where it is allowed to login…"
- "IPs specified on the agreement level apply to all users, but it is possible to set additional IPs for only some users."
- "Login from Swedbank branches is always allowed."

**Agreement editing:**
- Buttons: "Edit agreement" · "Add new user" · "Add account" / "Add more accounts" · "Sign changes" · "Discard all changes" · "To current agreement" / "To editing agreement".
- Other strings: "Chosen pricing package" · "Changes come into force immediately after signing. Sign at latest on %1" · "In order for the changes to take effect, the agreement must be signed by another user."
- "Rights will be applied to all company's future and also existing accounts for which access is currently not granted."

**Confirmation methods:** Smart-ID · Mobile-ID · Biometrics · "ID card / PIN-calculator".

### 4.5 Payment confirmation and security conventions (Estonia)

- **PIN1 and PIN2.** "PIN1 represents you and PIN2 is your signature". Users must "**compare control codes**" between the bank screen and the Smart-ID or Mobile-ID prompt. Source: swedbank.ee fraud page, https://www.swedbank.ee/private/d2d/ebanking/secureBanking?language=ENG.
- **Password cards** were dropped in early 2019, for strong customer authentication. About 60% of former users moved to Smart-ID, about a third to ID-card, and about 10% to PIN-calculator or Mobile-ID (ERR, https://www.err.ee/906580/swedbank-ja-coop-pank-loobuvad-reedest-paroolikaartidest). A **PIN-calculator** can still be posted (€24.19 + VAT domestic).
- **Swedbank's own fraud advice:**
  - "Turn off instant payments … Instant payments are executed within 10 seconds"
  - Disabling limit changes requires a phone call: "add a restriction that prevents changing limits … call us at 6 310 310"
  - Set limits to actual needs
  - Disable online purchases and ATM withdrawals on the card
- **Proactive limit cuts (17 Sept 2025, ERR).** Swedbank cut the daily cash-withdrawal limit to **€700** for customers who had not withdrawn more than €700/day in the previous 1.5 years. The change took effect 20 Nov. Quote: "If a customer doesn't actually use large sums, a high limit is a pointless risk" (Tarmo Ulla). Source: https://www.err.ee/1609803282/swedbank-vahendas-pettuste-tokestamiseks-osa-klientide-sularahalimiiti. This is a good "explain why your limit changed" transparency use case.

### 4.6 Mockup implications (team and permissions area)

- Keep the real primitives: profiles, per-user daily and monthly limits, a company instant-payment limit, a "second approver above €X" threshold, IP and country allow-lists, and user suspension with an end date.
- Replace the agreement-amendment paperwork with a **diff-and-sign** flow:
  - Show "3 pending changes" as a Vercel-style diff, for example "+ Add user Mari Tamm · Information and payments · €5,000/day".
  - One Smart-ID signature, showing the verification code.
  - A second-signer state ("Waiting second accept") with an activity timeline.
- Make the **branch-only exceptions visible and explained** rather than surprising. For example: joint representation → "Needs both board members to sign", which could be digital in the concept.

---

## 5. Pricing (EUR), concrete numbers for the mockup

All figures are from the swedbank.ee price lists fetched 2026-10-29. Business: https://www.swedbank.ee/business/useful/important/pricesrates?language=ENG and the PDF https://swedbank.ee/static/pdf/business/d2d/start/tools/pricerates/Pricelist_ARI_eng_31_08_2026.pdf. Private: https://www.swedbank.ee/private/home/more/pricesrates?language=ENG. Both lists are "valid from August 31, 2026". A news item on the site was titled "Swedbank to change price list and conditions as of 31 August" (2 June 2026).

### 5.1 Business: accounts and payments (bank transfers effective 31.08.2026)

There is **no business daily-banking package** in Estonia; the account carries no monthly fee. The only "package" reference is a footnote, "Price applicable in Internet Bank for business clients (**Package I**)", in the financial-institutions section, and the internet bank shows a "Chosen pricing package" field.

| Service | Digital channels | Branch / Customer Support |
|---|---|---|
| Monthly account fee (standard company) | **€0** | |
| Intra-bank payment (EUR), **first 1,000/month** | **free** | €5 |
| Intra-bank payment from the 1,001st | **€0.16** | €5 |
| Domestic, European (SEPA) or instant payment, first 1,000/month | **free** | €5 |
| Domestic, European or instant payment from the 1,001st | **€0.38** | €5 |
| Payment within Swedbank Group (LV/LT/SE/NO) in EUR, first 1,000 / thereafter | free / €0.38 | €5 |
| Intra-bank or Group payment in foreign currency | €2 | €5 |
| Between the client's own accounts | free | €5 |
| Domestic or European **urgent** (TARGET2), up to €10k / over €10k | €7 / €30 | €9 / €32 |
| International, ordinary, SHA / OUR | €6 / €25 | €20 / €35 |
| International, urgent, SHA / OUR | €10 / €30 | €30 / €45 |
| Express EUR/USD, SHA / OUR | €35 / €45 | €40 / €55 |
| High-risk-country surcharge | +€75 | +€75 |
| Incoming SEPA, intra-bank or Group | free | |
| Incoming international, SHA | €6 | |
| Money request (link or QR), per receipt | €0.09 | |
| Payment cancellation, correction or inquiry (SEPA) | €10 | |
| Payment cancellation (international) | €20 + foreign bank costs | |
| Account statement (paper or branch; digital is free) | €10 | |
| Baltic Reports (consolidated EE/LV/LT balances) | €13/month | |
| Group account: open €200, annual €190, member account €12/month, module €20/month | | |
| Current account interest (EUR) | 0.01% | |

The 1,000 free payments aggregate intra-bank, domestic, European and Swedbank Group EUR payments, including standing orders.

### 5.2 Business: cards (effective 31.08.2026)

| Card | Issue | Monthly | Notes |
|---|---|---|---|
| **Business Debit Card** (Mastercard) | First card **free**; later cards €4 | **€2** (free in the first year for start-ups) | Renewal free; express card €30; temporary ATM card €10 |
| **Business Credit Card** | €5 | €3 | 18% APR, up to 30 days interest-free |
| **Business Gold Credit Card** | €10 | €10 | 14% APR, up to 40 days interest-free |
| ATM: Swedbank Group ATMs | 0.19 € + 0.3% | | |
| ATM: other banks or abroad | €2 + 2.5% | | |
| Cash deposit at a Swedbank ATM | free up to €3,000/month, then 0.3% (cap €15,000/month) | | |
| FX conversion on card purchases | 1% | | |
| Unjustified refund demand (chargeback), Estonia / abroad | €12 / €16 | | |

### 5.3 Business: cash, merchants and APIs

- **Branch cash** deposit or withdrawal: **0.5%, min €10**. Coins: 5%, min €10. Large cash reservations: free; cancelling one costs €50.
- **Card acquiring:** commission "as agreed"; phone terminal (SoftPOS) **0.99% + €0.02**; smart terminal **1.45%**.
- **Terminal rent per month:** stationary €13, mobile €19.50, stationary/mobile €18, Bluetooth €18, cash-register terminal €45, card reader €13. Minimum 3 months. Express installation €84. Smart terminal purchase €140.
- **E-commerce:** platform agreement and monthly fee free; payment initiation **€0.10/transaction**; Shopify surcharge 0.3%.
- **Swedbank Gateway (API/H2H):** direct-channel monthly fee **€25** (via operator: free); alert €0.10; intraday statement €0.50/query; **Payment Link €0.10 per successful payment** plus €15/month (direct).
- **E-invoices:** sending fee €0.19 (intra-bank) or €0.35 (domestic) per invoice; a company design template in the Internet bank costs €120.
- **Notifications:** €0.19 per SMS notification.
- **SWIFT MT940:** €25 set-up plus €35/month.

### 5.4 Private (personal), Estonia

**Service plans** (effective 01.11.2025). Each includes unlimited intrabank, domestic/instant, European and Swedbank Group payments, SEPA standing orders, e-invoice standing orders and bank-link payments made in the Internet Bank or app, plus a free debit-card monthly fee.

| Plan | Monthly | Extras |
|---|---|---|
| **Essential Plan** | **€1** (free up to age 25; €0.32 for age 65+) | — |
| **Purchase plan** | **€2** (age 6+) | Purchase insurance |
| **Travel plan** | **€6** (age 6+) | Purchase insurance + travel insurance |

New customers get the Essential plan **free for 6 months**.

**Without a plan:**
- Intra-bank EUR payment **€0.16** (free up to 25 and from 65).
- SEPA, domestic or instant **€0.38** (free up to 25).
- Branch payments €5.
- Urgent €7 (≤ €10k) / €30.
- International SHA €6 / OUR €25.

**Cards:**

| Card | Price |
|---|---|
| **Debit card Plus** | Issue €4, **€1/month** (free to age 19; €0.32 at 20–25 and 65+). The first debit card is free to issue. |
| ISIC Mastercard Student card | €6.33 issue, €0.32/month |
| Mastercard Private Banking Card | €1.98/month |
| **Revolving credit card** | €2/month (free to 25), 19–22% APR |
| **Gold revolving credit card** | €7/month, 17–20% APR |
| **Platinum credit card** | €17/month, 14–17% APR; Platinum extra package €160/yr |

**ATM and cash:**
- Swedbank Group ATMs: free up to €2,000/month, then 0.5%.
- Other ATMs: €2 + 2.5%.
- ATM deposits: free up to €5,000/month.
- Monthly ATM withdrawal cap: €7,500.

**Other private fees:**
- Account opening is free. The document-handling fee is **€250** for residents of non-EU/EEA/UK/CH countries, non-refundable.
- Bank-initiated closure (AML): up to €80.
- Statement: €10.

### 5.5 Sample "realistic numbers" kit for screens

- **Company:** "Põhjatuul Labs OÜ". Registry code: 8 digits (use a fake value such as 16XXXXXX; the "16…" prefix for recent registrations is **unverified**).
- **IBAN** (ISO example for Estonia; bank code 22 is Swedbank): **EE38 2200 2210 2014 5685**. **BIC: HABAEE2X** (swedbank.ee footer).
- **Bank legal entity:** Swedbank AS, reg. 10060701, Liivalaia 34, 15040 Tallinn (swedbank.ee footer).
- **Usage meter:** "**412 / 1,000** free payments used this month · next payment €0.00 · from #1,001: €0.38".
- **Limits:** company **€20,000/day · €60,000/month** (self-service max €50k/€100k); instant **€15,000/day, €5,000 per transaction**; user "Mari" €5,000/day; second approval required above €10,000.
- **Card:** Business Debit Card ••4821, €2/month (waived until 31 Oct 2027 under the first-year start-up offer), FX 1%.
- **Fee preview at payment time:** "SEPA instant · €0.00 (within free 1,000) · arrives in ~10 s"; "International USD, SHA · €6.00 + recipient bank fees".

---

## 6. Private Swedbank Estonia: internet bank and app

### 6.1 Products and structure (terminology seen on swedbank.ee and in its i18n)

- **Segments:** Private · Business; Private Banking · Gold customers · Seniors · For parents · Young people and students.
- **Internet bank areas:**
  - **"Summary statement"**: the overview, where new accounts are opened.
  - **"Payment limits and user management"**: the private Digital Services Agreement. Add family users and share selected accounts and rights.
  - **"My cards"** → **"Change limits"**: disable online purchases or ATM use.
  - **"My Budget"** (PFM): categorised spending, category and total limits, monthly comparison, consent-based.
  - **"Easy Saver"**: round-up saving.
  - **"Micro Invest"**: round-up investing.
  - "Regular investment", **"Money request"** (link or QR, payable from Swedbank, SEB, LHV, Coop, Luminor, Revolut or Citadele), **Proxy Pay** (pay by phone number), e-invoices (**e-arve**), standing orders, Traderoom.
- **Login:** Smart-ID, Mobile-ID, ID card/PIN-calculator, biometrics in the app. Session timeout: "To keep your account secure, we will log you out due to inactivity" with "Continue session" / "Log out".
- **App:** one app, **"Swedbank Eestis"**, for private and business users (Google Play description: "Both private & business customers can easily view their account balances & statements in app, use widget to check account balance, manage their cards, receive push notifications, enter internet bank without second login…"). Apple Pay, Google Pay and watch/keychain payments are advertised.

### 6.2 Becoming a private customer

Source: https://www.swedbank.ee/private/d2d/accounts/becomeOurCustomer?language=ENG.

- **"Open an account in under 15 minutes"** in the app. "Open an account in 3 steps": download the app → **"Become a customer"** → follow the instructions.
- **Requirements:** age 18+; a valid **Estonian passport or ID card** ("Only a residence permit is not enough"); **Smart-ID or Mobile-ID**; a phone with a camera and **NFC** (the ID chip is read).
- **Non-residents:** a branch visit; "connection with Estonia" is required (study, work, real estate, or close relatives) with original proof; €250 document fee for non-EU residents.
- **Children's accounts** can be opened online "as soon as child is born".

### 6.3 App store data

- **iOS, "Swedbank Eestis"** (id 434814718, bundle `com.swedbank.SwedbankAppEE`): **4.83 stars from 1,940 ratings** in the EE store. Version 137.0, released 2026-10-22. Source: iTunes Search API, fetched 2026-10-29.
- **Android, "Swedbank Eestis"** (`com.swedbank`): **3.8 stars, 7.04K reviews, 500K+ downloads**, updated 16 Oct 2026. Source: https://play.google.com/store/apps/details?id=com.swedbank&hl=en&gl=EE.
- **Written App Store reviews pulled** (RSS, most recent, 2011–Aug 2026): 279 in total, of which **216 are ≤ 3 stars**. The written-review sample is far more negative than the star average, which is typical of silent 5-star taps.

**Representative quotes** (verbatim; Estonian and Russian quotes are translated, with the original kept where useful):

| Date | Stars | Quote |
|---|---|---|
| 2026-08-06 | 1 | "Tekkis tõrge, tekkis viga…" ("A failure occurred, an error occurred… fix this app finally") |
| 2026-06-09 | 1 | "Iga natukese aja tagant on mingi tõrge välkmaksete tegemisel… ärge uuendage teda koguaeg" ("Every so often there is some failure making instant payments… stop updating it all the time") |
| 2026-05-07 | 1 | "täna update ja enam panka kasutada ei saa" ("updated today and can no longer use the bank") |
| 2025-12-04 | 1 | "App freely opens without Face ID or password. However both are activated. Totally not safe to use and smart assistant not effective!" |
| 2025-11-06 | 1 | "**New view where is used bold font for account balance is not good at all and first thought was is it scam or not.** I even called to callinh center to validate it." |
| 2025-09-30 | 1 | Notifications don't come through, "Ning sisemine AI assistent ei aita sellega" ("and the built-in AI assistant doesn't help with it") |
| 2025-07-22 | 1 | "the current design [of the icon] looks very outdated and unappealing… particularly noticeable in dark mode" |
| 2025-05-01 | 3 | "**It's super primitive. If you want to do anything, even something as basic as changing your charge limit, it opens a browser, where it takes 3-5 steps to complete the change.**" |
| 2025-03-06 | 1 | "Bad design, not possible to make instant international payments, many redirections to internet bank" |
| 2024-10-02 | 1 | Can't log in with Smart-ID or Face ID a quarter of the time; error messages are "lakoonilised 'tekkis viga'" (laconic "an error occurred") with no ETA for a fix |
| 2024-06-20 | 2 | "miks peab äpp olema veebi-pikendus? Näidake arendajale näiteks LHV äppi" ("why must the app be a web extension? Show the developer the LHV app") |
| 2024-02-07 | 1 | "the in app browser starts to load the selected service and continues loading the page forever" |
| 2024-01-29 | 1 | "App unusable for 3 days straight … Still not fixed and 0 communication" |
| Google Play, 2026-08-10 | — | "payments won't happen if you don't go back to the app after a smart id code was entered" |
| Google Play, 2026-10-01 | — | "Fingerprint biometric login no longer works post-update." Swedbank replied with a 6-step workaround. |

---

## 7. Pain points: top 10 ranked by how often they appear

**Method.**
- I ran a keyword-tagged count over the 216 negative written App Store reviews (EE, 2011–2026). One review can count toward several themes.
- I added mentions from Google Play, Trustpilot, ERR/Postimees news, and official Swedbank pages that reveal friction.
- The counts are approximate.

| # | Pain point | Evidence and frequency | Representative evidence |
|---|---|---|---|
| 1 | **App updates break things or remove features** (forced redesigns, lost quick balance, lost widgets, settings reset) | ~62 of 216 reviews; peaks in Aug–Nov 2019 (relaunch), Feb 2024 (widget), May 2025, Nov 2025 | "Delete the last update. User UI does not have to change everytime" (2024-08-23); "New view … bold font … is it scam or not" (2025-11-06) |
| 2 | **Vague errors and failed payments** ("Tekkis viga" / "Something went wrong") | ~59 | "payments often don't work, giving vague 'Tekkis viga' error" (2019-10-09); instant-payment failures (2026-06-09) |
| 3 | **Login and authentication friction** (Face ID/fingerprint resets, Smart-ID hand-off, re-onboarding the device) | ~58 + Google Play Oct 2026 | "Biometrics… after every update must be set up again" (RU, 2024-04-19); "payments won't happen if you don't go back to the app after a smart id code" (GP 2026) |
| 4 | **Widget, quick balance and notifications unreliable** | ~33 widget/balance + ~12 notifications | "kontojäägi vidin ei tööta" ("the balance widget doesn't work", 2024-02-11); notifications not arriving (2025-09-30) |
| 5 | **The app is a thin wrapper that bounces to the web bank or browser for real tasks** (limits, international payments, investing, old transactions) | ~14 explicit, plus many implicit | "changing your charge limit, it opens a browser… 3-5 steps" (2025-05-01); "why must the app be a web extension?" (2024-06-20) |
| 6 | **Non-resident and e-resident business onboarding is slow, costly and branch-bound** | Official price list and onboarding page; e-Residency blog; vendor guides | €300/€500 non-refundable EDD fee, decision within 10 working days, Arter branch only, €50/month surcharge, CVs, contracts and business plan required |
| 7 | **Account blocks or closures and repeated KYC document demands with little explanation** | Trustpilot (several of 10), crypto users | "account blocking for a month without a reasoning" (Oct 2025); "demanded all transactions from all exchanges, all public wallets" (Jul 2024) |
| 8 | **Rights and limits admin needs branch visits or agreement re-signing** | Official business user-rights page | Joint representation → branch; signing rights → branch; limits above €50k/day or €100k/month → contact the bank; "Limits editing is restricted and can be enabled only in a branch." |
| 9 | **Outages** across internet bank, app and card payments | ERR Sept and Oct 2024; Montonio status 6 Sept 2026; Swedbank maintenance notice for 15 Oct 2026; Swedbank LT outage Aug 2026 (LRT) | "Internet banking, use of the bank's mobile app and card payments were unavailable" (ERR) |
| 10 | **Fee opacity and price creep** (per-payment fees unless you buy a plan, branch price hikes, a 30-page price list) | Price lists; ERR 15 Aug 2024 | Coin deposit minimum rose from €5 to €10; PIN calculator for 65+ from €10 to €15; Smart-ID renewal at a branch from €10 to €15. "As we see a decline in the overall usage of these services, we are setting our prices accordingly" (Tarmo Ulla) |

**Also recurring (lower frequency):**
- Language support: historically Estonian-only, ~13 mentions, mostly 2015–2019.
- Dropped old iOS support: ~9 mentions, 2025.
- Missing features versus LHV, Apple Pay or SEPA: ~8.
- In-app feedback button not working.

---

## 8. Outages and news (Estonia)

| Date | Event | Source |
|---|---|---|
| ~late Sept 2024 (a Thursday evening; article ID dates it) | "Internet banking, use of the bank's mobile app and card payments were unavailable." Spokesperson Martin Kõrv: "the issues … were resolved temporarily. Disruptions later recurred." Cause not identified. | https://news.err.ee/1609472464/swedbank-digital-services-went-offline-thursday-evening |
| 20 Oct 2024 | Swedbank's website, app and card payments were disrupted in the same week. Bank outages "probably caused by cyberattacks". Swedbank declined to comment. Eesti Pank: no money lost. | https://www.err.ee/1609497631/pangateenuste-torgete-sagenemine-on-toenaoliselt-tingitud-kuberrunnakutest |
| 15 Aug 2024 | Branch price hikes (coins, PIN calculator, Smart-ID renewal) | https://news.err.ee/1609425340/competition-believes-won-t-gain-from-swedbank-price-hike |
| 17 Sept 2025 | Daily ATM limit cut to €700 for low-usage customers (anti-fraud), effective 20 Nov | https://www.err.ee/1609803282/swedbank-vahendas-pettuste-tokestamiseks-osa-klientide-sularahalimiiti |
| 6 Sept 2026 | "Technical issues with Swedbank payments", resolved in about 31 min (third-party Montonio status; market not stated) | isdown.app (via search; page returned 403) — **partially unverified** |
| 14 Oct 2026 | Swedbank notice: "Scheduled IT-maintenance works may cause disruptions in Swedbank's channels in the early morning of 15 October" | swedbank.ee business homepage news list |
| Aug 2026 (Lithuania) | Saturday app and internet-bank outage; fixed in "a little over an hour" | https://www.lrt.lt/naujienos/verslas/4/3015056/ (via search) |

**Market context:**
- Swedbank holds **38% of Estonian bank deposits** (LHV 26%, SEB 25%), about 45% of private deposits, and 38% of corporate deposits, as at 30 June 2025 (Finantsinspektsioon: https://www.fi.ee/sites/default/files/2025-11/FI_EFT_2_2025_eng.pdf).
- Estonia is Swedbank's most profitable market: about €272 profit per client and 15 branches (ERR, 23 Oct 2024: https://news.err.ee/1609500193/estonian-branch-is-swedbank-s-most-profitable).

---

## 9. Sweden (brief context only)

- **Becoming a business customer** (Aktiebolag; https://www.swedbank.se/foretag/bli-kund/aktiebolag.html):
  - The online application takes "cirka 45−60 minuter" and can be saved for up to 30 days.
  - **"Just nu tar det ungefär 4-6 veckor innan du hör från oss"** ("it currently takes about 4–6 weeks before you hear from us").
  - Steps: complete the application → register the company on verksamt.se → **deposit the share capital into the account number the bank gives you, then receive the *bankintyg*** (share-capital certificate) → **visit the branch** to get started with internet bank, app and phone service.
- **Prices:** **Företagspaketet annual fee 1,400 kr**; **connection fee for new business customers 2,500 kr** (same page).
- **Share capital:** "minst 25 000 kr" (same page).
- **Bolagsverket:** the registration fee changed on 19 June 2025 and the new amount is **unverified**; the e-service is said to be about 1 day versus about 5 days on paper (third-party, unverified).
- **Contrast for the pitch.** In Sweden the bank is on the critical path (the bankintyg is needed before registration), with a 4–6 week wait and a branch visit. In Estonia the state process is about a day and needs no bank, so the bank becomes the bottleneck *after* registration.

## 10. Other Baltic markets (brief)

- **Latvia.** swedbank.lv allows remote personal account opening with Smart-ID (qualified e-signature) or eID card. Remote business opening reportedly needs a resident individual Swedbank customer with sole representation rights (search snippet of https://www.swedbank.lv/private/d2d/accounts/openNewAccount?language=E; **unverified** for business).
- **Swedbank Group payments** across EE/LV/LT/SE/NO arrive "in the full amount" and are priced like SEPA in Estonia.
- Baltic management is moving to a Latvia-registered Baltic holding (ERR: https://www.err.ee/1608094831/swedbank-viib-baltikumi-juhtimise-latti; detail **unverified**).

---

## 11. Terminology glossary (English UI, with Estonian originals for flavour)

| English (as used by swedbank.ee) | Estonian | Use in the mockup |
|---|---|---|
| Everyday banking | Igapäevapangandus | Nav |
| Open an account / Open a new business account | Ava ärile konto / Avan konto | Onboarding CTA |
| Become a customer | Hakka kliendiks | Header |
| Start-up account | Stardikonto | Company-in-foundation account |
| Current account | Arvelduskonto | Account type |
| Group account | Kontsernikonto | Treasury |
| Monthly account fee | Konto kuutasu | Fees |
| Essential Plan / Purchase plan / Travel plan | (Plaanid) | Private plans |
| Business Debit Card / Business Credit Card / Business Gold Credit Card | Ärikliendi deebetkaart / krediitkaart | Cards |
| Debit card Plus; Revolving / Gold / Platinum credit card | | Private cards |
| Summary statement | Koondvaade (**unverified** Estonian label) | Home |
| Payment limits and user management | Maksete limiidid ja kasutajate haldus (**unverified**) | Settings |
| User rights and payment limits | | Business admin |
| Digital Services Agreement | Digiteenuste leping (**unverified**) | Legal container for rights |
| Information / Preparation of payments / Information and payments / All services / Agreement signing / Agreement signing with other user | | Role presets |
| Daily limit / Monthly limit / Instant payment limit | Päevalimiit / Kuulimiit | Limits |
| With double acceptance / Waiting second accept / Other user's accept required | | Approvals |
| Instant payment | Välkmakse | Payments |
| E-invoice / e-invoice standing order | E-arve / e-arve püsimakse | Bills |
| Standing order | Püsimakse | |
| Money request (link/QR) | Rahaküsimine | Get paid |
| Payment Link, Payment Portal, Swedbank Gateway | | Merchant and API |
| My Budget, Easy Saver, Micro Invest | | PFM |
| Enhanced due diligence fee | Tugevdatud hoolsusmeetmete tasu | Onboarding fee |
| Know Your Customer / Customer Questionnaire for Legal Entities | Tunne oma klienti | KYC |
| Smart-ID, Mobile-ID (Mobiil-ID), ID card, PIN-calculator, PIN1/PIN2, control code | | Auth |
| Traderoom | | Investing |

---

## 12. Implications for the redesign (Swedbank-side input to the concept)

1. **Company creation.** Swedbank could own an "OÜ in a day" companion flow:
   - Prefill from the Business Register with the registry code.
   - Signal contribution and VAT readiness.
   - Auto-invite board members.
   - Make the account live once every representative has signed with Smart-ID.
   - The data steps mirror RIK's 17 steps; the bank adds account, card, limits and team.
   - For non-resident owners, show the **€300 non-refundable fee, the 10-working-day clock, the document checklist and live status** up front. Today these are buried in a PDF and price list.
2. **Personal.** Address the top complaints:
   - A clear error taxonomy instead of "Tekkis viga", with status and ETA.
   - Durable biometric enrolment.
   - Native (not web-wrapped) limits and card controls.
   - A balance widget.
   - A "why did my limit change" explainer (the €700 ATM-limit cut).
3. **Team management.** Translate the real model (profiles, double acceptance, limits, IP/country allow-lists, suspension with an end date) into a GitHub/Vercel-style **members and roles** table:
   - Pending changes shown as a diff, with one Smart-ID signature and a second-signer queue.
   - An **audit log** that downloads ASiC-E signed containers.
   - Branch-only exceptions made explicit.
4. **Transparency.**
   - Show the 1,000 free payments as a **usage meter**.
   - Show the fee before you send, using the real price table.
   - Show plan comparisons inline.
   - Add a status page for outages and maintenance, such as the 15 Oct 2026 notice.
   - Show limit headroom (daily, monthly, instant).
   - Show KYC review status, for example "Questionnaire due in 14 days".

---

## 13. Unverified or uncertain items (explicit list)

- The Swedbank Headline designer (Stefan Hattenbach) and Rubik as the closest free match are visual and secondary-source judgments.
- Whether OÜ founders may still defer contributions (sources conflict; RIK says pay and confirm).
- Typical OÜ processing times (vendor data); the beneficial-owner 30-day update deadline; the annual-report deadline; the 1 July 2025 effective date of 24% VAT.
- Estonian UI labels marked "(unverified)" in the glossary.
- Montonio 6 Sept 2026 incident details (page 403). The exact date of the ERR "Thursday evening" outage (inferred late Sept 2024).
- No Reddit quotes (Reddit blocked automated access; search returned none).
- Latvian business remote-opening conditions; Bolagsverket's current fee.
- The "16…" prefix for new Estonian registry codes.

## 14. Key sources

**Brand and CSS**
- swedbank.ee CSS: https://www.swedbank.ee/webjars/webcomponents/4.0.0/assets/styles/shared-styles.min.css and https://www.swedbank.ee/shared.css
- swedbank.se CSS bundle (`/etc.clientlibs/wcms/...`) via https://www.swedbank.se/
- Logo SVG: https://www.swedbank.se/content/dam/global/brand/logotypes/8999-swedbank-logo-default.svg
- Swedbank Pay design repo: https://github.com/SwedbankPay/design.swedbankpay.com (files `src/App/Identity/identity/Color/swedbankpay-colors.js`, `src/less/variables-swedbankpay.less`, `src/less/components/button.less`)
- Logo history: https://logos-world.net/swedbank-logo/
- Purpose and values: https://www.swedbank.com/about-swedbank/strategic-direction

**Swedbank Estonia**
- Business account opening: https://www.swedbank.ee/business/d2d/accounts/open?language=ENG
- Opening documents PDF: https://swedbank.ee/static/pdf/business/d2d/accounts/info_account_openingdocs_eng.pdf
- User rights: https://www.swedbank.ee/business/d2d/ebanking/admin?language=ENG
- Business prices: https://www.swedbank.ee/business/useful/important/pricesrates?language=ENG
- Business price list PDF: https://swedbank.ee/static/pdf/business/d2d/start/tools/pricerates/Pricelist_ARI_eng_31_08_2026.pdf
- Business KYC: https://www.swedbank.ee/business/useful/bank/aml?language=ENG
- Private prices: https://www.swedbank.ee/private/home/more/pricesrates?language=ENG
- Private fee information document: https://swedbank.ee/static/pdf/private/home/useful/PAD_Teenuste_hinnakiri_eng_31_08_2026.pdf
- Become a private customer: https://www.swedbank.ee/private/d2d/accounts/becomeOurCustomer?language=ENG
- Security and fraud: https://www.swedbank.ee/private/d2d/ebanking/secureBanking?language=ENG

**Estonian state**
- RIK founding guide: https://abiinfo.rik.ee/index.php/en/node/230/
- RIK 2022 fee notice: https://abiinfo.rik.ee/en/uudised/state-fees-will-change-01012022
- e-Residency blog posts cited inline
- EMTA VAT pages cited inline

**Reviews**
- Apple iTunes Search and RSS (app id 434814718)
- Google Play: https://play.google.com/store/apps/details?id=com.swedbank&hl=en&gl=EE
- Trustpilot: https://www.trustpilot.com/review/swedbank.ee

**News**
- ERR and Postimees articles cited in §8
- Finantsinspektsioon market review: https://www.fi.ee/sites/default/files/2025-11/FI_EFT_2_2025_eng.pdf

**Sweden**
- https://www.swedbank.se/foretag/bli-kund/aktiebolag.html
