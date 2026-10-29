"use client";

import { ArrowLeftRight, ArrowRight, Eye, EyeOff, FileText, Plus, Send, TrendingUp } from "lucide-react";
import Link from "next/link";
import { useState } from "react";
import { AccountDetailsModal, AddMoneyModal, MoveMoneyModal } from "@/components/banking/account-modals";
import { TxnDrawer, TxnRow } from "@/components/banking/txn";
import { PageContainer } from "@/components/shell/page-header";
import { ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { StackBar } from "@/components/ui/chart";
import { Meter } from "@/components/ui/meter";
import { Money } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { categoryMeta } from "@/lib/data/merchants";
import { person, upcoming } from "@/lib/data/personal";
import { cn } from "@/lib/cn";
import { dayLabel, fmtDate, groupBy, iban as fmtIban, money, moneyParts } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { Category, Txn } from "@/lib/types";

/** Counted in a month: booked or pending, excluding declined payments and refunded purchases with their refunds. */
function counted(t: Txn) {
  return t.accountId === "p-main" && t.status !== "declined" && t.status !== "refunded" && !t.refundOf && t.at.startsWith("2026-10");
}

export function PersonalOverview() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { accounts, txns, cards } = state.personal;
  const [selected, setSelected] = useState(accounts[0]!.id);
  const [hidden, setHidden] = useState(false);
  const [modal, setModal] = useState<"add" | "details" | "move" | null>(null);
  const [openTxn, setOpenTxn] = useState<Txn | null>(null);

  const account = accounts.find((a) => a.id === selected)!;
  const main = accounts.find((a) => a.id === "p-main")!;
  const pending = txns.filter((t) => t.accountId === "p-main" && t.status === "pending");
  const reserved = pending.reduce((s, t) => s + t.amount, 0);
  const total = accounts.reduce((s, a) => s + a.balance, 0);

  // October: money out = spending + moves to your own savings and funds.
  const october = txns.filter(counted);
  const monthIn = october.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0);
  const out = october.filter((t) => t.amount < 0);
  const monthOut = -out.reduce((s, t) => s + t.amount, 0);
  const movedOwn = -out.filter((t) => t.method === "internal").reduce((s, t) => s + t.amount, 0);
  const spending = out.filter((t) => t.method !== "internal");
  const spendTotal = monthOut - movedOwn;
  const byCat = groupBy(spending, (t) => t.category)
    .map(([cat, list]) => ({ cat: cat as Category, value: -list.reduce((s, t) => s + t.amount, 0) }))
    .sort((a, b) => b.value - a.value);
  const top = byCat.slice(0, 4);
  const other = byCat.slice(4).reduce((s, c) => s + c.value, 0);

  const recent = txns.filter((t) => t.accountId === "p-main").slice(0, 8);
  const days = groupBy(recent, (t) => dayLabel(t.at));
  const nextUp = upcoming.slice(0, 3);
  const upcomingTotal = upcoming.reduce((s, u) => s + u.amount, 0);
  const parts = moneyParts(account.balance);
  const debit = cards.find((c) => c.id === "pc-debit")!;

  return (
    <PageContainer>
      <div className="mb-6">
        <p className="text-[13px] text-ink-3">Thursday, 29 October</p>
        <h1 className="font-display mt-1 text-[28px] leading-9 font-semibold tracking-[-0.015em]">Good morning, {person.firstName}</h1>
      </div>

      {/* 1 · Balance and actions */}
      <Card className="overflow-hidden">
        <div className="flex flex-col gap-6 p-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="min-w-0">
            <p className="text-[13px] text-ink-3">
              <span className="font-medium text-ink-2">{account.name}</span>
              <span className="font-mono"> · {fmtIban(account.iban).slice(-9)}</span>
            </p>
            <div className="mt-1.5 flex items-center gap-2">
              <p className="font-display tabular text-[44px] leading-[52px] font-semibold tracking-[-0.015em] text-ink">
                {hidden ? (
                  "€ ••••"
                ) : (
                  <>
                    {parts.whole}
                    <span className="text-[0.55em] text-ink-3">{parts.cents}</span>
                  </>
                )}
              </p>
              <button
                onClick={() => setHidden((h) => !h)}
                className="flex h-8 items-center gap-1.5 rounded-full px-2.5 text-[12px] text-ink-3 transition-colors hover:bg-subtle hover:text-ink"
              >
                {hidden ? <Eye className="size-4" /> : <EyeOff className="size-4" />}
                {hidden ? "Show" : "Hide"}
              </button>
            </div>
            {account.kind === "current" ? (
              <p className="mt-1 text-[13px] text-ink-3">
                {hidden ? "••••" : money(account.balance + reserved)} available · {money(-reserved)} reserved for {pending.length} card payment
                {pending.length === 1 ? "" : "s"} not yet booked
              </p>
            ) : account.goal ? (
              <div className="mt-2 max-w-sm">
                <div className="mb-1.5 flex justify-between text-[13px] text-ink-3">
                  <span>{account.goal.name}</span>
                  <span className="tabular">
                    {Math.round((account.balance / account.goal.target) * 100)}% of {money(account.goal.target)}
                  </span>
                </div>
                <Meter value={account.balance} max={account.goal.target} tone="bg-brand" />
              </div>
            ) : (
              <p className="mt-1 inline-flex items-center gap-1 text-[13px] text-success">
                <TrendingUp className="size-3.5" /> {account.returnPct}% return this year
              </p>
            )}
          </div>

          <div className="grid grid-cols-4 gap-2 lg:w-[400px]">
            <QuickAction icon={<Plus className="size-5" />} label="Add money" onClick={() => setModal("add")} />
            <QuickAction icon={<ArrowLeftRight className="size-5" />} label="Move" onClick={() => setModal("move")} />
            <QuickAction icon={<Send className="size-5" />} label="Pay" href="/personal/payments?new=1" />
            <QuickAction icon={<FileText className="size-5" />} label="Details" onClick={() => setModal("details")} />
          </div>
        </div>

        <div className="flex flex-col gap-3 border-t border-line bg-canvas px-6 py-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1.5" role="radiogroup" aria-label="Accounts">
            {accounts.map((a) => (
              <button
                key={a.id}
                type="button"
                role="radio"
                aria-checked={a.id === selected}
                onClick={() => setSelected(a.id)}
                className={cn(
                  "flex h-8 items-center gap-2 rounded-full px-3 text-[13px] transition-colors",
                  a.id === selected ? "bg-brown text-white" : "bg-surface text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-subtle",
                )}
              >
                <span className="font-medium">{a.name}</span>
                <span className={cn("tabular", a.id === selected ? "text-white/70" : "text-ink-3")}>{hidden ? "••••" : money(a.balance)}</span>
              </button>
            ))}
          </div>
          <p className="shrink-0 text-[12px] text-ink-3">
            Total with Swedbank <span className="tabular font-medium text-ink-2">{hidden ? "€ ••••" : money(total)}</span>
          </p>
        </div>
      </Card>

      <div className="mt-5 grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        {/* 2 · Transactions */}
        <Card>
          <CardHeader
            title="Transactions"
            description="Everyday account"
            action={
              <ButtonLink href="/personal/transactions" size="sm" variant="tertiary" trailing={<ArrowRight className="size-3.5" />}>
                All transactions
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
          {/* 3 · Spending — categories add up to the total */}
          <Card className="p-5">
            <div className="flex items-baseline justify-between gap-3">
              <p className="text-[15px] font-semibold">Spent in October</p>
              <Money value={spendTotal} className="font-display text-[20px] font-semibold tracking-[-0.02em]" />
            </div>
            <StackBar
              className="mt-4"
              parts={[
                ...top.map((c) => ({ label: c.cat, value: c.value, color: categoryMeta[c.cat].color })),
                ...(other > 0 ? [{ label: "other", value: other, color: "var(--color-line-strong)" }] : []),
              ]}
            />
            <ul className="mt-4 flex flex-col gap-2 text-[13px]">
              {top.map((c) => (
                <li key={c.cat} className="flex items-center gap-2">
                  <span className="size-2 rounded-full" style={{ background: categoryMeta[c.cat].color }} />
                  <span className="flex-1 text-ink-2">{categoryMeta[c.cat].label}</span>
                  <Money value={c.value} className="font-medium" />
                </li>
              ))}
              {other > 0 && (
                <li className="flex items-center gap-2">
                  <span className="size-2 rounded-full bg-line-strong" />
                  <span className="flex-1 text-ink-2">Other ({byCat.length - top.length} categories)</span>
                  <Money value={other} className="font-medium" />
                </li>
              )}
            </ul>
            <p className="mt-4 border-t border-line pt-3 text-[12px] leading-5 text-ink-3">
              Money out this month was {money(monthOut)}: {money(spendTotal)} spent plus {money(movedOwn)} moved to your own savings and funds. Money
              in: {money(monthIn)}.
            </p>
          </Card>

          {/* 4 · Coming up */}
          <Card>
            <CardHeader
              title="Coming up"
              description="Next 30 days"
              action={
                <ButtonLink href="/personal/payments" size="sm" variant="tertiary" trailing={<ArrowRight className="size-3.5" />}>
                  {upcoming.length} payments
                </ButtonLink>
              }
            />
            <ul className="px-5">
              {nextUp.map((u) => (
                <li key={u.id} className="flex items-center gap-3 border-t border-line py-2.5 text-[13px] first:border-0">
                  <span className="tabular w-12 shrink-0 text-ink-3">{fmtDate(u.at)}</span>
                  <span className="min-w-0 flex-1 truncate text-ink">{u.counterparty.replace("Landlord — ", "")}</span>
                  <Money value={u.amount} className="font-medium" />
                </li>
              ))}
            </ul>
            <p className="mx-5 mt-1 mb-4 rounded-md bg-subtle px-3 py-2 text-[12px] text-ink-3">
              {money(-upcomingTotal)} in total · {money(main.balance + reserved + upcomingTotal)} left of what&apos;s available today
            </p>
          </Card>
        </div>
      </div>

      <AddMoneyModal
        account={account.kind === "current" || account.kind === "savings" ? account : main}
        holder={person.name}
        open={modal === "add"}
        onClose={() => setModal(null)}
        onMove={() => setModal("move")}
      />
      <AccountDetailsModal
        account={account}
        holder={person.name}
        open={modal === "details"}
        onClose={() => setModal(null)}
        extra={
          account.kind === "current"
            ? [
                ["Service plan", "Essential plan · €1.00/month"],
                ["Debit card", `${debit.name} ••${debit.last4}`],
                ["Customer since", "June 2009"],
              ]
            : []
        }
      />
      <MoveMoneyModal
        accounts={accounts}
        fromId={account.kind === "current" || account.kind === "savings" ? account.id : "p-main"}
        open={modal === "move"}
        onClose={() => setModal(null)}
        onMove={(from, to, amount) => {
          dispatch({ type: "move", scope: "personal", from, to, amount });
          toast({ title: `${money(amount)} moved`, description: "No fee" });
        }}
      />
      <TxnDrawer txn={openTxn} onClose={() => setOpenTxn(null)} cards={cards} />
    </PageContainer>
  );
}

function QuickAction({ icon, label, onClick, href }: { icon: React.ReactNode; label: string; onClick?: () => void; href?: string }) {
  const inner = (
    <>
      <span className="flex size-11 items-center justify-center rounded-full bg-cream text-brown transition-colors group-hover:bg-brown group-hover:text-white">
        {icon}
      </span>
      <span className="text-[12px] font-medium text-ink-2 group-hover:text-ink">{label}</span>
    </>
  );
  const cls = "group flex flex-col items-center gap-1.5 rounded-lg py-2 transition-colors";
  return href ? (
    <Link href={href} className={cls}>
      {inner}
    </Link>
  ) : (
    <button type="button" onClick={onClick} className={cls}>
      {inner}
    </button>
  );
}
