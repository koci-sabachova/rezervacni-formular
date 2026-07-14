import type {
  CateringItem,
  CateringPick,
  PricedCatering,
  PricedCateringLine,
} from "@/lib/schemas/catering";

/**
 * Server-side recalculation of catering total. The client total is only for UX —
 * the source of truth is this function, run at submit time using the canonical menu.
 */
export function priceCatering(
  picks: CateringPick[],
  menu: CateringItem[],
): PricedCatering {
  const byId = new Map(menu.map((i) => [i.id, i]));
  const lines: PricedCateringLine[] = [];
  let total = 0;
  let hasEstimates = false;

  for (const pick of picks) {
    const item = byId.get(pick.itemId);
    if (!item || !item.aktivni) continue;

    if (item.cena === "individualne") {
      const budget = pick.budget ?? 0;
      if (budget <= 0) continue;
      hasEstimates = true;
      total += budget;
      lines.push({
        item,
        pick,
        lineTotal: budget,
        isEstimate: true,
        label: `${item.nazev} — est. ${budget.toLocaleString("en-US")} Kč`,
      });
      continue;
    }

    const count = Math.max(0, Math.floor(pick.count ?? 0));
    if (count === 0) continue;

    const unitPrice =
      pick.variant && item.varianty_ceny?.[pick.variant] !== undefined
        ? item.varianty_ceny[pick.variant]
        : item.cena;
    const lineTotal = unitPrice * count;
    total += lineTotal;

    let label = `${count}× ${item.nazev}`;
    if (pick.variant && item.varianty?.includes(pick.variant)) {
      label = `${count}× ${item.nazev} (${pick.variant})`;
    }

    lines.push({
      item,
      pick,
      lineTotal,
      isEstimate: false,
      label,
    });
  }

  return { lines, total, hasEstimates };
}

export function formatCzk(amount: number): string {
  return `${amount.toLocaleString("en-US")} Kč`;
}
