import { cn } from "@/lib/cn";
import { initials } from "@/lib/format";

const palette = [
  "bg-[#fde3cf] text-[#9a4410]",
  "bg-[#e6dcf7] text-[#5a3aa8]",
  "bg-[#d7ecf0] text-[#1d6f78]",
  "bg-[#fbe3e3] text-[#a33a36]",
  "bg-[#e2efd9] text-[#3b6f22]",
  "bg-[#f3e6d6] text-[#6e4b2a]",
  "bg-[#dfe7f7] text-[#2f55a0]",
];

function hash(s: string) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) | 0;
  return Math.abs(h);
}

const sizes = {
  xs: "size-5 text-[9px]",
  sm: "size-6 text-[10px]",
  md: "size-8 text-[12px]",
  lg: "size-10 text-[14px]",
  xl: "size-12 text-[16px]",
};

export function Avatar({
  name,
  size = "md",
  square,
  className,
}: {
  name: string;
  size?: keyof typeof sizes;
  square?: boolean;
  className?: string;
}) {
  return (
    <span
      title={name}
      className={cn(
        "inline-flex shrink-0 select-none items-center justify-center font-semibold tracking-tight",
        square ? "rounded-md" : "rounded-full",
        sizes[size],
        palette[hash(name) % palette.length],
        className,
      )}
    >
      {initials(name)}
    </span>
  );
}

export function AvatarGroup({ names, size = "sm", max = 4 }: { names: string[]; size?: keyof typeof sizes; max?: number }) {
  const shown = names.slice(0, max);
  const rest = names.length - shown.length;
  return (
    <span className="inline-flex items-center -space-x-1.5">
      {shown.map((n) => (
        <Avatar key={n} name={n} size={size} className="ring-2 ring-surface" />
      ))}
      {rest > 0 && (
        <span className={cn("inline-flex items-center justify-center rounded-full bg-muted font-medium text-ink-2 ring-2 ring-surface", sizes[size])}>
          +{rest}
        </span>
      )}
    </span>
  );
}
