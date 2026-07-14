import { z } from "zod";
import { cateringPickSchema } from "./catering";

export const VENUES = ["cobra", "informace", "unsure"] as const;
export type Venue = (typeof VENUES)[number];

export const EVENT_TYPES = [
  "narozeniny",
  "sraz",
  "firemni",
  "jine",
] as const;
export type EventType = (typeof EVENT_TYPES)[number];

export const MIN_PARTY_SIZE = 10;
export const MAX_PARTY_SIZE_MAIN = 35;
export const MAX_PARTY_SIZE_TOTAL = 100;

export type ReservationValidationMessages = {
  date: string;
  time: string;
  phoneMin: string;
  phoneRegex: string;
  email: string;
  partySizeInt: string;
  partySizeMin: string;
  partySizeMax: string;
  name: string;
  gdpr: string;
};

const defaultMsgs: ReservationValidationMessages = {
  date: "Please select a valid date",
  time: "Please select a valid time",
  phoneMin: "Please enter a valid phone number",
  phoneRegex: "Please enter a valid phone number (e.g. +420 777 123 456)",
  email: "Please enter a valid email address",
  partySizeInt: "Please enter a whole number",
  partySizeMin: "Please enter the number of guests",
  partySizeMax: "Maximum capacity is 100 people",
  name: "Please enter your first and last name",
  gdpr: "Consent is required to submit the reservation",
};

export function createReservationSchema(msgs: ReservationValidationMessages = defaultMsgs) {
  const isoDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, msgs.date);
  const time24 = z.string().regex(/^\d{2}:\d{2}$/, msgs.time);

  const phone = z
    .string()
    .trim()
    .min(9, msgs.phoneMin)
    .regex(/^[+]?[\d\s\-()]{9,20}$/, msgs.phoneRegex);

  const email = z.string().trim().email(msgs.email);

  const step1Schema = z.object({
    date: isoDate,
    time: time24,
    partySize: z.coerce
      .number()
      .int(msgs.partySizeInt)
      .min(1, msgs.partySizeMin)
      .max(MAX_PARTY_SIZE_TOTAL, msgs.partySizeMax),
    venue: z.enum(VENUES),
  });

  const step2Schema = z.object({
    eventType: z.enum(EVENT_TYPES).optional().or(z.literal("")),
    eventTypeOther: z.string().trim().max(120).optional().or(z.literal("")),
  });

  const step3Schema = z.object({
    catering: z.array(cateringPickSchema).default([]),
  });

  const step4Schema = z.object({
    name: z.string().trim().min(2, msgs.name).max(120),
    phone,
    email,
    note: z.string().trim().max(2000).optional().or(z.literal("")),
    gdpr: z.literal(true, { errorMap: () => ({ message: msgs.gdpr }) }),
  });

  const antiSpamSchema = z.object({
    honeypot: z.string().max(0, "Spam detected").optional().or(z.literal("")),
    turnstileToken: z.string().optional().or(z.literal("")),
  });

  const schema = step1Schema
    .merge(step2Schema)
    .merge(step3Schema)
    .merge(step4Schema)
    .merge(antiSpamSchema);

  return { schema, step1Schema, step2Schema, step3Schema, step4Schema, antiSpamSchema };
}

const _default = createReservationSchema();
export const reservationSchema = _default.schema;
export const antiSpamSchema = _default.antiSpamSchema;

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
