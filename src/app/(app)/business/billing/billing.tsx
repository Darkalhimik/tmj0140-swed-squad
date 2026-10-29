"use client";

import { Download, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AllowanceRow, allowanceCost, FeeBreakdown } from "@/components/banking/transparency";
import { FeeHistory } from "@/components/business/billing-history";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { StatusDot } from "@/components/ui/status-dot";
import { Switch } from "@/components/ui/switch";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { RESET_DATE, type Allowance } from "@/lib/data/pricing";
import { downloadFeeStatement } from "@/lib/export/documents";
import { fmtDate, iban, money, NOW } from "@/lib/format";
import { useStore } from "@/lib/store";

const DAY_OF_MONTH = 29;
const DAYS_IN_MONTH = 31;

const NONE: Allowance = { key: "none", label: "", used: 0, included: 0, unit: "", overage: 0 };

function feeLine(allowances: Allowance[], key: string) {
  const a = allowances.find((x) => x.key === key) ?? { ...NONE, key };
  return { a, cost: allowanceCost(a) };
}

type Tab = "usage" | "history" | "alerts";

export function Billing() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("usage");
  const { state } = useStore();
  const {
    profile: company,
    accounts: businessAccounts,
    allowances: businessAllowances,
    feeHistory: businessFeeHistory,
    invoices: businessInvoices,
  } = state.business;
  const total = businessAllowances.reduce((s, a) => s + allowanceCost(a), 0);
  const payments = feeLine(businessAllowances, "payments");
  const cards = feeLine(businessAllowances, "cards");
  const swift = feeLine(businessAllowances, "swift");
  const requests = feeLine(businessAllowances, "requests");
  const pace = Math.round((payments.a.used / DAY_OF_MONTH) * DAYS_IN_MONTH);
  const daysLeft = Math.ceil((new Date(RESET_DATE).getTime() - NOW.getTime()) / 86_400_000);
  const main = businessAccounts[0]!;

  return (
    <PageContainer>
      <PageHeader
        title="Fees & usage"
        description="No monthly account fee — you pay for what you use."
        actions={
          <Button
            variant="secondary"
            leading={<FileText className="size-4" />}
            onClick={async () => {
              const file = await downloadFeeStatement(businessInvoices[0]!, company, main.iban, payments.a.used);
              toast({ title: "Fee statement downloaded", description: file });
            }}
          >
            Fee statement
          </Button>
        }
      />

      <Card className="grid gap-6 p-6 md:grid-cols-[minmax(0,1fr)_minmax(0,1.3fr)]">
        <div>
          <p className="text-[13px] text-ink-3">October so far</p>
          <p className="font-display tabular mt-1 text-[34px] leading-10 font-semibold tracking-[-0.015em]">{money(total)}</p>
          <p className="mt-1 text-[13px] text-ink-3">
            Charged 5 Nov from {main.name} · <span className="font-mono tracking-tight">{iban(main.iban).slice(-9)}</span>
          </p>
          <p className="mt-4 text-[13px] text-ink-2">
            {payments.a.used.toLocaleString("en-IE")} of {(payments.a.included ?? 0).toLocaleString("en-IE")} free euro payments used. At this pace
            you&apos;ll send about {pace.toLocaleString("en-IE")} by 31 Oct{pace <= (payments.a.included ?? 0) ? " — no payment charges." : "."}
          </p>
        </div>
        <FeeBreakdown
          rows={[
            { label: "Monthly account fee", value: money(0), tone: "success" },
            {
              label: `Euro payments · ${payments.a.used} of ${(payments.a.included ?? 0).toLocaleString("en-IE")} free`,
              value: money(payments.cost),
              tone: "success",
            },
            {
              label: cards.cost === 0 && cards.a.used > 0 ? `Debit cards · ${cards.a.used} · free in year one` : `Debit cards · ${cards.a.used} × €2.00`,
              value: money(cards.cost),
            },
            ...(swift.a.used
              ? [
                  {
                    label: `International (SWIFT) · ${swift.a.used} × €6.00`,
                    value: money(swift.cost),
                    hint: "Shared costs (SHA): intermediary banks may also deduct a fee.",
                  },
                ]
              : []),
            ...(requests.a.used ? [{ label: `Money requests · ${requests.a.used} × €0.09`, value: money(requests.cost) }] : []),
          ]}
          total={{ label: "Estimated total", value: money(total) }}
          arrival={`Final on 1 Nov · ${daysLeft} days left in this period`}
        />
      </Card>

      <Tabs<Tab>
        className="mt-8 mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "usage", label: "Usage" },
          { value: "history", label: "History" },
          { value: "alerts", label: "Alerts" },
        ]}
      />

      {tab === "usage" && (
        <Card>
          <CardHeader title="Usage this period" description={`1–31 October · resets ${fmtDate(RESET_DATE)}`} />
          <div className="divide-y divide-line px-5">
            {businessAllowances.map((a) => (
              <AllowanceRow key={a.key} a={a} resetsAt={RESET_DATE} />
            ))}
          </div>
        </Card>
      )}

      {tab === "history" && (
        <div className="grid gap-5 lg:grid-cols-2">
          <Card className="p-5">
            <p className="text-[15px] font-semibold">Fees by month</p>
            <p className="mb-5 text-[13px] text-ink-3">{businessFeeHistory.length === 1 ? "Since the account opened" : `Last ${businessFeeHistory.length} months`}</p>
            <FeeHistory data={businessFeeHistory} />
          </Card>

          <Card>
            <CardHeader title="Fee statements" description="Charged on the 5th of the next month" />
            <ul className="divide-y divide-line border-t border-line">
              {businessInvoices.map((inv) => (
                <li key={inv.id} className="flex items-center gap-3 px-5 py-3">
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium text-ink">{inv.period}</p>
                    <p className="font-mono text-[11px] tracking-tight text-ink-4">{inv.id}</p>
                  </div>
                  <div className="hidden sm:block">
                    {inv.status === "upcoming" ? (
                      <StatusDot status="pending" label={`Due ${fmtDate(inv.date)}`} />
                    ) : (
                      <StatusDot status="ready" label={`Charged ${fmtDate(inv.date)}`} />
                    )}
                  </div>
                  <p className="tabular w-20 text-right text-sm font-medium">{money(inv.amount)}</p>
                  <Button
                    size="sm"
                    variant="tertiary"
                    icon
                    aria-label={`Download ${inv.period} fee statement`}
                    onClick={async () => {
                      const file = await downloadFeeStatement(inv, company, main.iban, payments.a.used);
                      toast({ title: "Fee statement downloaded", description: file });
                    }}
                  >
                    <Download className="size-4" />
                  </Button>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {tab === "alerts" && <AlertsCard />}
    </PageContainer>
  );
}

function AlertsCard() {
  const toast = useToast();
  const emailAddress = useStore().state.business.members.find((m) => m.id === "m-mari")?.email ?? "";
  const [levels, setLevels] = useState({ 50: false, 75: true, 100: true });
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);

  const save = (msg: string) => toast({ title: "Alert updated", description: msg });

  return (
    <Card>
      <CardHeader title="Usage alerts" description="Get told before a free allowance runs out, not after." />
      <div className="grid gap-6 border-t border-line px-5 py-4 md:grid-cols-2">
        <div>
          <p className="mb-1 text-[13px] font-medium text-ink-2">Free euro payments reach</p>
          <ul className="divide-y divide-line">
            {([50, 75, 100] as const).map((l) => (
              <li key={l} className="flex items-center justify-between py-2.5">
                <span className="tabular text-sm text-ink">
                  {l}% <span className="text-ink-3">· {l * 10} payments</span>
                </span>
                <Switch
                  size="sm"
                  checked={levels[l]}
                  label={`Alert at ${l}%`}
                  onChange={(v) => {
                    setLevels((s) => ({ ...s, [l]: v }));
                    save(v ? `You'll hear from us at ${l}% (${l * 10} payments)` : `No alert at ${l}%`);
                  }}
                />
              </li>
            ))}
          </ul>
        </div>
        <div>
          <p className="mb-1 text-[13px] font-medium text-ink-2">Send alerts to</p>
          <ul className="divide-y divide-line">
            <li className="flex items-center justify-between py-2.5">
              <span className="text-sm text-ink">In the app & internet bank</span>
              <span className="text-[12px] text-ink-3">Always on</span>
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-sm text-ink">
                Email <span className="text-ink-3">· {emailAddress}</span>
              </span>
              <Switch size="sm" checked={email} label="Email alerts" onChange={(v) => { setEmail(v); save(v ? "Email alerts on" : "Email alerts off"); }} />
            </li>
            <li className="flex items-center justify-between py-2.5">
              <span className="text-sm text-ink">
                SMS <span className="text-ink-3">· €0.19 per message</span>
              </span>
              <Switch size="sm" checked={sms} label="SMS alerts" onChange={(v) => { setSms(v); save(v ? "SMS alerts on · €0.19 each" : "SMS alerts off"); }} />
            </li>
          </ul>
        </div>
      </div>
      <div className="flex items-start gap-2 rounded-b-xl border-t border-line bg-canvas px-5 py-3 text-[12px] text-ink-3">
        <ShieldCheck className="mt-0.5 size-3.5 shrink-0" />
        Alerts can arrive a few minutes late. They never block payments.
      </div>
    </Card>
  );
}
