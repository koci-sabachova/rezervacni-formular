import { z } from "zod";
import { antiSpamSchema } from "./reservation";
import { cateringPickSchema } from "./catering";

export type CateringOrderValidationMessages = {
  name: string;
  phoneMin: string;
  phoneRegex: string;
  email: string;
  cateringEmpty: string;
  gdpr: string;
};

const defaultMsgs: CateringOrderValidationMessages = {
  name: "Please enter your first and last name",
  phoneMin: "Please enter a valid phone number",
  phoneRegex: "Please enter a valid phone number (e.g. +420 777 123 456)",
  email: "Please enter a valid email address",
  cateringEmpty: "Please add at least one item to your order",
  gdpr: "Consent is required to submit the order",
};

export function createCateringOrderSchema(msgs: CateringOrderValidationMessages = defaultMsgs) {
  return z
    .object({
      name: z.string().trim().min(2, msgs.name).max(120),
      phone: z
        .string()
        .trim()
        .min(9, msgs.phoneMin)
        .regex(/^[+]?[\d\s\-()]{9,20}$/, msgs.phoneRegex),
      email: z.string().trim().email(msgs.email),
      eventDate: z.string().trim().max(120).optional().or(z.literal("")),
      note: z.string().trim().max(2000).optional().or(z.literal("")),
      catering: z.array(cateringPickSchema).default([]),
      gdpr: z.literal(true, { errorMap: () => ({ message: msgs.gdpr }) }),
    })
    .merge(antiSpamSchema)
    .superRefine((data, ctx) => {
      const hasItems = data.catering.some(
        (p) => (p.count && p.count > 0) || (p.budget && p.budget > 0),
      );
      if (!hasItems) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: msgs.cateringEmpty,
          path: ["catering"],
        });
      }
    });
}

export const cateringOrderSchema = createCateringOrderSchema();
export type CateringOrderInput = z.input<typeof cateringOrderSchema>;
export type CateringOrderPayload = z.output<typeof cateringOrderSchema>;
