"use client";

import { Check, KeyRound, Plug } from "lucide-react";
import { useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { FeeBreakdown } from "@/components/banking/transparency";
import { Button } from "@/components/ui/button";
import { Note } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { StatusDot } from "@/components/ui/status-dot";
import { useToast } from "@/components/ui/toast";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { SettingsSection } from "./settings-shared";

type Integration = {
  id: string;
  name: string;
  what: string;
  monthly: number;
  connected: boolean;
  reads: string[];
  scopes?: { id: string; label: string; detail: string; required?: boolean }[];
};

const INTEGRATIONS: Integration[] = [
  {
    id: "merit",
    name: "Merit Aktiva",
    what: "Accounting · transactions and receipts sync every hour",
    monthly: 0,
    connected: true,
    reads: ["Balances", "Transactions and receipts"],
  },
  {
    id: "directo",
    name: "Directo",
    what: "Accounting & ERP · bank statements and payment files",
    monthly: 0,
    connected: false,
    reads: ["Balances", "Statements (camt.053)", "Payment files you upload — still approved under your rules"],
  },
  { id: "smartaccounts", name: "SmartAccounts", what: "Accounting · daily statements", monthly: 0, connected: false, reads: ["Balances", "Daily statements"] },
  {
    id: "gateway",
    name: "Swedbank Gateway",
    what: "API and host-to-host access for your own systems",
    monthly: 25,
    connected: false,
    reads: [],
    scopes: [
      { id: "read", label: "Balances and statements", detail: "Intraday and end-of-day, camt.052/053", required: true },
      { id: "pay", label: "Send payment files", detail: "pain.001 · every payment still follows your approval rules" },
      { id: "notify", label: "Real-time notifications", detail: "Incoming payments pushed to your endpoint · €0.10 per alert" },
    ],
  },
];

// Billing starts today; the first month is charged for the days left in October.
const DAYS_LEFT = 3;
const DAYS_IN_MONTH = 31;

export function IntegrationsSection() {
  const { dispatch } = useStore();
  const toast = useToast();
  const [connected, setConnected] = useState<Record<string, boolean>>(Object.fromEntries(INTEGRATIONS.map((i) => [i.id, i.connected])));
  const [reviewing, setReviewing] = useState<Integration | null>(null);
  const [disconnecting, setDisconnecting] = useState<Integration | null>(null);

  const connect = (i: Integration, scopes: string[]) => {
    setConnected((c) => ({ ...c, [i.id]: true }));
    const prorated = Math.round(((i.monthly * DAYS_LEFT) / DAYS_IN_MONTH) * 100) / 100;
    dispatch({
      type: "biz/log",
      action: "integration.connected",
      target: i.name,
      detail: i.monthly ? `${money(i.monthly)}/month · scopes: ${scopes.join(", ")}` : `Read access: ${i.reads.join(", ")}`,
    });
    if (i.monthly) {
      dispatch({
        type: "biz/allowance",
        allowance: {
          key: i.id,
          label: `${i.name} (API)`,
          used: 1,
          included: 0,
          unit: "month",
          overage: i.monthly,
          monthly: prorated,
          overageText: `${money(i.monthly)} per month · ${money(prorated)} for ${DAYS_LEFT} days of October`,
        },
      });
    }
    toast({
      title: `${i.name} connected`,
      description: i.monthly ? `${money(prorated)} this month, then ${money(i.monthly)}/month · see Fees & usage` : "No cost · logged in Activity",
    });
  };

  return (
    <SettingsSection id="integrations" title="Integrations" description="Apps that can read your accounts. You review their access before connecting.">
      <ul className="divide-y divide-line">
        {INTEGRATIONS.map((i) => {
          const on = connected[i.id];
          return (
            <li key={i.id} className="flex flex-col gap-2 py-3 sm:flex-row sm:items-center sm:gap-4">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-3">
                  {i.monthly ? <KeyRound className="size-4" /> : <Plug className="size-4" />}
                </span>
                <div className="min-w-0">
                  <p className="flex items-center gap-2 text-sm font-medium text-ink">
                    {i.name}
                    {on && <StatusDot status="ready" label={i.id === "merit" ? "Synced 28 Oct, 16:05" : "Connected"} />}
                  </p>
                  <p className="text-[12px] text-ink-3">
                    {i.what} · <span className={i.monthly ? "font-medium text-ink-2" : ""}>{i.monthly ? `${money(i.monthly)}/month` : "Free"}</span>
                  </p>
                </div>
              </div>
              <Button
                size="sm"
                variant={on ? "tertiary" : "secondary"}
                className="self-end sm:self-auto"
                onClick={() => (on ? setDisconnecting(i) : setReviewing(i))}
              >
                {on ? "Disconnect" : i.monthly ? "Review and set up" : "Connect"}
              </Button>
            </li>
          );
        })}
      </ul>

      <ReviewModal
        integration={reviewing}
        onClose={() => setReviewing(null)}
        onConnect={(i, scopes) => {
          setReviewing(null);
          connect(i, scopes);
        }}
      />

      <Modal
        open={!!disconnecting}
        onClose={() => setDisconnecting(null)}
        size="sm"
        title={disconnecting ? `Disconnect ${disconnecting.name}?` : ""}
        footer={
          <>
            <Button variant="secondary" autoFocus onClick={() => setDisconnecting(null)}>
              Cancel
            </Button>
            <Button
              variant="danger"
              onClick={() => {
                const i = disconnecting!;
                setConnected((c) => ({ ...c, [i.id]: false }));
                dispatch({ type: "biz/log", action: "integration.disconnected", target: i.name });
                toast({ title: `${i.name} disconnected`, description: "It can no longer reach your accounts" });
                setDisconnecting(null);
              }}
            >
              Disconnect
            </Button>
          </>
        }
      >
        {disconnecting && (
          <p className="text-sm text-ink-2">
            {disconnecting.monthly
              ? "Systems using the API stop working immediately. You pay only for the days it was connected this month."
              : `${disconnecting.name} stops syncing immediately. Data it already has stays in ${disconnecting.name}.`}
          </p>
        )}
      </Modal>
    </SettingsSection>
  );
}

function ReviewModal({
  integration: i,
  onClose,
  onConnect,
}: {
  integration: Integration | null;
  onClose: () => void;
  onConnect: (i: Integration, scopes: string[]) => void;
}) {
  return (
    <Modal open={!!i} onClose={onClose} size="md" title={i ? `Connect ${i.name}` : ""} description={i?.what}>
      {i && <ReviewBody key={i.id} integration={i} onClose={onClose} onConnect={onConnect} />}
    </Modal>
  );
}

function ReviewBody({ integration: i, onClose, onConnect }: { integration: Integration; onClose: () => void; onConnect: (i: Integration, scopes: string[]) => void }) {
  const [scopes, setScopes] = useState<string[]>(i.scopes?.filter((s) => s.required).map((s) => s.id) ?? []);
  const [signing, setSigning] = useState(false);
  const paid = i.monthly > 0;
  const prorated = Math.round(((i.monthly * DAYS_LEFT) / DAYS_IN_MONTH) * 100) / 100;
  const scopeLabels = (i.scopes ?? []).filter((s) => scopes.includes(s.id)).map((s) => s.label);

  return (
    <div className="flex flex-col gap-5">
      {i.scopes ? (
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">What it can do</p>
          <ul className="flex flex-col gap-2">
            {i.scopes.map((s) => {
              const on = scopes.includes(s.id);
              return (
                <li key={s.id}>
                  <button
                    type="button"
                    disabled={s.required}
                    onClick={() => setScopes((list) => (on ? list.filter((x) => x !== s.id) : [...list, s.id]))}
                    className={cn(
                      "flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
                      on ? "bg-cream/70 shadow-[inset_0_0_0_1px_var(--color-brand-line)]" : "shadow-[inset_0_0_0_1px_var(--color-line)] hover:bg-subtle",
                    )}
                  >
                    <span
                      className={cn(
                        "mt-0.5 flex size-4 shrink-0 items-center justify-center rounded",
                        on ? "bg-brown text-white" : "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]",
                      )}
                    >
                      {on && <Check className="size-3" strokeWidth={3} />}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-ink">
                        {s.label}
                        {s.required && <span className="ml-1.5 text-[12px] font-normal text-ink-4">Always included</span>}
                      </span>
                      <span className="block text-[12px] text-ink-3">{s.detail}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>
      ) : (
        <div>
          <p className="mb-2 text-[13px] font-medium text-ink-2">{i.name} will be able to read</p>
          <ul className="flex flex-col gap-1.5 text-sm text-ink-2">
            {i.reads.map((r) => (
              <li key={r} className="flex items-center gap-2">
                <Check className="size-3.5 text-success" strokeWidth={3} />
                {r}
              </li>
            ))}
          </ul>
        </div>
      )}

      {paid && (
        <FeeBreakdown
          rows={[
            { label: "Monthly fee", value: `${money(i.monthly)} / month` },
            { label: `October (${DAYS_LEFT} days left)`, value: money(prorated), hint: `${money(i.monthly)} × ${DAYS_LEFT}/${DAYS_IN_MONTH} days. Charged on 5 Nov with your other fees.` },
            ...(scopes.includes("notify") ? [{ label: "Real-time notifications", value: "€0.10 per alert" }] : []),
          ]}
          total={{ label: "Due on 5 Nov", value: money(prorated) }}
          arrival="No minimum term · disconnect any time, you pay only for the days it was on"
        />
      )}
      {paid && (
        <Note tone="gray">
          Connecting through a certified operator (for example your accounting software) is free. Only direct API access costs {money(i.monthly)}/month.
          Next step after signing: create the API certificate for your server.
        </Note>
      )}

      <div className="-mx-6 -mb-4 flex justify-end gap-2 border-t border-line bg-canvas px-6 py-3">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" onClick={() => (paid ? setSigning(true) : onConnect(i, scopeLabels))}>
          {paid ? `Sign and connect · ${money(i.monthly)}/month` : `Connect ${i.name}`}
        </Button>
      </div>

      {paid && (
        <SmartIdModal
          open={signing}
          onClose={() => setSigning(false)}
          onConfirmed={() => {
            setSigning(false);
            onConnect(i, scopeLabels);
          }}
          action={`Add ${i.name} to your Digital Services Agreement`}
          details={[
            { label: "Price", value: `${money(i.monthly)}/month` },
            { label: "This month", value: money(prorated) },
            { label: "Access", value: scopeLabels.join(", ") },
          ]}
        />
      )}
    </div>
  );
}
