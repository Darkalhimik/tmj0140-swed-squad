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

/** Paired in/out bars per period, Vercel usage-chart style. */
export function BarPairs({
  data,
  height = 140,
  className,
}: {
  data: { label: string; a: number; b: number }[];
  height?: number;
  className?: string;
}) {
  const max = Math.max(...data.flatMap((d) => [d.a, d.b]), 1);
  return (
    <div className={cn("flex items-end gap-2", className)} style={{ height }}>
      {data.map((d) => (
        <div key={d.label} className="group flex h-full flex-1 flex-col items-center justify-end gap-1.5">
          <div className="flex h-full w-full items-end justify-center gap-[3px]">
            <div
              className="w-full max-w-3 rounded-t-[3px] bg-brown transition-opacity group-hover:opacity-80"
              style={{ height: `${(d.a / max) * 100}%` }}
            />
            <div
              className="w-full max-w-3 rounded-t-[3px] bg-brand/70 transition-opacity group-hover:opacity-80"
              style={{ height: `${(d.b / max) * 100}%` }}
            />
          </div>
          <span className="text-[11px] text-ink-4">{d.label}</span>
        </div>
      ))}
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
