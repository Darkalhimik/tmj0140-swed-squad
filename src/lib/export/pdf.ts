"use client";

/**
 * PDF documents generated in the browser with jsPDF (loaded on demand).
 * Every page carries a SPECIMEN watermark and a footer stating it is a student
 * concept with fictional data, so a file can't pass as a real bank document.
 */

import type { jsPDF as JsPDF } from "jspdf";
import { fmtDate, fmtDateTime, iban as fmtIban, money, NOW } from "@/lib/format";

type RGB = [number, number, number];
const C = {
  brand: [255, 95, 0] as RGB,
  ink: [81, 43, 43] as RGB,
  ink2: [113, 81, 81] as RGB,
  ink3: [133, 105, 106] as RGB,
  line: [226, 217, 212] as RGB,
  subtle: [249, 247, 245] as RGB,
  peach: [255, 241, 205] as RGB,
  warning: [153, 87, 0] as RGB,
  success: [69, 124, 14] as RGB,
};

const PAGE_W = 595.28;
const PAGE_H = 841.89;
const M = 48;
const CONTENT_W = PAGE_W - M * 2;
const BOTTOM = PAGE_H - 64;

export const SPECIMEN_NOTE =
  "SPECIMEN · Student concept by SWED SQUAD (TMJ0140/TMJ0130 Introduction to Entrepreneurship, 2026 autumn). Not a Swedbank document. All data is fictional.";

// Characters above U+00FF that WinAnsi (the built-in Helvetica encoding) still has.
const WIN_ANSI_EXTRA = new Set("€‚ƒ„…†‡ˆ‰Š‹ŒŽ‘’“”•–—˜™š›œžŸ");

/** Map characters outside WinAnsi to safe equivalents and drop the rest (e.g. emoji). */
function s(text: string) {
  const mapped = text
    .replace(/−/g, "-")
    .replace(/→/g, "->")
    .replace(/≈/g, "~")
    .replace(/[  ]/g, " ")
    .replace(/✓/g, "v");
  let out = "";
  for (const ch of mapped) {
    if (ch.codePointAt(0)! <= 0xff || WIN_ANSI_EXTRA.has(ch)) out += ch;
  }
  return out.replace(/ {2,}/g, " ").trimEnd();
}

export type Column = { label: string; width: number; align?: "left" | "right" };

class Writer {
  doc: JsPDF;
  y = M;
  private gstate: (new (o: { opacity: number }) => unknown) | null;

  constructor(doc: JsPDF, GState: new (o: { opacity: number }) => unknown) {
    this.doc = doc;
    this.gstate = GState;
  }

  font(size: number, style: "normal" | "bold" = "normal", color: RGB = C.ink) {
    this.doc.setFont("helvetica", style);
    this.doc.setFontSize(size);
    this.doc.setTextColor(...color);
  }

  text(t: string, x: number, y: number, opts?: { align?: "left" | "right" | "center"; maxWidth?: number }) {
    this.doc.text(s(t), x, y, opts);
  }

  ensure(space: number) {
    if (this.y + space > BOTTOM) {
      this.doc.addPage();
      this.y = M + 8;
    }
  }

  /** Brand header with a title block on the right. */
  header(title: string, meta: string[], brand = "Swedbank") {
    this.font(20, "bold", brand === "Swedbank" ? C.brand : C.ink);
    this.text(brand, M, this.y + 14);
    const brandW = this.doc.getTextWidth(s(brand));
    if (brand === "Swedbank") {
      this.font(8, "normal", C.ink3);
      this.text("concept", M + brandW + 6, this.y + 14);
    }
    this.font(15, "bold");
    this.text(title, PAGE_W - M, this.y + 12, { align: "right" });
    this.font(8.5, "normal", C.ink3);
    meta.forEach((m, i) => this.text(m, PAGE_W - M, this.y + 26 + i * 11, { align: "right" }));
    this.y += Math.max(36, 26 + meta.length * 11) + 6;
    this.doc.setDrawColor(...C.line);
    this.doc.setLineWidth(0.8);
    this.doc.line(M, this.y, PAGE_W - M, this.y);
    this.y += 14;
    this.specimenBanner();
  }

