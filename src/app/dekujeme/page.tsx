import Link from "next/link";

export const metadata = {
  title: "Děkujeme — Cobra & Informace",
  robots: { index: false, follow: false },
};

export default async function ThanksPage({
  searchParams,
}: {
  searchParams: Promise<{ typ?: string }>;
}) {
  const { typ } = await searchParams;
  const isInquiry = typ === "poptavka";

  return (
    <main className="mx-auto max-w-2xl px-4 py-16 sm:py-24">
      <div className="card text-center !p-10 sm:!p-14">
        <p className="eyebrow">Cobra &amp; Informace</p>
        <h1 className="mt-4 text-4xl sm:text-5xl text-[var(--color-text)]">
          {isInquiry ? "Díky za poptávku!" : "Díky za rezervaci!"}
        </h1>
        <p className="mt-5 text-[var(--color-text-muted)] leading-relaxed">
          {isInquiry
            ? "Větší akce řešíme individuálně, takže vám během několika dní zavoláme nebo napíšeme — domluvíme termín, podnik a co s cateringem."
            : "Vaši rezervaci jsme přijali. Brzy vám pošleme potvrzení nebo upřesňující dotaz na e-mail. Ozveme se do 48 hodin."}
        </p>
        <p className="mt-3 text-sm text-[var(--color-text-subtle)]">
          Mezitím sledujte svou doručenou poštu (i složku se spamem).
        </p>

        <div className="mt-10 flex flex-col items-center gap-3">
          <Link href="/" className="btn-ghost">
            Zpět na rezervační formulář
          </Link>
        </div>
      </div>
    </main>
  );
}
