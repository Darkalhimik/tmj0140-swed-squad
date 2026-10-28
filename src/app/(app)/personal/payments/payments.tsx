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
import { PayFlow, type Draft, type Payee } from "./pay-flow";

type Item = Upcoming & { mine?: boolean };

/** Reads `?new=1` (from ⌘K or the overview "Pay" action) and resets the form. */
function NewPaymentParam({ onNew }: { onNew: () => void }) {
  const params = useSearchParams();
  const router = useRouter();
  const isNew = params.get("new") === "1";
  useEffect(() => {
    if (!isNew) return;
    onNew();
    router.replace("/personal/payments", { scroll: false });
  }, [isNew, onNew, router]);
  return null;
}

export function Payments() {
  const [formKey, setFormKey] = useState(0);
  const [focus, setFocus] = useState(false);
  const [payees, setPayees] = useState<Payee[]>(seedPayees);
  const [scheduled, setScheduled] = useState<Item[]>([]);

  const onNew = useCallback(() => {
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
      <PageHeader title="Payments" description="Send money in seconds. You see every fee and the arrival time before you confirm." />
      <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
        <PayFlow key={formKey} autoFocus={focus} payees={payees} onSavePayee={onSavePayee} onSchedule={onSchedule} />
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
      <p className="mx-5 mb-2 rounded-md bg-subtle px-3 py-2 text-[12px] text-ink-3">
        Balance after these: <Money value={main.balance + total} className="font-medium text-ink-2" />
      </p>
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
