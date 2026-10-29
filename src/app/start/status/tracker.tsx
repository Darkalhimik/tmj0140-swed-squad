"use client";

import { ArrowRight, Check, ChevronDown, Download, FastForward, Phone, RotateCcw, X } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { CopyRow } from "@/components/banking/account-modals";
import { BankCard } from "@/components/banking/bank-card";
import { Badge } from "@/components/ui/badge";
import { Button, ButtonLink } from "@/components/ui/button";
import { EmptyState } from "@/components/ui/misc";
import { Spinner } from "@/components/ui/spinner";
import { StatusDot } from "@/components/ui/status-dot";
import { useToast } from "@/components/ui/toast";
import { roleMeta } from "@/lib/data/business";
import { effectivePreset, NEW_COMPANY, registryLookup, STATE_FEE } from "@/lib/data/formation";
import { cn } from "@/lib/cn";
import { accountAgreementPdf, foundingDocumentsPdf } from "@/lib/export/pdf";
import { iban as fmtIban, money, NOW } from "@/lib/format";
import { useStore, type Formation } from "@/lib/store";
import type { Card } from "@/lib/types";

type Row = { id: string; label: string; detail: string; ms: number; log: string[]; slow?: boolean };

const NEW_IBAN = NEW_COMPANY.iban;
const NEW_CODE = NEW_COMPANY.registryCode;
const APP_REF = NEW_COMPANY.appRef;

function clock(offsetSec: number) {
  const d = new Date(NOW.getTime() + offsetSec * 1000);
  return new Intl.DateTimeFormat("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit", timeZone: "Europe/Tallinn" }).format(d);
}

