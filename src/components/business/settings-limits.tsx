"use client";

import { Globe, Plus, X } from "lucide-react";
import { useState } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Meter } from "@/components/ui/meter";
import { Note } from "@/components/ui/misc";
import { Modal } from "@/components/ui/overlay";
import { useToast } from "@/components/ui/toast";
import { companyLimits } from "@/lib/data/business";
import { money } from "@/lib/format";
import { useStore } from "@/lib/store";
import { SettingsSection } from "./settings-shared";

type Limits = { daily: number; monthly: number; instant: number };

const ALL_COUNTRIES = ["Estonia", "Latvia", "Lithuania", "Finland", "Sweden", "Germany", "United Kingdom", "Spain", "Portugal"];

export function LimitsSection() {
  const { dispatch } = useStore();
  const toast = useToast();
  const [limits, setLimits] = useState<Limits>({
    daily: companyLimits.daily.max,
    monthly: companyLimits.monthly.max,
    instant: companyLimits.instantDaily.max,
  });
  const [editing, setEditing] = useState(false);
  const [pending, setPending] = useState<Limits | null>(null);

  const rows = [
    { label: "Daily payment limit", used: companyLimits.daily.used, max: limits.daily, reset: "Resets at midnight" },
    { label: "Monthly payment limit", used: companyLimits.monthly.used, max: limits.monthly, reset: "Resets 1 Nov" },
    { label: "Instant payments per day", used: companyLimits.instantDaily.used, max: limits.instant, reset: `Max ${money(companyLimits.instantPerPayment)} per payment` },
  ];

  return (
    <SettingsSection
      id="limits"
      title="Payment limits"
      description="Company-wide limits from your Digital Services Agreement. They apply on top of each person's approval limit."
      aside={
        <Button size="sm" variant="secondary" onClick={() => setEditing(true)}>
          Change limits
        </Button>
      }
      footer={
        <span>
          Self-service up to {money(companyLimits.selfServiceMax.daily)}/day and {money(companyLimits.selfServiceMax.monthly)}/month. Payments over{" "}
          {money(companyLimits.secondApprovalFrom)} always need a second approver.
        </span>
      }
    >
      <ul className="flex flex-col gap-4">
        {rows.map((r) => (
          <li key={r.label}>
            <div className="mb-1.5 flex items-baseline justify-between gap-4 text-sm">
              <span className="text-ink">{r.label}</span>
              <span className="tabular text-ink-2">
                {money(r.used)} <span className="text-ink-4">of {money(r.max)}</span>
              </span>
            </div>
            <Meter value={r.used} max={r.max} />
            <p className="mt-1 text-[12px] text-ink-4">
              {money(r.max - r.used)} left · {r.reset}
            </p>
          </li>
        ))}
      </ul>

      {editing && (
        <LimitsDialog
          current={limits}
          onClose={() => setEditing(false)}
          onSign={(next) => {
            setEditing(false);
            setPending(next);
          }}
        />
      )}
      <SmartIdModal
        open={!!pending}
        onClose={() => setPending(null)}
        action="Change company payment limits"
        details={
          pending
            ? [
                { label: "Daily", value: `${money(limits.daily)} → ${money(pending.daily)}` },
                { label: "Monthly", value: `${money(limits.monthly)} → ${money(pending.monthly)}` },
                { label: "Instant per day", value: `${money(limits.instant)} → ${money(pending.instant)}` },
                { label: "Takes effect", value: "Immediately after signing" },
              ]
            : []
        }
        onConfirmed={() => {
          if (!pending) return;
          const changes = (
            [
              ["Daily limit", limits.daily, pending.daily],
              ["Monthly limit", limits.monthly, pending.monthly],
              ["Instant limit", limits.instant, pending.instant],
            ] as const
          ).filter(([, a, b]) => a !== b);
          for (const [label, a, b] of changes) {
            dispatch({ type: "biz/log", action: "limits.changed", target: "Company limits", detail: `${label} ${money(a)} → ${money(b)}` });
          }
          setLimits(pending);
          setPending(null);
          toast({ title: "Limits updated", description: "Applied as soon as you signed · logged in Activity" });
        }}
      />
    </SettingsSection>
  );
}

