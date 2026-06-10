import { z } from "zod";
import { antiSpamSchema } from "./reservation";

export const inquirySchema = z
  .object({
    name: z.string().trim().min(2, "Zadejte jméno a příjmení").max(120),
    phone: z
      .string()
      .trim()
      .min(9, "Zadejte platné telefonní číslo")
      .regex(
        /^[+]?[\d\s\-()]{9,20}$/,
        "Zadejte platné telefonní číslo (např. +420 777 123 456)",
      ),
    email: z.string().trim().email("Zadejte platnou e-mailovou adresu"),
    estimatedPartySize: z.coerce
      .number()
      .int("Zadejte celé číslo")
      .min(36, "Pro skupiny do 35 lidí použijte hlavní formulář")
      .max(500, "Pro tak velkou akci nás kontaktujte přímo telefonicky"),
    estimatedDate: z
      .string()
      .trim()
      .max(120)
      .optional()
      .or(z.literal("")),
    eventType: z.string().trim().min(2, "Vyplňte typ akce").max(120),
    description: z
      .string()
      .trim()
      .min(10, "Napište pár vět o své představě (alespoň 10 znaků)")
      .max(4000),
    gdpr: z.literal(true, {
      errorMap: () => ({ message: "Bez souhlasu poptávku nelze odeslat" }),
    }),
  })
  .merge(antiSpamSchema);

export type InquiryInput = z.input<typeof inquirySchema>;
export type InquiryPayload = z.output<typeof inquirySchema>;
