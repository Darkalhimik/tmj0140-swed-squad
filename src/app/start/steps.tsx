"use client";

import {
  Building,
  Check,
  CircleAlert,
  CircleCheck,
  Globe2,
  Home,
  Mail,
  Pencil,
  Plus,
  Search,
  Trash2,
  TriangleAlert,
  UserRound,
  X,
} from "lucide-react";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { SmartIdModal } from "@/components/banking/smart-id";
import { FeeBreakdown } from "@/components/banking/transparency";
import { Avatar } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StackBar } from "@/components/ui/chart";
import { Choicebox } from "@/components/ui/choicebox";
import { Input, Textarea } from "@/components/ui/input";
import { Note } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import { Segmented } from "@/components/ui/tabs";
import { roleMeta } from "@/lib/data/business";
import {
  BANK_CERTIFICATE_THRESHOLD,
  checkName,
  countryOptions,
  emtak,
  registryLookup,
  effectivePreset,
  STATE_FEE,
  turnoverBands,
  VAT_THRESHOLD,
} from "@/lib/data/formation";
import { cn } from "@/lib/cn";
import { fmtTime, money, NOW } from "@/lib/format";
import { useStore, type Formation, type Founder } from "@/lib/store";
import type { RoleId } from "@/lib/types";

function useFormation() {
  const { state, dispatch } = useStore();
  const set = (patch: Partial<Formation>) => dispatch({ type: "formation/set", patch });
  return { f: state.formation, set };
}

