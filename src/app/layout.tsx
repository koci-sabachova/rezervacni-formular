import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import "./globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const tusker = localFont({
  src: "../fonts/tusker-grotesk-4500-medium.otf",
  variable: "--font-tusker",
  display: "swap",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Rezervace · Cobra & Informace",
  description:
    "Rezervace skupin 10–35 lidí pro bar Cobra a výčep Informace. Catering na míru, ozveme se do 48 hodin.",
  robots: { index: true, follow: true },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="cs" className={`${inter.variable} ${tusker.variable}`}>
      <body className="min-h-dvh">
        {children}
        <footer className="mx-auto max-w-3xl px-4 pb-12 text-sm text-[var(--color-text-muted)]">
          <div className="border-t border-[var(--color-border)] pt-6">
            <p>
              Plánujete akci pro <strong className="text-[var(--color-text)]">ještě více lidí</strong>?{" "}
              <Link href="/poptavka" className="link-subtle">
                Napište nám email
              </Link>
              , pobavíme se spolu o uzavřené společnosti v baru Cobra.
            </p>
          </div>
        </footer>
      </body>
    </html>
  );
}
