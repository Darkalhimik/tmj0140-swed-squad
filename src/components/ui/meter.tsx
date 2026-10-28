import { cn } from "@/lib/cn";

function toneFor(ratio: number) {
  if (ratio >= 1) return "bg-danger";
  if (ratio >= 0.8) return "bg-warning";
  return "bg-brown";
}

/** Vercel usage-style meter: thin bar that shifts to amber/red near the limit. */
export function Meter({
  value,
  max,
  className,
  tone,
  size = "md",
}: {
  value: number;
  max: number;
  className?: string;
  tone?: string;
  size?: "sm" | "md";
}) {
  const ratio = max <= 0 ? 0 : value / max;
  return (
    <div
      role="meter"
      aria-valuenow={value}
      aria-valuemin={0}
      aria-valuemax={max}
      className={cn("w-full overflow-hidden rounded-full bg-muted", size === "md" ? "h-1.5" : "h-1", className)}
    >
      <div
        className={cn("h-full rounded-full transition-[width] duration-500 ease-out", tone ?? toneFor(ratio))}
        style={{ width: `${Math.min(100, Math.max(ratio > 0 ? 2 : 0, ratio * 100))}%` }}
      />
    </div>
  );
}

/** Circular gauge (Vercel "Gauge"). */
export function Gauge({ value, size = 36, stroke = 3.5, className }: { value: number; size?: number; stroke?: number; className?: string }) {
  const r = (size - stroke) / 2;
  const c = 2 * Math.PI * r;
  const v = Math.min(100, Math.max(0, value));
  const color = v >= 100 ? "var(--color-danger)" : v >= 80 ? "var(--color-warning)" : "var(--color-success)";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} className={cn("-rotate-90", className)} aria-hidden>
      <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="var(--color-muted)" strokeWidth={stroke} />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth={stroke}
        strokeLinecap="round"
        strokeDasharray={`${(v / 100) * c} ${c}`}
        className="transition-[stroke-dasharray] duration-700 ease-out"
      />
    </svg>
  );
}
