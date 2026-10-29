"use client";

import { categoryMeta } from "@/lib/data/merchants";
import { fmtDate, NOW } from "@/lib/format";
import type { Account, Txn } from "@/lib/types";
import { downloadCsv, downloadText } from "./download";
import { statementPdf, type StatementRow } from "./pdf";

export type StatementPeriod = "month" | "last" | "quarter" | "year";
export type StatementFormat = "pdf" | "csv" | "camt" | "merit";

export const PERIODS: Record<StatementPeriod, { label: string; from: string; to: string }> = {
  month: { label: "October 2026", from: "2026-10-01", to: "2026-10-31" },
  last: { label: "September 2026", from: "2026-09-01", to: "2026-09-30" },
  quarter: { label: "Q3 2026", from: "2026-07-01", to: "2026-09-30" },
  year: { label: "2026 to date", from: "2026-01-01", to: "2026-10-29" },
};

const dayKey = (iso: string) => new Intl.DateTimeFormat("en-CA", { timeZone: "Europe/Tallinn" }).format(new Date(iso));

const TYPE: Record<Txn["method"], string> = {
  card: "Card payment",
  instant: "Instant transfer",
  sepa: "SEPA transfer",
  einvoice: "E-invoice",
  standing: "Standing order",
  fee: "Bank fee",
  interest: "Interest",
  atm: "Cash withdrawal",
  internal: "Own accounts",
  tocard: "Transfer to card",
};

type Line = Txn & { label: string; refund?: boolean };

/** Booked lines in chronological order. A refund is its own line (`refundOf`). */
function bookedLines(txns: Txn[]): Line[] {
  return txns
    .filter((t) => t.status !== "declined" && t.status !== "pending")
    .map((t) => ({ ...t, label: t.refundOf ? "Refund" : TYPE[t.method], refund: !!t.refundOf }))
    .sort((a, b) => a.at.localeCompare(b.at));
}

export function buildStatement(account: Account, txns: Txn[], period: StatementPeriod) {
  const { from, to, label } = PERIODS[period];
  const mine = txns.filter((t) => t.accountId === account.id);
  const lines = bookedLines(mine);
  const inRange = lines.filter((l) => dayKey(l.at) >= from && dayKey(l.at) <= to);
  const after = lines.filter((l) => dayKey(l.at) > to).reduce((s, l) => s + l.amount, 0);
  const closing = round(account.balance - after);
  const opening = round(closing - inRange.reduce((s, l) => s + l.amount, 0));
  let running = opening;
  const rows = inRange.map((l) => {
    running = round(running + l.amount);
    return { line: l, balance: running };
  });
  const pending = mine.filter((t) => t.status === "pending" && dayKey(t.at) >= from && dayKey(t.at) <= to);
  const fees = -inRange.filter((l) => l.method === "fee").reduce((s, l) => s + l.amount, 0);
  const moneyIn = inRange.filter((l) => l.amount > 0).reduce((s, l) => s + l.amount, 0);
  const moneyOut = inRange.filter((l) => l.amount < 0 && l.method !== "fee").reduce((s, l) => s + l.amount, 0);
  const range = `${fmtDate(`${from}T12:00:00+02:00`, "long")} – ${fmtDate(`${to}T12:00:00+02:00`, "long")}`;
  return { label, from, to, range, opening, closing, rows, pending, fees: round(fees), moneyIn: round(moneyIn), moneyOut: round(moneyOut) };
}

function round(n: number) {
  return Math.round(n * 100) / 100;
}

export function statementFilename(account: Account, period: StatementPeriod, format: StatementFormat) {
  const ext = format === "pdf" ? "pdf" : format === "csv" ? "csv" : "xml";
  const slug = account.name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
  return `statement-${slug}-${PERIODS[period].label.toLowerCase().replaceAll(" ", "-")}${format === "camt" ? "-camt053" : ""}.${ext}`;
}

