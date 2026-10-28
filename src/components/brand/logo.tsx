import { cn } from "@/lib/cn";

/**
 * Stand-in for the Swedbank oak coin: a round orange medallion with a
 * simplified oak. Flat shapes only — it does not reproduce the trademark.
 * `mono` renders a single-colour version for cards and dark surfaces.
 */
export function OakMark({ className, mono }: { className?: string; mono?: boolean }) {
  if (mono) {
    return (
      <svg viewBox="0 0 64 64" className={cn("size-6", className)} aria-hidden>
        <circle cx="32" cy="32" r="30" fill="none" stroke="currentColor" strokeWidth="3" />
        <g fill="currentColor">
          <circle cx="22" cy="27" r="7" />
          <circle cx="32" cy="21" r="9" />
          <circle cx="42" cy="27" r="7" />
          <circle cx="27" cy="31" r="6" />
          <circle cx="37" cy="31" r="6" />
          <path d="M29.5 33h5l1.5 11h4v2.5H24V44h4z" />
        </g>
      </svg>
    );
  }
  return (
    <svg viewBox="0 0 64 64" className={cn("size-6", className)} aria-hidden>
      <defs>
        <radialGradient id="sb-coin" cx="35%" cy="30%" r="75%">
          <stop offset="0" stopColor="#FFD68E" />
          <stop offset=".55" stopColor="#F29B40" />
          <stop offset="1" stopColor="#B43C19" />
        </radialGradient>
      </defs>
      <circle cx="32" cy="32" r="31" fill="url(#sb-coin)" />
      <circle cx="32" cy="32" r="27.5" fill="none" stroke="#FFC278" strokeOpacity=".6" />
      <g fill="#B46027">
        <circle cx="22" cy="27" r="7" />
        <circle cx="32" cy="21" r="9" />
        <circle cx="42" cy="27" r="7" />
        <circle cx="27" cy="31" r="6" />
        <circle cx="37" cy="31" r="6" />
      </g>
      <path d="M29.5 33h5l1.5 11h4v2.5H24V44h4z" fill="#8D4428" />
    </svg>
  );
}

export function Logo({ className, compact }: { className?: string; compact?: boolean }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5", className)}>
      {!compact && <span className="text-[19px] font-bold tracking-[-0.035em] text-brand">Swedbank</span>}
      <OakMark className="size-[22px]" />
    </span>
  );
}
