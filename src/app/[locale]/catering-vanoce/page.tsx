import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { BrandMarks } from "@/components/BrandMarks";
import { CateringOrderForm } from "@/components/form/CateringOrderForm";
import { cateringVanoceMenu } from "@/data/catering-vanoce-menu";

// Public Christmas catering menu — Czech only, not translated to en.

export function generateMetadata(): Metadata {
  return {
    title: "Vánoční catering · Cobra",
    description: "Kompletní nabídka vánočního cateringu — sestavte si objednávku a pošlete nám ji.",
  };
}

export default async function CateringVanocePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (locale !== "cs") notFound();
  setRequestLocale(locale);

  const menu = {
    items: cateringVanoceMenu,
    source: "snapshot" as const,
    fetchedAt: new Date().toISOString(),
  };

  return (
    <main className="mx-auto max-w-5xl px-4 py-12 sm:py-20">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <BrandMarks />
          <h1 className="text-4xl sm:text-5xl text-[var(--color-text)]">Vánoční catering</h1>
        </div>
        <p className="mt-4 max-w-prose text-[var(--color-text-muted)] leading-relaxed">
          Kompletní nabídka na vánoční akce. Naklikejte si položky a pošlete nám objednávku —
          ozveme se s potvrzením.
        </p>
      </header>

      <CateringOrderForm menu={menu} draftKey="catering-order-draft-v1:vanoce" />
    </main>
  );
}
