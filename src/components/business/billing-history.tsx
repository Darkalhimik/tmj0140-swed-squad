import { cn } from "@/lib/cn";
import { money } from "@/lib/format";

/** Monthly fee bars with direct value labels; the last bar is the running estimate. */
export function FeeHistory({ data, height = 150 }: { data: { label: string; value: number }[]; height?: number }) {
  const max = Math.max(...data.map((d) => d.value), 1);
  return (
    <div className="flex items-end gap-3" style={{ height }}>
      {data.map((d, i) => {
        const estimate = i === data.length - 1;
        return (
          <div key={d.label} className="flex h-full flex-1 flex-col items-center justify-end gap-1.5">
            <span className={cn("tabular text-[11px]", estimate ? "font-medium text-ink" : "text-ink-3")}>{money(d.value)}</span>
            <div
              className={cn(
                "w-full max-w-10 rounded-t-[4px] transition-[height] duration-500",
                estimate
                  ? "bg-[repeating-linear-gradient(135deg,var(--color-brown)_0_4px,rgb(81_43_43/0.75)_4px_8px)]"
                  : "bg-line-strong",
              )}
              style={{ height: `${(d.value / max) * 100}%` }}
            />
            <span className={cn("text-[11px]", estimate ? "font-medium text-ink-2" : "text-ink-4")}>{estimate ? `${d.label} (est.)` : d.label}</span>
          </div>
        );
      })}
    </div>
  );
}
