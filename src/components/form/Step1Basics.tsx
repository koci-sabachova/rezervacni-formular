"use client";

import { useFormContext } from "react-hook-form";
import { tomorrowIso } from "@/lib/utils/dates";
import {
  TIME_SLOTS,
  VENUES,
  VENUE_LABELS,
  EVENT_TYPES,
  EVENT_TYPE_LABELS,
  MIN_PARTY_SIZE,
  MAX_PARTY_SIZE_MAIN,
  type ReservationInput,
} from "@/lib/schemas/reservation";

type VenueProfile = {
  tagline?: string;
  bullets?: string[];
  fitsYou?: string;
  links?: { label: string; href: string }[];
};

const VENUE_PROFILES: Record<(typeof VENUES)[number], VenueProfile> = {
  cobra: {
    bullets: [
      "Široká nabídka koktejlů včetně signature menu",
      "Večeře, obědy, o víkendu brunch",
      "Standardní výběr piv, vín a destilátů",
    ],
    fitsYou: "Hodí se pro rezervace do 20 lidí.",
    links: [
      { label: "Stránky podniku", href: "https://barcobra.cz/cs/" },
      {
        label: "Nápojový lístek (PDF)",
        href: "https://www.barcobra.cz/dl/bar-cobra-napojovy-listek-cs.pdf",
      },
      {
        label: "Signature menu (PDF)",
        href: "https://www.barcobra.cz/dl/bar-cobra-cocktails-cs.pdf",
      },
    ],
  },
  informace: {
    tagline: "Menší, neformální podnik propojený s Cobrou.",
    bullets: [
      "Základní nabídka vín, koktejlů a destilátů",
      "Samoobslužná sekce s drobnými jídly k pivu",
      "Večeři lze objednat z Cobry — kuchyň je společná",
    ],
    fitsYou:
      "Sedne vám, když chcete pivní akci, větší partu a neformální atmosféru.",
    links: [
      { label: "Stránky podniku", href: "https://www.barcobra.cz/informace/cs/" },
      {
        label: "Menu (PDF)",
        href: "https://www.barcobra.cz/informace/dl/informace-menu-cs.pdf",
      },
    ],
  },
  unsure: {
    tagline:
      "Společně najdeme to pravé pro vaši rezervaci.",
  },
};

