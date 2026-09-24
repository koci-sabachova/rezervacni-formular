import type { CateringItem } from "@/lib/schemas/catering";
import type { CateringPick } from "@/lib/schemas/catering";

/**
 * Private one-off order menu for a specific already-agreed event ("Jiras"),
 * not part of the public Google Sheets catering menu. Quantities in
 * JIRAS_DEFAULT_PICKS are the amounts already discussed — the form
 * pre-fills them so the client only has to review and confirm.
 */
export const jirasMenu: CateringItem[] = [
  {
    id: "jiras-gulas",
    kategorie: "kuchyne",
    nazev: "Guláš",
    jednotka: "porce",
    cena: 94,
    aktivni: true,
  },
  {
    id: "jiras-dynovy-krem",
    kategorie: "kuchyne",
    nazev: "Dýňový krém",
    jednotka: "porce",
    cena: 32,
    aktivni: true,
  },
  {
    id: "jiras-rizecky",
    kategorie: "kuchyne",
    nazev: "Kuřecí řízečky, okurčičky, citron",
    jednotka: "porce",
    cena: 79,
    aktivni: true,
  },
  {
    id: "jiras-foccaccia",
    kategorie: "kuchyne",
    nazev: "Velká foccaccia v celku",
    jednotka: "1 ks",
    cena: 148,
    aktivni: true,
  },
  {
    id: "jiras-crudites",
    kategorie: "kuchyne",
    nazev: "Zeleninové crudites — mrkev, okurka, celer",
    jednotka: "1 kg",
    cena: 185,
    aktivni: true,
  },
  {
    id: "jiras-hummus",
    kategorie: "kuchyne",
    nazev: "Hummus",
    jednotka: "0.75 kg",
    cena: 713,
    aktivni: true,
  },
  {
    id: "jiras-babaganoush",
    kategorie: "kuchyne",
    nazev: "Babaganoush",
    jednotka: "0.75 kg",
    cena: 825,
    aktivni: true,
  },
  {
    id: "jiras-muhammara",
    kategorie: "kuchyne",
    nazev: "Muhammara",
    jednotka: "0.75 kg",
    cena: 938,
    aktivni: true,
  },
  {
    id: "jiras-brownie",
    kategorie: "kuchyne",
    nazev: "1/2 brownie",
    jednotka: "1 ks",
    cena: 25,
    aktivni: true,
  },
];

export const JIRAS_DEFAULT_PICKS: CateringPick[] = [
  { itemId: "jiras-gulas", count: 25 },
  { itemId: "jiras-dynovy-krem", count: 25 },
  { itemId: "jiras-rizecky", count: 30 },
  { itemId: "jiras-foccaccia", count: 3 },
  { itemId: "jiras-crudites", count: 1 },
  { itemId: "jiras-hummus", count: 1 },
  { itemId: "jiras-babaganoush", count: 1 },
  { itemId: "jiras-muhammara", count: 1 },
  { itemId: "jiras-brownie", count: 40 },
];