/** Geist "Fieldset": a titled settings block with an optional footer note. */
function Fieldset({
  title,
  description,
  children,
  footer,
  className,
  error,
}: {
  title: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
  /** Shown (with a red outline) once the user has tried to continue. */
  error?: string | false;
}) {
  return (
    <section
      data-invalid={error ? "true" : undefined}
      className={cn("rounded-xl bg-surface", error ? "shadow-[0_0_0_1.5px_var(--color-danger)]" : "shadow-card", className)}
    >
      <div className="p-5 sm:p-6">
        <h2 className="text-[15px] font-semibold tracking-[-0.01em]">{title}</h2>
        {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
        {error && (
          <p className="mt-2 flex items-center gap-1.5 text-[13px] font-medium text-danger">
            <CircleAlert className="size-4 shrink-0" />
            {error}
          </p>
        )}
        <div className="mt-4">{children}</div>
      </div>
      {footer && <div className="rounded-b-xl border-t border-line bg-canvas px-5 py-3 text-[13px] text-ink-3 sm:px-6">{footer}</div>}
    </section>
  );
}

const stack = "flex flex-col gap-5";

// ───────────────────────── Name & activity ─────────────────────────

export function CompanyStep() {
  const { f, set } = useFormation();
  const show = f.attempted.includes("company");
  const [checking, setChecking] = useState(false);
  const [query, setQuery] = useState("");
  const timer = useRef<number | undefined>(undefined);
  const result = checkName(f.name);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const matches = emtak
    .filter((e) => !query || e.label.toLowerCase().includes(query.toLowerCase()) || e.code.startsWith(query))
    .slice(0, 6);

  return (
    <div className={stack}>
      <Fieldset
        title="Company name"
        description="We check it against the e-Business Register as you type."
        footer="The name must include “OÜ” (or “osaühing”). Not ready to register? You can reserve a name for up to 6 months for a €150 state fee."
      >
        <Input
          size="lg"
          placeholder="e.g. Põhjatuul Labs"
          value={f.name}
          aria-invalid={show && result.status !== "available" && result.status !== "similar" ? true : undefined}
          autoFocus
          suffix={<span className="text-[15px] font-medium text-ink-2">OÜ</span>}
          onChange={(e) => {
            set({ name: e.target.value });
            setChecking(true);
            window.clearTimeout(timer.current);
            timer.current = window.setTimeout(() => setChecking(false), 450);
          }}
        />
        {/* Fixed height: the check result never pushes the rest of the page down. */}
        <div className="mt-3 h-11 overflow-hidden">
        {result.status === "empty" ? (
          <p className={cn("text-[13px]", show ? "font-medium text-danger" : "text-ink-3")}>
            {show ? "Enter a company name." : "Type a name to check it against the register."}
          </p>
        ) : (
          <div className="flex items-start gap-2 text-[13px]">
            {checking ? (
              <>
                <Spinner className="mt-0.5 size-3.5 text-ink-3" />
                <span className="text-ink-3">Checking the register…</span>
              </>
            ) : (
              <>
                {result.status === "available" && <CircleCheck className="mt-0.5 size-4 shrink-0 text-success" />}
                {result.status === "similar" && <TriangleAlert className="mt-0.5 size-4 shrink-0 text-warning" />}
                {(result.status === "taken" || result.status === "short") && <CircleAlert className="mt-0.5 size-4 shrink-0 text-danger" />}
                <div>
                  <p className={cn(result.status === "available" ? "text-success" : result.status === "similar" ? "text-warning" : "text-danger")}>
                    {result.message}
                  </p>
                  {result.similar.length > 0 && <p className="mt-0.5 truncate text-ink-3">Similar: {result.similar.join(", ")}</p>}
                </div>
              </>
            )}
          </div>
        )}
        </div>
      </Fieldset>

      <Fieldset
        title="Principal activity"
        description="Pick the one activity that brings in most of your income (EMTAK)."
        error={show && !f.emtak && "Pick a principal activity."}
        footer="Only one principal activity is registered at founding. Other activities are reported in your annual report."
      >
        {f.emtak ? (
          <div className="flex items-center justify-between gap-3 rounded-lg bg-subtle px-3.5 py-3">
            <div className="flex items-center gap-3">
              <span className="rounded-md bg-surface px-1.5 py-0.5 font-mono text-[12px] text-ink-2 shadow-card">{f.emtak.code}</span>
              <span className="text-sm font-medium">{f.emtak.label}</span>
            </div>
            <Button size="sm" variant="tertiary" onClick={() => set({ emtak: null })}>
              Change
            </Button>
          </div>
        ) : (
          <>
            <Input
              placeholder="Search, e.g. “design” or “62011”"
              prefix={<Search className="size-4" />}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
            />
            <ul className="mt-2 flex flex-col">
              {matches.map((e) => (
                <li key={e.code}>
                  <button
                    onClick={() => set({ emtak: e })}
                    className="flex w-full items-center gap-3 rounded-md px-2.5 py-2 text-left text-sm hover:bg-subtle"
                  >
                    <span className="w-12 font-mono text-[12px] text-ink-3">{e.code}</span>
                    {e.label}
                  </button>
                </li>
              ))}
              {matches.length === 0 && <li className="px-2.5 py-3 text-[13px] text-ink-3">No activity matches “{query}”.</li>}
            </ul>
          </>
        )}
      </Fieldset>

      <Fieldset
        title="What will the company do?"
        description="A few sentences in your own words."
        error={show && f.description.trim().length < 40 && `Write at least 40 characters (${f.description.trim().length} so far).`}
        footer="Why we ask: banks must understand how an account will be used (anti-money-laundering law). Clear answers mean no follow-up calls."
      >
        <Textarea
          rows={4}
          placeholder="e.g. We design and build web and mobile apps for Nordic retailers. Clients pay by invoice; we pay freelancers and software subscriptions."
          value={f.description}
          onChange={(e) => set({ description: e.target.value })}
        />
        <p className={cn("tabular mt-1.5 text-right text-[12px]", f.description.trim().length >= 40 ? "text-success" : "text-ink-4")}>
          {f.description.trim().length} / 40 characters minimum
        </p>
      </Fieldset>
    </div>
  );
}

// ───────────────────────── Founders & board ─────────────────────────

const SHARE_COLORS = ["#512b2b", "#ff5f00", "#31a3ae", "#fdc92a", "#990066"];

export function PeopleStep() {
  const { f, set } = useFormation();
  const show = f.attempted.includes("people");
  const [adding, setAdding] = useState(false);
  const [draft, setDraft] = useState({ name: "", idCode: "", email: "", residency: "Estonian resident" as Founder["residency"] });
  const total = f.founders.reduce((s, p) => s + (Number(p.share) || 0), 0);
  const update = (id: string, patch: Partial<Founder>) => set({ founders: f.founders.map((p) => (p.id === id ? { ...p, ...patch } : p)) });
  const owners = f.founders.filter((p) => p.share >= 25);
  const eResident = f.founders.some((p) => p.residency === "e-Resident");

  return (
    <div className={stack}>
      <Fieldset
        title="Founders"
        description="Everyone who will own shares. Each person signs the application digitally."
        error={show && !f.founders.some((p) => p.board) && "At least one founder must be a board member."}
      >
        <ul className="flex flex-col divide-y divide-line">
          {f.founders.map((p) => (
            <li key={p.id} className="flex flex-col gap-3 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center">
              <div className="flex min-w-0 flex-1 items-center gap-3">
                <Avatar name={p.name || "New person"} size="lg" />
                <div className="min-w-0">
                  <p className="flex flex-wrap items-center gap-1.5 text-sm font-medium">
                    {p.name}
                    {p.you && <Badge size="xs">You</Badge>}
                    {p.residency === "e-Resident" && (
                      <Badge size="xs" tone="info">
                        e-Resident
                      </Badge>
                    )}
                  </p>
                  <p className="font-mono text-[12px] text-ink-3">{p.idCode}</p>
                  <p className="mt-0.5 flex items-center gap-1 text-[12px] text-ink-3">
                    {p.you ? (
                      <>
                        <CircleCheck className="size-3 text-success" /> Identity confirmed with Smart-ID
                      </>
                    ) : (
                      <>
                        <Mail className="size-3" /> Signs via a link sent to {p.email}
                      </>
                    )}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-4 sm:gap-5">
                <label className="flex items-center gap-2 text-[13px] text-ink-2">
                  <Switch size="sm" checked={p.board} onChange={(v) => update(p.id, { board: v })} label={`${p.name} is a board member`} />
                  Board member
                </label>
                <Input
                  size="sm"
                  className="tabular text-right"
                  wrapperClassName="w-24"
                  inputMode="decimal"
                  value={String(p.share)}
                  suffix="%"
                  aria-label={`${p.name} share`}
                  onChange={(e) => update(p.id, { share: Math.min(100, Number(e.target.value.replace(/[^\d.]/g, "")) || 0) })}
                />
                {!p.you ? (
                  <Button
                    size="sm"
                    variant="tertiary"
                    icon
                    aria-label={`Remove ${p.name}`}
                    onClick={() => set({ founders: f.founders.filter((x) => x.id !== p.id) })}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                ) : (
                  <span className="w-8" />
                )}
              </div>
            </li>
          ))}
        </ul>

        {adding ? (
          <div className="mt-4 rounded-lg bg-subtle p-4">
            <div className="grid gap-3 sm:grid-cols-2">
              <Input label="Full name" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} placeholder="Liina Kask" />
              <Input
                label="Personal identification code"
                mono
                inputMode="numeric"
                value={draft.idCode}
                onChange={(e) => setDraft({ ...draft, idCode: e.target.value.replace(/\D/g, "").slice(0, 11) })}
                placeholder="49001010000"
              />
              <Input label="Email for the signing link" type="email" value={draft.email} onChange={(e) => setDraft({ ...draft, email: e.target.value })} placeholder="liina@example.com" />
              <div className="flex flex-col gap-1.5">
                <span className="text-[13px] font-medium text-ink-2">Residency</span>
                <Segmented
                  value={draft.residency}
                  onChange={(v) => setDraft({ ...draft, residency: v })}
                  items={[
                    { value: "Estonian resident", label: "Estonian resident" },
                    { value: "e-Resident", label: "e-Resident" },
                  ]}
                />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <Button variant="tertiary" onClick={() => setAdding(false)}>
                Cancel
              </Button>
              <Button
                variant="primary"
                disabled={draft.name.trim().length < 3 || !/^\d{11}$/.test(draft.idCode)}
                onClick={() => {
                  set({ founders: [...f.founders, { id: `f-${f.founders.length + 1}-${draft.idCode.slice(-3)}`, ...draft, share: 0, board: false }] });
                  setDraft({ name: "", idCode: "", email: "", residency: "Estonian resident" });
                  setAdding(false);
                }}
              >
                Add person
              </Button>
            </div>
          </div>
        ) : (
          <Button className="mt-4" variant="secondary" leading={<Plus className="size-4" />} onClick={() => setAdding(true)}>
            Add founder
          </Button>
        )}
      </Fieldset>

      <Fieldset
        title="Ownership"
        description="Shares must add up to 100%."
        error={(show || total > 100) && Math.abs(total - 100) >= 0.001 && `Shares add up to ${total}%, not 100%.`}
      >
        <div className="relative">
          {/* Scaled to the real total: over 100% the bar overflows past the 100% mark. */}
          <StackBar
            className="h-2.5"
            parts={f.founders
              .map((p, i) => ({ label: p.id, value: p.share, color: SHARE_COLORS[i % SHARE_COLORS.length]! }))
              .concat(total < 100 ? [{ label: "free", value: 100 - total, color: "var(--color-muted)" }] : [])}
          />
          {total > 100 && (
            <span
              className="absolute -top-1 -bottom-1 w-0.5 rounded bg-danger"
              style={{ left: `${(100 / total) * 100}%` }}
              title="100%"
              aria-hidden
            />
          )}
        </div>
        <div className="mt-3 flex flex-wrap items-center gap-x-5 gap-y-2 text-[13px]">
          {f.founders.map((p, i) => (
            <span key={p.id} className="flex items-center gap-1.5 text-ink-2">
              <span className="size-2 rounded-full" style={{ background: SHARE_COLORS[i % SHARE_COLORS.length] }} />
              {p.name} <span className="tabular text-ink-3">{p.share}%</span>
            </span>
          ))}
          <span className={cn("tabular ml-auto font-medium", Math.abs(total - 100) < 0.001 ? "text-success" : "text-warning")}>
            {Math.abs(total - 100) < 0.001 ? "100% allocated" : total < 100 ? `${(100 - total).toFixed(0)}% left to allocate` : `${(total - 100).toFixed(0)}% too much`}
          </span>
        </div>
        <div className="mt-4 flex items-start gap-2 rounded-lg bg-subtle px-3.5 py-3 text-[13px] text-ink-2">
          <UserRound className="mt-0.5 size-4 shrink-0 text-ink-3" />
          <span>
            <span className="font-medium text-ink">Beneficial owners</span>{" "}
            {Math.abs(total - 100) >= 0.001
              ? "are worked out once the shares add up to 100%."
              : `are declared automatically: ${owners.length ? owners.map((o) => `${o.name} (${o.share}%)`).join(", ") : "nobody owns 25% or more"}.`}
          </span>
        </div>
      </Fieldset>

      <Fieldset title="Who can act for the company?" description="How board members represent the company with banks, partners and authorities.">
        <Choicebox<Formation["representation"]>
          value={f.representation}
          onChange={(v) => set({ representation: v })}
          items={[
            { value: "alone", title: "Each board member alone", description: "Simplest for day-to-day banking. Approval rules still apply to payments." },
            { value: "joint", title: "Board members jointly", description: "The register's default. Agreements need every board member's signature." },
          ]}
        />
      </Fieldset>

      {eResident && (
        <Note tone="info" title="e-Residents verify remotely">
          They sign with their e-Residency card or Smart-ID and complete a 2-minute video check. No branch appointment needed.
        </Note>
      )}
    </div>
  );
}

