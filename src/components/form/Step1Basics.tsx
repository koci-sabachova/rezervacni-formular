"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations, useLocale } from "next-intl";
import { tomorrowIso } from "@/lib/utils/dates";
import {
  TIME_SLOTS,
  VENUES,
  EVENT_TYPES,
  MIN_PARTY_SIZE,
  MAX_PARTY_SIZE_MAIN,
  type ReservationInput,
} from "@/lib/schemas/reservation";

export function Step1Basics() {
  const {
    register,
    watch,
    formState: { errors },
  } = useFormContext<ReservationInput>();

  const t = useTranslations("step1");
  const tSchemas = useTranslations("schemas");
  const locale = useLocale();

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
            {t("date.label")} <span className="text-[var(--color-accent-soft)]">*</span>
          </label>
          <input
            id="date"
            type="date"
            min={minDate}
            className="input-base"
            {...register("date")}
          />
          {errors.date && <p className="field-error">{errors.date.message as string}</p>}
          <p className="field-hint">{t("date.hint")}</p>
        </div>

        <div>
          <label htmlFor="time" className="field-label">
            {t("time.label")} <span className="text-[var(--color-accent-soft)]">*</span>
          </label>
          <select id="time" className="input-base" {...register("time")}>
            <option value="">{t("time.select")}</option>
            {TIME_SLOTS.map((slot) => (
              <option key={slot} value={slot}>{slot}</option>
            ))}
          </select>
          {errors.time && <p className="field-error">{errors.time.message as string}</p>}
          <p className="field-hint">{t("time.hint")}</p>
          <p className="field-hint">{t("time.hintCapacity")}</p>
        </div>
      </div>

      <div>
        <label htmlFor="partySize" className="field-label">
          {t("partySize.label")} <span className="text-[var(--color-accent-soft)]">*</span>
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
              {t("underflow.title", { min: MIN_PARTY_SIZE })}
            </p>
            <p className="mt-1 opacity-80">
              {t.rich("underflow.body", {
                a: (c) => (
                  <a
                    href={`https://barcobra.rezervujstul.cz/reservation-form.php?lang=${locale === "cs" ? "cz" : "en"}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="link-subtle"
                  >
                    {c}
                  </a>
                ),
              })}
            </p>
          </div>
        )}
        {overflow && (
          <div className="alert-warning mt-3">
            <p className="font-medium text-[var(--color-gold-soft)]">
              {t("overflow.title")}
            </p>
            <p className="mt-1 opacity-80">{t("overflow.body")}</p>
            <a
              href={`/${locale}/inquiry?guests=${partySize}`}
              className="btn-accent mt-4 text-sm"
            >
              {t("overflow.link")}
            </a>
          </div>
        )}
      </div>

      <fieldset>
        <legend className="field-label mb-3">
          {t("venueLegend")} <span className="text-[var(--color-accent-soft)]">*</span>
        </legend>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          {t.rich("venueHint", {
            bold: (c) => <strong className="text-[var(--color-text)]">{c}</strong>,
          })}
        </p>
        <div className="grid gap-2">
          {VENUES.map((v) => (
            <label
              key={v}
              className="block cursor-pointer rounded-2xl p-5 transition bg-[var(--color-bg-elevated)] hover:bg-[#e9e4da] has-[:checked]:bg-[var(--color-card-hover)]"
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
                      {tSchemas(`venues.${v}`)}
                    </span>
                  </div>
                  {v === "informace" && (
                    <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                      {t("informace.tagline")}
                    </p>
                  )}
                  {v === "unsure" && (
                    <p className="mt-1.5 text-sm text-[var(--color-text-muted)]">
                      {t("unsure.tagline")}
                    </p>
                  )}
                  {v !== "unsure" && (
                    <ul className="mt-3 space-y-1.5">
                      {(["bullet1", "bullet2", "bullet3"] as const).map((b) => (
                        <li key={b} className="flex gap-2 text-sm text-[var(--color-text-muted)]">
                          <span aria-hidden className="mt-2 inline-block h-1 w-1 shrink-0 rounded-full bg-[var(--color-gold)]" />
                          <span>{t(`${v}.${b}`)}</span>
                        </li>
                      ))}
                    </ul>
                  )}
                  {v !== "unsure" && (
                    <p className="mt-3 text-sm italic text-[var(--color-text-subtle)]">
                      {t(`${v}.fitsYou`)}
                    </p>
                  )}
                  {v === "cobra" && (
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {(
                        [
                          { key: "linkSite", href: "https://barcobra.cz/cs/" },
                          { key: "linkDrinks", href: "https://www.barcobra.cz/dl/bar-cobra-napojovy-listek-cs.pdf" },
                          { key: "linkSignature", href: "https://www.barcobra.cz/dl/bar-cobra-cocktails-cs.pdf" },
                        ] as const
                      ).map(({ key, href }) => (
                        <li key={key}>
                          <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="link-subtle">
                            {t(`cobra.${key}`)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                  {v === "informace" && (
                    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-sm">
                      {(
                        [
                          { key: "linkSite", href: "https://www.barcobra.cz/informace/cs/" },
                          { key: "linkMenu", href: "https://www.barcobra.cz/informace/dl/informace-menu-cs.pdf" },
                        ] as const
                      ).map(({ key, href }) => (
                        <li key={key}>
                          <a href={href} target="_blank" rel="noopener noreferrer" onClick={(e) => e.stopPropagation()} className="link-subtle">
                            {t(`informace.${key}`)}
                          </a>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </label>
          ))}
        </div>
        {errors.venue && <p className="field-error mt-2">{errors.venue.message as string}</p>}
      </fieldset>

      {showLargeCobraHint && (
        <div className="alert-warning">
          <p className="font-medium text-[var(--color-gold-soft)]">{t("largeCobraTitle")}</p>
          <p className="mt-1 opacity-80">
            {t.rich("largeCobraBody", {
              bold: (c) => (
                <strong className="text-[var(--color-gold-soft)]">{c}</strong>
              ),
            })}
          </p>
        </div>
      )}

      <fieldset>
        <legend className="field-label mb-3">{t("eventTypeLegend")}</legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
          {EVENT_TYPES.map((et) => (
            <label
              key={et}
              className="flex cursor-pointer items-center justify-center rounded-lg border bg-[var(--color-bg-elevated)] border-[var(--color-border)] px-3 py-3 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent)] has-[:checked]:text-white has-[:checked]:shadow-[0_4px_14px_-4px_rgba(31,110,90,0.4)]"
            >
              <input type="radio" value={et} className="sr-only" {...register("eventType")} />
              {tSchemas(`eventTypes.${et}`)}
            </label>
          ))}
        </div>
        {errors.eventType && (
          <p className="field-error mt-2">{errors.eventType.message as string}</p>
        )}
        {eventType === "jine" && (
          <input
            type="text"
            placeholder={t("eventTypeOtherPlaceholder")}
            className="input-base mt-3"
            {...register("eventTypeOther")}
          />
        )}
      </fieldset>
    </div>
  );
}
