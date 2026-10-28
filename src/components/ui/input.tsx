import { useId, type ComponentProps, type ReactNode } from "react";
import { cn } from "@/lib/cn";

export function Field({
  label,
  hint,
  error,
  optional,
  htmlFor,
  children,
  className,
}: {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  htmlFor?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-1.5", className)}>
      {label && (
        <label htmlFor={htmlFor} className="flex items-center justify-between text-[13px] font-medium text-ink-2">
          <span>{label}</span>
          {optional && <span className="font-normal text-ink-4">Optional</span>}
        </label>
      )}
      {children}
      {error ? (
        <p className="text-[12px] text-danger">{error}</p>
      ) : hint ? (
        <p className="text-[12px] text-ink-3">{hint}</p>
      ) : null}
    </div>
  );
}

type InputProps = Omit<ComponentProps<"input">, "prefix" | "size"> & {
  label?: ReactNode;
  hint?: ReactNode;
  error?: ReactNode;
  optional?: boolean;
  prefix?: ReactNode;
  suffix?: ReactNode;
  mono?: boolean;
  size?: "sm" | "md" | "lg";
  wrapperClassName?: string;
};

export function Input({
  label,
  hint,
  error,
  optional,
  prefix,
  suffix,
  mono,
  size = "md",
  className,
  wrapperClassName,
  id,
  ...rest
}: InputProps) {
  const autoId = useId();
  const inputId = id ?? autoId;
  const control = (
    <div
      className={cn(
        "group flex items-center gap-2 rounded-md bg-surface px-3 shadow-[0_0_0_1px_var(--color-line-strong)] transition-shadow focus-within:shadow-[0_0_0_1px_var(--color-ink-3),0_0_0_4px_rgb(81_43_43/0.06)]",
        error && "shadow-[0_0_0_1px_var(--color-danger)] focus-within:shadow-[0_0_0_1px_var(--color-danger),0_0_0_4px_rgb(200_49_44/0.12)]",
        size === "sm" && "h-8",
        size === "md" && "h-10",
        size === "lg" && "h-12",
        rest.disabled && "bg-subtle opacity-70",
        wrapperClassName,
      )}
    >
      {prefix && <span className="flex shrink-0 items-center text-ink-3">{prefix}</span>}
      <input
        id={inputId}
        className={cn(
          "h-full w-full min-w-0 bg-transparent text-sm text-ink outline-none placeholder:text-ink-4",
          size === "lg" && "text-[15px]",
          mono && "font-mono text-[13px] tracking-tight",
          className,
        )}
        aria-invalid={!!error || undefined}
        {...rest}
      />
      {suffix && <span className="flex shrink-0 items-center text-ink-3">{suffix}</span>}
    </div>
  );
  if (!label && !hint && !error) return control;
  return (
    <Field label={label} hint={hint} error={error} optional={optional} htmlFor={inputId}>
      {control}
    </Field>
  );
}

export function Textarea({ className, ...rest }: ComponentProps<"textarea">) {
  return (
    <textarea
      className={cn(
        "min-h-20 w-full rounded-md bg-surface px-3 py-2 text-sm text-ink shadow-[0_0_0_1px_var(--color-line-strong)] outline-none placeholder:text-ink-4 focus:shadow-[0_0_0_1px_var(--color-ink-3),0_0_0_4px_rgb(81_43_43/0.06)]",
        className,
      )}
      {...rest}
    />
  );
}

export function Select({ className, children, ...rest }: ComponentProps<"select">) {
  return (
    <div className="relative">
      <select
        className={cn(
          "h-10 w-full appearance-none rounded-md bg-surface pl-3 pr-9 text-sm text-ink shadow-[0_0_0_1px_var(--color-line-strong)] outline-none focus:shadow-[0_0_0_1px_var(--color-ink-3),0_0_0_4px_rgb(81_43_43/0.06)]",
          className,
        )}
        {...rest}
      >
        {children}
      </select>
      <svg
        viewBox="0 0 16 16"
        className="pointer-events-none absolute top-1/2 right-3 size-4 -translate-y-1/2 text-ink-3"
        aria-hidden
      >
        <path d="M4 6l4 4 4-4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}
