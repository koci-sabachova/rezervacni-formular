import type { Metadata } from "next";
import Link from "next/link";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMarks } from "@/components/BrandMarks";
import { getCateringMenu } from "@/lib/sheets/fetch";
import { CATERING_CATEGORIES, type CateringItem } from "@/lib/schemas/catering";
import { formatCzk } from "@/lib/catering/calculate";

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

function priceLine(
  item: CateringItem,
  t: Awaited<ReturnType<typeof getTranslations>>,
  tCatering: Awaited<ReturnType<typeof getTranslations>>,
): string {
  if (item.cena === "individualne") return t("priceIndividual");

  const prices = item.varianty_ceny;
  if (prices) {
    const parts = (item.varianty ?? Object.keys(prices)).map((v) => {
      const p = prices[v];
      return p !== undefined ? `${v} — ${formatCzk(p)}` : v;
    });
    return parts.join(" · ");
  }

  const base = `${item.jednotka} · ${formatCzk(item.cena)}`;
  if (item.kategorie === "kanapky") {
    const min = item.min_pocet ?? 5;
    return `${base} (${tCatering("minPcs", { min })})`;
  }
  return base;
}

export default async function CateringMenuPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [menu, t, tPage, tCatering, tCategories, tItems] = await Promise.all([
    getCateringMenu(),
    getTranslations({ locale, namespace: "cateringPage" }),
    getTranslations({ locale, namespace: "step3" }),
    getTranslations({ locale, namespace: "catering" }),
    getTranslations({ locale, namespace: "schemas.categories" }),
    getTranslations({ locale, namespace: "cateringItems" }),
  ]);

  const grouped = new Map<string, CateringItem[]>();
  for (const item of menu.items) {
    const arr = grouped.get(item.kategorie) ?? [];
    arr.push(item);
    grouped.set(item.kategorie, arr);
  }

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <BrandMarks />
          <h1 className="text-4xl sm:text-5xl text-[var(--color-text)]">{t("title")}</h1>
        </div>
        <p className="mt-4 max-w-prose text-[var(--color-text-muted)] leading-relaxed">
          {t("subtitle")}
        </p>
      </header>

      {menu.source === "snapshot" && (
        <div className="alert-warning mb-8">
          <p className="opacity-80">{tPage("snapshotWarning")}</p>
        </div>
      )}

      {menu.items.length === 0 ? (
        <p className="surface-muted text-sm text-[var(--color-text-muted)]">
          {tCatering("empty")}
        </p>
      ) : (
        <div className="space-y-10">
          {CATERING_CATEGORIES.map((cat) => {
            const items = grouped.get(cat);
            if (!items || items.length === 0) return null;
            return (
              <section key={cat}>
                <h2 className="mb-3 eyebrow !text-[11px]">{tCategories(cat)}</h2>
                <div>
                  {items.map((item) => (
                    <div
                      key={item.id}
                      className="flex flex-col gap-1 py-4 border-b border-[var(--color-border)] last:border-0"
                    >
                      <p className="font-medium text-[var(--color-text)]">{tItems(item.id)}</p>
                      {item.popis && (
                        <p className="text-xs text-[var(--color-text-subtle)]">{item.popis}</p>
                      )}
                      <p className="text-xs text-[var(--color-text-subtle)]">
                        {priceLine(item, t, tCatering)}
                      </p>
                    </div>
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      )}

      <p className="mt-10 text-sm text-[var(--color-text-subtle)]">
        {t("reserveText")}{" "}
        <Link href={`/${locale}`} className="link-subtle">
          {t("reserveLink")}
        </Link>
      </p>
    </main>
  );
}
