import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { BrandMarks } from "@/components/BrandMarks";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "metadata.home" });
  return { title: t("title"), description: t("description") };
}

export default async function HubPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations({ locale, namespace: "hub" });

  const options = [
    {
      key: "smallCobra",
      href: `https://barcobra.rezervujstul.cz/reservation-form.php?lang=${locale === "cs" ? "cz" : "en"}`,
      external: true,
      icon: "cobra",
    },
    {
      key: "smallInformace",
      href: `https://barcobra-vycep.rezervujstul.cz/reservation-form.php?lang=${locale === "cs" ? "cz" : "en"}`,
      external: true,
      icon: "informace",
    },
    {
      key: "medium",
      href: `/${locale}/reservation`,
      external: false,
      icon: undefined,
    },
    {
      key: "large",
      href: `/${locale}/inquiry`,
      external: false,
      icon: "cobra",
    },
  ] as const;

  return (
    <main className="mx-auto max-w-3xl px-4 py-12 sm:py-20">
      <header className="mb-10">
        <div className="flex items-center gap-3">
          <BrandMarks />
          <h1 className="text-4xl sm:text-5xl text-[var(--color-text)]">
            {t("title")}
          </h1>
        </div>
        <p className="mt-4 text-[var(--color-text-muted)] max-w-prose leading-relaxed">
          {t("subtitle")}
        </p>
      </header>

      <div className="grid gap-4">
        {options.map(({ key, href, external, icon }) => {
          const card = (
            <div className="group flex items-start gap-4 rounded-2xl p-5 sm:p-6 transition bg-[var(--color-bg-elevated)] hover:bg-[#e9e4da]">
              <div className="flex-1">
                <span className="chip">{t(`${key}.label`)}</span>
                <div className="mt-3 flex items-center gap-2">
                  {icon && (
                    <Image
                      src={`/brand/${icon}-mark.png`}
                      alt=""
                      width={24}
                      height={24}
                      className="h-6 w-6"
                    />
                  )}
                  <h2 className="text-xl font-medium text-[var(--color-text)]">
                    {t(`${key}.title`)}
                  </h2>
                </div>
                <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                  {t(`${key}.body`)}
                </p>
                {key === "medium" && (
                  <ul className="mt-3 space-y-1.5">
                    {(["bullet1", "bullet2", "bullet3"] as const).map((b) => (
                      <li key={b} className="flex gap-2 text-sm text-[var(--color-text-muted)]">
                        <span aria-hidden className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--color-gold)]" />
                        <span>{t(`${key}.${b}`)}</span>
                      </li>
                    ))}
                  </ul>
                )}
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--color-accent-soft)]">
                  {t(`${key}.cta`)}
                  <span aria-hidden className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </div>
            </div>
          );

          return external ? (
            <a
              key={key}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="block"
            >
              {card}
            </a>
          ) : (
            <Link key={key} href={href} className="block">
              {card}
            </Link>
          );
        })}
      </div>
    </main>
  );
}
