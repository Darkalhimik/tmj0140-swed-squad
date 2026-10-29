/**
 * Push-to-card helpers: formatting, Luhn check, network and issuer detection
 * (mock BIN table) and the recipient name check (Visa Account Name Inquiry /
 * Mastercard equivalent) used by "Send to a card".
 */

export type Network = "Visa" | "Mastercard";

export type Issuer = {
  bank: string;
  country: string;
  eu: boolean;
  currency: "EUR" | "UAH";
  swedbank?: boolean;
};

/** First 6 digits → issuer. Unknown BINs still work, with a generic label. */
const BINS: Record<string, Issuer> = {
  "457318": { bank: "Swedbank", country: "Estonia", eu: true, currency: "EUR", swedbank: true },
  "516732": { bank: "LHV Pank", country: "Estonia", eu: true, currency: "EUR" },
  "489537": { bank: "SEB", country: "Estonia", eu: true, currency: "EUR" },
  "535470": { bank: "Revolut", country: "Lithuania", eu: true, currency: "EUR" },
  "537541": { bank: "monobank", country: "Ukraine", eu: false, currency: "UAH" },
};

/** Cards whose holder name the network returns (demo data). */
const HOLDERS: Record<string, string> = {
  "4573183456789018": "Kristjan T.",
  "5167321122334418": "Liisa K.",
  "5375419988776603": "Oksana M.",
  "5354701234567893": "Marco R.",
};

export type SavedCard = { name: string; number: string };

export const savedCards: SavedCard[] = [
  { name: "Kristjan Tamm", number: "4573183456789018" },
  { name: "Liisa Kask", number: "5167321122334418" },
  { name: "Oksana Melnyk", number: "5375419988776603" },
];

export const digits = (raw: string) => raw.replace(/\D/g, "");

export function formatCardInput(raw: string) {
  return digits(raw).slice(0, 19).replace(/(.{4})/g, "$1 ").trim();
}

export function luhn(num: string) {
  let sum = 0;
  const d = num.split("").reverse().map(Number);
  for (let i = 0; i < d.length; i++) {
    let x = d[i]!;
    if (i % 2 === 1) {
      x *= 2;
      if (x > 9) x -= 9;
    }
    sum += x;
  }
  return sum % 10 === 0;
}

export function networkOf(num: string): Network | "Amex" | null {
  if (/^4/.test(num)) return "Visa";
  const two = Number(num.slice(0, 2));
  const four = Number(num.slice(0, 4));
  if ((two >= 51 && two <= 55) || (four >= 2221 && four <= 2720)) return "Mastercard";
  if (/^3[47]/.test(num)) return "Amex";
  return null;
}

export type CardCheck =
  | { state: "empty" }
  | { state: "typing"; network: Network | null }
  | { state: "invalid"; message: string }
  | { state: "valid"; network: Network; issuer: Issuer; last4: string; holder: string | null };

export function checkCard(raw: string): CardCheck {
  const num = digits(raw);
  if (!num) return { state: "empty" };
  const network = networkOf(num);
  if (network === "Amex") return { state: "invalid", message: "American Express cards can't receive transfers. Use a Visa or Mastercard." };
  // Mastercard's 2-series (2221–2720) needs four digits before we can tell.
  const undecided = /^2/.test(num) && num.length < 4;
  if (!network && !undecided && num.length >= 2) return { state: "invalid", message: "Only Visa and Mastercard cards can receive transfers." };
  if (num.length < 16) return { state: "typing", network: network as Network | null };
  if (!luhn(num)) return { state: "invalid", message: "This card number has a typo — the check digit doesn't match." };
  const issuer = BINS[num.slice(0, 6)] ?? { bank: `${network} card`, country: "EU", eu: true, currency: "EUR" as const };
  return { state: "valid", network: network as Network, issuer, last4: num.slice(-4), holder: HOLDERS[num] ?? null };
}

// ---------- Pricing (concept proposal) ----------

export const CARD_LIMITS = { perTransfer: 2500, perMonth: 5000, usedThisMonth: 440 };

/** Mid-market rate and the rate we apply (0.5% markup), shown before sending. */
export const FX = { UAH: { mid: 48.62, ours: 48.38, markupPct: 0.5 } };

export function cardTransferFee(issuer: Issuer, amount: number) {
  if (issuer.swedbank) return { fee: 0, rule: "Free to Swedbank cards" };
  if (issuer.eu) return { fee: 0.5, rule: "€0.50 to other EU cards" };
  return { fee: Math.max(1, Math.round(amount * 0.01 * 100) / 100), rule: "1% (min €1.00) outside the EU" };
}

export function arrivalFor(issuer: Issuer) {
  if (issuer.swedbank) return "Arrives instantly";
  if (issuer.eu) return "Usually arrives within 30 minutes";
  return "Usually within 30 minutes, at the latest next business day";
}