// ───────────────────────── Capital & address ─────────────────────────

export function CapitalStep() {
  const { f, set } = useFormation();
  const [raw, setRaw] = useState(String(f.capital));
  const you = f.founders.find((p) => p.you);
  const min = 0.01 * f.founders.length;
  const big = f.capital > BANK_CERTIFICATE_THRESHOLD;

  return (
    <div className={stack}>
      <Fieldset
        title="Share capital"
        description={`At least €0.01 per shareholder (${money(min)} for ${f.founders.length} founders). It stays the company's money.`}
        footer={
          big
            ? "Over €50,000 is first paid into the state deposit account and returned to your company account after registration."
            : "Up to €50,000 no bank certificate is needed — board members confirm the contribution when they sign."
        }
      >
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
          <Input
            label="Total share capital"
            size="lg"
            inputMode="decimal"
            className="tabular"
            prefix={<span className="text-[15px]">€</span>}
            value={raw}
            wrapperClassName="sm:w-56"
            error={f.capital < min ? `Minimum is ${money(min)}` : undefined}
            onChange={(e) => {
              const v = e.target.value.replace(/[^\d.]/g, "");
              setRaw(v);
              set({ capital: Number(v) || 0 });
            }}
          />
          <div className="flex flex-wrap gap-1.5">
            {[min, 100, 2500, 10000].map((v) => (
              <button
                key={v}
                onClick={() => {
                  setRaw(String(v));
                  set({ capital: v });
                }}
                className={cn(
                  "tabular h-8 rounded-full px-3 text-[13px] transition-colors",
                  f.capital === v ? "bg-brown text-white" : "bg-subtle text-ink-2 hover:bg-muted",
                )}
              >
                {v === min ? `Minimum ${money(v)}` : money(v).replace(".00", "")}
              </button>
            ))}
          </div>
        </div>
        <ul className="mt-5 flex flex-col gap-2">
          {f.founders.map((p) => (
            <li key={p.id} className="flex items-center justify-between text-[13px]">
              <span className="text-ink-2">
                {p.name} <span className="text-ink-4">· {p.share}%</span>
              </span>
              <span className="tabular font-medium">{money((f.capital * p.share) / 100)}</span>
            </li>
          ))}
        </ul>
        {you && (
          <div className="mt-5 flex items-start justify-between gap-4 rounded-lg bg-subtle px-3.5 py-3">
            <div>
              <p className="text-sm font-medium">Pay my contribution automatically</p>
              <p className="mt-0.5 text-[13px] text-ink-3">
                {money((f.capital * you.share) / 100)} moves from Everyday account ••5685 to the company account the moment it opens. Other founders get a
                payment request.
              </p>
            </div>
            <Switch checked={f.payFromAccount} onChange={(v) => set({ payFromAccount: v })} label="Pay contribution automatically" />
          </div>
        )}
      </Fieldset>

      <Fieldset title="Registered address" description="Where official letters go. It must be in Estonia.">
        <Choicebox<Formation["address"]>
          value={f.address}
          onChange={(v) =>
            set({ address: v, addressLine: v === "own" ? "Kalasadama 4-12, 10415 Tallinn" : "Telliskivi 60a/3, 10412 Tallinn" })
          }
          items={[
            { value: "own", icon: <Home className="size-4" />, title: "My home address", description: "From the population register" },
            {
              value: "service",
              icon: <Building className="size-4" />,
              title: "Address service",
              description: "Partner virtual office with mail scanning",
              meta: <span className="tabular text-[12px] text-ink-3">€15/mo</span>,
            },
          ]}
        />
        <Input className="mt-3" wrapperClassName="mt-3" value={f.addressLine} onChange={(e) => set({ addressLine: e.target.value })} aria-label="Address" />
      </Fieldset>

      <Fieldset title="Tax registration" description="Sent to the Tax and Customs Board (EMTA) together with your application.">
        <div className="flex flex-col divide-y divide-line">
          <ToggleRow
            title="Register for VAT now"
            body={`Required within 3 working days once taxable sales exceed ${money(VAT_THRESHOLD).replace(".00", "")} a year. Voluntary before that.`}
            checked={f.vat}
            onChange={(v) => set({ vat: v })}
          />
          <ToggleRow
            title="Add employees to the employment register"
            body="Needed before anyone starts working, including paid board members. You can also do it later."
            checked={f.employees}
            onChange={(v) => set({ employees: v })}
          />
        </div>
      </Fieldset>
    </div>
  );
}

