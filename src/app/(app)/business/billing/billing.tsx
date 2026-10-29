"use client";

import { Download, FileText, ShieldCheck } from "lucide-react";
import { useState } from "react";
import { AllowanceRow, allowanceCost, FeeBreakdown } from "@/components/banking/transparency";
import { FeeHistory } from "@/components/business/billing-history";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Gauge } from "@/components/ui/meter";
import { Note } from "@/components/ui/misc";
import { StatusDot } from "@/components/ui/status-dot";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/toast";
import { businessAccounts } from "@/lib/data/business";
import { businessAllowances, businessFeeHistory, businessInvoices, RESET_DATE } from "@/lib/data/pricing";
import { downloadFeeStatement } from "@/lib/export/documents";
import { fmtDate, iban, money, NOW } from "@/lib/format";

const DAY_OF_MONTH = 29;
const DAYS_IN_MONTH = 31;

function feeLine(key: string) {
  const a = businessAllowances.find((x) => x.key === key)!;
  return { a, cost: allowanceCost(a) };
}

export function Billing() {
  const toast = useToast();
  const total = businessAllowances.reduce((s, a) => s + allowanceCost(a), 0);
  const payments = feeLine("payments");
  const cards = feeLine("cards");
  const swift = feeLine("swift");
  const requests = feeLine("requests");
  const pace = Math.round((payments.a.used / DAY_OF_MONTH) * DAYS_IN_MONTH);
  const freeLeft = (payments.a.included ?? 0) - payments.a.used;
  const daysLeft = Math.ceil((new Date(RESET_DATE).getTime() - NOW.getTime()) / 86_400_000);
  const main = businessAccounts[0]!;

  return (
    <PageContainer>
      <PageHeader
        title="Fees & usage"
        description="No monthly account fee. You pay only for what you use — every line below updates as it happens."
        actions={
          <Button
            variant="secondary"
            leading={<FileText className="size-4" />}
            onClick={async () => {
              const file = await downloadFeeStatement(businessInvoices[0]!);
              toast({ title: "Fee statement downloaded", description: file });
            }}
          >
            Download fee statement
          </Button>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <Card className="p-5">
          <div className="flex items-baseline justify-between gap-4">
            <p className="text-[15px] font-semibold tracking-[-0.01em]">Estimated fees for October</p>
            <p className="text-[12px] text-ink-3">1–31 Oct · resets {fmtDate(RESET_DATE)}</p>
          </div>
          <p className="tabular mt-3 text-[34px] leading-10 font-semibold tracking-[-0.04em]">{money(total)}</p>
          <p className="text-[13px] text-ink-3">
            Charged on 5 Nov from {main.name} · <span className="font-mono tracking-tight">{iban(main.iban).slice(-9)}</span>
          </p>
          <FeeBreakdown
            className="mt-5"
            rows={[
              { label: "Monthly account fee", value: money(0), tone: "success" },
              {
                label: `Euro payments · ${payments.a.used} of ${(payments.a.included ?? 0).toLocaleString("en-IE")} free`,
                value: money(payments.cost),
                tone: "success",
              },
              { label: `Business debit cards · ${cards.a.used} × €2.00`, value: money(cards.cost) },
              {
                label: `International payment (SWIFT) · ${swift.a.used} × €6.00`,
                value: money(swift.cost),
                hint: "Licence renewal to Arcticwave Ltd, sent 20 Oct (PAY-2038). Shared costs (SHA): intermediary banks may deduct their own fees.",
              },
              { label: `Money requests · ${requests.a.used} × €0.09`, value: money(requests.cost) },
            ]}
            total={{ label: "Estimated total", value: money(total) }}
            arrival={`Final amount on 1 Nov · ${daysLeft} days of usage left in this period`}
          />
        </Card>

        <Card className="flex flex-col p-5">
          <p className="text-[15px] font-semibold tracking-[-0.01em]">Free euro payments</p>
          <div className="mt-4 flex items-center gap-4">
            <div className="relative">
              <Gauge value={(payments.a.used / (payments.a.included ?? 1)) * 100} size={88} stroke={8} />
              <span className="tabular absolute inset-0 flex items-center justify-center text-[15px] font-semibold">
                {Math.round((payments.a.used / (payments.a.included ?? 1)) * 100)}%
              </span>
            </div>
            <div>
              <p className="tabular text-[22px] font-semibold tracking-[-0.03em]">
                {payments.a.used} <span className="text-[15px] font-normal text-ink-3">of 1,000</span>
              </p>
              <p className="text-[13px] text-ink-3">{freeLeft} free payments left this month</p>
            </div>
          </div>
          <div className="mt-auto pt-5">
            <Note tone="success">
              At your current pace you&apos;ll send about {pace} payments by 31 Oct — well within the free 1,000. No payment charges expected.
            </Note>
          </div>
        </Card>
      </div>

      <Card className="mt-5">
        <CardHeader title="Usage this period" description="1–31 October 2026 · usage updates every few minutes" />
        <div className="divide-y divide-line px-5">
          {businessAllowances.map((a) => (
            <AllowanceRow key={a.key} a={a} resetsAt={RESET_DATE} />
          ))}
        </div>
      </Card>

      <div className="mt-5 grid gap-5 lg:grid-cols-2">
        <Card className="p-5">
          <p className="text-[15px] font-semibold tracking-[-0.01em]">Fees by month</p>
          <p className="mb-5 text-[13px] text-ink-3">Last 6 months · every euro itemised in the fee statements</p>
          <FeeHistory data={businessFeeHistory} />
        </Card>

        <Card>
          <CardHeader title="Fee statements" description="Charged on the 5th of the following month" />
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
                    const file = await downloadFeeStatement(inv);
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

      <AlertsCard />

      <Note tone="brand" className="mt-5" title="Controls are free on every account">
        Roles, approval rules, card limits and the activity log never cost extra — there is no paid tier for keeping your company safe.
      </Note>
    </PageContainer>
  );
}

function AlertsCard() {
  const toast = useToast();
  const [levels, setLevels] = useState({ 50: false, 75: true, 100: true });
  const [email, setEmail] = useState(true);
  const [sms, setSms] = useState(false);

  const save = (msg: string) => toast({ title: "Alert updated", description: msg });

  return (
    <Card className="mt-5">
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
                Email <span className="text-ink-3">· mari@nordlight.ee</span>
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
        Usage updates every few minutes, so an alert can arrive shortly after you cross a threshold. Alerts never block payments.
      </div>
    </Card>
  );
}
