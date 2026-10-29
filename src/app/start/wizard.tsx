"use client";

import { ArrowLeft, ArrowRight, Building2, Check, FileSearch, ShieldCheck } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Choicebox } from "@/components/ui/choicebox";
import { Note } from "@/components/ui/misc";
import { checkName, registryLookup, STATE_FEE } from "@/lib/data/formation";
import { cn } from "@/lib/cn";
import { money, NOW } from "@/lib/format";
import { useStore, type Formation } from "@/lib/store";
import { AccountStep, ActivityStep, CapitalStep, CompanyStep, LookupStep, PeopleStep, ReviewStep } from "./steps";

type StepDef = { id: string; title: string; description: string };

export const NEW_STEPS: StepDef[] = [
  { id: "company", title: "Name & activity", description: "What your company is called and what it does." },
  { id: "people", title: "Founders & board", description: "Who owns the company and who represents it." },
  { id: "capital", title: "Capital & address", description: "Share capital, registered address and tax options." },
  { id: "account", title: "Business account", description: "How you'll use the account, who gets access and cards." },
  { id: "review", title: "Review & sign", description: "Check everything, see every cost, and sign." },
];

export const EXISTING_STEPS: StepDef[] = [
  { id: "lookup", title: "Find your company", description: "We fill in everything we can from the e-Business Register." },
  { id: "activity", title: "How you'll use it", description: "A few questions we're required to ask every company." },
  { id: "account", title: "Access & cards", description: "Who gets access, approval rules and cards." },
  { id: "review", title: "Review & sign", description: "Check everything and sign." },
];

export function stepValid(id: string, f: Formation): boolean {
  switch (id) {
    case "company": {
      const s = checkName(f.name).status;
      return (s === "available" || s === "similar") && !!f.emtak && f.description.trim().length >= 40;
    }
    case "people": {
      const total = f.founders.reduce((s, p) => s + (Number(p.share) || 0), 0);
      return (
        Math.abs(total - 100) < 0.001 &&
        f.founders.some((p) => p.board) &&
        f.founders.every((p) => p.name.trim().length > 2 && /^\d{11}$/.test(p.idCode))
      );
    }
    case "capital":
      return f.capital >= 0.01 * f.founders.length && f.addressLine.trim().length > 5;
    case "lookup":
      return !!registryLookup[f.existingCode];
    case "activity":
      return !!f.turnover && f.description.trim().length >= 40;
    case "account":
      return f.mode === "existing" ? true : !!f.turnover;
    case "review":
      return f.signed.length >= (f.mode === "existing" ? 1 : f.founders.length);
  }
  return true;
}

