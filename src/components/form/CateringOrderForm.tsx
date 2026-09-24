"use client";

import { useEffect, useRef, useState, useMemo } from "react";
import { FormProvider, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations, useLocale } from "next-intl";
import {
  createCateringOrderSchema,
  type CateringOrderInput,
  type CateringOrderValidationMessages,
} from "@/lib/schemas/catering-order";
import type { CateringMenu } from "@/lib/sheets/fetch";
import type { CateringPick } from "@/lib/schemas/catering";
import { CateringBuilder, StickyCateringTotal, CateringOrderSummary } from "./CateringBuilder";
import { priceCatering } from "@/lib/catering/calculate";

const DEFAULT_DRAFT_KEY = "catering-order-draft-v1";
const ORDER_EMAIL = "rezervace@barcobra.cz";

const BASE_DEFAULT_VALUES: CateringOrderInput = {
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

export function CateringOrderForm({
  menu,
  defaultCatering,
  draftKey = DEFAULT_DRAFT_KEY,
  showPhone = true,
  showEmail = true,
  showEventDate = true,
}: {
  menu: CateringMenu;
  /** Pre-fills quantities, e.g. for an already-agreed private order. */
  defaultCatering?: CateringPick[];
  /** Keep distinct per menu so drafts don't leak between pages sharing this form. */
  draftKey?: string;
  /** Hide fields that don't apply, e.g. a private order for a contact already known. */
  showPhone?: boolean;
  showEmail?: boolean;
  showEventDate?: boolean;
}) {
  const DEFAULT_VALUES: CateringOrderInput = {
    ...BASE_DEFAULT_VALUES,
    catering: defaultCatering ?? [],
  };
  const locale = useLocale();
  const t = useTranslations("cateringOrderForm");
  const tVal = useTranslations("validation");

  const [mailOpened, setMailOpened] = useState(false);
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

  const schema = useMemo(
    () => createCateringOrderSchema(validationMsgs, { requirePhone: showPhone, requireEmail: showEmail }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [validationMsgs],
  );

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
      const raw = localStorage.getItem(draftKey);
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
        localStorage.setItem(draftKey, JSON.stringify(persisted));
      } catch { /* ignore */ }
    });
    return () => sub.unsubscribe();
  }, [watch, hydrated]);

  // No backend email delivery is wired up yet (see PRD/team notes) — instead
  // of failing silently, this hands the guest a pre-filled email to their own
  // mail client, addressed to us. Nothing is sent to our server at all.
  function onSubmit(values: CateringOrderInput) {
    const priced = priceCatering(values.catering ?? [], menu.items);
    const subject = t("mailSubject", {
      amount: priced.total.toLocaleString("en-US"),
      name: values.name,
    });
    const contactParts = [values.name, values.phone, values.email].filter(Boolean);
    const bodyLines = [
      `${t("mailContactLabel")}: ${contactParts.join(", ")}`,
      values.eventDate ? `${t("mailEventDateLabel")}: ${values.eventDate}` : null,
      "",
      `${t("mailOrderLabel")}:`,
      ...priced.lines.map((l) => `- ${l.label} — ${l.lineTotal.toLocaleString("en-US")} Kč`),
      "",
      `${t("mailTotalLabel")}: ${priced.total.toLocaleString("en-US")} Kč${priced.hasEstimates ? ` (${t("mailInclEstimates")})` : ""}`,
      values.note ? `\n${t("mailNoteLabel")}:\n${values.note}` : null,
    ].filter((line): line is string => line !== null);

    const mailtoUrl =
      `mailto:${ORDER_EMAIL}` +
      `?subject=${encodeURIComponent(subject)}` +
      `&body=${encodeURIComponent(bodyLines.join("\n"))}`;

    try { localStorage.removeItem(draftKey); } catch { /* ignore */ }
    window.location.href = mailtoUrl;
    setMailOpened(true);
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
            <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
              <div>
                <CateringBuilder menu={menu.items} />
                {errors.catering && (
                  <p ref={cateringErrorRef} className="field-error">
                    {errors.catering.message as string}
                  </p>
                )}
                <div className="lg:hidden">
                  <StickyCateringTotal menu={menu.items} />
                </div>
              </div>
              <aside className="hidden lg:block lg:sticky lg:top-[106px] lg:self-start">
                <CateringOrderSummary menu={menu.items} />
              </aside>
            </div>
          )}

          <div className="space-y-5 border-t border-[var(--color-border)] pt-6">
            <h2 className="text-lg font-medium text-[var(--color-text)]">{t("contactTitle")}</h2>

            <div className={showPhone ? "grid gap-4 sm:grid-cols-2" : "grid gap-4"}>
              <div>
                <label htmlFor="name" className="field-label">
                  {t("name")} <span className="text-[var(--color-accent-soft)]">*</span>
                </label>
                <input id="name" type="text" autoComplete="name" className="input-base" {...register("name")} />
                {errors.name && <p className="field-error">{errors.name.message as string}</p>}
              </div>
              {showPhone && (
                <div>
                  <label htmlFor="phone" className="field-label">
                    {t("phone")} <span className="text-[var(--color-accent-soft)]">*</span>
                  </label>
                  <input id="phone" type="tel" autoComplete="tel" placeholder="+420 777 123 456" className="input-base" {...register("phone")} />
                  {errors.phone && <p className="field-error">{errors.phone.message as string}</p>}
                </div>
              )}
            </div>

            {showEmail && (
              <div>
                <label htmlFor="email" className="field-label">
                  {t("email")} <span className="text-[var(--color-accent-soft)]">*</span>
                </label>
                <input id="email" type="email" autoComplete="email" className="input-base" {...register("email")} />
                {errors.email && <p className="field-error">{errors.email.message as string}</p>}
              </div>
            )}

            {showEventDate && (
              <div>
                <label htmlFor="eventDate" className="field-label">
                  {t("eventDateLabel")}{" "}
                  <span className="text-[var(--color-text-subtle)] text-xs">({t("eventDateOptional")})</span>
                </label>
                <input id="eventDate" type="text" placeholder={t("eventDatePlaceholder")} className="input-base" {...register("eventDate")} />
              </div>
            )}

            <div>
              <label htmlFor="note" className="field-label">
                {t("noteLabel")}{" "}
                <span className="text-[var(--color-text-subtle)] text-xs">({t("noteOptional")})</span>
              </label>
              <textarea id="note" rows={4} placeholder={t("notePlaceholder")} className="input-base" {...register("note")} />
            </div>

            <label className="flex cursor-pointer items-start gap-3 rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-4 transition hover:border-[var(--color-border-strong)]">
              <input type="checkbox" className="mt-0.5 h-4 w-4 accent-[var(--color-accent)]" {...register("gdpr")} />
              <span className="text-sm text-[var(--color-text-muted)]">
                {t("gdpr")} <span className="text-[var(--color-accent-soft)]">*</span>
              </span>
            </label>
            {errors.gdpr && <p className="field-error">{errors.gdpr.message as string}</p>}

            {mailOpened && (
              <div role="status" className="alert-notice">
                {t("mailOpened")}
              </div>
            )}
            {!mailOpened && Object.keys(errors).length > 0 && (
              <div role="alert" className="alert-danger">
                {t("formErrorTitle")}
              </div>
            )}

            <div className="flex justify-end pt-2">
              <button type="submit" className="btn-primary">
                {t("submit")}
              </button>
            </div>
          </div>
        </form>
      </FormProvider>
    </div>
  );
}
