"use server";

import { headers } from "next/headers";
import { getTranslations } from "next-intl/server";
import {
  createReservationSchema,
  type ReservationInput,
  type ReservationPayload,
} from "@/lib/schemas/reservation";
import { getCateringMenu } from "@/lib/sheets/fetch";
import { priceCatering } from "@/lib/catering/calculate";
import { verifyTurnstile } from "@/lib/turnstile/verify";
import { sendEmail } from "@/lib/email/send";
import { ReservationOperatorEmail } from "@/lib/email/templates/ReservationOperatorEmail";
import { ReservationCustomerEmail } from "@/lib/email/templates/ReservationCustomerEmail";
import { formatLongDate } from "@/lib/utils/dates";

export type SubmitResult = { ok: true } | { ok: false; error: string };

export async function submitReservation(
  input: ReservationInput,
  locale: string = "en",
): Promise<SubmitResult> {
  const tActions = await getTranslations({ locale, namespace: "actions" });

  // 1. Honeypot — must be empty
  if (input.honeypot && input.honeypot.length > 0) {
    return { ok: true };
  }

  // 2. Schema validation (use default English messages — server re-validates for integrity)
  const { schema } = createReservationSchema();
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
  const data: ReservationPayload = parsed.data;

  // 3. Turnstile verify (server-side)
  const reqHeaders = await headers();
  const ip =
    reqHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    reqHeaders.get("x-real-ip") ??
    undefined;
  const turnstile = await verifyTurnstile(data.turnstileToken, ip);
  if (!turnstile.ok) {
    console.warn("[reservation] turnstile failed:", turnstile.reason);
    return { ok: false, error: tActions("turnstile") };
  }

  // 4. Re-fetch canonical menu and recalculate catering total server-side
  const menu = await getCateringMenu({ noCache: true });
  const pricedCatering = priceCatering(data.catering ?? [], menu.items);

  // 5. Send emails — operator first (the critical one), then customer
  const longDate = formatLongDate(data.date, locale);
  const subjectOperator = tActions("reservationSubjectOperator", {
    date: longDate,
    count: data.partySize,
    name: data.name,
  });
  const operatorRes = await sendEmail({
    audience: "operator",
    subject: subjectOperator,
    react: ReservationOperatorEmail({ data, pricedCatering, locale }),
    replyTo: data.email,
  });

  if (!operatorRes.ok) {
    console.error("[reservation] operator email failed:", operatorRes.error);
    return { ok: false, error: tActions("sendError") };
  }

  // Customer auto-reply — non-fatal if it fails
  const customerRes = await sendEmail({
    audience: "customer",
    to: data.email,
    subject: tActions("reservationSubjectCustomer"),
    react: ReservationCustomerEmail({ data, pricedCatering, locale }),
  });
  if (!customerRes.ok) {
    console.warn("[reservation] customer auto-reply failed:", customerRes.error);
  }

  return { ok: true };
}
