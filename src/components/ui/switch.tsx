"use client";

import { cn } from "@/lib/cn";

export function Switch({
  checked,
  onChange,
  label,
  disabled,
  size = "md",
  tone = "brown",
}: {
  checked: boolean;
  onChange: (next: boolean) => void;
  label?: string;
  disabled?: boolean;
  size?: "sm" | "md";
  tone?: "brown" | "brand" | "danger";
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      aria-label={label}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={cn(
        "relative inline-flex shrink-0 items-center rounded-full transition-colors duration-200 disabled:opacity-50",
        size === "md" ? "h-6 w-10" : "h-5 w-8",
        checked
          ? tone === "brand"
            ? "bg-brand"
            : tone === "danger"
              ? "bg-danger"
              : "bg-brown"
          : "bg-line-strong",
      )}
    >
      <span
        className={cn(
          "inline-block rounded-full bg-white shadow-[0_1px_2px_rgb(0_0_0/0.2)] transition-transform duration-200 ease-[cubic-bezier(0.32,0.72,0,1)]",
          size === "md" ? "size-5" : "size-4",
          checked ? (size === "md" ? "translate-x-[18px]" : "translate-x-[14px]") : "translate-x-0.5",
        )}
      />
    </button>
  );
}
