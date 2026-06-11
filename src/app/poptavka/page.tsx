import Link from "next/link";
import { InquiryForm } from "@/components/form/InquiryForm";

export const metadata = {
  title: "Pronájem baru Cobra — poptávka · Cobra & Informace",
  description:
    "Poptávkový formulář pro uzavřené společnosti od 36 lidí. Domluvíme se individuálně.",
};

export default async function PoptavkaPage({
  searchParams,
}: {
  searchParams: Promise<{ lide?: string }>;
}) {
  const { lide } = await searchParams;
  const prefill = lide ? Number(lide) : undefined;
  const safePrefill =
    prefill && Number.isFinite(prefill) && prefill >= 36 ? prefill : undefined;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <header className="mb-10">
        <p className="eyebrow">Cobra &amp; Informace · Praha</p>
        <h1 className="mt-3 text-4xl sm:text-5xl text-[var(--color-text)]">
          pronájem baru Cobra — poptávka
        </h1>
        <p className="mt-4 max-w-prose text-[var(--color-text-muted)] leading-relaxed">
          Bar Cobra je ideální pro soukromé akce pro{" "}
          <strong className="text-[var(--color-text)]">50–100 lidí</strong>. Pronájem
          poskytujeme formou garantované minimální útraty. Na všem se s vámi rádi
          dohodneme mailem, telefonicky nebo osobně, dle vaší preference.
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
          Hledáte naopak menší rezervaci?{" "}
          <Link href="/" className="link-subtle">
            Hlavní formulář (10–35 lidí)
          </Link>
          .
        </p>
      </header>

      <InquiryForm prefillPartySize={safePrefill} />
    </main>
  );
}
