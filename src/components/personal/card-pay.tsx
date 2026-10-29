"use client";

import { ArrowLeft, BadgeCheck, Check, CircleAlert, CreditCard, Download, Plus, Send } from "lucide-react";
import { useCallback, useEffect, useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { FeeBreakdown } from "@/components/banking/transparency";
import { Timeline } from "@/components/banking/txn";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Money, Note } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/spinner";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { downloadCardTransferConfirmation } from "@/lib/export/documents";
import { money, NOW } from "@/lib/format";
import { useStore } from "@/lib/store";
import {
  arrivalFor,
  CARD_LIMITS,
  cardTransferFee,
  checkCard,
  digits,
  formatCardInput,
  FX,
  savedCards,
  type Issuer,
  type Network,
} from "./card-number";

const NOW_ISO = NOW.toISOString();

const fmtUah = (n: number) => `${n.toLocaleString("en-IE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} UAH`;

export function NetworkMark({ network, className, size = "md" }: { network: Network | null; className?: string; size?: "xs" | "md" }) {
  if (network === "Mastercard") {
    return (
      <svg viewBox="0 0 32 20" className={cn(size === "xs" ? "h-2.5 w-auto" : "h-4 w-auto", className)} aria-label="Mastercard">
        <circle cx="12" cy="10" r="8" fill="#eb001b" />
        <circle cx="20" cy="10" r="8" fill="#f79e1b" fillOpacity="0.9" />
      </svg>
    );
  }
  if (network === "Visa") {
    return (
      <span className={cn("font-extrabold tracking-tight text-[#1a1f71] italic", size === "xs" ? "text-[7px] leading-none" : "text-[13px]", className)}>
        VISA
      </span>
    );
  }
  return <CreditCard className={cn("size-4 text-ink-4", className)} />;
}

type Sent = {
  holder: string | null;
  last4: string;
  network: Network;
  issuer: Issuer;
  value: number;
  fee: number;
  received: number;
  message: string;
};

