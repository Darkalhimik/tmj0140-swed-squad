import Link from "next/link";
import type { ComponentProps, ReactNode } from "react";
import { cn } from "@/lib/cn";
import { Tooltip } from "./misc";
import { Spinner } from "./spinner";

type Variant = "primary" | "brand" | "secondary" | "tertiary" | "danger" | "danger-soft";
type Size = "xs" | "sm" | "md" | "lg";

const variants: Record<Variant, string> = {
  primary: "bg-brown text-white hover:bg-brown-hover shadow-[inset_0_1px_0_rgb(255_255_255/0.08)]",
  brand: "bg-brand text-white hover:bg-brand-hover shadow-[inset_0_1px_0_rgb(255_255_255/0.16)]",
  secondary: "bg-surface text-ink shadow-[0_0_0_1px_var(--color-line-strong)] hover:bg-subtle",
  tertiary: "bg-transparent text-ink-2 hover:bg-subtle hover:text-ink",
  danger: "bg-danger text-white hover:brightness-95",
  "danger-soft": "bg-danger-soft text-danger hover:brightness-[0.98] shadow-[0_0_0_1px_var(--color-danger-line)]",
};

const sizes: Record<Size, string> = {
  xs: "h-7 px-2.5 text-[12px] gap-1 rounded-full",
  sm: "h-8 px-3.5 text-[13px] gap-1.5 rounded-full",
  md: "h-9 px-4 text-sm gap-2 rounded-full",
  lg: "h-11 px-5 text-[15px] gap-2 rounded-full",
};

const iconOnly: Record<Size, string> = {
  xs: "w-7 px-0",
  sm: "w-8 px-0",
  md: "w-9 px-0",
  lg: "w-11 px-0",
};

type Common = {
  variant?: Variant;
  size?: Size;
  leading?: ReactNode;
  trailing?: ReactNode;
  icon?: boolean;
  pill?: boolean;
  loading?: boolean;
};

function classes({ variant = "secondary", size = "md", icon, pill, className }: Common & { className?: string }) {
  // White on Swedbank orange is ~3:1 — only AA for large bold text. Orange
  // buttons therefore exist only at `lg` as Swedbank's 19px bold pill; at
  // smaller sizes the brand variant falls back to the bark-brown primary.
  const orangePill = variant === "brand" && size === "lg";
  const v = variant === "brand" && !orangePill ? "primary" : variant;
  return cn(
    "inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap font-medium transition-[background-color,color,box-shadow,filter,transform] duration-150 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-50",
    variants[v],
    // Icon-only buttons drop the text padding so the icon keeps its size.
    icon ? sizes[size].replace(/\bpx-[\d.]+\b/, "") : sizes[size],
    orangePill && "h-12 rounded-full px-6 text-[19px] font-bold tracking-[-0.01em]",
    icon && iconOnly[size],
    pill && "rounded-full",
    className,
  );
}

export function Button({
  variant,
  size,
  leading,
  trailing,
  icon,
  pill,
  loading,
  className,
  children,
  disabled,
  type = "button",
  ...rest
}: Common & ComponentProps<"button">) {
  const button = (
    <button
      type={type}
      disabled={disabled || loading}
      className={classes({ variant, size, icon, pill, className })}
      {...rest}
    >
      {loading ? <Spinner className="size-4" /> : leading}
      {children}
      {trailing}
    </button>
  );
  // Icon-only buttons show their label on hover/focus, not just to screen readers.
  const label = rest["aria-label"];
  return icon && label ? <Tooltip content={label}>{button}</Tooltip> : button;
}

export function ButtonLink({
  variant,
  size,
  leading,
  trailing,
  icon,
  pill,
  className,
  children,
  ...rest
}: Common & ComponentProps<typeof Link>) {
  return (
    <Link className={classes({ variant, size, icon, pill, className })} {...rest}>
      {leading}
      {children}
      {trailing}
    </Link>
  );
}