/** Generates and downloads the statement. Resolves to the file name. */
export async function exportStatement(o: {
  account: Account;
  txns: Txn[];
  period: StatementPeriod;
  format: Exclude<StatementFormat, "merit">;
  holder: { name: string; id: string };
}) {
  const st = buildStatement(o.account, o.txns, o.period);
  const filename = statementFilename(o.account, o.period, o.format);

  if (o.format === "pdf") {
    const toRow = (t: Txn | Line, balance: number | null): StatementRow => ({
      date: fmtDate(t.at, "long"),
      description: t.counterparty,
      detail: [
        t.toCard ? `To ${t.toCard.network} ••${t.toCard.last4} · ${t.toCard.bank}` : null,
        t.fx ? `Recipient got ${t.fx.received.toFixed(2)} ${t.fx.currency} at ${t.fx.rate}` : null,
        t.reference,
        "label" in t && t.refund ? null : t.location,
      ]
        .filter(Boolean)
        .join(" · "),
      type: "label" in t ? t.label : TYPE[t.method],
      amount: t.amount,
      balance,
    });
    await statementPdf({
      filename,
      holder: o.holder.name,
      holderId: o.holder.id,
      accountName: o.account.name,
      iban: o.account.iban,
      periodLabel: st.label,
      range: st.range,
      opening: st.opening,
      closing: st.closing,
      moneyIn: st.moneyIn,
      moneyOut: st.moneyOut,
      fees: st.fees,
      rows: st.rows.map((r) => toRow(r.line, r.balance)),
      pending: st.pending.map((t) => toRow(t, null)),
    });
    return filename;
  }

  if (o.format === "csv") {
    downloadCsv(filename, [
      ["# SPECIMEN — student concept by SWED SQUAD (TMJ0140/TMJ0130). Not a Swedbank document. Fictional data."],
      ["Booking date", "Status", "Counterparty", "Description", "Type", "Category", "Amount (EUR)", "Fee (EUR)", "Balance after (EUR)", "Counterparty IBAN", "Transaction ID"],
      ...st.rows.map(({ line, balance }) => [
        dayKey(line.at),
        line.refund ? "Refund" : "Booked",
        line.counterparty,
        line.reference ?? "",
        line.label,
        categoryMeta[line.category].label,
        line.amount.toFixed(2),
        (line.fee ?? 0).toFixed(2),
        balance.toFixed(2),
        line.iban ?? "",
        line.id.toUpperCase(),
      ]),
      ...st.pending.map((t) => [
        dayKey(t.at),
        "Pending",
        t.counterparty,
        t.reference ?? "",
        TYPE[t.method],
        categoryMeta[t.category].label,
        t.amount.toFixed(2),
        "0.00",
        "",
        t.iban ?? "",
        t.id.toUpperCase(),
      ]),
    ]);
    return filename;
  }

  downloadText(filename, camt053(o.account, o.holder.name, st), "application/xml");
  return filename;
}

const xml = (v: string) => v.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");

function camt053(account: Account, holder: string, st: ReturnType<typeof buildStatement>) {
  const created = NOW.toISOString();
  const bal = (code: string, amount: number, date: string) => `
      <Bal>
        <Tp><CdOrPrtry><Cd>${code}</Cd></CdOrPrtry></Tp>
        <Amt Ccy="EUR">${Math.abs(amount).toFixed(2)}</Amt>
        <CdtDbtInd>${amount >= 0 ? "CRDT" : "DBIT"}</CdtDbtInd>
        <Dt><Dt>${date}</Dt></Dt>
      </Bal>`;
  const entries = st.rows
    .map(({ line }) => {
      const credit = line.amount > 0;
      const party = credit ? "Dbtr" : "Cdtr";
      return `
      <Ntry>
        <NtryRef>${xml(line.id.toUpperCase())}</NtryRef>
        <Amt Ccy="EUR">${Math.abs(line.amount).toFixed(2)}</Amt>
        <CdtDbtInd>${credit ? "CRDT" : "DBIT"}</CdtDbtInd>
        <Sts><Cd>BOOK</Cd></Sts>
        <BookgDt><Dt>${dayKey(line.at)}</Dt></BookgDt>
        <ValDt><Dt>${dayKey(line.at)}</Dt></ValDt>
        <BkTxCd><Prtry><Cd>${xml(line.label)}</Cd></Prtry></BkTxCd>
        <NtryDtls>
          <TxDtls>
            <Refs><EndToEndId>${xml(line.id.toUpperCase())}</EndToEndId></Refs>
            <RltdPties>
              <${party}><Pty><Nm>${xml(line.counterparty)}</Nm></Pty></${party}>${
                line.iban ? `\n              <${party}Acct><Id><IBAN>${line.iban}</IBAN></Id></${party}Acct>` : ""
              }
            </RltdPties>
            <RmtInf><Ustrd>${xml(line.reference ?? line.label)}</Ustrd></RmtInf>
          </TxDtls>
        </NtryDtls>
      </Ntry>`;
    })
    .join("");
  return `<?xml version="1.0" encoding="UTF-8"?>
<!-- SPECIMEN: student concept by SWED SQUAD (TMJ0140/TMJ0130). Not a Swedbank document. All data is fictional. -->
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:camt.053.001.08">
  <BkToCstmrStmt>
    <GrpHdr>
      <MsgId>SPECIMEN-${account.iban.slice(-6)}-${st.from.replaceAll("-", "")}</MsgId>
      <CreDtTm>${created}</CreDtTm>
    </GrpHdr>
    <Stmt>
      <Id>STMT-${st.from.replaceAll("-", "")}-${st.to.replaceAll("-", "")}</Id>
      <CreDtTm>${created}</CreDtTm>
      <FrToDt><FrDtTm>${st.from}T00:00:00+02:00</FrDtTm><ToDtTm>${st.to}T23:59:59+02:00</ToDtTm></FrToDt>
      <Acct>
        <Id><IBAN>${account.iban}</IBAN></Id>
        <Ccy>EUR</Ccy>
        <Nm>${xml(account.name)}</Nm>
        <Ownr><Nm>${xml(holder)}</Nm></Ownr>
      </Acct>${bal("OPBD", st.opening, st.from)}${bal("CLBD", st.closing, st.to)}
      <TxsSummry>
        <TtlNtries><NbOfNtries>${st.rows.length}</NbOfNtries></TtlNtries>
      </TxsSummry>${entries}
    </Stmt>
  </BkToCstmrStmt>
</Document>
`;
}
