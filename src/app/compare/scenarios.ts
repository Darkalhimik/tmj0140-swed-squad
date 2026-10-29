/**
 * "Swedbank today" is reconstructed from Swedbank Estonia's public pages, price
 * lists and app reviews (checked 29 Oct 2026) — not from the logged-in bank.
 * Every claim carries a source; anything we could not confirm is marked.
 */

export type Channel = "site" | "state" | "phone" | "branch" | "wait" | "pdf";

export type Step = { text: string; channel: Channel; note?: string };
export type Source = { label: string; url: string };

export type Scenario = {
  id: string;
  title: string;
  job: string;
  today: { steps: Step[]; sources: Source[]; unverified?: string };
  concept: { steps: string[]; route: string; routeLabel: string };
  changes: { problem: string; fix: string }[];
};

export const CHANNEL_LABEL: Record<Channel, string> = {
  site: "Internet bank",
  state: "State portal",
  phone: "Phone call",
  branch: "Branch visit",
  wait: "Waiting",
  pdf: "PDF document",
};

const SRC = {
  rik: { label: "RIK · establishing a private limited company", url: "https://abiinfo.rik.ee/index.php/en/node/230/" },
  open: { label: "swedbank.ee · Open a new business account", url: "https://www.swedbank.ee/business/d2d/accounts/open?language=ENG" },
  docs: { label: "swedbank.ee · documents for opening an account (PDF)", url: "https://swedbank.ee/static/pdf/business/d2d/accounts/info_account_openingdocs_eng.pdf" },
  rights: { label: "swedbank.ee · User rights and payment limits", url: "https://www.swedbank.ee/business/d2d/ebanking/admin?language=ENG" },
  priceBiz: { label: "swedbank.ee · business price list from 31 Aug 2026 (PDF)", url: "https://swedbank.ee/static/pdf/business/d2d/start/tools/pricerates/Pricelist_ARI_eng_31_08_2026.pdf" },
  pricePriv: { label: "swedbank.ee · private price list from 31 Aug 2026 (PDF)", url: "https://swedbank.ee/static/pdf/private/home/useful/PAD_Teenuste_hinnakiri_eng_31_08_2026.pdf" },
  appStore: { label: "App Store · Swedbank Eestis reviews", url: "https://apps.apple.com/ee/app/swedbank-eestis/id434814718" },
  play: { label: "Google Play · Swedbank Eestis", url: "https://play.google.com/store/apps/details?id=com.swedbank&hl=en&gl=EE" },
  err: { label: "ERR · Swedbank digital services went offline", url: "https://news.err.ee/1609472464/swedbank-digital-services-went-offline-thursday-evening" },
  reservation: { label: "e-Residency · reserve a business name", url: "https://www.e-resident.gov.ee/blog/posts/reserve-a-business-name-in-estonia/" },
};

export const SOURCES = Object.values(SRC);

