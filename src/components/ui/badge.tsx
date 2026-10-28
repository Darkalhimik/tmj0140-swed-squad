import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Tone = "gray" | "brand" | "success" | "warning" | "danger" | "info" | "violet" | "brown";

const tones: Record<Tone, string> = {
  gray: "bg-subtle text-ink-2 shadow-[inset_0_0_0_1px_var(--color-line)]",
  brand: "bg-brand-soft text-brand-hover shadow-[inset_0_0_0_1px_var(--color-brand-line)]",
  success: "bg-success-soft text-success shadow-[inset_0_0_0_1px_var(--color-success-line)]",
  warning: "bg-warning-soft text-warning shadow-[inset_0_0_0_1px_var(--color-warning-line)]",
  danger: "bg-danger-soft text-danger shadow-[inset_0_0_0_1px_var(--color-danger-line)]",
  info: "bg-info-soft text-info shadow-[inset_0_0_0_1px_var(--color-info-line)]",
  violet: "bg-violet-soft text-violet shadow-[inset_0_0_0_1px_rgb(109_75_196/0.2)]",
  brown: "bg-brown text-white",
};

export function Badge({
  tone = "gray",
  size = "sm",
  icon,
  className,
  children,
}: {
  tone?: Tone;
  size?: "xs" | "sm" | "md";
  icon?: ReactNode;
  className?: string;
  children: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full font-medium",
        size === "xs" && "h-[18px] px-1.5 text-[11px]",
        size === "sm" && "h-5 px-2 text-[12px]",
        size === "md" && "h-6 px-2.5 text-[13px]",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