export function Step1Basics() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ReservationInput>();

  const partySize = Number(watch("partySize") ?? 0);
  const venue = watch("venue");
  const eventType = watch("eventType");
  const overflow = partySize > MAX_PARTY_SIZE_MAIN;
  const underflow = partySize > 0 && partySize < MIN_PARTY_SIZE;
  const minDate = tomorrowIso();

  const showLargeCobraHint = venue === "cobra" && partySize >= 30;

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="date" className="field-label">
            Datum <span className="text-[var(--color-accent-soft)]">*</span>
          </label>
          <input
            id="date"
            type="date"
            min={minDate}
            className="input-base"
            {...register("date")}
          />
          {errors.date && <p className="field-error">{errors.date.message as string}</p>}
          <p className="field-hint">
            Nejdřívější možný termín je <strong>zítra</strong>. Pro catering potřebujeme aspoň 3
            dny.
          </p>
        </div>

        <div>
          <label htmlFor="time" className="field-label">
            Začátek <span className="text-[var(--color-accent-soft)]">*</span>
          </label>
          <select id="time" className="input-base" {...register("time")}>
            <option value="">Vyberte čas</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>
                {slot}
              </option>
            ))}
          </select>
          {errors.time && <p className="field-error">{errors.time.message as string}</p>}
          <p className="field-hint">14:00–20:30 (po 30 minutách)</p>
          <p className="field-hint">Z kapacitních důvodů nepřijímáme rezervace po 20:30.</p>
        </div>
      </div>

      <div>
        <label htmlFor="partySize" className="field-label">
          Počet lidí <span className="text-[var(--color-accent-soft)]">*</span>
        </label>
        <input
          id="partySize"
          type="number"
          inputMode="numeric"
          min={1}
          max={100}
          className="input-base sm:max-w-[180px]"
          {...register("partySize")}
        />
        {errors.partySize && (
          <p className="field-error">{errors.partySize.message as string}</p>
        )}
        {underflow && (
          <div className="alert-warning mt-3">
            <p className="font-medium text-[var(--color-gold-soft)]">
              Pro {MIN_PARTY_SIZE} a méně lidí máme jednodušší cestu.
            </p>
            <p className="mt-1 opacity-80">
              Tenhle formulář je dělaný pro větší skupiny — na menší stůl se rychleji
              dostanete přes{" "}
              <a
                href="https://www.rezervujstul.cz/"
                target="_blank"
                rel="noopener noreferrer"
                className="link-subtle"
              >
                rezervujstul.cz
              </a>
              . Pokud chcete, pokračujte ale klidně dál — domluvíme se.
            </p>
          </div>
        )}
        {overflow && (
          <div className="alert-warning mt-3">
            <p className="font-medium text-[var(--color-gold-soft)]">
              Nad 35 lidí to řešíme individuálně.
            </p>
            <p className="mt-1 opacity-80">
              Pro uzavřené společnosti máme zvlášť poptávkový formulář — domluvíme se
              telefonicky nebo na schůzce.
            </p>
            <a
              href={`/poptavka?lide=${partySize}`}
              className="btn-accent mt-4 text-sm"
            >
              Pokračovat na poptávkový formulář
            </a>
          </div>
        )}
      </div>

      <fieldset>
        <legend className="field-label mb-3">
          Kam to chcete? <span className="text-[var(--color-accent-soft)]">*</span>
        </legend>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          Cobra a Informace jsou dva podniky{" "}
          <strong className="text-[var(--color-text)]">10 metrů od sebe</strong> —
          rádi vám do výčepu doneseme večeři z Cobry.
        </p>
        <div className="grid gap-3">
          {VENUES.map((v) => {
            const profile = VENUE_PROFILES[v];
            return (
              <label
                key={v}
                className="card cursor-pointer hover:!border-[var(--color-border-strong)] has-[:checked]:!border-[var(--color-accent)] has-[:checked]:bg-[var(--color-card-hover)] has-[:checked]:shadow-[0_0_0_3px_rgba(31,110,90,0.15)]"
              >
                <div className="flex items-start gap-3">
                  <input
                    type="radio"
                    value={v}
                    className="mt-1.5 h-4 w-4 accent-[var(--color-accent)]"
                    {...register("venue")}
                  />
                  <div className="flex-1">
                    <div className="flex flex-wrap items-baseline gap-2">
                      <span className="text-lg font-medium text-[var(--color-text)]">
                        {VENUE_LABELS[v]}
                      </span>
                    </div>
                    {profile.tagline && (
                      <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                        {profile.tagline}
                      </p>
                    )}
                    {profile.bullets && (
                      <ul className="mt-3 space-y-1.5">
                        {profile.bullets.map((b) => (
                          <li
                            key={b}
                            className="flex gap-2 text-sm text-[var(--color-text-muted)]"
                          >
                            <span
                              aria-hidden
                              className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--color-gold)]"
                            />
                            <span>{b}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                    {profile.fitsYou && (
                      <p className="mt-3 text-sm italic text-[var(--color-text-subtle)]">
                        {profile.fitsYou}
                      </p>
                    )}
                    {profile.links && (
                      <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                        {profile.links.map((link) => (
                          <li key={link.href}>
                            <a
                              href={link.href}
                              target="_blank"
                              rel="noopener noreferrer"
                              onClick={(e) => e.stopPropagation()}
                              className="link-subtle"
                            >
                              {link.label}
                            </a>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </div>
              </label>
            );
          })}
        </div>
        {errors.venue && <p className="field-error mt-2">{errors.venue.message as string}</p>}
      </fieldset>

      {showLargeCobraHint && (
        <div className="alert-warning">
          <p className="font-medium text-[var(--color-gold-soft)]">Tip k výběru podniku</p>
          <p className="mt-1 opacity-80">
            Pro skupiny nad 30 lidí v Cobře už mluvíme o uzavřené společnosti. Pokud
            vám nejde primárně o koktejlové menu, bývá pro takovou partu praktičtější{" "}
            <strong className="text-[var(--color-gold-soft)]">Informace</strong> — jídlo
            z Cobry si tam stejně můžete objednat. Volba je samozřejmě na vás.
          </p>
        </div>
      )}

      <fieldset>
        <legend className="field-label mb-3">
          Druh akce
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EVENT_TYPES.map((t) => (
            <label
              key={t}
              className="flex cursor-pointer items-center justify-center rounded-lg border bg-[var(--color-bg-elevated)] border-[var(--color-border)] px-3 py-3 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent)] has-[:checked]:text-white has-[:checked]:shadow-[0_4px_14px_-4px_rgba(31,110,90,0.4)]"
            >
              <input
                type="radio"
                value={t}
                className="sr-only"
                {...register("eventType")}
              />
              {EVENT_TYPE_LABELS[t]}
            </label>
          ))}
        </div>
        {errors.eventType && (
          <p className="field-error mt-2">{errors.eventType.message as string}</p>
        )}
        {eventType === "jine" && (
          <input
            type="text"
            placeholder="Doplňte prosím (volitelně)"
            className="input-base mt-3"
            {...register("eventTypeOther")}
          />
        )}
      </fieldset>
    </div>
  );
}
