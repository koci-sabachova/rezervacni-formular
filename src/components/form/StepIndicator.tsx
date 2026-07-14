"use client";

import { useTranslations } from "next-intl";

export function StepIndicator({
  current,
  total,
}: {
  current: number;
  total: number;
}) {
  const t = useTranslations("stepIndicator");
  const label = t(`step${current}` as "step1" | "step2" | "step3");

  return (
    <div className="mb-10">
      <p className="eyebrow">{t("label", { current, total })}</p>
      <p className="mt-1 text-2xl font-medium text-[var(--color-text)]">{label}</p>
      <div
        className="mt-4 grid gap-2"
        style={{ gridTemplateColumns: `repeat(${total}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: total }).map((_, i) => (
          <div
            key={i}
            className={`h-px transition-all ${
              i < current
                ? "bg-[var(--color-gold)]"
                : "bg-[var(--color-border)]"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
