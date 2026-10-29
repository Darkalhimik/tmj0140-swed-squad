"use client";

import type { CompanyProfile } from "@/lib/types";

/** The company a business document is issued for, with its main account. */
export type DocCompany = Pick<CompanyProfile, "name" | "address" | "registryCode"> & { iban: string };
import { person, personalAccounts } from "@/lib/data/personal";
import { fmtDate, NOW } from "@/lib/format";
import type { BizPayment, Txn } from "@/lib/types";
import { feeStatementPdf, invoicePdf, paymentConfirmationPdf } from "./pdf";

const BANKS: Record<string, string> = {
  "22": "Swedbank",
  "10": "SEB",
  "77": "LHV Pank",
  "17": "Luminor",
  "96": "Luminor",
  "42": "Coop Pank",
};

export function bankOf(iban: string) {
  const clean = iban.replace(/\s+/g, "");
  if (clean.startsWith("EE")) return BANKS[clean.slice(4, 6)] ?? "Estonian bank";
  if (clean.startsWith("GB")) return "UK bank (SWIFT)";
  return "Bank detected from IBAN";
}

const SCHEME: Partial<Record<Txn["method"], string>> = {
  instant: "SEPA Instant",
  sepa: "SEPA",
  einvoice: "E-invoice (SEPA)",
  standing: "Standing order (SEPA)",
  card: "Card payment (Visa)",
  atm: "Cash withdrawal",
  fee: "Bank fee",
  internal: "Between own accounts",
  tocard: "Transfer to card (Visa Direct / Mastercard Move)",
};

/** Confirmation for any transaction opened in the transaction drawer. */
export async function downloadTxnConfirmation(txn: Txn, company?: DocCompany) {
  const business = txn.accountId.startsWith("b-") && !!company;
  const account = business ? { iban: company!.iban } : personalAccounts.find((a) => a.id === txn.accountId)!;
  const owner = business ? company!.name : person.name;
  const incoming = txn.amount > 0;
  const other = { name: txn.counterparty, iban: txn.iban ?? "—", bank: txn.iban ? bankOf(txn.iban) : txn.method === "card" ? "Card network" : undefined };
  const self = { name: owner, iban: account.iban };
  const filename = `confirmation-${txn.id}.pdf`;
  await paymentConfirmationPdf({
    filename,
    id: txn.id.toUpperCase(),
    status: txn.status === "pending" ? "Pending (reserved)" : txn.status === "declined" ? "Declined" : txn.status === "refunded" ? "Refunded" : "Booked",
    payer: incoming ? { name: other.name, iban: other.iban } : self,
    beneficiary: incoming ? { ...self, bank: "Swedbank" } : other,
    amount: Math.abs(txn.amount),
    fee: txn.fee ?? 0,
    scheme: SCHEME[txn.method] ?? "SEPA",
    reference: [txn.reference, txn.location].filter(Boolean).join(" · "),
    createdAt: txn.at,
    executedAt: txn.status === "pending" ? undefined : txn.at,
    arrival: txn.method === "instant" ? "Within seconds" : txn.method === "card" ? "Settled by the merchant" : "Next business day",
    signedBy: business ? "Swedbank (system)" : person.name,
  });
  return filename;
}

/** Confirmation for a business payment, including its approval trail. */
export async function downloadBizPaymentConfirmation(p: BizPayment, nameOf: (id: string) => string, company: DocCompany) {
  const chain = [
    { label: `Created by ${nameOf(p.createdBy)}`, at: p.createdAt },
    ...p.approvals.map((a, i) => ({ label: `Approved by ${nameOf(a.memberId)} (${i + 1} of ${p.required}) · Smart-ID`, at: a.at })),
    ...(p.status === "sent" ? [{ label: `Sent via ${p.scheme}`, at: p.executeAt }] : []),
    ...(p.status === "failed" && p.failure ? [{ label: `Returned: ${p.failure}`, at: p.executeAt }] : []),
    ...(p.rejectedBy ? [{ label: `Rejected by ${nameOf(p.rejectedBy.memberId)}: ${p.rejectedBy.reason}`, at: p.rejectedBy.at }] : []),
  ];
  const filename = `${p.id.toLowerCase()}-confirmation.pdf`;
  await paymentConfirmationPdf({
    filename,
    id: p.id,
    status: { draft: "Draft", awaiting: "Waiting for approval", scheduled: "Scheduled", processing: "Processing", sent: "Executed", rejected: "Rejected", failed: "Returned" }[p.status],
    payer: { name: company.name, iban: company.iban },
    beneficiary: { name: p.beneficiary, iban: p.iban, bank: p.bulk ? `${p.bulk} recipients` : bankOf(p.iban) },
    amount: p.amount,
    fee: p.fee,
    scheme: p.scheme,
    reference: p.reference,
    createdAt: p.createdAt,
    executedAt: p.status === "sent" ? p.executeAt : undefined,
    arrival: p.scheme === "SEPA Instant" ? "Within seconds of approval" : p.scheme === "SWIFT" ? "1–3 business days" : "Next business day",
    chain,
    signedBy: p.approvals.length ? nameOf(p.approvals.at(-1)!.memberId) : nameOf(p.createdBy),
  });
  return filename;
}

