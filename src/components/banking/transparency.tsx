"use client";

import { Check, Clock, Download, FileSpreadsheet, FileText, Info } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Choicebox } from "@/components/ui/choicebox";
import { Meter } from "@/components/ui/meter";
import { Tooltip } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { Segmented } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";
import { money, NOW, fmtDate } from "@/lib/format";
import type { Allowance, Plan } from "@/lib/data/pricing";
import type { Account } from "@/lib/types";

export type FeeRow = { label: ReactNode; value: ReactNode; hint?: ReactNode; tone?: "muted" | "success" };

/**
 * Revolut-style fee preview shown before every confirmation:
 * amount, fee (with allowance context), total, and when it arrives.
 */
export function FeeBreakdown({
  rows,
  total,
  arrival,
  className,
}: {
  rows: FeeRow[];
  total: { label: ReactNode; value: ReactNode };
  arrival?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("overflow-hidden rounded-lg bg-subtle shadow-[inset_0_0_0_1px_var(--color-line)]", className)}>
      <dl className="flex flex-col gap-2 px-4 py-3.5">
        {rows.map((r, i) => (
          <div key={i} className="flex items-start justify-between gap-4 text-[13px]">
            <dt className="flex items-center gap-1 text-ink-3">
              {r.label}
              {r.hint && (
                <Tooltip content={r.hint}>
                  <Info className="size-3.5 text-ink-4" />
                </Tooltip>
              )}
            </dt>
            <dd className={cn("tabular text-right font-medium", r.tone === "success" ? "text-success" : r.tone === "muted" ? "text-ink-3" : "text-ink")}>
              {r.value}
            </dd>
          </div>
        ))}
        <div className="mt-1 flex items-baseline justify-between gap-4 border-t border-dashed border-line-strong pt-2.5">
          <dt className="text-sm font-medium text-ink">{total.label}</dt>
          <dd className="tabular text-[17px] font-semibold tracking-[-0.02em] text-ink">{total.value}</dd>
        </div>
      </dl>
      {arrival && (
        <div className="flex items-center gap-2 border-t border-line bg-surface/60 px-4 py-2.5 text-[13px] text-ink-2">
          <Clock className="size-3.5 text-ink-3" />
          {arrival}
        </div>
      )}
    </div>
  );
}

function daysUntil(iso: string) {
  return Math.max(0, Math.ceil((new Date(iso).getTime() - NOW.getTime()) / 86_400_000));
}

/** Vercel usage-row: label, used / included, meter, what happens after the limit. */
export function allowanceCost(a: Allowance) {
  if (a.monthly !== undefined) return a.monthly;
  if (a.included === null) return a.used * a.overage;
  return Math.max(0, a.used - a.included) * a.overage;
}

export function AllowanceRow({ a, resetsAt, className }: { a: Allowance; resetsAt: string; className?: string }) {
  const unlimited = a.included === null;
  const included = a.included ?? 0;
  const payPerUse = !unlimited && included === 0;
  const extra = unlimited ? 0 : Math.max(0, a.used - included);
  const over = !payPerUse && extra > 0;
  const cost = allowanceCost(a);
  const fmt = (n: number) => (a.money ? money(n) : n.toLocaleString("en-IE"));
  const caption =
    a.overageText ??
    (unlimited
      ? a.overage === 0
        ? "Unlimited · always free"
        : `${money(a.overage)} each`
      : a.overage === 0
        ? `${fmt(included)} included`
        : `${fmt(included)} included · then ${money(a.overage)} per ${a.unit}`);
  const left = included - a.used;

  return (
    <div className={cn("flex flex-col gap-2 py-4", className)}>
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <p className="text-sm font-medium text-ink">{a.label}</p>
          <p className="mt-0.5 text-[12px] text-ink-3">
            {caption}
            {a.hint && <span className="text-ink-4"> · {a.hint}</span>}
          </p>
        </div>
        <div className="shrink-0 text-right">
          <p className="tabular text-sm font-medium text-ink">
            {fmt(a.used)}
            {!unlimited && !payPerUse && <span className="text-ink-4"> / {fmt(included)}</span>}
          </p>
          <p className={cn("tabular text-[12px]", cost > 0 ? "text-ink-2" : "text-ink-4")}>{money(cost)}</p>
        </div>
      </div>
      {!unlimited && !payPerUse && <Meter value={a.used} max={included} />}
      {!unlimited && !payPerUse && !over && (
        <p className="text-[12px] text-ink-4">
          {fmt(left)} left · resets {fmtDate(resetsAt)} (in {daysUntil(resetsAt)} days)
        </p>
      )}
      {over && (
        <p className="text-[12px] text-warning">
          {fmt(extra)} over the free allowance · resets in {daysUntil(resetsAt)} days
        </p>
      )}
    </div>
  );
}

