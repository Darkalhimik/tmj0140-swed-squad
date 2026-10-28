"use client";

import { ArrowRight, FlaskConical, Lock, Pencil } from "lucide-react";
import { useCallback, useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { AvatarGroup } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader } from "@/components/ui/card";
import { Input, Select } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { Note } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { Switch } from "@/components/ui/switch";
import { Segmented } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/toast";
import { companyLimits } from "@/lib/data/business";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import type { ApprovalRule } from "@/lib/types";
import { eligibleApprovers, rangeLabel, ruleFor } from "./payments-shared";

const LOCKED = [
  { title: "Nobody approves their own payment", body: "The person who creates a payment can never be one of its approvers." },
  { title: "New beneficiaries need a board member", body: "The first payment to an IBAN you haven't paid before always needs a management board member." },
  {
    title: `Instant payments up to ${money(companyLimits.instantPerPayment)} each`,
    body: "Larger amounts are sent as regular SEPA payments and arrive by the next business day.",
  },
];

export function RulesPanel() {
  const { state, dispatch } = useStore();
  const toast = useToast();
  const { rules, members } = state.business;
  const [editing, setEditing] = useState<ApprovalRule | null>(null);
  const [pending, setPending] = useState<{ rule: ApprovalRule; max: number | null; approvers: number } | null>(null);

  const confirm = useCallback(() => {
    if (!pending) return;
    const { rule, max, approvers } = pending;
    const patch: Partial<ApprovalRule> = {};
    if (max !== rule.max) patch.max = max;
    if (approvers !== rule.approvers) patch.approvers = approvers;
    if (Object.keys(patch).length) dispatch({ type: "biz/rule", id: rule.id, patch });
    const idx = rules.findIndex((r) => r.id === rule.id);
    const next = rules[idx + 1];
    if (next && max !== null && max !== rule.max) dispatch({ type: "biz/rule", id: next.id, patch: { min: max } });
    setPending(null);
    toast({ title: "Approval rule updated", description: "Applies to new payments · recorded in the activity log" });
  }, [pending, rules, dispatch, toast]);

  return (
    <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_360px]">
      <div className="flex flex-col gap-5">
        <Card>
          <CardHeader
            title="Who approves what"
            description="By amount. Changes amend your Digital Services Agreement and are signed with Smart-ID — no branch visit."
          />
          <ol className="flex flex-col px-5 pb-2">
            {rules.map((r) => {
              const who = members.filter((m) => m.status === "active" && (r.id === "r-1" ? m.role === "owner" || m.role === "admin" : m.board));
              return (
                <li key={r.id} className="flex flex-col gap-3 border-t border-line py-4 first:border-t-0 sm:flex-row sm:items-center">
                  <div className="w-44 shrink-0">
                    <p className="tabular text-sm font-medium text-ink">{rangeLabel(r)}</p>
                    <p className="text-[12px] text-ink-3">{r.name}</p>
                  </div>
                  <ArrowRight className="hidden size-4 shrink-0 text-ink-4 sm:block" />
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-ink">
                      <span className="font-medium">
                        {r.approvers} approval{r.approvers > 1 ? "s" : ""}
                      </span>{" "}
                      · {r.who}
                    </p>
                    <div className="mt-1 flex items-center gap-2 text-[12px] text-ink-3">
                      <AvatarGroup names={who.map((m) => m.name)} size="xs" />
                      {who.map((m) => m.name.split(" ")[0]).join(", ")}
                    </div>
                  </div>
                  <Button size="sm" variant="secondary" leading={<Pencil className="size-3.5" />} onClick={() => setEditing(r)}>
                    Edit
                  </Button>
                </li>
              );
            })}
          </ol>
        </Card>

        <Card>
          <CardHeader title="Always on" description="Safeguards that apply to every payment, whatever the amount." />
          <ul className="flex flex-col px-5 pb-4">
            {LOCKED.map((l) => (
              <li key={l.title} className="flex gap-3 border-t border-line py-3 first:border-t-0">
                <span className="mt-0.5 flex size-7 shrink-0 items-center justify-center rounded-md bg-subtle text-ink-3">
                  <Lock className="size-3.5" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-ink">{l.title}</p>
                  <p className="text-[13px] text-ink-3">{l.body}</p>
                </div>
                <Badge tone="gray" size="xs" className="mt-1">
                  Locked
                </Badge>
              </li>
            ))}
          </ul>
        </Card>

        <Card>
          <CardHeader title="Company limits" description="Across all users. You can change them here up to €50,000 a day or €100,000 a month." />
          <div className="grid gap-4 px-5 pb-5 sm:grid-cols-3">
            <LimitStat label="Today" used={companyLimits.daily.used} max={companyLimits.daily.max} />
            <LimitStat label="This month" used={companyLimits.monthly.used} max={companyLimits.monthly.max} />
            <LimitStat label="Instant today" used={companyLimits.instantDaily.used} max={companyLimits.instantDaily.max} />
          </div>
        </Card>
      </div>

      <Simulator />

      <EditRuleModal
        rule={editing}
        rules={rules}
        onClose={() => setEditing(null)}
        onSave={(max, approvers) => {
          if (editing) setPending({ rule: editing, max, approvers });
          setEditing(null);
        }}
      />
      <SmartIdModal
        open={!!pending}
        onClose={() => setPending(null)}
        onConfirmed={confirm}
        action="Amend the Digital Services Agreement"
        details={
          pending
            ? [
                { label: "Rule", value: pending.rule.name },
                { label: "Range", value: rangeLabel({ ...pending.rule, max: pending.max }) },
                { label: "Approvals", value: `${pending.rule.approvers} → ${pending.approvers}` },
                { label: "Company", value: "Nordlight Studio OÜ" },
              ]
            : []
        }
      />
    </div>
  );
}

