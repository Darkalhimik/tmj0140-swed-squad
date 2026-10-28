/**
 * Pricing from the Swedbank Estonia price lists valid from 31 Aug 2026
 * (business) and 1 Nov 2025 (private service plans). Usage figures are mock.
 */

export type Allowance = {
  key: string;
  label: string;
  used: number;
  /** null = unlimited */
  included: number | null;
  unit: string;
  /** Price per unit after the allowance is used. 0 = always free. */
  overage: number;
  /** Overrides the generated "then €x per unit" text. */
  overageText?: string;
  /** Amount-based allowances (e.g. free cash up to €2,000) render as money. */
  money?: boolean;
  hint?: string;
  /** Fixed monthly cost of this line (e.g. card fees). */
  monthly?: number;
};

export type Plan = {
  id: string;
  name: string;
  price: number;
  tagline: string;
  highlights: string[];
};

export const RESET_DATE = "2026-11-01T00:00:00+02:00";

// ---------- Personal (service plans since 1 Nov 2025) ----------

export const personalPlans: Plan[] = [
  {
    id: "essential",
    name: "Essential plan",
    price: 1,
    tagline: "Free until 25",
    highlights: ["Unlimited euro payments", "Debit card Plus included", "E-invoices & standing orders", "Free cash up to €2,000/month"],
  },
  {
    id: "purchase",
    name: "Purchase plan",
    price: 2,
    tagline: "Everything in Essential",
    highlights: ["Unlimited euro payments", "Debit card Plus included", "Purchase insurance on card buys", "Free cash up to €2,000/month"],
  },
  {
    id: "travel",
    name: "Travel plan",
    price: 6,
    tagline: "Everything in Purchase",
    highlights: ["Unlimited euro payments", "Debit card Plus included", "Purchase insurance", "Travel insurance worldwide"],
  },
];

export const personalPlanId = "essential";

export const personalAllowances: Allowance[] = [
  { key: "sepa", label: "Euro payments — SEPA, instant, Swedbank", used: 14, included: null, unit: "payment", overage: 0, overageText: "Included in your plan · €0.38 each without a plan" },
  { key: "einvoice", label: "E-invoices & standing orders", used: 5, included: null, unit: "payment", overage: 0 },
  { key: "atm", label: "Cash at Swedbank Group ATMs", used: 60, included: 2000, unit: "€", overage: 0.005, money: true, overageText: "€2,000 free per month · then 0.5%" },
  { key: "atm-other", label: "Cash at other banks' ATMs", used: 0, included: 0, unit: "withdrawal", overage: 2, overageText: "€2.00 + 2.5% per withdrawal" },
  { key: "deposit", label: "Cash deposits at Swedbank ATMs", used: 0, included: 5000, unit: "€", overage: 0, money: true, overageText: "€5,000 free per month" },
];

export const personalFeesByMonth = [
  { label: "May", value: 1 },
  { label: "Jun", value: 1 },
  { label: "Jul", value: 5.75 },
  { label: "Aug", value: 1 },
  { label: "Sep", value: 1 },
  { label: "Oct", value: 1 },
];

// ---------- Business (no package: pay for what you use) ----------

export const businessAllowances: Allowance[] = [
  { key: "payments", label: "Euro payments — SEPA, instant, Swedbank", used: 412, included: 1000, unit: "payment", overage: 0.38, overageText: "1,000 free per month · then €0.38 (€0.16 to Swedbank)" },
  { key: "cards", label: "Business debit cards", used: 5, included: 0, unit: "card", overage: 2, monthly: 10, overageText: "€2.00 per card per month · free in a start-up's first year" },
  { key: "swift", label: "International payments (SWIFT, SHA)", used: 1, included: 0, unit: "payment", overage: 6, overageText: "€6.00 each · plus intermediary bank fees, shown before you send" },
  { key: "requests", label: "Money requests (link or QR)", used: 12, included: 0, unit: "receipt", overage: 0.09, overageText: "€0.09 per payment received" },
  { key: "own", label: "Transfers between own accounts", used: 7, included: null, unit: "transfer", overage: 0 },
  { key: "users", label: "Team members, roles & approval rules", used: 6, included: null, unit: "person", overage: 0, overageText: "Always free — no paid tier for controls" },
];

export const businessFeeHistory = [
  { label: "May", value: 10 },
  { label: "Jun", value: 10.72 },
  { label: "Jul", value: 16 },
  { label: "Aug", value: 10 },
  { label: "Sep", value: 10.54 },
  { label: "Oct", value: 17.08 },
];

export const businessInvoices = [
  { id: "FEE-2026-10", period: "October 2026", amount: 17.08, status: "upcoming" as const, date: "2026-11-05" },
  { id: "FEE-2026-09", period: "September 2026", amount: 10.54, status: "paid" as const, date: "2026-10-05" },
  { id: "FEE-2026-08", period: "August 2026", amount: 10, status: "paid" as const, date: "2026-09-05" },
  { id: "FEE-2026-07", period: "July 2026", amount: 16, status: "paid" as const, date: "2026-08-05" },
];

/** Plain-language price list, grouped (private customers, digital channels). */
export const priceList = [
  {
    group: "Payments",
    items: [
      { label: "Euro payment — SEPA, instant or to Swedbank", price: "Included", note: "In every plan · €0.38 (€0.16 within Swedbank) without a plan" },
      { label: "Urgent euro payment (up to €10,000)", price: "€7.00" },
      { label: "International payment, shared costs (SHA)", price: "€6.00", note: "Intermediary bank fees shown before you send" },
      { label: "International payment, you pay all costs (OUR)", price: "€25.00" },
      { label: "Payment ordered at a branch", price: "€5.00" },
    ],
  },
  {
    group: "Cards & cash",
    items: [
      { label: "Debit card Plus", price: "Included", note: "€1.00/month without a plan" },
      { label: "Cash at Swedbank Group ATMs", price: "Free", note: "Up to €2,000 per month, then 0.5%" },
      { label: "Cash at other banks' ATMs or abroad", price: "€2.00 + 2.5%" },
      { label: "Revolving credit card", price: "€2.00 / month", note: "Free until 25" },
      { label: "Gold revolving credit card", price: "€7.00 / month" },
    ],
  },
  {
    group: "Account",
    items: [
      { label: "Opening an account", price: "Free" },
      { label: "Statement in the internet bank or app", price: "Free" },
      { label: "Statement at a branch or by post", price: "€10.00" },
      { label: "Closing an account", price: "Free" },
    ],
  },
];
