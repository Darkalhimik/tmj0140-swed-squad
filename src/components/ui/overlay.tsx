"use client";

import { X } from "lucide-react";
import type { ReactNode } from "react";
import { createPortal } from "react-dom";
import { cn } from "@/lib/cn";
import { useBodyLock, useCloseOnHide, useEscape } from "@/lib/hooks";

type OverlayProps = {
  open: boolean;
  onClose: () => void;
  title?: ReactNode;
  description?: ReactNode;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
};

function useOverlay(open: boolean, onClose: () => void) {
  useEscape(open, onClose);
  useBodyLock(open);
  useCloseOnHide(open, onClose);
}

/** Right-hand side sheet for details (transactions, members, payments). */
export function Drawer({ open, onClose, title, description, children, footer, className }: OverlayProps) {
  useOverlay(open, onClose);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 animate-fade-in bg-ink/25 backdrop-blur-[1px]" onClick={onClose} />
      <aside
        role="dialog"
        aria-modal="true"
        className={cn(
          "absolute top-2 right-2 bottom-2 flex w-[min(500px,calc(100vw-16px))] animate-slide-in-right flex-col overflow-hidden rounded-xl bg-surface shadow-modal",
          className,
        )}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-4 border-b border-line px-5 py-4">
            <div className="min-w-0">
              {title && <h2 className="text-base font-semibold tracking-[-0.01em]">{title}</h2>}
              {description && <p className="mt-0.5 text-[13px] text-ink-3">{description}</p>}
            </div>
            <CloseButton onClick={onClose} />
          </header>
        )}
        <div className="flex-1 overflow-y-auto">{children}</div>
        {footer && <footer className="flex items-center justify-end gap-2 border-t border-line bg-canvas px-5 py-3">{footer}</footer>}
      </aside>
    </div>,
    document.body,
  );
}

/** Centered dialog for confirmations and short forms. */
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  className,
  size = "md",
  dismissable = true,
}: OverlayProps & { size?: "sm" | "md" | "lg"; dismissable?: boolean }) {
  const close = dismissable ? onClose : () => {};
  useOverlay(open, close);
  if (!open) return null;
  return createPortal(
    <div className="fixed inset-0 z-50 flex items-end justify-center p-2 sm:items-center sm:p-6">
      <div className="absolute inset-0 animate-fade-in bg-ink/25 backdrop-blur-[1px]" onClick={close} />
      <div
        role="dialog"
        aria-modal="true"
        className={cn(
          "relative flex max-h-[calc(100vh-32px)] w-full animate-pop-in flex-col overflow-hidden rounded-xl bg-surface shadow-modal",
          size === "sm" && "max-w-[400px]",
          size === "md" && "max-w-[520px]",
          size === "lg" && "max-w-[680px]",
          className,
        )}
      >
        {(title || description) && (
          <header className="flex items-start justify-between gap-4 px-6 pt-5 pb-1">
            <div className="min-w-0">
              {title && <h2 className="text-lg font-semibold tracking-[-0.015em]">{title}</h2>}
              {description && <p className="mt-1 text-sm text-ink-3">{description}</p>}
            </div>
            {dismissable && <CloseButton onClick={onClose} />}
          </header>
        )}
        <div className="flex-1 overflow-y-auto px-6 py-4">{children}</div>
        {footer && (
          <footer className="flex items-center justify-end gap-2 border-t border-line bg-canvas px-6 py-3">{footer}</footer>
        )}
      </div>
    </div>,
    document.body,
  );
}

function CloseButton({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      aria-label="Close"
      className="-mt-1 -mr-1 inline-flex size-8 shrink-0 items-center justify-center rounded-md text-ink-3 transition-colors hover:bg-subtle hover:text-ink"
    >
      <X className="size-4" />
    </button>
  );
}
