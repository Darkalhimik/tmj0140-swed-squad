import { CircleAlert, CircleCheck, Info, Lightbulb, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { moneyParts } from "@/lib/format";

export function Kbd({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <kbd
      className={cn(
        "inline-flex h-5 min-w-5 items-center justify-center rounded-[5px] bg-surface px-1 font-sans text-[11px] font-medium text-ink-3 shadow-[0_0_0_1px_var(--color-line-strong),0_1px_0_var(--color-line-strong)]",
        className,
      )}
    >
      {children}
    </kbd>
  );
}

type NoteTone = "info" | "warning" | "success" | "danger" | "brand" | "gray";

const noteTones: Record<NoteTone, { box: string; icon: ReactNode }> = {
  info: { box: "bg-info-soft text-info shadow-[inset_0_0_0_1px_var(--color-info-line)]", icon: <Info className="size-4" /> },
  warning: {
    box: "bg-warning-soft text-warning shadow-[inset_0_0_0_1px_var(--color-warning-line)]",
    icon: <TriangleAlert className="size-4" />,
  },
  success: {
    box: "bg-success-soft text-success shadow-[inset_0_0_0_1px_var(--color-success-line)]",
    icon: <CircleCheck className="size-4" />,
  },
  danger: {
    box: "bg-danger-soft text-danger shadow-[inset_0_0_0_1px_var(--color-danger-line)]",
    icon: <CircleAlert className="size-4" />,
  },
  brand: { box: "bg-cream text-brown shadow-[inset_0_0_0_1px_var(--color-brand-line)]", icon: <Lightbulb className="size-4" /> },
  gray: { box: "bg-subtle text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]", icon: <Info className="size-4" /> },
};

/** Inline callout (Geist "Note"). */
export function Note({
  tone = "gray",
  title,
  children,
  action,
  className,
}: {
  tone?: NoteTone;
  title?: ReactNode;
  children?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  const t = noteTones[tone];
  return (
    <div className={cn("flex items-start gap-2.5 rounded-lg px-3.5 py-3 text-[13px] leading-5", t.box, className)}>
      <span className="mt-0.5 shrink-0">{t.icon}</span>
      <div className="min-w-0 flex-1">
        {title && <p className="font-medium">{title}</p>}
        {children && <div className={cn(title && "mt-0.5", "opacity-90")}>{children}</div>}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/** Amount with de-emphasised cents, tabular figures. */
export function Money({
  value,
  className,
  centsClassName,
  sign,
}: {
  value: number;
  className?: string;
  centsClassName?: string;
  sign?: boolean;
}) {
  const p = moneyParts(value);
  const prefix = p.negative ? "−" : sign && value > 0 ? "+" : "";
  return (
    <span className={cn("tabular whitespace-nowrap", className)}>
      {prefix}
      {p.whole}
      <span className={cn("opacity-55", centsClassName)}>{p.cents}</span>
    </span>
  );
}

export function EmptyState({
  icon,
  title,
  description,
  action,
  className,
}: {
  icon?: ReactNode;
  title: ReactNode;
  description?: ReactNode;
  action?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col items-center justify-center px-6 py-12 text-center", className)}>
      {icon && (
        <div className="mb-3 flex size-11 items-center justify-center rounded-xl bg-surface text-ink-3 shadow-card">{icon}</div>
      )}
      <p className="text-sm font-medium text-ink">{title}</p>
      {description && <p className="mt-1 max-w-sm text-[13px] text-ink-3">{description}</p>}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}

export function Divider({ className }: { className?: string }) {
  return <div className={cn("h-px w-full bg-line", className)} />;
}

/** Hover tooltip rendered with CSS only. */
export function Tooltip({ content, children, side = "top" }: { content: ReactNode; children: ReactNode; side?: "top" | "bottom" }) {
  return (
    <span className="group/tt relative inline-flex">
      {children}
      <span
        role="tooltip"
        className={cn(
          "pointer-events-none absolute left-1/2 z-40 w-max max-w-64 -translate-x-1/2 rounded-md bg-ink px-2 py-1 text-[12px] leading-4 font-normal text-white opacity-0 shadow-menu transition-opacity duration-150 group-hover/tt:opacity-100 group-hover/tt:delay-300 group-focus-within/tt:opacity-100",
          side === "top" ? "bottom-[calc(100%+6px)]" : "top-[calc(100%+6px)]",
        )}
      >
        {content}
      </span>
    </span>
  );
}

export function KeyValue({ label, children, mono }: { label: ReactNode; children: ReactNode; mono?: boolean }) {
  return (
    <div className="flex items-start justify-between gap-6 py-2.5 text-sm">
      <dt className="shrink-0 text-ink-3">{label}</dt>
      <dd className={cn("min-w-0 text-right text-ink", mono && "font-mono text-[13px] tracking-tight")}>{children}</dd>
    </div>
  );
}

export function SectionLabel({ children, className }: { children: ReactNode; className?: string }) {
  return <p className={cn("text-[13px] font-medium text-ink-2", className)}>{children}</p>;
}
