import { cn } from "@/lib/cn";

function path(points: number[], w: number, h: number, pad = 2) {
  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = max - min || 1;
  const step = points.length > 1 ? w / (points.length - 1) : w;
  return points.map((p, i) => {
    const x = i * step;
    const y = pad + (h - pad * 2) * (1 - (p - min) / span);
    return [x, y] as const;
  });
}

/** Tiny trend line used in KPI tiles. */
export function Sparkline({
  data,
  width = 120,
  height = 32,
  className,
  stroke = "var(--color-brown)",
  fill = true,
}: {
  data: number[];
  width?: number;
  height?: number;
  className?: string;
  stroke?: string;
  fill?: boolean;
}) {
  const pts = path(data, width, height);
  const d = pts.map(([x, y], i) => `${i ? "L" : "M"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${width},${height} L0,${height} Z`;
  const id = `spark-${data.length}-${Math.round(data[0] ?? 0)}-${Math.round(data.at(-1) ?? 0)}`;
  return (
    <svg viewBox={`0 0 ${width} ${height}`} width={width} height={height} className={cn("overflow-visible", className)} aria-hidden>
      {fill && (
        <>
          <defs>
            <linearGradient id={id} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={stroke} stopOpacity="0.16" />
              <stop offset="100%" stopColor={stroke} stopOpacity="0" />
            </linearGradient>
          </defs>
          <path d={area} fill={`url(#${id})`} />
        </>
      )}
      <path d={d} fill="none" stroke={stroke} strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
      <circle cx={pts.at(-1)![0]} cy={pts.at(-1)![1]} r="2.5" fill={stroke} />
    </svg>
  );
}

function niceMax(v: number) {
  if (v <= 0) return 1;
  const p = 10 ** Math.floor(Math.log10(v));
  const n = v / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 5 ? 5 : 10) * p;
}

const compactEur = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", notation: "compact", maximumFractionDigits: 1 });

/** Paired in/out bars per period with a labelled value axis and gridlines. */
export function BarPairs({
  data,
  height = 140,
  className,
  labels = ["In", "Out"],
}: {
  data: { label: string; a: number; b: number }[];
  height?: number;
  className?: string;
  labels?: [string, string];
}) {
  const max = niceMax(Math.max(...data.flatMap((d) => [d.a, d.b]), 1));
  const ticks = [max, max / 2, 0];
  return (
    <div className={cn("flex gap-2", className)}>
      <div className="flex flex-col justify-between pb-5 text-right text-[11px] text-ink-4 tabular" style={{ height }}>
        {ticks.map((t) => (
          <span key={t} className="-translate-y-1/2 leading-none first:translate-y-0 last:translate-y-0">
            {compactEur.format(t)}
          </span>
        ))}
      </div>
      <div className="relative flex-1">
        <div className="pointer-events-none absolute inset-x-0 top-0 flex flex-col justify-between" style={{ height: height - 20 }} aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="h-px w-full bg-line" />
          ))}
        </div>
        <div className="relative flex items-end gap-2" style={{ height }}>
          {data.map((d) => (
            <div
              key={d.label}
              className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5"
              title={`${d.label}: ${labels[0].toLowerCase()} ${compactEur.format(d.a)}, ${labels[1].toLowerCase()} ${compactEur.format(d.b)}`}
            >
              <div className="flex w-full items-end justify-center gap-[3px]" style={{ height: height - 20 }}>
                <div className="w-full max-w-3 rounded-t-[3px] bg-brown transition-opacity group-hover:opacity-80" style={{ height: `${(d.a / max) * 100}%` }} />
                <div className="w-full max-w-3 rounded-t-[3px] bg-brand/70 transition-opacity group-hover:opacity-80" style={{ height: `${(d.b / max) * 100}%` }} />
              </div>
              <span className="h-[14px] text-[11px] leading-[14px] text-ink-4">{d.label}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

/** Horizontal stacked bar showing category shares. */
export function StackBar({
  parts,
  className,
}: {
  parts: { label: string; value: number; color: string }[];
  className?: string;
}) {
  const total = parts.reduce((s, p) => s + p.value, 0) || 1;
  return (
    <div className={cn("flex h-2 w-full gap-0.5 overflow-hidden rounded-full", className)}>
      {parts.map((p) => (
        <div key={p.label} className="h-full first:rounded-l-full last:rounded-r-full" style={{ width: `${(p.value / total) * 100}%`, background: p.color }} />
      ))}
    </div>
  );
}
