import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMarks } from "@/components/BrandMarks";
import { CateringOrderForm } from "@/components/form/CateringOrderForm";
import { getCateringMenu } from "@/lib/sheets/fetch";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.cateringMenu" });
  return { title: t("title"), description: t("description") };
}

export default async function CateringMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [menu, t] = await Promise.all([
    getCateringMenu(),
    getTranslations({ locale, namespace: "cateringPage" }),
  ]);

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <BrandMarks />
          <h1 className="text-4xl sm:text-5xl text-[var(--color-text)]">{t("title")}</h1>
        </div>
        <p className="mt-4 max-w-prose text-[var(--color-text-muted)] leading-relaxed">
          {t("subtitle")}
        </p>
      </header>

      <CateringOrderForm menu={menu} />
    </main>
  );
}
