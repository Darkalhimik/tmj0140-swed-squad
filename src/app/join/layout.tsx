import { X } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function JoinLayout({ children }: LayoutProps<"/join">) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="border-b border-line bg-canvas">
        <div className="mx-auto flex h-14 max-w-[880px] items-center gap-4 px-4">
          <Link href="/" aria-label="Back to log in">
            <Logo />
          </Link>
          <span className="hidden h-5 w-px bg-line-strong sm:block" />
          <span className="hidden text-sm font-medium text-ink sm:block">Become a customer</span>
          <Link
            href="/"
            className="ml-auto inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[13px] font-medium text-ink-2 hover:bg-subtle hover:text-ink"
          >
            <X className="size-3.5" />
            Close
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
