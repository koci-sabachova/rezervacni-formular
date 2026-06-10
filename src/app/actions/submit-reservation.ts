"use server";

import { headers } from "next/headers";
import {
  reservationSchema,
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
): Promise<SubmitResult> {
  // 1. Honeypot — must be empty
  if (input.honeypot && input.honeypot.length > 0) {
    return { ok: true }; // pretend success, silently drop
  }

  // 2. Schema validation
  const parsed = reservationSchema.safeParse(input);
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return {
      ok: false,
      error: first
        ? `Údaje nejsou kompletní: ${first.message}`
        : "Údaje nejsou kompletní.",
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
    return {
      ok: false,
      error:
        "Nepodařilo se ověřit, že nejste robot. Obnovte stránku a zkuste to znovu.",
    };
  }

  // 4. Re-fetch canonical menu and recalculate catering total server-side
  const menu = await getCateringMenu({ noCache: true });
  const pricedCatering = priceCatering(data.catering ?? [], menu.items);

  // 5. Send emails — operator first (the critical one), then customer
  const subjectOperator = `Rezervace · ${formatLongDate(data.date)} · ${data.partySize} lidí · ${data.name}`;
  const operatorRes = await sendEmail({
    audience: "operator",
    subject: subjectOperator,
    react: ReservationOperatorEmail({ data, pricedCatering }),
    replyTo: data.email, // operator replies straight to customer
  });

  if (!operatorRes.ok) {
    console.error("[reservation] operator email failed:", operatorRes.error);
    return {
      ok: false,
      error:
        "Něco se pokazilo při odesílání. Zkuste to prosím za chvíli znovu, nebo nám napište na rezervace@barcobra.cz.",
    };
  }

  // Customer auto-reply — non-fatal if it fails
  const customerRes = await sendEmail({
    audience: "customer",
    to: data.email,
    subject: "Děkujeme za rezervaci · Cobra & Informace",
    react: ReservationCustomerEmail({ data, pricedCatering }),
  });
  if (!customerRes.ok) {
    console.warn("[reservation] customer auto-reply failed:", customerRes.error);
    // operator already has it — let the user proceed to thank-you anyway
  }

  return { ok: true };
}
