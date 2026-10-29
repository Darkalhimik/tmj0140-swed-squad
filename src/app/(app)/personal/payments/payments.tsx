"use client";

import { CalendarClock, Repeat, Zap } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { Suspense, useCallback, useEffect, useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Money } from "@/components/ui/misc";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { payees as seedPayees, upcoming, type Upcoming } from "@/lib/data/personal";
import { cleanIban } from "@/components/personal/iban";
import { fmtDate, money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { CardPayFlow } from "@/components/personal/card-pay";
import { Segmented } from "@/components/ui/tabs";
import { PayFlow, type Draft, type Payee } from "./pay-flow";

type Item = Upcoming & { mine?: boolean };

/** Reads `?new=1` (from ⌘K or the overview "Pay" action) and resets the form; `&to=card` opens "Send to a card". */
function NewPaymentParam({ onNew }: { onNew: (method: Method) => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const isNew = params.get("new") === "1";
  const method: Method = params.get("to") === "card" ? "card" : "iban";
  useEffect(() => {
    if (!isNew) return;
    onNew(method);
    router.replace("/personal/payments", { scroll: false });
  }, [isNew, method, onNew, router]);
  return null;
}

type Method = "iban" | "card";

export function Payments() {
  const [formKey, setFormKey] = useState(0);
  const [focus, setFocus] = useState(false);
  const [payees, setPayees] = useState<Payee[]>(seedPayees);
  const [scheduled, setScheduled] = useState<Item[]>([]);
  const [method, setMethod] = useState<Method>("iban");

  const onNew = useCallback((m: Method) => {
    setMethod(m);
    setFormKey((k) => k + 1);
    setFocus(true);
  }, []);

  const onSchedule = useCallback((d: Draft & { value: number }) => {
    setScheduled((list) => [
      ...list,
      { id: `sch-${list.length + 1}`, at: d.date, counterparty: d.name.trim(), amount: -d.value, kind: "Standing order", auto: true, mine: true },
    ]);
  }, []);

  const onSavePayee = useCallback((p: Payee) => {
    setPayees((list) => (list.some((x) => cleanIban(x.iban) === cleanIban(p.iban)) ? list : [...list, p]));
  }, []);

  return (
    <PageContainer>
      <Suspense fallback={null}>
        <NewPaymentParam onNew={onNew} />
      </Suspense>
      <PageHeader
        title="Payments"
        description="To an IBAN or a card number. Fee and arrival shown before you sign."
      />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <div className="flex min-w-0 flex-col gap-3">
          <Segmented<Method>
            className="self-start"
            value={method}
            onChange={setMethod}
            items={[
              { value: "iban", label: "To an IBAN" },
              {
                value: "card",
                label: (
                  <span className="flex items-center gap-1.5">
                    To a card
                    <span className="rounded-full bg-brand px-1.5 text-[10px] leading-4 font-semibold text-white">New</span>
                  </span>
                ),
              },
            ]}
          />
          {method === "iban" ? (
            <PayFlow key={formKey} autoFocus={focus} payees={payees} onSavePayee={onSavePayee} onSchedule={onSchedule} />
          ) : (
            <CardPayFlow key={formKey} autoFocus={focus} />
          )}
        </div>
        <ComingUp scheduled={scheduled} onCancel={(id) => setScheduled((l) => l.filter((x) => x.id !== id))} />
      </div>
    </PageContainer>
  );
}

function autoCap(amount: number) {
  return Math.ceil((Math.abs(amount) * 2) / 10) * 10;
}

function ComingUp({ scheduled, onCancel }: { scheduled: Item[]; onCancel: (id: string) => void }) {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const [auto, setAuto] = useState<Record<string, boolean>>(() => Object.fromEntries(upcoming.map((u) => [u.id, u.auto])));
  const [paid, setPaid] = useState<string[]>([]);
  const [paying, setPaying] = useState<Item | null>(null);

  const items: Item[] = [...upcoming.filter((u) => !paid.includes(u.id)), ...scheduled].sort((a, b) => a.at.localeCompare(b.at));
  const total = items.reduce((s, u) => s + u.amount, 0);
  const main = state.personal.accounts.find((a) => a.id === "p-main")!;

  const txns = state.personal.txns;
  // Forecast from what you can actually spend: booked balance minus card payments still reserved.
  const reserved = txns.filter((t) => t.accountId === "p-main" && t.status === "pending").reduce((s, t) => s + t.amount, 0);
  const available = Math.round((main.balance + reserved) * 100) / 100;
  const after = Math.round((available + total) * 100) / 100;

  const confirmPay = useCallback(() => {
    if (!paying) return;
    dispatch({
      type: "personal/pay",
      to: paying.counterparty,
      iban: txns.find((t) => t.counterparty === paying.counterparty && t.iban)?.iban ?? "",
      amount: Math.abs(paying.amount),
      reference: `E-invoice · due ${fmtDate(paying.at)}`,
      instant: true,
    });
    setPaid((p) => [...p, paying.id]);
    toast({ title: "E-invoice paid", description: `${money(Math.abs(paying.amount))} to ${paying.counterparty}` });
    setPaying(null);
  }, [paying, txns, dispatch, toast]);

  return (
    <Card>
      <CardHeader
        title="Coming up"
        description="Next 30 days from Everyday account"
        action={<Money value={total} className="text-[13px] font-medium text-ink-2" />}
      />
      <dl className="mx-5 mb-2 flex flex-col gap-1 rounded-md bg-subtle px-3 py-2.5 text-[12px] text-ink-3">
        <div className="flex justify-between gap-3">
          <dt>Balance</dt>
          <dd>
            <Money value={main.balance} />
          </dd>
        </div>
        {reserved !== 0 && (
          <div className="flex justify-between gap-3">
            <dt>Reserved for pending card payments</dt>
            <dd>
              <Money value={reserved} />
            </dd>
          </div>
        )}
        <div className="flex justify-between gap-3">
          <dt>Coming up in 30 days</dt>
          <dd>
            <Money value={total} />
          </dd>
        </div>
        <div className="mt-0.5 flex justify-between gap-3 border-t border-line-strong/60 pt-1.5 text-ink-2">
          <dt className="font-medium">Left after these</dt>
          <dd>
            <Money value={after} className="font-semibold" />
          </dd>
        </div>
      </dl>
      <ul className="divide-y divide-line px-5 pb-2">
        {items.map((u) => {
          const isAuto = u.mine ? true : auto[u.id];
          const day = fmtDate(u.at);
          const sentence =
            u.mine
              ? `Scheduled by you · leaves your account ${day}, 09:00`
              : u.kind === "E-invoice"
                ? isAuto
                  ? `Paid automatically on ${day} · up to ${money(autoCap(u.amount))}`
                  : `Due ${day} · not on automatic payment`
                : u.kind === "Standing order"
                  ? `Every month on the 1st · next ${day}`
                  : u.kind === "Auto-save"
                    ? `Moves to Funds on ${day}`
                    : `Charged to Subscriptions ••1964 on ${day}`;
          return (
            <li key={u.id} className="flex flex-col gap-2 py-3">
              <div className="flex items-start gap-3">
                <span className="flex w-9 shrink-0 flex-col items-center rounded-md bg-subtle py-1 leading-none">
                  <span className="text-[10px] text-ink-3">{day.split(" ")[1]}</span>
                  <span className="tabular text-[15px] font-semibold">{day.split(" ")[0]}</span>
                </span>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-[13px] font-medium" title={u.counterparty}>
                    {u.counterparty.replace("Landlord — ", "")}
                  </p>
                  <p className="text-[12px] leading-4 text-ink-3">{sentence}</p>
                </div>
                <Money value={u.amount} className="text-[13px] font-medium" />
              </div>
              <div className="flex items-center justify-between gap-2 pl-12">
                <span className="flex items-center gap-1.5">
                  {u.kind === "E-invoice" && !u.mine ? (
                    <Badge size="xs" tone={isAuto ? "gray" : "warning"} icon={isAuto ? <Zap className="size-2.5" /> : undefined}>
                      {isAuto ? "Automatic" : "Needs you"}
                    </Badge>
                  ) : u.mine ? (
                    <Badge size="xs" tone="info" icon={<CalendarClock className="size-2.5" />}>
                      Scheduled
                    </Badge>
                  ) : (
                    <Badge size="xs" tone="gray" icon={<Repeat className="size-2.5" />}>
                      {u.kind}
                    </Badge>
                  )}
                </span>
                {u.kind === "E-invoice" && !u.mine && (
                  <span className="flex items-center gap-2">
                    {!isAuto && (
                      <Button size="xs" variant="primary" onClick={() => setPaying(u)}>
                        Pay now
                      </Button>
                    )}
                    <Switch
                      size="sm"
                      checked={!!isAuto}
                      label={`Automatic payment for ${u.counterparty}`}
                      onChange={(v) => {
                        setAuto((a) => ({ ...a, [u.id]: v }));
                        toast({
                          title: v ? "Automatic payment on" : "Automatic payment off",
                          description: v
                            ? `${u.counterparty} invoices up to ${money(autoCap(u.amount))} are paid on the due date`
                            : `You'll get a reminder 3 days before ${day}`,
                        });
                      }}
                    />
                  </span>
                )}
                {u.kind === "Standing order" && !u.mine && (
                  <Button size="xs" variant="tertiary" onClick={() => toast({ title: "Payment skipped", description: `${u.counterparty.replace("Landlord — ", "")} · next one on 1 Dec` })}>
                    Skip next
                  </Button>
                )}
                {u.mine && (
                  <Button
                    size="xs"
                    variant="tertiary"
                    onClick={() => {
                      onCancel(u.id);
                      toast({ title: "Payment cancelled", description: `${money(Math.abs(u.amount))} to ${u.counterparty} won't be sent` });
                    }}
                  >
                    Cancel
                  </Button>
                )}
              </div>
            </li>
          );
        })}
      </ul>
      <SmartIdModal
        open={!!paying}
        onClose={() => setPaying(null)}
        onConfirmed={confirmPay}
        action={paying ? `E-invoice payment of ${money(Math.abs(paying.amount))} to ${paying.counterparty}` : ""}
        details={
          paying
            ? [
                { label: "Due date", value: fmtDate(paying.at, "long") },
                { label: "Amount", value: money(Math.abs(paying.amount)) },
                { label: "Fee", value: "€0.00" },
                { label: "From", value: "Everyday account" },
              ]
            : []
        }
      />
    </Card>
  );
}
