export type ISO = string;

export type Category =
  | "groceries"
  | "eating-out"
  | "transport"
  | "bills"
  | "shopping"
  | "entertainment"
  | "health"
  | "income"
  | "transfers"
  | "savings"
  | "fees"
  | "cash"
  | "software"
  | "office"
  | "salaries"
  | "taxes"
  | "travel"
  | "services";

export type TxnStatus = "pending" | "booked" | "declined" | "refunded";

export type Method = "card" | "sepa" | "instant" | "einvoice" | "standing" | "fee" | "interest" | "atm" | "internal" | "tocard";

export type Txn = {
  id: string;
  accountId: string;
  at: ISO;
  counterparty: string;
  category: Category;
  amount: number;
  status: TxnStatus;
  method: Method;
  cardId?: string;
  iban?: string;
  reference?: string;
  fee?: number;
  location?: string;
  note?: string;
  bookedAt?: ISO;
  /** Business only: who triggered it. */
  memberId?: string;
  receipt?: boolean;
  /** Push-to-card transfer (Visa Direct / Mastercard Move). */
  toCard?: { last4: string; network: string; bank: string; country: string };
  /** This line refunds another transaction (by id). */
  refundOf?: string;
  /** Set when the recipient's card is in another currency. */
  fx?: { currency: string; rate: number; mid: number; received: number };
};

export type AccountKind = "current" | "savings" | "funds" | "pension" | "tax";

export type Account = {
  id: string;
  name: string;
  kind: AccountKind;
  iban: string;
  balance: number;
  /** Optional goal for savings pots. */
  goal?: { name: string; target: number };
  returnPct?: number;
};

export type CardDesign = "orange" | "brown" | "cream" | "graphite";

export type Card = {
  id: string;
  name: string;
  holder: string;
  memberId?: string;
  last4: string;
  kind: "debit" | "credit" | "virtual";
  network: "Visa" | "Mastercard";
  design: CardDesign;
  expiry: string;
  frozen: boolean;
  limits: { label: string; used: number; max: number; period: "day" | "month" }[];
  settings: { online: boolean; contactless: boolean; abroad: boolean; atm: boolean };
  creditLimit?: number;
};

export type RoleId = "owner" | "admin" | "accountant" | "employee" | "viewer";

export type Member = {
  id: string;
  name: string;
  email: string;
  role: RoleId;
  title: string;
  board: boolean;
  signing: "alone" | "jointly" | "none";
  /** Max amount this person can approve on their own. null = no limit. */
  approvalLimit: number | null;
  auth: "Smart-ID" | "Mobile-ID" | "ID-card";
  joinedAt: ISO;
  lastActiveAt: ISO;
  external?: string;
  status: "active" | "suspended";
};

export type Invite = {
  id: string;
  email: string;
  role: RoleId;
  invitedBy: string;
  at: ISO;
  expiresAt: ISO;
};

export type PaymentStatus = "draft" | "awaiting" | "scheduled" | "processing" | "sent" | "rejected" | "failed";

export type BizPayment = {
  id: string;
  createdAt: ISO;
  createdBy: string;
  beneficiary: string;
  iban: string;
  amount: number;
  reference: string;
  scheme: "SEPA Instant" | "SEPA" | "SWIFT";
  status: PaymentStatus;
  executeAt: ISO;
  ruleId: string;
  approvals: { memberId: string; at: ISO }[];
  required: number;
  fee: number;
  attachment?: string;
  newBeneficiary?: boolean;
  bulk?: number;
  failure?: string;
  rejectedBy?: { memberId: string; at: ISO; reason: string };
};

export type ApprovalRule = {
  id: string;
  name: string;
  min: number;
  max: number | null;
  approvers: number;
  who: string;
};

export type AuditEvent = {
  id: string;
  at: ISO;
  actor: string; // member id or "system"
  action: string; // e.g. "payment.approved"
  target: string;
  detail?: string;
  ip: string;
  device: string;
};

export type Notification = {
  id: string;
  at: ISO;
  title: string;
  body: string;
  scope: "personal" | "business";
  unread: boolean;
  href?: string;
};

export type CompanyProfile = {
  id: string;
  name: string;
  short: string;
  registryCode: string;
  vat: string | null;
  founded: string;
  address: string;
  emtak: string;
  employees: number;
  kyc: { lastReviewed: string; nextReview: string; risk: string };
  board: string[];
  owners: { name: string; share: number }[];
  representation: "alone" | "joint";
  mark: { letter: string; bg: string; fg: string };
  /** Registered or onboarded in this session. */
  isNew?: boolean;
};

export type CompanyLimits = {
  daily: { used: number; max: number };
  monthly: { used: number; max: number };
  instantDaily: { used: number; max: number };
  instantPerPayment: number;
  selfServiceMax: { daily: number; monthly: number };
  secondApprovalFrom: number;
  loginCountries: string[];
};
