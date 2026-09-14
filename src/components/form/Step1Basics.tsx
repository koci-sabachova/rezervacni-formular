"use client";

import { useEffect } from "react";
import Image from "next/image";
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
    setValue,
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
  const cobraHidden = partySize > 20;
  const informaceNearCapacity = partySize >= 30;
  const visibleVenues = cobraHidden ? VENUES.filter((v) => v !== "cobra") : VENUES;

  // Cobra isn't offered above 20 people — drop a stale selection so it
  // can't be silently submitted once the option has disappeared.
  useEffect(() => {
    if (cobraHidden && venue === "cobra") {
      setValue("venue", "" as unknown as ReservationInput["venue"], { shouldValidate: false });
    }
  }, [cobraHidden, venue, setValue]);

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

          <fieldset className="mt-3">
            <legend className="field-label mb-1.5">{t("dateFlexible.legend")}</legend>
            <div className="flex gap-2">
              {([true, false] as const).map((val) => (
                <label
                  key={String(val)}
                  className="flex cursor-pointer items-center justify-center rounded-lg border bg-[var(--color-bg-elevated)] border-[var(--color-border)] px-4 py-2 text-sm text-[var(--color-text-muted)] transition hover:border-[var(--color-border-strong)] hover:text-[var(--color-text)] has-[:checked]:border-[var(--color-accent)] has-[:checked]:bg-[var(--color-accent)] has-[:checked]:text-white"
                >
                  <input
                    type="radio"
                    value={String(val)}
                    checked={watch("dateFlexible") === val}
                    onChange={() => setValue("dateFlexible", val, { shouldDirty: true, shouldValidate: true })}
                    className="sr-only"
                  />
                  {val ? t("dateFlexible.yes") : t("dateFlexible.no")}
                </label>
              ))}
            </div>
            <p className="field-hint">{t("dateFlexible.hint")}</p>
          </fieldset>
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
        <div className="flex items-center gap-2">
          <button
            type="button"
            aria-label={t("partySize.decrease")}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-lg text-[var(--color-text)] transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] disabled:opacity-40 disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text)]"
            onClick={() => setValue("partySize", Math.max(0, partySize - 5) as unknown as number, { shouldDirty: true, shouldValidate: true })}
            disabled={partySize <= 0}
          >
            −
          </button>
          <input
            id="partySize"
            type="number"
            inputMode="numeric"
            min={1}
            max={100}
            className="input-base sm:max-w-[140px] text-center"
            {...register("partySize")}
          />
          <button
            type="button"
            aria-label={t("partySize.increase")}
            className="grid h-12 w-12 shrink-0 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-lg text-[var(--color-text)] transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)]"
            onClick={() => setValue("partySize", Math.min(100, partySize + 5) as unknown as number, { shouldDirty: true, shouldValidate: true })}
          >
            +
          </button>
        </div>
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

      {partySize > 0 && (
      <fieldset className="animate-[fadeIn_0.25s_ease-out]">
        <legend className="field-label mb-3">
          {t("venueLegend")} <span className="text-[var(--color-accent-soft)]">*</span>
        </legend>
        <p className="text-sm text-[var(--color-text-muted)] mb-4">
          {t.rich("venueHint", {
            bold: (c) => <strong className="text-[var(--color-text)]">{c}</strong>,
          })}
        </p>
        <div className="grid gap-2">
          {visibleVenues.map((v) => (
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
                  <div className="flex flex-wrap items-center gap-2">
                    {(v === "cobra" || v === "informace") && (
                      <Image
                        src={`/brand/${v === "cobra" ? "cobra-mark" : "informace-mark"}.png`}
                        alt=""
                        width={20}
                        height={20}
                        className="h-5 w-5"
                      />
                    )}
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
                  {v === "informace" && informaceNearCapacity ? (
                    <div className="mt-3 rounded-lg border-l-4 border-[var(--color-accent)] bg-white/70 p-3.5">
                      <p className="font-semibold text-[var(--color-accent-strong)]">
                        {t("informaceCapacityTitle")}
                      </p>
                      <p className="mt-1 text-sm leading-relaxed text-[var(--color-text)]">
                        {t("informaceCapacityBody")}
                      </p>
                    </div>
                  ) : (
                    v !== "unsure" && (
                      <p className="mt-3 text-sm italic text-[var(--color-text-subtle)]">
                        {t(`${v}.fitsYou`)}
                      </p>
                    )
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
