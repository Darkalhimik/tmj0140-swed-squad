import { Phone, X } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { CommandMenu } from "@/components/shell/command-menu";

export default function StartLayout({ children }: LayoutProps<"/start">) {
  return (
    <div className="min-h-screen bg-canvas">
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/85 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1120px] items-center gap-4 px-4 lg:px-8">
          <Link href="/personal" aria-label="Swedbank home">
            <Logo />
          </Link>
          <span className="hidden h-5 w-px bg-line-strong sm:block" />
          <span className="hidden text-sm font-medium whitespace-nowrap text-ink sm:block">Start a company</span>
          <div className="ml-auto flex items-center gap-2">
            <a
              href="tel:+3726132222"
              className="hidden items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] text-ink-3 hover:bg-subtle hover:text-ink sm:inline-flex"
            >
              <Phone className="size-3.5" />
              613 2222
            </a>
            <Link
              href="/personal"
              className="inline-flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-[13px] font-medium whitespace-nowrap text-ink-2 hover:bg-subtle hover:text-ink"
            >
              <X className="size-3.5" />
              Save and exit
            </Link>
          </div>
        </div>
      </header>
      {children}
      <CommandMenu />
    </div>
  );
}
