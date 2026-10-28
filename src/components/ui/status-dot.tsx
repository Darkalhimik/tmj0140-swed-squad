import { cn } from "@/lib/cn";

export type Status = "ready" | "pending" | "waiting" | "error" | "neutral" | "info";

const colors: Record<Status, string> = {
  ready: "bg-success",
  pending: "bg-warning",
  waiting: "bg-yellow",
  error: "bg-danger",
  neutral: "bg-ink-4",
  info: "bg-info",
};

/** Vercel-style status indicator: a 8px dot with an optional label. */
export function StatusDot({
  status,
  label,
  pulse,
  className,
}: {
  status: Status;
  label?: string;
  pulse?: boolean;
  className?: string;
}) {
  return (
    <span className={cn("inline-flex items-center gap-2 text-[13px] text-ink-2", className)}>
      <span className="relative inline-flex size-2">
        {pulse && <span className={cn("absolute inset-0 animate-ping rounded-full opacity-60", colors[status])} />}
        <span className={cn("relative inline-flex size-2 rounded-full", colors[status])} />
      </span>
      {label}
    </span>
  );
}
