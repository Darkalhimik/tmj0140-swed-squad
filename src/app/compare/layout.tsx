import { ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/brand/logo";

export default function CompareLayout({ children }: LayoutProps<"/compare">) {
  return (
    <div className="min-h-screen bg-canvas">
      <p className="bg-brown px-4 py-2 text-center text-[12px] leading-4 text-white/90">
        Student concept by <span className="font-semibold text-white">SWED SQUAD</span> · TMJ0140/TMJ0130 Introduction to Entrepreneurship (2026
        autumn) · Not affiliated with Swedbank
      </p>
      <header className="sticky top-0 z-30 border-b border-line bg-canvas/90 backdrop-blur-md">
        <div className="mx-auto flex h-14 max-w-[1180px] items-center gap-4 px-4 lg:px-8">
          <Link href="/" aria-label="Concept home">
            <Logo />
          </Link>
          <span className="hidden h-5 w-px bg-line-strong sm:block" />
          <span className="hidden text-sm font-medium text-ink sm:block">Today vs. concept</span>
          <Link
            href="/personal"
            className="ml-auto inline-flex h-9 items-center gap-1.5 rounded-full bg-brown px-4 text-sm font-medium text-white hover:bg-brown-hover"
          >
            Open the concept
            <ArrowRight className="size-4" />
          </Link>
        </div>
      </header>
      {children}
    </div>
  );
}
