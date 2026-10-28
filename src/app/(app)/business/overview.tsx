"use client";

import { ArrowLeftRight, ArrowRight, CalendarClock, ChevronRight, CreditCard, Download, FileSignature, Plus, Receipt, UserPlus } from "lucide-react";
import Link from "next/link";
import { useState, type ReactNode } from "react";
import { AccountDetailsModal, MoveMoneyModal } from "@/components/banking/account-modals";
import { StatementExportModal } from "@/components/banking/transparency";
import { TxnDrawer, TxnRow } from "@/components/banking/txn";
import { RecentActivity } from "@/components/business/overview-activity";
import { PageContainer } from "@/components/shell/page-header";
import { CompanyMark } from "@/components/shell/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { BarPairs } from "@/components/ui/chart";
import { Meter } from "@/components/ui/meter";
import { Money } from "@/components/ui/misc";
import { useToast } from "@/components/ui/toast";
import { cashflow, company, companyLimits } from "@/lib/data/business";
import { cn } from "@/lib/cn";
import { fmtDate, iban as fmtIban, money, moneyParts, relative } from "@/lib/format";
import { CURRENT_MEMBER, useStore } from "@/lib/store";
import type { Txn } from "@/lib/types";

type Attention = { id: string; icon: ReactNode; tone: string; title: string; body: string; href: string };