function ToggleRow({ title, body, checked, onChange }: { title: string; body: string; checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-start justify-between gap-4 py-3.5 first:pt-0 last:pb-0">
      <div>
        <p className="text-sm font-medium">{title}</p>
        <p className="mt-0.5 text-[13px] text-ink-3">{body}</p>
      </div>
      <Switch checked={checked} onChange={onChange} label={title} />
    </div>
  );
}

// ───────────────────────── Account (both modes) ─────────────────────────

function KycQuestions() {
  const { f, set } = useFormation();
  const show = f.attempted.includes("account") || f.attempted.includes("activity");
  return (
    <Fieldset
      error={show && !f.turnover && "Choose how much money you expect in a year."}
      title="Expected activity"
      description="Rough numbers are fine. You can update them any time."
      footer="Why we ask: the law requires us to know how business accounts are used. This replaces the separate questionnaire."
    >
      <p className="mb-2 text-[13px] font-medium text-ink-2">Money in per year</p>
      <Segmented value={f.turnover || "none"} onChange={(v) => set({ turnover: v })} items={turnoverBands.map((b) => ({ value: b.value, label: b.label }))} className="flex-wrap" />
      <p className="mt-5 mb-2 text-[13px] font-medium text-ink-2">Countries you’ll pay or get paid from</p>
      <div className="flex flex-wrap gap-1.5">
        {countryOptions.map((c) => {
          const on = f.countries.includes(c);
          return (
            <button
              key={c}
              onClick={() => set({ countries: on ? f.countries.filter((x) => x !== c) : [...f.countries, c] })}
              className={cn(
                "flex h-8 items-center gap-1.5 rounded-full px-3 text-[13px] transition-colors",
                on ? "bg-brown text-white" : "bg-subtle text-ink-2 hover:bg-muted",
              )}
            >
              {on ? <Check className="size-3.5" /> : <Globe2 className="size-3.5 text-ink-4" />}
              {c}
            </button>
          );
        })}
      </div>
      <div className="mt-5 flex items-center justify-between gap-4">
        <p className="text-sm">The company will handle cash</p>
        <Switch checked={f.cash} onChange={(v) => set({ cash: v })} label="Handles cash" />
      </div>
    </Fieldset>
  );
}