export function Wizard() {
  const { state, dispatch } = useStore();
  const router = useRouter();
  const params = useSearchParams();
  const f = state.formation;
  const set = (patch: Partial<Formation>) => dispatch({ type: "formation/set", patch });
  const [choice, setChoice] = useState<"new" | "existing">(() => (params.get("mode") === "existing" ? "existing" : "new"));

  if (!f.mode) {
    return (
      <div className="mx-auto max-w-[880px] px-4 py-10 lg:px-8 lg:py-14">
        <Badge tone="gray" icon={<ShieldCheck className="size-3" />}>
          Signed in as Mari Tamm · {state.session.method}
        </Badge>
        <h1 className="font-display mt-4 text-[32px] leading-10 font-semibold tracking-[-0.015em]">Start a company with Swedbank</h1>
        <p className="mt-2 max-w-xl text-[15px] text-ink-3">
          Register with the e-Business Register and open the account in one flow.
        </p>
        <Choicebox<"new" | "existing">
          className="mt-8"
          value={choice}
          onChange={setChoice}
          items={[
            {
              value: "new",
              icon: <Building2 className="size-4" />,
              title: "Register a new company (OÜ)",
              description: "Name check, founders, capital and signing in one place. The registrar usually decides within one working day.",
            },
            {
              value: "existing",
              icon: <FileSearch className="size-4" />,
              title: "Add a company you already own",
              description: "Enter the registry code and we fill in the details from the e-Business Register.",
            },
          ]}
        />
        <div className="mt-6 grid gap-3 rounded-xl bg-surface p-5 shadow-card sm:grid-cols-3">
          {(choice === "new"
            ? [
                { k: "State fee", v: money(STATE_FEE), d: "Paid to the e-Business Register" },
                { k: "Swedbank fees", v: "€0.00", d: "No monthly fee · debit cards free for a year" },
                { k: "Share capital", v: "From €0.01", d: "Per shareholder · stays your money" },
              ]
            : [
                { k: "Opening the account", v: "€0.00", d: "No monthly account fee" },
                { k: "Euro payments", v: "1,000 free", d: "Every month, then €0.38" },
                { k: "Signing", v: "Online", d: "Smart-ID, Mobile-ID or ID-card · no branch visit" },
              ]
          ).map((x) => (
            <div key={x.k}>
              <p className="text-[12px] text-ink-3">{x.k}</p>
              <p className="tabular mt-0.5 text-lg font-semibold tracking-[-0.02em]">{x.v}</p>
              <p className="text-[12px] text-ink-3">{x.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-8 flex items-center justify-between gap-4">
          <p className="text-[13px] text-ink-3">Your progress is saved as you go.</p>
          <Button variant="primary" size="lg" trailing={<ArrowRight className="size-4" />} onClick={() => set({ mode: choice, step: 0, furthest: 0 })}>
            Get started
          </Button>
        </div>
      </div>
    );
  }

  const steps = f.mode === "new" ? NEW_STEPS : EXISTING_STEPS;
  const step = steps[f.step]!;
  const last = f.step === steps.length - 1;
  const valid = stepValid(step.id, f);
  const attempted = f.attempted.includes(step.id);
  const tryContinue = () => {
    if (valid) return go(f.step + 1);
    if (!attempted) set({ attempted: [...f.attempted, step.id] });
    // Let the highlighted state render, then bring the first problem into view.
    window.setTimeout(() => {
      const el = document.querySelector<HTMLElement>("[data-invalid='true'], [aria-invalid='true']");
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
      el?.querySelector<HTMLElement>("input, textarea, button")?.focus({ preventScroll: true });
    }, 50);
  };
  const go = (i: number) => {
    set({ step: i, furthest: Math.max(f.furthest, i) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="mx-auto max-w-[1120px] px-4 pt-6 pb-28 lg:grid lg:grid-cols-[232px_minmax(0,1fr)] lg:gap-14 lg:px-8 lg:pt-10">
      {/* Rail */}
      <aside className="hidden lg:block">
        <div className="sticky top-24">
          <p className="text-[13px] font-medium text-ink">{f.mode === "new" ? "New company" : "Existing company"}</p>
          <p className="mt-0.5 text-[12px] text-ink-3">{steps.length} steps · saved automatically</p>
          <ol className="mt-6 flex flex-col">
            {steps.map((s, i) => {
              const done = i < f.step || (i <= f.furthest && i !== f.step && stepValid(s.id, f));
              const current = i === f.step;
              const reachable = i <= f.furthest;
              return (
                <li key={s.id} className="relative pb-5 last:pb-0">
                  {i < steps.length - 1 && (
                    <span className={cn("absolute top-6 bottom-0.5 left-[11px] w-px", done ? "bg-brown/40" : "bg-line-strong")} />
                  )}
                  <button
                    disabled={!reachable}
                    onClick={() => go(i)}
                    className="group flex w-full items-start gap-3 text-left disabled:cursor-default"
                  >
                    <span
                      className={cn(
                        "relative z-10 flex size-[23px] shrink-0 items-center justify-center rounded-full text-[11px] font-semibold transition-colors",
                        done && "bg-brown text-white",
                        current && !done && "bg-surface text-ink shadow-[inset_0_0_0_1.5px_var(--color-brand)]",
                        !done && !current && "bg-surface text-ink-4 shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]",
                      )}
                    >
                      {done ? <Check className="size-3" strokeWidth={3} /> : i + 1}
                    </span>
                    <span className="min-w-0 pt-0.5">
                      <span className={cn("block text-sm", current ? "font-medium text-ink" : reachable ? "text-ink-2 group-hover:text-ink" : "text-ink-4")}>
                        {s.title}
                      </span>
                      {done && <span className="block text-[11px] text-ink-4">Done</span>}
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
          <div className="mt-8 rounded-lg bg-surface p-3.5 text-[12px] text-ink-3 shadow-card">
            <p className="font-medium text-ink-2">Costs so far</p>
            <div className="mt-2 flex flex-col gap-1">
              {f.mode === "new" && (
                <span className="flex justify-between">
                  State fee <span className="tabular text-ink-2">{money(STATE_FEE)}</span>
                </span>
              )}
              <span className="flex justify-between">
                Swedbank <span className="tabular text-ink-2">€0.00</span>
              </span>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <section className="min-w-0">
        <div className="mb-6 lg:hidden">
          <div className="flex items-center justify-between text-[12px] text-ink-3">
            <span>
              Step {f.step + 1} of {steps.length}
            </span>
          </div>
          <div className="mt-2 flex gap-1">
            {steps.map((s, i) => (
              <span key={s.id} className={cn("h-1 flex-1 rounded-full", i <= f.step ? "bg-brown" : "bg-muted")} />
            ))}
          </div>
        </div>

        <p className="text-[13px] text-ink-3 max-lg:hidden">
          Step {f.step + 1} of {steps.length}
        </p>
        <h1 className="font-display mt-1 text-[28px] leading-9 font-semibold tracking-[-0.015em]">{step.title}</h1>
        <p className="mt-1 text-[15px] text-ink-3">{step.description}</p>

        <div className="mt-8">
          {step.id === "company" && <CompanyStep />}
          {step.id === "people" && <PeopleStep />}
          {step.id === "capital" && <CapitalStep />}
          {step.id === "account" && <AccountStep />}
          {step.id === "lookup" && <LookupStep />}
          {step.id === "activity" && <ActivityStep />}
          {step.id === "review" && <ReviewStep onEdit={(id) => go(steps.findIndex((s) => s.id === id))} />}
        </div>

        {last && !valid && (
          <Note tone="gray" className="mt-6">
            {f.mode === "new"
              ? "Everyone who founds the company signs with Smart-ID, Mobile-ID or ID-card. Changing the application after signing cancels all signatures."
              : "Sign to submit. You can change access and cards later."}
          </Note>
        )}
      </section>

      {/* Footer */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-line bg-surface/90 backdrop-blur-md">
        <div className="mx-auto flex h-[72px] max-w-[1120px] items-center gap-3 px-4 lg:px-8">
          <Button
            variant="tertiary"
            leading={<ArrowLeft className="size-4" />}
            onClick={() => (f.step === 0 ? set({ mode: null }) : go(f.step - 1))}
          >
            Back
          </Button>
          <p className="ml-auto hidden text-[13px] text-ink-3 sm:block">
            {valid ? (
              last ? "Everything is signed and ready." : "Looks good."
            ) : last ? (
              "Waiting for signatures."
            ) : attempted ? (
              <span className="text-danger">Fix the highlighted fields to continue.</span>
            ) : (
              "Fill in the fields above."
            )}
          </p>
          {last ? (
            <Button
              variant="brand"
              size="lg"
              disabled={!valid}
              onClick={() => {
                set({ submittedAt: NOW.toISOString() });
                router.push("/start/status");
              }}
            >
              Submit application
            </Button>
          ) : (
            <Button variant="primary" size="lg" trailing={<ArrowRight className="size-4" />} onClick={tryContinue}>
              Continue
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