function rowsFor(f: Formation, name: string, method: string): Row[] {
  const you = f.founders.find((p) => p.you)!;
  const others = f.founders.filter((p) => !p.you);
  const yourCapital = (f.capital * you.share) / 100;
  if (f.mode === "existing") {
    const c = registryLookup[f.existingCode];
    return [
      { id: "signed", label: "Application signed", detail: `Mari Tamm · ${method}`, ms: 500, log: [`${clock(1)}  Mari Tamm signed with ${method} (PIN2)`] },
      { id: "registry", label: "Company verified with the e-Business Register", detail: `${c?.code} · ${c?.status}`, ms: 900, log: [`${clock(2)}  Registry data matches application`, `${clock(2)}  Board: Mari Tamm · Shareholders: Mari Tamm 100%`] },
      { id: "screening", label: "Owners screened", detail: "Sanctions and PEP lists · no matches", ms: 1400, log: [`${clock(3)}  1 person screened against EU, UN and OFAC lists`, `${clock(4)}  No matches`] },
      { id: "risk", label: "Risk review", detail: "Approved automatically — nothing else needed from you", ms: 1800, log: [`${clock(5)}  Activity, countries and turnover within standard profile`, `${clock(6)}  Decision: approved`] },
      { id: "account", label: "Business account opened", detail: fmtIban(NEW_IBAN), ms: 1000, log: [`${clock(7)}  IBAN ${fmtIban(NEW_IBAN)} · BIC HABAEE2X`, `${clock(7)}  Digital Services Agreement signed as part of your application`] },
      { id: "cards", label: "Virtual card issued", detail: "Visa Business Debit ••2208 · free for 12 months", ms: 800, log: [`${clock(8)}  Card ••2208 ready to add to Apple Pay or Google Pay`, `${clock(8)}  Physical card ordered · arrives in 3–5 working days`] },
    ];
  }
  return [
    {
      id: "signed",
      label: `Application signed by ${f.founders.length} founder${f.founders.length > 1 ? "s" : ""}`,
      detail: f.founders.map((p) => p.name).join(", "),
      ms: 500,
      log: f.founders.map((p, i) => `${clock(1 + i * 3)}  ${p.name} signed with ${p.you ? method : p.residency === "e-Resident" ? "e-Residency card" : "Smart-ID"} (PIN2)`),
    },
    {
      id: "fee",
      label: `State fee ${money(STATE_FEE)} paid`,
      detail: "From Everyday account ••5685",
      ms: 1100,
      log: [`${clock(7)}  Payment ${money(STATE_FEE)} to the Ministry of Finance · ref. 2900082743`, `${clock(8)}  Treasury confirmed receipt`],
    },
    {
      id: "submitted",
      label: "Submitted to the e-Business Register",
      detail: `Application ${APP_REF}`,
      ms: 900,
      log: [
        `${clock(9)}  Application ${APP_REF} created`,
        `${clock(9)}  Articles of association generated from the standard template`,
        `${clock(10)}  Beneficial owners declared: ${f.founders.filter((p) => p.share >= 25).map((p) => `${p.name} ${p.share}%`).join(", ")}`,
      ],
    },
    {
      id: "review",
      label: "Registrar review",
      detail: "Usually within one working day (RIK). We'll notify you in the app and by email.",
      ms: 5200,
      slow: true,
      log: [`${clock(11)}  In the registrar's queue`, `${clock(12)}  Assigned to a registrar`, `${clock(13)}  Entered into the register without changes`],
    },
    { id: "code", label: "Registry code assigned", detail: NEW_CODE, ms: 600, log: [`${clock(14)}  ${name} · registry code ${NEW_CODE}`] },
    {
      id: "account",
      label: "Business account opened",
      detail: fmtIban(NEW_IBAN),
      ms: 1000,
      log: [
        `${clock(15)}  IBAN ${fmtIban(NEW_IBAN)} · BIC HABAEE2X`,
        `${clock(15)}  Approval rule: ${effectivePreset(f) === "second" ? "second approval above €10,000" : effectivePreset(f) === "always" ? "two approvals for every payment" : "one approval per payment"}`,
        ...others.filter((p) => p.board).map((p) => `${clock(16)}  ${p.name} invited as ${roleMeta[f.coFounderRole].label}`),
      ],
    },
    {
      id: "capital",
      label: "Share capital paid in",
      detail: f.payFromAccount ? `${money(yourCapital)} from you${others.length ? ` · ${others.length} payment request${others.length > 1 ? "s" : ""} sent` : ""}` : "Waiting for founders to pay in",
      ms: 900,
      log: [
        f.payFromAccount ? `${clock(17)}  ${money(yourCapital)} moved from Everyday account ••5685` : `${clock(17)}  Contribution reminder sent to you`,
        ...others.map((p) => `${clock(17)}  Payment request ${money((f.capital * p.share) / 100)} sent to ${p.name}`),
      ],
    },
    ...(f.cards
      ? [
          {
            id: "cards",
            label: "Virtual cards issued",
            detail: `${f.founders.filter((p) => p.board).length} cards · free for 12 months`,
            ms: 800,
            log: f.founders.filter((p) => p.board).map((p, i) => `${clock(18)}  Visa Business Debit ••${["2208", "6715", "4410"][i] ?? "9001"} for ${p.name}`),
          },
        ]
      : []),
    {
      id: "emta",
      label: "Tax and Customs Board notified",
      detail: f.vat ? "VAT number requested" : "Registered automatically · no VAT requested",
      ms: 1000,
      log: [
        `${clock(19)}  Company visible to EMTA automatically`,
        f.vat ? `${clock(19)}  VAT registration application forwarded` : `${clock(19)}  Reminder set: VAT is required once sales exceed €40,000 a year`,
        ...(f.employees ? [`${clock(20)}  Employment register opened for new entries`] : []),
      ],
    },
  ];
}

