"use client";

import { Check, CreditCard, Smartphone } from "lucide-react";
import { useEffect, useState, type ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/overlay";
import { cn } from "@/lib/cn";
import { useStore, type SignInMethod } from "@/lib/store";

function controlCode(seed: string) {
  let h = 7;
  for (let i = 0; i < seed.length; i++) h = (h * 33 + seed.charCodeAt(i)) % 10000;
  return String(h).padStart(4, "0");
}

/**
 * Smart-ID confirmation, shown for every signing action. It states exactly what
 * is being signed, so the person can compare it with the request on their phone.
 */
export function SmartIdModal({
  open,
  onClose,
  onConfirmed,
  title,
  action,
  details,
}: {
  open: boolean;
  onClose: () => void;
  onConfirmed: () => void;
  title?: string;
  action: string;
  details: { label: string; value: ReactNode }[];
}) {
  // Sign with the same method used to log in (Smart-ID, Mobile-ID or ID-card).
  const method = useStore().state.session.method;
  return (
    <Modal open={open} onClose={onClose} size="sm" title={title ?? `Confirm with ${method}`} dismissable>
      {open && <SmartIdBody method={method} action={action} details={details} onConfirmed={onConfirmed} onClose={onClose} />}
    </Modal>
  );
}

function SmartIdBody({
  method,
  action,
  details,
  onConfirmed,
  onClose,
}: {
  method: SignInMethod;
  action: string;
  details: { label: string; value: ReactNode }[];
  onConfirmed: () => void;
  onClose: () => void;
}) {
  const [phase, setPhase] = useState<"waiting" | "done">("waiting");
  const [seconds, setSeconds] = useState(120);
  const code = controlCode(action + details.map((d) => d.label).join());

  useEffect(() => {
    const tick = window.setInterval(() => setSeconds((s) => Math.max(0, s - 1)), 1000);
    const done = window.setTimeout(() => setPhase("done"), 2600);
    return () => {
      window.clearInterval(tick);
      window.clearTimeout(done);
    };
  }, []);

  useEffect(() => {
    if (phase !== "done") return;
    const t = window.setTimeout(onConfirmed, 750);
    return () => window.clearTimeout(t);
  }, [phase, onConfirmed]);

  return (
    <div className="flex flex-col gap-5 pb-2">
      <div className="rounded-lg bg-subtle p-3.5">
        <p className="text-[12px] font-medium text-ink-3">You are signing</p>
        <p className="mt-0.5 text-sm font-semibold text-ink">{action}</p>
        <dl className="mt-2.5 flex flex-col gap-1.5 border-t border-line pt-2.5">
          {details.map((d) => (
            <div key={d.label} className="flex justify-between gap-4 text-[13px]">
              <dt className="text-ink-3">{d.label}</dt>
              <dd className="text-right font-medium text-ink">{d.value}</dd>
            </div>
          ))}
        </dl>
      </div>

      <div className="flex flex-col items-center text-center">
        <div
          className={cn(
            "flex size-14 items-center justify-center rounded-2xl transition-colors duration-300",
            phase === "done" ? "bg-success text-white" : "animate-pulse-ring bg-brand-soft text-brand",
          )}
        >
          {phase === "done" ? (
            <Check className="size-7 animate-pop-in" strokeWidth={2.5} />
          ) : method === "ID-card" ? (
            <CreditCard className="size-6" />
          ) : (
            <Smartphone className="size-6" />
          )}
        </div>
        {phase === "waiting" && method === "ID-card" ? (
          <>
            <p className="mt-4 text-[15px] font-semibold text-ink">Enter PIN2</p>
            <p className="mt-1 max-w-[280px] text-[13px] text-ink-3">
              Keep the card in the reader and enter PIN2 in the browser window.
            </p>
          </>
        ) : phase === "waiting" ? (
          <>
            <p className="mt-4 text-[13px] text-ink-3">Control code</p>
            <p className="tabular mt-0.5 font-mono text-[34px] leading-none font-semibold tracking-[0.12em] text-ink">{code}</p>
            <p className="mt-3 max-w-[280px] text-[13px] text-ink-3">
              {method === "Mobile-ID"
                ? "Your phone shows a Mobile-ID request. Check the code matches before entering PIN2."
                : "Open Smart-ID on your phone and check the code matches before entering PIN2."}
            </p>
            <p className="tabular mt-2 text-[12px] text-ink-4">
              Request expires in {Math.floor(seconds / 60)}:{String(seconds % 60).padStart(2, "0")}
            </p>
          </>
        ) : (
          <>
            <p className="mt-4 text-[15px] font-semibold text-ink">Signed</p>
            <p className="mt-1 text-[13px] text-ink-3">
              {method === "ID-card" ? "Confirmed with your ID-card" : method === "Mobile-ID" ? "Confirmed with Mobile-ID" : "Confirmed on iPhone 16"} · added to your
              activity log
            </p>
          </>
        )}
      </div>

      {phase === "waiting" && (
        <Button variant="tertiary" className="self-center" onClick={onClose}>
          Cancel request
        </Button>
      )}
    </div>
  );
}
