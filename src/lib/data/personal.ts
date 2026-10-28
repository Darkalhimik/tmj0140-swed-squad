import type { Account, Card, Txn } from "@/lib/types";

export const person = {
  name: "Mari Tamm",
  firstName: "Mari",
  email: "mari.tamm@gmail.com",
  phone: "+372 5123 4567",
  idCode: "49203150123",
  city: "Tallinn",
  customerSince: "2009-06-12",
};

export const personalAccounts: Account[] = [
  { id: "p-main", name: "Everyday account", kind: "current", iban: "EE382200221020145685", balance: 3482.17 },
  {
    id: "p-save",
    name: "Summer house",
    kind: "savings",
    iban: "EE562200221077312408",
    balance: 12640,
    goal: { name: "Summer house in Haapsalu", target: 20000 },
  },
  { id: "p-funds", name: "Funds", kind: "funds", iban: "EE292200221065209331", balance: 8210.55, returnPct: 6.4 },
  { id: "p-pension", name: "Pension II pillar", kind: "pension", iban: "EE712200221049981127", balance: 21904.12, returnPct: 4.1 },
];

const t = (
  id: string,
  at: string,
  counterparty: string,
  amount: number,
  category: Txn["category"],
  method: Txn["method"],
  extra: Partial<Txn> = {},
): Txn => ({ id, at, counterparty, amount, category, method, status: "booked", accountId: "p-main", ...extra });

export const personalTxns: Txn[] = [
  t("pt-01", "2026-10-29T09:41:00+02:00", "Baltic Craft Coffee", -4.6, "eating-out", "card", { status: "pending", cardId: "pc-debit", location: "Telliskivi 60a, Tallinn" }),
  t("pt-02", "2026-10-29T08:12:00+02:00", "Bolt", -6.9, "transport", "card", { status: "pending", cardId: "pc-debit", location: "Tallinn" }),
  t("pt-03", "2026-10-28T19:03:00+02:00", "Rimi", -48.37, "groceries", "card", { cardId: "pc-debit", location: "Rimi Hyper, Sõpruse pst 174" }),
  t("pt-04", "2026-10-28T13:20:00+02:00", "Wolt", -17.8, "eating-out", "card", { cardId: "pc-virtual" }),
  t("pt-05", "2026-10-28T07:55:00+02:00", "Elron", -2.6, "transport", "card", { cardId: "pc-debit" }),
  t("pt-06", "2026-10-27T18:44:00+02:00", "Apollo Kino", -21, "entertainment", "card", { cardId: "pc-debit", location: "Solaris, Tallinn" }),
  t("pt-07", "2026-10-27T12:10:00+02:00", "Kalamaja Pagar", -7.4, "eating-out", "card", { cardId: "pc-debit" }),
  t("pt-08", "2026-10-26T16:31:00+02:00", "Zara", -59.99, "shopping", "card", { cardId: "pc-credit", location: "Viru Keskus" }),
  t("pt-09", "2026-10-26T10:02:00+02:00", "Kristjan Tamm", 35, "transfers", "instant", {
    iban: "EE391010220263145678",
    reference: "Dinner split 🍝",
  }),
  t("pt-10", "2026-10-25T14:22:00+03:00", "Selver", -31.12, "groceries", "card", { cardId: "pc-debit" }),
  t("pt-11", "2026-10-24T20:15:00+03:00", "Spotify", -11.99, "entertainment", "card", { cardId: "pc-virtual" }),
  t("pt-12", "2026-10-24T09:00:00+03:00", "Telia Eesti AS", -24.9, "bills", "einvoice", {
    reference: "Invoice 2026-10 / client 4471203",
    iban: "EE481010220000256019",
  }),
  t("pt-13", "2026-10-23T17:48:00+03:00", "Circle K", -52.4, "transport", "card", { cardId: "pc-debit", location: "Pärnu mnt 139" }),
  t("pt-14", "2026-10-22T12:30:00+03:00", "Apotheka", -14.85, "health", "card", { cardId: "pc-debit" }),
  t("pt-15", "2026-10-21T19:20:00+03:00", "Prisma", -63.08, "groceries", "card", { cardId: "pc-debit" }),
  t("pt-16", "2026-10-20T08:00:00+03:00", "Netflix", -9.99, "entertainment", "card", { cardId: "pc-virtual", status: "declined", note: "Virtual card was frozen at the time" }),
  t("pt-17", "2026-10-19T11:11:00+03:00", "Pirita Kohvik", -26.5, "eating-out", "card", { cardId: "pc-credit" }),
  t("pt-18", "2026-10-17T09:00:00+03:00", "Eesti Energia AS", -61.2, "bills", "einvoice", {
    reference: "E-invoice 10/2026 · automatic payment",
    iban: "EE892200001120228796",
  }),
  t("pt-19", "2026-10-16T15:40:00+03:00", "Kaubamaja", -89, "shopping", "card", { cardId: "pc-credit", status: "refunded", note: "Refund received 18 Oct" }),
  t("pt-20", "2026-10-15T07:30:00+03:00", "Nordlight Studio OÜ", 3150, "income", "sepa", {
    iban: "EE062200221077885511",
    reference: "Salary October 2026",
  }),
  t("pt-21", "2026-10-15T07:31:00+03:00", "Summer house", -400, "savings", "internal", { reference: "Auto-save rule: 10% of salary" }),
  t("pt-22", "2026-10-14T18:05:00+03:00", "Lidl Eesti", -27.55, "groceries", "card", { cardId: "pc-debit" }),
  t("pt-23", "2026-10-12T21:44:00+03:00", "Bolt Food", -22.3, "eating-out", "card", { cardId: "pc-virtual" }),
  t("pt-24", "2026-10-10T10:00:00+03:00", "ATM Viru väljak", -60, "transfers", "atm", { cardId: "pc-debit", fee: 0 }),
  t("pt-25", "2026-10-08T09:00:00+03:00", "Tallinna Vesi", -18.4, "bills", "einvoice", { iban: "EE162200001120000123" }),
  t("pt-26", "2026-10-05T12:00:00+03:00", "Swedbank", -1, "fees", "fee", { reference: "Essential plan · October" }),
  t("pt-27", "2026-10-01T09:00:00+03:00", "Landlord — Peeter Vaher", -650, "bills", "standing", {
    iban: "EE221010220034567812",
    reference: "Rent October, Kalamaja",
  }),
  t("pt-28", "2026-10-01T09:01:00+03:00", "Funds", -150, "savings", "internal", { reference: "Monthly fund investment" }),
];

