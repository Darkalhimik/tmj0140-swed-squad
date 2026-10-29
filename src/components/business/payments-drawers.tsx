"use client";

import { Check, Download, Paperclip, ShieldCheck, Zap } from "lucide-react";
import { useState } from "react";
import { Timeline } from "@/components/banking/txn";
import { FeeBreakdown } from "@/components/banking/transparency";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input, Textarea } from "@/components/ui/input";
import { KeyValue, Money, Note } from "@/components/ui/misc";
import { Drawer, Modal } from "@/components/ui/overlay";
import { StatusDot } from "@/components/ui/status-dot";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { companyLimits } from "@/lib/data/business";
import { merchantStyle } from "@/lib/data/merchants";
import { cn } from "@/lib/cn";
import { fmtDate, fmtDateTime, iban as fmtIban, money, NOW } from "@/lib/format";
import { CURRENT_MEMBER, useStore } from "@/lib/store";
import { downloadBizPaymentConfirmation, downloadInvoice } from "@/lib/export/documents";
import type { BizPayment } from "@/lib/types";
import {
  arrivalText,
  checkIban,
  eligibleApprovers,
  feeFor,
  freePaymentsUsed,
  paymentTimeline,
  rangeLabel,
  ruleFor,
  statusMeta,
} from "./payments-shared";

export function BeneficiaryMark({ name, size = "md" }: { name: string; size?: "sm" | "md" | "lg" }) {
  const s = merchantStyle(name);
  return (
    <span
      className={cn(
        "flex shrink-0 items-center justify-center font-semibold tracking-tight shadow-[inset_0_0_0_1px_rgb(0_0_0/0.06)]",
        size === "sm" && "size-8 rounded-md text-[11px]",
        size === "md" && "size-10 rounded-lg text-[12px]",
        size === "lg" && "size-14 rounded-2xl text-[17px]",
      )}
      style={{ background: s.bg, color: s.fg }}
    >
      {s.mark}
    </span>
  );
}

