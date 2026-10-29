"use client";

import {
  ArrowDownLeft,
  ArrowUpRight,
  Banknote,
  Check,
  Clock,
  FileText,
  Landmark,
  MapPin,
  Paperclip,
  Receipt,
  Repeat,
  RotateCcw,
  Split,
  TriangleAlert,
  X,
  Zap,
} from "lucide-react";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { KeyValue, Money } from "@/components/ui/misc";
import { Drawer } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { categoryMeta, merchantStyle } from "@/lib/data/merchants";
import { cn } from "@/lib/cn";
import { fmtDateTime, fmtTime, iban as fmtIban } from "@/lib/format";
import { downloadTxnConfirmation } from "@/lib/export/documents";
import { useStore } from "@/lib/store";
import type { Card, Txn } from "@/lib/types";

const PEOPLE = /^(Kristjan|Landlord|Liisa|Eva) /;

export function TxnIcon({ txn, size = "md" }: { txn: Txn; size?: "sm" | "md" | "lg" }) {
  const dims = size === "lg" ? "size-14 rounded-2xl text-[18px]" : size === "md" ? "size-10 rounded-full text-[13px]" : "size-8 rounded-full text-[11px]";
  if (PEOPLE.test(txn.counterparty) || (txn.method === "tocard" && !/card ••/.test(txn.counterparty))) {
    return <Avatar name={txn.counterparty.replace("Landlord — ", "")} size={size === "lg" ? "xl" : size === "md" ? "lg" : "md"} />;
  }
  if (txn.method === "internal") {
    return (
      <span className={cn("flex shrink-0 items-center justify-center bg-cream text-brown", dims)}>
        <Repeat className="size-[45%]" />
      </span>
    );
  }
  if (txn.method === "atm") {
    return (
      <span className={cn("flex shrink-0 items-center justify-center bg-muted text-ink-2", dims)}>
        <Banknote className="size-[45%]" />
      </span>
    );
  }
  const s = merchantStyle(txn.counterparty);
  return (
    <span
      className={cn("flex shrink-0 items-center justify-center font-semibold tracking-tight shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]", dims)}
      style={{ background: s.bg, color: s.fg }}
    >
      {s.mark}
    </span>
  );
}

export function methodLabel(txn: Txn) {
  switch (txn.method) {
    case "card":
      return "Card payment";
    case "instant":
      return "Instant transfer";
    case "sepa":
      return "SEPA transfer";
    case "einvoice":
      return "E-invoice";
    case "standing":
      return "Standing order";
    case "fee":
      return "Bank fee";
    case "interest":
      return "Interest";
    case "atm":
      return "Cash withdrawal";
    case "internal":
      return "Between your accounts";
    case "tocard":
      return "Transfer to card";
  }
}

export function TxnRow({ txn, onClick, showDate, member }: { txn: Txn; onClick?: () => void; showDate?: boolean; member?: string }) {
  const declined = txn.status === "declined";
  return (
    <button
      onClick={onClick}
      className="group flex w-full items-center gap-3.5 rounded-lg px-3 py-2.5 text-left transition-colors hover:bg-subtle"
    >
      <TxnIcon txn={txn} />
      <span className="min-w-0 flex-1">
        <span className={cn("block truncate text-sm font-medium text-ink", declined && "text-ink-3 line-through decoration-ink-4")}>
          {txn.counterparty}
        </span>
        <span className="flex items-center gap-1.5 truncate text-[12px] text-ink-3">
          {showDate ? fmtDateTime(txn.at) : fmtTime(txn.at)}
          <span className="text-ink-4">·</span>
          {member ? member : categoryMeta[txn.category].label}
          {txn.method === "instant" && <Zap className="size-3 text-brand" aria-label="Instant" />}
        </span>
      </span>
      <span className="flex flex-col items-end gap-0.5">
        <Money
          value={txn.amount}
          sign
          className={cn("text-sm font-medium", txn.amount > 0 ? "text-success" : "text-ink", declined && "text-ink-4")}
        />
        <TxnStatusLabel txn={txn} />
      </span>
    </button>
  );
}

export function TxnStatusLabel({ txn }: { txn: Txn }) {
  if (txn.status === "pending")
    return (
      <span className="flex items-center gap-1 text-[11px] text-warning">
        <Clock className="size-3" />
        Pending
      </span>
    );
  if (txn.status === "declined")
    return (
      <span className="flex items-center gap-1 text-[11px] text-danger">
        <X className="size-3" />
        Declined
      </span>
    );
  if (txn.status === "refunded")
    return (
      <span className="flex items-center gap-1 text-[11px] text-info">
        <RotateCcw className="size-3" />
        Refunded later
      </span>
    );
  if (txn.refundOf)
    return (
      <span className="flex items-center gap-1 text-[11px] text-info">
        <RotateCcw className="size-3" />
        Refund
      </span>
    );
  if (txn.receipt === false)
    return (
      <span className="flex items-center gap-1 text-[11px] text-warning">
        <Receipt className="size-3" />
        Receipt missing
      </span>
    );
  return null;
}