  specimenBanner() {
    const lines: string[] = this.doc.splitTextToSize(s(SPECIMEN_NOTE), CONTENT_W - 20);
    const h = 10 + lines.length * 10;
    this.doc.setFillColor(...C.peach);
    this.doc.roundedRect(M, this.y, CONTENT_W, h, 4, 4, "F");
    this.font(8, "bold", C.warning);
    lines.forEach((l, i) => this.text(l, M + 10, this.y + 13 + i * 10));
    this.y += h + 18;
  }

  heading(t: string) {
    this.ensure(40);
    this.font(11, "bold");
    this.text(t, M, this.y);
    this.y += 14;
  }

  paragraph(t: string, size = 9, color: RGB = C.ink2) {
    this.font(size, "normal", color);
    const lines: string[] = this.doc.splitTextToSize(s(t), CONTENT_W);
    for (const l of lines) {
      this.ensure(14);
      this.text(l, M, this.y);
      this.y += size + 4;
    }
    this.y += 4;
  }

  /** Two-column label/value grid. */
  keyValues(pairs: [string, string][], cols = 2) {
    const colW = CONTENT_W / cols;
    const rows = Math.ceil(pairs.length / cols);
    for (let r = 0; r < rows; r++) {
      this.ensure(30);
      for (let c = 0; c < cols; c++) {
        const p = pairs[r * cols + c];
        if (!p) continue;
        const x = M + c * colW;
        this.font(7.5, "normal", C.ink3);
        this.text(p[0], x, this.y);
        this.font(9.5, "normal", C.ink);
        const v: string[] = this.doc.splitTextToSize(s(p[1]), colW - 12);
        this.text(v[0] ?? "", x, this.y + 12);
      }
      this.y += 28;
    }
    this.y += 4;
  }

  /** Shaded summary box with label/amount rows and an emphasised total. */
  summary(rows: [string, string][], total?: [string, string]) {
    const h = 14 + rows.length * 15 + (total ? 24 : 0);
    this.ensure(h + 10);
    this.doc.setFillColor(...C.subtle);
    this.doc.setDrawColor(...C.line);
    this.doc.roundedRect(M, this.y, CONTENT_W, h, 4, 4, "FD");
    let y = this.y + 17;
    for (const [k, v] of rows) {
      this.font(9, "normal", C.ink2);
      this.text(k, M + 12, y);
      this.font(9, "normal", C.ink);
      this.text(v, PAGE_W - M - 12, y, { align: "right" });
      y += 15;
    }
    if (total) {
      this.doc.setDrawColor(...C.line);
      this.doc.line(M + 12, y - 6, PAGE_W - M - 12, y - 6);
      this.font(10.5, "bold");
      this.text(total[0], M + 12, y + 9);
      this.text(total[1], PAGE_W - M - 12, y + 9, { align: "right" });
    }
    this.y += h + 18;
  }

