import type { Metadata } from "next";
import { Roboto, Roboto_Mono, Rubik } from "next/font/google";
import { ToastProvider } from "@/components/ui/toast";
import { StoreProvider } from "@/lib/store";
import "./globals.css";

// Roboto is Swedbank's own body typeface; Rubik stands in for Swedbank Headline.
const roboto = Roboto({
  variable: "--font-roboto",
  subsets: ["latin", "latin-ext"],
  weight: ["400", "500", "700"],
});

const rubik = Rubik({
  variable: "--font-rubik",
  subsets: ["latin", "latin-ext"],
  weight: ["500", "600", "700"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
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
    <html lang="en" className={`${roboto.variable} ${rubik.variable} ${robotoMono.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full">
        <StoreProvider>
          <ToastProvider>{children}</ToastProvider>
        </StoreProvider>
      </body>
    </html>
  );
}
