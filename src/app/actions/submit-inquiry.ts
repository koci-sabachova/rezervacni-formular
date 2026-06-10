"use server";

import { headers } from "next/headers";
import {
  inquirySchema,
  type InquiryInput,
  type InquiryPayload,
} from "@/lib/schemas/inquiry";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { sendEmail } from "@/lib/email/send";
import { InquiryOperatorEmail } from "@/lib/email/templates/InquiryOperatorEmail";
import { InquiryCustomerEmail } from "@/lib/email/templates/InquiryCustomerEmail";

export type SubmitInquiryResult = { ok: true } | { ok: false; error: string };

export async function submitInquiry(
  input: InquiryInput,
): Promise<SubmitInquiryResult> {
  if (input.honeypot && input.honeypot.length > 0) {
    return { ok: true };
  }

  const parsed = inquirySchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first
        ? `Údaje nejsou kompletní: ${first.message}`
        : "Údaje nejsou kompletní.",
    };
  }
  const data: InquiryPayload = parsed.data;

  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    reqHeaders.get("x-real-ip") ??
    undefined;
  const turnstile = await verifyTurnstile(data.turnstileToken, ip);
  if (!turnstile.ok) {
    return {
      ok: false,
      error:
        "Nepodařilo se ověřit, že nejste robot. Obnovte stránku a zkuste to znovu.",
    };
  }

  const operatorRes = await sendEmail({
    audience: "operator",
    subject: `Poptávka · ${data.estimatedPartySize} lidí · ${data.name}`,
    react: InquiryOperatorEmail({ data }),
    replyTo: data.email,
  });
  if (!operatorRes.ok) {
    return {
      ok: false,
      error:
        "Něco se pokazilo při odesílání. Zkuste to prosím za chvíli znovu, nebo nám napište na rezervace@barcobra.cz.",
    };
  }

  const customerRes = await sendEmail({
    audience: "customer",
    to: data.email,
    subject: "Děkujeme za poptávku · Cobra & Informace",
    react: InquiryCustomerEmail({ data }),
  });
  if (!customerRes.ok) {
    console.warn("[inquiry] customer auto-reply failed:", customerRes.error);
  }

  return { ok: true };
}