  table(columns: Column[], rows: string[][], opts: { empty?: string; zebra?: boolean } = {}) {
    const total = columns.reduce((a, c) => a + c.width, 0);
    const widths = columns.map((c) => (c.width / total) * CONTENT_W);
    const drawHead = () => {
      this.doc.setFillColor(...C.subtle);
      this.doc.rect(M, this.y, CONTENT_W, 18, "F");
      this.font(7.5, "bold", C.ink2);
      let x = M;
      columns.forEach((c, i) => {
        const w = widths[i]!;
        this.text(c.label, c.align === "right" ? x + w - 6 : x + 6, this.y + 12, { align: c.align === "right" ? "right" : "left" });
        x += w;
      });
      this.y += 18;
    };
    this.ensure(40);
    drawHead();
    if (rows.length === 0) {
      this.font(9, "normal", C.ink3);
      this.text(opts.empty ?? "Nothing to show.", M + 6, this.y + 16);
      this.y += 28;
      return;
    }
    rows.forEach((row, ri) => {
      this.font(8.5, "normal", C.ink);
      const cells = row.map((cell, i) => this.doc.splitTextToSize(s(cell), widths[i]! - 12) as string[]);
      const lines = Math.max(...cells.map((c) => c.length));
      const h = 8 + lines * 10.5;
      if (this.y + h > BOTTOM) {
        this.doc.addPage();
        this.y = M + 8;
        drawHead();
      }
      if (opts.zebra !== false && ri % 2 === 1) {
        this.doc.setFillColor(252, 251, 250);
        this.doc.rect(M, this.y, CONTENT_W, h, "F");
      }
      let x = M;
      cells.forEach((cl, i) => {
        const w = widths[i]!;
        const right = columns[i]!.align === "right";
        cl.forEach((line, li) => {
          this.font(8.5, li === 0 && i === 1 ? "bold" : "normal", li === 0 ? C.ink : C.ink3);
          this.text(line, right ? x + w - 6 : x + 6, this.y + 13 + li * 10.5, { align: right ? "right" : "left" });
        });
        x += w;
      });
      this.y += h;
      this.doc.setDrawColor(...C.line);
      this.doc.setLineWidth(0.4);
      this.doc.line(M, this.y, PAGE_W - M, this.y);
    });
    this.y += 16;
  }

  signature(lines: string[]) {
    this.ensure(70);
    this.doc.setDrawColor(...C.line);
    this.doc.setFillColor(255, 255, 255);
    this.doc.roundedRect(M, this.y, CONTENT_W, 18 + lines.length * 12, 4, 4, "D");
    this.font(8, "bold", C.success);
    this.text("Signed electronically", M + 12, this.y + 15);
    this.font(8.5, "normal", C.ink2);
    lines.forEach((l, i) => this.text(l, M + 12, this.y + 28 + i * 12));
    this.y += 30 + lines.length * 12;
  }

  /** Watermark + footer on every page, then hand back the bytes. */
  finish(filename: string) {
    const pages = this.doc.getNumberOfPages();
    for (let p = 1; p <= pages; p++) {
      this.doc.setPage(p);
      this.doc.saveGraphicsState();
      if (this.gstate) this.doc.setGState(new this.gstate({ opacity: 0.07 }));
      this.font(96, "bold", C.ink);
      this.doc.text("SPECIMEN", PAGE_W / 2 - 230, PAGE_H / 2 + 150, { angle: 40 });
      this.doc.restoreGraphicsState();
      this.doc.setDrawColor(...C.line);
      this.doc.setLineWidth(0.6);
      this.doc.line(M, PAGE_H - 44, PAGE_W - M, PAGE_H - 44);
      this.font(7, "normal", C.ink3);
      this.text("Concept by SWED SQUAD · TMJ0140/TMJ0130 · not affiliated with Swedbank · fictional data", M, PAGE_H - 32);
      this.text(`${filename} · page ${p} of ${pages}`, PAGE_W - M, PAGE_H - 32, { align: "right" });
    }
    this.doc.save(filename);
  }
}

async function writer() {
  const { jsPDF, GState } = await import("jspdf");
  const doc = new jsPDF({ unit: "pt", format: "a4" });
  doc.setProperties({ title: "Specimen — SWED SQUAD concept", author: "SWED SQUAD (student concept)", creator: "SWED SQUAD concept" });
  return new Writer(doc, GState as unknown as new (o: { opacity: number }) => unknown);
}

const generated = () => `Generated ${fmtDateTime(NOW.toISOString())} (Tallinn time)`;

// ───────────────────────── Documents ─────────────────────────

export type StatementRow = {
  date: string;
  description: string;
  detail: string;
  type: string;
  amount: number;
  balance: number | null;
};

