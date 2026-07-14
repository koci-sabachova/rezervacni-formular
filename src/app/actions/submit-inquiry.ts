"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createInquirySchema,
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
  locale: string = "en",
): Promise<SubmitInquiryResult> {
  const tActions = await getTranslations({ locale, namespace: "actions" });

  if (input.honeypot && input.honeypot.length > 0) {
    return { ok: true };
  }

  const schema = createInquirySchema();
  const parsed = schema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first
        ? tActions("incompleteWithMsg", { message: first.message })
        : tActions("incomplete"),
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
    return { ok: false, error: tActions("turnstile") };
  }

  const operatorRes = await sendEmail({
    audience: "operator",
    subject: tActions("inquirySubjectOperator", {
      count: data.estimatedPartySize,
      name: data.name,
    }),
    react: InquiryOperatorEmail({ data, locale }),
    replyTo: data.email,
  });
  if (!operatorRes.ok) {
    return { ok: false, error: tActions("sendError") };
  }

  const customerRes = await sendEmail({
    audience: "customer",
    to: data.email,
    subject: tActions("inquirySubjectCustomer"),
    react: InquiryCustomerEmail({ data, locale }),
  });
  if (!customerRes.ok) {
    console.warn("[inquiry] customer auto-reply failed:", customerRes.error);
  }

  return { ok: true };
}
