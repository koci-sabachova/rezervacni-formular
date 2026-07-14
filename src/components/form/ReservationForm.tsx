"use client";

import { useEffect, useState, useMemo } from "react";
import { FormProvider, useForm, type FieldPath } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useTranslations, useLocale } from "next-intl";
import {
  createReservationSchema,
  MAX_PARTY_SIZE_MAIN,
  type ReservationInput,
  type ReservationValidationMessages,
} from "@/lib/schemas/reservation";
import type { CateringMenu } from "@/lib/sheets/fetch";
import { StepIndicator } from "./StepIndicator";
import { Step1Basics } from "./Step1Basics";
import { Step3Catering } from "./Step3Catering";
import { Step4Contact } from "./Step4Contact";
import { TurnstileWidget } from "./Turnstile";
import { submitReservation } from "@/app/actions/submit-reservation";

const DRAFT_KEY = "reservation-draft-v2";
const TOTAL_STEPS = 3;

const STEP_FIELDS: Record<number, FieldPath<ReservationInput>[]> = {
  1: ["date", "time", "partySize", "venue", "eventType", "eventTypeOther"],
  2: ["catering"],
  3: ["name", "phone", "email", "note", "gdpr", "honeypot"],
};

const DEFAULT_VALUES: ReservationInput = {
  date: "",
  time: "",
  partySize: "" as unknown as number,
  venue: "" as unknown as ReservationInput["venue"],
  eventType: "" as unknown as ReservationInput["eventType"],
  eventTypeOther: "",
  catering: [],
  name: "",
  phone: "",
  email: "",
  note: "",
  gdpr: false as unknown as true,
  honeypot: "",
  turnstileToken: "",
};

export function ReservationForm({ menu }: { menu: CateringMenu }) {
  const router = useRouter();
  const locale = useLocale();
  const t = useTranslations("reservationForm");
  const tVal = useTranslations("validation");

  const validationMsgs = useMemo<ReservationValidationMessages>(
    () => ({
      date: tVal("date"),
      time: tVal("time"),
      phoneMin: tVal("phoneMin"),
      phoneRegex: tVal("phoneRegex"),
      email: tVal("email"),
      partySizeInt: tVal("partySizeInt"),
      partySizeMin: tVal("partySizeMin"),
      partySizeMax: tVal("partySizeMax"),
      name: tVal("name"),
      gdpr: tVal("gdprReservation"),
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [locale],
  );

  const schema = useMemo(
    () => createReservationSchema(validationMsgs).schema,
    [validationMsgs],
  );

  const fieldLabels: Partial<Record<FieldPath<ReservationInput>, string>> = {
    date: t("fieldDate"),
    time: t("fieldTime"),
    partySize: t("fieldPartySize"),
    venue: t("fieldVenue"),
    eventType: t("fieldEventType"),
    eventTypeOther: t("fieldEventTypeOther"),
    catering: t("fieldCatering"),
    name: t("fieldName"),
    phone: t("fieldPhone"),
    email: t("fieldEmail"),
    gdpr: t("fieldGdpr"),
  };

  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const methods = useForm<ReservationInput>({
    defaultValues: DEFAULT_VALUES,
    resolver: zodResolver(schema),
    mode: "onChange",
    shouldUnregister: false,
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) methods.reset({ ...DEFAULT_VALUES, ...JSON.parse(raw) });
    } catch { /* ignore */ }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const sub = methods.watch((values) => {
      try {
        const { turnstileToken: _t, honeypot: _h, ...persisted } = values as Record<string, unknown>;
        void _t; void _h;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(persisted));
      } catch { /* ignore */ }
    });
    return () => sub.unsubscribe();
  }, [methods, hydrated]);

  const partySize = Number(methods.watch("partySize") ?? 0);
  const overflow = partySize > MAX_PARTY_SIZE_MAIN;
  const [stepErrorStep, setStepErrorStep] = useState<number | null>(null);
  const showStepError = stepErrorStep !== null;
  const errors = methods.formState.errors as Record<string, unknown>;
  const missingFields =
    stepErrorStep !== null
      ? STEP_FIELDS[stepErrorStep]
          .filter((f) => errors[f] && fieldLabels[f])
          .map((f) => fieldLabels[f]!)
      : [];

  async function goNext() {
    if (step === 1 && overflow) return;
    const ok = await methods.trigger(STEP_FIELDS[step]);
    if (ok) {
      setStepErrorStep(null);
      setStep((s) => Math.min(TOTAL_STEPS, s + 1));
      window.scrollTo({ top: 0, behavior: "smooth" });
    } else {
      setStepErrorStep(step);
    }
  }

  useEffect(() => { setStepErrorStep(null); }, [step]);

  function handleSubmitError() {
    const errs = methods.formState.errors as Record<string, unknown>;
    for (let s = 1; s <= TOTAL_STEPS; s++) {
      const fieldsWithErrors = STEP_FIELDS[s].filter((f) => errs[f]);
      if (fieldsWithErrors.length > 0) {
        setStepErrorStep(s);
        if (s !== step) { setStep(s); window.scrollTo({ top: 0, behavior: "smooth" }); }
        return;
      }
    }
    setStepErrorStep(step);
  }

  function goBack() {
    setStep((s) => Math.max(1, s - 1));
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function skipCatering() {
    methods.setValue("catering", [], { shouldDirty: true });
    setStep(3);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function onSubmit(values: ReservationInput) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await submitReservation(values, locale);
      if (result.ok) {
        try { localStorage.removeItem(DRAFT_KEY); } catch { /* ignore */ }
        router.push(`/${locale}/thank-you`);
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

  return (
    <div className="form-shell">
    <FormProvider {...methods}>
      <form onSubmit={methods.handleSubmit(onSubmit, handleSubmitError)} className="space-y-6" noValidate>
        <StepIndicator current={step} total={TOTAL_STEPS} />

        {step === 1 && <Step1Basics />}
        {step === 2 && (
          <Step3Catering menu={menu.items} source={menu.source} onSkip={skipCatering} />
        )}
        {step === 3 && (
          <div className="space-y-6">
            <Step4Contact />
            <TurnstileWidget
              onToken={(token) =>
                methods.setValue("turnstileToken", token, { shouldDirty: false, shouldValidate: false })
              }
            />
            {serverError && <div className="alert-danger">{serverError}</div>}
          </div>
        )}

        {showStepError && (
          <div role="alert" className="alert-danger">
            <p className="font-medium">{t("stepErrorTitle")}</p>
            {missingFields.length > 0 ? (
              <p className="mt-1 opacity-80">{t("stepErrorFill", { fields: missingFields.join(", ") })}</p>
            ) : (
              <p className="mt-1 opacity-80">{t("stepErrorRed")}</p>
            )}
          </div>
        )}

        <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:items-center sm:justify-between">
          <button type="button" onClick={goBack} disabled={step === 1} className="btn-ghost">
            {t("back")}
          </button>
          {step < TOTAL_STEPS ? (
            <button type="button" onClick={goNext} disabled={step === 1 && overflow} className="btn-primary">
              {t("continue")}
            </button>
          ) : (
            <button type="submit" disabled={isSubmitting} className="btn-primary">
              {isSubmitting ? t("submitting") : t("submit")}
            </button>
          )}
        </div>
      </form>
    </FormProvider>
    </div>
  );
}
