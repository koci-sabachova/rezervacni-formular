"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createCateringOrderSchema,
  type CateringOrderInput,
  type CateringOrderPayload,
} from "@/lib/schemas/catering-order";
import { getCateringMenu } from "@/lib/sheets/fetch";
import { priceCatering } from "@/lib/catering/calculate";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { sendEmail } from "@/lib/email/send";
import { CateringOrderOperatorEmail } from "@/lib/email/templates/CateringOrderOperatorEmail";
import { CateringOrderCustomerEmail } from "@/lib/email/templates/CateringOrderCustomerEmail";

export type SubmitCateringOrderResult = { ok: true } | { ok: false; error: string };

export async function submitCateringOrder(
  input: CateringOrderInput,
  locale: string = "en",
): Promise<SubmitCateringOrderResult> {
  const tActions = await getTranslations({ locale, namespace: "actions" });

  // 1. Honeypot — must be empty
  if (input.honeypot && input.honeypot.length > 0) {
    return { ok: true };
  }

  // 2. Schema validation (default English messages — server re-validates for integrity)
  const schema = createCateringOrderSchema();
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
  const data: CateringOrderPayload = parsed.data;

  // 3. Turnstile verify (server-side)
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    reqHeaders.get("x-real-ip") ??
    undefined;
  const turnstile = await verifyTurnstile(data.turnstileToken, ip);
  if (!turnstile.ok) {
    console.warn("[catering-order] turnstile failed:", turnstile.reason);
    return { ok: false, error: tActions("turnstile") };
  }

  // 4. Re-fetch canonical menu and recalculate the total server-side
  const menu = await getCateringMenu({ noCache: true });
  const pricedCatering = priceCatering(data.catering, menu.items);

  // 5. Send emails — operator first (the critical one), then customer
  const operatorRes = await sendEmail({
    audience: "operator",
    subject: tActions("cateringOrderSubjectOperator", {
      amount: pricedCatering.total.toLocaleString("en-US"),
      name: data.name,
    }),
    react: CateringOrderOperatorEmail({ data, pricedCatering, locale }),
    replyTo: data.email,
  });

  if (!operatorRes.ok) {
    console.error("[catering-order] operator email failed:", operatorRes.error);
    return { ok: false, error: tActions("sendError") };
  }

  // Customer auto-reply — non-fatal if it fails
  const customerRes = await sendEmail({
    audience: "customer",
    to: data.email,
    subject: tActions("cateringOrderSubjectCustomer"),
    react: CateringOrderCustomerEmail({ data, pricedCatering, locale }),
  });
  if (!customerRes.ok) {
    console.warn("[catering-order] customer auto-reply failed:", customerRes.error);
  }

  return { ok: true };
}
