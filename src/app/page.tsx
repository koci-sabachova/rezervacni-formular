import { ReservationForm } from "@/components/form/ReservationForm";
import { getCateringMenu } from "@/lib/sheets/fetch";

export const revalidate = 300;

export default async function HomePage() {
  const menu = await getCateringMenu();

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <header className="mb-12">
        <p className="eyebrow">Cobra &amp; Informace · Praha</p>
        <h1 className="mt-3 text-4xl sm:text-5xl text-[var(--color-text)]">
          Rezervace větší skupiny
        </h1>
        <p className="mt-4 text-[var(--color-text-muted)] max-w-prose leading-relaxed">
          Pro skupiny <strong className="text-[var(--color-text)]">10–35 lidí</strong>.
          Vyplňte základní info, sestavte si raut, my se ozveme do 48&nbsp;hodin. Hledáte
          stůl pro 1–10 lidí?{" "}
          <a
            href="https://www.rezervujstul.cz/"
            className="link-subtle"
            target="_blank"
            rel="noopener noreferrer"
          >
            rezervujstul.cz
          </a>
          .
        </p>
      </header>

      <ReservationForm menu={menu} />
    </main>
  );
}
