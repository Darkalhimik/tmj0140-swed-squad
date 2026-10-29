"use client";

import { Check, Search, SearchX } from "lucide-react";
import { useCallback, useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { AllowanceRow, allowanceCost, FeeBreakdown, PlanCompare } from "@/components/banking/transparency";
import { SettingsSection } from "@/components/personal/settings-section";
import { ValueBars } from "@/components/personal/value-bars";
import { PageContainer, PageHeader } from "@/components/shell/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { EmptyState, Money } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { Tabs } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { personalAllowances, personalFeesByMonth, personalPlanId, personalPlans, priceList, RESET_DATE, type Plan } from "@/lib/data/pricing";
import { money } from "@/lib/format";

type Tab = "month" | "history" | "plans" | "prices";

export function PlanAndFees() {
  const toast = useToast();
  const [tab, setTab] = useState<Tab>("month");
  const [current, setCurrent] = useState(personalPlanId);
  const [choosing, setChoosing] = useState<Plan | null>(null);
  const [signing, setSigning] = useState(false);
  const [query, setQuery] = useState("");

  const plan = personalPlans.find((p) => p.id === current)!;
  const extras = personalAllowances.reduce((s, a) => s + allowanceCost(a), 0);
  const forecast = plan.price + extras;
  const sixMonths = personalFeesByMonth.reduce((s, m) => s + m.value, 0);

  const q = query.trim().toLowerCase();
  const groups = priceList
    .map((g) => ({ ...g, items: g.items.filter((i) => !q || `${i.label} ${i.note ?? ""} ${g.group}`.toLowerCase().includes(q)) }))
    .filter((g) => g.items.length > 0);

  const onSigned = useCallback(() => {
    setSigning(false);
    if (!choosing) return;
    setCurrent(choosing.id);
    toast({ title: "Plan changed", description: `${choosing.name} · ${money(choosing.price)}/month from 1 Nov` });
    setChoosing(null);
  }, [choosing, toast]);

  return (
    <PageContainer>
      <PageHeader title="Plan & fees" description="What you pay, what's included and what's left this month." />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="flex flex-col p-6">
          <div className="flex flex-wrap items-center gap-2">
            <h2 className="font-display text-[22px] font-semibold tracking-[-0.015em]">{plan.name}</h2>
            <Badge tone="brown">Your plan</Badge>
          </div>
          <p className="tabular mt-1 text-[15px] text-ink-2">
            <span className="font-semibold text-ink">{money(plan.price)}</span> a month · next charge 5 Nov
          </p>
          <ul className="mt-5 grid gap-2 sm:grid-cols-2">
            {plan.highlights.map((h) => (
              <li key={h} className="flex items-start gap-2 text-[13px] text-ink-2">
                <Check className="mt-0.5 size-3.5 shrink-0 text-success" strokeWidth={2.5} />
                {h}
              </li>
            ))}
          </ul>
        </Card>

        <Card className="p-6">
          <p className="text-[13px] text-ink-3">November, expected</p>
          <p className="font-display tabular mt-1 text-[32px] leading-10 font-semibold tracking-[-0.015em]">
            <Money value={forecast} />
          </p>
          <dl className="mt-4 flex flex-col gap-2 border-t border-line pt-4 text-[13px]">
            <div className="flex justify-between">
              <dt className="text-ink-3">Plan</dt>
              <dd className="tabular font-medium">{money(plan.price)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-ink-3">Beyond allowances</dt>
              <dd className="tabular font-medium">{money(extras)}</dd>
            </div>
          </dl>
        </Card>
      </div>

      <Tabs<Tab>
        className="mt-8 mb-5"
        value={tab}
        onChange={setTab}
        items={[
          { value: "month", label: "This month" },
          { value: "history", label: "Fees paid" },
          { value: "plans", label: "Plans" },
          { value: "prices", label: "Price list" },
        ]}
      />

      {tab === "month" && (
        <SettingsSection title="Usage" description="1–31 October · resets 1 November">
          <div className="divide-y divide-line">
            {personalAllowances.map((a) => (
              <AllowanceRow key={a.key} a={a} resetsAt={RESET_DATE} />
            ))}
          </div>
        </SettingsSection>
      )}

      {tab === "history" && (
        <SettingsSection
          title="Fees, last 6 months"
          description="Each fee is also a “Bank fee” line in Transactions."
          footer={
            <>
              <span>
                July: plan <span className="tabular">€1.00</span> + cash abroad <span className="tabular">€4.75</span> (€2.00 + 2.5% of €110)
              </span>
              <span className="tabular font-medium text-ink-2">Total {money(sixMonths)}</span>
            </>
          }
        >
          <ValueBars data={personalFeesByMonth} highlight="Oct" height={140} className="pt-2" />
        </SettingsSection>
      )}

      {tab === "plans" && (
        <section>
          <p className="mb-3 text-[13px] text-ink-3">Every plan includes euro payments and a debit card. Higher plans add insurance.</p>
          <PlanCompare plans={personalPlans} current={current} onChoose={(id) => setChoosing(personalPlans.find((p) => p.id === id) ?? null)} />
          <p className="mt-3 text-[12px] text-ink-4">Essential is free until 25 and €0.32 from 65.</p>
        </section>
      )}

      {tab === "prices" && (
        <SettingsSection
          title="Price list"
          description="From swedbank.ee price lists: plans since 1 Nov 2025, other fees since 31 Aug 2026."
          action={
            <Input
              size="sm"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search, e.g. ATM"
              prefix={<Search className="size-3.5" />}
              wrapperClassName="w-full sm:w-64"
              aria-label="Search the price list"
            />
          }
        >
          {groups.length === 0 ? (
            <EmptyState icon={<SearchX className="size-5" />} title={`Nothing matches “${query}”`} description="Try “card”, “cash” or “international”." />
          ) : (
            <div className="flex flex-col gap-5">
              {groups.map((g) => (
                <div key={g.group}>
                  <p className="mb-1 text-[13px] font-medium text-ink-2">{g.group}</p>
                  <ul className="divide-y divide-line">
                    {g.items.map((i) => (
                      <li key={i.label} className="flex items-start justify-between gap-6 py-2.5">
                        <div className="min-w-0">
                          <p className="text-sm text-ink">{i.label}</p>
                          {i.note && <p className="mt-0.5 text-[12px] text-ink-3">{i.note}</p>}
                        </div>
                        <p className="tabular shrink-0 text-right text-sm font-medium text-ink">{i.price}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          )}
        </SettingsSection>
      )}

      <Modal
        open={!!choosing && !signing}
        onClose={() => setChoosing(null)}
        title={choosing ? `Switch to ${choosing.name}?` : ""}
        description="You confirm the change with your e-signature."
        footer={
          <>
            <Button variant="tertiary" onClick={() => setChoosing(null)}>
              Cancel
            </Button>
            <Button variant="primary" onClick={() => setSigning(true)}>
              Continue With Smart-ID
            </Button>
          </>
        }
      >
        {choosing && (
          <div className="flex flex-col gap-4">
            <FeeBreakdown
              rows={[
                { label: `${plan.name} (today)`, value: `${money(plan.price)}/month`, tone: "muted" },
                { label: `${choosing.name}`, value: `${money(choosing.price)}/month` },
                { label: "Switching fee", value: "€0.00", tone: "success" },
              ]}
              total={{ label: "From 1 November", value: `${money(choosing.price)}/month` }}
              arrival={`${plan.name} stays active until 31 October. Switch back any time — changes apply from the next month.`}
            />
            <p className="text-[13px] text-ink-3">
              {choosing.price > plan.price ? "What you add: " : "What you lose: "}
              {(choosing.price > plan.price ? choosing : plan).highlights
                .filter((h) => !(choosing.price > plan.price ? plan : choosing).highlights.includes(h))
                .join(", ")
                .toLowerCase() || "nothing"}
              .
            </p>
          </div>
        )}
      </Modal>
      <SmartIdModal
        open={signing}
        onClose={() => setSigning(false)}
        onConfirmed={onSigned}
        action={choosing ? `Change service plan to ${choosing.name}` : ""}
        details={
          choosing
            ? [
                { label: "New fee", value: `${money(choosing.price)}/month` },
                { label: "Starts", value: "1 Nov 2026" },
              ]
            : []
        }
      />
    </PageContainer>
  );
}
