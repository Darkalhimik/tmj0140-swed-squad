"use client";

import { Bell, ChevronRight, Menu as MenuIcon, Search } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { company } from "@/lib/data/business";
import { person } from "@/lib/data/personal";
import { useBodyLock, useCloseOnHide, useEscape, useOutsideClick } from "@/lib/hooks";
import { relative } from "@/lib/format";
import { cn } from "@/lib/cn";
import { useStore } from "@/lib/store";
import { nav, scopeOf } from "./nav";
import { openCommandMenu, SidebarContent } from "./sidebar";

export function Topbar() {
  const pathname = usePathname();
  const scope = scopeOf(pathname);
  const page = [...nav[scope]].reverse().find((n) => pathname === n.href || pathname.startsWith(n.href + "/"));
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center gap-3 border-b border-line bg-canvas/85 px-4 backdrop-blur-md lg:px-8">
      <button
        className="-ml-1 inline-flex size-9 items-center justify-center rounded-md text-ink-2 hover:bg-subtle lg:hidden"
        onClick={() => setMobileOpen(true)}
        aria-label="Open navigation"
      >
        <MenuIcon className="size-5" />
      </button>
      <nav aria-label="Breadcrumb" className="flex min-w-0 items-center gap-1.5 text-sm">
        <Link href={`/${scope}`} className="truncate text-ink-3 transition-colors hover:text-ink">
          {scope === "personal" ? person.name : company.short}
        </Link>
        {page && page.href !== `/${scope}` && (
          <>
            <ChevronRight className="size-3.5 shrink-0 text-ink-4" />
            <span className="truncate font-medium text-ink">{page.label}</span>
          </>
        )}
      </nav>
      <div className="ml-auto flex items-center gap-1.5">
        <button
          onClick={openCommandMenu}
          className="inline-flex size-9 items-center justify-center rounded-md text-ink-2 hover:bg-subtle lg:hidden"
          aria-label="Search"
        >
          <Search className="size-[18px]" />
        </button>
        <Notifications />
      </div>
      {mobileOpen && <MobileNav onClose={() => setMobileOpen(false)} />}
    </header>
  );
}

function MobileNav({ onClose }: { onClose: () => void }) {
  useEscape(true, onClose);
  useBodyLock(true);
  useCloseOnHide(true, onClose);
  return createPortal(
    <div className="fixed inset-0 z-50 lg:hidden">
      <div className="absolute inset-0 animate-fade-in bg-ink/25" onClick={onClose} />
      <aside
        className="absolute inset-y-0 left-0 w-[var(--sidebar-w)] animate-slide-in-right bg-canvas shadow-modal"
        style={{ ["--sidebar-w" as string]: "272px" }}
      >
        <SidebarContent onNavigate={onClose} />
      </aside>
    </div>,
    document.body,
  );
}

function Notifications() {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const { state } = useStore();
  useOutsideClick(ref, open, () => setOpen(false));
  useEscape(open, () => setOpen(false));
  useLayoutEffect(() => () => setOpen(false), []);

  const awaiting = state.business.payments.filter(
    (p) => p.status === "awaiting" && !p.approvals.some((a) => a.memberId === "m-mari"),
  );
  const nearLimit = state.business.cards.filter((c) => !c.frozen && c.limits[0] && c.limits[0].used / c.limits[0].max >= 0.85);

  const items = [
    ...(awaiting.length
      ? [
          {
            id: "n-approvals",
            title: `${awaiting.length} payment${awaiting.length > 1 ? "s" : ""} waiting for your approval`,
            body: `${company.short} · total ${new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(awaiting.reduce((s, p) => s + p.amount, 0))}`,
            at: "2026-10-28T16:40:00+02:00",
            href: "/business/payments",
            unread: true,
          },
        ]
      : []),
    ...nearLimit.map((c) => ({
      id: `n-limit-${c.id}`,
      title: `${c.holder.split(" ")[0]![0]}${c.holder.split(" ")[0]!.slice(1).toLowerCase()}'s card is at ${Math.round((c.limits[0]!.used / c.limits[0]!.max) * 100)}% of its limit`,
      body: `••${c.last4} · ${new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR" }).format(c.limits[0]!.max - c.limits[0]!.used)} left this month`,
      at: "2026-10-28T12:40:00+02:00",
      href: "/business/cards",
      unread: true,
    })),
    {
      id: "n-einvoice",
      title: "New e-invoice from Telia Eesti AS",
      body: "€24.90 · due 3 Nov · not on automatic payment",
      at: "2026-10-27T09:00:00+02:00",
      href: "/personal/payments",
      unread: false,
    },
    {
      id: "n-salary",
      title: "Salary received",
      body: "+€3,150.00 from Nordlight Studio OÜ · €400 moved to Summer house",
      at: "2026-10-15T07:31:00+03:00",
      href: "/personal/transactions",
      unread: false,
    },
  ];
  const unread = items.filter((i) => i.unread).length;

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((o) => !o)}
        className={cn(
          "relative inline-flex size-9 items-center justify-center rounded-md text-ink-2 transition-colors hover:bg-subtle",
          open && "bg-subtle",
        )}
        aria-label="Notifications"
      >
        <Bell className="size-[18px]" />
        {unread > 0 && <span className="absolute top-2 right-2 size-2 rounded-full bg-brand ring-2 ring-canvas" />}
      </button>
      {open && (
        <div className="absolute top-[calc(100%+8px)] right-0 z-40 w-[min(380px,calc(100vw-24px))] animate-pop-in overflow-hidden rounded-xl bg-surface shadow-menu">
          <div className="flex items-center justify-between border-b border-line px-4 py-3">
            <p className="text-sm font-semibold">Inbox</p>
            <span className="text-[12px] text-ink-3">{unread} unread</span>
          </div>
          <ul className="max-h-[420px] overflow-y-auto">
            {items.map((n) => (
              <li key={n.id}>
                <Link
                  href={n.href}
                  onClick={() => setOpen(false)}
                  className="flex gap-3 border-b border-line px-4 py-3 last:border-0 hover:bg-subtle"
                >
                  <span className={cn("mt-1.5 size-2 shrink-0 rounded-full", n.unread ? "bg-brand" : "bg-transparent")} />
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] font-medium text-ink">{n.title}</span>
                    <span className="mt-0.5 block text-[12px] text-ink-3">{n.body}</span>
                  </span>
                  <span className="shrink-0 text-[11px] text-ink-4">{relative(n.at)}</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
