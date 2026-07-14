import { z } from "zod";
import { antiSpamSchema } from "./reservation";

export type InquiryValidationMessages = {
  name: string;
  phoneMin: string;
  phoneRegex: string;
  email: string;
  partySizeInt: string;
  partySizeMin: string;
  partySizeMax: string;
  eventType: string;
  description: string;
  gdpr: string;
};

const defaultMsgs: InquiryValidationMessages = {
  name: "Please enter your first and last name",
  phoneMin: "Please enter a valid phone number",
  phoneRegex: "Please enter a valid phone number (e.g. +420 777 123 456)",
  email: "Please enter a valid email address",
  partySizeInt: "Please enter a whole number",
  partySizeMin: "For groups up to 35 people, please use the main form",
  partySizeMax: "For an event this size, please contact us directly by phone",
  eventType: "Please enter the type of event",
  description: "Please write a few sentences about your vision (at least 10 characters)",
  gdpr: "Consent is required to submit the enquiry",
};

export function createInquirySchema(msgs: InquiryValidationMessages = defaultMsgs) {
  return z
    .object({
      name: z.string().trim().min(2, msgs.name).max(120),
      phone: z
        .string()
        .trim()
        .min(9, msgs.phoneMin)
        .regex(/^[+]?[\d\s\-()]{9,20}$/, msgs.phoneRegex),
      email: z.string().trim().email(msgs.email),
      estimatedPartySize: z.coerce
        .number()
        .int(msgs.partySizeInt)
        .min(36, msgs.partySizeMin)
        .max(500, msgs.partySizeMax),
      estimatedDate: z.string().trim().max(120).optional().or(z.literal("")),
      eventType: z.string().trim().min(2, msgs.eventType).max(120),
      description: z.string().trim().min(10, msgs.description).max(4000),
      gdpr: z.literal(true, { errorMap: () => ({ message: msgs.gdpr }) }),
    })
    .merge(antiSpamSchema);
}

export const inquirySchema = createInquirySchema();
export type InquiryInput = z.input<typeof inquirySchema>;
export type InquiryPayload = z.output<typeof inquirySchema>;
