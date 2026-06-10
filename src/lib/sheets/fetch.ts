import { google } from "googleapis";
import {
  cateringItemSchema,
  type CateringItem,
} from "@/lib/schemas/catering";
import { cateringSnapshot } from "@/data/catering-snapshot";

export type CateringSource = "live" | "snapshot" | "empty";

export type CateringMenu = {
  items: CateringItem[];
  source: CateringSource;
  fetchedAt: string;
};

const COLUMN_ORDER = [
  "id",
  "kategorie",
  "nazev",
  "popis",
  "jednotka",
  "cena",
  "min_pocet",
  "varianty",
  "aktivni",
] as const;

function parseRow(row: string[]): CateringItem | null {
  const obj: Record<string, unknown> = {};
  for (let i = 0; i < COLUMN_ORDER.length; i++) {
    const key = COLUMN_ORDER[i];
    const raw = (row[i] ?? "").toString().trim();
    if (raw === "") continue;
    obj[key] = raw;
  }

  const cenaRaw = obj.cena as string | undefined;
  if (cenaRaw !== undefined) {
    if (cenaRaw.toLowerCase() === "individualne" || cenaRaw.toLowerCase() === "individuálně") {
      obj.cena = "individualne";
    } else {
      const numeric = Number(cenaRaw.replace(/[^\d.]/g, ""));
      obj.cena = Number.isFinite(numeric) ? numeric : 0;
    }
  } else {
    obj.cena = 0;
  }

  if (typeof obj.min_pocet === "string") {
    const n = Number(obj.min_pocet);
    obj.min_pocet = Number.isFinite(n) ? n : undefined;
  }

  if (typeof obj.varianty === "string") {
    obj.varianty = obj.varianty
      .split(",")
      .map((s) => s.trim())
      .filter(Boolean);
  }

  if (typeof obj.aktivni === "string") {
    const v = obj.aktivni.toLowerCase();
    obj.aktivni = v === "true" || v === "yes" || v === "1" || v === "ano";
  } else {
    obj.aktivni = true;
  }

  const parsed = cateringItemSchema.safeParse(obj);
  return parsed.success ? parsed.data : null;
}

async function fetchFromSheets(): Promise<CateringItem[] | null> {
  const clientEmail = process.env.GOOGLE_SHEETS_CLIENT_EMAIL;
  const privateKey = process.env.GOOGLE_SHEETS_PRIVATE_KEY?.replace(
    /\\n/g,
    "\n",
  );
  const sheetId = process.env.GOOGLE_SHEETS_ID;
  const range = process.env.GOOGLE_SHEETS_RANGE ?? "Menu!A:I";

  if (!clientEmail || !privateKey || !sheetId) {
    return null;
  }

  try {
    const auth = new google.auth.JWT({
      email: clientEmail,
      key: privateKey,
      scopes: ["https://www.googleapis.com/auth/spreadsheets.readonly"],
    });
    const sheets = google.sheets({ version: "v4", auth });
    const res = await sheets.spreadsheets.values.get({
      spreadsheetId: sheetId,
      range,
    });
    const rows = res.data.values ?? [];
    if (rows.length < 2) return [];

    const items: CateringItem[] = [];
    for (let i = 1; i < rows.length; i++) {
      const item = parseRow(rows[i]);
      if (item && item.aktivni) items.push(item);
    }
    return items;
  } catch (err) {
    console.error("[sheets] Failed to fetch catering menu:", err);
    return null;
  }
}

let cache: { menu: CateringMenu; expiresAt: number } | null = null;
const TTL_MS = 5 * 60 * 1000;

export async function getCateringMenu(opts?: {
  noCache?: boolean;
}): Promise<CateringMenu> {
  const now = Date.now();
  if (!opts?.noCache && cache && cache.expiresAt > now) {
    return cache.menu;
  }

  const live = await fetchFromSheets();
  let menu: CateringMenu;
  if (live === null) {
    menu = {
      items: cateringSnapshot.filter((i) => i.aktivni),
      source: "snapshot",
      fetchedAt: new Date().toISOString(),
    };
  } else if (live.length === 0) {
    menu = {
      items: [],
      source: "empty",
      fetchedAt: new Date().toISOString(),
    };
  } else {
    menu = {
      items: live,
      source: "live",
      fetchedAt: new Date().toISOString(),
    };
  }

  cache = { menu, expiresAt: now + TTL_MS };
  return menu;
}