export async function statementPdf(o: {
  filename: string;
  holder: string;
  holderId: string;
  accountName: string;
  iban: string;
  periodLabel: string;
  range: string;
  opening: number;
  closing: number;
  moneyIn: number;
  moneyOut: number;
  fees: number;
  rows: StatementRow[];
  pending: StatementRow[];
}) {
  const w = await writer();
  w.header("Account statement", [o.periodLabel, o.range, generated()]);
  w.keyValues([
    ["Account holder", o.holder],
    ["Personal / registry code", o.holderId],
    ["Account", o.accountName],
    ["IBAN", fmtIban(o.iban)],
    ["Currency", "EUR"],
    ["Period", o.range],
  ]);
  w.summary(
    [
      ["Opening balance", money(o.opening)],
      ["Money in", money(o.moneyIn, { sign: true })],
      ["Money out (excl. fees)", money(o.moneyOut, { sign: true })],
      ["Bank fees", money(-o.fees, { sign: true })],
    ],
    ["Closing balance", money(o.closing)],
  );
  w.heading("Booked transactions");
  w.table(
    [
      { label: "Date", width: 12 },
      { label: "Counterparty / description", width: 46 },
      { label: "Type", width: 16 },
      { label: "Amount, EUR", width: 13, align: "right" },
      { label: "Balance, EUR", width: 13, align: "right" },
    ],
    o.rows.map((r) => [
      r.date,
      `${r.description}${r.detail ? `\n${r.detail}` : ""}`,
      r.type,
      money(r.amount, { sign: true }),
      r.balance === null ? "" : money(r.balance),
    ]),
    { empty: "No booked transactions in this period." },
  );
  if (o.pending.length) {
    w.heading("Pending card payments (reserved, not yet booked)");
    w.table(
      [
        { label: "Date", width: 12 },
        { label: "Merchant", width: 59 },
        { label: "Type", width: 16 },
        { label: "Amount, EUR", width: 13, align: "right" },
      ],
      o.pending.map((r) => [r.date, r.description, r.type, money(r.amount, { sign: true })]),
    );
  }
  w.paragraph(
    `Every fee charged in this period is listed above as a separate line (${money(o.fees)} in total). Pending card payments are reserved on your account and are booked when the shop settles them, usually within 1–3 days.`,
  );
  w.finish(o.filename);
}

export async function paymentConfirmationPdf(o: {
  filename: string;
  id: string;
  status: string;
  payer: { name: string; iban: string };
  beneficiary: { name: string; iban: string; bank?: string };
  amount: number;
  fee: number;
  scheme: string;
  reference?: string;
  createdAt: string;
  executedAt?: string;
  arrival?: string;
  chain?: { label: string; at: string }[];
  signedBy: string;
}) {
  const w = await writer();
  w.header("Payment confirmation", [o.id, `Status: ${o.status}`, generated()]);
  w.summary(
    [
      ["Amount", money(o.amount)],
      ["Fee", o.fee === 0 ? "€0.00 (no fee)" : money(o.fee)],
    ],
    ["Total charged", money(o.amount + o.fee)],
  );
  w.heading("Payer");
  w.keyValues([
    ["Name", o.payer.name],
    ["IBAN", fmtIban(o.payer.iban)],
  ]);
  w.heading("Beneficiary");
  w.keyValues([
    ["Name", o.beneficiary.name],
    o.beneficiary.iban.startsWith("Card ")
      ? ["Card", o.beneficiary.iban.slice(5)]
      : ["IBAN", o.beneficiary.iban.startsWith("Bulk") ? o.beneficiary.iban : fmtIban(o.beneficiary.iban)],
    ["Bank", o.beneficiary.bank ?? "Detected from IBAN"],
    ["Payment scheme", o.scheme],
  ]);
  w.heading("Details");
  w.keyValues([
    ["Description / reference", o.reference || "—"],
    ["Created", fmtDateTime(o.createdAt)],
    ["Executed", o.executedAt ? fmtDateTime(o.executedAt) : "Not yet executed"],
    ["Arrival", o.arrival ?? "—"],
  ]);
  if (o.chain?.length) {
    w.heading("Approval trail");
    w.table(
      [
        { label: "Step", width: 70 },
        { label: "Time", width: 30, align: "right" },
      ],
      o.chain.map((c) => [c.label, fmtDateTime(c.at)]),
    );
  }
  w.signature([`${o.signedBy} · Smart-ID qualified signature`, "Specimen signature — no legal effect"]);
  w.finish(o.filename);
}