type Step = { label: string; at?: string; state: "done" | "current" | "todo" | "failed"; note?: string };

function timeline(txn: Txn): Step[] {
  const plus = (mins: number) => new Date(new Date(txn.at).getTime() + mins * 60_000).toISOString();
  if (txn.refundOf)
    return [
      { label: "Refund issued by the merchant", at: txn.at, state: "done", note: txn.reference },
      { label: "Credited to your card account", at: txn.at, state: "done", note: "The original purchase stays in your history, marked as refunded." },
    ];
  if (txn.method === "card") {
    if (txn.status === "declined")
      return [
        { label: "Authorisation requested", at: txn.at, state: "done" },
        { label: "Declined by Swedbank", at: txn.at, state: "failed", note: txn.note ?? "Card was frozen" },
      ];
    if (txn.status === "pending")
      return [
        { label: "Authorised", at: txn.at, state: "done", note: "Amount reserved on your account" },
        { label: "Merchant settles", state: "current", note: "Usually 1–3 days. The amount can change slightly (e.g. tips)." },
        { label: "Booked", state: "todo" },
      ];
    const steps: Step[] = [
      { label: "Authorised", at: txn.at, state: "done" },
      { label: "Booked", at: plus(60 * 26), state: "done" },
    ];
    if (txn.status === "refunded") steps.push({ label: "Refunded", at: plus(60 * 48), state: "done", note: txn.note });
    return steps;
  }
  if (txn.method === "tocard") {
    const via = txn.toCard?.network === "Mastercard" ? "Mastercard Move" : "Visa Direct";
    return [
      { label: "Sent from Everyday account", at: txn.at, state: "done" },
      { label: `Pushed to the card via ${via}`, at: txn.at, state: "done" },
      txn.status === "pending"
        ? { label: `Credited to ${txn.toCard?.bank ?? "the"} card ••${txn.toCard?.last4}`, state: "current", note: "Usually within 30 minutes. We'll notify you when it lands." }
        : { label: `Credited to ${txn.toCard?.bank ?? "the"} card ••${txn.toCard?.last4}`, at: txn.at, state: "done", note: "Arrived instantly" },
    ];
  }
  if (txn.method === "instant")
    return [
      { label: "Sent", at: txn.at, state: "done" },
      { label: "Received by recipient's bank", at: txn.at, state: "done", note: "SEPA Instant" },
    ];
  if (txn.status === "pending")
    return [
      { label: "Sent", at: txn.at, state: "done" },
      { label: "Processing (SEPA)", state: "current", note: "Arrives by next business day, 14:00" },
      { label: "Received", state: "todo" },
    ];
  return [
    { label: txn.amount > 0 ? "Sent by payer" : "Sent", at: txn.at, state: "done" },
    { label: txn.amount > 0 ? "Credited to your account" : "Received by recipient's bank", at: plus(2), state: "done" },
  ];
}

export function Timeline({ steps }: { steps: Step[] }) {
  return (
    <ol className="relative flex flex-col">
      {steps.map((s, i) => (
        <li key={s.label} className="relative flex gap-3 pb-4 last:pb-0">
          {i < steps.length - 1 && (
            <span
              className={cn(
                "absolute top-5 bottom-0 left-[9px] w-px",
                s.state === "done" ? "bg-success/40" : "bg-line-strong [background:repeating-linear-gradient(to_bottom,var(--color-line-strong)_0_3px,transparent_3px_6px)]",
              )}
            />
          )}
          <span
            className={cn(
              "relative z-10 mt-0.5 flex size-[19px] shrink-0 items-center justify-center rounded-full",
              s.state === "done" && "bg-success text-white",
              s.state === "current" && "bg-warning-soft shadow-[inset_0_0_0_1.5px_var(--color-warning)]",
              s.state === "todo" && "bg-surface shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]",
              s.state === "failed" && "bg-danger text-white",
            )}
          >
            {s.state === "done" && <Check className="size-3" strokeWidth={3} />}
            {s.state === "failed" && <X className="size-3" strokeWidth={3} />}
            {s.state === "current" && <span className="size-1.5 animate-pulse rounded-full bg-warning" />}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-baseline justify-between gap-3">
              <p className={cn("text-[13px] font-medium", s.state === "todo" ? "text-ink-3" : "text-ink")}>{s.label}</p>
              {s.at && <p className="tabular shrink-0 text-[12px] text-ink-3">{fmtDateTime(s.at)}</p>}
            </div>
            {s.note && <p className="mt-0.5 text-[12px] text-ink-3">{s.note}</p>}
          </div>
        </li>
      ))}
    </ol>
  );
}

