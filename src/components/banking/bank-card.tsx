import { Snowflake, Wifi } from "lucide-react";
import { OakMark } from "@/components/brand/logo";
import { cn } from "@/lib/cn";
import type { Card } from "@/lib/types";

const designs: Record<Card["design"], string> = {
  orange: "bg-[radial-gradient(120%_140%_at_100%_0%,#ff9a52_0%,#ff5f00_45%,#cc4300_100%)] text-white",
  brown: "bg-[radial-gradient(120%_140%_at_100%_0%,#7a4646_0%,#512b2b_50%,#2f1717_100%)] text-white",
  cream: "bg-[radial-gradient(120%_140%_at_100%_0%,#fffaf4_0%,#fdf6ee_50%,#f6dcc4_100%)] text-brown",
  graphite: "bg-[radial-gradient(120%_140%_at_100%_0%,#4a4f57_0%,#2a2d33_55%,#17191c_100%)] text-white",
};

/** Physical-card rendering in Swedbank colours, Revolut-like proportions. */
export function BankCard({
  card,
  size = "md",
  className,
  showNumber,
}: {
  card: Card;
  size?: "sm" | "md" | "lg";
  className?: string;
  showNumber?: boolean;
}) {
  return (
    <div
      className={cn(
        "relative isolate aspect-[1.586] overflow-hidden rounded-2xl shadow-[0_1px_2px_rgb(0_0_0/0.1),0_12px_24px_-8px_rgb(81_43_43/0.35)] transition-[filter,transform] duration-300",
        designs[card.design],
        size === "sm" && "w-[132px] rounded-lg",
        size === "md" && "w-[300px]",
        size === "lg" && "w-full max-w-[360px]",
        card.frozen && "saturate-[0.15]",
        className,
      )}
    >
      <svg className="absolute inset-0 -z-10 h-full w-full opacity-[0.12]" viewBox="0 0 300 190" preserveAspectRatio="none" aria-hidden>
        <circle cx="260" cy="-10" r="120" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="260" cy="-10" r="160" fill="none" stroke="currentColor" strokeWidth="1" />
        <circle cx="260" cy="-10" r="200" fill="none" stroke="currentColor" strokeWidth="1" />
      </svg>
      {size === "sm" ? (
        <div className="flex h-full flex-col justify-between p-2.5">
          <OakMark mono className="size-4" />
          <span className="tabular font-mono text-[11px] opacity-90">•• {card.last4}</span>
        </div>
      ) : (
        <div className="flex h-full flex-col justify-between p-5">
          <div className="flex items-start justify-between">
            <span className="flex items-center gap-1.5">
              <OakMark mono className="size-5" />
              <span className="text-[15px] font-semibold tracking-[-0.03em]">Swedbank</span>
            </span>
            <span className="text-[11px] font-medium tracking-wide uppercase opacity-80">
              {card.kind === "virtual" ? "Virtual" : card.kind === "credit" ? "Credit" : "Debit"}
            </span>
          </div>
          <div className="flex items-center gap-3">
            {card.kind !== "virtual" && <span className="h-7 w-9 rounded-md bg-gradient-to-br from-[#f5d77e] to-[#c9a24a] opacity-90" />}
            {card.kind !== "virtual" && <Wifi className="size-5 rotate-90 opacity-70" />}
          </div>
          <div className="flex items-end justify-between">
            <div>
              <p className="tabular font-mono text-[15px] tracking-[0.08em]">
                {showNumber ? `4573 1820 9921 ${card.last4}` : `•••• ${card.last4}`}
              </p>
              <p className="mt-1 text-[11px] tracking-wide uppercase opacity-80">
                {card.holder} · {card.expiry}
              </p>
            </div>
            <span className="text-lg font-bold tracking-tight italic opacity-95">{card.network === "Visa" ? "VISA" : "mc"}</span>
          </div>
        </div>
      )}
      {card.frozen && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/25 backdrop-blur-[2px]">
          <span className="flex items-center gap-1.5 rounded-full bg-white/90 px-2.5 py-1 text-[12px] font-semibold text-info shadow">
            <Snowflake className="size-3.5" />
            {size !== "sm" && "Frozen"}
          </span>
        </div>
      )}
    </div>
  );
}
