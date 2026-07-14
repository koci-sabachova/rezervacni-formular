"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import { useTranslations } from "next-intl";
import {
  CATERING_CATEGORIES,
  type CateringCategory,
  type CateringItem,
  type CateringPick,
} from "@/lib/schemas/catering";
import { priceCatering, formatCzk } from "@/lib/catering/calculate";
import type { ReservationInput } from "@/lib/schemas/reservation";

type Props = {
  menu: CateringItem[];
};

export function CateringBuilder({ menu }: Props) {
  const { watch, setValue } = useFormContext<ReservationInput>();
  const t = useTranslations("catering");
  const tSchemas = useTranslations("schemas.categories");
  const rawPicks = watch("catering") ?? [];
  const picks = rawPicks as CateringPick[];

  const grouped = useMemo(() => {
    const map = new Map<CateringCategory, CateringItem[]>();
    for (const item of menu) {
      const arr = map.get(item.kategorie) ?? [];
      arr.push(item);
      map.set(item.kategorie, arr);
    }
    return map;
  }, [menu]);

  const setPick = (itemId: string, patch: Partial<CateringPick>) => {
    const idx = picks.findIndex((p) => p.itemId === itemId);
    if (idx === -1) {
      setValue("catering", [...picks, { itemId, ...patch }], { shouldDirty: true });
    } else {
      const next = [...picks];
      next[idx] = { ...next[idx], ...patch };
      setValue("catering", next, { shouldDirty: true });
    }
  };

  const removePick = (itemId: string) => {
    setValue("catering", picks.filter((p) => p.itemId !== itemId), { shouldDirty: true });
  };

  const getPick = (itemId: string): CateringPick | undefined =>
    picks.find((p) => p.itemId === itemId);

  if (menu.length === 0) {
    return (
      <div className="surface-muted text-sm text-[var(--color-text-muted)]">
        {t("empty")}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {CATERING_CATEGORIES.map((cat) => {
        const items = grouped.get(cat);
        if (!items || items.length === 0) return null;
        return (
          <section key={cat}>
            <h3 className="mb-3 eyebrow !text-[11px]">{tSchemas(cat)}</h3>
            <div className="space-y-2">
              {items.map((item) => (
                <CateringItemRow
                  key={item.id}
                  item={item}
                  pick={getPick(item.id)}
                  onSet={(patch) => setPick(item.id, patch)}
                  onRemove={() => removePick(item.id)}
                  t={t}
                />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function CateringItemRow({
  item,
  pick,
  onSet,
  onRemove,
  t,
}: {
  item: CateringItem;
  pick: CateringPick | undefined;
  onSet: (patch: Partial<CateringPick>) => void;
  onRemove: () => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const isBudget = item.cena === "individualne";
  const isCake = item.kategorie === "dort";
  const isKanapky = item.kategorie === "kanapky";
  const hasPricedVariants = !!item.varianty_ceny;
  const min = item.min_pocet ?? (isKanapky ? 5 : 1);

  if (isBudget) {
    const current = pick?.budget ?? 0;
    return (
      <div className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
        <div className="flex-1">
          <p className="font-medium text-[var(--color-text)]">{item.nazev}</p>
          <p className="text-xs text-[var(--color-text-subtle)]">
            {item.popis ?? t("budgetDefault")} · {item.jednotka}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-text-muted)]">{t("budgetLabel")}</span>
          <input
            type="number"
            inputMode="numeric"
            min={0}
            step={50}
            value={current || ""}
            onChange={(e) => {
              const v = Number(e.target.value);
              if (Number.isNaN(v) || v <= 0) onRemove();
              else onSet({ budget: v });
            }}
            className="input-base !py-2 w-28"
          />
        </label>
      </div>
    );
  }

  if (hasPricedVariants || isCake) {
    const variant = pick?.variant ?? "";
    const count = pick?.count ?? 0;
    const variants = item.varianty ?? [];
    const prices = item.varianty_ceny ?? {};
    const unitPrice = variant ? prices[variant] : undefined;
    const priceRange = variants
      .map((v) => prices[v])
      .filter((p): p is number => typeof p === "number");
    const priceLabel =
      unitPrice !== undefined
        ? formatCzk(unitPrice)
        : priceRange.length > 0
          ? `${priceRange.join(" / ")} Kč`
          : formatCzk(item.cena as number);

    return (
      <div className="card space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-medium text-[var(--color-text)]">{item.nazev}</p>
            {item.popis && (
              <p className="text-xs text-[var(--color-text-subtle)]">{item.popis}</p>
            )}
            <p className="text-xs text-[var(--color-text-subtle)]">
              {item.jednotka}{hasPricedVariants ? ` · ${priceLabel}` : ` · ${formatCzk(item.cena as number)}`}
            </p>
          </div>
          {pick && count > 0 && (
            <span className="chip">{count}× {t("inCart")}</span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <select
            className="input-base !py-2 sm:max-w-xs"
            value={variant}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) onRemove();
              else onSet({ variant: v, count: count || 1 });
            }}
          >
            <option value="">{t("selectVariant")}</option>
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}{hasPricedVariants && prices[v] !== undefined ? ` — ${formatCzk(prices[v])}` : ""}
              </option>
            ))}
          </select>
          <CountStepper
            value={count}
            min={1}
            disabled={!variant}
            onChange={(n) => {
              if (n <= 0) onRemove();
              else onSet({ variant, count: n });
            }}
            t={t}
          />
        </div>
      </div>
    );
  }

  const count = pick?.count ?? 0;
  return (
    <div className="card flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-4">
      <div className="flex-1">
        <p className="font-medium text-[var(--color-text)]">{item.nazev}</p>
        <p className="text-xs text-[var(--color-text-subtle)]">
          {item.jednotka} · {formatCzk(item.cena as number)}
          {isKanapky && (
            <span className="ml-2 text-[var(--color-gold)]">
              ({t("minPcs", { min })})
            </span>
          )}
        </p>
      </div>
      <CountStepper
        value={count}
        min={min}
        onChange={(n) => {
          if (n <= 0) onRemove();
          else onSet({ count: n });
        }}
        t={t}
      />
    </div>
  );
}

function CountStepper({
  value,
  min,
  disabled,
  onChange,
  t,
}: {
  value: number;
  min: number;
  disabled?: boolean;
  onChange: (next: number) => void;
  t: ReturnType<typeof useTranslations>;
}) {
  const decrement = () => {
    if (value === 0) return;
    if (value <= min) onChange(0);
    else onChange(value - 1);
  };
  const increment = () => {
    if (value === 0) onChange(min);
    else onChange(value + 1);
  };
  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        aria-label="Remove"
        className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-lg text-[var(--color-text)] transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] disabled:opacity-40 disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text)]"
        onClick={decrement}
        disabled={disabled || value === 0}
      >
        −
      </button>
      <input
        type="number"
        inputMode="numeric"
        min={0}
        step={1}
        value={value || ""}
        placeholder="0"
        disabled={disabled}
        onChange={(e) => {
          const n = Number(e.target.value);
          if (Number.isNaN(n) || n <= 0) { onChange(0); return; }
          if (n < min) onChange(min);
          else onChange(Math.floor(n));
        }}
        className="input-base !py-1.5 w-16 text-center"
      />
      <button
        type="button"
        aria-label="Add"
        className="grid h-9 w-9 place-items-center rounded-lg border border-[var(--color-border)] bg-[var(--color-bg-elevated)] text-lg text-[var(--color-text)] transition hover:border-[var(--color-gold)] hover:text-[var(--color-gold)] disabled:opacity-40 disabled:hover:border-[var(--color-border)] disabled:hover:text-[var(--color-text)]"
        onClick={increment}
        disabled={disabled}
      >
        +
      </button>
    </div>
  );
}

export function StickyCateringTotal({ menu }: { menu: CateringItem[] }) {
  const { watch } = useFormContext<ReservationInput>();
  const t = useTranslations("catering");
  const picks = (watch("catering") ?? []) as CateringPick[];
  const priced = priceCatering(picks, menu);

  if (priced.lines.length === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 py-3 backdrop-blur sm:rounded-b-xl">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm">
          <span className="eyebrow !text-[10px]">Catering</span>
          <span className="ml-2 text-[var(--color-text-muted)]">
            {t("items", { count: priced.lines.length })}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xl font-medium text-[var(--color-gold-soft)]">
            {formatCzk(priced.total)}
            {priced.hasEstimates && (
              <span className="ml-1 text-xs font-sans text-[var(--color-text-subtle)]">
                ({t("inclEstimates")})
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