function LimitStat({ label, used, max }: { label: string; used: number; max: number }) {
  return (
    <div>
      <div className="mb-1.5 flex items-baseline justify-between gap-2">
        <span className="text-[13px] text-ink-3">{label}</span>
        <span className="tabular text-[12px] text-ink-4">{Math.round((used / max) * 100)}%</span>
      </div>
      <Meter value={used} max={max} />
      <p className="tabular mt-1.5 text-[13px] text-ink-2">
        {money(used)} <span className="text-ink-4">of {money(max)}</span>
      </p>
    </div>
  );
}

function EditRuleModal({
  rule,
  rules,
  onClose,
  onSave,
}: {
  rule: ApprovalRule | null;
  rules: ApprovalRule[];
  onClose: () => void;
  onSave: (max: number | null, approvers: number) => void;
}) {
  return (
    <Modal open={!!rule} onClose={onClose} size="sm" title={rule ? `Edit “${rule.name}”` : undefined} description="Applies to payments created after the change.">
      {rule && <EditRuleBody rule={rule} rules={rules} onClose={onClose} onSave={onSave} />}
    </Modal>
  );
}

function EditRuleBody({
  rule,
  rules,
  onClose,
  onSave,
}: {
  rule: ApprovalRule;
  rules: ApprovalRule[];
  onClose: () => void;
  onSave: (max: number | null, approvers: number) => void;
}) {
  const [maxRaw, setMaxRaw] = useState(rule.max === null ? "" : String(rule.max));
  const [approvers, setApprovers] = useState(String(rule.approvers) as "1" | "2");
  const next = rules[rules.findIndex((r) => r.id === rule.id) + 1];
  const max = rule.max === null ? null : Number(maxRaw) || 0;
  const error =
    max === null
      ? undefined
      : max <= rule.min
        ? `Must be above ${money(rule.min)}`
        : next?.max != null && max >= next.max
          ? `Must be below ${money(next.max)}, where the next rule ends`
          : undefined;
  const changed = max !== rule.max || Number(approvers) !== rule.approvers;

  return (
    <div className="flex flex-col gap-4 pb-1">
      {rule.max !== null ? (
        <Input
          label="Up to"
          prefix="€"
          inputMode="numeric"
          className="tabular"
          value={maxRaw}
          onChange={(e) => setMaxRaw(e.target.value.replace(/\D/g, ""))}
          error={error}
          hint={next ? `“${next.name}” will then start at ${money(max ?? 0)}.` : undefined}
        />
      ) : (
        <p className="text-[13px] text-ink-3">Applies to every payment from {money(rule.min)}.</p>
      )}
      <div className="flex flex-col gap-1.5">
        <p className="text-[13px] font-medium text-ink-2">Approvals needed</p>
        <Segmented
          value={approvers}
          onChange={setApprovers}
          items={[
            { value: "1", label: "1 person" },
            { value: "2", label: "2 people" },
          ]}
        />
      </div>
      <Note tone="gray">You&apos;ll confirm the change with Smart-ID. Karl Põder gets a notification.</Note>
      <div className="flex justify-end gap-2">
        <Button variant="tertiary" onClick={onClose}>
          Cancel
        </Button>
        <Button variant="primary" disabled={!!error || !changed} onClick={() => onSave(max, Number(approvers))}>
          Review change
        </Button>
      </div>
    </div>
  );
}

