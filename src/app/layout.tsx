import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin", "latin-ext"],
});

export const metadata: Metadata = {
  title: {
    default: "Swedbank concept · SWED SQUAD",
    template: "%s · Swedbank concept by SWED SQUAD",
  },
  description: "Student concept by SWED SQUAD (TMJ0140/TMJ0130 Introduction to Entrepreneurship, 2026 autumn): a redesign of the Swedbank Estonia internet bank. Not affiliated with Swedbank.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
