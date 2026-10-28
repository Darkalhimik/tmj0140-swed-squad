import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Geist "Fieldset" settings card: title, description, body, optional footer. */
export function SettingsSection({
  id,
  title,
  description,
  aside,
  footer,
  children,
  tone,
}: {
  id: string;
  title: ReactNode;
  description?: ReactNode;
  aside?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  tone?: "danger";
}) {
  return (
    <section
      id={id}
      className={cn(
        "scroll-mt-20 overflow-hidden rounded-xl bg-surface",
        tone === "danger" ? "shadow-[0_0_0_1px_var(--color-danger-line)]" : "shadow-card",
      )}
    >
      <div className="flex flex-col gap-3 px-5 pt-5 pb-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-base font-semibold tracking-[-0.015em] text-ink">{title}</h2>
          {description && <p className="mt-1 max-w-xl text-[13px] text-ink-3">{description}</p>}
        </div>
        {aside && <div className="shrink-0">{aside}</div>}
      </div>
      <div className="px-5 pb-5">{children}</div>
      {footer && (
        <div
          className={cn(
            "flex flex-col gap-2 border-t px-5 py-3 text-[12px] sm:flex-row sm:items-center sm:justify-between",
            tone === "danger" ? "border-danger-line bg-danger-soft/40 text-ink-2" : "border-line bg-canvas text-ink-3",
          )}
        >
          {footer}
        </div>
      )}
    </section>
  );
}

export function ReadOnlyField({ label, value, mono }: { label: string; value: ReactNode; mono?: boolean }) {
  return (
    <div className="min-w-0">
      <p className="text-[12px] text-ink-3">{label}</p>
      <p className={cn("mt-0.5 truncate text-sm text-ink", mono && "font-mono text-[13px] tracking-tight")}>{value}</p>
    </div>
  );
}
