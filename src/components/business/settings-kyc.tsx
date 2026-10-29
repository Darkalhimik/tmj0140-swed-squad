"use client";

import { CircleCheck, Info } from "lucide-react";
import { useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StatusDot } from "@/components/ui/status-dot";
import { useToast } from "@/components/ui/toast";
import { fmtDate, NOW } from "@/lib/format";
import { useCompany, useStore } from "@/lib/store";
import { SettingsSection } from "./settings-shared";

const HELD = [
  { label: "What the company does", value: "Software development and UI design for business clients", confirmed: "2026-03-14" },
  { label: "Expected turnover", value: "€400,000–1,000,000 per year", confirmed: "2026-03-14" },
  { label: "Countries you trade with", value: "Estonia, Finland, Germany, United Kingdom", confirmed: "2026-03-14" },
  { label: "Source of funds", value: "Payments from clients for services", confirmed: "2026-03-14" },
  { label: "Cash usage", value: "None", confirmed: "2026-03-14" },
  { label: "Beneficial owners", value: "Mari Tamm (60%), Karl Põder (40%)", confirmed: "2026-03-14" },
];

function monthsUntil(iso: string) {
  const d = new Date(iso);
  return (d.getUTCFullYear() - NOW.getUTCFullYear()) * 12 + d.getUTCMonth() - NOW.getUTCMonth();
}

export function KycSection() {
  const company = useCompany();
  const { dispatch } = useStore();
  const toast = useToast();
  const [signing, setSigning] = useState(false);
  const [reviewed, setReviewed] = useState(company.kyc.lastReviewed);
  const confirmedNow = reviewed !== company.kyc.lastReviewed;
  const next = confirmedNow ? "2027-10-29" : company.kyc.nextReview;

  return (
    <SettingsSection
      id="kyc"
      title="Know your customer"
      description="What we hold about your company and why. Banks must know how accounts are used (anti-money-laundering law) — you can see and confirm all of it here."
      aside={<StatusDot status="ready" label="Up to date" />}
      footer={
        <>
          <span className="flex items-start gap-1.5">
            <Info className="mt-px size-3.5 shrink-0" />
            Confirming takes about 2 minutes. If something changed, edit it before you sign.
          </span>
          <Button size="sm" variant="primary" onClick={() => setSigning(true)}>
            Confirm details
          </Button>
        </>
      }
    >
      <div className="grid gap-4 rounded-lg bg-subtle p-4 sm:grid-cols-3">
        <div>
          <p className="text-[12px] text-ink-3">Last reviewed</p>
          <p className="mt-0.5 text-sm font-medium text-ink">{confirmedNow ? "Today" : fmtDate(reviewed, "long")}</p>
        </div>
        <div>
          <p className="text-[12px] text-ink-3">Next review</p>
          <p className="mt-0.5 text-sm font-medium text-ink">
            {fmtDate(next, "long")} <span className="font-normal text-ink-3">· in {monthsUntil(next)} months</span>
          </p>
        </div>
        <div>
          <p className="text-[12px] text-ink-3">Risk level</p>
          <p className="mt-0.5 text-sm font-medium text-ink">{company.kyc.risk}</p>
        </div>
      </div>
      <ul className="mt-3 divide-y divide-line">
        {HELD.map((h) => (
          <li key={h.label} className="flex flex-col gap-0.5 py-2.5 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-48 shrink-0 text-[13px] text-ink-3">{h.label}</span>
            <span className="min-w-0 flex-1 text-sm text-ink">{h.value}</span>
            <span className="shrink-0 text-[12px] text-ink-4">
              {confirmedNow ? "Confirmed today" : `Confirmed ${fmtDate(h.confirmed, "long")}`}
            </span>
          </li>
        ))}
      </ul>

      <SmartIdModal
        open={signing}
        onClose={() => setSigning(false)}
        action={`Confirm ${company.name} details are up to date`}
        details={[
          { label: "Items confirmed", value: `${HELD.length} of ${HELD.length}` },
          { label: "Next review", value: fmtDate("2027-10-29", "long") },
        ]}
        onConfirmed={() => {
          setReviewed(NOW.toISOString());
          dispatch({ type: "biz/log", action: "kyc.confirmed", target: "Company details", detail: "6 items · next review 29 Oct 2027" });
          toast({ title: "Details confirmed", description: "Next review in 12 months · logged in Activity" });
          setSigning(false);
        }}
      />
    </SettingsSection>
  );
}

export function AccountStatusSection() {
  return (
    <SettingsSection
      id="status"
      title="Account status"
      description="If we ever have to restrict anything, this is where you'll see exactly what, why and what to do — never a silent block."
      aside={
        <Badge tone="success" icon={<CircleCheck className="size-3" />}>
          No restrictions
        </Badge>
      }
    >
      <p className="text-sm text-ink-2">All accounts, cards and payments work normally. Nothing needs your attention.</p>
      <div className="mt-4 rounded-lg border border-dashed border-line-strong p-4">
        <p className="text-[12px] font-medium text-ink-3">Example — this is not your account</p>
        <p className="mt-1 text-sm font-medium text-ink">Outgoing international payments paused</p>
        <dl className="mt-3 grid gap-x-6 gap-y-2.5 text-[13px] sm:grid-cols-2">
          <div>
            <dt className="text-ink-3">Why</dt>
            <dd className="text-ink-2">We need a document showing the source of a €24,800 incoming payment.</dd>
          </div>
          <div>
            <dt className="text-ink-3">Still works</dt>
            <dd className="text-ink-2">Euro payments, salaries, cards and incoming money.</dd>
          </div>
          <div>
            <dt className="text-ink-3">What to do</dt>
            <dd className="text-ink-2">Upload the invoice or contract by 5 Nov. Review takes about 1 working day.</dd>
          </div>
          <div>
            <dt className="text-ink-3">Case</dt>
            <dd className="text-ink-2">
              <span className="font-mono text-[12px] tracking-tight">EE-2026-118274</span> · Kadri Org, 613 2222
            </dd>
          </div>
        </dl>
      </div>
    </SettingsSection>
  );
}