function Simulator() {
  const { state } = useStore();
  const { rules, members } = state.business;
  const [amountRaw, setAmountRaw] = useState("12480");
  const [creator, setCreator] = useState("m-liis");
  const [isNew, setIsNew] = useState(false);
  const amount = Number(amountRaw) || 0;
  const rule = ruleFor(amount, rules);
  const draft = { ruleId: rule.id, createdBy: creator, approvals: [], amount, newBeneficiary: isNew };
  const approvers = eligibleApprovers(draft, rules, members);
  const creatorExcluded = eligibleApprovers({ ...draft, createdBy: "" }, rules, members).some((m) => m.id === creator);
  const creatorName = members.find((m) => m.id === creator)?.name ?? "";
  const enough = approvers.length >= rule.approvers;
  const instant = amount <= companyLimits.instantPerPayment;
  const preparers = members.filter((m) => m.role === "owner" || m.role === "admin" || m.role === "accountant");

  return (
    <Card className="self-start">
      <CardHeader title="Test a payment" description="See what would happen before anyone pays." action={<FlaskConical className="size-4 text-ink-4" />} />
      <div className="flex flex-col gap-4 px-5 pb-5">
        <Input label="Amount" prefix="€" inputMode="numeric" className="tabular" value={amountRaw} onChange={(e) => setAmountRaw(e.target.value.replace(/\D/g, ""))} />
        <div className="flex flex-col gap-1.5">
          <label className="text-[13px] font-medium text-ink-2" htmlFor="sim-creator">
            Created by
          </label>
          <Select id="sim-creator" value={creator} onChange={(e) => setCreator(e.target.value)}>
            {preparers.map((m) => (
              <option key={m.id} value={m.id}>
                {m.name}
              </option>
            ))}
          </Select>
        </div>
        <label className="flex items-center justify-between gap-3 text-sm text-ink-2">
          First payment to this beneficiary
          <Switch checked={isNew} onChange={setIsNew} size="sm" label="New beneficiary" />
        </label>
        <div className="rounded-lg bg-subtle p-3.5 text-[13px] leading-5 text-ink-2">
          <p className="font-medium text-ink">
            {amount === 0 ? "Enter an amount" : `Needs ${rule.approvers} approval${rule.approvers > 1 ? "s" : ""} — “${rule.name}”`}
          </p>
          {amount > 0 && (
            <>
              <p className="mt-1">
                {enough
                  ? `${approvers.map((m) => m.name).join(rule.approvers > 1 ? " and " : " or ")} can approve.`
                  : `Only ${approvers.length} eligible approver${approvers.length === 1 ? "" : "s"} — this payment would be stuck. Add a board member or lower the requirement.`}
                {creatorExcluded && ` ${creatorName.split(" ")[0]} created it, so they can't approve.`}
              </p>
              <p className="mt-1 text-ink-3">
                {instant ? "Sent by SEPA Instant — arrives in seconds." : `Above ${money(companyLimits.instantPerPayment)}, so sent by regular SEPA — next business day.`}
              </p>
            </>
          )}
        </div>
      </div>
    </Card>
  );
}
