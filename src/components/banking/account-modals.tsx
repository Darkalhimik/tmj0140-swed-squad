"use client";

import { ArrowDown, Check, Copy, Share2 } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Money, Note } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { iban as fmtIban, money } from "@/lib/format";
import type { Account } from "@/lib/types";

export function CopyRow({ label, value, mono = true }: { label: string; value: string; mono?: boolean }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <p className="text-[12px] text-ink-3">{label}</p>
        <p className={cn("truncate text-sm text-ink", mono && "font-mono tracking-tight")}>{value}</p>
      </div>
      <Button
        size="sm"
        variant="tertiary"
        icon
        aria-label={`Copy ${label}`}
        onClick={() => {
          void navigator.clipboard?.writeText(value.replaceAll(" ", ""));
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }}
      >
        {copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
      </Button>
    </div>
  );
}

export function AccountDetailsModal({
  account,
  holder,
  open,
  onClose,
}: {
  account: Account;
  holder: string;
  open: boolean;
  onClose: () => void;
}) {
  const toast = useToast();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Account details"
      description="Share these to get paid or to top up from another bank."
      footer={
        <>
          <Button variant="secondary" leading={<Share2 className="size-4" />} onClick={() => toast({ title: "Details copied", description: "Holder, IBAN and BIC are on your clipboard" })}>
            Copy all
          </Button>
          <Button variant="primary" onClick={onClose}>
            Done
          </Button>
        </>
      }
    >
      <div className="divide-y divide-line">
        <CopyRow label="Account holder" value={holder} mono={false} />
        <CopyRow label="IBAN" value={fmtIban(account.iban)} />
        <CopyRow label="BIC / SWIFT" value="HABAEE2X" />
        <CopyRow label="Bank" value="Swedbank AS, Liivalaia 34, 15040 Tallinn" mono={false} />
      </div>
      <Note tone="gray" className="mt-3">
        Euro payments from any SEPA bank arrive within seconds with SEPA Instant, free of charge.
      </Note>
    </Modal>
  );
}

export function MoveMoneyModal({
  accounts,
  fromId,
  open,
  onClose,
  onMove,
}: {
  accounts: Account[];
  fromId: string;
  open: boolean;
  onClose: () => void;
  onMove: (from: string, to: string, amount: number) => void;
}) {
  const movable = accounts.filter((a) => a.kind === "current" || a.kind === "savings" || a.kind === "tax");
  const [from, setFrom] = useState(fromId);
  const [to, setTo] = useState(movable.find((a) => a.id !== fromId)?.id ?? "");
  const [amount, setAmount] = useState("");
  const src = accounts.find((a) => a.id === from);
  const value = Number(amount.replace(",", ".")) || 0;
  const over = !!src && value > src.balance;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Move money"
      description="Between your own accounts. Instant and always free."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="brand"
            disabled={!value || over || from === to}
            onClick={() => {
              onMove(from, to, value);
              onClose();
              setAmount("");
            }}
          >
            {value ? `Move ${money(value)}` : "Move"}
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-2">
        <AccountPicker label="From" accounts={movable} value={from} onChange={setFrom} />
        <div className="-my-1 flex justify-center">
          <span className="z-10 flex size-7 items-center justify-center rounded-full bg-surface text-ink-3 shadow-card">
            <ArrowDown className="size-3.5" />
          </span>
        </div>
        <AccountPicker label="To" accounts={movable.filter((a) => a.id !== from)} value={to} onChange={setTo} />
        <Input
          className="tabular text-lg"
          size="lg"
          inputMode="decimal"
          placeholder="0.00"
          prefix={<span className="text-lg">€</span>}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
          error={over ? `You have ${money(src!.balance)} available` : undefined}
          wrapperClassName="mt-3"
          autoFocus
        />
      </div>
    </Modal>
  );
}

function AccountPicker({
  label,
  accounts,
  value,
  onChange,
}: {
  label: string;
  accounts: Account[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="rounded-lg p-1 shadow-[0_0_0_1px_var(--color-line-strong)]">
      <p className="px-2.5 pt-1.5 text-[12px] font-medium text-ink-3">{label}</p>
      <div className="flex flex-col">
        {accounts.map((a) => (
          <button
            key={a.id}
            onClick={() => onChange(a.id)}
            className={cn(
              "flex items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors",
              a.id === value ? "bg-subtle font-medium text-ink" : "text-ink-2 hover:bg-subtle/60",
            )}
          >
            <span className="flex items-center gap-2">
              <span className={cn("size-1.5 rounded-full", a.id === value ? "bg-brand" : "bg-transparent")} />
              {a.name}
            </span>
            <Money value={a.balance} className="text-[13px] text-ink-3" />
          </button>
        ))}
      </div>
    </div>
  );
}
