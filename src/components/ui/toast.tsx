"use client";

import { CircleAlert, CircleCheck, Info, X } from "lucide-react";
import { createContext, useCallback, useContext, useMemo, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";

type ToastTone = "success" | "info" | "danger";
type Toast = {
  id: number;
  title: string;
  description?: string;
  tone: ToastTone;
  action?: { label: string; onClick: () => void };
};

type ToastInput = Omit<Toast, "id" | "tone"> & { tone?: ToastTone };

const ToastContext = createContext<(t: ToastInput) => void>(() => {});

export function useToast() {
  return useContext(ToastContext);
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const seq = useRef(0);

  const dismiss = useCallback((id: number) => setToasts((t) => t.filter((x) => x.id !== id)), []);

  const push = useCallback(
    (input: ToastInput) => {
      const id = ++seq.current;
      setToasts((t) => [...t.slice(-2), { tone: "success", ...input, id }]);
      window.setTimeout(() => dismiss(id), input.action ? 7000 : 4500);
    },
    [dismiss],
  );

  const value = useMemo(() => push, [push]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div
        aria-live="polite"
        className="pointer-events-none fixed right-4 bottom-4 z-[60] flex w-[min(380px,calc(100vw-32px))] flex-col gap-2"
      >
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto flex animate-toast-in items-start gap-3 rounded-lg bg-surface p-3.5 shadow-menu"
          >
            <span className="mt-px">
              {t.tone === "success" && <CircleCheck className="size-[18px] text-success" />}
              {t.tone === "info" && <Info className="size-[18px] text-info" />}
              {t.tone === "danger" && <CircleAlert className="size-[18px] text-danger" />}
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium text-ink">{t.title}</p>
              {t.description && <p className="mt-0.5 text-[13px] text-ink-3">{t.description}</p>}
            </div>
            {t.action && (
              <button
                onClick={() => {
                  t.action!.onClick();
                  dismiss(t.id);
                }}
                className={cn("h-7 rounded-md px-2 text-[13px] font-medium text-ink shadow-[0_0_0_1px_var(--color-line-strong)] hover:bg-subtle")}
              >
                {t.action.label}
              </button>
            )}
            <button onClick={() => dismiss(t.id)} aria-label="Dismiss" className="text-ink-4 hover:text-ink">
              <X className="size-4" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