export function AccountStep() {
  const { f, set } = useFormation();
  const boardCount = f.mode === "existing" ? 1 : f.founders.filter((p) => p.board).length;
  const others = f.mode === "new" ? f.founders.filter((p) => !p.you && p.board) : [];

  return (
    <div className={stack}>
      <Fieldset title="Your business account">
        <ul className="grid gap-2.5 sm:grid-cols-2">
          {[
            "No monthly account fee",
            "1,000 free euro payments every month",
            "Debit cards free for the first year",
            "Roles, approvals and activity log included",
          ].map((x) => (
            <li key={x} className="flex items-center gap-2 text-sm">
              <span className="flex size-5 items-center justify-center rounded-full bg-success-soft text-success">
                <Check className="size-3" strokeWidth={3} />
              </span>
              {x}
            </li>
          ))}
        </ul>
      </Fieldset>

      {f.mode === "new" && <KycQuestions />}

      {others.length > 0 && (
        <Fieldset title="Access for other board members" description="They get an invitation once the account is open. You can change this later.">
          {others.map((p) => (
            <div key={p.id} className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <span className="flex items-center gap-2.5 text-sm font-medium">
                <Avatar name={p.name} size="md" />
                {p.name}
              </span>
              <Segmented<RoleId>
                size="sm"
                value={f.coFounderRole}
                onChange={(v) => set({ coFounderRole: v })}
                items={(["admin", "accountant", "viewer"] as RoleId[]).map((r) => ({ value: r, label: roleMeta[r].label }))}
              />
            </div>
          ))}
          <p className="mt-3 text-[13px] text-ink-3">
            {roleMeta[f.coFounderRole].label}: {roleMeta[f.coFounderRole].description}
          </p>
        </Fieldset>
      )}

      <Fieldset
        title="Payment approvals"
        description={
          boardCount < 2
            ? "You're the only board member, so your Smart-ID signature approves each payment."
            : "Applies to every outgoing payment. Whoever creates a payment can't also approve it."
        }
      >
        <Choicebox<Formation["approvalPreset"]>
          columns={1}
          value={effectivePreset(f)}
          onChange={(v) => set({ approvalPreset: v })}
          items={[
            {
              value: "single",
              title: "One signature per payment",
              description: boardCount < 2 ? "Your signature is the approval. Add a second board member later to require two." : "Any board member approves.",
            },
            {
              value: "second",
              title: "Second approval above €10,000",
              description: boardCount < 2 ? "Needs a second board member." : "Everyday payments need one approval, large ones need two.",
              disabled: boardCount < 2,
            },
            {
              value: "always",
              title: "Always two approvals",
              description: boardCount < 2 ? "Needs a second board member." : "Every payment is approved by two board members.",
              disabled: boardCount < 2,
            },
          ]}
        />
      </Fieldset>

      <Fieldset title="Cards and accounting">
        <div className="flex flex-col divide-y divide-line">
          <ToggleRow
            title="Virtual debit cards for board members"
            body="Ready in Apple Pay and Google Pay as soon as the account opens. Physical cards arrive in 3–5 working days. Free for the first year, then €2.00 per card per month."
            checked={f.cards}
            onChange={(v) => set({ cards: v })}
          />
          <div className="flex flex-col gap-3 py-3.5 last:pb-0 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-sm font-medium">Connect accounting</p>
              <p className="mt-0.5 text-[13px] text-ink-3">Transactions and receipts sync automatically.</p>
            </div>
            <Segmented<Formation["accounting"]>
              size="sm"
              value={f.accounting}
              onChange={(v) => set({ accounting: v })}
              items={[
                { value: "merit", label: "Merit" },
                { value: "smartaccounts", label: "SmartAccounts" },
                { value: "directo", label: "Directo" },
                { value: "later", label: "Later" },
              ]}
            />
          </div>
        </div>
      </Fieldset>
    </div>
  );
}

