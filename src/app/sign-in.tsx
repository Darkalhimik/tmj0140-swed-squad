"use client";

import { ArrowRight, Building2, Check, CreditCard, Eye, KeyRound, ShieldCheck, Smartphone } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { Logo } from "@/components/brand/logo";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Segmented } from "@/components/ui/tabs";
import { cn } from "@/lib/cn";

type Method = "smart-id" | "mobile-id" | "id-card";

export function SignIn() {
  const router = useRouter();
  const [method, setMethod] = useState<Method>("smart-id");
  const [code, setCode] = useState("49203150123");
  const [phase, setPhase] = useState<"form" | "waiting" | "done">("form");

  useEffect(() => {
    if (phase === "waiting") {
      const t = window.setTimeout(() => setPhase("done"), 2200);
      return () => window.clearTimeout(t);
    }
    if (phase === "done") {
      const t = window.setTimeout(() => router.push("/personal"), 650);
      return () => window.clearTimeout(t);
    }
  }, [phase, router]);

  const valid = /^\d{11}$/.test(code);

  return (
    <div className="flex min-h-screen flex-col">
      <p className="bg-brown px-4 py-2 text-center text-[12px] leading-4 text-white/90">
        Student concept by <span className="font-semibold text-white">SWED SQUAD</span> · TMJ0140/TMJ0130 Introduction to Entrepreneurship
        (2026 autumn) · Not affiliated with Swedbank · No real data — don’t enter real personal details
      </p>
      <div className="grid flex-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)]">
        <div className="flex flex-col px-6 py-6 sm:px-12">
          <div className="flex items-center justify-between">
            <Logo />
            <div className="flex items-center gap-1 text-[13px] text-ink-3">
              <span className="rounded-md px-2 py-1 font-medium text-ink">EN</span>
              <span className="rounded-md px-2 py-1">ET</span>
              <span className="rounded-md px-2 py-1">RU</span>
            </div>
          </div>

          <div className="mx-auto flex w-full max-w-[380px] flex-1 flex-col justify-center py-12">
            <h1 className="text-[30px] leading-9 font-semibold tracking-[-0.04em]">Log in</h1>
            <p className="mt-1.5 text-[15px] text-ink-3">To your personal and business accounts — one login for both.</p>

            {phase === "form" ? (
              <form
                className="mt-8 flex flex-col gap-5"
                onSubmit={(e) => {
                  e.preventDefault();
                  if (valid) setPhase("waiting");
                }}
              >
                <Segmented<Method>
                  className="w-full [&>button]:flex-1 [&>button]:justify-center"
                  value={method}
                  onChange={setMethod}
                  items={[
                    { value: "smart-id", label: "Smart-ID" },
                    { value: "mobile-id", label: "Mobile-ID" },
                    { value: "id-card", label: "ID-card" },
                  ]}
                />
                {method === "id-card" ? (
                  <div className="flex items-center gap-3 rounded-lg bg-subtle p-4 text-[13px] text-ink-2">
                    <CreditCard className="size-5 text-ink-3" />
                    Insert your ID-card into the reader and click continue. You’ll be asked for PIN1.
                  </div>
                ) : (
                  <Input
                    label="Personal identification code"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, "").slice(0, 11))}
                    inputMode="numeric"
                    mono
                    size="lg"
                    hint={method === "mobile-id" ? "We’ll also ask for your phone number on the next step." : "11 digits, e.g. 49203150123"}
                  />
                )}
                <Button type="submit" variant="brand" size="lg" disabled={method !== "id-card" && !valid} trailing={<ArrowRight className="size-4" />}>
                  Continue
                </Button>
                <p className="text-center text-[13px] text-ink-3">
                  No account yet?{" "}
                  <Link href="/start" className="font-medium text-ink underline decoration-line-strong underline-offset-4 hover:decoration-ink">
                    Open one online
                  </Link>
                </p>
              </form>
            ) : (
              <div className="mt-8 flex flex-col items-center rounded-xl bg-surface p-8 text-center shadow-card">
                <div
                  className={cn(
                    "flex size-14 items-center justify-center rounded-2xl transition-colors",
                    phase === "done" ? "bg-success text-white" : "animate-pulse-ring bg-brand-soft text-brand",
                  )}
                >
                  {phase === "done" ? <Check className="size-7" strokeWidth={2.5} /> : <Smartphone className="size-6" />}
                </div>
                {phase === "waiting" ? (
                  <>
                    <p className="mt-5 text-[13px] text-ink-3">Control code</p>
                    <p className="tabular font-mono text-[38px] leading-tight font-semibold tracking-[0.14em]">4127</p>
                    <p className="mt-2 text-[13px] text-ink-3">Check the code in the Smart-ID app matches, then enter PIN1.</p>
                    <button onClick={() => setPhase("form")} className="mt-6 text-[13px] font-medium text-ink-3 hover:text-ink">
                      Cancel
                    </button>
                  </>
                ) : (
                  <>
                    <p className="mt-5 text-[15px] font-semibold">Welcome back, Mari</p>
                    <p className="mt-1 text-[13px] text-ink-3">Opening your overview…</p>
                  </>
                )}
              </div>
            )}
          </div>

          <p className="flex items-center gap-1.5 text-[12px] text-ink-4">
            <ShieldCheck className="size-3.5" />
            Swedbank will never ask for your PIN codes by phone, e-mail or chat.
          </p>
        </div>

        <div className="relative hidden overflow-hidden bg-cream lg:block">
          <div className="relative flex h-full flex-col justify-center px-16">
            <p className="text-[15px] font-semibold text-brand-text">New Internet Bank</p>
            <h2 className="mt-3 max-w-[460px] text-[42px] leading-[46px] font-semibold tracking-[-0.045em] text-brown">
              Banking that shows its work.
            </h2>
            <ul className="mt-10 flex max-w-[440px] flex-col gap-3">
              {[
                { icon: <Building2 className="size-4" />, title: "Start a company in one flow", body: "Register your OÜ, verify founders with Smart-ID and get an IBAN the same day." },
                { icon: <Eye className="size-4" />, title: "Every fee, before you pay", body: "Live allowances, fee previews and a clear status for every payment." },
                { icon: <KeyRound className="size-4" />, title: "Access you can see", body: "Roles, approval rules and a full activity log for your whole team." },
              ].map((f) => (
                <li key={f.title} className="flex gap-3.5 rounded-xl bg-white/70 p-4 shadow-[0_0_0_1px_rgb(81_43_43/0.08)] backdrop-blur">
                  <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-brown text-white">{f.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold text-brown">{f.title}</span>
                    <span className="mt-0.5 block text-[13px] leading-5 text-brown/70">{f.body}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