export const personalCards: Card[] = [
  {
    id: "pc-debit",
    name: "Visa Debit",
    holder: "MARI TAMM",
    last4: "4821",
    kind: "debit",
    network: "Visa",
    design: "orange",
    expiry: "08/29",
    frozen: false,
    limits: [
      { label: "Card payments", used: 312.4, max: 3000, period: "day" },
      { label: "ATM withdrawals", used: 60, max: 1000, period: "day" },
      { label: "Online payments", used: 471.2, max: 2000, period: "month" },
    ],
    settings: { online: true, contactless: true, abroad: true, atm: true },
  },
  {
    id: "pc-credit",
    name: "Mastercard Credit",
    holder: "MARI TAMM",
    last4: "7730",
    kind: "credit",
    network: "Mastercard",
    design: "brown",
    expiry: "03/28",
    frozen: false,
    creditLimit: 2000,
    limits: [
      { label: "Credit used", used: 412.49, max: 2000, period: "month" },
      { label: "Card payments", used: 0, max: 2000, period: "day" },
    ],
    settings: { online: true, contactless: true, abroad: false, atm: false },
  },
  {
    id: "pc-virtual",
    name: "Subscriptions",
    holder: "MARI TAMM",
    last4: "1964",
    kind: "virtual",
    network: "Visa",
    design: "cream",
    expiry: "11/27",
    frozen: false,
    limits: [{ label: "Online payments", used: 61.97, max: 150, period: "month" }],
    settings: { online: true, contactless: false, abroad: true, atm: false },
  },
];

export type Upcoming = {
  id: string;
  at: string;
  counterparty: string;
  amount: number;
  kind: "E-invoice" | "Standing order" | "Auto-save" | "Card subscription";
  auto: boolean;
};

export const upcoming: Upcoming[] = [
  { id: "up-1", at: "2026-11-01T09:00:00+02:00", counterparty: "Landlord — Peeter Vaher", amount: -650, kind: "Standing order", auto: true },
  { id: "up-2", at: "2026-11-01T09:01:00+02:00", counterparty: "Funds", amount: -150, kind: "Auto-save", auto: true },
  { id: "up-3", at: "2026-11-03T09:00:00+02:00", counterparty: "Telia Eesti AS", amount: -24.9, kind: "E-invoice", auto: false },
  { id: "up-4", at: "2026-11-17T09:00:00+02:00", counterparty: "Eesti Energia AS", amount: -58.75, kind: "E-invoice", auto: true },
  { id: "up-5", at: "2026-11-24T09:00:00+02:00", counterparty: "Spotify", amount: -11.99, kind: "Card subscription", auto: true },
];

/** Saved payees for the quick-pay row. */
export const payees = [
  { name: "Kristjan Tamm", iban: "EE391010220263145678" },
  { name: "Landlord — Peeter Vaher", iban: "EE221010220034567812" },
  { name: "Liisa Kask", iban: "EE942200221045558871" },
  { name: "Tallinna Vesi", iban: "EE162200001120000123" },
];

export const balanceHistory = [3120, 2980, 3410, 3302, 3189, 6210, 5640, 5210, 4880, 4512, 4166, 3910, 3702, 3482];

export const consents = [
  { id: "c-1", app: "Toshl Finance", purpose: "Read balances and transactions", scope: "Everyday account", granted: "2026-03-02", expires: "2026-12-01", lastUsed: "2026-10-28T22:10:00+02:00" },
  { id: "c-2", app: "Montonio", purpose: "Initiate one-off payments at checkout", scope: "Everyday account", granted: "2025-11-19", expires: "2026-11-19", lastUsed: "2026-10-12T14:02:00+03:00" },
  { id: "c-3", app: "Bigbank", purpose: "Read account information for a loan application", scope: "All accounts", granted: "2026-01-08", expires: "2026-04-08", lastUsed: "2026-01-08T10:00:00+02:00", expired: true },
];

export const devices = [
  { id: "d-1", name: "Chrome on macOS", place: "Tallinn, EE", lastSeen: "2026-10-29T10:20:00+02:00", current: true, method: "Smart-ID" },
  { id: "d-2", name: "Swedbank app · iPhone 16", place: "Tallinn, EE", lastSeen: "2026-10-29T08:12:00+02:00", method: "Biometrics" },
  { id: "d-3", name: "Safari on iPad", place: "Tartu, EE", lastSeen: "2026-10-18T19:44:00+03:00", method: "Smart-ID" },
];