export function Tracker() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const toast = useToast();
  const f = state.formation;
  const [progress, setProgress] = useState(0);
  const [open, setOpen] = useState<string | null>(null);
  const [rated, setRated] = useState(false);

  const isNew = f.mode === "new";
  const name = isNew ? `${f.name.trim().replace(/\s*OÜ$/i, "") || "Põhjatuul Labs"} OÜ` : (registryLookup[f.existingCode]?.name ?? "Your company");
  const method = state.session.method;
  const rows = useMemo(() => (f.submittedAt ? rowsFor(f, name, method) : []), [f, name, method]);
  const done = rows.length > 0 && progress >= rows.length;

  // The moment registration finishes, the company exists in the bank: it appears in the
  // profile switcher with its account, cards, people and rules from this application.
  useEffect(() => {
    if (done) dispatch({ type: "formation/complete" });
  }, [done, dispatch]);

  useEffect(() => {
    if (!f.submittedAt || progress >= rows.length) return;
    const t = window.setTimeout(() => setProgress((p) => p + 1), rows[progress]!.ms);
    return () => window.clearTimeout(t);
  }, [progress, rows, f.submittedAt]);

  useEffect(() => {
    if (!f.submittedAt) return;
    document.title = done ? `${name} is ready · Swedbank concept by SWED SQUAD` : `${rows[progress]?.label ?? "Working"}… · Swedbank concept by SWED SQUAD`;
  }, [done, progress, rows, name, f.submittedAt]);

  if (!f.submittedAt) {
    return (
      <div className="mx-auto max-w-[720px] px-4 py-16">
        <EmptyState
          title="No application yet"
          description="Start a new company or add one you already own. Your progress is saved as you go."
          action={<ButtonLink href="/start" variant="primary">Start a company</ButtonLink>}
        />
      </div>
    );
  }

  const card: Card = {
    id: "new",
    name: "Visa Business",
    holder: "MARI TAMM",
    last4: "2208",
    kind: "virtual",
    network: "Visa",
    design: "orange",
    expiry: "10/30",
    frozen: false,
    limits: [],
    settings: { online: true, contactless: true, abroad: false, atm: false },
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 py-8 lg:px-8 lg:py-10">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <div className="flex items-center gap-2">
            {done ? (
              <Badge tone="success" icon={<Check className="size-3" />}>
                {isNew ? "Registered" : "Approved"}
              </Badge>
            ) : (
              <Badge tone="warning">
                <StatusDot status="pending" pulse className="text-warning" />
                In progress
              </Badge>
            )}
            <span className="font-mono text-[12px] text-ink-3">{isNew ? `Application ${APP_REF}` : `Registry code ${f.existingCode}`}</span>
          </div>
          <h1 className="font-display mt-2 text-[28px] leading-9 font-semibold tracking-[-0.015em]">
            {done ? `${name} is ready` : isNew ? `Registering ${name}` : `Opening an account for ${name}`}
          </h1>
          <p className="mt-1 text-[15px] text-ink-3">
            {done
              ? "Your account is open and your cards work. Here's what to do next."
              : "Nothing for you to do right now. You can close this page — we'll notify you in the app and by email."}
          </p>
        </div>
        {!done && rows[progress]?.slow && (
          <Button variant="secondary" leading={<FastForward className="size-4" />} onClick={() => setProgress((p) => p + 1)}>
            Skip the wait (demo)
          </Button>
        )}
      </div>

      <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_340px]">
        {/* Live checklist */}
        <section className="overflow-hidden rounded-xl bg-surface shadow-card">
          <div className="flex items-center justify-between border-b border-line px-5 py-3">
            <p className="text-sm font-medium">Progress</p>
            <p className="tabular text-[13px] text-ink-3">
              {Math.min(progress, rows.length)} of {rows.length} steps
            </p>
          </div>
          <div className="h-1 bg-muted">
            <div className="h-full bg-brand transition-[width] duration-700 ease-out" style={{ width: `${(Math.min(progress, rows.length) / rows.length) * 100}%` }} />
          </div>
          <ol>
            {rows.map((r, i) => {
              const state = i < progress ? "done" : i === progress ? "running" : "todo";
              const expanded = open === r.id || (state === "running" && open === null);
              return (
                <li key={r.id} className="border-b border-line last:border-0">
                  <button
                    disabled={state === "todo"}
                    onClick={() => setOpen(expanded ? (state === "running" ? "__none" : null) : r.id)}
                    className="flex w-full items-center gap-3 px-5 py-3.5 text-left transition-colors enabled:hover:bg-subtle/60"
                  >
                    <span
                      className={cn(
                        "flex size-5 shrink-0 items-center justify-center rounded-full",
                        state === "done" && "bg-success text-white",
                        state === "running" && "text-brand",
                        state === "todo" && "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]",
                      )}
                    >
                      {state === "done" && <Check className="size-3" strokeWidth={3} />}
                      {state === "running" && <Spinner className="size-4" />}
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className={cn("block text-sm", state === "todo" ? "text-ink-4" : "font-medium text-ink")}>
                        {r.label}
                        {state === "running" && "…"}
                      </span>
                      {state !== "todo" && <span className="block truncate text-[12px] text-ink-3">{r.detail}</span>}
                    </span>
                    {state === "done" && <span className="tabular font-mono text-[12px] text-ink-4">{(r.ms / 1000).toFixed(1)}s</span>}
                    {state !== "todo" && <ChevronDown className={cn("size-4 text-ink-4 transition-transform", expanded && "rotate-180")} />}
                  </button>
                  {expanded && state !== "todo" && (
                    <div className="animate-fade-in border-t border-line bg-canvas px-5 py-3 pl-[52px]">
                      {r.log.slice(0, state === "done" ? undefined : 1).map((l) => (
                        <p key={l} className="font-mono text-[12px] leading-6 text-ink-2">
                          {l}
                        </p>
                      ))}
                      {state === "running" && r.slow && (
                        <p className="mt-1 text-[12px] text-ink-3">Fast-forwarded in this demo. In reality this usually takes up to one working day.</p>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ol>
        </section>

        {/* Side panel */}
        <aside className="flex flex-col gap-4">
          {done ? (
            <section className="animate-pop-in rounded-xl bg-surface p-5 shadow-card">
              <p className="text-sm font-semibold">Your new account</p>
              <div className="mt-4 flex justify-center">
                <BankCard card={card} size="md" className="w-full max-w-[300px]" />
              </div>
              <div className="mt-3 divide-y divide-line">
                {isNew && <CopyRow label="Registry code" value={NEW_CODE} />}
                <CopyRow label="IBAN" value={fmtIban(NEW_IBAN)} />
              </div>
              <Button
                variant="brand"
                size="lg"
                className="mt-4 w-full"
                trailing={<ArrowRight className="size-5" />}
                onClick={() => {
                  // Idempotent: creates the company once, afterwards just switches to it.
                  dispatch({ type: "formation/complete" });
                  router.push("/business");
                }}
              >
                Open {name.replace(/ OÜ$/, "")}
              </Button>
              <Button
                className="mt-2 w-full"
                variant="secondary"
                leading={<Download className="size-4" />}
                onClick={async () => {
                  const slug = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
                  const filename = isNew ? `${slug}-founding-documents.pdf` : `${slug}-account-agreement.pdf`;
                  if (isNew) {
                    await foundingDocumentsPdf({
                      filename,
                      name,
                      registryCode: NEW_CODE,
                      appRef: APP_REF,
                      address: f.addressLine,
                      activity: f.emtak ? `${f.emtak.code} — ${f.emtak.label}` : "—",
                      capital: f.capital,
                      founders: f.founders.map((p) => ({ name: p.name, idCode: p.idCode, share: p.share, board: p.board })),
                      representation:
                        f.representation === "alone" ? "Each board member may represent the company alone" : "Board members represent the company jointly",
                      iban: NEW_IBAN,
                      vat: f.vat,
                    });
                  } else {
                    await accountAgreementPdf({ filename, company: name, registryCode: f.existingCode, iban: NEW_IBAN, signer: "Mari Tamm" });
                  }
                  toast({ title: "Documents downloaded", description: filename });
                }}
              >
                {isNew ? "Download founding documents" : "Download agreement"}
              </Button>
            </section>
          ) : (
            <section className="rounded-xl bg-surface p-5 shadow-card">
              <p className="text-sm font-semibold">While you wait</p>
              <p className="mt-1 text-[13px] text-ink-3">Set up now; it goes live when the account opens.</p>
              <ul className="mt-4 flex flex-col gap-3 text-[13px]">
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 text-success" />
                  <span>
                    Approval rule set:{" "}
                    {effectivePreset(f) === "second" ? "second approval above €10,000" : effectivePreset(f) === "always" ? "two approvals always" : "one approval"}
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <Check className="mt-0.5 size-4 text-success" />
                  <span>{f.accounting === "later" ? "Accounting: connect later" : `Accounting: ${f.accounting === "merit" ? "Merit Aktiva" : f.accounting === "smartaccounts" ? "SmartAccounts" : "Directo"} connects on opening`}</span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="mt-1.5 size-2 shrink-0 rounded-full bg-ink-4" />
                  <span>Invite your accountant — the invitation is queued and sent on opening.</span>
                </li>
              </ul>
            </section>
          )}

          {done && isNew && (
            <section className="rounded-xl bg-surface p-5 shadow-card">
              <p className="text-sm font-semibold">Next steps for a new OÜ</p>
              <ul className="mt-3 flex flex-col divide-y divide-line text-[13px]">
                {[
                  { t: f.vat ? "VAT number requested" : "Register for VAT", d: f.vat ? "EMTA confirms within 5 working days" : "Within 3 working days once sales pass €40,000 a year", ok: f.vat },
                  { t: "Employment register", d: "Add people before they start working", ok: f.employees },
                  { t: "Share capital", d: f.payFromAccount ? "Your part is paid in" : "Pay in and confirm", ok: f.payFromAccount },
                  { t: "Annual report", d: "Due by 30 June 2027 in e-Business Register", ok: false },
                ].map((x) => (
                  <li key={x.t} className="flex items-start gap-2.5 py-2.5 first:pt-0 last:pb-0">
                    <span className={cn("mt-0.5 flex size-4 shrink-0 items-center justify-center rounded-full", x.ok ? "bg-success text-white" : "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]")}>
                      {x.ok && <Check className="size-2.5" strokeWidth={3} />}
                    </span>
                    <span>
                      <span className="block font-medium text-ink">{x.t}</span>
                      <span className="text-ink-3">{x.d}</span>
                    </span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <section className="rounded-xl bg-surface p-5 text-[13px] shadow-card">
            <p className="font-medium">Questions?</p>
            <p className="mt-1 text-ink-3">Call business support and mention your reference.</p>
            <a href="tel:+3726132222" className="mt-3 inline-flex items-center gap-1.5 font-medium text-teal hover:underline">
              <Phone className="size-3.5" /> 613 2222
            </a>
            <span className="ml-2 font-mono text-[12px] text-ink-3">{isNew ? APP_REF : f.existingCode}</span>
          </section>
        </aside>
      </div>

      {done && (
        <div className="mt-6 flex flex-col items-start justify-between gap-4 rounded-xl bg-surface p-5 shadow-card sm:flex-row sm:items-center">
          <p className="text-sm font-medium">{rated ? "Thanks — feedback sent." : "How did opening your company go?"}</p>
          {!rated && (
            <div className="flex gap-1.5">
              {["Hard", "Okay", "Easy", "Loved it"].map((x) => (
                <Button key={x} size="sm" variant="secondary" onClick={() => setRated(true)}>
                  {x}
                </Button>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="mt-8 flex justify-center">
        <button
          onClick={() => {
            dispatch({ type: "formation/reset" });
            router.push("/start");
          }}
          className="inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink"
        >
          <RotateCcw className="size-3.5" /> Start over (demo)
        </button>
        <Link href="/personal" className="ml-5 inline-flex items-center gap-1.5 text-[13px] text-ink-3 hover:text-ink">
          <X className="size-3.5" /> Back to personal
        </Link>
      </div>
    </div>
  );
}
