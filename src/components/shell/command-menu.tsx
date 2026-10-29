"use client";

import { Command } from "cmdk";
import {
  ArrowRight,
  Copy,
  CreditCard,
  Download,
  FileText,
  Lock,
  Plus,
  Send,
  Sparkles,
  UserPlus,
  type LucideIcon,
} from "lucide-react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Kbd } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { downloadCsv } from "@/lib/export/download";
import { useStore } from "@/lib/store";
import { nav, scopeOf } from "./nav";

type Entry = { label: string; icon: LucideIcon; run: () => void; hint?: string; keywords?: string[] };

export function CommandMenu() {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const router = useRouter();
  const pathname = usePathname();
  const scope = scopeOf(pathname);
  const toast = useToast();
  const { state, dispatch } = useStore();

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    const onOpen = () => setOpen(true);
    window.addEventListener("keydown", onKey);
    window.addEventListener("open-command-menu", onOpen);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("open-command-menu", onOpen);
    };
  }, []);

  useLayoutEffect(() => () => setOpen(false), []);

  const go = (href: string) => () => {
    setOpen(false);
    setSearch("");
    router.push(href);
  };

  const copy = (label: string, value: string) => () => {
    void navigator.clipboard?.writeText(value.replace(/\s+/g, ""));
    setOpen(false);
    setSearch("");
    toast({ title: `${label} copied`, description: value });
  };

  // Account numbers are always findable ("iban", "account number", "details").
  const ibanEntries: Entry[] = [
    ...state.personal.accounts
      .filter((a) => a.kind === "current" || a.kind === "savings")
      .map((a) => ({
        label: `Copy IBAN · ${a.name}`,
        icon: Copy,
        hint: a.iban.slice(0, 4) + " … " + a.iban.slice(-4),
        keywords: ["iban", "account number", "details", "bank details", "konto"],
        run: copy("IBAN", a.iban.replace(/(.{4})/g, "$1 ").trim()),
      })),
    {
      label: `Copy IBAN · ${state.business.profile.short}`,
      icon: Copy,
      hint: state.business.accounts[0]!.iban.slice(0, 4) + " … " + state.business.accounts[0]!.iban.slice(-4),
      keywords: ["iban", "account number", "company", "business"],
      run: copy("IBAN", state.business.accounts[0]!.iban.replace(/(.{4})/g, "$1 ").trim()),
    },
  ];

  // Search transactions by who they were with.
  const q = search.trim().toLowerCase();
  const txnMatches =
    q.length >= 2
      ? [...new Set((scope === "business" ? state.business.txns : state.personal.txns).map((t) => t.counterparty))]
          .filter((name) => name.toLowerCase().includes(q))
          .slice(0, 5)
      : [];

  const actions: Entry[] =
    scope === "personal"
      ? [
          { label: "New payment", icon: Send, run: go("/personal/payments?new=1"), keywords: ["pay", "transfer", "send"] },
          {
            label: "Send money to a card",
            icon: CreditCard,
            run: go("/personal/payments?new=1&to=card"),
            keywords: ["card number", "visa", "mastercard", "p2p", "kaart"],
          },
          {
            label: "Freeze Visa Debit ••4821",
            icon: Lock,
            keywords: ["block", "lost", "card"],
            run: () => {
              setOpen(false);
              const card = state.personal.cards.find((c) => c.id === "pc-debit");
              dispatch({ type: "personal/card", id: "pc-debit", patch: { frozen: !card?.frozen } });
              toast({ title: card?.frozen ? "Card unfrozen" : "Card frozen", description: "Visa Debit ••4821 · takes effect instantly" });
            },
          },
          { label: "Create virtual card", icon: CreditCard, run: go("/personal/cards"), keywords: ["disposable", "online"] },
          { label: "Download statement", icon: Download, run: go("/personal/transactions"), keywords: ["pdf", "export"] },
          { label: "Start a company", icon: Sparkles, run: go("/start"), keywords: ["oü", "register", "business"] },
        ]
      : [
          { label: "New payment", icon: Send, run: go("/business/payments?new=1"), keywords: ["pay", "transfer", "invoice"] },
          { label: "Review approvals", icon: FileText, run: go("/business/payments"), keywords: ["sign", "approve"] },
          { label: "Invite people", icon: UserPlus, run: go("/business/team?invite=1"), keywords: ["member", "accountant", "add"] },
          { label: "Issue a card", icon: Plus, run: go("/business/cards"), keywords: ["employee", "virtual"] },
          {
            label: "Export activity log (CSV)",
            icon: Download,
            run: () => {
              setOpen(false);
              const nameOf = (id: string) => (id === "system" ? "Swedbank" : (state.business.members.find((m) => m.id === id)?.name ?? id));
              downloadCsv("activity-log-2026-10-29.csv", [
                ["time", "actor", "action", "target", "detail", "device", "ip"],
                ...state.business.audit.map((e) => [e.at, nameOf(e.actor), e.action, e.target, e.detail ?? "", e.device, e.ip]),
              ]);
              dispatch({ type: "biz/log", action: "export.created", target: "Activity log", detail: `CSV · ${state.business.audit.length} rows` });
              toast({ title: "Export ready", description: "activity-log-2026-10-29.csv · the export itself is now in the log" });
            },
          },
        ];

  const pages: Entry[] = [
    ...nav[scope].map((n) => ({ label: n.label, icon: n.icon, run: go(n.href), hint: scope === "personal" ? "Personal" : "Business" })),
    ...nav[scope === "personal" ? "business" : "personal"].map((n) => ({
      label: n.label,
      icon: n.icon,
      run: go(n.href),
      hint: scope === "personal" ? "Business" : "Personal",
    })),
  ];

  if (!open) return null;

  return createPortal(
    <div className="fixed inset-0 z-[55] flex items-start justify-center p-4 pt-[12vh]">
      <div className="absolute inset-0 animate-fade-in bg-ink/25 backdrop-blur-[1px]" onClick={() => setOpen(false)} />
      <Command
        label="Command menu"
        loop
        onKeyDown={(e) => {
          if (e.key === "Escape") setOpen(false);
        }}
        className="relative w-full max-w-[600px] animate-pop-in overflow-hidden rounded-xl bg-surface shadow-modal"
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <SearchGlyph />
          <Command.Input
            autoFocus
            value={search}
            onValueChange={setSearch}
            placeholder="Search pages, actions, IBANs and transactions…"
            className="h-13 w-full bg-transparent text-[15px] text-ink outline-none placeholder:text-ink-4"
          />
          <Kbd>Esc</Kbd>
        </div>
        <Command.List className="max-h-[min(420px,60vh)] overflow-y-auto p-2 [&_[cmdk-group-heading]]:px-2.5 [&_[cmdk-group-heading]]:pt-2 [&_[cmdk-group-heading]]:pb-1.5 [&_[cmdk-group-heading]]:text-[12px] [&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-ink-4">
          <Command.Empty className="py-10 text-center text-sm text-ink-3">No results for “{search}”. Try “iban”, “card” or a shop name.</Command.Empty>
          {txnMatches.length > 0 && (
            <Command.Group heading="Transactions">
              {txnMatches.map((name) => (
                <Item
                  key={name}
                  value={`transactions ${name}`}
                  entry={{
                    label: `Transactions with ${name}`,
                    icon: ArrowRight,
                    keywords: [name],
                    run: go(scope === "business" ? "/business/payments" : `/personal/transactions?q=${encodeURIComponent(name)}`),
                  }}
                />
              ))}
            </Command.Group>
          )}
          <Command.Group heading="Account details">
            {ibanEntries.map((e) => (
              <Item key={e.label} entry={e} />
            ))}
          </Command.Group>
          <Command.Group heading="Actions">
            {actions.map((a) => (
              <Item key={a.label} entry={a} />
            ))}
          </Command.Group>
          <Command.Group heading="Go to">
            {pages.map((p) => (
              <Item key={p.hint + p.label} entry={p} value={`${p.hint} ${p.label}`} />
            ))}
          </Command.Group>
        </Command.List>
        <div className="flex items-center justify-between border-t border-line bg-canvas px-4 py-2 text-[12px] text-ink-3">
          <span className="flex items-center gap-1.5">
            <Kbd>↑</Kbd>
            <Kbd>↓</Kbd> to navigate
          </span>
          <span className="flex items-center gap-1.5">
            <Kbd>↵</Kbd> to select
          </span>
        </div>
      </Command>
    </div>,
    document.body,
  );
}

function Item({ entry, value }: { entry: Entry; value?: string }) {
  const Icon = entry.icon;
  return (
    <Command.Item
      value={value ?? entry.label}
      keywords={entry.keywords}
      onSelect={entry.run}
      className="group flex h-10 cursor-pointer items-center gap-3 rounded-md px-2.5 text-sm text-ink-2 data-[selected=true]:bg-subtle data-[selected=true]:text-ink"
    >
      <Icon className="size-4 text-ink-3 group-data-[selected=true]:text-brand" />
      <span className="flex-1">{entry.label}</span>
      {entry.hint && <span className="text-[12px] text-ink-4">{entry.hint}</span>}
      <ArrowRight className="size-3.5 text-ink-4 opacity-0 group-data-[selected=true]:opacity-100" />
    </Command.Item>
  );
}

function SearchGlyph() {
  return (
    <svg viewBox="0 0 16 16" className="size-4 shrink-0 text-ink-3" aria-hidden>
      <circle cx="7" cy="7" r="4.75" fill="none" stroke="currentColor" strokeWidth="1.5" />
      <path d="M10.5 10.5L14 14" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  );
}
