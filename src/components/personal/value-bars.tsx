import { cn } from "@/lib/cn";
import { money } from "@/lib/format";

/** Single-series bars with the value written on each bar (no legend needed). */
export function ValueBars({
  data,
  height = 120,
  highlight,
  className,
}: {
  data: { label: string; value: number }[];
  height?: number;
  highlight?: string;
  className?: string;
}) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className={cn("flex items-end gap-2 sm:gap-3", className)} style={{ height }}>
      {data.map((d) => {
        const active = d.label === highlight;
        return (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className={cn("tabular text-[11px]", active ? "font-medium text-ink" : "text-ink-3")}>{money(d.value)}</span>
            <div
              className={cn("w-full max-w-10 rounded-t-[4px] transition-[height] duration-500", active ? "bg-brown" : "bg-line-strong")}
              style={{ height: `${Math.max(4, (d.value / max) * 100)}%` }}
            />
            <span className={cn("text-[11px]", active ? "font-medium text-ink-2" : "text-ink-4")}>{d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
