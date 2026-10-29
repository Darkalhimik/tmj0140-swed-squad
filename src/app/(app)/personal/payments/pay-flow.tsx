"use client";

import { ArrowLeft, BadgeCheck, Check, CircleAlert, Download, Plus, Send, UserPlus, Zap } from "lucide-react";
import { useCallback, useState } from "react";
import { FeeBreakdown } from "@/components/banking/transparency";
import { SmartIdModal } from "@/components/banking/smart-id";
import { Timeline } from "@/components/banking/txn";
import { checkIban, cleanIban, formatIbanInput } from "@/components/personal/iban";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Field, Input, Select } from "@/components/ui/input";
import { KeyValue, Money, Note } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { downloadPersonalPaymentConfirmation } from "@/lib/export/documents";
import { fmtDate, iban as fmtIban, money, NOW } from "@/lib/format";
import { useStore } from "@/lib/store";

const NOW_ISO = NOW.toISOString();
const INSTANT_MAX = 5000;

export type Draft = {
  name: string;
  iban: string;
  amount: string;
  description: string;
  refNo: string;
  when: "now" | "later";
  date: string;
  trusted: boolean;
};

const empty: Draft = { name: "", iban: "", amount: "", description: "", refNo: "", when: "now", date: "2026-11-02T09:00:00+02:00", trusted: false };

const DATES = [
  { value: "2026-11-02T09:00:00+02:00", label: "Mon, 2 Nov" },
  { value: "2026-11-05T09:00:00+02:00", label: "Thu, 5 Nov" },
  { value: "2026-11-15T09:00:00+02:00", label: "Sun, 15 Nov · sent Mon 16 Nov" },
  { value: "2026-11-30T09:00:00+02:00", label: "Mon, 30 Nov" },
];

type TimelineSteps = Parameters<typeof Timeline>[0]["steps"];

export type Payee = { name: string; iban: string };

