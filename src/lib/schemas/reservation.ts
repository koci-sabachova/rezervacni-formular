import { z } from "zod";
import { cateringPickSchema } from "./catering";

export const VENUES = ["cobra", "informace", "unsure"] as const;
export type Venue = (typeof VENUES)[number];

export const VENUE_LABELS: Record<Venue, string> = {
  cobra: "bar Cobra",
  informace: "výčep Informace",
  unsure: "ještě nevím",
};

export const EVENT_TYPES = [
  "narozeniny",
  "sraz",
  "firemni",
  "jine",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const EVENT_TYPE_LABELS: Record<EventType, string> = {
  narozeniny: "Narozeniny",
  sraz: "Sraz / setkání",
  firemni: "Firemní akce",
  jine: "Jiné",
};

export const MIN_PARTY_SIZE = 10;
export const MAX_PARTY_SIZE_MAIN = 35;
export const MAX_PARTY_SIZE_TOTAL = 100;

const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Vyberte platné datum");
const time24 = z.string().regex(/^\d{2}:\d{2}$/, "Vyberte platný čas");

const phone = z
  .string()
  .trim()
  .min(9, "Zadejte platné telefonní číslo")
  .regex(
    /^[+]?[\d\s\-()]{9,20}$/,
    "Zadejte platné telefonní číslo (např. +420 777 123 456)",
  );

const email = z.string().trim().email("Zadejte platnou e-mailovou adresu");

export const step1Schema = z.object({
  date: isoDate,
  time: time24,
  partySize: z.coerce
    .number()
    .int("Zadejte celé číslo")
    .min(1, "Zadejte počet lidí")
    .max(MAX_PARTY_SIZE_TOTAL, "Maximální kapacita je 100 lidí"),
  venue: z.enum(VENUES),
});

export const step2Schema = z.object({
  eventType: z.enum(EVENT_TYPES).optional().or(z.literal("")),
  eventTypeOther: z.string().trim().max(120).optional().or(z.literal("")),
});

export const step3Schema = z.object({
  catering: z.array(cateringPickSchema).default([]),
});

export const step4Schema = z.object({
  name: z.string().trim().min(2, "Zadejte jméno a příjmení").max(120),
  phone,
  email,
  note: z.string().trim().max(2000).optional().or(z.literal("")),
  gdpr: z.literal(true, {
    errorMap: () => ({ message: "Bez souhlasu rezervaci nelze odeslat" }),
  }),
});

export const antiSpamSchema = z.object({
  honeypot: z.string().max(0, "Spam detected").optional().or(z.literal("")),
  turnstileToken: z.string().optional().or(z.literal("")),
});

export const reservationSchema = step1Schema
  .merge(step2Schema)
  .merge(step3Schema)
  .merge(step4Schema)
  .merge(antiSpamSchema);

export type ReservationInput = z.input<typeof reservationSchema>;
export type ReservationPayload = z.output<typeof reservationSchema>;

export const TIME_SLOTS: string[] = (() => {
  const slots: string[] = [];
  for (let h = 14; h <= 20; h++) {
    slots.push(`${String(h).padStart(2, "0")}:00`);
    slots.push(`${String(h).padStart(2, "0")}:30`);
  }
  return slots.filter((s) => s <= "20:30");
})();
