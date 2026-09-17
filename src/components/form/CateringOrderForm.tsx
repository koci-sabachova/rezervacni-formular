"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  createCateringOrderSchema,
  type CateringOrderInput,
  type CateringOrderValidationMessages,
} from "@/lib/schemas/catering-order";
import type { CateringMenu } from "@/lib/sheets/fetch";
import { CateringBuilder, StickyCateringTotal } from "./CateringBuilder";
import { TurnstileWidget } from "./Turnstile";
import { submitCateringOrder } from "@/app/actions/submit-catering-order";

const DRAFT_KEY = "catering-order-draft-v1";

const DEFAULT_VALUES: CateringOrderInput = {
  name: "",
  phone: "",
  email: "",
  eventDate: "",
  note: "",
  catering: [],
  gdpr: false as unknown as true,
  honeypot: "",
  turnstileToken: "",
};

export function CateringOrderForm({ menu }: { menu: CateringMenu }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("cateringOrderForm");
  const tVal = useTranslations("validation");

  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const validationMsgs = useMemo<CateringOrderValidationMessages>(
    () => ({
      name: tVal("name"),
      phoneMin: tVal("phoneMin"),
      phoneRegex: tVal("phoneRegex"),
      email: tVal("email"),
      cateringEmpty: tVal("cateringEmpty"),
      gdpr: tVal("gdprCateringOrder"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  const schema = useMemo(() => createCateringOrderSchema(validationMsgs), [validationMsgs]);

  const methods = useForm<CateringOrderInput>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(schema),
    mode: "onTouched",
  });
  const {
    register,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
  } = methods;

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) reset({ ...DEFAULT_VALUES, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const sub = watch((values) => {
      try {
        const { turnstileToken: _t, honeypot: _h, ...persisted } = values as Record<string, unknown>;
        void _t; void _h;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(persisted));
      } catch { /* ignore */ }
    });
    return () => sub.unsubscribe();
  }, [watch, hydrated]);

  async function onSubmit(values: CateringOrderInput) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await submitCateringOrder(values, locale);
      if (result.ok) {
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        router.push(`/${locale}/thank-you?typ=catering`);
      } else {
        setServerError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setServerError(t("serverError"));
      setIsSubmitting(false);
    }
  }

  // The menu is long — a validation error can land far above the submit
  // button, so a failed submit needs to actively bring it into view rather
  // than leaving the click looking like it did nothing.
  const cateringErrorRef = useRef<HTMLParagraphElement>(null);
  function onInvalid(invalidFields: typeof errors) {
    if (invalidFields.catering) {
      // Wait a tick — the error <p> only mounts once this failed-validation
      // render commits, so scrolling in the same tick would target a node
      // that isn't there yet.
      setTimeout(() => {
        cateringErrorRef.current?.scrollIntoView({ behavior: "smooth", block: "center" });
      }, 0);
    }
  }

  return (
    <div className="form-shell">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit(onSubmit, onInvalid)} className="space-y-6" noValidate>
          {menu.items.length === 0 ? (
            <p className="surface-muted text-sm text-[var(--color-text-muted)]">
              {t("menuEmpty")}
            </p>
          ) : (
            <>
              <CateringBuilder menu={menu.items} />
              {errors.catering && (
                <p ref={cateringErrorRef} className="field-error">
                  {errors.catering.message as string}
                </p>
              )}
              <StickyCateringTotal menu={menu.items} />
            </>
          )}

          <div className="space-y-5 border-t border-[var(--color-border)] pt-6">
            <h2 className="text-lg font-medium text-[var(--color-text)]">{t("contactTitle")}</h2>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label htmlFor="name" className="field-label">
                  {t("name")} <span className="text-[var(--color-accent-soft)]">*</span>
                </label>
                <input id="name" type="text" autoComplete="name" className="input-base" {...register("name")} />
                {errors.name && <p className="field-error">{errors.name.message as string}</p>}
              </div>
              <div>
                <label htmlFor="phone" className="field-label">
                  {t("phone")} <span className="text-[var(--color-accent-soft)]">*</span>
                </label>
                <input id="phone" type="tel" autoComplete="tel" placeholder="+420 777 123 456" className="input-base" {...register("phone")} />
                {errors.phone && <p className="field-error">{errors.phone.message as string}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="email" className="field-label">
                {t("email")} <span className="text-[var(--color-accent-soft)]">*</span>
              </label>
              <input id="email" type="email" autoComplete="email" className="input-base" {...register("email")} />
              {errors.email && <p className="field-error">{errors.email.message as string}</p>}
            </div>

            <div>
              <label htmlFor="eventDate" className="field-label">
                {t("eventDateLabel")}{" "}
                <span className="text-[var(--color-text-subtle)] text-xs">({t("eventDateOptional")})</span>
              </label>
              <input id="eventDate" type="text" placeholder={t("eventDatePlaceholder")} className="input-base" {...register("eventDate")} />
            </div>

            <div>
              <label htmlFor="note" className="field-label">
                {t("noteLabel")}{" "}
                <span className="text-[var(--color-text-subtle)] text-xs">({t("noteOptional")})</span>
              </label>
              <textarea id="note" rows={4} placeholder={t("notePlaceholder")} className="input-base" {...register("note")} />
            </div>

            <div aria-hidden className="hidden">
              <label htmlFor="honeypot">{t("honeypot")}</label>
              <input id="honeypot" type="text" tabIndex={-1} autoComplete="off" {...register("honeypot")} />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition hover:border-[var(--color-border-strong)]">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]" {...register("gdpr")} />
              <span className="text-sm text-[var(--color-text-muted)]">
                {t("gdpr")} <span className="text-[var(--color-accent-soft)]">*</span>
              </span>
            </label>
            {errors.gdpr && <p className="field-error">{errors.gdpr.message as string}</p>}

            <TurnstileWidget
              onToken={(token) =>
                methods.setValue("turnstileToken", token, { shouldDirty: false, shouldValidate: false })
              }
            />

            {serverError && <div className="alert-danger">{serverError}</div>}
            {!serverError && Object.keys(errors).length > 0 && (
              <div role="alert" className="alert-danger">
                {t("formErrorTitle")}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="submit" disabled={isSubmitting} className="btn-primary">
                {isSubmitting ? t("submitting") : t("submit")}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
