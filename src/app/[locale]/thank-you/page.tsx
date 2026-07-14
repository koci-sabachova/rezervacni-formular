import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations } from "next-intl/server";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.thankYou" });
  return { title: t("title"), robots: { index: false, follow: false } };
}

export default async function ThanksPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ typ?: string }>;
}) {
  const [{ locale }, { typ }] = await Promise.all([params, searchParams]);
  const t = await getTranslations({ locale, namespace: "thankYou" });
  const isInquiry = typ === "inquiry";

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="card text-center !p-10 sm:!p-14">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-4 text-4xl sm:text-5xl text-[var(--color-text)]">
          {isInquiry ? t("inquiryTitle") : t("reservationTitle")}
        </h1>
        <p className="mt-5 text-[var(--color-text-muted)] leading-relaxed">
          {isInquiry ? t("inquiryBody") : t("reservationBody")}
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
          {t("spam")}
        </p>
        <div className="mt-10 flex flex-col items-center gap-3">
          <Link href={`/${locale}`} className="btn-ghost">
            {t("back")}
          </Link>
        </div>
      </div>
    </main>
  );
}