export async function feeStatementPdf(o: {
  filename: string;
  id: string;
  company: string;
  registryCode: string;
  period: string;
  status: string;
  chargeDate: string;
  account: string;
  lines: { label: string; qty: string; unit: string; amount: number }[];
  total: number;
  note?: string;
}) {
  const w = await writer();
  w.header("Fee statement", [o.id, o.period, generated()]);
  w.keyValues([
    ["Customer", o.company],
    ["Registry code", o.registryCode],
    ["Charged from", o.account],
    ["Charge date", `${fmtDate(o.chargeDate, "long")} · ${o.status}`],
  ]);
  w.heading("What you paid for");
  w.table(
    [
      { label: "Service", width: 52 },
      { label: "Quantity", width: 14, align: "right" },
      { label: "Unit price", width: 17, align: "right" },
      { label: "Amount", width: 17, align: "right" },
    ],
    o.lines.map((l) => [l.label, l.qty, l.unit, money(l.amount)]),
  );
  w.summary([["Monthly account fee", "€0.00"]], ["Total", money(o.total)]);
  if (o.note) w.paragraph(o.note);
  w.finish(o.filename);
}

export async function agreementPdf(o: {
  filename: string;
  company: string;
  registryCode: string;
  version: number;
  signedAt: string;
  signedBy: string;
  users: { name: string; profile: string; signing: string; limit: string; auth: string }[];
  limits: [string, string][];
  rules: { name: string; range: string; approvers: string }[];
}) {
  const w = await writer();
  w.header("Digital Services Agreement", [`Version ${o.version}`, `Last signed ${fmtDate(o.signedAt, "long")}`, generated()]);
  w.keyValues([
    ["Customer", o.company],
    ["Registry code", o.registryCode],
    ["Last signed by", o.signedBy],
    ["Signature", "Smart-ID (qualified, specimen)"],
  ]);
  w.heading("Users and rights");
  w.table(
    [
      { label: "User", width: 22 },
      { label: "Rights profile", width: 22 },
      { label: "Signing", width: 22 },
      { label: "Approval limit", width: 16, align: "right" },
      { label: "Signs in with", width: 18 },
    ],
    o.users.map((u) => [u.name, u.profile, u.signing, u.limit, u.auth]),
  );
  w.heading("Company limits");
  w.keyValues(o.limits, 3);
  w.heading("Payment approval rules");
  w.table(
    [
      { label: "Rule", width: 30 },
      { label: "Amount", width: 30 },
      { label: "Approvers", width: 40 },
    ],
    o.rules.map((r) => [r.name, r.range, r.approvers]),
  );
  w.paragraph("Nobody can approve a payment they created. Every change to users, rights, limits and rules is signed by an authorised representative and recorded in the activity log.");
  w.signature([`${o.signedBy} · ${fmtDateTime(o.signedAt)}`, "Specimen signature — no legal effect"]);
  w.finish(o.filename);
}

