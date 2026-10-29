"use client";

import { ArrowUpRight, Check, ChevronsUpDown, HelpCircle, LogOut, Plus, Search, Settings2, Sparkles } from "lucide-react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Logo } from "@/components/brand/logo";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Menu } from "@/components/ui/menu";
import { Kbd } from "@/components/ui/misc";
import { person } from "@/lib/data/personal";
import { cn } from "@/lib/cn";
import { useCompanies, useCompany, useStore } from "@/lib/store";
import type { CompanyProfile } from "@/lib/types";
import { isActive, nav, scopeOf, type Scope } from "./nav";

export function openCommandMenu() {
  window.dispatchEvent(new Event("open-command-menu"));
}

export function SidebarContent({ onNavigate }: { onNavigate?: () => void }) {
  const pathname = usePathname();
  const scope = scopeOf(pathname);
  const { state } = useStore();
  const awaiting = state.business.payments.filter(
    (p) => p.status === "awaiting" && !p.approvals.some((a) => a.memberId === "m-mari"),
  ).length;

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-14 items-center justify-between px-4">
        <Link href="/personal" onClick={onNavigate} aria-label="Swedbank home">
          <Logo />
        </Link>
        <Badge size="xs" tone="gray">
          Concept
        </Badge>
      </div>

      <div className="px-3">
        <ScopeSwitcher scope={scope} onNavigate={onNavigate} />
        <button
          onClick={openCommandMenu}
          className="mt-2 flex h-8 w-full items-center gap-2 rounded-md px-2.5 text-[13px] text-ink-3 shadow-[0_0_0_1px_var(--color-line)] transition-colors hover:bg-surface hover:text-ink-2"
        >
          <Search className="size-3.5" />
          <span className="flex-1 text-left">Search or jump to…</span>
          <Kbd>⌘K</Kbd>
        </button>
      </div>

      <nav className="mt-4 flex flex-col gap-0.5 px-3">
        {nav[scope].map((item) => {
          const active = isActive(pathname, item.href);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={onNavigate}
              className={cn(
                "group flex h-8 items-center gap-2.5 rounded-md px-2.5 text-sm transition-colors",
                active ? "bg-surface font-medium text-ink shadow-card" : "text-ink-2 hover:bg-muted/70 hover:text-ink",
              )}
            >
              <Icon className={cn("size-4", active ? "text-brand" : "text-ink-3 group-hover:text-ink-2")} />
              <span className="flex-1">{item.label}</span>
              {item.badge === "approvals" && awaiting > 0 && (
                <span className="tabular flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-brand px-1 text-[11px] font-semibold text-white">
                  {awaiting}
                </span>
              )}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto flex flex-col gap-3 p-3">
        {scope === "personal" && (
          <Link
            href="/start"
            onClick={onNavigate}
            className="group relative overflow-hidden rounded-xl bg-cream p-3.5 shadow-[inset_0_0_0_1px_var(--color-brand-line)]"
          >
            <Sparkles className="relative size-4 text-brand" />
            <p className="relative mt-2 text-[13px] font-semibold text-brown">Start a company</p>
            <p className="relative mt-0.5 text-[12px] leading-4 text-brown/70">
              Register an OÜ and get a business account in one flow.
            </p>
          </Link>
        )}
        <UserMenu />
        <Link
          href="/compare"
          onClick={onNavigate}
          className="flex items-center justify-between rounded-lg px-2 py-1.5 text-[12px] font-medium text-teal hover:bg-muted/70"
        >
          Compare with Swedbank today
          <ArrowUpRight className="size-3.5" />
        </Link>
        <p className="px-2 text-[11px] leading-4 text-ink-4">
          Concept by <span className="font-medium text-ink-3">SWED SQUAD</span> · TMJ0140 · not affiliated with Swedbank
        </p>
      </div>
    </div>
  );
}

function ScopeSwitcher({ scope, onNavigate }: { scope: Scope; onNavigate?: () => void }) {
  const router = useRouter();
  const go = (href: string) => {
    onNavigate?.();
    router.push(href);
  };
  const { dispatch } = useStore();
  const active = useCompany();
  const companies = useCompanies();
  const current =
    scope === "personal"
      ? { name: person.name, sub: "Personal", avatar: <Avatar name={person.name} size="sm" /> }
      : { name: active.short, sub: active.isNew ? "Business · new" : "Business · OÜ", avatar: <CompanyMark /> };

  return (
    <Menu
      align="start"
      className="w-[calc(var(--sidebar-w)-24px)]"
      trigger={({ toggle, open }) => (
        <button
          onClick={toggle}
          className={cn(
            "flex h-11 w-[calc(var(--sidebar-w)-24px)] items-center gap-2.5 rounded-lg bg-surface px-2 text-left shadow-card transition-shadow hover:shadow-raised",
            open && "shadow-raised",
          )}
        >
          {current.avatar}
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-semibold leading-4 text-ink">{current.name}</span>
            <span className="block text-[11px] leading-4 text-ink-3">{current.sub}</span>
          </span>
          <ChevronsUpDown className="size-3.5 text-ink-3" />
        </button>
      )}
      header={<p className="text-[12px] font-medium text-ink-3">Switch profile</p>}
      items={[
        {
          label: (
            <span className="flex flex-col">
              <span>{person.name}</span>
              <span className="text-[11px] text-ink-3">Personal</span>
            </span>
          ),
          icon: <Avatar name={person.name} size="sm" />,
          hint: scope === "personal" ? <Check className="size-4 text-ink" /> : undefined,
          onSelect: () => go("/personal"),
        },
        ...[...companies]
          .sort((a, b) => a.name.localeCompare(b.name))
          .map((c) => ({
            label: (
              <span className="flex flex-col">
                <span>{c.name}</span>
                <span className="text-[11px] text-ink-3">Business · Owner{c.isNew ? " · new" : ""}</span>
              </span>
            ),
            icon: <CompanyMark profile={c} />,
            hint: scope === "business" && c.id === active.id ? <Check className="size-4 text-ink" /> : undefined,
            onSelect: () => {
              dispatch({ type: "biz/switch", id: c.id });
              go("/business");
            },
          })),
        "separator",
        { label: "Start a new company", icon: <Plus className="size-4" />, onSelect: () => go("/start") },
        { label: "Add an existing company", icon: <ArrowUpRight className="size-4" />, onSelect: () => go("/start?mode=existing") },
      ]}
    />
  );
}

export function CompanyMark({ size = "sm", profile }: { size?: "sm" | "md" | "lg"; profile?: CompanyProfile }) {
  const active = useCompany();
  const mark = (profile ?? active).mark;
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-md font-semibold",
        size === "sm" && "size-6 text-[11px]",
        size === "md" && "size-8 text-[13px]",
        size === "lg" && "size-11 rounded-lg text-[17px]",
      )}
      style={{ background: mark.bg, color: mark.fg }}
    >
      {mark.letter}
    </span>
  );
}

function UserMenu() {
  const router = useRouter();
  const method = useStore().state.session.method;
  return (
    <Menu
      align="start"
      className="bottom-[calc(100%+6px)] top-auto w-[calc(var(--sidebar-w)-24px)]"
      trigger={({ toggle }) => (
        <button
          onClick={toggle}
          className="flex h-10 w-full items-center gap-2.5 rounded-lg px-2 text-left transition-colors hover:bg-muted/70"
        >
          <Avatar name={person.name} size="sm" />
          <span className="min-w-0 flex-1">
            <span className="block truncate text-[13px] font-medium leading-4">{person.name}</span>
            <span className="block truncate text-[11px] leading-4 text-ink-3">Signed in with {method}</span>
          </span>
          <Settings2 className="size-3.5 text-ink-3" />
        </button>
      )}
      items={[
        { label: "Privacy & security", icon: <Settings2 className="size-4" />, onSelect: () => router.push("/personal/security") },
        { label: "Help centre", icon: <HelpCircle className="size-4" />, hint: "?", onSelect: () => {} },
        "separator",
        { label: "Sign out", icon: <LogOut className="size-4" />, onSelect: () => router.push("/") },
      ]}
    />
  );
}
