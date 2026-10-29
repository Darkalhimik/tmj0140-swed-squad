"use client";

import { ArrowDown, ArrowLeftRight, Banknote, Building, Check, Copy, Share2 } from "lucide-react";
import { useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { KeyValue, Money, Note } from "@/components/ui/misc";
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
        leading={copied ? <Check className="size-4 text-success" /> : <Copy className="size-4" />}
        aria-label={`Copy ${label}`}
        onClick={() => {
          void navigator.clipboard?.writeText(value.replaceAll(" ", ""));
          setCopied(true);
          window.setTimeout(() => setCopied(false), 1400);
        }}
      >
        {copied ? "Copied" : "Copy"}
      </Button>
    </div>
  );
}

const KIND_LABEL: Record<Account["kind"], string> = {
  current: "Current account",
  savings: "Savings account",
  funds: "Fund account",
  pension: "Pension II pillar",
  tax: "Tax reserve account",
};

/** Everything about one account: identifiers, type and terms. */
export function AccountDetailsModal({
  account,
  holder,
  open,
  onClose,
  extra = [],
}: {
  account: Account;
  holder: string;
  open: boolean;
  onClose: () => void;
  extra?: [string, ReactNode][];
}) {
  const toast = useToast();
  return (
    <Modal
      open={open}
      onClose={onClose}
      title={account.name}
      description={KIND_LABEL[account.kind]}
      footer={
        <>
          <Button
            variant="secondary"
            leading={<Share2 className="size-4" />}
            onClick={() => {
              void navigator.clipboard?.writeText(`${holder}\n${fmtIban(account.iban)}\nHABAEE2X`);
              toast({ title: "Details copied", description: "Holder, IBAN and BIC" });
            }}
          >
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
      </div>
      <dl className="mt-2 divide-y divide-line border-t border-line">
        <KeyValue label="Balance">
          <Money value={account.balance} />
        </KeyValue>
        {account.returnPct !== undefined && <KeyValue label="Return this year">{account.returnPct}%</KeyValue>}
        {extra.map(([k, v]) => (
          <KeyValue key={k} label={k}>
            {v}
          </KeyValue>
        ))}
        <KeyValue label="Bank">Swedbank AS, Tallinn</KeyValue>
      </dl>
    </Modal>
  );
}

/** Ways to put money on the account — distinct from the account details. */
export function AddMoneyModal({
  account,
  holder,
  open,
  onClose,
  onMove,
}: {
  account: Account;
  holder: string;
  open: boolean;
  onClose: () => void;
  onMove: () => void;
}) {
  const [copied, setCopied] = useState(false);
  return (
    <Modal open={open} onClose={onClose} title={`Add money to ${account.name}`} size="md">
      <ul className="flex flex-col gap-2">
        <Option icon={<Building className="size-4" />} title="From another bank" body="Free · SEPA Instant arrives in seconds">
          <div className="mt-2 flex items-center justify-between gap-3 rounded-md bg-subtle px-3 py-2">
            <span className="min-w-0">
              <span className="block text-[12px] text-ink-3">{holder}</span>
              <span className="block truncate font-mono text-[13px] tracking-tight text-ink">{fmtIban(account.iban)}</span>
            </span>
            <Button
              size="sm"
              variant="secondary"
              leading={copied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}
              onClick={() => {
                void navigator.clipboard?.writeText(account.iban);
                setCopied(true);
                window.setTimeout(() => setCopied(false), 1400);
              }}
            >
              {copied ? "Copied" : "Copy IBAN"}
            </Button>
          </div>
        </Option>
        <Option
          icon={<ArrowLeftRight className="size-4" />}
          title="From your other accounts"
          body="Instant and free"
          action={
            <Button size="sm" variant="secondary" onClick={onMove}>
              Move money
            </Button>
          }
        />
        <Option icon={<Banknote className="size-4" />} title="Cash at a Swedbank ATM" body="Free up to €5,000 a month · use your Debit card" />
      </ul>
    </Modal>
  );
}

function Option({ icon, title, body, action, children }: { icon: ReactNode; title: string; body: string; action?: ReactNode; children?: ReactNode }) {
  return (
    <li className="rounded-lg px-3.5 py-3 shadow-[inset_0_0_0_1px_var(--color-line)]">
      <div className="flex items-center gap-3">
        <span className="flex size-8 shrink-0 items-center justify-center rounded-full bg-cream text-brown">{icon}</span>
        <span className="min-w-0 flex-1">
          <span className="block text-sm font-medium text-ink">{title}</span>
          <span className="block text-[12px] text-ink-3">{body}</span>
        </span>
        {action}
      </div>
      {children}
    </li>
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
  // Pension money can't be topped up here; funds can receive money (it buys fund units).
  const sources = accounts.filter((a) => a.kind === "current" || a.kind === "savings" || a.kind === "tax");
  const targets = accounts.filter((a) => a.kind !== "pension");
  const [from, setFrom] = useState(fromId);
  const [toChoice, setTo] = useState<string | null>(null);
  const [amount, setAmount] = useState("");
  const toOptions = targets.filter((a) => a.id !== from);
  const to = toOptions.some((a) => a.id === toChoice) ? toChoice! : (toOptions[0]?.id ?? "");
  const src = accounts.find((a) => a.id === from);
  const dst = accounts.find((a) => a.id === to);
  const value = Number(amount.replace(",", ".")) || 0;
  const over = !!src && value > src.balance;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Move money"
      description="Between your own accounts. Free."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button
            variant="primary"
            disabled={!value || over || !to || from === to}
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
        <AccountPicker label="From" accounts={sources} value={from} onChange={setFrom} />
        <div className="-my-1 flex justify-center">
          <span className="z-10 flex size-7 items-center justify-center rounded-full bg-surface text-ink-3 shadow-card">
            <ArrowDown className="size-3.5" />
          </span>
        </div>
        <AccountPicker label="To" accounts={toOptions} value={to} onChange={setTo} />
        <Input
          className="tabular text-lg"
          size="lg"
          inputMode="decimal"
          placeholder="0.00"
          aria-label="Amount"
          prefix={<span className="text-lg">€</span>}
          value={amount}
          onChange={(e) => setAmount(e.target.value.replace(/[^\d.,]/g, ""))}
          error={over ? `You have ${money(src!.balance)} on ${src!.name}` : undefined}
          wrapperClassName="mt-3"
          autoFocus
        />
        {dst?.kind === "funds" && (
          <Note tone="gray">Money moved to Funds buys fund units at the next price, usually the next business day.</Note>
        )}
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
    <div role="radiogroup" aria-label={label} className="rounded-lg p-1 shadow-[0_0_0_1px_var(--color-line-strong)]">
      <p className="px-2.5 pt-1.5 text-[12px] font-medium text-ink-3">{label}</p>
      <div className="flex flex-col">
        {accounts.map((a) => {
          const active = a.id === value;
          return (
            <button
              key={a.id}
              type="button"
              role="radio"
              aria-checked={active}
              onClick={() => onChange(a.id)}
              className={cn(
                "flex items-center justify-between rounded-md px-2.5 py-2 text-left text-sm transition-colors",
                active ? "bg-subtle font-medium text-ink" : "text-ink-2 hover:bg-subtle/60",
              )}
            >
              <span className="flex items-center gap-2">
                <span
                  className={cn(
                    "flex size-4 items-center justify-center rounded-full",
                    active ? "bg-brown text-white" : "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]",
                  )}
                >
                  {active && <Check className="size-2.5" strokeWidth={3} />}
                </span>
                {a.name}
              </span>
              <Money value={a.balance} className="text-[13px] text-ink-3" />
            </button>
          );
        })}
      </div>
    </div>
  );
}