export const scenarios: Scenario[] = [
  {
    id: "company",
    title: "Start a company and get a business account",
    job: "“I want to found an OÜ with a co-founder and start invoicing this week.”",
    today: {
      steps: [
        { channel: "state", text: "Register the OÜ in the e-Business Register portal — a separate state site (RIK’s guide walks through 17 steps)." },
        { channel: "state", text: "Pay the €265 state fee and the share capital there, and confirm the contribution." },
        { channel: "wait", text: "Wait for the registrar's decision." },
        { channel: "site", text: "Log in to Swedbank, choose “Open an account” and fill in the application again." },
        {
          channel: "phone",
          text: "Wait for Swedbank to call you back.",
          note: "“Within an hour” on working days 08:30–16:00, otherwise the next working day.",
        },
        { channel: "site", text: "Sign the account agreements in the internet bank." },
        {
          channel: "branch",
          text: "If an owner isn't an Estonian resident: meeting at the Arter branch in Tallinn.",
          note: "Non-refundable due-diligence fee €300 or €500, decision within 10 working days.",
        },
      ],
      sources: [SRC.rik, SRC.open, SRC.docs],
    },
    concept: {
      route: "/start",
      routeLabel: "Start a company",
      steps: [
        "Name checked against the register as you type",
        "Founders, shares and board — beneficial owners worked out automatically",
        "Capital, address, VAT and employment-register options",
        "Account, approval rules, cards and accounting in the same place",
        "Every cost shown, then each founder signs online",
        "Live status until the company exists — then its dashboard opens with the account, cards and rules already set up",
      ],
    },
    changes: [
      { problem: "Two separate journeys: the state portal, then the bank", fix: "One application; the bank files it with the e-Business Register" },
      { problem: "A phone call is needed to finish opening the account", fix: "Everything is signed in the flow — no call-back" },
      { problem: "Non-resident owners: branch visit, €300–500 fee, up to 10 working days", fix: "Remote video identification, with the fee and timeline shown up front" },
      { problem: "Nothing to look at while you wait", fix: "A step-by-step status page with a reference number" },
    ],
  },
  {
    id: "access",
    title: "Give your accountant access",
    job: "“Our accountant should prepare payments, but only the board approves them.”",
    today: {
      steps: [
        { channel: "site", text: "Open user rights and limits, choose “Edit agreement”." },
        {
          channel: "site",
          text: "Pick a rights profile.",
          note: "Information · Preparation of payments · Information and payments · All services · Agreement signing.",
        },
        { channel: "site", text: "The change becomes an amendment to the Digital Services Agreement — “Sign changes”." },
        { channel: "branch", text: "Board represents the company jointly? Administrator rights are validated at a branch." },
        { channel: "branch", text: "Right to sign agreements: a board member visits a branch or contacts the account manager." },
        { channel: "phone", text: "Limits above €50,000 a day or €100,000 a month: message, call or visit the bank." },
      ],
      sources: [SRC.rights],
    },
    concept: {
      route: "/business/team",
      routeLabel: "Team & access",
      steps: [
        "Invite by email, choose a role — mapped to the same Swedbank rights profiles",
        "See exactly what the person can and can't do before you sign",
        "Joint representation: the second board member signs online too",
        "Every change is in the activity log with who, when and from where",
      ],
    },
    changes: [
      { problem: "Rights live inside an agreement amendment", fix: "Roles in plain words, with a preview of what changes" },
      { problem: "Three cases need a branch visit", fix: "All signed online; only limits above the self-service cap go to review — with a timeline" },
      { problem: "Hard to see who did what", fix: "Activity log with filters and CSV export" },
    ],
  },
  {
    id: "card",
    title: "Pay someone who gave you a card number",
    job: "“My friend sent me her card number for the concert tickets.”",
    today: {
      steps: [
        { channel: "site", text: "Payments in the internet bank are made to an IBAN." },
        { channel: "wait", text: "Ask the friend for their IBAN and wait for the answer." },
        { channel: "site", text: "Pay by IBAN." },
      ],
      sources: [SRC.pricePriv],
      unverified: "We found no way to pay to a card number in Swedbank Estonia's public materials. Check this in the logged-in bank.",
    },
    concept: {
      route: "/personal/payments?new=1&to=card",
      routeLabel: "Send to a card",
      steps: [
        "Card number checked as you type: typo check, Visa or Mastercard, issuing bank",
        "Name check: “Card belongs to Oksana M.”",
        "Fee, exchange rate and what they get — before you sign",
        "Delivery shown step by step; confirmation as PDF",
      ],
    },
    changes: [
      { problem: "A card number isn't enough to pay", fix: "Push-to-card via Visa Direct / Mastercard Move" },
      { problem: "Exchange costs appear after the fact", fix: "Rate, markup and the amount received are shown before signing" },
    ],
  },
  {
    id: "fees",
    title: "Know what the bank will charge",
    job: "“How much will this month cost us, and why?”",
    today: {
      steps: [
        { channel: "pdf", text: "Read the business price list — a multi-page PDF valid from 31 Aug 2026." },
        { channel: "site", text: "The first 1,000 euro payments a month are free, then €0.38 each." },
        { channel: "site", text: "Fees appear on the statement once they've been charged." },
      ],
      sources: [SRC.priceBiz],
      unverified: "We couldn't see whether the logged-in bank shows a usage counter for the 1,000 free payments.",
    },
    concept: {
      route: "/business/billing",
      routeLabel: "Fees & usage",
      steps: [
        "A meter for the 1,000 free payments and every other allowance",
        "This month's estimate, itemised line by line",
        "The fee is shown before every signature",
        "Fee statements as PDF",
      ],
    },
    changes: [
      { problem: "Prices are in a PDF; usage is invisible", fix: "Live allowances next to the price of the next payment" },
      { problem: "You learn the total after it's charged", fix: "Running estimate and alerts at 50%, 75% and 100%" },
    ],
  },
  {
    id: "errors",
    title: "When something goes wrong",
    job: "“A payment didn't arrive. What happened to the money?”",
    today: {
      steps: [
        { channel: "site", text: "App reviews often mention a generic “Tekkis viga” (“An error occurred”) message." },
        { channel: "site", text: "Some tasks in the app open the web bank instead (limits, international payments)." },
        { channel: "phone", text: "For the reason and next step, contact the bank." },
      ],
      sources: [SRC.appStore, SRC.play, SRC.err],
    },
    concept: {
      route: "/business/payments",
      routeLabel: "Payments",
      steps: [
        "Every payment has a status timeline",
        "Failures say why (e.g. “account closed”) and what happened to the money and the fee",
        "The same timeline appears in the PDF confirmation",
      ],
    },
    changes: [
      { problem: "Generic error messages", fix: "A specific reason and the next step on the payment itself" },
      { problem: "Status lives in a support conversation", fix: "Status, approvals and history in one place" },
    ],
  },
];

/** What the concept relies on that doesn't exist today. */
export const ASSUMPTIONS = [
  "Filing a company with the e-Business Register on the founder's behalf needs an integration with RIK.",
  "Remote onboarding of non-resident owners depends on Swedbank's risk policy; today it needs a branch meeting.",
  "Transfers to cards need Visa Direct / Mastercard Move. The fees shown for them are our proposal, not Swedbank prices.",
  "All other prices come from Swedbank Estonia's price lists. Names, IBANs and transactions in the demo are fictional.",
];

/** The comparison at a glance. */
export const SCOREBOARD: { label: string; today: string; concept: string }[] = [
  { label: "Places you go to start a company", today: "State portal + bank + phone call", concept: "One flow" },
  { label: "Branch visits (non-resident owner)", today: "1 + €300–500 fee", concept: "0 — video check" },
  { label: "Branch visits to change rights", today: "Up to 2 (joint board, signing rights)", concept: "0" },
  { label: "Pay to a card number", today: "Not found", concept: "Yes, with name check" },
  { label: "Fees visible before you sign", today: "In the price list", concept: "On every confirmation" },
  { label: "Status while you wait", today: "Wait for a call", concept: "Live, step by step" },
];
