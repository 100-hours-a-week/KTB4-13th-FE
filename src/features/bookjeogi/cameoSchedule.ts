// When 북적이 may peek in outside the chat. Modelled on bookjeok.com's cat cameo: rare, capped, and
// never on screens where someone is paying, writing or signing in (those are simply not listed here).
export const CAMEO_PATHS = ["/", "/search", "/catalog/ranking", "/my"];

export const CAMEO_RULES = {
  // First roll after staying this long on a page (ms).
  delayMin: 4_000,
  delayMax: 10_000,
  chance: 0.45,
  // While staying on the same page, roll again this often (ms).
  retryMin: 35_000,
  retryMax: 60_000,
  retryChance: 0.3,
  perSession: 3,
  minGap: 90_000,
  perDay: 8,
  // How long one appearance stays (ms).
  visibleFor: 7_000,
} as const;

const SESSION_KEY = "bookjeogi-cameo-session";
const DAY_KEY = "bookjeogi-cameo-day";

interface CameoLedger {
  count: number;
  day?: string;
  lastShownAt: number;
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function read(storage: Storage, key: string): CameoLedger | null {
  try {
    const value = JSON.parse(storage.getItem(key) ?? "null") as CameoLedger | null;
    return value && typeof value.count === "number" ? value : null;
  } catch {
    return null;
  }
}

function write(storage: Storage, key: string, value: CameoLedger) {
  try {
    storage.setItem(key, JSON.stringify(value));
  } catch {
    // Private mode or blocked storage: the cameo just is not capped across reloads.
  }
}

export function canShowCameo(now: number) {
  const session = read(sessionStorage, SESSION_KEY);
  const day = read(localStorage, DAY_KEY);
  const dayCount = day?.day === today() ? day.count : 0;

  return (
    (session?.count ?? 0) < CAMEO_RULES.perSession &&
    dayCount < CAMEO_RULES.perDay &&
    now - (session?.lastShownAt ?? 0) >= CAMEO_RULES.minGap
  );
}

export function markCameoShown(now: number) {
  const session = read(sessionStorage, SESSION_KEY);
  const day = read(localStorage, DAY_KEY);
  const dayCount = day?.day === today() ? day.count : 0;

  write(sessionStorage, SESSION_KEY, { count: (session?.count ?? 0) + 1, lastShownAt: now });
  write(localStorage, DAY_KEY, { count: dayCount + 1, day: today(), lastShownAt: now });
}

export function randomBetween(min: number, max: number) {
  return min + Math.random() * (max - min);
}