// ───────────────────────── Existing company ─────────────────────────

export function LookupStep() {
  const { f, set } = useFormation();
  const [code, setCode] = useState(f.existingCode);
  const [searched, setSearched] = useState(!!f.existingCode);
  const [loading, setLoading] = useState(false);
  const company = registryLookup[f.existingCode];

  const search = () => {
    setLoading(true);
    window.setTimeout(() => {
      setLoading(false);
      setSearched(true);
      const hit = registryLookup[code];
      set({ existingCode: hit ? code : "", name: hit ? hit.name.replace(/ OÜ$/, "") : f.name });
    }, 700);
  };

  return (
    <div className={stack}>
      <Fieldset title="Registry code" description="8 digits, shown on the company's e-Business Register page.">
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={(e) => {
            e.preventDefault();
            if (code.length === 8) search();
          }}
        >
          <Input
            size="lg"
            mono
            inputMode="numeric"
            placeholder="16520417"
            value={code}
            wrapperClassName="sm:w-64"
            onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 8))}
          />
          <Button type="submit" variant="primary" size="lg" loading={loading} disabled={code.length !== 8}>
            Find company
          </Button>
        </form>
        {!searched && <p className="mt-2 text-[12px] text-ink-3">Demo: try 16520417</p>}
        {searched && !company && !loading && (
          <p className="mt-3 flex items-center gap-1.5 text-[13px] text-danger">
            <X className="size-4" /> Couldn’t find {code} in the e-Business Register. Check the code and try again.
          </p>
        )}
      </Fieldset>

      {company && (
        <section className="animate-pop-in rounded-xl bg-surface shadow-card">
          <div className="flex items-start justify-between gap-4 border-b border-line p-5 sm:p-6">
            <div>
              <h2 className="text-lg font-semibold tracking-[-0.02em]">{company.name}</h2>
              <p className="font-mono text-[12px] text-ink-3">{company.code}</p>
            </div>
            <Badge tone="success" icon={<CircleCheck className="size-3" />}>
              {company.status}
            </Badge>
          </div>
          <dl className="grid gap-x-8 gap-y-4 p-5 text-sm sm:grid-cols-2 sm:p-6">
            {[
              ["Registered", "19 Aug 2022"],
              ["Address", company.address],
              ["Principal activity", company.emtak],
              ["Share capital", money(company.capital)],
              ["Board", company.board.map((b) => b.name).join(", ")],
              ["Shareholders", company.owners.map((o) => `${o.name} ${o.share}%`).join(", ")],
            ].map(([k, v]) => (
              <div key={k}>
                <dt className="text-[12px] text-ink-3">{k}</dt>
                <dd className="mt-0.5">{v}</dd>
              </div>
            ))}
          </dl>
          <div className="flex flex-wrap items-center justify-between gap-2 rounded-b-xl border-t border-line bg-canvas px-5 py-3 text-[13px] text-ink-3 sm:px-6">
            <span className="flex items-center gap-1.5">
              <Badge size="xs" tone="gray">
                From e-Business Register
              </Badge>
              fetched {fmtTime(NOW.toISOString())}
            </span>
            <span className="flex items-center gap-1.5 text-success">
              <CircleCheck className="size-3.5" /> You’re the sole board member — you can open the account alone.
            </span>
          </div>
        </section>
      )}
    </div>
  );
}

