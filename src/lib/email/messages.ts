import csMessages from "../../../messages/cs.json";
import enMessages from "../../../messages/en.json";

const MESSAGES: Record<string, Record<string, unknown>> = {
  cs: csMessages as Record<string, unknown>,
  en: enMessages as Record<string, unknown>,
};

export function emailMsg(
  locale: string,
  path: string,
  vars: Record<string, string | number> = {},
): string {
  const msgs = MESSAGES[locale] ?? MESSAGES.en;
  const keys = path.split(".");
  let val: unknown = msgs;
  for (const k of keys) {
    val = (val as Record<string, unknown>)?.[k];
  }
  if (typeof val !== "string") return path;
  return Object.entries(vars).reduce(
    (s, [k, v]) => s.replaceAll(`{${k}}`, String(v)),
    val,
  );
}
