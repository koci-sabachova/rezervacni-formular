import { addDays, format, isAfter, isEqual, parseISO, startOfDay } from "date-fns";
import { cs } from "date-fns/locale";
import { enUS } from "date-fns/locale";

function dateFnsLocale(locale: string) {
  return locale === "cs" ? cs : enUS;
}

export function todayLocal(): Date {
  return startOfDay(new Date());
}

export function tomorrowIso(): string {
  return format(addDays(todayLocal(), 1), "yyyy-MM-dd");
}

export function isoToDate(iso: string | undefined | null): Date | null {
  if (!iso) return null;
  try {
    const d = parseISO(iso);
    return Number.isNaN(d.getTime()) ? null : d;
  } catch {
    return null;
  }
}

export function daysUntil(iso: string | undefined | null): number | null {
  const d = isoToDate(iso);
  if (!d) return null;
  const today = todayLocal();
  const target = startOfDay(d);
  const diffMs = target.getTime() - today.getTime();
  return Math.round(diffMs / (1000 * 60 * 60 * 24));
}

export function isDateAtLeast(iso: string | undefined | null, minDaysAhead: number): boolean {
  const days = daysUntil(iso);
  if (days === null) return false;
  return days >= minDaysAhead;
}

export function formatLongDate(iso: string | undefined | null, locale: string = "en"): string {
  const d = isoToDate(iso);
  if (!d) return "—";
  return format(d, "EEEE d. MMMM yyyy", { locale: dateFnsLocale(locale) });
}

export function formatShortDate(iso: string | undefined | null, locale: string = "en"): string {
  const d = isoToDate(iso);
  if (!d) return "—";
  return format(d, "d. M. yyyy", { locale: dateFnsLocale(locale) });
}

export function isFutureDate(iso: string | undefined | null): boolean {
  const d = isoToDate(iso);
  if (!d) return false;
  const tomorrow = startOfDay(addDays(todayLocal(), 1));
  return isEqual(startOfDay(d), tomorrow) || isAfter(startOfDay(d), tomorrow);
}
