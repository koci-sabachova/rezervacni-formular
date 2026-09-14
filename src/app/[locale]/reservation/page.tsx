import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReservationForm } from "@/components/form/ReservationForm";
import { BrandMarks } from "@/components/BrandMarks";
import { getCateringMenu } from "@/lib/sheets/fetch";

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.reservation" });
  return { title: t("title"), description: t("description") };
}

export default async function ReservationPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [menu, t] = await Promise.all([
    getCateringMenu(),
    getTranslations({ locale, namespace: "reservationPage" }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <header className="mb-12">
        <div className="flex items-center gap-3">
          <BrandMarks />
          <h1 className="text-4xl sm:text-5xl text-[var(--color-text)]">
            {t("title")}
          </h1>
        </div>
        <p className="mt-4 text-[var(--color-text-muted)] max-w-prose leading-relaxed">
          {t("descriptionGroups")}{" "}
          <strong className="text-[var(--color-text)]">{t("descriptionGroupsBold")}</strong>.{" "}
          {t("descriptionFill")}{" "}
          <a
            href={`https://barcobra.rezervujstul.cz/reservation-form.php?lang=${locale === "cs" ? "cz" : "en"}`}
            className="link-subtle"
            target="_blank"
            rel="noopener noreferrer"
          >
            {t("descriptionLink")}
          </a>
          .
        </p>
      </header>

      <ReservationForm menu={menu} />
    </main>
  );
}
