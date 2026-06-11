"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import {
  inquirySchema,
  type InquiryInput,
} from "@/lib/schemas/inquiry";
import { TurnstileWidget } from "./Turnstile";
import { submitInquiry } from "@/app/actions/submit-inquiry";

const DRAFT_KEY = "poptavka-draft-v1";

const DEFAULT_VALUES: InquiryInput = {
  name: "",
  phone: "",
  email: "",
  estimatedPartySize: "" as unknown as number,
  estimatedDate: "",
  eventType: "",
  description: "",
  gdpr: false as unknown as true,
  honeypot: "",
  turnstileToken: "",
};

export function InquiryForm({
  prefillPartySize,
}: {
  prefillPartySize?: number;
}) {
  const router = useRouter();
  const [serverError, setServerError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<InquiryInput>({
    defaultValues: {
      ...DEFAULT_VALUES,
      estimatedPartySize:
        prefillPartySize !== undefined
          ? prefillPartySize
          : DEFAULT_VALUES.estimatedPartySize,
    },
    resolver: zodResolver(inquirySchema),
    mode: "onTouched",
  });

  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        reset({ ...DEFAULT_VALUES, ...parsed });
      }
    } catch {
      /* ignore */
    }
    setHydrated(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const sub = watch((values) => {
      try {
        const { turnstileToken: _t, honeypot: _h, ...persisted } = values as Record<
          string,
          unknown
        >;
        void _t;
        void _h;
        localStorage.setItem(DRAFT_KEY, JSON.stringify(persisted));
      } catch {
        /* ignore */
      }
    });
    return () => sub.unsubscribe();
  }, [watch, hydrated]);

  async function onSubmit(values: InquiryInput) {
    setServerError(null);
    setIsSubmitting(true);
    try {
      const result = await submitInquiry(values);
      if (result.ok) {
        try {
          localStorage.removeItem(DRAFT_KEY);
        } catch {
          /* ignore */
        }
        router.push("/dekujeme?typ=poptavka");
      } else {
        setServerError(result.error);
        setIsSubmitting(false);
      }
    } catch (err) {
      console.error(err);
      setServerError(
        "Něco se pokazilo při odesílání. Zkuste to prosím za chvíli znovu, nebo nám napište na rezervace@barcobra.cz.",
      );
      setIsSubmitting(false);
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="name" className="field-label">
            Jméno a příjmení <span className="text-[var(--color-accent-soft)]">*</span>
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
            Telefon <span className="text-[var(--color-accent-soft)]">*</span>
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
          E-mail <span className="text-[var(--color-accent-soft)]">*</span>
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

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="partySize" className="field-label">
            Předpokládaný počet lidí <span className="text-[var(--color-accent-soft)]">*</span>
          </label>
          <input
            id="partySize"
            type="number"
            inputMode="numeric"
            min={36}
            className="input-base"
            {...register("estimatedPartySize")}
          />
          {errors.estimatedPartySize && (
            <p className="field-error">
              {errors.estimatedPartySize.message as string}
            </p>
          )}
        </div>
        <div>
          <label htmlFor="estimatedDate" className="field-label">
            Předpokládané datum{" "}
            <span className="text-[var(--color-text-subtle)] text-xs">(volitelné, klidně přibližně)</span>
          </label>
          <input
            id="estimatedDate"
            type="text"
            placeholder="např. 14. nebo 21. června"
            className="input-base"
            {...register("estimatedDate")}
          />
          {errors.estimatedDate && (
            <p className="field-error">{errors.estimatedDate.message as string}</p>
          )}
        </div>
      </div>

      <div>
        <label htmlFor="eventType" className="field-label">
          Typ akce <span className="text-[var(--color-accent-soft)]">*</span>
        </label>
        <input
          id="eventType"
          type="text"
          placeholder="firemní vánoční večírek / svatba / 50. narozeniny…"
          className="input-base"
          {...register("eventType")}
        />
        {errors.eventType && (
          <p className="field-error">{errors.eventType.message as string}</p>
        )}
      </div>

      <div>
        <label htmlFor="description" className="field-label">
          Vaše představa <span className="text-[var(--color-accent-soft)]">*</span>
        </label>
        <textarea
          id="description"
          rows={6}
          placeholder="Co od akce čekáte? Catering, podnik, hudba, čas, jakákoli specifika — čím víc napíšete, tím přesněji vám můžeme odpovědět."
          className="input-base"
          {...register("description")}
        />
        {errors.description && (
          <p className="field-error">{errors.description.message as string}</p>
        )}
      </div>

      <div aria-hidden className="hidden">
        <label htmlFor="honeypot">Pokud vidíte toto pole, nechte ho prázdné</label>
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
          Souhlasím se zpracováním osobních údajů pro účel vyřízení poptávky.{" "}
          <span className="text-[var(--color-accent-soft)]">*</span>
        </span>
      </label>
      {errors.gdpr && (
        <p className="field-error">{errors.gdpr.message as string}</p>
      )}

      <TurnstileWidget
        onToken={(token) =>
          setValue("turnstileToken", token, {
            shouldDirty: false,
            shouldValidate: false,
          })
        }
      />

      {serverError && <div className="alert-danger">{serverError}</div>}

      <div className="flex justify-end pt-2">
        <button type="submit" disabled={isSubmitting} className="btn-primary">
          {isSubmitting ? "Odesíláme…" : "Odeslat poptávku"}
        </button>
      </div>
    </form>
  );
}
