import { Resend } from "resend";
import { render } from "@react-email/components";
import type { ReactElement } from "react";

let resendClient: Resend | null = null;
function getClient(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  if (!key) return null;
  if (!resendClient) resendClient = new Resend(key);
  return resendClient;
}

const FROM = process.env.EMAIL_FROM ?? "Cobra & Informace <onboarding@resend.dev>";
const TO = process.env.EMAIL_TO ?? "rezervace@barcobra.cz";
const REPLY_TO = process.env.EMAIL_REPLY_TO ?? "rezervace@barcobra.cz";

export type SendEmailInput = {
  /** target audience — operator gets the full info, customer gets the auto-reply */
  audience: "operator" | "customer";
  to?: string;
  subject: string;
  react: ReactElement;
  /** override the global Reply-To */
  replyTo?: string;
};

export async function sendEmail(input: SendEmailInput): Promise<{
  ok: boolean;
  id?: string;
  error?: string;
}> {
  const client = getClient();
  const html = await render(input.react);
  const text = await render(input.react, { plainText: true });
  const to = input.to ?? (input.audience === "operator" ? TO : "");
  const replyTo = input.replyTo ?? REPLY_TO;

  if (!to) {
    return { ok: false, error: "missing-to" };
  }

  if (!client) {
    if (process.env.NODE_ENV !== "production") {
      console.log("[email:dev]", {
        audience: input.audience,
        to,
        subject: input.subject,
        textPreview: text.slice(0, 200),
      });
      return { ok: true, id: "dev-stub" };
    }
    return { ok: false, error: "missing-resend-key" };
  }

  try {
    const res = await client.emails.send({
      from: FROM,
      to,
      replyTo,
      subject: input.subject,
      html,
      text,
    });
    if (res.error) {
      console.error("[email] Resend error:", res.error);
      return { ok: false, error: res.error.message };
    }
    return { ok: true, id: res.data?.id };
  } catch (err) {
    console.error("[email] send threw:", err);
    return { ok: false, error: "send-failed" };
  }
}