export function BusinessOverview() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { accounts, payments, cards, txns, invites, members, audit } = state.business;
  const [modal, setModal] = useState<"move" | "details" | "statement" | null>(null);
  const [openTxn, setOpenTxn] = useState<Txn | null>(null);

  const total = accounts.reduce((s, a) => s + a.balance, 0);
  const parts = moneyParts(total);
  const main = accounts.find((a) => a.id === "b-main")!;
  const approvable = payments.filter(
    (p) => p.status === "awaiting" && p.createdBy !== CURRENT_MEMBER && !p.approvals.some((a) => a.memberId === CURRENT_MEMBER),
  );
  const missing = txns.filter((t) => t.receipt === false);
  const nearLimit = cards.filter((c) => !c.frozen && c.limits[0] && c.limits[0].used / c.limits[0].max >= 0.85);
  const salaries = payments.find((p) => p.status === "scheduled" && p.bulk);
  const memberName = (id?: string) => members.find((m) => m.id === id)?.name;
  const oct = cashflow.at(-1)!;

  const attention: Attention[] = [
    ...(approvable.length
      ? [
          {
            id: "approvals",
            icon: <FileSignature className="size-4" />,
            tone: "bg-brand-soft text-brand-text",
            title: `${approvable.length} payment${approvable.length > 1 ? "s" : ""} waiting for your approval`,
            body: `${money(approvable.reduce((s, p) => s + p.amount, 0))} · oldest ${relative(approvable.map((p) => p.createdAt).sort()[0]!)}`,
            href: "/business/payments",
          },
        ]
      : []),
    ...nearLimit.map((c) => ({
      id: `limit-${c.id}`,
      icon: <CreditCard className="size-4" />,
      tone: "bg-warning-soft text-warning",
      title: `${memberName(c.memberId) ?? c.name}'s card is at ${Math.round((c.limits[0]!.used / c.limits[0]!.max) * 100)}% of its limit`,
      body: `${money(c.limits[0]!.max - c.limits[0]!.used)} left until 1 Nov`,
      href: "/business/cards",
    })),
    ...(missing.length
      ? [
          {
            id: "receipts",
            icon: <Receipt className="size-4" />,
            tone: "bg-warning-soft text-warning",
            title: `${missing.length} card payments without a receipt`,
            body: missing.map((t) => memberName(t.memberId)?.split(" ")[0]).join(", "),
            href: "/business/cards",
          },
        ]
      : []),
    ...invites.map((i) => ({
      id: i.id,
      icon: <UserPlus className="size-4" />,
      tone: "bg-subtle text-ink-2",
      title: `Invite to ${i.email} not accepted yet`,
      body: `Expires ${fmtDate(i.expiresAt)}`,
      href: "/business/team",
    })),
    ...(salaries
      ? [
          {
            id: "salaries",
            icon: <CalendarClock className="size-4" />,
            tone: "bg-info-soft text-info",
            title: `Salaries go out ${fmtDate(salaries.executeAt)}`,
            body: `${money(salaries.amount)} to ${salaries.bulk} people · fully approved`,
            href: "/business/payments",
          },
        ]
      : []),
  ];

  return (
    <PageContainer>
      <div className="mb-7 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-center gap-3.5">
          <CompanyMark size="lg" />
          <div className="min-w-0">
            <h1 className="truncate text-[26px] leading-8 font-semibold tracking-[-0.035em]">{company.name}</h1>
            <p className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[13px] text-ink-3">
              <span>
                Registry code <span className="font-mono text-ink-2">{company.registryCode}</span>
              </span>
              <span className="text-ink-4">·</span>
              <span>
                VAT <span className="font-mono text-ink-2">{company.vat}</span>
              </span>
              <Badge tone="brown" size="xs">
                Owner
              </Badge>
            </p>
          </div>
        </div>
        <div className="flex gap-2">
          <Button variant="secondary" leading={<Download className="size-4" />} onClick={() => setModal("statement")}>
            Statement
          </Button>
          <ButtonLink href="/business/payments?new=1" variant="primary" leading={<Plus className="size-4" />}>
            New payment
          </ButtonLink>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <div className="flex flex-col gap-1 px-5 pt-5">
            <p className="text-[13px] text-ink-3">Total across {accounts.length} accounts</p>
            <p className="tabular text-[40px] leading-[44px] font-semibold tracking-[-0.045em]">
              {parts.whole}
              <span className="text-[0.55em] tracking-[-0.02em] text-ink-3">{parts.cents}</span>
            </p>
            <p className="text-[13px] text-ink-3">
              October: <span className="text-success">+{money(oct.a)} in</span> · <span className="text-ink-2">−{money(oct.b)} out</span>
            </p>
          </div>
          <ul className="mt-4 border-t border-line">
            {accounts.map((a) => (
              <li key={a.id} className="flex items-center gap-3 border-b border-line px-5 py-3 last:border-0">
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-ink">{a.name}</span>
                  <span className="block truncate font-mono text-[12px] tracking-tight text-ink-3">{fmtIban(a.iban)}</span>
                </span>
                {a.returnPct && <span className="hidden text-[12px] text-success sm:inline">{a.returnPct}% interest</span>}
                <Money value={a.balance} className="text-sm font-medium" />
              </li>
            ))}
          </ul>
          <div className="flex gap-2 border-t border-line bg-canvas px-5 py-3">
            <Button size="sm" variant="secondary" leading={<ArrowLeftRight className="size-3.5" />} onClick={() => setModal("move")}>
              Move money
            </Button>
            <Button size="sm" variant="tertiary" onClick={() => setModal("details")}>
              Account details
            </Button>
          </div>
        </Card>

        <Card className="flex flex-col">
          <CardHeader title="Needs your attention" description={attention.length ? `${attention.length} items` : "Nothing waiting on you"} />
          <ul className="flex flex-col px-2 pb-2">
            {attention.map((a) => (
              <li key={a.id}>
                <Link href={a.href} className="group flex items-center gap-3 rounded-lg px-3 py-2.5 transition-colors hover:bg-subtle">
                  <span className={cn("flex size-8 shrink-0 items-center justify-center rounded-lg", a.tone)}>{a.icon}</span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-[13px] leading-5 font-medium text-ink">{a.title}</span>
                    <span className="block truncate text-[12px] text-ink-3">{a.body}</span>
                  </span>
                  <ChevronRight className="size-4 shrink-0 text-ink-4 transition-transform group-hover:translate-x-0.5" />
                </Link>
              </li>
            ))}
          </ul>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader
            title="Cash flow"
            description="Last 6 months"
            action={
              <span className="flex items-center gap-3 text-[12px] text-ink-3">
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-sm bg-brown" />
                  Money in
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="size-2 rounded-sm bg-brand/70" />
                  Money out
                </span>
              </span>
            }
          />
          <div className="px-5 pb-5">
            <BarPairs data={cashflow} height={160} />
            <div className="mt-4 grid grid-cols-3 gap-3 border-t border-line pt-3 text-[13px]">
              <div>
                <p className="text-ink-3">In · Oct</p>
                <Money value={oct.a} className="font-medium" />
              </div>
              <div>
                <p className="text-ink-3">Out · Oct</p>
                <Money value={oct.b} className="font-medium" />
              </div>
              <div>
                <p className="text-ink-3">Net · Oct</p>
                <Money value={oct.a - oct.b} sign className="font-medium text-success" />
              </div>
            </div>
          </div>
        </Card>

        <Card>
          <CardHeader
            title="Company limits"
            description="Shared by everyone who can pay"
            action={
              <Link href="/business/payments" className="text-[13px] font-medium text-teal hover:underline">
                Rules
              </Link>
            }
          />
          <div className="flex flex-col gap-4 px-5 pb-5">
            {[
              { label: "Payments today", ...companyLimits.daily },
              { label: "Payments this month", ...companyLimits.monthly },
              { label: "Instant payments today", ...companyLimits.instantDaily },
            ].map((l) => (
              <div key={l.label}>
                <div className="mb-1.5 flex items-baseline justify-between gap-2 text-[13px]">
                  <span className="text-ink-2">{l.label}</span>
                  <span className="tabular text-ink-3">
                    {money(l.used)} <span className="text-ink-4">/ {money(l.max)}</span>
                  </span>
                </div>
                <Meter value={l.used} max={l.max} />
              </div>
            ))}
            <p className="text-[12px] text-ink-3">
              Above {money(companyLimits.secondApprovalFrom)} a payment always needs a second approver.
            </p>
          </div>
        </Card>
      </div>

      <div className="mt-5 grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <Card>
          <CardHeader
            title="Transactions"
            description="Main account"
            action={
              <ButtonLink href="/business/payments" size="sm" variant="tertiary" trailing={<ArrowRight className="size-3.5" />}>
                Payments
              </ButtonLink>
            }
          />
          <div className="px-2 pb-3">
            {txns.slice(0, 7).map((t) => (
              <TxnRow key={t.id} txn={t} showDate member={t.memberId ? memberName(t.memberId) : undefined} onClick={() => setOpenTxn(t)} />
            ))}
          </div>
        </Card>
        <Card>
          <CardHeader
            title="Recent activity"
            description="Every change, by whom"
            action={
              <Link href="/business/activity" className="text-[13px] font-medium text-teal hover:underline">
                View all
              </Link>
            }
          />
          <div className="px-2 pb-3">
            <RecentActivity events={audit.slice(0, 5)} members={members} />
          </div>
        </Card>
      </div>

      <AccountDetailsModal account={main} holder={company.name} open={modal === "details"} onClose={() => setModal(null)} />
      <MoveMoneyModal
        accounts={accounts}
        fromId="b-main"
        open={modal === "move"}
        onClose={() => setModal(null)}
        onMove={(from, to, amount) => {
          dispatch({ type: "move", scope: "business", from, to, amount });
          toast({ title: `${money(amount)} moved`, description: "Arrived instantly · no fee · logged in Activity" });
        }}
      />
      <StatementExportModal
        business
        open={modal === "statement"}
        onClose={() => setModal(null)}
        accounts={accounts}
        onExport={({ file, account, period }) => {
          dispatch({ type: "biz/log", action: "statement.downloaded", target: account, detail: `${period} · ${file.split(".").pop()?.toUpperCase()}` });
          toast({ title: "Statement downloaded", description: file });
        }}
      />
      <TxnDrawer txn={openTxn} onClose={() => setOpenTxn(null)} cards={cards} member={memberName(openTxn?.memberId)} />
    </PageContainer>
  );
}