function LimitsDialog({ current, onClose, onSign }: { current: Limits; onClose: () => void; onSign: (next: Limits) => void }) {
  const [form, setForm] = useState({ daily: String(current.daily), monthly: String(current.monthly), instant: String(current.instant) });
  const num = (s: string) => Number(s);
  const cents = (s: string) => /[.,]/.test(s);

  const errors: Partial<Record<keyof typeof form, string>> = {};
  for (const k of ["daily", "monthly", "instant"] as const) {
    if (!form[k]) errors[k] = "Enter a limit.";
    else if (cents(form[k])) errors[k] = "The limit must be without euro cents.";
  }
  if (!errors.daily && num(form.daily) > companyLimits.selfServiceMax.daily)
    errors.daily = `Daily limit is higher than the self-service maximum (${money(companyLimits.selfServiceMax.daily)}).`;
  if (!errors.monthly && num(form.monthly) > companyLimits.selfServiceMax.monthly)
    errors.monthly = `Monthly limit is higher than the self-service maximum (${money(companyLimits.selfServiceMax.monthly)}).`;
  if (!errors.daily && !errors.monthly && num(form.daily) > num(form.monthly)) errors.daily = "Daily limit cannot exceed monthly limit.";
  if (!errors.instant && !errors.daily && num(form.instant) > num(form.daily)) errors.instant = "Instant payment limit cannot be higher than daily limit.";

  const valid = Object.keys(errors).length === 0;
  const next = { daily: num(form.daily), monthly: num(form.monthly), instant: num(form.instant) };
  const changed = next.daily !== current.daily || next.monthly !== current.monthly || next.instant !== current.instant;
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) => setForm((f) => ({ ...f, [k]: e.target.value.replace(/[^\d.,]/g, "") }));

  return (
    <Modal
      open
      onClose={onClose}
      title="Change payment limits"
      description="New limits apply as soon as they're signed. Lower limits are a good fraud defence if you rarely make large payments."
      footer={
        <>
          <Button variant="tertiary" onClick={onClose}>
            Cancel
          </Button>
          <Button variant="primary" disabled={!valid || !changed} onClick={() => onSign(next)}>
            Review & sign
          </Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        <Input label="Daily limit" prefix="€" inputMode="numeric" className="tabular" value={form.daily} onChange={set("daily")} error={errors.daily} />
        <Input label="Monthly limit" prefix="€" inputMode="numeric" className="tabular" value={form.monthly} onChange={set("monthly")} error={errors.monthly} />
        <Input
          label="Instant payments per day"
          prefix="€"
          inputMode="numeric"
          className="tabular"
          value={form.instant}
          onChange={set("instant")}
          error={errors.instant}
          hint={`Instant payments arrive within 10 seconds. Single payments are capped at ${money(companyLimits.instantPerPayment)}.`}
        />
        <Note tone="gray">Need more than the self-service maximum? Your account manager can raise it — they call back within an hour on working days.</Note>
      </div>
    </Modal>
  );
}

export function LoginSection() {
  const { dispatch } = useStore();
  const toast = useToast();
  const [saved, setSaved] = useState<string[]>(companyLimits.loginCountries);
  const [draft, setDraft] = useState<string[]>(companyLimits.loginCountries);
  const [adding, setAdding] = useState("");
  const [signing, setSigning] = useState(false);

  const added = draft.filter((c) => !saved.includes(c));
  const removed = saved.filter((c) => !draft.includes(c));
  const dirty = added.length + removed.length > 0;
  const available = ALL_COUNTRIES.filter((c) => !draft.includes(c));

  return (
    <SettingsSection
      id="security"
      title="Login restrictions"
      description="Where people can sign in to the business internet bank from. Applies to everyone at the company."
      footer={
        dirty ? (
          <>
            <span className="font-mono text-[12px]">
              {added.map((c) => (
                <span key={c} className="mr-2 text-success">
                  + {c}
                </span>
              ))}
              {removed.map((c) => (
                <span key={c} className="mr-2 text-danger">
                  − {c}
                </span>
              ))}
            </span>
            <div className="flex gap-2">
              <Button size="sm" variant="tertiary" onClick={() => setDraft(saved)}>
                Discard
              </Button>
              <Button size="sm" variant="primary" onClick={() => setSigning(true)} disabled={!draft.length}>
                Sign {added.length + removed.length} change{added.length + removed.length === 1 ? "" : "s"}
              </Button>
            </div>
          </>
        ) : (
          <span>Signing in from a Swedbank branch is always allowed. IP allow-list: not set.</span>
        )
      }
    >
      <p className="mb-2 text-[13px] font-medium text-ink-2">Allowed countries</p>
      <div className="flex flex-wrap items-center gap-1.5">
        {draft.map((c) => (
          <span key={c} className="inline-flex h-7 items-center gap-1.5 rounded-full bg-muted pr-1 pl-2.5 text-[13px] text-ink">
            <Globe className="size-3.5 text-ink-3" />
            {c}
            <button
              aria-label={`Remove ${c}`}
              onClick={() => setDraft((d) => d.filter((x) => x !== c))}
              className="flex size-5 items-center justify-center rounded-full text-ink-3 hover:bg-black/10 hover:text-ink"
            >
              <X className="size-3" />
            </button>
          </span>
        ))}
        <div className="flex items-center gap-1.5">
          <select
            value={adding}
            onChange={(e) => setAdding(e.target.value)}
            aria-label="Add country"
            className="h-7 rounded-full bg-surface px-3 text-[13px] text-ink-2 shadow-[0_0_0_1px_var(--color-line-strong)] outline-none focus-visible:shadow-[0_0_0_1px_var(--color-ink-3)]"
          >
            <option value="">Add country…</option>
            {available.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <Button
            size="xs"
            variant="secondary"
            icon
            aria-label="Add selected country"
            disabled={!adding}
            onClick={() => {
              setDraft((d) => [...d, adding]);
              setAdding("");
            }}
          >
            <Plus className="size-3.5" />
          </Button>
        </div>
      </div>
      {!draft.length && <p className="mt-2 text-[12px] text-danger">Keep at least one country, or nobody can sign in.</p>}

      <SmartIdModal
        open={signing}
        onClose={() => setSigning(false)}
        action="Change login countries"
        details={[
          ...(added.length ? [{ label: "Allow", value: added.join(", ") }] : []),
          ...(removed.length ? [{ label: "Block", value: removed.join(", ") }] : []),
          { label: "Applies to", value: "Everyone at the company" },
        ]}
        onConfirmed={() => {
          dispatch({
            type: "biz/log",
            action: "login.countries_changed",
            target: "Internet bank",
            detail: [...added.map((c) => `+${c}`), ...removed.map((c) => `−${c}`)].join(" "),
          });
          setSaved(draft);
          setSigning(false);
          toast({ title: "Login countries updated", description: draft.join(", ") });
        }}
      />
    </SettingsSection>
  );
}
