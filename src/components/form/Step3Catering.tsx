"use client";

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import { CateringBuilder, StickyCateringTotal } from "./CateringBuilder";
import { isDateAtLeast } from "@/lib/utils/dates";
import type { CateringItem, CateringPick } from "@/lib/schemas/catering";
import type { ReservationInput } from "@/lib/schemas/reservation";

export function Step3Catering({
  menu,
  source,
  onSkip,
}: {
  menu: CateringItem[];
  source: "live" | "snapshot" | "empty";
  onSkip: () => void;
}) {
  const { watch } = useFormContext<ReservationInput>();
  const t = useTranslations("step3");
  const date = watch("date");
  const picks = (watch("catering") ?? []) as CateringPick[];
  const hasPicks = picks.some(
    (p) => (p.count && p.count > 0) || (p.budget && p.budget > 0),
  );
  const [revealed, setRevealed] = useState(hasPicks);

  const cateringLeadOk = isDateAtLeast(date, 3);
  const showLeadWarning = hasPicks && !cateringLeadOk;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-[var(--color-text)]">{t("title")}</h2>
        <p className="mt-3 text-sm text-[var(--color-text-muted)]">
          {t.rich("body", {
            bold: (c) => <strong className="text-[var(--color-text)]">{c}</strong>,
            em: (c) => <em>{c}</em>,
          })}
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">{t("bodyAlt")}</p>
      </div>

      {!revealed && (
        <div className="flex flex-col-reverse gap-2 sm:flex-row">
          <button type="button" onClick={onSkip} className="btn-ghost">
            {t("skip")}
          </button>
          <button type="button" onClick={() => setRevealed(true)} className="btn-primary">
            {t("reveal")}
          </button>
        </div>
      )}

      {revealed && (
        <div className="animate-[fadeIn_0.25s_ease-out] space-y-6">
          <button type="button" onClick={onSkip} className="link-subtle text-sm">
            {t("skip")}
          </button>

          <CateringBuilder menu={menu} />

          {showLeadWarning && (
            <div className="alert-warning">
              <p className="font-medium text-[var(--color-gold-soft)]">{t("leadWarningTitle")}</p>
              <p className="mt-1 opacity-80">{t("leadWarningBody")}</p>
            </div>
          )}

          <StickyCateringTotal menu={menu} />
        </div>
      )}
    </div>
  );
}
