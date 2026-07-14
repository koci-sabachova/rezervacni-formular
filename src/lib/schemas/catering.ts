import { z } from "zod";

export const CATERING_CATEGORIES = [
  "slane_hlavni",
  "mala_jidla",
  "kanapky",
  "misy",
  "dort",
] as const;

export type CateringCategory = (typeof CATERING_CATEGORIES)[number];

export const CATEGORY_LABELS: Record<CateringCategory, string> = {
  slane_hlavni: "Sharing platters not on our regular menu",
  kanapky: "Canapés and small bites",
  misy: "Abundance platters in any quantity to match your budget",
  mala_jidla: "Small dishes from our all-day menu",
  dort: "Cake",
};

export const cateringItemSchema = z.object({
  id: z.string().min(1),
  kategorie: z.enum(CATERING_CATEGORIES),
  nazev: z.string().min(1),
  popis: z.string().optional(),
  jednotka: z.string().min(1),
  cena: z.union([z.number().nonnegative(), z.literal("individualne")]),
  min_pocet: z.number().int().positive().optional(),
  varianty: z.array(z.string()).optional(),
  varianty_ceny: z.record(z.string(), z.number().nonnegative()).optional(),
  aktivni: z.boolean(),
});

export type CateringItem = z.infer<typeof cateringItemSchema>;

export const cateringMenuSchema = z.array(cateringItemSchema);

export const cateringPickSchema = z.object({
  itemId: z.string().min(1),
  count: z.number().int().nonnegative().optional(),
  variant: z.string().optional(),
  budget: z.number().int().nonnegative().optional(),
});

export type CateringPick = z.infer<typeof cateringPickSchema>;

export type PricedCateringLine = {
  item: CateringItem;
  pick: CateringPick;
  lineTotal: number;
  isEstimate: boolean;
  label: string;
};

export type PricedCatering = {
  lines: PricedCateringLine[];
  total: number;
  hasEstimates: boolean;
};
