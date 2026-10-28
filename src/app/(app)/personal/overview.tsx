"use client";

import {
  ArrowLeftRight,
  ArrowRight,
  CalendarClock,
  Eye,
  EyeOff,
  FileText,
  Info,
  Plus,
  Send,
  Snowflake,
  TrendingUp,
  Zap,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccountDetailsModal, MoveMoneyModal } from "@/components/banking/account-modals";
import { BankCard } from "@/components/banking/bank-card";
import { TxnDrawer, TxnRow } from "@/components/banking/txn";
import { PageContainer } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Sparkline, StackBar } from "@/components/ui/chart";
import { Meter } from "@/components/ui/meter";
import { Money, Tooltip } from "@/components/ui/misc";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { categoryMeta, merchantStyle } from "@/lib/data/merchants";
import { balanceHistory, person, upcoming } from "@/lib/data/personal";
import { cn } from "@/lib/cn";
import { dayLabel, fmtDate, groupBy, iban as fmtIban, money, moneyParts } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Category, Txn } from "@/lib/types";

const SPEND_EXCLUDED: Category[] = ["income", "savings", "transfers", "fees"];

export function PersonalOverview() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { accounts, txns, cards } = state.personal;
  const [selected, setSelected] = useState(accounts[0]!.id);
  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState<"details" | "move" | null>(null);
  const [openTxn, setOpenTxn] = useState<Txn | null>(null);

  const account = accounts.find((a) => a.id === selected)!;
  const pending = txns.filter((t) => t.accountId === "p-main" && t.status === "pending");
  const pendingSum = pending.reduce((s, t) => s + t.amount, 0);
  const total = accounts.reduce((s, a) => s + a.balance, 0);
  const debit = cards.find((c) => c.id === "pc-debit")!;

  const spend = txns.filter((t) => t.amount < 0 && t.status !== "declined" && t.status !== "refunded" && !SPEND_EXCLUDED.includes(t.category));
  const byCat = groupBy(spend, (t) => t.category)
    .map(([cat, list]) => ({ cat: cat as Category, value: -list.reduce((s, t) => s + t.amount, 0) }))
    .sort((a, b) => b.value - a.value);
  const spendTotal = byCat.reduce((s, c) => s + c.value, 0);

  const recent = txns.filter((t) => t.accountId === "p-main").slice(0, 9);
  const days = groupBy(recent, (t) => dayLabel(t.at));
  const parts = moneyParts(account.balance);

  return (
    <PageContainer>
      <div className="mb-6 flex flex-col gap-1">
        <p className="text-[13px] text-ink-3">Thursday, 29 October</p>
        <h1 className="text-[28px] leading-9 font-semibold tracking-[-0.035em]">Good morning, {person.firstName}</h1>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Balance hero */}
        <Card className="relative flex flex-col overflow-hidden">
          <div className="relative flex flex-1 flex-col justify-between p-6 pb-5">
            <div className="flex items-start justify-between gap-4">
              <div className="min-w-0">
                <button
                  onClick={() => setModal("details")}
                  className="group inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink"
                >
                  <span className="font-medium text-ink-2 group-hover:text-ink">{account.name}</span>
                  <span className="font-mono tracking-tight">· {fmtIban(account.iban).slice(-9)}</span>
                </button>
                <div className="mt-2 flex items-center gap-3">
                  <p className="tabular text-[44px] leading-[48px] font-semibold tracking-[-0.045em] text-ink sm:text-[52px] sm:leading-[56px]">
                    {hidden ? (
                      "€ ••••"
                    ) : (
                      <>
                        {parts.whole}
                        <span className="text-[0.55em] tracking-[-0.02em] text-ink-3">{parts.cents}</span>
                      </>
                    )}
                  </p>
                  <button
                    onClick={() => setHidden((h) => !h)}
                    aria-label={hidden ? "Show balance" : "Hide balance"}
                    className="flex size-8 items-center justify-center rounded-full text-ink-3 transition-colors hover:bg-subtle hover:text-ink"
                  >
                    {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                  </button>
                </div>
                {account.kind === "current" ? (
                  <p className="mt-1 flex flex-wrap items-center gap-x-1.5 text-[13px] text-ink-3">
                    Available {hidden ? "••••" : money(account.balance + pendingSum)}
                    <Tooltip content="Card payments are reserved until the shop settles them, usually within 1–3 days.">
                      <span className="inline-flex items-center gap-1 rounded-full bg-warning-soft px-1.5 text-[12px] text-warning">
                        <Info className="size-3" />
                        {pending.length} pending · {money(pendingSum)}
                      </span>
                    </Tooltip>
                  </p>
                ) : account.goal ? (
                  <div className="mt-2 max-w-sm">
                    <div className="mb-1.5 flex justify-between text-[13px] text-ink-3">
                      <span>{account.goal.name}</span>
                      <span className="tabular">{Math.round((account.balance / account.goal.target) * 100)}% of {money(account.goal.target)}</span>
                    </div>
                    <Meter value={account.balance} max={account.goal.target} tone="bg-brand" />
                  </div>
                ) : (
                  <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-success">
                    <TrendingUp className="size-3.5" /> {account.returnPct}% return this year
                  </p>
                )}
              </div>
              <div className="hidden flex-col items-end gap-1 sm:flex">
                <Sparkline data={balanceHistory} width={150} height={44} />
                <span className="text-[11px] text-ink-4">Last 14 days</span>
              </div>
            </div>

            {/* Account pills */}
            <div className="scrollbar-none -mx-1 mt-8 flex gap-1.5 overflow-x-auto px-1 pb-1">
              {accounts.map((a) => (
                <button
                  key={a.id}
                  onClick={() => setSelected(a.id)}
                  className={cn(
                    "flex shrink-0 items-center gap-2 rounded-full py-1.5 pr-3 pl-1.5 text-[13px] transition-all",
                    a.id === selected
                      ? "bg-brown text-white shadow-[0_2px_6px_rgb(81_43_43/0.3)]"
                      : "bg-subtle text-ink-2 hover:bg-muted",
                  )}
                >
                  <span
                    className={cn(
                      "flex size-6 items-center justify-center rounded-full text-[10px] font-bold",
                      a.id === selected ? "bg-white/15" : "bg-surface shadow-card",
                    )}
                  >
                    {a.kind === "current" ? "€" : a.kind === "savings" ? "S" : a.kind === "funds" ? "F" : "II"}
                  </span>
                  <span className="font-medium">{a.name}</span>
                  <span className={cn("tabular", a.id === selected ? "text-white/70" : "text-ink-3")}>
                    {hidden ? "••••" : money(a.balance, { compact: a.balance >= 10000 })}
                  </span>
                </button>
              ))}
            </div>
          </div>

          {/* Quick actions — exactly four */}
          <div className="grid grid-cols-4 border-t border-line">
            <QuickAction icon={<Plus className="size-5" />} label="Add money" onClick={() => setModal("details")} />
            <QuickAction icon={<ArrowLeftRight className="size-5" />} label="Move" onClick={() => setModal("move")} />
            <QuickAction icon={<Send className="size-5" />} label="Pay" href="/personal/payments?new=1" />
            <QuickAction icon={<FileText className="size-5" />} label="Details" onClick={() => setModal("details")} />
          </div>
        </Card>

        {/* Card widget */}
        <Card className="flex flex-col p-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[15px] font-semibold tracking-[-0.01em]">Visa Debit</p>
              <p className="text-[13px] text-ink-3">{debit.frozen ? "Frozen — payments are declined" : "Active · Apple Pay added"}</p>
            </div>
            <Link href="/personal/cards" className="text-[13px] font-medium text-ink-3 hover:text-ink">
              Manage
            </Link>
          </div>
          <div className="mt-4 flex justify-center">
            <BankCard card={debit} size="md" className="w-full max-w-[300px]" />
          </div>
          <div className="mt-5 flex items-center justify-between rounded-lg bg-subtle px-3.5 py-2.5">
            <span className="flex items-center gap-2 text-sm font-medium">
              <Snowflake className={cn("size-4", debit.frozen ? "text-info" : "text-ink-3")} />
              Freeze card
            </span>
            <Switch
              checked={debit.frozen}
              onChange={(v) => {
                dispatch({ type: "personal/card", id: debit.id, patch: { frozen: v } });
                toast({
                  title: v ? "Card frozen" : "Card unfrozen",
                  description: v ? "New payments will be declined until you unfreeze." : "You can pay with ••4821 again.",
                  action: { label: "Undo", onClick: () => dispatch({ type: "personal/card", id: debit.id, patch: { frozen: !v } }) },
                });
              }}
              label="Freeze card"
            />
          </div>
          <div className="mt-4">
            <div className="mb-1.5 flex justify-between text-[13px]">
              <span className="text-ink-3">Spent today</span>
              <span className="tabular text-ink-2">
                {money(debit.limits[0]!.used)} <span className="text-ink-4">of {money(debit.limits[0]!.max)}</span>
              </span>
            </div>
            <Meter value={debit.limits[0]!.used} max={debit.limits[0]!.max} />
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Transactions */}
        <Card>
          <CardHeader
            title="Transactions"
            description="Everyday account"
            action={
              <ButtonLink href="/personal/transactions" size="sm" variant="tertiary" trailing={<ArrowRight className="size-3.5" />}>
                See all
              </ButtonLink>
            }
          />
          <div className="px-2 pb-3">
            {days.map(([day, list]) => {
              const dayTotal = list.filter((t) => t.status !== "declined").reduce((s, t) => s + t.amount, 0);
              return (
                <div key={day}>
                  <div className="flex items-center justify-between px-3 pt-3 pb-1">
                    <p className="text-[12px] font-medium text-ink-3">{day}</p>
                    <p className="tabular text-[12px] text-ink-4">{money(dayTotal, { sign: true })}</p>
                  </div>
                  {list.map((t) => (
                    <TxnRow key={t.id} txn={t} onClick={() => setOpenTxn(t)} />
                  ))}
                </div>
              );
            })}
          </div>
        </Card>

        <div className="flex flex-col gap-5">
          {/* Upcoming */}
          <Card>
            <CardHeader
              title="Coming up"
              description="Next 30 days"
              action={
                <span className="tabular text-[13px] font-medium text-ink-2">
                  {money(upcoming.reduce((s, u) => s + u.amount, 0))}
                </span>
              }
            />
            <ul className="px-5 pb-4">
              {upcoming.map((u) => {
                const s = merchantStyle(u.counterparty);
                return (
                  <li key={u.id} className="flex items-center gap-3 py-2">
                    <span className="flex w-9 shrink-0 flex-col items-center rounded-md bg-subtle py-1 leading-none">
                      <span className="text-[10px] text-ink-3 uppercase">{fmtDate(u.at).split(" ")[1]}</span>
                      <span className="tabular text-[15px] font-semibold">{fmtDate(u.at).split(" ")[0]}</span>
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-[13px] font-medium" title={u.counterparty}>
                        {u.counterparty.replace("Landlord — ", "")}
                      </span>
                      <span className="flex items-center gap-1 text-[12px] text-ink-3">
                        {u.kind}
                        {u.auto ? (
                          <Badge size="xs" tone="gray" icon={<Zap className="size-2.5" />}>
                            Auto
                          </Badge>
                        ) : (
                          <Badge size="xs" tone="warning">
                            Needs you
                          </Badge>
                        )}
                      </span>
                    </span>
                    <Money value={u.amount} className="text-[13px] font-medium" />
                    <span className="sr-only">{s.mark}</span>
                  </li>
                );
              })}
            </ul>
          </Card>

          {/* Insights */}
          <Card className="p-5">
            <div className="flex items-baseline justify-between">
              <p className="text-[15px] font-semibold tracking-[-0.01em]">October spending</p>
              <CalendarClock className="size-4 text-ink-4" />
            </div>
            <p className="tabular mt-2 text-[26px] font-semibold tracking-[-0.03em]">{money(spendTotal)}</p>
            <p className="text-[13px] text-success">€86.20 less than September</p>
            <StackBar
              className="mt-4"
              parts={byCat.map((c) => ({ label: c.cat, value: c.value, color: categoryMeta[c.cat].color }))}
            />
            <ul className="mt-4 flex flex-col gap-2">
              {byCat.slice(0, 5).map((c) => (
                <li key={c.cat} className="flex items-center gap-2 text-[13px]">
                  <span className="size-2 rounded-full" style={{ background: categoryMeta[c.cat].color }} />
                  <span className="flex-1 text-ink-2">{categoryMeta[c.cat].label}</span>
                  <span className="tabular text-ink-3">{Math.round((c.value / spendTotal) * 100)}%</span>
                  <Money value={c.value} className="w-20 text-right font-medium" />
                </li>
              ))}
            </ul>
          </Card>

          <Card className="flex items-center justify-between p-5">
            <div>
              <p className="text-[13px] text-ink-3">Everything you own with us</p>
              <p className="tabular mt-0.5 text-lg font-semibold tracking-[-0.02em]">{hidden ? "€ ••••" : money(total)}</p>
            </div>
            <span className="text-right text-[12px] text-ink-3">
              {accounts.length} accounts
              <br />
              incl. pension
            </span>
          </Card>
        </div>
      </div>

      <AccountDetailsModal account={account} holder={person.name} open={modal === "details"} onClose={() => setModal(null)} />
      <MoveMoneyModal
        accounts={accounts}
        fromId={account.kind === "current" || account.kind === "savings" ? account.id : "p-main"}
        open={modal === "move"}
        onClose={() => setModal(null)}
        onMove={(from, to, amount) => {
          dispatch({ type: "move", scope: "personal", from, to, amount });
          toast({ title: `Moved ${money(amount)}`, description: "Arrived instantly · no fee" });
        }}
      />
      <TxnDrawer txn={openTxn} onClose={() => setOpenTxn(null)} cards={cards} />
    </PageContainer>
  );
}

function QuickAction({ icon, label, onClick, href }: { icon: React.ReactNode; label: string; onClick?: () => void; href?: string }) {
  const inner = (
    <>
      <span className="flex size-11 items-center justify-center rounded-full bg-cream text-brown transition-[transform,background-color] duration-200 group-hover:scale-105 group-hover:bg-brand group-hover:text-white">
        {icon}
      </span>
      <span className="text-[12px] font-medium text-ink-2 group-hover:text-ink">{label}</span>
    </>
  );
  const cls = "group flex flex-col items-center gap-1.5 py-4 transition-colors hover:bg-subtle/60 [&:not(:last-child)]:border-r [&:not(:last-child)]:border-line";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
