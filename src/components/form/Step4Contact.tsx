"use client";

import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import type { ReservationInput } from "@/lib/schemas/reservation";

export function Step4Contact() {
  const {
    register,
    formState: { errors },
  } = useFormContext<ReservationInput>();
  const t = useTranslations("step4");

  return (
    <div className="space-y-5">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            {t("name")} <span className="text-[var(--color-accent-soft)]">*</span>
          </label>
          <input
            id="name"
            type="text"
            autoComplete="name"
            className="input-base"
            {...register("name")}
          />
          {errors.name && <p className="field-error">{errors.name.message as string}</p>}
        </div>
        <div>
          <label htmlFor="phone" className="field-label">
            {t("phone")} <span className="text-[var(--color-accent-soft)]">*</span>
          </label>
          <input
            id="phone"
            type="tel"
            autoComplete="tel"
            placeholder="+420 777 123 456"
            className="input-base"
            {...register("phone")}
          />
          {errors.phone && <p className="field-error">{errors.phone.message as string}</p>}
        </div>
      </div>

      <div>
        <label htmlFor="email" className="field-label">
          {t("email")} <span className="text-[var(--color-accent-soft)]">*</span>
        </label>
        <input
          id="email"
          type="email"
          autoComplete="email"
          className="input-base"
          {...register("email")}
        />
        {errors.email && <p className="field-error">{errors.email.message as string}</p>}
      </div>

      <div>
        <label htmlFor="note" className="field-label">
          {t("noteLabel")}{" "}
          <span className="text-[var(--color-text-subtle)] text-xs">({t("noteOptional")})</span>
        </label>
        <textarea
          id="note"
          rows={4}
          placeholder={t("notePlaceholder")}
          className="input-base"
          {...register("note")}
        />
        {errors.note && <p className="field-error">{errors.note.message as string}</p>}
      </div>

      {/* honeypot */}
      <div aria-hidden className="hidden">
        <label htmlFor="honeypot">{t("honeypot")}</label>
        <input
          id="honeypot"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register("honeypot")}
        />
      </div>

      <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition hover:border-[var(--color-border-strong)]">
        <input
          type="checkbox"
          className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]"
          {...register("gdpr")}
        />
        <span className="text-sm text-[var(--color-text-muted)]">
          {t("gdpr")}{" "}
          <span className="text-[var(--color-accent-soft)]">*</span>
        </span>
      </label>
      {errors.gdpr && (
        <p className="field-error">{errors.gdpr.message as string}</p>
      )}
    </div>
  );
}
