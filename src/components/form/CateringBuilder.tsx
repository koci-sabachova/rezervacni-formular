"use client";

import { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import {
  CATEGORY_LABELS,
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
      setValue("catering", [...picks, { itemId, ...patch }], {
        shouldDirty: true,
      });
    } else {
      const next = [...picks];
      next[idx] = { ...next[idx], ...patch };
      setValue("catering", next, { shouldDirty: true });
    }
  };

  const removePick = (itemId: string) => {
    setValue(
      "catering",
      picks.filter((p) => p.itemId !== itemId),
      { shouldDirty: true },
    );
  };

  const getPick = (itemId: string): CateringPick | undefined =>
    picks.find((p) => p.itemId === itemId);

  if (menu.length === 0) {
    return (
      <div className="surface-muted text-sm text-[var(--color-text-muted)]">
        Catering momentálně načítáme jinak — napište nám prosím požadavky do poznámky
        (krok 4) a my se Vám ozveme s nabídkou.
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
            <h3 className="mb-3 eyebrow !text-[11px]">
              {CATEGORY_LABELS[cat]}
            </h3>
            <div className="space-y-2">
              {items.map((item) => (
                <CateringItemRow
                  key={item.id}
                  item={item}
                  pick={getPick(item.id)}
                  onSet={(patch) => setPick(item.id, patch)}
                  onRemove={() => removePick(item.id)}
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
}: {
  item: CateringItem;
  pick: CateringPick | undefined;
  onSet: (patch: Partial<CateringPick>) => void;
  onRemove: () => void;
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
            {item.popis ?? "Množství upravíme podle rozpočtu."} · {item.jednotka}
          </p>
        </div>
        <label className="flex items-center gap-2 text-sm">
          <span className="text-[var(--color-text-muted)]">Rozpočet (Kč)</span>
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

  if (hasPricedVariants) {
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
              {item.jednotka} · {priceLabel}
            </p>
          </div>
          {pick && count > 0 && (
            <span className="chip">{count}× v košíku</span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <select
            className="input-base !py-2 sm:max-w-xs"
            value={variant}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) {
                onRemove();
              } else {
                onSet({ variant: v, count: count || 1 });
              }
            }}
          >
            <option value="">Vyberte variantu</option>
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
                {prices[v] !== undefined ? ` — ${formatCzk(prices[v])}` : ""}
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
          />
        </div>
      </div>
    );
  }

  if (isCake) {
    const variant = pick?.variant ?? "";
    const count = pick?.count ?? 0;
    const variants = item.varianty ?? [];
    return (
      <div className="card space-y-2">
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1">
            <p className="font-medium text-[var(--color-text)]">{item.nazev}</p>
            <p className="text-xs text-[var(--color-text-subtle)]">
              {item.jednotka} · {formatCzk(item.cena as number)}
            </p>
          </div>
          {pick && count > 0 && (
            <span className="chip">{count}× v košíku</span>
          )}
        </div>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:gap-3">
          <select
            className="input-base !py-2 sm:max-w-xs"
            value={variant}
            onChange={(e) => {
              const v = e.target.value;
              if (!v) {
                onRemove();
              } else {
                onSet({ variant: v, count: count || 1 });
              }
            }}
          >
            <option value="">Vyberte variantu</option>
            {variants.map((v) => (
              <option key={v} value={v}>
                {v}
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
              (min. {min} ks od jednoho druhu)
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
      />
    </div>
  );
}

function CountStepper({
  value,
  min,
  disabled,
  onChange,
}: {
  value: number;
  min: number;
  disabled?: boolean;
  onChange: (next: number) => void;
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
        aria-label="Ubrat"
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
          if (Number.isNaN(n) || n <= 0) {
            onChange(0);
            return;
          }
          if (n < min) onChange(min);
          else onChange(Math.floor(n));
        }}
        className="input-base !py-1.5 w-16 text-center"
      />
      <button
        type="button"
        aria-label="Přidat"
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
  const picks = (watch("catering") ?? []) as CateringPick[];
  const priced = priceCatering(picks, menu);

  if (priced.lines.length === 0) return null;

  return (
    <div className="sticky bottom-0 z-10 -mx-4 mt-4 border-t border-[var(--color-border)] bg-[var(--color-bg)]/95 px-4 py-3 backdrop-blur sm:rounded-b-xl">
      <div className="flex items-baseline justify-between gap-4">
        <div className="text-sm">
          <span className="eyebrow !text-[10px]">Catering</span>
          <span className="ml-2 text-[var(--color-text-muted)]">
            {priced.lines.length}{" "}
            {priced.lines.length === 1 ? "položka" : "položek"}
          </span>
        </div>
        <div className="text-right">
          <div className="text-xl font-medium text-[var(--color-gold-soft)]">
            {formatCzk(priced.total)}
            {priced.hasEstimates && (
              <span className="ml-1 text-xs font-sans text-[var(--color-text-subtle)]">
                (vč. odhadů)
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
