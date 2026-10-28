/** IBAN helpers for the payment form: structure, checksum and bank lookup. */

const LENGTHS: Record<string, number> = {
  EE: 20,
  LV: 21,
  LT: 20,
  FI: 18,
  SE: 24,
  DE: 22,
  PL: 28,
  NL: 18,
  FR: 27,
  GB: 22,
  IE: 22,
};

const COUNTRIES: Record<string, string> = {
  EE: "Estonia",
  LV: "Latvia",
  LT: "Lithuania",
  FI: "Finland",
  SE: "Sweden",
  DE: "Germany",
  PL: "Poland",
  NL: "Netherlands",
  FR: "France",
  GB: "United Kingdom",
  IE: "Ireland",
};

/** Estonian bank codes: the two digits after the check digits. */
const EE_BANKS: Record<string, string> = {
  "22": "Swedbank",
  "10": "SEB",
  "77": "LHV",
  "17": "Luminor",
  "96": "Luminor",
  "42": "Coop Pank",
};

export function cleanIban(raw: string) {
  return raw.replace(/\s+/g, "").toUpperCase();
}

export function formatIbanInput(raw: string) {
  return cleanIban(raw)
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 34)
    .replace(/(.{4})/g, "$1 ")
    .trim();
}

function mod97(iban: string) {
  const rearranged = (iban.slice(4) + iban.slice(0, 4)).replace(/[A-Z]/g, (c) => String(c.charCodeAt(0) - 55));
  let r = 0;
  for (const ch of rearranged) r = (r * 10 + Number(ch)) % 97;
  return r === 1;
}

export type IbanCheck =
  | { state: "empty" }
  | { state: "typing"; hint: string }
  | { state: "invalid"; message: string }
  | { state: "valid"; country: string; bank: string | null; swedbank: boolean; sepa: boolean };

/**
 * `trusted` skips the checksum for saved payees (their IBANs were verified
 * when the payee was first paid).
 */
export function checkIban(raw: string, trusted = false): IbanCheck {
  const iban = cleanIban(raw);
  if (!iban) return { state: "empty" };
  if (!/^[A-Z]{2}/.test(iban)) return { state: "typing", hint: "Starts with a country code, e.g. EE" };
  const cc = iban.slice(0, 2);
  const len = LENGTHS[cc];
  if (!len) return { state: "invalid", message: `We can't send to ${cc} IBANs online. Try a SEPA country.` };
  if (!/^[A-Z]{2}\d{2}[A-Z0-9]+$/.test(iban)) return { state: "invalid", message: "An IBAN has only letters and digits." };
  if (iban.length < len) return { state: "typing", hint: `${COUNTRIES[cc]} IBANs have ${len} characters · ${len - iban.length} to go` };
  if (iban.length > len) return { state: "invalid", message: `${COUNTRIES[cc]} IBANs have exactly ${len} characters.` };
  if (!trusted && !mod97(iban)) return { state: "invalid", message: "Check the IBAN — the control digits don't match." };
  const bank = cc === "EE" ? (EE_BANKS[iban.slice(4, 6)] ?? null) : null;
  return { state: "valid", country: COUNTRIES[cc]!, bank, swedbank: bank === "Swedbank", sepa: cc !== "GB" };
}
