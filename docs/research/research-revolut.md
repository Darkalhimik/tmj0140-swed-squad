# Revolut UI/UX research for the Swedbank concept

Scope: the Revolut side only (Revolut personal app and web app, Revolut Business app and web app). This feeds a Next.js mockup that keeps Swedbank's orange, brown and cream but borrows Revolut's and Vercel's UI/UX patterns. The mockup covers four areas: business onboarding, personal account, account and team management, and transparency.

Research date: 2026-10-29.

## How to read this document

**Source access caveat.** WebFetch got HTTP 403 on revolut.com, help.revolut.com and developer.revolut.com, and community.revolut.com redirects. Revolut's own content therefore comes from search-engine extracts of those pages, which are cited by URL, plus third-party sources fetched directly. Help-centre wording also differs by region, so labels can vary slightly between markets.

**Confidence tags used throughout:**
- **[Official]**: Revolut help centre, blog, newsroom or developer docs, read through search extracts.
- **[3rd-party]**: a review, press article, design-token extraction or UX analysis.
- **[Community]**: posts on the Revolut community forum.
- **[Unverified]**: my own observation or common knowledge of the app that no source confirms. Check these against real screenshots (Mobbin or the live app) before relying on them in the pitch.

---

## 0. Executive summary: the ten things that matter most

