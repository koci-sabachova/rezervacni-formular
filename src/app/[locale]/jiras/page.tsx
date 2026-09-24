import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BrandMarks } from "@/components/BrandMarks";
import { CateringOrderForm } from "@/components/form/CateringOrderForm";
import { jirasMenu, JIRAS_DEFAULT_PICKS } from "@/data/jiras-menu";

// Private one-off order page for an already-agreed event — not linked from
// anywhere in the site, not indexed, Czech only.

export function generateMetadata(): Metadata {
  return { title: "Objednávka · Jiráš", robots: { index: false, follow: false } };
}

export default async function JirasPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "cs") notFound();
  setRequestLocale(locale);

  const menu = { items: jirasMenu, source: "snapshot" as const, fetchedAt: new Date().toISOString() };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <BrandMarks />
          <h1 className="text-4xl sm:text-5xl text-[var(--color-text)]">Objednávka</h1>
        </div>
        <p className="mt-4 max-w-prose text-[var(--color-text-muted)] leading-relaxed">
          Množství je předvyplněné podle domluvy — před odesláním klidně upravte.
        </p>
      </header>

      <CateringOrderForm
        menu={menu}
        defaultCatering={JIRAS_DEFAULT_PICKS}
        draftKey="catering-order-draft-v1:jiras"
        showPhone={false}
        showEmail={false}
        showEventDate={false}
      />
    </main>
  );
}
