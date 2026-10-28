import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Geist "Fieldset" pattern: titled card with an optional footer line. */
export function SettingsSection({
  id,
  title,
  description,
  action,
  footer,
  children,
  className,
}: {
  id?: string;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20 rounded-xl bg-surface shadow-card", className)}>
      <header className="flex flex-col gap-3 px-5 pt-5 pb-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <h2 className="text-[17px] font-semibold tracking-[-0.02em] text-ink">{title}</h2>
          {description && <p className="mt-1 max-w-xl text-[13px] leading-5 text-ink-3">{description}</p>}
        </div>
        {action && <div className="flex shrink-0 items-center gap-2">{action}</div>}
      </header>
      <div className="px-5 pb-5">{children}</div>
      {footer && (
        <footer className="flex flex-col gap-2 rounded-b-xl border-t border-line bg-canvas px-5 py-3 text-[13px] text-ink-3 sm:flex-row sm:items-center sm:justify-between">
          {footer}
        </footer>
      )}
    </section>
  );
}

export function SettingsRow({
  icon,
  title,
  description,
  children,
  muted,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  children?: ReactNode;
  muted?: boolean;
}) {
  return (
    <div className={cn("flex items-start gap-3 py-3.5", muted && "opacity-60")}>
      {icon && <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-subtle text-ink-2">{icon}</span>}
      <div className="min-w-0 flex-1">
        <div className="text-sm font-medium text-ink">{title}</div>
        {description && <div className="mt-0.5 text-[13px] leading-5 text-ink-3">{description}</div>}
      </div>
      {children && <div className="flex shrink-0 items-center gap-2 self-center">{children}</div>}
    </div>
  );
}
