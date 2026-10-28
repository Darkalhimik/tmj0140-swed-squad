import {
  ArrowLeftRight,
  Building2,
  CreditCard,
  Gauge,
  History,
  LayoutGrid,
  Send,
  ShieldCheck,
  Users,
  type LucideIcon,
} from "lucide-react";

export type Scope = "personal" | "business";

export type NavItem = { href: string; label: string; icon: LucideIcon; badge?: "approvals" };

export const nav: Record<Scope, NavItem[]> = {
  personal: [
    { href: "/personal", label: "Overview", icon: LayoutGrid },
    { href: "/personal/transactions", label: "Transactions", icon: ArrowLeftRight },
    { href: "/personal/payments", label: "Payments", icon: Send },
    { href: "/personal/cards", label: "Cards", icon: CreditCard },
    { href: "/personal/plan", label: "Plan & fees", icon: Gauge },
    { href: "/personal/security", label: "Privacy & security", icon: ShieldCheck },
  ],
  business: [
    { href: "/business", label: "Overview", icon: LayoutGrid },
    { href: "/business/payments", label: "Payments", icon: Send, badge: "approvals" },
    { href: "/business/cards", label: "Cards", icon: CreditCard },
    { href: "/business/team", label: "Team & access", icon: Users },
    { href: "/business/activity", label: "Activity log", icon: History },
    { href: "/business/billing", label: "Fees & usage", icon: Gauge },
    { href: "/business/settings", label: "Company", icon: Building2 },
  ],
};

export function scopeOf(pathname: string): Scope {
  return pathname.startsWith("/business") ? "business" : "personal";
}

export function isActive(pathname: string, href: string) {
  if (href === "/personal" || href === "/business") return pathname === href;
  return pathname === href || pathname.startsWith(href + "/");
}