1. **Revolut's brand is near-black on white, and colour carries meaning.** The primary colour is ink (`#191c1f`). Colour shows up only for semantic states, category icons and user-chosen backgrounds or themes. For Swedbank this maps directly: dark brown as ink, cream and white as canvas, and orange used only for the primary call to action, focus and highlights. [3rd-party]
2. **The type system is a large geometric display face with a neutral UI face.** Revolut.com uses Aeonik Pro (CoType Foundry) for display at weight 500 with tight negative tracking, and Inter for body text. It uses size rather than bold weight to create hierarchy. That the app UI uses Aeonik is [Unverified].
3. **Shapes are pills and soft cards.** Every button is a pill. Cards use roughly 20–24px radii. The marketing site has almost no shadows; depth comes from contrast between surfaces. [3rd-party]
4. **The home screen is built around one balance.** It shows one big balance with an "Accounts" switcher below it, then a row of round quick actions (**Add money · Move · Details · More**), a short transaction list, and customisable widgets. Revolut 10 (October 2023) added themes, widgets and backgrounds, and made account switching clearer. [Official, partly Unverified]
5. **Business onboarding is a stepped, self-serve KYB flow that takes about 10 minutes.** The order is: country and legal form → work email, phone and password → personal details → business details (address pre-filled from registries where available) → nature of business (purpose, category, description, customer types, maximum payment size, countries) → corporate structure, where each director and owner above 25% gets an invitation link valid for 14 days → ID plus video selfie → review. Review typically takes 3–24 hours, and complex structures take up to 5 business days. [Official]
6. **Team management combines role-based access with rule-based approvals.** There are 5 fixed roles (Owner, Admin, Accountant, Viewer, Member), and custom roles can set "no access / read-only / edit" per permission. Approval processes branch on amount: each tier can auto-approve, auto-reject or route to approvers (named people, roles or the requester's manager), with several rounds and an "Else" branch. Nobody can edit a rule that applies to themselves. [Official]
7. **Fees are shown before you confirm.** Revolut always shows its fee, exchange rate and estimated arrival before a transfer is sent. "Your plan" and "Your limits" show remaining allowances and the next reset date, which is anchored to the plan start date. [Official]
8. **Transactions use few, plainly explained states.** These are Pending (funds held), Completed, Reverted (returned automatically) and Declined. The Status section of a transaction shows the date when a pending payment will be reversed. Expenses have a richer lifecycle: missing_info → awaiting_review → approved, rejected, refund_requested or pending_reimbursement. [Official]
9. **The web app is a separate surface from the mobile app.** Business uses a left sidebar with Home, Transfers, Cards, Expenses, Bills, Team and a Settings gear (APIs, Integrations, Notifications). Bulk uploads only work on web. "Revolut Business 5" (spring 2025) was its "biggest redesign yet", with new navigation and more weight on card controls, approvals and change history. [Official/3rd-party; exact sidebar labels Unverified]
10. **Revolut's main weaknesses are an advantage for Swedbank.** The criticisms are home-screen clutter (one user counted 23 buttons and links), feature bloat, upsell notifications, features locked behind paid plans, and account freezes with no explanation and chat-only support. A bank-grade concept can position itself as "Revolut's clarity without Revolut's noise". [Community/3rd-party]

---

## 1. Visual design language

### 1.1 Typography

| Aspect | Finding | Confidence | Source |
|---|---|---|---|
| Display face | **Aeonik Pro** (CoType Foundry, by Mark Bloom and Joe Leadbeater) for headlines on revolut.com | 3rd-party, consistent across 4 extractions | [webdesignhot DESIGN.md](https://www.webdesignhot.com/api/design-md/revolut.md), [hagicode DESIGN.md](https://design.hagicode.com/designs/revolut/DESIGN.md), [Refero Styles](https://styles.refero.design/style/a3161c3c-26d4-425b-aaa3-4fc3f06b77ee), [fontalternatives (Aeonik)](https://fontalternatives.com/alternatives/aeonik) |
| Body/UI face | **Inter** at 400/600 (and 700 for links), 12–18px | 3rd-party | same |
| Weight strategy | Headings at **weight 500, never bold**. Hierarchy comes from size and tight tracking: −0.01em at 24–40px down to about −0.024 to −0.03em at 80–136px | 3rd-party | hagicode, Refero |
| Hero sizes | Display "mega" 136px with −2.72px tracking at line-height 1.0; hero 80–88px; section headings 48px; card titles 32px; feature titles 24px | 3rd-party | hagicode |
| Body | 16px Inter with slightly positive tracking (+0.16 to +0.24px) and 1.5 line-height | 3rd-party | hagicode |
| Money | One extraction proposes a `money` token at 56px, display face, weight 500, tabular numerals | 3rd-party (interpretive) | webdesignhot |
| Logo change | In March 2020 the wordmark moved to a new typeface and a deeper, more saturated blue, rolled out gradually | Press | [next.ink, 23 Mar 2020](https://next.ink/brief-article/revolut-change-de-logo-en-douceur/) |
| In-app font | Aeonik is said to be used "across app interfaces", but this is not confirmed by Revolut | Unverified | fontalternatives |

**What the type feels like:** the display text is calm, geometric and slightly condensed in feel, with very large numerals and quiet labels. The balance is the largest text on the screen. Cents or decimals are usually set smaller than the integer part (for example "€1,234" large with ".56" small) [Unverified, observed in app screenshots].

### 1.2 Colour usage

From third-party extractions of revolut.com, including tokens with a `--rui-*` ("Revolut UI") prefix ([hagicode](https://design.hagicode.com/designs/revolut/DESIGN.md)):

- **Ink and brand:** `#191c1f` near-black. Used for primary text, primary buttons, the footer and dark sections. One extraction says the brand colour *is* this near-black, not a hue ([webdesignhot](https://www.webdesignhot.com/api/design-md/revolut.md)).
- **Surfaces:** white canvas, `#f4f4f4` or `#f7f7f7` for recessed list and group backgrounds, `#c9c9cd` hairlines (`--rui-color-grey-tone-20`).
- **Text greys:** `#505a63` (secondary), `#8d969e` (muted), `#717173` (slate).
- **Semantic and accent tokens:** `--rui-color-blue #494fdf`, `--rui-color-danger #e23b4a`, `--rui-color-warning #ec7e00`, `--rui-color-teal #00a87e` (success-like), `--rui-color-light-blue #007bc2`, `--rui-color-deep-pink #e61e49`, `--rui-color-yellow #b09000`, `--rui-color-brown #936d62`.
- **Gradients:** a cobalt wash (`#1227fd → #6fa0ff`) appears only on promotional bars ([Refero](https://styles.refero.design/style/a3161c3c-26d4-425b-aaa3-4fc3f06b77ee)). In the app, gradients and imagery live in **user-selectable backgrounds and themes** behind the balance header, added in Revolut 10 ([Revolut 10 coverage](https://fintechnews.sg/78771/digital-banking-news-singapore/revolut-launches-its-biggest-update-yet-for-over-35-million-users/)).
- **Principle:** the marketing site stays near-black and white, and the semantic palette is kept for the product interface ([hagicode](https://design.hagicode.com/designs/revolut/DESIGN.md)).

### 1.3 Corner radii, cards and elevation

- **Buttons, tags, inputs and chips:** pill (`9999px`). Hover drops opacity to 0.85 ([hagicode](https://design.hagicode.com/designs/revolut/DESIGN.md), [Refero](https://styles.refero.design/style/a3161c3c-26d4-425b-aaa3-4fc3f06b77ee)).
- **Cards:** about 20px ([hagicode](https://design.hagicode.com/designs/revolut/DESIGN.md)), 22.5px ([Refero](https://styles.refero.design/style/a3161c3c-26d4-425b-aaa3-4fc3f06b77ee)), or 16px for bordered cards and 24px for "subtle" fill cards ([webdesignhot](https://www.webdesignhot.com/api/design-md/revolut.md)). **List containers** are about 20px with a mist fill. **Small controls** are 12px.
- **Elevation:** "zero shadows detected" on marketing pages. Depth comes from surface contrast and whitespace ([hagicode](https://design.hagicode.com/designs/revolut/DESIGN.md)). In the app, white cards sit on a light grey canvas, and bottom sheets are the main elevated layer [Unverified].
- **Spacing:** 8px base unit, compact density; card padding 24px, element gap 8px, section gaps 80–120px on marketing pages ([Refero](https://styles.refero.design/style/a3161c3c-26d4-425b-aaa3-4fc3f06b77ee)).

### 1.4 Iconography and imagery

- **Merchant logos** appear as round avatars in transaction rows. When there is no logo, a category icon on a tinted circle is shown instead [Unverified, observed]. Revolut has an "Improve merchant info" action (⋯ menu on a transaction) so users can correct a merchant's name ([Montonio help, 3rd-party](https://help.montonio.com/en/articles/640741-why-does-revolut-show-a-different-store-name-on-my-customer-s-payment)).
- **Category icons** are colour-coded per category, which is where the semantic palette above shows up [Unverified].
- **Card art** is shown as realistic card images: physical, virtual, single-use and metal cards. Tapping one makes it the visual focus (see Motion below).
- **Illustrations** are mostly 3D or photographic on marketing pages and in "bento" feature grids ([nicelydone components](https://nicelydone.club/apps/revolut/components)).

### 1.5 Density and large numerals

- The balance hero is the largest element on screen. Everything else is 14–17px list typography [Unverified].
- Lists use roughly 56–64px rows: avatar on the left, title and subtitle in the middle, amount on the right with the status or secondary currency underneath [Unverified].
- The community has criticised **too many calls to action at once**: "23 buttons / links on home screen" ([Revolut community "UI Overhaul" thread](https://community.revolut.com/t/ui-overhaul/147896?page=8)).

### 1.6 Glass and blur surfaces, and motion

- **The card-detail motion sequence** works like this: the surrounding controls blur, the bottom tab bar drops out of view, the card grows and sharpens into focus, and an action sheet appears. The principle is "one thing at a time gets attention" ([Motion the Agency analysis, 3rd-party](https://www.motiontheagency.com/blog/how-ui-animation-improves-user-experience)).
- **Onboarding motion** replaces long tutorials, for example a rotating globe with sliding currency coins (same source).
- **Status feedback** in payments and multi-step flows shows processing, success and failure states, and updates at every stage (same source).
- **Payment confirmation** uses a short animation plus a sound ([DeepInspire, 3rd-party](https://deepinspire.com/blog/the-role-of-microinteractions-in-fintech-design-a-closer-look-at-user-engagement)).
- **Number animation:** the balance does a rolling or ticking number transition when it updates [Unverified].
- **iOS 26 "Liquid Glass":** I found no evidence that Revolut has adopted it. Apple requires apps to support it by September 2026, so Revolut iOS may now use translucent tab bars [Unverified].

### 1.7 Dark mode

- Personal app: **Light / Dark / System** theme under Settings → Appearance since 2020, with full system theming on iOS and Android ([Revolut blog, "Turn down the lights"](https://www.revolut.com/blog/post/turn-down-the-lights-dark-mode-is-here/)).
- Business mobile app: dark mode launched in the September 2020 refresh ([FF News](https://ffnews.com/news/revolut-business-celebrates-500k-customers-with-a-refreshed-look-and-new-feature)).
- Revolut 10 added **themes** and **custom backgrounds** on top of light and dark ([Qorus](https://qorusglobal.com/content/19090-revolut-unveils-revolut-10-a-fresh-look-at-online-banking)).

### 1.8 Redesign timeline

| When | Release | What changed | Source |
|---|---|---|---|
| Mar 2020 | Brand refresh | New wordmark typeface and a deeper blue, rolled out gradually | [next.ink](https://next.ink/brief-article/revolut-change-de-logo-en-douceur/) |
| 2020 | Revolut 7.0 | Three primary tabs: Home, Wealth, Payments. Users complained the home screen showed only one transaction behind a small "See all" | [Revolut blog 7.0](https://www.revolut.com/blog/post/introducing-revolut-7-0/), [community](https://community.revolut.com/t/ui-overhaul/147896?page=8) |
| Sep 2020 | Business refresh | New interface and navigation, more mobile features, dark mode | [FF News](https://ffnews.com/news/revolut-business-celebrates-500k-customers-with-a-refreshed-look-and-new-feature) |
| 1 Dec 2020 | Personal Web App | Desktop access to balances and transactions, add money, freeze cards, support chat | [Revolut blog](https://www.revolut.com/blog/post/introducing-the-revolut-web-app/), [Finextra](https://finextra.com/newsarticle/37054/revolut-launches-web-app) |
| May 2021 | Business web app "spring clean" | Simpler navigation, a personalised experience, Marketplace apps (Xero, QuickBooks, Slack, Zapier) that can be pinned to the menu | [Crowdfund Insider](https://www.crowdfundinsider.com/2021/05/175417-digital-banking-revolut-business-web-app-has-been-updated-now-its-easier-to-work-with-marketplace-apps/) |
| ~2021 | Revolut 8 | Smart search bar at the top of tab pages; customisable home | [Crowdfund Insider](https://www.crowdfundinsider.com/?p=174709) |
| 10 Oct 2023 | **Revolut 10** | "Significant overhaul of the design and layout". All money on home; account and currency switching "with a tap"; **widgets** (cards, favourite recipients for 1-tap send); **themes and custom backgrounds**; simpler navigation; **Pockets** replace Vaults. Users opted in under Profile → New features | [Revolut news](https://www.revolut.com/news/revolut_launches_revolut_10_as_it_targets_primary_accounts_and_passes_35m_customers_worldwide), [Qorus](https://qorusglobal.com/content/19090-revolut-unveils-revolut-10-a-fresh-look-at-online-banking), [fintechnews.sg](https://fintechnews.sg/78771/digital-banking-news-singapore/revolut-launches-its-biggest-update-yet-for-over-35-million-users/), [IBS Intelligence](https://ibsintelligence.com/ibsi-news/revolut-announces-major-overhaul-of-primary-app-account), [Journal du Geek](https://www.journaldugeek.com/2023/10/12/revolut-fait-peau-neuve-avec-larrivee-de-revolut-10/) |
| Spring 2025 | **Revolut Business 5** | "Our biggest redesign yet" across web and mobile. Redesigned navigation, more automation, spend controls and integrations, and more weight on **card controls, approvals, change history and spending rules**. Also smart expenses, QR payments, multi-entity | [Revolut spring-25](https://revolut.com/en-GR/business/whats-new-spring-25), [finantresnoticias](https://finantresnoticias.com/negocios-y-autonomos/revolut-business-app-empresas-revisar-operar/), [connectingthedotsinfin.tech](https://www.connectingthedotsinfin.tech/inside-revolut-business-highlights-from-the-spring-2025-update/) |
| Autumn 2025 | Business autumn release | Automations, accounting integrations, virtual **company** cards in the business's name, new bill-pay methods | [Revolut what's new](https://revolut.com/en-NO/business/whats-new) |
| 9 Apr 2026 | **AIR** (AI by Revolut), UK first | Chat assistant for spending questions, FX, pausing recurring payments, freezing cards and setting limits. **Sensitive actions need biometric approval.** It only sees data the user can already see. Reportedly opened by swiping down from the centre of the home screen, or via Profile → Chats → AIR | [PYMNTS](https://www.pymnts.com/news/artificial-intelligence/2026/revolut-rolls-out-ai-assistant-for-daily-financial-tasks/), [Revolut news](https://www.revolut.com/news/revolut_enters_new_era_of_money_intelligence_with_launch_of_ai_assistant/); gesture per [Craft Innovations](https://craftinnovations.global/revolut-air-ux-analysis/) (search extract) |

### Patterns to adopt for the Swedbank concept: visual language

Map Revolut's *structure* onto Swedbank's *palette*:

| Revolut role | Revolut value | Swedbank concept token (values from the Swedbank agent) |
|---|---|---|
| Ink / primary button fill | `#191c1f` near-black | `--ink`: Swedbank dark brown |
| Canvas | `#ffffff` | `--canvas`: white (web app content) or cream (mobile home canvas) |
| Recessed list background | `#f4f4f4` / `#f7f7f7` | `--surface-sunken`: light cream |
| Hairline | `#c9c9cd` | `--border`: warm grey-beige |
| Accent (CTA, focus, selected) | blue `#494fdf` | `--accent`: Swedbank orange. **Use it sparingly**: primary CTA, focus ring, active nav indicator, progress |
| Semantic | danger `#e23b4a`, warning `#ec7e00`, success teal `#00a87e` | Keep separate semantic hues. **Warning must not be confused with brand orange**: use amber or yellow for warning and red for danger, and always pair the colour with an icon and label |

1. **Type pairing.** Use a geometric grotesk for display and money (a licensed Aeonik equivalent, or Swedbank's own brand face if the Swedbank agent confirms one) at **weight 500 with negative tracking**. Use Inter or system UI for body text. Use `font-variant-numeric: tabular-nums` for every amount.
2. **Money display component `<Amount>`.** Props: `value`, `currency`, `size: hero|lg|md|sm`, `showSign`, `muted`. In the hero size, render the integer part at 44–56px and the decimals at 60% size, top-aligned. Show the currency symbol in the locale position (`1 234,56 kr` for SEK, using a thin-space thousands separator). For negative values use a minus sign with no colour. **Use green only for incoming amounts (+)**, which matches Revolut's convention of plain outgoing and highlighted incoming [Unverified].
3. **Shapes.** Pill buttons at 44–48px height. Cards at 20px radius. Sheets and drawers at 24px top radius. Inputs either pill-shaped (Revolut) or 10–12px (Vercel style); pick one and apply it everywhere.
4. **Elevation.** No drop shadows on cards; separate them with surface contrast (white card on cream). Shadows only on floating layers (sheets, popovers, toasts).
5. **Personalisable home header.** Offer 3–4 curated Swedbank backgrounds (warm orange gradient, brown, cream, photographic Swedish landscape) instead of fully free themes. This keeps the brand consistent.
6. **Motion rules.**
   - Bottom sheets slide up at 240–320ms on a spring curve, with the backdrop blurring to about 8px.
   - The balance does a rolling digit transition, with `prefers-reduced-motion` respected.
   - The card-focus sequence copies Revolut's: blur the context, hide the tab bar, scale the card, then show the action sheet.
   - Show success as a check-mark morph, not confetti, which suits a bank's tone.
7. **Dark mode from day one.** Offer Light / Dark / System. In dark mode, brown becomes the surface family (deep brown-black) and orange stays the accent. Check text contrast on orange buttons in both themes.

---

## 2. Personal account UX

### 2.1 Home screen anatomy

| Region | Element | Confidence and source |
|---|---|---|
| Top bar | Profile avatar (top-left: plan, limits, settings, help), a **search** field or icon, and shortcuts to **analytics** and **cards** on the right | Search at top-left in 2018 ([Revolut blog](https://www.revolut.com/en-US/blog/post/you-can-now-search-for-your-transactions/)); "smart search bar at the top of tab pages" in v8 ([Crowdfund Insider](https://www.crowdfundinsider.com/?p=174709)); "your profile icon in the top-left corner → Your plan / Your limits" ([help extract](https://help.revolut.com/en-SE/help/wealth/exchanging-money/how-much-does-it-cost-to-make-an-exchange/will-i-be-charged-for-exchanging-foreign-currencies)). Exact right-hand icons are [Unverified] |
| Balance hero | Label for the account or currency (e.g. "Personal · EUR"), a **large total balance**, and a pill-shaped **"Accounts"** button below the balance that opens the account and currency switcher, including Pockets and joint accounts | [Official]: "go to Home, tap Accounts, pick the currency, then below your balance, tap 'Details'" ([help](https://help.revolut.com/help/transfers/inbound-transfers/how-to-receive-money-from-another-bank/what-account-details-should-i-use-to-transfer-money-to-my-revolut-account/what-account-details-are-available-for-me)) |
| Quick actions | A row of round icon buttons with labels: **Add money**, **Move** (between accounts and pockets), **Details** (IBAN/BIC), **More** (⋯: statements, exchange, etc.) | "Add money" on Home ([help](https://help.revolut.com/en-US/help/adding-money/how-can-i-add-money-to-my-revolut-account)); "Move" via Accounts → account → Move ([help](https://help.revolut.com/help/more/revolut-pro/add-funds-to-my-pro-account/)); "Details" below the balance (above). The "More" label is [Unverified] |
| Recent transactions | A card showing the **last 3 transactions** with "See all". Earlier versions showed only one | [Community](https://community.revolut.com/t/ui-overhaul/147896?page=12) |
| Widgets | Optional and rearrangeable: Cards, favourite recipients ("send money with 1 tap"), spending this month (spend or income versus the previous period), Pockets, Total wealth, Insights | [fintechnews.sg](https://fintechnews.sg/78771/digital-banking-news-singapore/revolut-launches-its-biggest-update-yet-for-over-35-million-users/); analytics widget ([help](https://help.revolut.com/en-JP/help/accounts/budget-and-analytics/how-can-i-see-my-spending-and-income-analytics/)); Total Wealth widget ([help](https://help.revolut.com/help/accounts/budget-and-analytics/what-is-the-analytics-dashboard/)) |
| Bottom tab bar | Home, Invest, (Transfers/Payments), Crypto, (Lifestyle/Hub) | 'Home', 'Invest', 'Crypto' and 'Transfer' are referenced in help pages ([help](https://help.revolut.com/help/wealth/cryptocurrencies/crypto-payments/where-can-i-find-my-crypto-card-payments/)). The full set is [Unverified] and varies by market and version. Users asked to customise it ([community](https://community.revolut.com/t/new-ui-impressions/238851)) |
| AI entry | Swipe down from the centre of home opens AIR (2026) | [3rd-party, Unverified] |

### 2.2 Transaction list

- **Grouping** is by day ("Today", "Yesterday", then dated headers), sometimes with a daily total [Unverified, observed].
- **Row anatomy:** merchant logo or category icon · merchant name · time and/or category/card subtitle · amount on the right, with the original foreign currency below it when converted [Unverified].
- **States** [Official]:
  - **Pending:** the payment is authorised and the funds are held until the merchant collects them. It normally clears within a few business days and rarely stays pending for up to 30 days. Revolut tells users to open the transaction and check the **'Status' section, which shows the reversal date** ([help](https://help.revolut.com/help/card-payments-withdrawals/paying-by-card-issues/why-is-my-card-payment-pending), [blog](https://Revolut.com/blog/post/what-does-a-pending-transaction-mean/)).
  - **Completed:** the merchant has collected the funds.
  - **Reverted:** the merchant cancelled or never claimed the funds, and the money is returned automatically. "You don't need to take action" ([help](https://help.revolut.com/en-AU/help/card-payments-withdrawals/paying-by-card-issues/declined-card-payments/why-has-my-card-payment-been-reverted/)).
  - **Declined:** shown with a reason, such as a geolocation mismatch ([help](https://help.revolut.com/en-AU/help/card-payments-withdrawals/paying-by-card-issues/declined-card-payments/payment-declined-due-to-geolocation-mismatch/)) or a limit reached.
- Outgoing bank transfers can stay **pending for up to 72 hours** but normally complete within a few hours ([help](https://help.revolut.com/help/transfers/outbound-transfers/having-an-issue-with-sending-money/why-is-my-transfer-still-pending/)).

### 2.3 Transaction detail sheet

Opens as a full-height sheet:

1. **Header:** a **map of the merchant location** for card transactions ([community](https://community.revolut.com/t/map-shows-luxembourg-mews-london-instead-of-luxembourg-city-or-country/55089)), then the merchant logo, name, amount and date.
2. **Status section:** Pending, Completed or Reverted, with the reversal date while pending [Official].
3. **Details:** card used (last 4 digits), exchange rate and fee if converted, original amount [Unverified ordering].
4. **Category:** tap to change it, then choose **"All from this merchant"** or **"Only this transaction"**, or create a custom category ([help](https://help.revolut.com/help/accounts/budget-and-analytics/how-to-assign-and-adjust-categories-for-your-transactions/)).
5. **"Exclude from Analytics"** toggle. It has been removed and restored in some versions, which upset users ([help](https://help.revolut.com/en-AU/help/app-features/budgeting-and-analytics/how-can-i-exclude-a-transaction-from-my-analytics-budget/), [community](https://community.revolut.com/t/lost-ability-to-toggle-transactions-out-of-analytics/94682)).
6. **Split bill:** split equally or by **Items**, where the user scans or uploads a receipt and AI extracts the line items. Receipts are kept for 60 days and visible to participants ([help](https://help.revolut.com/en-US/help/transfers/internal-transfers/splitting-bill-using-receipts/)).
7. **Receipts:** attach a receipt. Deleting it is permanent (same help page).
8. **Get help / dispute:** "Get help" → choose the issue → form, with the option to add more transactions. The flow first advises contacting the merchant ([help](https://help.revolut.com/en-JP/help/card-payments-withdrawals/refunds/dispute-a-card-transaction/), [help AU](https://help.revolut.com/en-AU/help/card-payments-withdrawals/refunds/dispute-a-card-transaction/)).
9. **⋯ menu:** "Improve merchant info", statement or receipt download [3rd-party/Unverified].

### 2.4 Analytics, insights and budgets

- Spending breakdown by **day, week, month or year**; by **category, merchant and place/country**; compared with the **previous period** ([help](https://help.revolut.com/help/app-features/budgeting-and-analytics/how-does-the-analytics-feature-work/)).
- **Budgets:** an overall monthly budget plus per-category goals. The bar or ring turns **red** as the user heads toward overspending ([help](https://help.revolut.com/help/app-features/budgeting-and-analytics/how-can-i-control-my-spending-with-the-budgeting-feature), [2019 blog](https://www.revolut.com/blog/post/introducing-new-and-improved-analytics/)). The analytics period can start on payday rather than the 1st.
- Home widgets show spend or income and the change versus the previous period ([help](https://help.revolut.com/en-JP/help/accounts/budget-and-analytics/how-can-i-see-my-spending-and-income-analytics/)).
- Per-category budgets may be limited to paid plans ([freenance, 3rd-party](https://freenance.io/integrations/revolut-budget-tracking-complete-guide-2026/)).
- Criticism: "Weekly Insights feature is useless, especially on the home screen" ([community](https://community.revolut.com/t/ui-overhaul/147896?page=8)).

### 2.5 Pockets

Sub-accounts for setting money aside (bills, goals). They replaced Vaults in Revolut 10 and show up in the account switcher ([Qorus](https://qorusglobal.com/content/19090-revolut-unveils-revolut-10-a-fresh-look-at-online-banking)).

### 2.6 Cards screen

- **Path:** Cards → select card → Settings → Security ([help](https://help.revolut.com/help/card-payments-withdrawals/ping-other-card-security-settings/card-security-settings)).
- **Toggles** [Official]:
  - **Freeze/unfreeze:** instant, for a misplaced card.
  - **Location-based security:** compares the phone's GPS with the terminal; physical cards only.
  - **Online transactions.**
  - **Swipe payments (magstripe).**
  - **ATM withdrawals.**
  - **Contactless:** with a **"Reset limit"** action for the cumulative contactless limit.
- **Virtual cards:** up to about 20 active virtual cards, with a limit on new ones per 30 days. **Single-use (disposable) cards** regenerate their details after each use (or after 24 hours), can't be used for subscriptions or pre-authorisations, and only one can be active at a time ([help BR](https://help.revolut.com/en-BR/help/cards/card-order/can-i-have-multiple-cards/), [help JP](https://help.revolut.com/en-JP/help/cards/card-order/getting-a-virtual-cad/are-there-any-limits-to-using-disposable-virtual-cards/)).
- **Show PIN, show card details, block or unblock PIN**: also available on the web app ([aziendabanca](https://www.aziendabanca.it/notizie/revolut-web)).
- **Spending limits per card** (monthly), set by the user [Unverified, personal]. In AIR, users can freeze cards and set limits through chat after biometric approval.
- The card-detail focus animation is described in §1.6.

### 2.7 Notifications

- Transaction and transfer push notifications are controlled in the **OS settings**. Only marketing notifications are controlled in the app ([help](https://help.revolut.com/en-JP/help/profile-and-plan/profile-plan/notifications/how-do-i-manage-my-notifications/)).
- **3D Secure** approval happens in the app ("approve this payment") ([community/help summary](https://community.revolut.com/t/push-notification-on-spend/5401)).
- **Context-aware notifications:** "welcome home" after a trip, and insurance prompts when the user enters a new country ([substack](https://nesrinechanguel.substack.com/p/the-revolut-delight-case-study-1c3), [flameeyes](https://flameeyes.blog/2019/03/24/is-revolut-still-a-good-thing/?amp=1)). The second kind is criticised as upselling.
- Some users report missing push notifications for chip and contactless payments ([community](https://community.revolut.com/t/push-notification-on-spend/5401)).

### 2.8 Search

Search covers merchant, category and amount ([2018 blog](https://www.revolut.com/en-US/blog/post/you-can-now-search-for-your-transactions/)). In v8 it became a "smart search bar" at the top of tab pages that also finds features [3rd-party]. A date filter is [Unverified].

### Patterns to adopt for the Swedbank concept: personal account

**A. `<BalanceHero>`**
- **Anatomy:**
  - Background slot: a cream-to-orange warm gradient or a chosen theme.
  - Context label: "Privatkonto · SEK", with a small chevron.
  - `<Amount size="hero">`.
  - A secondary line showing either "+1 240 kr this month" or "Available 12 430 kr · Booked 12 980 kr". The second option is a transparency upgrade over Revolut, because Swedish banks distinguish *disponibelt* (available) from *bokfört* (booked).
  - A pill **"Accounts ▾"** below.
- **States:** loading (skeleton digits), hidden balance (tap the eye to mask as "•••• kr"; Revolut users ask for this), multi-currency (shows the converted total, with "≈" when FX applies).
- **Microcopy:** "Total across 4 accounts", "Includes 2 pending payments (−349 kr)".

**B. `<AccountSwitcher>`** (bottom sheet)
- **Anatomy:** a list of accounts and pockets, each with an icon, name, last-4 or IBAN tail, and balance. Pinned "Total" at the top, then "+ New pocket / account" at the bottom.
- **States:** selected (orange check), frozen account (lock badge, muted), joint account (two stacked avatars).

**C. `<QuickActions>`** (exactly 4, never more)
- **Items:** **Add money** · **Move** · **Details** · **More**. Swedish: *Sätt in · Flytta · Kontouppgifter · Mer*.
- **Anatomy:** a 48–56px round button (cream fill, brown icon) with a 12–13px label below.
- **"More" sheet:** Statements, Exchange, Standing orders, Swish, Account settings.

**D. `<TransactionList>`**
- **Day headers:** "Today", "Yesterday", "Mon 27 Oct", each with an optional day total on the right in muted text.
- **Row:** 40px avatar (merchant logo, or category icon on a tinted circle) · title · subtitle "Card ••4821 · Groceries" · right column: amount, plus status or original currency below.
- **Status chips** (text and icon, never colour alone):
  - `Pending`: clock icon, muted amount, with "Reserved" as the subtitle. The Swedish term *Reserverat* matches existing bank language.
  - `Reverted`: amount struck through, with the "Returned" label.
  - `Declined`: red label, amount muted and struck.
  - Incoming: green "+" amount.
- **Microcopy (pending tooltip):** "The shop has reserved this amount. It usually settles in 1–3 days. If it doesn't, it's released automatically on 12 Nov."

**E. `<TransactionDetailSheet>`**
- **Order:**
  1. Map or merchant header.
  2. Amount and status timeline (Authorised → Settled, or Authorised → Released, each with a timestamp).
  3. "Paid with": the card.
  4. **Fee & FX block** (always present, even if it says "No fees").
  5. Category (with an "apply to all from this merchant" choice).
  6. "Exclude from insights" toggle.
  7. Notes and receipt.
  8. Actions: Split, Get help, Report merchant name.
- **Microcopy:**
  - "No fees on this payment."
  - "Exchange rate 1 EUR = 11,52 SEK (incl. 0,5 % markup). You paid 1 152,00 kr."
  - "Something wrong? Most issues are fastest solved with the shop — here's how. Or dispute this payment."

**F. `<InsightsCard>` / `<BudgetMeter>`**
- **Anatomy:** a horizontal bar or ring showing spent versus budget. The colour moves from neutral to amber at 80% to red above 100%, and the text always states the numbers.
- **Microcopy:** "You've spent 6 420 of 8 000 kr on Groceries · 9 days left", "1 240 kr more than last October".

**G. `<CardControls>` panel**
- **Anatomy:**
  - Card art at the top, with flip or reveal of details behind biometric or BankID authentication.
  - A large **Freeze** toggle row (primary).
  - A "Security" group: Online payments · Contactless · ATM withdrawals · Magstripe · Location-based security.
  - A "Limits" group: per-transaction, monthly, ATM, each with a `<LimitMeter>`.
  - PIN: Show PIN / Change PIN.
  - Replace card.
- **States:** frozen (card art greyed with a lock overlay and the banner "Card frozen — payments will be declined until you unfreeze"), ordered or shipping (timeline), expired.
- **Microcopy (toggle off):** "Online payments off — your card will decline web and in-app purchases. Apple Pay still works."

**H. `<GlobalSearch>` / command palette** (⌘K on web, pull-down on mobile)
- Searches transactions (merchant, amount "349", category), **features** ("freeze card", "statement", "IBAN"), and recipients.

**I. `<NotificationSettings>`** (in-app, unlike Revolut)
- Per channel and event (card payments, incoming money, low balance below X kr, large payments above Y kr, sign-ins). Marketing is **off by default**.

---

## 3. Business onboarding and company sign-up (Revolut Business)

### 3.1 Eligibility and pre-conditions

- The company must be **fully incorporated and active** in a supported country (UK, EEA, US, AU, CH, SG, among others), operate in a supported industry, and have no other active Revolut Business account for the same company ([help AU](https://help.revolut.com/en-AU/help/setting-up-an-account/is-my-business-eligible/why-is-my-account-not-eligible/business/), [help](https://help.revolut.com/business/help/setting-up-an-account/is-my-business-eligible/why-is-my-account-not-eligible/)).
- **No company formation inside Revolut.** Users form the company first, then apply. Partners bundle the two: **Sleek** offers UK incorporation plus a one-month free Revolut Business trial ([sleek.com](https://sleek.com/uk/?p=86748)), and **1st Formations** has guidance on opening a Revolut Business account after formation ([1st Formations help](https://support.1stformations.co.uk/hc/en-gb/articles/16151189034397-How-quickly-can-I-open-a-Revolut-business-account)). Wise, a competitor, offers formation and account in one go. This is an **opportunity for Swedbank**, which could combine Bolagsverket registration with account opening.

### 3.2 Sign-up steps, as consolidated from official guide and help extracts

Revolut's "Get started guide" frames the flow as **5 steps: Identity check → Business details → Business address → Nature of business → Business owners** ([Revolut onboarding guide](https://www.revolut.com/business/business-resources-onboarding-guide/), [en-SE](https://www.revolut.com/en-SE/business/business-resources-onboarding-guide/), [en-US](https://www.revolut.com/en-US/business/business-resources-onboarding-guide/)). The full detail:

| # | Step | What's asked / UI | Source |
|---|---|---|---|
| 0 | Start | Web sign-up page or the Revolut Business app. **The form takes about 10 minutes** | [statrys](https://statrys.com/reviews/open-revolut-business-account), [anna.money](https://anna.money/blog/guides/how-to-open-revolut-business-account/) |
| 1 | Country and legal form | Country of incorporation and "corporate structure" (legal type) | statrys |
| 2 | Account credentials | Work email or Google/Apple sign-in, **6-digit email code** (with an account-recovery card and a "go back to your original tab" success screen), phone verification code, password. **Pre-fills personal details** if the user already has a personal Revolut account | statrys; screens on [nicelydone](https://nicelydone.club/apps/revolut) |
| 3 | Personal details | Full name, date of birth, residential address | statrys |
| 4 | Business details | Legal type, **registration number**, company name, country, incorporation date, **tax ID**, optional **trading name**. If the company can't be found, upload an incorporation certificate or registry extract | [onboarding guide (et-EE)](https://www.revolut.com/et-EE/business/business-resources-onboarding-guide/), search summary |
| 5 | Business address | **Registered vs operating address** shown separately. "If this information is available in public registries, we'll fill it in for you." Proof of operating address: rental agreement, utility bill or bank statement, dated within about 3 months | onboarding guide (et-EE, en-SG) |
| 6 | Nature of business | Screens seen on nicelydone, in order: **primary purpose of the account** (checkboxes) → **category** (list, then sub-category) → **description of business activity** (text area **with a minimum-length validation error**) → **target customer types** (individuals / businesses) → **estimated maximum single payment per month** → **countries of operation** (searchable modal). The US guide adds industry and sector, regulated status, **website or online presence**, **annual turnover and company size**, sales channels, and **intended purpose with estimated monthly volumes** | [nicelydone](https://nicelydone.club/apps/revolut), [en-US guide](https://www.revolut.com/en-US/business/business-resources-onboarding-guide/), [help: nature of business](https://help.revolut.com/business/help/setting-up-an-account/onboarding/nature-of-business/what-should-i-provide-to-verify-the-nature-of-my-business/) |
| 7 | Proof of activity | Live website, invoices from the last 6 months matched to a bank statement, contracts, financial statements, or proof of regulation | en-US guide |
| 8 | Business owners / **Corporate structure** | Map the structure **up to the ultimate beneficial owners**, including any companies in the chain. A **'Corporate structure' tile** on Home opens the **'Add directors and shareholders'** screen → **'+' Add new** → choose **'Director'** or **'Shareholder'** (a person or a company) → confirm the structure. Verification is required for **all directors and all shareholders above 25%, direct or indirect** | [help: requirements](https://help.revolut.com/business/help/setting-up-an-account/onboarding/directors-and-shareholders/what-requirements-are-there-for-beneficial-owners-and-directors/), [help: verify corporate structure](https://help.revolut.com/business/help/setting-up-an-account/onboarding/directors-and-shareholders/what-should-i-provide-to-verify-my-shareholders-structure/) |
| 9 | Each person's verification | Two choices: **fill in their details on their behalf**, or **'Verify details' → select the person → send an email or link**. **The link is valid for 14 days.** If it expires, delete the person and add them again, which sends a new invite. There is also a "Business owners" section in the application's **'Request' tab** | [help: resend invitation](https://help.revolut.com/business/help/setting-up-an-account/onboarding/directors-and-shareholders/how-can-i-resend-an-invitation-or-invite-my-shareholders-or-directors) |
| 10 | Identity check | National ID, passport or driving licence plus a **video selfie**, completed in one live session. Documents must be uncropped with no watermarks. If the applicant is not a director or shareholder, they need **proof of authority** (an authorisation letter). Personal app KYC microcopy example: "Checking image quality" | onboarding guide (UK), [raw.studio](https://raw.studio/blog/how-revolut-uses-4-onboarding-ux-tactics/) |
| 11 | Review | "We aim to review within 24 hours." It is **usually within 3 hours**, with messages in the app or web app if documents are missing. **Complex structures take up to 5 business days.** A **'Verifying'** status that won't clear usually means a director or shareholder hasn't completed their part | [help: apply](https://help.revolut.com/business/help/setting-up-an-account/creating-a-business-account/), [help: corporate structure delayed](https://help.revolut.com/business/help/setting-up-an-account/onboarding/directors-and-shareholders/corporate-structure-verification-failed-or-stuck-in-verifying-state/) |
| 12 | Approved | Account details are issued: GBP sort code and account number plus a EUR IBAN (UK companies), and SWIFT for other currencies. The plan can be chosen or changed after this | statrys |

### 3.3 How progress is shown

- **Tile-based checklist on the Home of an unapproved account.** Each outstanding requirement is a tile, such as "Corporate structure". Failure reasons appear on Home ([help: corporate structure](https://help.revolut.com/business/help/setting-up-an-account/onboarding/directors-and-shareholders/what-should-i-provide-to-verify-my-shareholders-structure/)).
- **Per-person statuses** in the corporate structure: not started, invited, details provided, **Verifying**, verified [Official in part; the exact chip labels are Unverified].
- A **'Request' tab** inside the application holds follow-up requests from the onboarding team. The team may also send a set of **follow-up questions** about the nature of business ([help](https://help.revolut.com/en-US/business/help/setting-up-an-account/onboarding/nature-of-business/)).
- Linear top progress bar or stepper: [Unverified]. The guide uses the five named steps.

### 3.4 What happens while waiting

- **The account can't be used before approval.** Account details are issued only after onboarding confirms the application ([community](https://community.revolut.com/t/why-was-my-revolut-business-application-rejected/240236)).
- Communication goes through in-app messages and chat. Users report frustration when applications stall or are rejected with no explanation (same thread).
- Revolut's **Admin set-up guide** recommends an order for once the account is live: invite other Admins → create **spend programs** and **approval processes** → invite the team → issue cards ([Admin set-up guide](https://www.revolut.com/business/business-resources-admin-set-up-guide/)). The concept should let users **do this configuration while the account is under review**. Revolut doesn't.

### 3.5 After onboarding

- **Changing ownership** later happens on the web app only (Settings), with a supporting document ([help](https://help.revolut.com/business/help/profile-and-setting/business-profile/change-business-ownership-structure/)).
- **Multiple businesses:** the same email and phone can open several Business accounts, each with a unique registration number. They can then be **linked and switched** by tapping the account name. Switching asks for re-authentication: the passcode on mobile, or password plus email 2FA on web ([help](https://help.revolut.com/business/help/setting-up-an-account/multi-business-accounts/how-can-i-link-an-additional-revolut-business-account/)).

### Patterns to adopt for the Swedbank concept: business onboarding

**A. `<OnboardingShell>`** (Vercel-style split layout on web)
- **Layout:** the left rail is a vertical stepper with 6 steps: *Company · You · Business activity · Owners & directors · Verification · Review*. Each has a status icon: ✓ done, ● current, ○ todo, ⚠ needs attention. The right side shows one question group per screen, with a sticky footer holding "Back" and "Continue" (orange pill).
- **Header:** "Takes about 8 minutes · Your progress is saved automatically".
- **Mobile:** a slim top progress bar plus "Step 3 of 6".

**B. `<CompanyLookup>`** (registry-backed combobox)
- Enter an organisation number (*organisationsnummer*, e.g. 559xxx-xxxx) or a name. Results come from Bolagsverket or Roaring/Creditsafe in the mock, showing name, org no., legal form (AB, HB, EF), registered address, status (Active / Liquidation), and SNI code.
- On selection, a **pre-filled summary card** appears with "From Bolagsverket" provenance badges on each field: legal name, org no., registration date, registered address, SNI industry codes, board members and signatories.
- **Microcopy:** "We found your company in Bolagsverket. Check the details — you can't edit registry data here, but you can add a trading name."
- **This beats Revolut**, which asks for manual entry with only the address pre-filled.

**C. "Don't have a company yet?" fork** (Swedbank advantage)
- A card on step 1: "Start a new aktiebolag with us — we'll register it with Bolagsverket and open your account in one flow." The flow shows the share-capital deposit (min. 25 000 kr) and generates the *bankintyg* (bank certificate) that Bolagsverket requires. It then shows the registration status as a timeline. The mechanics need to be checked with the Swedbank research agent.
- This fills the gap Revolut leaves to partners like Sleek.

**D. `<NatureOfBusinessForm>`** (copy Revolut's micro-screens, one question per screen on mobile)
- Purpose of account (multi-select chips: Receive payments from customers · Pay suppliers · Pay salaries · Card spending · Save/invest · International payments).
- Industry (searchable, SNI pre-selected from the registry).
- "Describe what your company does": a text area with a live character counter, a 50-character minimum, and an inline example placeholder.
- Customers: Consumers / Businesses / Both.
- Expected monthly volume: segmented bands, e.g. *< 100 000 kr · 100 000–1 M · 1–10 M · > 10 M*.
- Largest single payment.
- Countries you'll pay or get paid from: multi-select with search, with Sweden pre-selected.
- Website (optional, validated).
- **Microcopy:** "Why we ask: banks are required by law to know how accounts will be used (KYC/AML). Accurate answers mean fewer follow-up questions."

**E. `<OwnershipTree>`** (Revolut's best idea, made visual)
- **Anatomy:** a node graph with the company at the root, directors as one group, and owners as nodes with % edges. Corporate owners can be expanded to their own owners. Pre-filled from Bolagsverket (board) and the *Verklig huvudman* register (beneficial owners).
- **Each person node carries:**
  - Role chips: Board member, CEO, Signatory, Beneficial owner 25%+.
  - A **verification status chip**: `Not invited` · `Invited · expires in 12 days` · `In progress` · `Verified ✓` · `Action needed ⚠`.
- **Actions per node:** "Verify with BankID now" (if it's the current user) · "Send invite" (email/SMS link) · "Resend" · "Fill in for them".
- **Microcopy:** "We need to verify everyone who owns more than 25 % or sits on the board. 2 of 3 verified."

**F. `<VerificationStep>`**
- Use **BankID** for Swedish residents instead of an ID photo and selfie: it is instant and familiar. Fall back to passport plus video selfie for non-residents, with Revolut-style live feedback such as "Checking image quality…" and "Move closer — your face isn't fully visible".

**G. `<ApplicationStatusTracker>`** (after submit)
- **Timeline:** Submitted (14:02) → Automated checks (✓ 14:03) → Owners verified (2/3, waiting on *Anna Berg*) → Manual review (usually < 4 h) → Account ready.
- **Microcopy:**
  - "Average review time this week: 3 h 20 min."
  - "We'll notify you by SMS and email."
  - "Nothing for you to do right now."
- If something is needed, show a top banner: "We need 1 document — upload a recent invoice (≤ 6 months)", with the due date and a direct upload.

**H. `<SandboxWhileWaiting>`**
- A dashboard preview with a "Pending approval" ribbon. The user can already invite teammates (invites queue until approval), set up roles, approval rules and spend policies, connect accounting (Fortnox/Visma), and order cards (they ship on approval).
- **Microcopy:** "Your account is being reviewed. Meanwhile, set things up — everything goes live the moment you're approved."

---

## 4. Business account management (team, roles, permissions, approvals)

### 4.1 Roles and permissions

- **5 default roles that can't be edited** ([help](https://help.revolut.com/en-US/business/help/managing-my-business/users-and-employees/setting-permissions/)):
  - **Owner:** full access; only 1 per account.
  - **Admin:** full access to features and apps; "co-owners, finance directors".
  - **Accountant:** financial operations; "internal accountants".
  - **Viewer:** read-only across features and apps; "external bookkeepers".
  - **Member:** only their own cards and information; "employees spending on business expenses".
- **Custom roles:** Team → Settings → Roles → New. Each permission has an access level: **no access / read-only / edit** ([Roles & Permissions page](https://www.revolut.com/en-FI/business/roles-permissions)). Example permission names: "Manage team members", "Send money", "Manage cards", "Manage accounts", "API & Integrations", "View cards", "Manage users" ([help](https://help.revolut.com/business/help/managing-my-business/users-and-employees/how-can-i-set-payment-approval-rules/), [developer docs](https://developer.revolut.com/docs/guides/manage-accounts/teams/manage-team-members)). Custom roles can only be created in the app, not through the API.
- **Guardrails:** members **can't edit their own role** even with "Manage team members" ([search extract of help](https://help.revolut.com/en-IS/business/help/managing-my-business/users-and-employees/setting-permissions/)). **Ownership transfer** can't be done by the Owner. Another Admin initiates it, and only verified Admins are eligible ([help](https://help.revolut.com/business/help/managing-my-business/users-and-employees/how-can-i-pass-ownership-of-my-account-to-another-person-in-the-company/)).

### 4.2 Team invite flow

1. Someone with the "Manage team members" permission goes to **Team → Invite** and enters one or several emails. An email can't already belong to another Revolut Business account.
2. **Pick a role**, and optionally **assign a card and spend controls** in the same step.
3. The invitee gets an email, accepts it, creates login credentials and enters personal details.
4. **Admin and Accountant roles must verify identity** with ID plus a video selfie in one live session. Member may not need to, depending on permissions. Country-of-residence restrictions may apply.
5. Lifecycle: an owner or admin can **Suspend** a member (temporary) or **Delete** them (permanent) from Team → profile. A wrong document is fixed by deleting the invited profile and re-inviting.

Sources: [help: invite](https://help.revolut.com/business/help/managing-my-business/users-and-employees/how-can-i-add-a-new-team-member/), [help: team member verification](https://help.revolut.com/business/help/setting-up-an-account/identity-verification-proof-of-authority/what-s-the-identity-verification-process-for-team-members/), [Admin guide](https://www.revolut.com/business/business-resources-admin-set-up-guide/). The Team Members API (invite by API) is available in the UK, US and EEA on request ([developer docs](https://developer.revolut.com/docs/business/invite-team-member)).

### 4.3 Org structure

**Departments and reporting lines.** Select one or more members → **Assign manager** or **Assign departments**, and manage departments under Team → Settings. Approval rules can then route "to the requester's manager" ([Admin guide](https://www.revolut.com/en-NZ/business/business-resources-admin-set-up-guide/), [help: departments](https://help.revolut.com/en-US/business/help/managing-my-business/users-and-employees/how-can-i-group-team-members-into-teams/)). HR software sync is mentioned.

### 4.4 Cards and spend controls

- **Path:** Cards → card → Settings → **Spend controls** (requires the manage-cards permission).
- **Controls:**
  - Limits per card by **daily, weekly, monthly or quarterly** period.
  - **Single-transaction limit.**
  - **Permitted categories** (e.g. Cash/ATM, Travel).
  - **Permitted countries.**
  - **Allow specific merchants.**
- **Spend programs** (Cards → Settings → Spend programs) apply one set of limits, expense-submission rules and approval rules to a **group of cards**. A card with a spend program can't also take a separate approval process.
- **Caps:** up to **3 physical + 50 virtual** active cards per member.
- **Card requests:** employees request cards or **higher limits**, and these go through approvals. By default they go to the Owner, and this can be changed under Team → Settings → Approvals.
- **Company cards** in the business's name (autumn 2025).

Sources: [Corporate cards page](https://www.revolut.com/business/cards/), [Admin guide](https://www.revolut.com/business/business-resources-admin-set-up-guide/), [help: card requests approvals](https://help.revolut.com/business/help/team-member-management-and-spend-controls/approval-processes/card-requests-approval-processes/), [Business 5 description](https://www.revolut.com/business/rb5/).

### 4.5 Approval processes (the most important pattern for the concept)

- **Types:** **Transfers**, **Card expenses / reimbursements**, **Card requests**, and **Bills / purchase orders** (BillPay).
- **Transfer rules** ([help](https://help.revolut.com/business/help/managing-my-business/users-and-employees/how-can-i-set-payment-approval-rules/), [en-PL](https://help.revolut.com/en-PL/business/help/managing-my-business/users-and-employees/how-can-i-set-payment-approval-rules/)):
  - Default: **no approval needed**, and admins can edit the default process.
  - **Conditions by amount tier.** Each tier → **auto-approve / auto-reject / require approval**. There is an **"Else"** branch for unmatched transfers. Example: "over 100 GBP need Admin approval, over 1,000 GBP auto-rejected".
  - **Approvers** can be specific members, **roles**, or **the requester's manager**.
  - **Number of approval rounds** is configurable, and an extra step adds a "next layer of reviewers".
  - **Assignment:** choose the members the process applies to, or **auto-assign to future invitees**. Each member can have **only one** transfer process.
  - **Separation of duties:** you can't assign yourself to a process or edit one that includes you as a condition, **even as Owner**. Another member has to change it.
  - Creators and approvers need the "Send money" permission.
- **Payment drafts:** a payment subject to approval goes to **"Pending review"** until a designated approver approves it in the app. Drafts can be **scheduled** ([developer docs: payment drafts](https://developer.revolut.com/docs/guides/manage-accounts/transfers/payment-drafts)).
- **Plan gating:** custom approval rules are available only on **Grow, Scale and Enterprise**.

### 4.6 Bulk payments

- **Transfers → +New → Bulk.** **File upload is web-only.** Formats: CSV, XML or BACS (UK), **up to 1,000 rows**, from a downloadable template.
- The upload is validated with row-level errors, then the user picks the debit account → reviews → sends. Each payment shows as a separate transaction. Recipients identified by Revtag aren't supported.
- Sources: [help: bulk payments](https://help.revolut.com/business/help/receiving-payments/sending-money-to-an-external-bank-account/what-are-bulk-payments/), [Parolla guide](https://www.parolla.ie/?p=8415).

### 4.7 Expenses and receipts

- **States** ([developer docs: expenses](https://developer.revolut.com/docs/guides/manage-accounts/accounts-and-transactions/retrieve-expenses)):
  - `missing_info` → (complete) → submit → `awaiting_review`
  - then `approved` | `rejected` (fix and resubmit) | `refund_requested` (personal spend on a company card, to be paid back) | `pending_reimbursement` (approved out-of-pocket claim not yet paid)
  - then `refunded` / `reverted`
  - Admins can **revert** a decision, which sends the expense back to `missing_info`. Submitters can withdraw while it's in `awaiting_review`.
- **Receipts:** upload PDF, JPG or PNG up to 6 MB; **forward digital receipts to a dedicated expense email** and they are auto-matched; **"No receipt" toggle** ([help](https://help.revolut.com/help/managing-my-business/expenses/how-do-i-attach-a-receipt-to-an-expense/business/)).
- **Missing-info nudges:** push and email reminders, which users can opt out of under Settings → Notifications → Expenses ([help](https://help.revolut.com/en-US/business/help/managing-my-business/expenses/can-i-disable-the-notifications/)).
- **Export:** Expenses → Download → CSV or PDF, up to 100 days at a time ([help](https://help.revolut.com/business/help/managing-my-business/expenses/can-i-download-a-copy-of-all-my-expenses/)).
- **Accounting:** Xero sync pulls categories, tax rates and receipts into Revolut. QuickBooks, Sage, FreeAgent and others are also supported ([Revolut expenses page](https://www.revolut.com/en-IT/business/expenses), [integrations](https://www.revolut.com/en-CH/business/integrations)).

### 4.8 BillPay

Bills arrive from the accounting tool, by email forwarding, or by drag-and-drop of a PDF or JPG on web. OCR extracts the supplier and line items. Approval routes apply (Grow and above). Bills can be paid now or **scheduled**. Suppliers can request **early payment for a discount**, and there are **purchase orders**. Navigation: Transfers for quick bill payments, **Bills** tab for pending, drafted and paid bills ([help: BillPay](https://help.revolut.com/business/help/integrating-with-external-apps/introduction-to-billpay/revolut-billpay-setup/), [BillPay page](https://revolut.com/business/bills/)).

### 4.9 Integrations and API

- **Integrations:** Settings → Integrations. Marketplace apps can be pinned to the menu ([Crowdfund Insider 2021](https://www.crowdfundinsider.com/2021/05/175417-digital-banking-revolut-business-web-app-has-been-updated-now-its-easier-to-work-with-marketplace-apps/)).
- **Business API:** Settings (gear) → APIs → Business API. The user uploads a certificate and approves a **consent** step.
  - Access tokens expire after 40 minutes.
  - Scopes: READ, WRITE, PAY, READ_SENSITIVE_CARD_DATA (sensitive card data requires an **IP allowlist**).
  - **Webhooks** must use HTTPS.
  - Needs the "API & Integrations" permission, and is available on **Grow+**.
  - Sources: [developer docs](https://developer.revolut.com/docs/guides/manage-accounts/get-started/make-your-first-api-request), [webhooks](https://developer.revolut.com/docs/business/set-up-webhook).

### Patterns to adopt for the Swedbank concept: account and team management

**A. `<TeamTable>`** (Vercel-style data table)
- **Columns:** Member (avatar, name, email) · Role (chip) · Department · Manager · Cards (count) · Monthly limit usage (mini meter) · Status · Last active · ⋯.
- **Status chips:** `Invited · expires in 5 d` (grey, with Resend), `Needs ID verification` (amber), `Active` (green dot), `Suspended` (muted with a lock), `Removed`.
- **Toolbar:** search, filters (Role, Department, Status), "Invite people" (orange primary), bulk actions (assign manager, department or role; suspend).

**B. `<InviteDrawer>`** (right-side drawer on web, sheet on mobile)
- **Fields:**
  - Emails (tokenised multi-input; paste a list).
  - **Role** as radio cards. Each shows a one-line description and 3 key capabilities, e.g. "**Accountant** — See everything, export statements, prepare payments. Can't approve payments over 50 000 kr."
  - Department, manager.
  - "Issue a card" toggle → virtual/physical, spend policy picker.
- **Footer summary:** "3 invites · Accountant · Requires BankID verification on first sign-in".
- **Microcopy:** "Invites expire in 14 days. You can resend anytime."

**C. `<RoleEditor>` / permission matrix**
- **Rows:** grouped permissions (Accounts & balances · Payments · Approvals · Cards · Team · Statements & exports · Integrations & API · Company settings).
- **Columns:** segmented control **No access · View · Edit** (Revolut's three levels). The "Payments" group adds an **amount cap** field ("may create payments up to … kr").
- **Behaviour:** the 5 default roles are shown locked ("Duplicate to customise"). A live **"Who has this role" avatar stack**, and a **diff preview** before saving ("2 members will lose access to Statements").

**D. `<ApprovalRuleBuilder>`** (Revolut's model, shown as a readable flow)
- **Visual:**

  ```
  When  [Transfer] is created by [Members in: Sales]
  If amount   < 5 000 kr        → Auto-approve
  If amount   5 000–50 000 kr   → 1 approval from [Manager]
  If amount   > 50 000 kr       → 2 approvals: [Any Admin] then [CFO]
  Else                          → 1 approval from [Any Admin]
  ```

- **Also offer:** an "auto-reject above X" option. A **"Requester can never approve their own request"** rule that is **always on and shown as a locked rule**. An "Apply to: selected members / everyone / auto-apply to new invitees" setting.
- **Validation microcopy:** "You can't edit a rule that applies to you — ask another admin." This copies Revolut's separation-of-duties guardrail and explains it.
- **Simulation panel:** "Test a payment: 72 000 kr by Erik (Sales) → Needs Anna (Manager) then Johan (CFO)."
- Swedish context: model **firmatecknare** (company signatories) as a role attribute, so that "Joint signing (two signatories)" can be a preset.

**E. `<ApprovalInbox>`** (web page and mobile tab with a badge count)
- **Card per request:** requester avatar · type (Transfer / Card request / Limit increase / Expense / Bill) · amount and recipient · **fee and FX preview** · rule that triggered it ("Rule: > 50 000 kr needs 2 approvals · 1 of 2 done") · attachments (invoice PDF) · Approve (orange) / Reject (with a required reason) / Ask a question.
- **Bulk approve** with a confirmation that totals the amount: "Approve 12 payments · 248 300 kr".
- Signing with **BankID** for approvals above a threshold.

**F. `<SpendPolicyCard>` / spend programs**
- **Anatomy:** name ("Sales travel"), limit summary ("15 000 kr/month · max 5 000 kr per purchase"), allowed categories (chips: Travel, Hotels, Restaurants), allowed countries, receipt rule ("Receipt required over 200 kr within 7 days"), approver, and an **assigned cards count** linked to the list.
- **Microcopy (employee side):** "You've used 9 800 of 15 000 kr this month. Resets 1 Dec."

**G. `<BulkPaymentUploader>`**
- **Steps:** download template (CSV/XLSX, plus ISO 20022 pain.001 for Swedish corporates) → drop the file → **validation table** with a row-level status (✓ valid / ⚠ fix: "Invalid bankgiro number") and inline editing → summary (count, total, fees, earliest execution date) → "Send for approval".
- Banner: "1 000 rows max per file".

**H. `<ExpenseRow>` with status chips** mapped from Revolut's states into plain language: `Missing receipt` · `Ready to submit` · `Awaiting review` · `Approved` · `Rejected — needs changes` · `Pay back requested` · `Reimbursement pending` · `Reimbursed`. Receipts can be captured by email forwarding ("kvitto@…"), photo, or a "No receipt" toggle with a required reason.

**I. `<EntitySwitcher>`** (top-left of the web sidebar, Vercel-team-switcher style)
- Shows company logo or initials, name and org no. The list includes the "Personal" profile as well. **Unlike Revolut**, which forbids personal↔business linking, Swedbank can unify them under one BankID login.
- Includes "+ Add company".
- Switching re-authenticates silently using the BankID session.

**J. `<DeveloperSettings>`** (Vercel-style): API keys and certificates, scopes, IP allowlist, webhook endpoints with a delivery log, and status pills.

---

## 5. Transparency patterns: fees, statuses, limits, audit

### 5.1 Fees shown before confirming

- "Revolut always shows fees before a bank transfer is sent". A detailed in-app breakdown of Revolut's fees appears before sending ([help](https://help.revolut.com/help/transfers/outbound-transfers/how-to-send-money-to-another-bank/how-do-i-send-money-to-a-bank-account), [help PL](https://help.revolut.com/en-PL/help/transfers/outbound-transfers/how-to-send-money-to-another-bank/how-do-i-send-money-to-a-bank-account)).
- The total cost includes the **exchange rate, any fair-usage fee and any weekend markup**, and the **estimated arrival time** is shown before sending (search summary of help pages).
- **Honest disclaimer:** Revolut **cannot see or control intermediary or recipient bank fees** and says so ([help](https://help.revolut.com/en-CH/help/transfers/bank-transfers/which-fees-are-charged-for-a-bank-transfer)).
- A "Pay all fees" (OUR) option lets the recipient get the exact amount where available ([Profee, 3rd-party](https://www.profee.com/vi/articles/revolut-overview-2026)).
- The plan's free-transfer allowance is part of the price calculation: for example Standard gets 1 free international transfer, Premium 3, Metal 5 (search summary, regional).

### 5.2 FX, fair usage and weekend markup

- **Fair-usage limit** on exchanges, which resets **once per rolling month**. Users check usage and the **reset date** under profile icon → **Your plan** or **Your limits** ([help](https://help.revolut.com/en-SE/help/wealth/exchanging-money/how-much-does-it-cost-to-make-an-exchange/will-i-be-charged-for-exchanging-foreign-currencies)).
- **Weekend markup** (about 1%, from Friday evening ET to Sunday evening ET) applies to some plans. The two charges stack ([Wise analysis](https://wise.com/gb/blog/revolut-limits)).
- **ATM allowance:** Your plan → "Your limits" shows the **remaining allowance and refresh date**. The reset is **anchored to the plan start day**, not the calendar month (e.g. the 15th). Over the limit, a 2% fee applies ([help](https://help.revolut.com/help/card-payments-withdrawals/withdrawing-cash-issues/when-does-my-atm-withdrawal-limit-reset/)).

### 5.3 Business plan allowances (UK, from Revolut's legal fee page)

| | Basic | Grow | Scale | Enterprise |
|---|---|---|---|---|
| Plan fee | £10/mo | £35/mo or £360/yr | £125/mo or £1,080/yr | Custom |
| Free UK local transfers | 10/mo, then £0.20 | 100/mo, then £0.20 | 1,000/mo, then £0.20 | Custom |
| Free FX allowance | £1,000/mo | £15,000/mo | £60,000/mo | Custom |
| FX above allowance | 0.6% | 0.6% | 0.6% | — |

Source: [Revolut business fees, all plans](https://www.revolut.com/legal/business-fees-all-plans-current). Third-party figures differ (e.g. Grow £30 / Scale £90 per [Airwallex](https://www.airwallex.com/uk/blog/revolut-business-fees)).

Other rules:
- **Changing plan mid-cycle resets allowances** to the new plan's levels ([fee doc](https://cdn.revolut.com/terms_and_conditions/pdf/business_fees_grow_ae7208ba_1.6.1_1740594899_en.pdf)).
- Going over an allowance **doesn't block** anything; extras are simply charged ([Finder](https://www.finder.com/uk/revolut-business-review)).
- Plan comparison pages use plan cards with a monthly/annual toggle and a feature comparison table ([plans page](https://www.revolut.com/en-IE/business/business-account-plans/)).
- I found no source describing a Business "X of Y free transfers used" meter, so it is [Unverified].

### 5.4 Status lifecycle and tracking

- Card payments: Pending → Completed / Reverted / Declined, with the **reversal date shown** (§2.2).
- **API transfer states:** `pending` → `completed` | `failed` | `reverted` | `declined`. Transfers between Revolut accounts are instant ([developer docs](https://developer.revolut.com/docs/guides/manage-accounts/transfers/bank-transfers)).
- **Inbound transfer tracker:** Help → Transfers → "Locate inbound transfer". It gives specific dates and timelines, and counts business days only. Revolut is explicit that it has no visibility into transfers that haven't reached it yet ([help](https://help.revolut.com/business/help/receiving-payments/issues-with-transfers/what-can-i-do-if-my-funds-didnt-arrive-in-my-account/)).
- Approval-gated payments show **"Pending review"** (§4.5).
- **Change history:** Business 5 reportedly puts more emphasis on "change history" ([finantresnoticias](https://finantresnoticias.com/negocios-y-autonomos/revolut-business-app-empresas-revisar-operar/)). I found no detail on a user-facing audit log, so it is [Unverified].

### 5.5 Statements and export

- **Path:** Home or ⋯ → **Statements** → **Transaction statement** → filters (**accounts, cards, currencies**, more) and **date range** → **PDF or CSV** → Generate.
- Times are in **UTC by default**, and CSV can include local and UTC times (an Appearance setting).
- Requires the "manage accounts" permission.
- Source: [help: statements](https://help.revolut.com/business/help/managing-my-business/viewing-my-account-statements/finding-my-account-statement/).

### 5.6 Real-time notifications

- Personal transaction notifications are instant, but controlled in the OS (§2.7).
- Business has notification settings per area, e.g. Expenses (push and email).
- Approvers get notified of pending requests [Unverified details].

### Patterns to adopt for the Swedbank concept: transparency

**A. `<FeeBreakdown>`** (shown on every payment review step and every transaction detail)

```
You send                      10 000,00 kr
Exchange rate     1 EUR = 11,4820 kr   ⓘ mid-market 11,4300 · markup 0,45 %
Our fee                            0,00 kr   (1 of 5 free this month)
Intermediary banks           may deduct up to €15  ⓘ
─────────────────────────────────────────
Recipient gets (est.)            €870,93
Arrives                   Thu 30 Oct, by 18:00
```

- **States:**
  - quote refreshing: a countdown pill "Rate locked for 0:28".
  - weekend: banner "Markets closed — rate includes 0,5 % weekend buffer. Send Monday to avoid it."
  - over allowance: "This uses 1 paid transfer (15 kr) — you've used 5 of 5 free."
- **Rule:** the CTA label repeats the total: "Send 10 000 kr".

**B. `<AllowanceMeter>`** (plan page and contextually inside flows)
- **Anatomy:** label · `used / included` · thin progress bar (orange fill, amber at ≥ 80%) · reset line.
- **Microcopy:** "Domestic transfers · 62 of 100 free · Resets 15 Nov (in 17 days) · Then 2 kr each".
- Lives on a **"Plan & usage"** page (Vercel's Usage page is the model) with every allowance, the next bill estimate, and "Compare plans".

**C. `<PlanComparison>`** (Vercel pricing style)
- 3–4 plan columns with a sticky header and a monthly/yearly toggle. Rows are grouped (Payments · Cards · Team & approvals · Integrations & API · Support). Use ✓, "—" or numeric values, never ambiguous text. "Your plan" is marked.
- **No feature hidden as a tease.** Gated features in the app show a neutral "Available on Business Plus" chip, not a modal upsell.

**D. `<StatusTimeline>`** (payments, card requests, applications)
- **Vertical steps:** Created by Erik · 09:12 → Approved by Anna · 09:40 → Sent to Bankgirot · 09:41 → Received by recipient bank · 14:00 (est.).
- Each step has a timestamp, the actor and an icon. The current step pulses. A failed step shows the reason and the next action ("Returned by recipient bank: account closed. Money back in your account 31 Oct.").

**E. `<LimitsPage>`**
- Every limit in one place: card limits (per card), daily payment limit, Swish limit, ATM. Each has a `<LimitMeter>` (used / limit / period reset) and "Request change". Changes within policy apply instantly; others go to approval with a timeline.

**F. `<AuditLog>`** (business, Vercel "Activity" style)
- **Table:** time · actor (avatar) · action ("changed approval rule *Transfers > 50 000 kr*") · target · IP/device · **diff link** (before/after JSON or a readable diff).
- **Filters:** actor, action type, date. **Export CSV.**
- **Microcopy for empty state:** "Every change to people, roles, limits and rules is recorded here for 7 years."

**G. `<StatementExportDialog>`**
- Account(s) · date range (presets: Last month, Last quarter, Custom) · format **PDF / CSV / SIE (for Swedish accounting) / camt.053** · timezone (Stockholm default, not UTC) · "Email it to me when ready" · history of previous exports.

**H. `<NotificationCenter>`** (bell on web, inbox on mobile)
- Tabs: *All · Approvals · Payments · Security*. Every notification deep-links to its object. Security events (new device, role change) can't be muted.

---

## 6. Web app desktop layout (app.revolut.com / business.revolut.com)

### 6.1 Personal web app (app.revolut.com)

- **Launch:** 1 December 2020, with full transactions and balances, add money, freeze/unfreeze and card security settings, and 24/7 chat with FAQs. Login uses the phone number and 2FA ([Revolut blog](https://www.revolut.com/blog/post/introducing-the-revolut-web-app/), [Qorus](https://www.qorusglobal.com/content/4713-revolut-launches-an-online-web-app-for-customers), [bonkers.ie](https://bonkers.ie/blog/banking/revolut-launches-desktop-version-of-its-app)).
- **Later additions:** PIN block/unblock and more transactional operations ([aziendabanca, 2026](https://www.aziendabanca.it/notizie/revolut-web)).
- **Layout** [Unverified, from memory of the product]: a left vertical nav (Home, Payments/Transfers, Cards, Invest/Stocks, Crypto, …), a centred main column that mirrors the mobile home (balance hero, quick actions, transactions list), and transaction details in a right side panel or modal.

### 6.2 Business web app (business.revolut.com)

**Navigation items inferred from official help paths** (each is cited in §4 and §5). Exact sidebar labels and order are [Unverified]:

| Area | Evidence of path |
|---|---|
| **Account switcher** (top-left, tap the account name) | multi-business help |
| **Home**: balances, accounts, statements entry, onboarding tiles | "Home → Statements"; "Home → Team" on mobile; onboarding tiles |
| **Transfers / Payments** with **+ New** (single, bulk), counterparties, payment drafts, scheduled | bulk help: "Transfers → +New → Bulk" |
| **Cards**: list, **Settings → Spend programs** | Admin guide |
| **Expenses**: review queue, Download | expenses help |
| **Bills** (BillPay): pending / drafted / paid, purchase orders | BillPay help |
| **Team**: Invite, members, **Settings → Roles / Approval processes / Approvals / Departments** | "navigate to Team on the left sidebar" ([developer docs, POS](https://developer.revolut.com/docs/guides/merchant/accept-payments/in-person-payments/pos/web-app/staff-management)); roles help |
| **Merchant / Acquiring**, **Invoices**, **Accounting** | product pages (labels Unverified) |
| **Settings (gear)**: business profile and ownership, **APIs**, **Integrations**, **Notifications**, plan | API docs, integrations page, expenses notifications help |
| Pinned **Marketplace apps** in the menu | 2021 update |

Other web-app facts:
- **Web-only capabilities:** bulk file upload; changing the ownership structure.
- **Business 5 (spring 2025):** redesigned navigation across web and mobile, aimed at "find features faster" (app listing summary, via search).
- **Observed layout conventions** [Unverified]:
  - Light canvas, white content cards.
  - Data tables with avatar/logo, description, date, amount (right-aligned) and status.
  - A filter bar of pill dropdowns (Account, Card, Team member, Type, Status, Date) plus search.
  - Clicking a row opens a **right-side details panel**, with no full page navigation.
  - Primary actions ("Send", "Add money", "Invite") as pills at the top right of page headers.

### Patterns to adopt for the Swedbank concept: web layout (Revolut content, Vercel shell)

**A. App shell**
- Left sidebar, 240px, collapsible to a 64px icon rail.
- Top: `<EntitySwitcher>`.
- Groups:
  - **Overview** (Home)
  - **Money**: Accounts · Payments · Cards · Bills · Expenses
  - **Company**: Team · Approvals (badge count) · Policies
  - **Insights**: Analytics · Statements · Activity log
  - Bottom: Plan & usage · Developers · Settings · Help
- Active item: an orange 2px left indicator, brown text and a cream background.

**B. Top bar** (56px): breadcrumb ("Payments / Batch #2025-10-29"), a **⌘K command palette** trigger ("Search or jump to…"), a notification bell, a "+ New" split button (Payment, Bulk payment, Card, Invite), and an avatar menu.

**C. Page template:** title (display face, 28–32px, weight 500) and a one-line description · primary action at the right · KPI strip (3–4 stat tiles: Available balance, Pending out, Awaiting approval, This month's spend) · filter bar · table · pagination or infinite scroll.

**D. `<DataTable>`**
- 48px rows, sticky header, right-aligned tabular amounts, status chips, row hover with an ⋯ menu, multi-select with a bulk action bar sliding up from the bottom, column visibility settings, and **saved views** ("My approvals", "Over 10 000 kr").

**E. `<DetailDrawer>`**
- 480px right drawer: header (logo, title, amount, status) · tabs **Details / Timeline / Files / Activity** · footer actions. The URL is deep-linkable (`?tx=…`).

**F. Empty, loading and error states:** skeleton rows; empty states with one sentence and one action ("No bills yet — forward invoices to bills@yourcompany.swedbank.se or drop a PDF here"); inline error with a retry.

---

## 7. Known criticisms of Revolut UX, and how the concept avoids them

| Criticism | Evidence | Concept counter-measure |
|---|---|---|
| **Cluttered home, too many CTAs** | "23 buttons / links on home screen"; reviewer "lost track of the original task" | Home has exactly 1 hero, 4 quick actions, transactions, and at most 3 user-chosen widgets. No promotions on home. [community](https://community.revolut.com/t/ui-overhaul/147896?page=8), [teardown](https://heavenly-visor-630.notion.site/UX-Teardown-e04b8f67ce1e4fca823965aa5e5096a4) |
| **Feature bloat and discoverability** | "becoming more and more bloated"; "feature-bombing your users is rarely a good idea" | A command palette and search over features; progressive disclosure; banking-first IA (no crypto, lifestyle or eSIM tabs). [Freetrade community](https://community.freetrade.io/t/revolut-wealth/367/51), [bothrs](https://www.bothrs.com/story/dissecting-the-app-revolut) |
| **Transactions de-prioritised** (7.x showed one transaction plus "See all") | "app should be built around transactions" | The transaction list is the main body of Home and the default web view. [community](https://community.revolut.com/t/ui-overhaul/147896?page=8) |
| **Upsell notifications and prompts** | "more notifications about them trying to upsell me Metal than actual transactions"; insurance pushed on every country change | Marketing notifications off by default. Plan gating is shown as neutral chips; no interstitials. [flameeyes](https://flameeyes.blog/2019/03/24/is-revolut-still-a-good-thing/?amp=1) |
| **Notification control buried in OS settings** | Only marketing is configurable in-app | A granular in-app notification centre and settings. [help](https://help.revolut.com/en-JP/help/profile-and-plan/profile-plan/notifications/how-do-i-manage-my-notifications/) |
| **Account freezes with no explanation; chat-only support; bot loops** | Ombudsman decisions; "blocked for five days without any clarifications"; freezes are the most common 1–3 star complaint (about 30%, rough estimate) | A **"Restriction" status page** with what is restricted, why (at the level allowed by law), what's still possible (e.g. incoming payments, salary), the next step, the expected timeline, and a named case reference. Plus phone and branch escalation, Swedbank's physical advantage. [FOS decision](https://www.financial-ombudsman.org.uk/decision/DRN-2789018.pdf), [community](https://community.revolut.com/t/security-blocked-business-account-no-feedback-or-response-after-48-hours/34843), [unstar.app](https://unstar.app/blog/is-revolut-safe-legit-banking-app-reviews-2026) |
| **Opaque business-application rejections** | Community threads on rejected applications with no reason | The application tracker always shows the current stage, the owner of the next action, and a reason category on rejection. [community](https://community.revolut.com/t/why-was-my-revolut-business-application-rejected/240236) |
| **Key controls locked behind paid plans** (approvals, API, bulk) | Grow+ needed for custom approvals and the API | Show governance features (approvals, roles, audit log) **on all business plans**: the bank's own risk interest supports this. Charge for volume, not for control. |
| **Features toggled on and off between versions** (e.g. "Exclude from analytics") | Community complaints | Changelog or "What's new" panel; stable IA. [community](https://community.revolut.com/t/lost-ability-to-toggle-transactions-out-of-analytics/94682) |
| **Inconsistent help across regions and versions** | Paths differ per locale (e.g. approval settings) | One canonical in-product help with contextual "Learn more" links. |
| **Feature ambiguity costing money** (Spare change round-ups) | Ombudsman complaint that a round-up feature cost £1,000+ | Every automation shows a projected monthly impact ("≈ 420 kr/month based on last 3 months") before activation. [FOS DRN-5950871](https://www.financial-ombudsman.org.uk/decision/DRN-5950871.pdf) |
| **Tab bar not customisable / takes space** | Community requests | Keep a 4–5 item tab bar; Swedbank users can pin one "favourite" slot. [community](https://community.revolut.com/t/new-ui-impressions/238851) |

---

## 8. Short glossary of Revolut microcopy worth echoing

Verbatim labels where sources confirm them; the rest are paraphrased:

| Label | Confidence |
|---|---|
| "Add money", "Accounts", "Move", "Details" | Official |
| "Your plan", "Your limits" | Official |
| "Split bill" → "Items" | Official |
| "Get help" | Official |
| "Improve merchant info" | 3rd-party |
| "Exclude from Analytics" | Official |
| "All from this merchant" / "Only this transaction" | Official |
| "Reset limit" (contactless) | Official |
| "Corporate structure", "Add directors and shareholders", "Verify details", "Director" / "Shareholder" | Official |
| "Verifying" status | Official |
| "Team → Invite", "Team → Settings → Roles → New", "Approval processes", "Spend programs" | Official |
| "Pending review" (payment drafts) | Official |
| "No receipt" toggle | Official |
| "Locate inbound transfer" | Official |
| "Checking image quality" (KYC) | 3rd-party |

---

## 9. Open questions and what to verify next

1. **Exact current home-screen labels and tab bar**, especially "More" versus "⋯" and whether the third tab is "Payments" or "Transfers". Check Mobbin or the live app.
2. **Business web-app sidebar labels and order after Business 5.** Screenshots from Mobbin or Page Flows, or a trial account, would confirm them.
3. **Whether Revolut shows a usage meter for free transfers** in Business (unverified).
4. **App-UI font.** Whether the app uses Aeonik Pro or a system font for body text.
5. Whether the user-facing **audit log / change history** in Business 5 exists, and what it shows.

## 10. Source index (main)

**Revolut official** (read via search extracts):
- [Revolut 10 news](https://www.revolut.com/news/revolut_launches_revolut_10_as_it_targets_primary_accounts_and_passes_35m_customers_worldwide) · [Revolut 10 blog](https://www.revolut.com/blog/post/revolut-10/)
- [Onboarding guide](https://www.revolut.com/business/business-resources-onboarding-guide/) · [Admin set-up guide](https://www.revolut.com/business/business-resources-admin-set-up-guide/)
- [Roles & permissions help](https://help.revolut.com/en-US/business/help/managing-my-business/users-and-employees/setting-permissions/) · [Transfer approvals help](https://help.revolut.com/business/help/managing-my-business/users-and-employees/how-can-i-set-payment-approval-rules/) · [Card expense approvals](https://help.revolut.com/business/help/team-member-management-and-spend-controls/approval-processes/card-expense-or-reimbursement-approval-processes/)
- [Invite team member](https://help.revolut.com/business/help/managing-my-business/users-and-employees/how-can-i-add-a-new-team-member/) · [Directors & shareholders](https://help.revolut.com/business/help/setting-up-an-account/onboarding/directors-and-shareholders/what-requirements-are-there-for-beneficial-owners-and-directors/) · [Resend invitation](https://help.revolut.com/business/help/setting-up-an-account/onboarding/directors-and-shareholders/how-can-i-resend-an-invitation-or-invite-my-shareholders-or-directors)
- [Bulk payments](https://help.revolut.com/business/help/receiving-payments/sending-money-to-an-external-bank-account/what-are-bulk-payments/) · [Statements](https://help.revolut.com/business/help/managing-my-business/viewing-my-account-statements/finding-my-account-statement/) · [Card security](https://help.revolut.com/help/card-payments-withdrawals/ping-other-card-security-settings/card-security-settings) · [Pending payments](https://help.revolut.com/help/card-payments-withdrawals/paying-by-card-issues/why-is-my-card-payment-pending)
- [Analytics](https://help.revolut.com/help/app-features/budgeting-and-analytics/how-does-the-analytics-feature-work/) · [FX fees / fair usage](https://help.revolut.com/en-SE/help/wealth/exchanging-money/how-much-does-it-cost-to-make-an-exchange/will-i-be-charged-for-exchanging-foreign-currencies) · [ATM limit reset](https://help.revolut.com/help/card-payments-withdrawals/withdrawing-cash-issues/when-does-my-atm-withdrawal-limit-reset/) · [Business fees](https://www.revolut.com/legal/business-fees-all-plans-current)
- [Developer: expenses](https://developer.revolut.com/docs/guides/manage-accounts/accounts-and-transactions/retrieve-expenses) · [payment drafts](https://developer.revolut.com/docs/guides/manage-accounts/transfers/payment-drafts) · [team members](https://developer.revolut.com/docs/guides/manage-accounts/teams/manage-team-members) · [first API request](https://developer.revolut.com/docs/guides/manage-accounts/get-started/make-your-first-api-request)
- [Dark mode blog](https://www.revolut.com/blog/post/turn-down-the-lights-dark-mode-is-here/) · [Web app blog](https://www.revolut.com/blog/post/introducing-the-revolut-web-app/) · [Search blog](https://www.revolut.com/en-US/blog/post/you-can-now-search-for-your-transactions/) · [Spring 2025 release](https://revolut.com/en-GR/business/whats-new-spring-25)

**Third-party design and UX:**
- [webdesignhot DESIGN.md](https://www.webdesignhot.com/api/design-md/revolut.md) · [hagicode DESIGN.md](https://design.hagicode.com/designs/revolut/DESIGN.md) · [Refero Styles](https://styles.refero.design/style/a3161c3c-26d4-425b-aaa3-4fc3f06b77ee) · [nicelydone Revolut screens](https://nicelydone.club/apps/revolut)
- [Motion the Agency](https://www.motiontheagency.com/blog/how-ui-animation-improves-user-experience) · [raw.studio onboarding tactics](https://raw.studio/blog/how-revolut-uses-4-onboarding-ux-tactics/) · [statrys](https://statrys.com/reviews/open-revolut-business-account) · [Qorus](https://qorusglobal.com/content/19090-revolut-unveils-revolut-10-a-fresh-look-at-online-banking) · [fintechnews.sg](https://fintechnews.sg/78771/digital-banking-news-singapore/revolut-launches-its-biggest-update-yet-for-over-35-million-users/) · [next.ink](https://next.ink/brief-article/revolut-change-de-logo-en-douceur/) · [PYMNTS AIR](https://www.pymnts.com/news/artificial-intelligence/2026/revolut-rolls-out-ai-assistant-for-daily-financial-tasks/)

**Criticism:**
- [Revolut community UI Overhaul](https://community.revolut.com/t/ui-overhaul/147896?page=8) · [flameeyes](https://flameeyes.blog/2019/03/24/is-revolut-still-a-good-thing/?amp=1) · [FOS decisions](https://www.financial-ombudsman.org.uk/decision/DRN-2789018.pdf) · [unstar.app review analysis](https://unstar.app/blog/is-revolut-safe-legit-banking-app-reviews-2026)
