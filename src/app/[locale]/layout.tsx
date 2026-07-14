import type { Metadata } from "next";
import { Inter } from "next/font/google";
import localFont from "next/font/local";
import Link from "next/link";
import { NextIntlClientProvider } from "next-intl";
import { getMessages, getTranslations } from "next-intl/server";
import { routing } from "@/i18n/routing";
import "../globals.css";

const inter = Inter({
  subsets: ["latin", "latin-ext"],
  variable: "--font-inter",
  display: "swap",
});

const tusker = localFont({
  src: "../../fonts/tusker-grotesk-4500-medium.otf",
  variable: "--font-tusker",
  display: "swap",
  weight: "100 900",
});

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  return {
    title: t("title"),
    description: t("description"),
    robots: { index: true, follow: true },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const messages = await getMessages();
  const t = await getTranslations({ locale, namespace: "layout" });

  return (
    <html lang={locale} className={`${inter.variable} ${tusker.variable}`}>
      <body className="min-h-dvh">
        <NextIntlClientProvider locale={locale} messages={messages}>
          {children}
          <footer className="mx-auto max-w-3xl px-4 pb-12 text-sm text-[var(--color-text-muted)]">
            <div className="border-t border-[var(--color-border)] pt-6">
              <p>
                {t("footerMore")}{" "}
                <strong className="text-[var(--color-text)]">{t("footerBold")}</strong>?{" "}
                <Link href={`/${locale}/inquiry`} className="link-subtle">
                  {t("footerLinkText")}
                </Link>
                {" "}{t("footerSuffix")}
              </p>
            </div>
          </footer>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
