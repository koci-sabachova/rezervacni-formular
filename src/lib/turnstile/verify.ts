type TurnstileResponse = {
  success: boolean;
  "error-codes"?: string[];
  challenge_ts?: string;
  hostname?: string;
};

export async function verifyTurnstile(
  token: string | undefined,
  remoteIp?: string,
): Promise<{ ok: boolean; reason?: string }> {
  if (process.env.DISABLE_TURNSTILE === "1") {
    return { ok: true, reason: "disabled" };
  }
  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret) {
    if (process.env.NODE_ENV !== "production") {
      return { ok: true, reason: "no-key-dev" };
    }
    return { ok: false, reason: "missing-secret" };
  }
  if (!token) {
    return { ok: false, reason: "missing-token" };
  }

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const res = await fetch(
      "https://challenges.cloudflare.com/turnstile/v0/siteverify",
      {
        method: "POST",
        body,
      },
    );
    const data = (await res.json()) as TurnstileResponse;
    if (!data.success) {
      return {
        ok: false,
        reason: data["error-codes"]?.join(",") ?? "turnstile-failed",
      };
    }
    return { ok: true };
  } catch (err) {
    console.error("[turnstile] verify failed:", err);
    return { ok: false, reason: "network-error" };
  }
}
