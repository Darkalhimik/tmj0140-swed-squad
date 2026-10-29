import type { AuditEvent } from "@/lib/types";

export type ActivityCategory = "payments" | "access" | "cards" | "security";

const verbs: Record<string, string> = {
  "auth.login": "signed in to",
  "card.authorised": "authorised a card payment on",
  "card.frozen": "froze card",
  "card.unfrozen": "unfroze card",
  "card.limit_changed": "changed the limit of card",
  "card.issued": "issued card",
  "card.updated": "updated card",
  "payment.created": "created payment",
  "payment.approved": "approved payment",
  "payment.rejected": "rejected payment",
  "payment.received": "received a payment from",
  "payment.returned": "got a returned payment",
  "transfer.internal": "moved money",
  "rule.updated": "changed approval rule",
  "member.invited": "invited",
  "member.role_changed": "changed the role of",
  "member.limit_changed": "changed the approval limit of",
  "member.removed": "removed",
  "invite.revoked": "revoked the invitation for",
  "invite.resent": "resent the invitation to",
  "export.created": "exported",
  "statement.downloaded": "downloaded a statement for",
  "kyc.reminder": "sent a reminder about",
  "kyc.confirmed": "confirmed",
  "limits.changed": "changed",
  "login.countries_changed": "changed login countries for",
  "account.opened": "opened sub-account",
  "integration.connected": "connected",
  "integration.disconnected": "disconnected",
};

export function verb(action: string) {
  return verbs[action] ?? action.replace(/[._]/g, " ");
}

export function categoryOf(action: string): ActivityCategory {
  const p = action.split(".")[0];
  if (p === "payment" || p === "rule" || p === "transfer") return "payments";
  if (p === "member" || p === "invite") return "access";
  if (p === "card") return "cards";
  return "security";
}

/** Splits "Monthly limit €1,000 → €1,500" into a label and before/after values. */
export function parseDiff(detail?: string) {
  if (!detail || !detail.includes("→")) return null;
  const [left, right] = detail.split("→").map((s) => s.trim()) as [string, string];
  const labels = ["Approval limit", "Monthly limit", "Daily limit", "Threshold", "Instant limit"];
  const known = labels.find((l) => left.startsWith(l + " "));
  if (known) return { label: known, before: left.slice(known.length).trim(), after: right };
  const idx = left.search(/[€\d]/);
  if (idx > 0) return { label: left.slice(0, idx).trim(), before: left.slice(idx).trim(), after: right };
  return { label: "", before: left, after: right };
}

export function requestId(e: AuditEvent) {
  let h = 2166136261;
  for (const c of e.id + e.at + e.action) h = Math.imul(h ^ c.charCodeAt(0), 16777619);
  return `req_${(h >>> 0).toString(36).padStart(7, "0")}${e.id.replace("a-", "")}`;
}

