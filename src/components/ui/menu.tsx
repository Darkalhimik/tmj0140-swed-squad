"use client";

import { useLayoutEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/cn";
import { useEscape, useOutsideClick } from "@/lib/hooks";

export type MenuItem =
  | {
      label: ReactNode;
      icon?: ReactNode;
      onSelect: () => void;
      danger?: boolean;
      hint?: ReactNode;
      disabled?: boolean;
    }
  | "separator";

/** Small dropdown menu anchored to a trigger. */
export function Menu({
  trigger,
  items,
  align = "end",
  header,
  className,
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  items: MenuItem[];
  align?: "start" | "end";
  header?: ReactNode;
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useOutsideClick(ref, open, () => setOpen(false));
  useEscape(open, () => setOpen(false));
  // Transient: close when the page is hidden by <Activity>.
  useLayoutEffect(() => () => setOpen(false), []);

  return (
    <div ref={ref} className="relative inline-flex">
      {trigger({ open, toggle: () => setOpen((o) => !o) })}
      {open && (
        <div
          role="menu"
          className={cn(
            "absolute top-[calc(100%+6px)] z-40 min-w-52 animate-pop-in rounded-lg bg-surface p-1 shadow-menu",
            align === "end" ? "right-0" : "left-0",
            className,
          )}
        >
          {header && <div className="px-2.5 pt-1.5 pb-2">{header}</div>}
          {items.map((item, i) =>
            item === "separator" ? (
              <div key={i} className="my-1 h-px bg-line" />
            ) : (
              <button
                key={i}
                role="menuitem"
                disabled={item.disabled}
                onClick={() => {
                  setOpen(false);
                  item.onSelect();
                }}
                className={cn(
                  "flex h-9 w-full items-center gap-2.5 rounded-md px-2.5 text-left text-sm transition-colors disabled:opacity-40",
                  item.danger ? "text-danger hover:bg-danger-soft" : "text-ink hover:bg-subtle",
                )}
              >
                {item.icon && <span className={cn("shrink-0", item.danger ? "text-danger" : "text-ink-3")}>{item.icon}</span>}
                <span className="flex-1">{item.label}</span>
                {item.hint && <span className="text-[12px] text-ink-4">{item.hint}</span>}
              </button>
            ),
          )}
        </div>
      )}
    </div>
  );
}