/** "Send to a card": push-to-card via Visa Direct / Mastercard Move — no IBAN needed. */
export function CardPayFlow({ autoFocus }: { autoFocus?: boolean }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const main = state.personal.accounts.find((a) => a.id === "p-main")!;
  const pendingSum = state.personal.txns.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const available = Math.round((main.balance + pendingSum) * 100) / 100;

  const [card, setCard] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [phase, setPhase] = useState<"form" | "review" | "done">("form");
  const [signing, setSigning] = useState(false);
  const [checkedFor, setCheckedFor] = useState<string | null>(null);
  const [sent, setSent] = useState<Sent | null>(null);

  const check = checkCard(card);
  const num = digits(card);
  const valid = check.state === "valid";
  const nameReady = valid && checkedFor === num;

  // Simulate the network's name check (Visa Account Name Inquiry) for a valid number.
  useEffect(() => {
    if (!valid || checkedFor === num) return;
    const t = window.setTimeout(() => setCheckedFor(num), 700);
    return () => window.clearTimeout(t);
  }, [valid, num, checkedFor]);

  const value = Number(amount.replace(",", ".")) || 0;
  const fee = valid ? cardTransferFee(check.issuer, value) : { fee: 0, rule: "" };
  const fx = valid && check.issuer.currency === "UAH" ? FX.UAH : null;
  const received = fx ? Math.round(value * fx.ours * 100) / 100 : value;
  const leftThisMonth = CARD_LIMITS.perMonth - CARD_LIMITS.usedThisMonth;

  const errors = {
    card:
      check.state === "invalid"
        ? check.message
        : check.state === "empty" || check.state === "typing"
          ? "Enter the full 16-digit card number."
          : undefined,
    amount:
      value <= 0
        ? "Enter an amount."
        : value + fee.fee > available
          ? `You have ${money(available)} available (incl. the ${money(fee.fee)} fee).`
          : value > CARD_LIMITS.perTransfer
            ? `Up to ${money(CARD_LIMITS.perTransfer)} per card transfer.`
            : value > leftThisMonth
              ? `${money(leftThisMonth)} left of your ${money(CARD_LIMITS.perMonth)} monthly card-transfer limit.`
              : undefined,
  };
  const ready = !errors.card && !errors.amount && nameReady;

  const reset = useCallback(() => {
    setCard("");
    setAmount("");
    setMessage("");
    setSubmitted(false);
    setPhase("form");
    setSent(null);
  }, []);

  const confirmed = useCallback(() => {
    setSigning(false);
    if (check.state !== "valid") return;
    const holder = check.holder;
    dispatch({
      type: "personal/payCard",
      to: holder ? holder : `${check.network} card ••${check.last4}`,
      amount: value,
      fee: fee.fee,
      message: message.trim(),
      card: { last4: check.last4, network: check.network, bank: check.issuer.bank, country: check.issuer.country },
      fx: fx ? { currency: "UAH", rate: fx.ours, mid: fx.mid, received } : undefined,
      instant: !!check.issuer.swedbank,
    });
    toast({ title: "Money sent to card", description: `${money(value)} to ${check.network} ••${check.last4}` });
    setSent({ holder, last4: check.last4, network: check.network, issuer: check.issuer, value, fee: fee.fee, received, message: message.trim() });
    setPhase("done");
  }, [check, value, fee.fee, message, fx, received, dispatch, toast]);

  // ── Done ──────────────────────────────────────────────
  if (phase === "done" && sent) {
    const via = sent.network === "Mastercard" ? "Mastercard Move" : "Visa Direct";
    const credited = `Credited to ${sent.issuer.bank} card ••${sent.last4}`;
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center border-b border-line px-6 pt-8 pb-6 text-center">
          <span className="flex size-12 animate-pop-in items-center justify-center rounded-full bg-success text-white">
            <Check className="size-6" strokeWidth={2.5} />
          </span>
          <p className="mt-4 text-[22px] font-semibold tracking-[-0.03em]">
            <Money value={sent.value} /> sent to {sent.holder ?? `card ••${sent.last4}`}
          </p>
          <p className="mt-1 text-[13px] text-ink-3">
            {sent.issuer.currency === "UAH" ? `They get ${fmtUah(sent.received)}` : "They get the full amount"} · fee {money(sent.fee)}
          </p>
        </div>
        <div className="px-6 py-5">
          <Timeline
            steps={[
              { label: "Sent from Everyday account", at: NOW_ISO, state: "done" },
              { label: `Pushed to the card via ${via}`, at: NOW_ISO, state: "done" },
              sent.issuer.swedbank
                ? { label: credited, at: NOW_ISO, state: "done", note: "Arrived instantly" }
                : { label: credited, state: "current", note: `${arrivalFor(sent.issuer)}. We'll notify you when it lands.` },
            ]}
          />
        </div>
        <div className="flex flex-col gap-2 border-t border-line bg-canvas px-6 py-4 sm:flex-row sm:justify-end">
          <Button
            variant="secondary"
            leading={<Download className="size-4" />}
            onClick={async () => {
              const file = await downloadCardTransferConfirmation(sent);
              toast({ title: "Confirmation downloaded", description: file });
            }}
          >
            Download confirmation
          </Button>
          <Button variant="primary" leading={<Plus className="size-4" />} onClick={reset}>
            Send another
          </Button>
        </div>
      </Card>
    );
  }

  // ── Review ────────────────────────────────────────────
  if (phase === "review" && check.state === "valid") {
    const via = check.network === "Mastercard" ? "Mastercard Move" : "Visa Direct";
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <Button variant="tertiary" size="sm" icon aria-label="Back to edit" onClick={() => setPhase("form")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Review card transfer</h2>
            <p className="text-[12px] text-ink-3">Nothing is sent until you confirm with Smart-ID.</p>
          </div>
        </div>
        <div className="flex flex-col gap-5 px-5 py-5">
          <div className="flex items-center gap-3">
            {check.holder ? (
              <Avatar name={check.holder} size="lg" />
            ) : (
              <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-ink-3">
                <CreditCard className="size-5" />
              </span>
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{check.holder ?? "Card owner"}</p>
              <p className="flex items-center gap-2 font-mono text-[13px] tracking-tight text-ink-3">
                <NetworkMark network={check.network} />
                •••• {check.last4}
              </p>
            </div>
            <Badge tone="gray">
              {check.issuer.bank} · {check.issuer.country}
            </Badge>
          </div>

          <NameCheck holder={check.holder} network={check.network} />

          <FeeBreakdown
            rows={[
              { label: "You send", value: money(value) },
              {
                label: "Fee",
                value: fee.fee === 0 ? "€0.00" : money(fee.fee),
                tone: fee.fee === 0 ? "success" : undefined,
                hint: `${fee.rule}. Free to Swedbank cards · €0.50 to other EU cards · 1% (min €1.00) outside the EU.`,
              },
              ...(fx
                ? [
                    {
                      label: "Exchange rate",
                      value: `1 EUR = ${fx.ours} UAH`,
                      hint: `Mid-market rate ${fx.mid} UAH. Our rate includes a ${fx.markupPct}% markup — that's the only FX cost.`,
                    },
                  ]
                : []),
              { label: "Total from your account", value: money(value + fee.fee), tone: "muted" as const },
            ]}
            total={{ label: "They get", value: fx ? fmtUah(received) : money(received) }}
            arrival={`${arrivalFor(check.issuer)} · ${via}`}
          />

          {message && (
            <p className="rounded-lg px-3 py-2.5 text-[13px] text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]">
              <span className="text-ink-3">Message: </span>
              {message}
            </p>
          )}
          <Note tone="gray">
            Card transfers can’t be recalled once the money lands. The name check helps you catch a wrong number before you sign.
          </Note>
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-line bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="tertiary" onClick={() => setPhase("form")}>
            Edit
          </Button>
          <Button variant="brand" size="lg" leading={<Send className="size-5" />} onClick={() => setSigning(true)}>
            Send {money(value)}
          </Button>
        </div>
        <SmartIdModal
          open={signing}
          onClose={() => setSigning(false)}
          onConfirmed={confirmed}
          action={`Transfer of ${money(value)} to ${check.network} card ••${check.last4}`}
          details={[
            { label: "Card owner", value: check.holder ?? "Not returned by the network" },
            { label: "Card", value: `${check.issuer.bank} · ${check.issuer.country}` },
            { label: "Fee", value: money(fee.fee) },
            { label: "They get", value: fx ? fmtUah(received) : money(received) },
          ]}
        />
      </Card>
    );
  }

  // ── Form ──────────────────────────────────────────────
  const showCardError = check.state === "invalid" || (submitted && !!errors.card);
  return (
    <Card>
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <h2 className="flex items-center gap-2 text-[17px] font-semibold tracking-[-0.02em]">
            Send to a card
            <Badge tone="brand" size="xs">
              New
            </Badge>
          </h2>
          <p className="mt-0.5 text-[13px] text-ink-3">
            To any Visa or Mastercard — no IBAN needed · <Money value={available} /> available
          </p>
        </div>
        <span className="flex items-center gap-1.5">
          <NetworkMark network="Visa" />
          <NetworkMark network="Mastercard" />
        </span>
      </div>

      <div className="scrollbar-none mt-4 flex gap-1 overflow-x-auto px-4">
        {savedCards.map((c) => {
          const active = num === c.number;
          const net = checkCard(c.number);
          return (
            <button
              key={c.number}
              onClick={() => setCard(formatCardInput(c.number))}
              className={cn("flex w-[76px] shrink-0 flex-col items-center gap-1.5 rounded-lg py-2 transition-colors", active ? "bg-cream" : "hover:bg-subtle")}
            >
              <span className={cn("relative rounded-full", active && "ring-2 ring-brown ring-offset-2 ring-offset-cream")}>
                <Avatar name={c.name} size="lg" />
                <span className="absolute -right-1 -bottom-1 flex h-4 items-center rounded bg-surface px-0.5 shadow-card">
                  <NetworkMark network={net.state === "valid" ? net.network : null} size="xs" />
                </span>
              </span>
              <span className="w-full truncate px-1 text-center text-[11px] font-medium text-ink-2">{c.name.split(" ")[0]}</span>
              <span className="-mt-1 font-mono text-[10px] text-ink-4">••{c.number.slice(-4)}</span>
            </button>
          );
        })}
      </div>

      <form
        className="flex flex-col gap-4 px-5 pt-4 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (ready) setPhase("review");
        }}
        noValidate
      >
        <Input
          autoFocus={autoFocus}
          label="Card number"
          placeholder="1234 5678 9012 3456"
          mono
          size="lg"
          inputMode="numeric"
          autoComplete="off"
          className="text-[16px] tracking-[0.06em]"
          value={card}
          onChange={(e) => setCard(formatCardInput(e.target.value))}
          error={showCardError ? errors.card : undefined}
          suffix={<NetworkMark network={check.state === "valid" ? check.network : check.state === "typing" ? check.network : null} />}
          hint={
            check.state === "valid" ? (
              <span className="inline-flex items-center gap-1 text-success">
                <Check className="size-3" strokeWidth={3} />
                {check.network} · {check.issuer.bank}, {check.issuer.country}
              </span>
            ) : (
              "Only the card number — never the expiry date or CVC. We'll never ask for those."
            )
          }
        />

        {valid && (nameReady ? <NameCheck holder={check.holder} network={check.network} /> : <NameChecking network={check.network} />)}

        <Input
          label="Amount"
          size="lg"
          inputMode="decimal"
          placeholder="0.00"
          prefix={<span className="text-[17px] text-ink-2">€</span>}
          className="tabular text-[20px] font-semibold tracking-[-0.02em]"
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
          error={submitted || value > available ? errors.amount : undefined}
          hint={
            valid && value > 0
              ? fx
                ? `They get ≈ ${fmtUah(received)} · fee ${money(fee.fee)} · rate 1 EUR = ${fx.ours} UAH`
                : `They get ${money(received)} · fee ${fee.fee === 0 ? "€0.00 (Swedbank card)" : money(fee.fee)}`
              : `Up to ${money(CARD_LIMITS.perTransfer)} per transfer · ${money(leftThisMonth)} left this month`
          }
        />

        <Input
          label="Message"
          optional
          placeholder="e.g. Concert tickets"
          value={message}
          onChange={(e) => setMessage(e.target.value.slice(0, 35))}
          hint={`${message.length}/35 · shown in their bank app`}
        />

        <div className="mt-1 flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-ink-3">You’ll see the fee, the rate and what they get before anything is sent.</p>
          <Button type="submit" variant="primary" disabled={valid && !nameReady} trailing={<ArrowLeft className="size-4 rotate-180" />}>
            Review transfer
          </Button>
        </div>
      </form>
    </Card>
  );
}

function NameChecking({ network }: { network: Network }) {
  return (
    <div className="flex items-center gap-2 rounded-lg bg-subtle px-3 py-2.5 text-[13px] text-ink-3">
      <Spinner className="size-3.5" />
      Checking the card owner with {network}…
    </div>
  );
}

function NameCheck({ holder, network }: { holder: string | null; network: Network }) {
  return (
    <div
      className={cn(
        "flex items-center gap-2 rounded-lg px-3 py-2.5 text-[13px]",
        holder ? "bg-success-soft text-success" : "bg-warning-soft text-warning",
      )}
    >
      {holder ? <BadgeCheck className="size-4 shrink-0" /> : <CircleAlert className="size-4 shrink-0" />}
      <span className="font-medium">{holder ? `Card belongs to ${holder}` : "The card network didn't return a name — check the number with the recipient"}</span>
      <span className="ml-auto hidden shrink-0 text-[12px] opacity-75 sm:inline">Name check · {network}</span>
    </div>
  );
}
