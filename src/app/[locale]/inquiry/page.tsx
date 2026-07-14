import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { InquiryForm } from "@/components/form/InquiryForm";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.inquiry" });
  return { title: t("title"), description: t("description") };
}

export default async function InquiryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ guests?: string }>;
}) {
  const [{ locale }, { guests }] = await Promise.all([params, searchParams]);
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "inquiryPage" });

  const prefill = guests ? Number(guests) : undefined;
  const safePrefill =
    prefill && Number.isFinite(prefill) && prefill >= 36 ? prefill : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <header className="mb-10">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl text-[var(--color-text)]">
          {t("title")}
        </h1>
        <p className="mt-4 max-w-prose text-[var(--color-text-muted)] leading-relaxed">
          {t.rich("description", {
            capacity: () => (
              <strong className="text-[var(--color-text)]">{t("capacity")}</strong>
            ),
          })}
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
          {t("smallerText")}{" "}
          <Link href={`/${locale}`} className="link-subtle">
            {t("smallerLink")}
          </Link>
          .
        </p>
      </header>

      <InquiryForm prefillPartySize={safePrefill} />
    </main>
  );
}