export function TxnDrawer({
  txn,
  onClose,
  cards,
  member,
}: {
  txn: Txn | null;
  onClose: () => void;
  cards?: Card[];
  member?: string;
}) {
  const toast = useToast();
  const { state } = useStore();
  const card = txn?.cardId ? cards?.find((c) => c.id === txn.cardId) : undefined;
  return (
    <Drawer open={!!txn} onClose={onClose} title="Transaction details">
      {txn && (
        <div className="flex flex-col">
          <div className="flex flex-col items-center border-b border-line px-6 pt-6 pb-5 text-center">
            <TxnIcon txn={txn} size="lg" />
            <p className="mt-3 text-sm font-medium text-ink-2">{txn.counterparty}</p>
            <Money
              value={txn.amount}
              sign
              className={cn("mt-1 text-[34px] leading-10 font-semibold tracking-[-0.015em]", txn.amount > 0 ? "text-success" : "text-ink")}
            />
            <div className="mt-2 flex items-center gap-1.5">
              <Badge tone="gray" icon={txn.amount > 0 ? <ArrowDownLeft className="size-3" /> : <ArrowUpRight className="size-3" />}>
                {methodLabel(txn)}
              </Badge>
              <Badge tone="gray">
                <span className="size-1.5 rounded-full" style={{ background: categoryMeta[txn.category].color }} />
                {categoryMeta[txn.category].label}
              </Badge>
            </div>
          </div>

          <section className="border-b border-line px-6 py-5">
            <p className="mb-3 text-[13px] font-medium text-ink-2">Status</p>
            <Timeline steps={timeline(txn)} />
          </section>

          <section className="border-b border-line px-6 py-3">
            <dl className="divide-y divide-line">
              {txn.method === "card" && txn.location && (
                <KeyValue label="Where">
                  <span className="inline-flex items-center gap-1">
                    <MapPin className="size-3.5 text-ink-3" />
                    {txn.location}
                  </span>
                </KeyValue>
              )}
              {card && (
                <KeyValue label="Card">
                  {card.name} ••{card.last4}
                </KeyValue>
              )}
              {member && <KeyValue label="Spent by">{member}</KeyValue>}
              {txn.iban && <KeyValue label={txn.amount > 0 ? "From IBAN" : "To IBAN"} mono>{fmtIban(txn.iban)}</KeyValue>}
              {txn.toCard && (
                <KeyValue label="To card">
                  {txn.toCard.network} ••{txn.toCard.last4} · {txn.toCard.bank}, {txn.toCard.country}
                </KeyValue>
              )}
              {txn.reference && <KeyValue label="Reference">{txn.reference}</KeyValue>}
              <KeyValue label="Amount">
                <Money value={Math.abs(txn.amount)} />
              </KeyValue>
              <KeyValue label="Fee">
                <span className="inline-flex items-center gap-1.5">
                  <Money value={txn.fee ?? 0} />
                  {(txn.fee ?? 0) > 0 ? (
                    <Badge size="xs" tone="gray">
                      Booked as a separate line
                    </Badge>
                  ) : (
                    <Badge size="xs" tone="success">
                      {txn.method === "atm" ? "Free up to €2,000/month" : txn.method === "tocard" ? "Free to Swedbank cards" : "No fee"}
                    </Badge>
                  )}
                </span>
              </KeyValue>
              <KeyValue label="Exchange rate">
                {txn.fx ? (
                  <span className="flex flex-col items-end">
                    <span>
                      1 EUR = {txn.fx.rate} {txn.fx.currency}
                    </span>
                    <span className="text-[12px] text-ink-3">
                      Mid-market {txn.fx.mid} · recipient got {txn.fx.received.toLocaleString("en-IE", { minimumFractionDigits: 2 })} {txn.fx.currency}
                    </span>
                  </span>
                ) : (
                  "None — paid in EUR"
                )}
              </KeyValue>
              <KeyValue label="Transaction ID" mono>
                {txn.id.toUpperCase()}-{txn.at.slice(0, 10).replaceAll("-", "")}
              </KeyValue>
            </dl>
          </section>

          <section className="grid grid-cols-2 gap-2 px-6 py-5">
            <Button variant="secondary" leading={<Paperclip className="size-4" />} onClick={() => toast({ title: "Receipt attached", description: "receipt.jpg · visible to your accountant" })}>
              Add receipt
            </Button>
            <Button variant="secondary" leading={<Split className="size-4" />} onClick={() => toast({ title: "Split request sent", description: "Kristjan Tamm will get a payment link" })}>
              Split bill
            </Button>
            <Button
              variant="secondary"
              leading={<FileText className="size-4" />}
              onClick={async () => {
                const account = state.business.accounts.find((a) => a.id === txn.accountId);
                const file = await downloadTxnConfirmation(
                  txn,
                  account ? { ...state.business.profile, iban: account.iban } : undefined,
                );
                toast({ title: "Confirmation downloaded", description: file });
              }}
            >
              Get confirmation
            </Button>
            <Button variant="secondary" leading={<TriangleAlert className="size-4" />} onClick={() => toast({ title: "Dispute started", tone: "info", description: "We'll reply within 2 business days" })}>
              Report a problem
            </Button>
          </section>
          {txn.method === "fee" && (
            <div className="px-6 pb-6">
              <p className="flex items-start gap-2 rounded-lg bg-subtle p-3 text-[13px] text-ink-2">
                <Landmark className="mt-0.5 size-4 shrink-0 text-ink-3" />
                Your monthly plan fee. What it covers is in Plan &amp; fees.
              </p>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}