/** Detail sheet: everything about one payment, with its full status history. */
export function PaymentDrawer({
  payment,
  onClose,
  onApprove,
  onReject,
}: {
  payment: BizPayment | null;
  onClose: () => void;
  onApprove: (p: BizPayment) => void;
  onReject: (p: BizPayment) => void;
}) {
  const { state } = useStore();
  const toast = useToast();
  const { members, rules } = state.business;
  const p = payment ? (state.business.payments.find((x) => x.id === payment.id) ?? payment) : null;
  const rule = p ? (rules.find((r) => r.id === p.ruleId) ?? ruleFor(p.amount, rules)) : null;
  const creator = p ? members.find((m) => m.id === p.createdBy) : undefined;
  const mine = p?.createdBy === CURRENT_MEMBER;
  const approvedByMe = !!p?.approvals.some((a) => a.memberId === CURRENT_MEMBER);
  const canAct = p?.status === "awaiting" && !mine && !approvedByMe;

  return (
    <Drawer
      open={!!p}
      onClose={onClose}
      title="Payment details"
      description={p ? <span className="font-mono">{p.id}</span> : undefined}
      footer={
        p &&
        (canAct ? (
          <>
            <Button variant="secondary" onClick={() => onReject(p)}>
              Reject
            </Button>
            <Button variant="primary" leading={<ShieldCheck className="size-4" />} onClick={() => onApprove(p)}>
              Approve with Smart-ID
            </Button>
          </>
        ) : p.status === "sent" ? (
          <Button
            variant="secondary"
            leading={<Download className="size-4" />}
            onClick={async () => {
              const file = await downloadBizPaymentConfirmation(p, (id) => state.business.members.find((m) => m.id === id)?.name ?? id);
              toast({ title: "Confirmation downloaded", description: file });
            }}
          >
            Download confirmation
          </Button>
        ) : (
          <Button variant="secondary" onClick={onClose}>
            Close
          </Button>
        ))
      }
    >
      {p && rule && (
        <div className="flex flex-col">
          <div className="flex flex-col items-center border-b border-line px-6 pt-6 pb-5 text-center">
            <BeneficiaryMark name={p.beneficiary} size="lg" />
            <p className="mt-3 text-sm font-medium text-ink-2">{p.beneficiary}</p>
            <Money value={p.amount} className="mt-1 text-[34px] leading-10 font-semibold tracking-[-0.03em]" />
            <div className="mt-2 flex items-center gap-2">
              <StatusDot status={statusMeta[p.status].dot} label={statusMeta[p.status].label} pulse={p.status === "awaiting"} />
              <span className="text-ink-4">·</span>
              <Badge tone="gray" icon={p.scheme === "SEPA Instant" ? <Zap className="size-3" /> : undefined}>
                {p.scheme}
              </Badge>
            </div>
          </div>

          {mine && p.status === "awaiting" && (
            <div className="px-6 pt-5">
              <Note tone="gray" title="You created this payment">
                Someone else must approve it. Nobody can approve their own payment — this rule is always on.
              </Note>
            </div>
          )}
          {approvedByMe && p.status === "awaiting" && (
            <div className="px-6 pt-5">
              <Note tone="success" title="You approved this payment">
                It needs {p.required - p.approvals.length} more approval before it&apos;s scheduled.
              </Note>
            </div>
          )}

          <section className="border-b border-line px-6 py-5">
            <p className="mb-3 text-[13px] font-medium text-ink-2">Status</p>
            <Timeline steps={paymentTimeline(p, members, rules)} />
          </section>

          <section className="border-b border-line px-6 py-3">
            <dl className="divide-y divide-line">
              <KeyValue label="To IBAN" mono>
                {p.iban.startsWith("Bulk") ? p.iban : fmtIban(p.iban)}
              </KeyValue>
              <KeyValue label="Reference">{p.reference}</KeyValue>
              <KeyValue label="Created by">
                <span className="inline-flex items-center gap-1.5">
                  {creator && <Avatar name={creator.name} size="xs" />}
                  {creator?.name ?? "—"}
                </span>
              </KeyValue>
              <KeyValue label="Execution date">{fmtDateTime(p.executeAt)}</KeyValue>
              <KeyValue label="Approval rule">
                {rule.name} · {rule.approvers} approval{rule.approvers > 1 ? "s" : ""}
              </KeyValue>
              <KeyValue label="Fee">
                {p.fee > 0 ? money(p.fee) : <span className="text-success">€0.00 · within 1,000 free</span>}
              </KeyValue>
              {p.attachment && (
                <KeyValue label="Invoice">
                  <button
                    onClick={async () => {
                      const file = await downloadInvoice(p);
                      toast({ title: "Invoice downloaded", description: file });
                    }}
                    className="inline-flex items-center gap-1 text-teal hover:underline"
                  >
                    <Paperclip className="size-3.5" />
                    {p.attachment}
                  </button>
                </KeyValue>
              )}
              {p.bulk && <KeyValue label="Recipients">{p.bulk} people · salary file</KeyValue>}
            </dl>
          </section>
          {p.status === "failed" && (
            <div className="px-6 py-5">
              <Note tone="danger" title="What happened to the money">
                {p.failure}
              </Note>
            </div>
          )}
        </div>
      )}
    </Drawer>
  );
}

const REASONS = ["Wrong amount", "Duplicate payment", "Invoice missing", "Not agreed with supplier"];

export function RejectModal({
  payment,
  onClose,
  onConfirm,
}: {
  payment: BizPayment | null;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}) {
  return (
    <Modal open={!!payment} onClose={onClose} size="sm" title="Reject payment" description={payment ? `${payment.beneficiary} · ${money(payment.amount)}` : undefined}>
      {payment && <RejectBody payment={payment} onClose={onClose} onConfirm={onConfirm} />}
    </Modal>
  );
}

function RejectBody({ payment, onClose, onConfirm }: { payment: BizPayment; onClose: () => void; onConfirm: (reason: string) => void }) {
  const { state } = useStore();
  const [reason, setReason] = useState("");
  const creator = state.business.members.find((m) => m.id === payment.createdBy);
  return (
    <div className="flex flex-col gap-4 pb-1">
      <p className="text-[13px] text-ink-3">
        {creator?.name ?? "The creator"} will see your reason. Nothing is sent and the payment can be recreated.
      </p>
      <div className="flex flex-wrap gap-1.5">
        {REASONS.map((r) => (
          <button
            key={r}
            onClick={() => setReason(r)}
            className={cn(
              "h-7 rounded-full px-3 text-[12px] transition-colors",
              reason === r ? "bg-brown text-white" : "bg-subtle text-ink-2 hover:bg-muted",
            )}
          >
            {r}
          </button>
        ))}
      </div>
      <Textarea value={reason} onChange={(e) => setReason(e.target.value)} placeholder="e.g. Amount should be €2,250 — see contract" autoFocus />
      <div className="flex justify-end gap-2">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="danger" disabled={reason.trim().length < 3} onClick={() => onConfirm(reason.trim())}>
          Reject payment
        </Button>
      </div>
    </div>
  );
}

