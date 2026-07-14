import { getTranslations, setRequestLocale } from "next-intl/server";
import { ReservationForm } from "@/components/form/ReservationForm";
import { getCateringMenu } from "@/lib/sheets/fetch";

export const revalidate = 300;

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [menu, t] = await Promise.all([
    getCateringMenu(),
    getTranslations({ locale, namespace: "home" }),
  ]);

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <header className="mb-12">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h1 className="mt-3 text-4xl sm:text-5xl text-[var(--color-text)]">
          {t("title")}
        </h1>
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