/** Honest plan comparison: same governance on every plan, current plan marked. */
export function PlanCompare({
  plans,
  current,
  onChoose,
  period = "month",
}: {
  plans: Plan[];
  current: string;
  onChoose: (id: string) => void;
  period?: string;
}) {
  return (
    <div className="grid gap-3 md:grid-cols-3">
      {plans.map((p) => {
        const isCurrent = p.id === current;
        return (
          <div
            key={p.id}
            className={cn(
              "flex flex-col rounded-xl bg-surface p-5",
              isCurrent ? "shadow-[0_0_0_1.5px_var(--color-brown)]" : "shadow-card",
            )}
          >
            <div className="flex items-center justify-between">
              <p className="text-[15px] font-semibold">{p.name}</p>
              {isCurrent ? <Badge tone="brown">Your plan</Badge> : <span className="text-[12px] text-ink-4">{p.tagline}</span>}
            </div>
            <p className="tabular mt-3 text-[28px] font-semibold tracking-[-0.035em]">
              {p.price === 0 ? "Free" : money(p.price)}
              {p.price > 0 && <span className="text-sm font-normal tracking-normal text-ink-3"> / {period}</span>}
            </p>
            <ul className="mt-4 flex flex-1 flex-col gap-2">
              {p.highlights.map((h) => (
                <li key={h} className="flex items-start gap-2 text-[13px] text-ink-2">
                  <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={2.5} />
                  {h}
                </li>
              ))}
            </ul>
            <Button className="mt-5" variant={isCurrent ? "secondary" : "primary"} disabled={isCurrent} onClick={() => onChoose(p.id)}>
              {isCurrent ? "Current plan" : `Switch to ${p.name}`}
            </Button>
          </div>
        );
      })}
    </div>
  );
}

type Format = "pdf" | "csv" | "camt" | "merit";

/** Statement export: account, period, format — and what's included. */
export function StatementExportModal({
  open,
  onClose,
  accounts,
  onExport,
  business,
}: {
  open: boolean;
  onClose: () => void;
  accounts: Account[];
  onExport: (summary: { file: string; account: string; period: string }) => void;
  business?: boolean;
}) {
  const [account, setAccount] = useState(accounts[0]?.id ?? "");
  const [period, setPeriod] = useState<"month" | "last" | "quarter" | "year">("month");
  const [format, setFormat] = useState<Format>("pdf");
  const periods = { month: "October 2026", last: "September 2026", quarter: "Q3 2026", year: "2026 to date" };
  const ext = format === "pdf" ? "pdf" : format === "csv" ? "csv" : "xml";
  const acc = accounts.find((a) => a.id === account);

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Download statement"
      description="Statements are free and include every fee, line by line."
      size="md"
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            leading={<Download className="size-4" />}
            onClick={() => {
              onExport({
                file: `statement-${periods[period].toLowerCase().replaceAll(" ", "-")}.${ext}`,
                account: acc?.name ?? "",
                period: periods[period],
              });
              onClose();
            }}
          >
            Download
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-5">
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">Account</p>
          <div className="flex flex-wrap gap-1.5">
            {accounts.map((a) => (
              <button
                key={a.id}
                onClick={() => setAccount(a.id)}
                className={cn(
                  "h-8 rounded-full px-3 text-[13px] transition-colors",
                  a.id === account ? "bg-brown text-white" : "bg-subtle text-ink-2 hover:bg-muted",
                )}
              >
                {a.name}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">Period</p>
          <Segmented
            value={period}
            onChange={setPeriod}
            size="sm"
            items={[
              { value: "month", label: "This month" },
              { value: "last", label: "Last month" },
              { value: "quarter", label: "Last quarter" },
              { value: "year", label: "Year to date" },
            ]}
          />
        </div>
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">Format</p>
          <Choicebox<Format>
            value={format}
            onChange={setFormat}
            items={[
              { value: "pdf", title: "PDF", description: "Signed by Swedbank, for landlords and authorities", icon: <FileText className="size-4" /> },
              { value: "csv", title: "CSV", description: "For spreadsheets", icon: <FileSpreadsheet className="size-4" /> },
              { value: "camt", title: "ISO 20022 (camt.053)", description: "For accounting software", icon: <FileSpreadsheet className="size-4" /> },
              ...(business
                ? [{ value: "merit" as const, title: "Merit Aktiva", description: "Sent straight to your connected ledger", icon: <FileSpreadsheet className="size-4" /> }]
                : []),
            ]}
          />
        </div>
        <p className="text-[12px] text-ink-3">Times are shown in Tallinn time (EET). Pending card payments are listed separately.</p>
      </div>
    </Modal>
  );
}
