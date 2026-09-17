/**
 * Display-only English labels for catering item variants (e.g. cake flavours,
 * dip sides). The menu source only carries one language (Czech) per variant —
 * the value actually stored/submitted always stays that original string,
 * only what's shown to an `en`-locale visitor changes here.
 *
 * Falls back to the original string when a variant has no translation yet
 * (e.g. something new added to the menu before this list catches up) —
 * never throws, never blocks rendering.
 */
const EN_LABELS: Record<string, string> = {
  "S focacciou": "With focaccia",
  "Se zeleninou & focacciou": "With vegetables & focaccia",
  "Vanilkový mascarpone s lesním ovocem": "Vanilla mascarpone with forest fruit",
  "Kakaový s karamelem a čokoládou": "Cocoa with caramel and chocolate",
  "Pistáciový s bílou čokoládou": "Pistachio with white chocolate",
};

export function translateVariant(label: string, locale: string): string {
  if (locale !== "en") return label;
  return EN_LABELS[label] ?? label;
}