/** Confirmation right after a personal payment is signed. */
export async function downloadPersonalPaymentConfirmation(o: {
  name: string;
  iban: string;
  bank: string | null;
  amount: number;
  description: string;
  refNo: string;
  instant: boolean;
  scheduled: string | null;
}) {
  const filename = `payment-confirmation-${NOW.toISOString().slice(0, 10)}.pdf`;
  await paymentConfirmationPdf({
    filename,
    id: `PMT-${Math.round(o.amount * 100)}-${o.iban.replace(/\s/g, "").slice(-4)}`,
    status: o.scheduled ? `Scheduled for ${fmtDate(o.scheduled, "long")}` : o.instant ? "Executed" : "Processing",
    payer: { name: person.name, iban: personalAccounts[0]!.iban },
    beneficiary: { name: o.name, iban: o.iban.replace(/\s/g, ""), bank: o.bank ?? bankOf(o.iban) },
    amount: o.amount,
    fee: 0,
    scheme: o.instant ? "SEPA Instant" : "SEPA",
    reference: [o.description, o.refNo && `Ref. ${o.refNo}`].filter(Boolean).join(" · "),
    createdAt: NOW.toISOString(),
    executedAt: o.scheduled || !o.instant ? undefined : NOW.toISOString(),
    arrival: o.scheduled ? "On the scheduled date" : o.instant ? "Arrived in 4 seconds" : "Next business day, 14:00",
    signedBy: person.name,
  });
  return filename;
}

/** The supplier invoice attached to a payment request. */
export async function downloadInvoice(p: BizPayment, company: DocCompany) {
  const filename = p.attachment ?? `${p.id.toLowerCase()}-invoice.pdf`;
  const number = p.reference.match(/(?:invoice|order|arve)[\s-]*([\w-]+)/i)?.[1] ?? p.id.replace("PAY-", "");
  await invoicePdf({
    filename,
    supplier: p.beneficiary,
    supplierIban: p.iban,
    customer: `${company.name} · ${company.address}`,
    number,
    issued: p.createdAt,
    due: p.executeAt,
    description: p.reference,
    amount: p.amount,
  });
  return filename;
}

/** Itemised fee statement for one month (business has no package — usage only). */
export async function downloadFeeStatement(
  inv: { id: string; period: string; amount: number; status: "upcoming" | "paid"; date: string },
  company: Pick<CompanyProfile, "name" | "registryCode">,
  iban: string,
  paymentsUsed = 0,
) {
  const cards = inv.amount >= 10 ? 5 : 0;
  let rest = Math.round((inv.amount - cards * 2) * 100) / 100;
  const swift = rest >= 6 ? 1 : 0;
  rest = Math.round((rest - swift * 6) * 100) / 100;
  const requests = Math.round(rest / 0.09);
  const lines = [
    { label: "Euro payments — SEPA, instant, Swedbank (within 1,000 free)", qty: inv.status === "upcoming" ? String(paymentsUsed) : "—", unit: "€0.00", amount: 0 },
    { label: "Business debit cards", qty: String(cards), unit: "€2.00", amount: cards * 2 },
    ...(swift ? [{ label: "International payment (SWIFT, SHA)", qty: String(swift), unit: "€6.00", amount: swift * 6 }] : []),
    ...(requests ? [{ label: "Money requests (link or QR)", qty: String(requests), unit: "€0.09", amount: Math.round(requests * 9) / 100 }] : []),
  ];
  const filename = `${inv.id.toLowerCase()}.pdf`;
  await feeStatementPdf({
    filename,
    id: inv.id,
    company: company.name,
    registryCode: company.registryCode,
    period: inv.period,
    status: inv.status === "upcoming" ? "estimate — final amount on 1 Nov" : "charged",
    chargeDate: `${inv.date}T09:00:00+02:00`,
    account: `Main account · ${iban.slice(-4)}`,
    lines,
    total: inv.amount,
    note:
      inv.status === "upcoming"
        ? "This is an estimate based on usage so far. Usage updates every few minutes; the final statement is issued on 1 November."
        : "No monthly account fee. Roles, approval rules and the activity log are free on every business account.",
  });
  return filename;
}

/** Confirmation for a push-to-card transfer (Visa Direct / Mastercard Move). */
export async function downloadCardTransferConfirmation(o: {
  holder: string | null;
  last4: string;
  network: string;
  issuer: { bank: string; country: string; currency: string; swedbank?: boolean };
  value: number;
  fee: number;
  received: number;
  message: string;
}) {
  const filename = `card-transfer-${o.last4}-${NOW.toISOString().slice(0, 10)}.pdf`;
  const via = o.network === "Mastercard" ? "Mastercard Move" : "Visa Direct";
  await paymentConfirmationPdf({
    filename,
    id: `CTR-${Math.round(o.value * 100)}-${o.last4}`,
    status: o.issuer.swedbank ? "Credited" : "Sent · crediting the card",
    payer: { name: person.name, iban: personalAccounts[0]!.iban },
    beneficiary: {
      name: o.holder ?? "Card owner (name not returned)",
      iban: `Card ${o.network} •••• ${o.last4}`,
      bank: `${o.issuer.bank}, ${o.issuer.country}`,
    },
    amount: o.value,
    fee: o.fee,
    scheme: `Transfer to card · ${via}`,
    reference: [
      o.message,
      o.issuer.currency !== "EUR" ? `Recipient gets ${o.received.toFixed(2)} ${o.issuer.currency}` : null,
    ]
      .filter(Boolean)
      .join(" · "),
    createdAt: NOW.toISOString(),
    executedAt: NOW.toISOString(),
    arrival: o.issuer.swedbank ? "Instantly" : "Usually within 30 minutes",
    signedBy: person.name,
  });
  return filename;
}