export async function foundingDocumentsPdf(o: {
  filename: string;
  name: string;
  registryCode: string;
  appRef: string;
  address: string;
  activity: string;
  capital: number;
  founders: { name: string; idCode: string; share: number; board: boolean }[];
  representation: string;
  iban: string;
  vat: boolean;
}) {
  const w = await writer();
  w.header("Articles of association", [o.name, `Application ${o.appRef}`, generated()]);
  w.paragraph("Private limited company (osaühing) — standard articles from the e-Business Register template.", 9.5, C.ink);
  const sections: [string, string][] = [
    ["1. Business name and seat", `The business name of the company is ${o.name}. The seat of the company is Tallinn, Estonia.`],
    ["2. Share capital and shares", `The share capital of the company is ${money(o.capital)}. ${o.founders.map((f) => `${f.name} holds a share with a nominal value of ${money((o.capital * f.share) / 100)} (${f.share}%)`).join("; ")}.`],
    ["3. Management board", `The management board has ${o.founders.filter((f) => f.board).length} member(s): ${o.founders.filter((f) => f.board).map((f) => f.name).join(", ")}. ${o.representation}.`],
    ["4. Shareholders' resolutions", "Resolutions are adopted at a general meeting or in writing without convening a meeting, by a simple majority unless the law requires otherwise."],
    ["5. Financial year", "The financial year is the calendar year (1 January – 31 December)."],
    ["6. Principal activity", o.activity],
  ];
  for (const [h, t] of sections) {
    w.heading(h);
    w.paragraph(t);
  }
  w.signature(o.founders.map((f) => `${f.name} (${f.idCode}) · founder${f.board ? ", board member" : ""} · Smart-ID`));

  w.doc.addPage();
  w.y = M;
  w.header("Registry card", [o.name, `Registry code ${o.registryCode}`, generated()]);
  w.keyValues([
    ["Business name", o.name],
    ["Registry code", o.registryCode],
    ["Legal form", "Private limited company (OÜ)"],
    ["Status", "Entered into the register"],
    ["Registered", fmtDate(NOW.toISOString(), "long")],
    ["Address", o.address],
    ["Principal activity (EMTAK)", o.activity],
    ["Share capital", money(o.capital)],
    ["VAT", o.vat ? "Registration requested" : "Not registered"],
    ["Business account", fmtIban(o.iban)],
  ]);
  w.heading("Shareholders and beneficial owners");
  w.table(
    [
      { label: "Person", width: 40 },
      { label: "Personal code", width: 25 },
      { label: "Share", width: 15, align: "right" },
      { label: "Beneficial owner", width: 20 },
    ],
    o.founders.map((f) => [f.name, f.idCode, `${f.share}%`, f.share >= 25 ? "Yes" : "No"]),
  );
  w.finish(o.filename);
}

export async function accountAgreementPdf(o: { filename: string; company: string; registryCode: string; iban: string; signer: string }) {
  const w = await writer();
  w.header("Business account agreement", [o.company, `Registry code ${o.registryCode}`, generated()]);
  w.keyValues([
    ["Customer", o.company],
    ["Registry code", o.registryCode],
    ["Account", fmtIban(o.iban)],
    ["Monthly account fee", "€0.00"],
  ]);
  w.heading("What's included");
  w.table(
    [
      { label: "Service", width: 60 },
      { label: "Price", width: 40, align: "right" },
    ],
    [
      ["Euro payments (SEPA, instant, Swedbank)", "1,000 free per month, then €0.38"],
      ["Business debit card", "Free for 12 months, then €2.00/month"],
      ["Users, roles, approval rules and activity log", "Free"],
      ["International payment (SWIFT, SHA)", "€6.00 + intermediary fees"],
    ],
  );
  w.signature([`${o.signer} · Smart-ID · ${fmtDateTime(NOW.toISOString())}`, "Specimen signature — no legal effect"]);
  w.finish(o.filename);
}

/** A supplier's invoice attached to a payment request — deliberately not Swedbank-branded. */
export async function invoicePdf(o: {
  filename: string;
  supplier: string;
  supplierIban: string;
  customer: string;
  number: string;
  issued: string;
  due: string;
  description: string;
  amount: number;
}) {
  const w = await writer();
  const net = Math.round((o.amount / 1.24) * 100) / 100;
  w.header("Invoice", [`No. ${o.number}`, `Issued ${fmtDate(o.issued, "long")}`, `Due ${fmtDate(o.due, "long")}`], o.supplier);
  w.keyValues([
    ["From", o.supplier],
    ["Bill to", o.customer],
    ["Pay to IBAN", fmtIban(o.supplierIban)],
    ["Reference", o.number],
  ]);
  w.table(
    [
      { label: "Description", width: 70 },
      { label: "Amount", width: 30, align: "right" },
    ],
    [[o.description, money(net)]],
  );
  w.summary([
    ["Subtotal", money(net)],
    ["VAT 24%", money(o.amount - net)],
  ], ["Total due", money(o.amount)]);
  w.finish(o.filename);
}