export function PayFlow({
  onSchedule,
  payees,
  onSavePayee,
  autoFocus,
}: {
  onSchedule: (d: Draft & { value: number }) => void;
  payees: Payee[];
  onSavePayee: (p: Payee) => void;
  autoFocus?: boolean;
}) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const main = state.personal.accounts.find((a) => a.id === "p-main")!;
  const pendingSum = state.personal.txns.filter((t) => t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const available = Math.round((main.balance + pendingSum) * 100) / 100;

  const [draft, setDraft] = useState<Draft>(empty);
  const [phase, setPhase] = useState<"form" | "review" | "done">("form");
  const [submitted, setSubmitted] = useState(false);
  const [signing, setSigning] = useState(false);
  const [sent, setSent] = useState<(Draft & { value: number; bank: string | null; instant: boolean }) | null>(null);

  const set = (patch: Partial<Draft>) => setDraft((d) => ({ ...d, ...patch }));

  const ibanCheck = checkIban(draft.iban, draft.trusted);
  const value = Number(draft.amount.replace(",", ".")) || 0;
  const instant = draft.when === "now" && value <= INSTANT_MAX;
  const bank = ibanCheck.state === "valid" ? ibanCheck.bank : null;

  const errors = {
    name: draft.name.trim().length < 2 ? "Enter the recipient's full name — we check it against the account." : undefined,
    iban:
      ibanCheck.state === "invalid"
        ? ibanCheck.message
        : ibanCheck.state === "empty" || ibanCheck.state === "typing"
          ? "Enter the full IBAN."
          : undefined,
    amount: value <= 0 ? "Enter an amount." : value > available ? `You have ${money(available)} available.` : undefined,
    refNo: draft.refNo && !/^\d{2,20}$/.test(draft.refNo) ? "Reference numbers have 2–20 digits." : undefined,
  };
  const valid = !errors.name && !errors.iban && !errors.amount && !errors.refNo;

  const reset = useCallback(() => {
    setDraft(empty);
    setPhase("form");
    setSubmitted(false);
    setSent(null);
  }, []);

  const confirmed = useCallback(() => {
    setSigning(false);
    const record = { ...draft, value, bank, instant };
    if (draft.when === "now") {
      dispatch({
        type: "personal/pay",
        to: draft.name.trim(),
        iban: cleanIban(draft.iban),
        amount: value,
        reference: draft.description.trim() || (draft.refNo ? `Ref. ${draft.refNo}` : ""),
        instant,
      });
      toast({ title: "Payment sent", description: `${money(value)} to ${draft.name.trim()}` });
    } else {
      onSchedule({ ...draft, value });
      toast({ title: "Payment scheduled", description: `${money(value)} to ${draft.name.trim()} on ${fmtDate(draft.date)}` });
    }
    setSent(record);
    setPhase("done");
  }, [draft, value, bank, instant, dispatch, toast, onSchedule]);

  // Verification of Payee: saved payees are known; new IBANs get a name check.
  const vop =
    draft.trusted || draft.name.trim().split(/\s+/).length >= 2
      ? { tone: "success" as const, text: "Name matches the account holder" }
      : { tone: "warning" as const, text: "Couldn't fully match the name — check it with the recipient" };

  if (phase === "done" && sent) {
    const steps: TimelineSteps =
      sent.when === "later"
        ? [
            { label: "Scheduled", at: NOW_ISO, state: "done" },
            { label: "Sent from Everyday account", state: "todo", note: `${fmtDate(sent.date, "long")} at 09:00 — we'll check your balance first and notify you` },
            { label: `Received by ${sent.bank ?? "the recipient's bank"}`, state: "todo" },
          ]
        : sent.instant
          ? [
              { label: "Sent from Everyday account", at: NOW_ISO, state: "done" },
              { label: `Received by ${sent.bank ?? "the recipient's bank"}`, at: NOW_ISO, state: "done", note: "SEPA Instant · arrived in 4 seconds" },
            ]
          : [
              { label: "Sent from Everyday account", at: NOW_ISO, state: "done" },
              { label: "Processing (SEPA)", state: "current", note: `Over ${money(INSTANT_MAX)}, so it goes as a standard SEPA payment. Arrives by next business day, 14:00.` },
              { label: `Received by ${sent.bank ?? "the recipient's bank"}`, state: "todo" },
            ];
    return (
      <Card className="overflow-hidden">
        <div className="flex flex-col items-center border-b border-line px-6 pt-8 pb-6 text-center">
          <span className="flex size-12 animate-pop-in items-center justify-center rounded-full bg-success text-white">
            <Check className="size-6" strokeWidth={2.5} />
          </span>
          <p className="mt-4 text-[22px] font-semibold tracking-[-0.03em]">
            <Money value={sent.value} /> {sent.when === "later" ? "scheduled for" : "sent to"} {sent.name.trim()}
          </p>
          <p className="mt-1 text-[13px] text-ink-3">
            {sent.when === "later" ? `Leaves your account on ${fmtDate(sent.date, "long")}` : "From Everyday account · fee €0.00"}
          </p>
        </div>
        <div className="px-6 py-5">
          <Timeline steps={steps} />
        </div>
        <div className="flex flex-col gap-2 border-t border-line bg-canvas px-6 py-4 sm:flex-row sm:justify-end">
          {!sent.trusted && (
            <Button
              variant="secondary"
              leading={<UserPlus className="size-4" />}
              onClick={() => {
                onSavePayee({ name: sent.name.trim(), iban: cleanIban(sent.iban) });
                setSent({ ...sent, trusted: true });
                toast({ title: "Payee saved", description: `${sent.name.trim()} · next time it's one tap` });
              }}
            >
              Save payee
            </Button>
          )}
          <Button
            variant="secondary"
            leading={<Download className="size-4" />}
            onClick={async () => {
              const file = await downloadPersonalPaymentConfirmation({
                name: sent.name.trim(),
                iban: sent.iban,
                bank: sent.bank,
                amount: sent.value,
                description: sent.description,
                refNo: sent.refNo,
                instant: sent.instant,
                scheduled: sent.when === "later" ? sent.date : null,
              });
              toast({ title: "Confirmation downloaded", description: file });
            }}
          >
            Download confirmation
          </Button>
          <Button variant="primary" leading={<Plus className="size-4" />} onClick={reset}>
            New payment
          </Button>
        </div>
      </Card>
    );
  }

  if (phase === "review") {
    return (
      <Card className="overflow-hidden">
        <div className="flex items-center gap-2 border-b border-line px-5 py-3.5">
          <Button variant="tertiary" size="sm" icon aria-label="Back to edit" onClick={() => setPhase("form")}>
            <ArrowLeft className="size-4" />
          </Button>
          <div>
            <h2 className="text-[15px] font-semibold tracking-[-0.01em]">Review payment</h2>
            <p className="text-[12px] text-ink-3">Nothing is sent until you confirm with Smart-ID.</p>
          </div>
        </div>
        <div className="flex flex-col gap-5 px-5 py-5">
          <div className="flex items-center gap-3">
            <Avatar name={draft.name.trim()} size="lg" />
            <div className="min-w-0 flex-1">
              <p className="truncate text-[15px] font-semibold">{draft.name.trim()}</p>
              <p className="truncate font-mono text-[13px] tracking-tight text-ink-3">{fmtIban(cleanIban(draft.iban))}</p>
            </div>
            {bank && <Badge tone="gray">{bank}</Badge>}
          </div>
          <div className={cn("flex items-center gap-2 rounded-lg px-3 py-2 text-[13px]", vop.tone === "success" ? "bg-success-soft text-success" : "bg-warning-soft text-warning")}>
            {vop.tone === "success" ? <BadgeCheck className="size-4" /> : <CircleAlert className="size-4" />}
            <span className="font-medium">{vop.text}</span>
            <span className="ml-auto hidden text-[12px] opacity-75 sm:inline">Verification of Payee</span>
          </div>

          <FeeBreakdown
            rows={[
              { label: "You send", value: money(value) },
              {
                label: "Fee",
                value: "€0.00",
                tone: "success",
                hint: "Included in your Essential plan. Without a plan: €0.38 per payment (€0.16 to Swedbank).",
              },
              { label: "Balance after", value: money(main.balance - value), tone: "muted" },
            ]}
            total={{ label: "Recipient gets", value: money(value) }}
            arrival={
              draft.when === "later"
                ? `Sent on ${DATES.find((d) => d.value === draft.date)?.label ?? fmtDate(draft.date)} at 09:00 · arrives the same day`
                : instant
                  ? "Arrives in ~10 seconds · SEPA Instant"
                  : `Over ${money(INSTANT_MAX)}: standard SEPA · arrives by next business day, 14:00`
            }
          />

          {(draft.description || draft.refNo) && (
            <dl className="divide-y divide-line rounded-lg px-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
              {draft.description && <KeyValue label="Description">{draft.description}</KeyValue>}
              {draft.refNo && (
                <KeyValue label="Reference number" mono>
                  {draft.refNo}
                </KeyValue>
              )}
            </dl>
          )}
          {instant && <Note tone="gray">Instant payments can’t be recalled once received. Check the name and amount before you confirm.</Note>}
        </div>
        <div className="flex flex-col-reverse gap-2 border-t border-line bg-canvas px-5 py-4 sm:flex-row sm:items-center sm:justify-end">
          <Button variant="tertiary" onClick={() => setPhase("form")}>
            Edit
          </Button>
          <Button variant="brand" size="lg" leading={<Send className="size-5" />} onClick={() => setSigning(true)}>
            {draft.when === "later" ? `Schedule ${money(value)}` : `Send ${money(value)}`}
          </Button>
        </div>
        <SmartIdModal
          open={signing}
          onClose={() => setSigning(false)}
          onConfirmed={confirmed}
          action={`${draft.when === "later" ? "Scheduled payment" : "Payment"} of ${money(value)} to ${draft.name.trim()}`}
          details={[
            { label: "To IBAN", value: <span className="font-mono text-[12px] tracking-tight">{fmtIban(cleanIban(draft.iban))}</span> },
            { label: "Amount", value: money(value) },
            { label: "Fee", value: "€0.00" },
            { label: "When", value: draft.when === "later" ? fmtDate(draft.date, "long") : instant ? "Now · ~10 seconds" : "Next business day" },
          ]}
        />
      </Card>
    );
  }

  return (
    <Card>
      <div className="flex items-start justify-between gap-4 px-5 pt-5">
        <div>
          <h2 className="text-[17px] font-semibold tracking-[-0.02em]">New payment</h2>
          <p className="mt-0.5 text-[13px] text-ink-3">
            From Everyday account · <Money value={available} /> available
          </p>
        </div>
        <Badge tone="gray" icon={<Zap className="size-3 text-brand" />}>
          Instant by default
        </Badge>
      </div>

      {/* Saved payees */}
      <div className="scrollbar-none mt-4 flex gap-1 overflow-x-auto px-4">
        <button onClick={reset} className="group flex w-[68px] shrink-0 flex-col items-center gap-1.5 rounded-lg py-2 hover:bg-subtle">
          <span className="flex size-10 items-center justify-center rounded-full bg-subtle text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line-strong)] group-hover:bg-surface">
            <Plus className="size-4" />
          </span>
          <span className="text-[11px] font-medium text-ink-2">New</span>
        </button>
        {payees.map((p) => {
          const active = draft.trusted && cleanIban(draft.iban) === cleanIban(p.iban);
          const short = p.name.replace("Landlord — ", "");
          return (
            <button
              key={p.iban}
              onClick={() => set({ name: p.name, iban: formatIbanInput(p.iban), trusted: true })}
              className={cn("flex w-[68px] shrink-0 flex-col items-center gap-1.5 rounded-lg py-2 transition-colors", active ? "bg-cream" : "hover:bg-subtle")}
            >
              <span className={cn("rounded-full", active && "ring-2 ring-brown ring-offset-2 ring-offset-cream")}>
                <Avatar name={short} size="lg" />
              </span>
              <span className="w-full truncate px-1 text-center text-[11px] font-medium text-ink-2">{short.split(" ")[0]}</span>
            </button>
          );
        })}
      </div>

      <form
        className="flex flex-col gap-4 px-5 pt-4 pb-5"
        onSubmit={(e) => {
          e.preventDefault();
          setSubmitted(true);
          if (valid) setPhase("review");
        }}
        noValidate
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            autoFocus={autoFocus}
            label="Recipient name"
            placeholder="e.g. Kristjan Tamm"
            value={draft.name}
            onChange={(e) => set({ name: e.target.value, trusted: false })}
            error={submitted ? errors.name : undefined}
            autoComplete="off"
          />
          <Input
            label="IBAN"
            placeholder="EE38 2200 2210 2014 5685"
            mono
            value={draft.iban}
            onChange={(e) => set({ iban: formatIbanInput(e.target.value), trusted: false })}
            error={submitted || ibanCheck.state === "invalid" ? errors.iban : undefined}
            hint={
              ibanCheck.state === "valid" ? (
                <span className="inline-flex items-center gap-1 text-success">
                  <Check className="size-3" strokeWidth={3} />
                  {ibanCheck.bank ? `${ibanCheck.bank} · ${ibanCheck.country}` : ibanCheck.country}
                  {draft.trusted && " · saved payee"}
                </span>
              ) : ibanCheck.state === "typing" ? (
                ibanCheck.hint
              ) : (
                "We detect the bank as you type"
              )
            }
            suffix={ibanCheck.state === "valid" ? <Check className="size-4 text-success" /> : undefined}
            autoComplete="off"
          />
        </div>

        <Input
          label="Amount"
          size="lg"
          inputMode="decimal"
          placeholder="0.00"
          prefix={<span className="text-[17px] text-ink-2">€</span>}
          className="tabular text-[20px] font-semibold tracking-[-0.02em]"
          value={draft.amount}
          onChange={(e) => set({ amount: e.target.value.replace(/[^\d.,]/g, "") })}
          error={submitted || value > available ? errors.amount : undefined}
          hint={value > INSTANT_MAX ? `Over ${money(INSTANT_MAX)} goes as standard SEPA — arrives next business day.` : "Fee €0.00 · included in your plan"}
        />

        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            label="Description"
            optional
            placeholder="e.g. Dinner on Friday"
            value={draft.description}
            onChange={(e) => set({ description: e.target.value.slice(0, 140) })}
            hint={`${draft.description.length}/140 · the recipient sees this`}
          />
          <Input
            label="Reference number"
            optional
            mono
            inputMode="numeric"
            placeholder="From the invoice, e.g. 7004217"
            value={draft.refNo}
            onChange={(e) => set({ refNo: e.target.value.replace(/\D/g, "").slice(0, 20) })}
            error={errors.refNo}
          />
        </div>

        <Field label="When">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
            <Segmented<"now" | "later">
              value={draft.when}
              onChange={(when) => set({ when })}
              items={[
                { value: "now", label: "Now" },
                { value: "later", label: "On a date" },
              ]}
            />
            {draft.when === "later" && (
              <div className="sm:w-64">
                <Select value={draft.date} onChange={(e) => set({ date: e.target.value })} aria-label="Payment date">
                  {DATES.map((d) => (
                    <option key={d.value} value={d.value}>
                      {d.label}
                    </option>
                  ))}
                </Select>
              </div>
            )}
          </div>
        </Field>

        <div className="mt-1 flex flex-col-reverse gap-3 border-t border-line pt-4 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-[12px] text-ink-3">You’ll see the fee and arrival time before anything is sent.</p>
          <Button type="submit" variant="primary" size="md" trailing={<ArrowLeft className="size-4 rotate-180" />}>
            Review payment
          </Button>
        </div>
      </form>
    </Card>
  );
}
