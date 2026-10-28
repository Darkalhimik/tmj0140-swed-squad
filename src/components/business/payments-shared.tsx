import { businessAllowances } from "@/lib/data/pricing";
import { fmtDateTime } from "@/lib/format";
import type { ApprovalRule, BizPayment, Member, PaymentStatus } from "@/lib/types";
import type { Status } from "@/components/ui/status-dot";

export const statusMeta: Record<PaymentStatus, { label: string; dot: Status }> = {
  draft: { label: "Draft", dot: "neutral" },
  awaiting: { label: "Needs approval", dot: "pending" },
  scheduled: { label: "Scheduled", dot: "info" },
  processing: { label: "Processing", dot: "pending" },
  sent: { label: "Sent", dot: "ready" },
  rejected: { label: "Rejected", dot: "neutral" },
  failed: { label: "Returned", dot: "error" },
};

const EE_BANKS: Record<string, string> = {
  "22": "Swedbank",
  "10": "SEB",
  "77": "LHV Pank",
  "17": "Luminor",
  "96": "Luminor",
  "42": "Coop Pank",
  "75": "Bigbank",
  "00": "Eesti Pank",
};

const SEPA = new Set(
  "EE LV LT FI SE DE FR NL BE ES IT PT IE AT PL DK NO CZ SK SI HR HU RO BG GR CY MT LU IS LI CH MC SM".split(" "),
);

export type IbanCheck =
  | { state: "empty" }
  | { state: "invalid"; message: string }
  | { state: "valid"; country: string; bank: string; scheme: BizPayment["scheme"] };

export function checkIban(raw: string): IbanCheck {
  const v = raw.replace(/\s+/g, "").toUpperCase();
  if (!v) return { state: "empty" };
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(v)) return { state: "invalid", message: "An IBAN starts with a country code and two check digits, e.g. EE38 2200…" };
  const country = v.slice(0, 2);
  if (country === "EE") {
    if (v.length !== 20) return { state: "invalid", message: `Estonian IBANs have 20 characters — this one has ${v.length}.` };
    const bank = EE_BANKS[v.slice(4, 6)] ?? "Estonian bank";
    return { state: "valid", country, bank, scheme: "SEPA Instant" };
  }
  if (v.length < 15 || v.length > 34) return { state: "invalid", message: "That doesn't look like a complete IBAN." };
  if (SEPA.has(country)) return { state: "valid", country, bank: `${country} bank`, scheme: "SEPA" };
  return { state: "valid", country, bank: `${country} bank (outside SEPA)`, scheme: "SWIFT" };
}

export function ruleFor(amount: number, rules: ApprovalRule[]) {
  return rules.find((r) => amount >= r.min && (r.max === null || amount < r.max)) ?? rules[rules.length - 1]!;
}

export function rangeLabel(r: ApprovalRule) {
  const f = (n: number) => `€${n.toLocaleString("en-IE")}`;
  if (r.max === null) return `${f(r.min)} and above`;
  if (r.min === 0) return `Up to ${f(r.max)}`;
  return `${f(r.min)} – ${f(r.max)}`;
}

/** People allowed to approve under a rule, excluding the creator and those who already approved. */
export function eligibleApprovers(p: Pick<BizPayment, "ruleId" | "createdBy" | "approvals" | "amount" | "newBeneficiary">, rules: ApprovalRule[], members: Member[]) {
  const rule = rules.find((r) => r.id === p.ruleId) ?? ruleFor(p.amount, rules);
  const boardOnly = rule.id !== "r-1" || p.newBeneficiary;
  return members.filter(
    (m) =>
      m.status === "active" &&
      m.id !== p.createdBy &&
      !p.approvals.some((a) => a.memberId === m.id) &&
      (boardOnly ? m.board : m.role === "owner" || m.role === "admin") &&
      (m.approvalLimit === null || m.approvalLimit >= p.amount || rule.approvers > 1),
  );
}

/** Free euro payments this month (412 already used). */
export function freePaymentsUsed(extra = 0) {
  const a = businessAllowances.find((x) => x.key === "payments");
  return { used: (a?.used ?? 412) + extra, included: a?.included ?? 1000 };
}

export function feeFor(scheme: BizPayment["scheme"]) {
  return scheme === "SWIFT" ? 6 : 0;
}

export function arrivalText(scheme: BizPayment["scheme"], executeAt?: string) {
  const when = executeAt ? ` from ${fmtDateTime(executeAt)}` : "";
  if (scheme === "SEPA Instant") return `Arrives within seconds of the last approval${when}`;
  if (scheme === "SEPA") return `Arrives by the next business day${when}`;
  return `Arrives in 1–3 business days${when}. Intermediary banks may deduct their fees.`;
}

type Step = { label: string; at?: string; state: "done" | "current" | "todo" | "failed"; note?: string };

export function paymentTimeline(p: BizPayment, members: Member[], rules: ApprovalRule[]): Step[] {
  const name = (id: string) => members.find((m) => m.id === id)?.name ?? "A former member";
  const steps: Step[] = [{ label: `Created by ${name(p.createdBy)}`, at: p.createdAt, state: "done", note: p.attachment ? `Invoice attached: ${p.attachment}` : undefined }];
  for (const a of p.approvals) steps.push({ label: `Approved by ${name(a.memberId)}`, at: a.at, state: "done", note: "Signed with Smart-ID" });

  if (p.status === "rejected" && p.rejectedBy) {
    steps.push({ label: `Rejected by ${name(p.rejectedBy.memberId)}`, at: p.rejectedBy.at, state: "failed", note: `“${p.rejectedBy.reason}” · No money left the account.` });
    return steps;
  }
  if (p.status === "awaiting") {
    const left = p.required - p.approvals.length;
    const who = eligibleApprovers(p, rules, members).map((m) => m.name);
    steps.push({
      label: `Waiting for ${left} more approval${left > 1 ? "s" : ""}`,
      state: "current",
      note: who.length ? `Can approve: ${who.join(", ")}` : "Nobody eligible can approve yet — check the approval rules.",
    });
    steps.push({ label: `Scheduled for ${fmtDateTime(p.executeAt)}`, state: "todo" });
    steps.push({ label: "Sent", state: "todo" });
    return steps;
  }
  if (p.status === "scheduled") {
    steps.push({ label: `Scheduled for ${fmtDateTime(p.executeAt)}`, state: "current", note: "Fully approved. You can still cancel until it's sent." });
    steps.push({ label: "Sent", state: "todo" });
    steps.push({ label: "Received by the beneficiary's bank", state: "todo" });
    return steps;
  }
  if (p.status === "failed") {
    steps.push({ label: `Sent via ${p.scheme}`, at: p.executeAt, state: "done" });
    steps.push({ label: "Returned by the beneficiary's bank", at: new Date(new Date(p.executeAt).getTime() + 26 * 3600_000).toISOString(), state: "failed", note: p.failure });
    return steps;
  }
  steps.push({ label: `Sent via ${p.scheme}`, at: p.executeAt, state: "done" });
  steps.push({
    label: "Received by the beneficiary's bank",
    at: p.scheme === "SEPA Instant" ? p.executeAt : new Date(new Date(p.executeAt).getTime() + 5 * 3600_000).toISOString(),
    state: "done",
    note: p.scheme === "SEPA Instant" ? "Arrived in 4 seconds" : undefined,
  });
  return steps;
}
