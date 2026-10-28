"use client";

import { Check } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

export type Choice<T extends string> = {
  value: T;
  title: ReactNode;
  description?: ReactNode;
  meta?: ReactNode;
  icon?: ReactNode;
  disabled?: boolean;
};

/** Geist "Choicebox": selectable cards acting as a radio group. */
export function Choicebox<T extends string>({
  items,
  value,
  onChange,
  columns = 2,
  className,
}: {
  items: Choice<T>[];
  value: T | null;
  onChange: (value: T) => void;
  columns?: 1 | 2 | 3;
  className?: string;
}) {
  return (
    <div
      role="radiogroup"
      className={cn(
        "grid gap-3",
        columns === 1 && "grid-cols-1",
        columns === 2 && "grid-cols-1 sm:grid-cols-2",
        columns === 3 && "grid-cols-1 sm:grid-cols-3",
        className,
      )}
    >
      {items.map((item) => {
        const active = item.value === value;
        return (
          <button
            key={item.value}
            type="button"
            role="radio"
            aria-checked={active}
            disabled={item.disabled}
            onClick={() => onChange(item.value)}
            className={cn(
              "group relative flex items-start gap-3 rounded-lg bg-surface p-4 text-left transition-[box-shadow,background-color] duration-150 disabled:opacity-50",
              active
                ? "bg-cream/60 shadow-[0_0_0_1.5px_var(--color-brown)]"
                : "shadow-[0_0_0_1px_var(--color-line-strong)] hover:shadow-[0_0_0_1px_var(--color-ink-4)]",
            )}
          >
            {item.icon && (
              <span
                className={cn(
                  "flex size-9 shrink-0 items-center justify-center rounded-lg transition-colors",
                  active ? "bg-brown text-white" : "bg-subtle text-ink-2",
                )}
              >
                {item.icon}
              </span>
            )}
            <span className="min-w-0 flex-1">
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{item.title}</span>
                {item.meta}
              </span>
              {item.description && <span className="mt-1 block text-[13px] leading-5 text-ink-3">{item.description}</span>}
            </span>
            <span
              className={cn(
                "mt-0.5 flex size-[18px] shrink-0 items-center justify-center rounded-full transition-colors",
                active ? "bg-brown text-white" : "shadow-[inset_0_0_0_1.5px_var(--color-line-strong)]",
              )}
            >
              {active && <Check className="size-3" strokeWidth={3} />}
            </span>
          </button>
        );
      })}
    </div>
  );
}