/** New payment sheet with a live preview of the approval rule and fees. */
export function NewPaymentDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  return (
    <Drawer open={open} onClose={onClose} title="New payment" description="From Main account · EE40 2200 2210 7788 5511">
      {open && <NewPaymentForm onDone={onClose} />}
    </Drawer>
  );
}

function NewPaymentForm({ onDone }: { onDone: () => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { members, rules, payments } = state.business;
  const [name, setName] = useState("");
  const [ibanRaw, setIbanRaw] = useState("");
  const [amountRaw, setAmountRaw] = useState("");
  const [reference, setReference] = useState("");
  const [when, setWhen] = useState<"approved" | "date">("approved");
  const [date, setDate] = useState("2026-10-30");
  const [attachment, setAttachment] = useState<string | null>(null);

  const saved = Array.from(
    new Map(payments.filter((p) => p.iban.startsWith("EE")).map((p) => [p.iban, { name: p.beneficiary, iban: p.iban }])).values(),
  ).slice(0, 5);

  const check = checkIban(ibanRaw);
  const amount = Number(amountRaw.replace(",", ".")) || 0;
  const known = payments.some((p) => p.iban.replace(/\s/g, "") === ibanRaw.replace(/\s/g, "").toUpperCase());
  const newBeneficiary = check.state === "valid" && !known;
  let scheme = check.state === "valid" ? check.scheme : "SEPA Instant";
  const overInstant = scheme === "SEPA Instant" && amount > companyLimits.instantPerPayment;
  if (overInstant) scheme = "SEPA";
  const rule = ruleFor(amount, rules);
  const draft = { ruleId: rule.id, createdBy: CURRENT_MEMBER, approvals: [], amount, newBeneficiary };
  const approvers = eligibleApprovers(draft, rules, members);
  const fee = feeFor(scheme);
  const free = freePaymentsUsed(1);
  const executeAt = when === "approved" ? NOW.toISOString() : `${date}T09:00:00+02:00`;
  const balance = state.business.accounts.find((a) => a.id === "b-main")?.balance ?? 0;
  const overBalance = amount + fee > balance;
  const valid = name.trim().length > 1 && check.state === "valid" && amount > 0 && reference.trim().length > 0 && !overBalance;

  const submit = () => {
    dispatch({
      type: "biz/createPayment",
      payment: {
        beneficiary: name.trim(),
        iban: ibanRaw.replace(/\s+/g, "").toUpperCase(),
        amount,
        reference: reference.trim(),
        scheme,
        executeAt,
        ruleId: rule.id,
        required: rule.approvers,
        fee,
        attachment: attachment ?? undefined,
        newBeneficiary,
      },
    });
    toast({
      title: "Payment created",
      description: approvers.length ? `Waiting for ${approvers.map((m) => m.name).join(" or ")} to approve` : "Waiting for approval",
    });
    onDone();
  };

  return (
    <div className="flex min-h-full flex-col">
      <div className="flex flex-1 flex-col gap-5 px-5 py-5">
        {saved.length > 0 && (
          <div>
            <p className="mb-2 text-[12px] font-medium text-ink-3">Recent beneficiaries</p>
            <div className="scrollbar-none -mx-1 flex gap-1.5 overflow-x-auto px-1">
              {saved.map((s) => (
                <button
                  key={s.iban}
                  onClick={() => {
                    setName(s.name);
                    setIbanRaw(fmtIban(s.iban));
                  }}
                  className="flex shrink-0 items-center gap-2 rounded-full bg-subtle py-1 pr-3 pl-1 text-[12px] text-ink-2 transition-colors hover:bg-muted"
                >
                  <BeneficiaryMark name={s.name} size="sm" />
                  <span className="max-w-36 truncate">{s.name}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        <Input label="Beneficiary" placeholder="e.g. Telliskivi Loomelinnak OÜ" value={name} onChange={(e) => setName(e.target.value)} />
        <Input
          label="IBAN"
          mono
          placeholder="EE38 2200 2210 2014 5685"
          value={ibanRaw}
          onChange={(e) => setIbanRaw(e.target.value.toUpperCase())}
          error={check.state === "invalid" ? check.message : undefined}
          hint={
            check.state === "valid" ? (
              <span className="inline-flex items-center gap-1 text-success">
                <Check className="size-3" strokeWidth={3} />
                {check.bank} · {check.scheme === "SWIFT" ? "International (SWIFT)" : check.scheme}
                {newBeneficiary && <span className="text-warning"> · New beneficiary</span>}
              </span>
            ) : undefined
          }
          suffix={check.state === "valid" ? <Check className="size-4 text-success" /> : undefined}
        />
        <Input
          label="Amount"
          size="lg"
          inputMode="decimal"
          placeholder="0.00"
          prefix={<span className="text-[15px]">€</span>}
          className="tabular"
          value={amountRaw}
          onChange={(e) => setAmountRaw(e.target.value.replace(/[^\d.,]/g, ""))}
          error={overBalance ? `Main account has ${money(balance)} available` : undefined}
          hint={`Available ${money(balance)}`}
        />
        <Input label="Description" placeholder="e.g. Invoice 2026-311, office rent November" value={reference} onChange={(e) => setReference(e.target.value)} />

        <div className="flex flex-col gap-2">
          <p className="text-[13px] font-medium text-ink-2">When</p>
          <Segmented
            value={when}
            onChange={setWhen}
            size="sm"
            items={[
              { value: "approved", label: "As soon as approved" },
              { value: "date", label: "On a date" },
            ]}
          />
          {when === "date" && <Input type="date" value={date} min="2026-10-29" onChange={(e) => setDate(e.target.value)} wrapperClassName="mt-1 max-w-52" />}
        </div>

        <button
          onClick={() => setAttachment(attachment ? null : "invoice-scan.pdf")}
          className="flex items-center gap-2 self-start rounded-md px-1 text-[13px] font-medium text-teal hover:underline"
        >
          <Paperclip className="size-3.5" />
          {attachment ? `${attachment} attached · remove` : "Attach invoice (PDF)"}
        </button>

        {/* Live preview: rule + fees */}
        <div className="flex flex-col gap-3 border-t border-line pt-5">
          <div className="rounded-lg bg-surface p-3.5 shadow-[0_0_0_1px_var(--color-line)]">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-[12px] text-ink-3">Approval needed</p>
                <p className="mt-0.5 text-sm font-medium text-ink">
                  {rule.approvers} approval{rule.approvers > 1 ? "s" : ""} · {newBeneficiary && rule.id === "r-1" ? "Management board member" : rule.who}
                </p>
                <p className="mt-0.5 text-[12px] text-ink-3">
                  Rule “{rule.name}” · {rangeLabel(rule)}
                </p>
              </div>
              <div className="flex -space-x-1.5">
                {approvers.map((m) => (
                  <Avatar key={m.id} name={m.name} size="sm" className="ring-2 ring-surface" />
                ))}
              </div>
            </div>
            <p className="mt-2.5 border-t border-line pt-2.5 text-[12px] text-ink-3">
              You&apos;re creating this payment, so you can&apos;t approve it yourself.
              {approvers.length > 0 && ` ${approvers.map((m) => m.name).join(" or ")} will get a notification.`}
              {newBeneficiary && rule.id === "r-1" && " First payments to a new beneficiary always need a board member."}
            </p>
          </div>

          {overInstant && (
            <Note tone="info">
              Above the €{companyLimits.instantPerPayment.toLocaleString("en-IE")} instant limit per payment, so it goes as a regular SEPA payment and arrives by the next business day.
            </Note>
          )}

          <FeeBreakdown
            rows={[
              { label: "Amount", value: money(amount) },
              fee > 0
                ? { label: "International payment fee", value: money(fee), hint: "SWIFT, shared costs (SHA)" }
                : {
                    label: "Fee",
                    value: `€0.00 · ${free.used} of ${free.included.toLocaleString("en-IE")} free`,
                    tone: "success",
                    hint: "The first 1,000 euro payments each month are free. Then €0.38 each (€0.16 to Swedbank).",
                  },
              ...(scheme === "SWIFT" ? [{ label: "Intermediary banks", value: "May deduct their fees", tone: "muted" as const }] : []),
            ]}
            total={{ label: "Total debited", value: money(amount + fee) }}
            arrival={arrivalText(scheme, when === "date" ? executeAt : undefined)}
          />
        </div>
      </div>

      <div className="sticky bottom-0 flex items-center justify-between gap-3 border-t border-line bg-canvas px-5 py-3">
        <p className="text-[12px] text-ink-3">{when === "date" ? `Scheduled for ${fmtDate(executeAt, "long")}` : "Nothing is sent until it's approved"}</p>
        <Button variant="primary" disabled={!valid} onClick={submit}>
          Submit for approval
        </Button>
      </div>
    </div>
  );
}
