/** Reference data for founding an Estonian OÜ (e-Business Register flow). */

export const STATE_FEE = 265;
export const BANK_CERTIFICATE_THRESHOLD = 50000;
export const VAT_THRESHOLD = 40000;

/** A small slice of EMTAK (Estonian NACE). Only one principal activity at founding. */
export const emtak = [
  { code: "62011", label: "Computer programming" },
  { code: "62021", label: "IT consultancy" },
  { code: "63121", label: "Web portals" },
  { code: "74101", label: "Design of industrial and consumer goods" },
  { code: "74102", label: "Graphic design" },
  { code: "73111", label: "Advertising agencies" },
  { code: "70221", label: "Business and management consultancy" },
  { code: "47911", label: "Retail sale via the internet" },
  { code: "56101", label: "Restaurants" },
  { code: "56301", label: "Bars and cafés" },
  { code: "43341", label: "Painting and glazing" },
  { code: "85599", label: "Other education (courses, training)" },
  { code: "90031", label: "Artistic creation" },
  { code: "71121", label: "Engineering design and consultancy" },
];

/** Names already in the register (mock), checked case-insensitively. */
export const takenNames = ["nordlight studio", "nordlight", "pohjatuul", "kalamaja design", "swedbank"];

export const similarNames: Record<string, string[]> = {
  nord: ["Nordlight Studio OÜ", "Nordic Light Media OÜ"],
  labs: ["Labs Tallinn OÜ", "Põhjalabs OÜ"],
  studio: ["Studio Kalamaja OÜ", "Nordlight Studio OÜ"],
};

export function checkName(raw: string): { status: "empty" | "short" | "taken" | "similar" | "available"; message: string; similar: string[] } {
  const name = raw.trim().replace(/\s*(OÜ|osaühing)$/i, "").trim();
  if (!name) return { status: "empty", message: "", similar: [] };
  if (name.length < 3) return { status: "short", message: "Use at least 3 characters.", similar: [] };
  const key = name.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
  if (takenNames.includes(key)) {
    return { status: "taken", message: `${name} OÜ is already registered. Try adding a word, e.g. “${name} Labs OÜ”.`, similar: [] };
  }
  const similar = Object.entries(similarNames)
    .filter(([k]) => key.includes(k))
    .flatMap(([, v]) => v)
    .filter((v, i, a) => a.indexOf(v) === i);
  if (similar.length) {
    return { status: "similar", message: "Available, but similar names exist. The registrar may ask you to change it.", similar };
  }
  return { status: "available", message: "Available. The registrar makes the final decision.", similar: [] };
}

/** What the e-Business Register returns for an existing company (mock). */
export const registryLookup: Record<string, {
  name: string;
  code: string;
  registered: string;
  address: string;
  emtak: string;
  capital: number;
  status: string;
  board: { name: string; idCode: string }[];
  owners: { name: string; share: number }[];
}> = {
  "16520417": {
    name: "Kalamaja Design OÜ",
    code: "16520417",
    registered: "2022-08-19",
    address: "Kalasadama 4-12, 10415 Tallinn",
    emtak: "74102 — Graphic design",
    capital: 2500,
    status: "Entered into the register",
    board: [{ name: "Mari Tamm", idCode: "49203150123" }],
    owners: [{ name: "Mari Tamm", share: 100 }],
  },
};

export const turnoverBands = [
  { value: "lt10", label: "Under €10k" },
  { value: "10-50", label: "€10–50k" },
  { value: "50-250", label: "€50–250k" },
  { value: "gt250", label: "Over €250k" },
] as const;

export const countryOptions = ["Estonia", "Finland", "Latvia", "Lithuania", "Sweden", "Germany", "United Kingdom", "United States", "Other EU"];

/** Identifiers the registrar and the bank hand out at the end of the demo flow. */
export const NEW_COMPANY = {
  registryCode: "17012345",
  iban: "EE582200221081234567",
  appRef: "2026-0412-883",
};

/** Two-person approval rules need two board members; a sole founder signs alone. */
export function effectivePreset(f: { approvalPreset: "single" | "second" | "always"; mode: "new" | "existing" | null; founders: { board: boolean }[] }) {
  const board = f.mode === "existing" ? 1 : f.founders.filter((p) => p.board).length;
  return board < 2 ? "single" : f.approvalPreset;
}
