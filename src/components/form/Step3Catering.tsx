"use client";

import { useFormContext } from "react-hook-form";
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
  const date = watch("date");
  const picks = (watch("catering") ?? []) as CateringPick[];
  const hasPicks = picks.some(
    (p) => (p.count && p.count > 0) || (p.budget && p.budget > 0),
  );

  const cateringLeadOk = isDateAtLeast(date, 3);
  const showLeadWarning = hasPicks && !cateringLeadOk;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl text-[var(--color-text)]">
          Chcete si rovnou objednat pohoštění?
        </h2>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Přidávejte položky tlačítky <strong className="text-[var(--color-text)]">−/+</strong>.
          Cena se počítá živě dole. Catering je <em>volitelný</em> — můžete ho přeskočit
          a domluvit jen rezervaci.
        </p>
        <p className="mt-2 text-sm text-[var(--color-text-muted)]">
          Nebo to vymyslíme společně po mailu/telefonu. Pokud si myslíte na nějaké jídlo,
          které zde nenajdete, uděláme, co bude v našich silách, abychom vám ho zajistili.
        </p>
        {source === "snapshot" && (
          <p className="surface-muted mt-3 !px-3 !py-2 text-xs text-[var(--color-text-muted)]">
            Catering nabídka se aktuálně načítá z bundlovaného snapshotu (živá data nejsou
            dostupná). Položky a ceny mohou být mírně neaktuální — finální cenu potvrdíme
            v odpovědi.
          </p>
        )}
      </div>

      <CateringBuilder menu={menu} />

      {showLeadWarning && (
        <div className="alert-warning">
          <p className="font-medium text-[var(--color-gold-soft)]">
            Catering potřebujeme objednat aspoň 3 dny dopředu
          </p>
          <p className="mt-1 opacity-80">
            Bez cateringu rezervaci přijímáme i na zítřek. Pokud vám tento termín vyhovuje,
            můžeme catering probrat individuálně — napište to do poznámky v dalším kroku, nebo
            catering přeskočte a domluvíme detaily v odpovědi.
          </p>
        </div>
      )}

      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={onSkip}
          className="link-subtle text-sm text-left"
        >
          Catering nechci, jen rezervaci
        </button>
      </div>

      <StickyCateringTotal menu={menu} />
    </div>
  );
}
