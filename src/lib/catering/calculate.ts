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

const WEIGHT_UNIT_RE = /^(\d+(?:[.,]\d+)?)\s*(kg|g)$/i;
const PLATE_UNIT_RE = /^(\d+(?:[.,]\d+)?)?\s*talíř/i;
const PORTION_UNIT_RE = /^(\d+(?:[.,]\d+)?)?\s*porc[eíi]/i;
const PACK_UNIT_RE = /^(\d+)\s*ks$/i;

/**
 * Pieces per unit for a pack-sold item (jednotka "4 ks", "2 ks", …) — e.g.
 * a mini sendvič is one sandwich pre-cut into 4 quarters and priced as a
 * single "4 ks" unit. Returns null for "1 ks" or anything that isn't a
 * multi-piece pack, since a plain count is already unambiguous there.
 */
export function packSize(jednotka: string): number | null {
  const match = jednotka.trim().match(PACK_UNIT_RE);
  if (!match) return null;
  const n = parseInt(match[1], 10);
  return n > 1 ? n : null;
}

function czechPortionWord(n: number): string {
  return n >= 5 || !Number.isInteger(n) ? "porcí" : "porce";
}

function czechPlateWord(n: number): string {
  if (n === 1) return "talíř";
  return n >= 2 && n <= 4 ? "talíře" : "talířů";
}

/**
 * Kitchen prep quantity for one item ("4 kg", "2 talíře", "4 porce") derived
 * from its jednotka × count — e.g. "1 kg" priced per kilo means 4 picks is
 * 4 kg to weigh out, not "4 pieces". Returns null for piece-counted items
 * (jednotka "1 ks" or anything else that doesn't parse) — those are already
 * unambiguous as a plain count.
 */
function kitchenQuantity(jednotka: string, count: number): string | null {
  const trimmed = jednotka.trim();

  const weight = trimmed.match(WEIGHT_UNIT_RE);
  if (weight) {
    const perUnit = parseFloat(weight[1].replace(",", "."));
    const unit = weight[2].toLowerCase();
    const total = Math.round(perUnit * count * 100) / 100;
    return `${total} ${unit}`;
  }

  const plate = trimmed.match(PLATE_UNIT_RE);
  if (plate) {
    const perUnit = plate[1] ? parseFloat(plate[1].replace(",", ".")) : 1;
    const total = Math.round(perUnit * count * 100) / 100;
    return `${total} ${czechPlateWord(total)}`;
  }

  const portion = trimmed.match(PORTION_UNIT_RE);
  if (portion) {
    const perUnit = portion[1] ? parseFloat(portion[1].replace(",", ".")) : 1;
    const total = Math.round(perUnit * count * 100) / 100;
    return `${total} ${czechPortionWord(total)}`;
  }

  const pack = packSize(trimmed);
  if (pack) {
    return `${pack * count} ks`;
  }

  return null;
}

/**
 * Same line as PricedCateringLine.label, but for kitchen/operator use: an
 * item priced by weight or plate shows the total to prep (e.g. "4 kg"), not
 * a piece count that reads like "4 whole batches".
 */
export function kitchenLineLabel(line: PricedCateringLine): string {
  if (line.isEstimate) return line.label;

  const { item, pick } = line;
  const count = Math.max(0, Math.floor(pick.count ?? 0));
  const variantSuffix =
    pick.variant && item.varianty?.includes(pick.variant) ? ` (${pick.variant})` : "";
  const qty = kitchenQuantity(item.jednotka, count);
  if (qty) return `${qty} ${item.nazev}${variantSuffix}`;
  return `${count}× ${item.nazev}${variantSuffix}`;
}
