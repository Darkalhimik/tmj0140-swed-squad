"use client";

import { ArrowLeft, ArrowRight, Check, Smartphone, Video } from "lucide-react";
import { useEffect, useState } from "react";
import { CopyRow } from "@/components/banking/account-modals";
import { SmartIdModal } from "@/components/banking/smart-id";
import { FeeBreakdown } from "@/components/banking/transparency";
import { Button, ButtonLink } from "@/components/ui/button";
import { Choicebox } from "@/components/ui/choicebox";
import { Field, Input, Select } from "@/components/ui/input";
import { Note } from "@/components/ui/misc";
import { Segmented } from "@/components/ui/tabs";
import { personalPlans } from "@/lib/data/pricing";
import { cn } from "@/lib/cn";
import { money } from "@/lib/format";
import { useStore, type SignInMethod } from "@/lib/store";

const STEPS = ["Identity", "About you", "Plan", "Sign"];
const PURPOSES = ["Salary and everyday spending", "Savings", "Receiving money from abroad", "Paying rent and bills"];
const NEW_IBAN = "EE452200221099887766";

type Method = SignInMethod | "Video";

/** Opening a private account remotely — the start of the story for someone who isn't a customer yet. */
export function Join() {
  const { dispatch } = useStore();
  const [step, setStep] = useState(0);
  const [method, setMethod] = useState<Method>("Smart-ID");
  const [code, setCode] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [purposes, setPurposes] = useState<string[]>([]);
  const [income, setIncome] = useState("");
  const [residency, setResidency] = useState("Estonia");
  const [pep, setPep] = useState<"no" | "yes" | "">("");
  const [plan, setPlan] = useState<string | null>(null);
  const [signing, setSigning] = useState(false);
  const [done, setDone] = useState(false);
  const [tried, setTried] = useState(false);

  useEffect(() => {
    if (!verifying) return;
    const t = window.setTimeout(() => {
      setVerifying(false);
      setStep(1);
      setTried(false);
    }, 2200);
    return () => window.clearTimeout(t);
  }, [verifying]);

  const codeValid = /^[3-6]\d{10}$/.test(code);
  const aboutValid = purposes.length > 0 && !!income && !!pep;
  const chosen = personalPlans.find((p) => p.id === plan);

  const next = () => {
    setTried(true);
    if (step === 0 && codeValid && method !== "Video") {
      dispatch({ type: "session/set", method });
      setVerifying(true);
    }
    if (step === 1 && aboutValid) {
      setStep(2);
      setTried(false);
    }
    if (step === 2 && plan) {
      setStep(3);
      setTried(false);
    }
  };

  if (done) {
    return (
      <main className="mx-auto max-w-[560px] px-4 py-12">
        <span className="flex size-12 items-center justify-center rounded-full bg-success text-white">
          <Check className="size-6" strokeWidth={2.5} />
        </span>
        <h1 className="font-display mt-5 text-[28px] leading-9 font-semibold tracking-[-0.015em]">Your account is open</h1>
        <p className="mt-1 text-[15px] text-ink-3">
          Everyday account with the {chosen?.name}. Your virtual Debit card works now; the plastic card arrives in 3–5 working days.
        </p>
        <div className="mt-6 divide-y divide-line rounded-xl bg-surface px-5 shadow-card">
          <CopyRow label="IBAN" value={NEW_IBAN.replace(/(.{4})/g, "$1 ").trim()} />
          <CopyRow label="BIC" value="HABAEE2X" />
        </div>
        <Note tone="gray" className="mt-5">
          This is where a real new customer would land in their own, empty internet bank. The rest of the demo continues as Mari Tamm, an existing
          customer with history, so there is something to look at.
        </Note>
        <div className="mt-6 flex flex-col gap-2 sm:flex-row">
          <ButtonLink href="/start" variant="primary" trailing={<ArrowRight className="size-4" />}>
            Start a company
          </ButtonLink>
          <ButtonLink href="/personal" variant="secondary">
            Continue the demo as Mari
          </ButtonLink>
        </div>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-[640px] px-4 py-10">
      <ol className="flex gap-1.5" aria-label="Progress">
        {STEPS.map((s, i) => (
          <li key={s} className="flex-1">
            <span className={cn("block h-1 rounded-full", i <= step ? "bg-brown" : "bg-muted")} />
            <span className={cn("mt-1.5 block text-[12px]", i === step ? "font-medium text-ink" : "text-ink-3")}>{s}</span>
          </li>
        ))}
      </ol>

      {step === 0 && (
        <section className="mt-8">
          <h1 className="font-display text-[26px] leading-8 font-semibold tracking-[-0.015em]">Confirm who you are</h1>
          <p className="mt-1 text-[15px] text-ink-3">With an Estonian ID it takes a minute. No branch visit.</p>
          {verifying ? (
            <div className="mt-6 flex flex-col items-center rounded-xl bg-surface p-8 text-center shadow-card">
              <span className="flex size-14 animate-pulse-ring items-center justify-center rounded-2xl bg-brand-soft text-brand">
                <Smartphone className="size-6" />
              </span>
              <p className="mt-4 text-[13px] text-ink-3">{method === "ID-card" ? "Enter PIN1 in the window your browser opened" : "Control code"}</p>
              {method !== "ID-card" && <p className="tabular font-mono text-[34px] font-semibold tracking-[0.12em]">5291</p>}
            </div>
          ) : (
            <div className="mt-6 flex flex-col gap-5">
              <Segmented<Method>
                value={method}
                onChange={setMethod}
                className="flex-wrap"
                items={[
                  { value: "Smart-ID", label: "Smart-ID" },
                  { value: "Mobile-ID", label: "Mobile-ID" },
                  { value: "ID-card", label: "ID-card" },
                  { value: "Video", label: "No Estonian ID" },
                ]}
              />
              {method === "Video" ? (
                <Note tone="info" title="Video identification">
                  Without an Estonian ID-code you verify with your passport in a short video call. We tell you the date and time before you
                  book.
                </Note>
              ) : (
                <Input
                  label="Personal identification code"
                  mono
                  inputMode="numeric"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 11))}
                  placeholder="11 digits"
                  aria-invalid={tried && !codeValid ? true : undefined}
                  error={tried && !codeValid ? "Enter your 11-digit Estonian personal code." : undefined}
                />
              )}
            </div>
          )}
        </section>
      )}

      {step === 1 && (
        <section className="mt-8 flex flex-col gap-6">
          <div>
            <h1 className="font-display text-[26px] leading-8 font-semibold tracking-[-0.015em]">A few questions</h1>
            <p className="mt-1 text-[15px] text-ink-3">The law requires us to ask every new customer. You can change the answers later.</p>
          </div>
          <Field label="What will you use the account for?" error={tried && purposes.length === 0 ? "Choose at least one." : undefined}>
            <div className="flex flex-wrap gap-1.5" data-invalid={tried && purposes.length === 0 ? "true" : undefined}>
              {PURPOSES.map((p) => {
                const on = purposes.includes(p);
                return (
                  <button
                    key={p}
                    type="button"
                    aria-pressed={on}
                    onClick={() => setPurposes((l) => (on ? l.filter((x) => x !== p) : [...l, p]))}
                    className={cn("h-8 rounded-full px-3 text-[13px] transition-colors", on ? "bg-brown text-white" : "bg-subtle text-ink-2 hover:bg-muted")}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </Field>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Main source of income" error={tried && !income ? "Choose one." : undefined}>
              <Select value={income} onChange={(e) => setIncome(e.target.value)} aria-invalid={tried && !income ? true : undefined}>
                <option value="">Choose…</option>
                {["Salary", "Business income", "Pension", "Student allowance", "Other"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
            <Field label="Tax residency">
              <Select value={residency} onChange={(e) => setResidency(e.target.value)}>
                {["Estonia", "Finland", "Latvia", "Lithuania", "Ukraine", "Other"].map((o) => (
                  <option key={o}>{o}</option>
                ))}
              </Select>
            </Field>
          </div>
          <Field
            label="Do you hold, or have you held, a prominent public position (PEP)?"
            hint="For example a minister, MP or judge — or a close family member of one."
            error={tried && !pep ? "Choose yes or no." : undefined}
          >
            <Segmented<"no" | "yes" | "">
              value={pep}
              onChange={setPep}
              items={[
                { value: "no", label: "No" },
                { value: "yes", label: "Yes" },
              ]}
            />
          </Field>
        </section>
      )}

      {step === 2 && (
        <section className="mt-8">
          <h1 className="font-display text-[26px] leading-8 font-semibold tracking-[-0.015em]">Choose a plan</h1>
          <p className="mt-1 text-[15px] text-ink-3">Every plan includes unlimited euro payments and a Debit card. You can switch any month.</p>
          <div className="mt-6" data-invalid={tried && !plan ? "true" : undefined}>
            <Choicebox<string>
              columns={1}
              value={plan}
              onChange={setPlan}
              items={personalPlans.map((p) => ({
                value: p.id,
                title: `${p.name} · ${money(p.price)}/month`,
                description: p.highlights.slice(2).join(" · "),
              }))}
            />
            {tried && !plan && <p className="mt-2 text-[13px] font-medium text-danger">Choose a plan to continue.</p>}
          </div>
        </section>
      )}

      {step === 3 && chosen && (
        <section className="mt-8 flex flex-col gap-5">
          <div>
            <h1 className="font-display text-[26px] leading-8 font-semibold tracking-[-0.015em]">Check and sign</h1>
            <p className="mt-1 text-[15px] text-ink-3">You sign the account agreement with {method}.</p>
          </div>
          <FeeBreakdown
            rows={[
              { label: "Opening the account", value: "€0.00", tone: "success" },
              ...(chosen.id === "essential"
                ? [
                    { label: `${chosen.name}, first 6 months`, value: "€0.00", tone: "success" as const, hint: "New customers get the Essential plan free for 6 months." },
                    { label: "After that", value: `${money(chosen.price)} / month` },
                  ]
                : [{ label: chosen.name, value: `${money(chosen.price)} / month`, hint: "Charged at the start of each month." }]),
            ]}
            total={{ label: "Due today", value: "€0.00" }}
            arrival="Your IBAN and a virtual Debit card are ready as soon as you sign"
          />
          <Button variant="brand" size="lg" onClick={() => setSigning(true)}>
            Sign and open account
          </Button>
          <SmartIdModal
            open={signing}
            onClose={() => setSigning(false)}
            onConfirmed={() => {
              setSigning(false);
              setDone(true);
            }}
            action="Everyday account agreement"
            details={[
              { label: "Plan", value: chosen.name },
              { label: "Fee", value: chosen.id === "essential" ? `€0.00 for 6 months, then ${money(chosen.price)}` : `${money(chosen.price)} / month` },
            ]}
          />
        </section>
      )}

      {!verifying && step < 3 && (
        <div className="mt-8 flex items-center justify-between gap-3 border-t border-line pt-5">
          {step > 0 ? (
            <Button variant="tertiary" leading={<ArrowLeft className="size-4" />} onClick={() => setStep((s) => s - 1)}>
              Back
            </Button>
          ) : (
            <span />
          )}
          {method === "Video" && step === 0 ? (
            <Button variant="primary" leading={<Video className="size-4" />} disabled>
              Book a video call (not in this demo)
            </Button>
          ) : (
            <Button variant="primary" size="lg" trailing={<ArrowRight className="size-4" />} onClick={next}>
              Continue
            </Button>
          )}
        </div>
      )}
    </main>
  );
}