export function ActivityStep() {
  const { f, set } = useFormation();
  return (
    <div className={stack}>
      <Fieldset
        title="What does the company do?"
        description="Pre-filled activity: 74102 — Graphic design. Describe it in your own words."
        error={f.attempted.includes("activity") && f.description.trim().length < 40 && "Write at least 40 characters."}
      >
        <Textarea
          rows={4}
          placeholder="e.g. Brand identities and packaging design for food producers in Estonia and Finland."
          value={f.description}
          onChange={(e) => set({ description: e.target.value })}
        />
        <p className={cn("tabular mt-1.5 text-right text-[12px]", f.description.trim().length >= 40 ? "text-success" : "text-ink-4")}>
          {f.description.trim().length} / 40 characters minimum
        </p>
      </Fieldset>
      <KycQuestions />
    </div>
  );
}

// ───────────────────────── Review & sign ─────────────────────────

export function ReviewStep({ onEdit }: { onEdit: (id: string) => void }) {
  const { f, set } = useFormation();
  const yourMethod = useStore().state.session.method;
  const [signing, setSigning] = useState(false);
  const isNew = f.mode === "new";
  const company = registryLookup[f.existingCode];
  const name = isNew ? `${f.name.trim().replace(/\s*OÜ$/i, "")} OÜ` : (company?.name ?? "");
  const signers = isNew ? f.founders : f.founders.filter((p) => p.you);
  const you = f.founders.find((p) => p.you)!;
  const youSigned = f.signed.includes(you.id);
  const boardCount = isNew ? f.founders.filter((p) => p.board).length : 1;

  // Other founders sign from their own phones after Mari — simulated with a short delay.
  const pending = signers.filter((p) => !f.signed.includes(p.id));
  const signedRef = useRef(f.signed);
  useEffect(() => {
    signedRef.current = f.signed;
  });
  useEffect(() => {
    if (!youSigned || pending.length === 0) return;
    const next = pending[0]!;
    const t = window.setTimeout(() => set({ signed: [...signedRef.current, next.id] }), 2600);
    return () => window.clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [youSigned, pending.length]);

  const yourCapital = (f.capital * you.share) / 100;

  return (
    <div className={stack}>
      <section className="rounded-xl bg-surface shadow-card">
        <div className="flex items-center gap-3 border-b border-line p-5 sm:p-6">
          <span className="flex size-11 items-center justify-center rounded-lg bg-brown text-lg font-semibold text-white">{name.slice(0, 1)}</span>
          <div>
            <h2 className="text-lg font-semibold tracking-[-0.02em]">{name}</h2>
            <p className="text-[13px] text-ink-3">{isNew ? "Private limited company · new registration" : `Registry code ${company?.code}`}</p>
          </div>
        </div>
        <div className="divide-y divide-line">
          {isNew ? (
            <>
              <ReviewRow title="Name & activity" onEdit={() => onEdit("company")}>
                {f.emtak?.code} {f.emtak?.label} · financial year = calendar year
              </ReviewRow>
              <ReviewRow title="Founders & board" onEdit={() => onEdit("people")}>
                {f.founders.map((p) => `${p.name} ${p.share}%${p.board ? " (board)" : ""}`).join(" · ")} ·{" "}
                {f.representation === "alone" ? "each board member acts alone" : "board acts jointly"}
              </ReviewRow>
              <ReviewRow title="Capital & address" onEdit={() => onEdit("capital")}>
                {money(f.capital)} share capital · {f.addressLine}
                {f.vat ? " · VAT registration" : ""}
                {f.employees ? " · employment register" : ""}
              </ReviewRow>
            </>
          ) : (
            <ReviewRow title="Company" onEdit={() => onEdit("lookup")}>
              {company?.emtak} · {company?.address}
            </ReviewRow>
          )}
          <ReviewRow title="Business account" onEdit={() => onEdit("account")}>
            {effectivePreset(f) === "single" ? "One signature per payment" : effectivePreset(f) === "second" ? "Second approval above €10,000" : "Always two approvals"}
            {f.cards ? ` · ${boardCount} virtual card${boardCount > 1 ? "s" : ""}` : ""}
            {f.accounting !== "later" ? ` · ${f.accounting === "merit" ? "Merit Aktiva" : f.accounting === "smartaccounts" ? "SmartAccounts" : "Directo"}` : ""}
          </ReviewRow>
        </div>
      </section>

      <Fieldset title="Every cost, up front">
        <FeeBreakdown
          rows={[
            ...(isNew
              ? [{ label: "State fee · e-Business Register", value: money(STATE_FEE), hint: "Paid to the Centre of Registers and Information Systems, not to Swedbank." }]
              : []),
            { label: "Opening the business account", value: "€0.00", tone: "success" as const },
            { label: "Monthly account fee", value: "€0.00", tone: "success" as const },
            ...(f.cards
              ? [{ label: `Debit cards (${boardCount})`, value: "€0.00", hint: "Free for 12 months, then €2.00 per card per month.", tone: "success" as const }]
              : []),
            ...(isNew
              ? [{ label: "Your share capital", value: money(yourCapital), hint: "Moves to the company account — it isn't a fee.", tone: "muted" as const }]
              : []),
          ]}
          total={{ label: "Due today", value: money(isNew ? STATE_FEE : 0) }}
          arrival={isNew ? "Paid from Everyday account ••5685 when you submit · the registrar usually decides within one working day" : "We tell you if we need anything else"}
        />
      </Fieldset>

      <Fieldset
        title="Signatures"
        description={isNew ? `${f.signed.length} of ${signers.length} signed` : "Sign once to submit"}
      >
        <ul className="flex flex-col divide-y divide-line">
          {signers.map((p) => {
            const done = f.signed.includes(p.id);
            const waiting = !done && !p.you && youSigned;
            return (
              <li key={p.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <Avatar name={p.name} size="md" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium">
                    {p.name}
                    {p.you && <span className="text-ink-3"> (you)</span>}
                  </p>
                  <p className="text-[12px] text-ink-3">
                    {done
                      ? `Signed with ${p.you ? yourMethod : p.residency === "e-Resident" ? "e-Residency card" : "Smart-ID"} · ${fmtTime(NOW.toISOString())}`
                      : p.you
                        ? `Signs with ${yourMethod}`
                        : waiting
                          ? `Request sent to their Smart-ID app and ${p.email}`
                          : "Gets a signing request after you sign"}
                  </p>
                </div>
                {done ? (
                  <Badge tone="success" icon={<Check className="size-3" />}>
                    Signed
                  </Badge>
                ) : p.you ? (
                  <Button variant="primary" leading={<Pencil className="size-3.5" />} onClick={() => setSigning(true)}>
                    Sign application
                  </Button>
                ) : waiting ? (
                  <span className="flex items-center gap-1.5 text-[13px] text-warning">
                    <Spinner className="size-3.5" />
                    Waiting
                  </span>
                ) : (
                  <Badge tone="gray">Not yet</Badge>
                )}
              </li>
            );
          })}
        </ul>
      </Fieldset>

      <SmartIdModal
        open={signing}
        onClose={() => setSigning(false)}
        onConfirmed={() => {
          setSigning(false);
          set({ signed: [...f.signed, you.id] });
        }}
        action={isNew ? `Founding application for ${name}` : `Business account application for ${name}`}
        details={
          isNew
            ? [
                { label: "Filed with", value: "e-Business Register" },
                { label: "Share capital", value: money(f.capital) },
                { label: "Your share", value: `${you.share}% · ${money(yourCapital)}` },
                { label: "State fee", value: money(STATE_FEE) },
              ]
            : [
                { label: "Registry code", value: company?.code ?? "" },
                { label: "Account fee", value: "€0.00 / month" },
              ]
        }
      />
    </div>
  );
}

function ReviewRow({ title, children, onEdit }: { title: string; children: ReactNode; onEdit: () => void }) {
  return (
    <div className="flex items-start justify-between gap-4 px-5 py-4 sm:px-6">
      <div className="min-w-0">
        <p className="text-[13px] font-medium text-ink-2">{title}</p>
        <p className="mt-0.5 text-sm text-ink">{children}</p>
      </div>
      <Button size="sm" variant="tertiary" onClick={onEdit}>
        Edit
      </Button>
    </div>
  );
}
