import { CreditCard, Smartphone } from "lucide-react";
import { permissions, roleMeta } from "@/lib/data/business";
import { money } from "@/lib/format";
import type { Member, RoleId } from "@/lib/types";

export const ROLE_ORDER: RoleId[] = ["owner", "admin", "accountant", "employee", "viewer"];

/** Short "what can they do" line built from the permission matrix. */
export function capabilities(role: RoleId, max = 3) {
  return permissions
    .filter((p) => p.roles[role])
    .slice(0, max)
    .map((p) => {
      const label = p.label.charAt(0).toLowerCase() + p.label.slice(1);
      return p.roles[role] === "limit" ? `${label} (within limit)` : label;
    });
}

export function signingLines(m: Member): [string, string] {
  const represent = m.board ? "Board member · represents alone" : null;
  if (m.role === "owner") return [represent ?? "Signs agreements", "Approves any amount"];
  if (m.role === "admin")
    return [represent ?? "Manages people & cards", m.approvalLimit === null ? "Approves any amount" : `Approves up to ${money(m.approvalLimit, {}).replace(".00", "")}`];
  if (m.role === "accountant") return ["Prepares payments", "Can't approve"];
  if (m.role === "employee") return ["Own card only", "Can't approve"];
  return ["Read-only", "Can't approve"];
}

export function permissionDiff(from: RoleId, to: RoleId) {
  const gained: string[] = [];
  const lost: string[] = [];
  for (const p of permissions) {
    const a = p.roles[from];
    const b = p.roles[to];
    if (a === b) continue;
    if (!a && b) gained.push(b === "limit" ? `${p.label} (within their limit)` : p.label);
    else if (a && !b) lost.push(p.label);
    else if (b === "limit") lost.push(`${p.label} above their limit`);
    else gained.push(`${p.label} without a limit`);
  }
  return { gained, lost };
}

export function AuthMethod({ method }: { method: Member["auth"] }) {
  const Icon = method === "ID-card" ? CreditCard : Smartphone;
  return (
    <span className="inline-flex items-center gap-1.5 text-[13px] text-ink-2">
      <Icon className="size-3.5 text-ink-3" />
      {method}
    </span>
  );
}

export function roleLabel(role: RoleId) {
  return roleMeta[role].label;
}
