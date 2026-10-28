# Swedbank Internet Bank — concept by SWED SQUAD

Student project for **TMJ0140/TMJ0130 Introduction to Entrepreneurship** (2026 autumn; Demiankova, Kallaste). Not affiliated with Swedbank — all data is fictional.

A clickable prototype of a redesigned Swedbank **Estonia** internet bank, for people and companies.
Swedbank's own palette (bark brown `#512B2B`, orange `#FF5F00`, apricot, pineapple, teal) on top of
Vercel's Geist-style structure and Revolut's money patterns.

It focuses on four areas:

| Area | Where |
|---|---|
| Company creation | `/start` → `/start/status` — register an OÜ with the e-Business Register and open the account in one flow, or add an existing company by registry code |
| Personal account | `/personal/*` — one balance, four quick actions, transactions with status timelines, cards, payments |
| Management | `/business/team`, `/business/payments` (approvals + rules), `/business/cards`, `/business/settings` |
| Transparency | fee preview before every confirmation, `/personal/plan`, `/business/billing`, `/business/activity` (audit log), Smart-ID modal that states exactly what is signed |

## Run it

```bash
npm install
npm run dev        # http://localhost:3000
```

`npm run build && npm start` for a production build. All data is mock and lives in memory, so a full page reload resets the demo.

## Five-minute demo script

1. **Log in** (`/`) — Smart-ID with a prefilled ID code, control code, done.
2. **Personal overview** — hide/show balance, pending amounts explained, freeze the card (with Undo), open a transaction to see its status timeline and fee line.
3. **Pay** — enter an IBAN (the bank is detected from the code), review the fee breakdown and arrival time, sign with Smart-ID.
4. **Plan & fees** — allowances with what's left and when they reset, fee history, plain-language price list.
5. **Start a company** (sidebar card) — name check against the register, founders and shares, capital, account set-up, every cost up front, both founders sign, then the live registration tracker.
6. **Switch to Nordlight Studio OÜ** (profile switcher, top left) — approve a payment in Payments, invite an accountant in Team & access, then open **Activity log**: both actions are already there, marked "just now".
7. **Fees & usage** — no monthly fee, 412 of 1,000 free payments, the €17.08 estimate itemised.

Press **⌘K / Ctrl+K** anywhere for search and actions.

## Structure

```
src/app/page.tsx, sign-in.tsx        Log in
src/app/(app)/personal/*             Personal area
src/app/(app)/business/*             Business area
src/app/start/*                      Company creation + status tracker
src/components/ui/*                  Design-system primitives (Geist-style)
src/components/banking/*             Bank components: card, transaction, Smart-ID, fee breakdown, allowances
src/components/shell/*               Sidebar, profile switcher, command menu, notifications
src/lib/store.tsx                    In-memory store; every business action writes an audit event
src/lib/data/*                       Mock data and Swedbank EE pricing
docs/research/*                      Research reports (Swedbank, Revolut, Vercel) with sources
```

## Design decisions

- **Ink is the primary action.** White text on `#FF5F00` is about 3:1 contrast, so orange buttons only appear as Swedbank's 19px bold pill (large-text AA). Everywhere else the primary button is bark brown, as Vercel's is black.
- **Orange is an accent**: logo, active nav icon, progress, the one main CTA of a flow. Links and focus rings use Swedbank teal `#257886`.
- **Every fee before every confirmation**, every signing action through Smart-ID with the exact details, every business change in the activity log.
- Fonts: Geist Sans / Geist Mono (mono only for IBANs, IDs, IPs and logs).

## Data and accuracy

- Prices follow the Swedbank Estonia price lists valid from 31 Aug 2026 (business) and 1 Nov 2025 (private plans). Formation rules follow the RIK e-Business Register guide (state fee €265, capital from €0.01 per shareholder). Details and sources are in `docs/research/`; unverified items are listed there.
- People, companies, IBANs and transactions are fictional. The oak coin is a simplified stand-in, not the trademark.
- In development, browser extensions that inject attributes (e.g. `fdprocessedid`) cause hydration warnings; they don't appear in production builds.
