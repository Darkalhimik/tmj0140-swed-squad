"use client";

import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type TabItem<T extends string> = { value: T; label: ReactNode; count?: number };

/** Vercel-style underline tabs. */
export function Tabs<T extends string>({
  items,
  value,
  onChange,
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  className?: string;
}) {
  return (
    <div role="tablist" className={cn("scrollbar-none flex items-center gap-1 overflow-x-auto border-b border-line", className)}>
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "relative flex h-10 shrink-0 items-center gap-1.5 px-2.5 text-sm whitespace-nowrap transition-colors",
              active ? "text-ink" : "text-ink-3 hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined && (
              <span
                className={cn(
                  "tabular rounded-full px-1.5 text-[11px] leading-[18px]",
                  active ? "bg-brown text-white" : "bg-muted text-ink-2",
                )}
              >
                {item.count}
              </span>
            )}
            <span
              className={cn(
                "absolute inset-x-2 bottom-0 h-0.5 rounded-full transition-colors",
                active ? "bg-ink" : "bg-transparent",
              )}
            />
          </button>
        );
      })}
    </div>
  );
}

/** Revolut-style pill segmented control. */
export function Segmented<T extends string>({
  items,
  value,
  onChange,
  size = "md",
  className,
}: {
  items: TabItem<T>[];
  value: T;
  onChange: (value: T) => void;
  size?: "sm" | "md";
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn("inline-flex items-center gap-0.5 rounded-full bg-muted p-0.5", className)}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            onClick={() => onChange(item.value)}
            className={cn(
              "flex items-center gap-1.5 rounded-full font-medium transition-all duration-200",
              size === "md" ? "h-8 px-3.5 text-[13px]" : "h-7 px-3 text-[12px]",
              active ? "bg-surface text-ink shadow-[0_1px_3px_rgb(81_43_43/0.12)]" : "text-ink-3 hover:text-ink",
            )}
          >
            {item.label}
            {item.count !== undefined && <span className="tabular text-ink-4">{item.count}</span>}
          </button>
        );
      })}
    </div>
  );
}
