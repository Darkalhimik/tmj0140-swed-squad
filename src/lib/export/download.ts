/** Browser-side file downloads for statements, confirmations and exports. */

export function downloadBlob(filename: string, blob: Blob) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 2000);
}

export function downloadText(filename: string, text: string, mime: string) {
  downloadBlob(filename, new Blob([text], { type: `${mime};charset=utf-8` }));
}

type Cell = string | number | null | undefined;

function csvCell(v: Cell) {
  if (v === null || v === undefined) return "";
  const s = String(v);
  return /[",\r\n]/.test(s) ? `"${s.replaceAll('"', '""')}"` : s;
}

/** RFC 4180 CSV with a BOM so Excel opens UTF-8 (õ, ä, ü, €) correctly. */
export function toCsv(rows: Cell[][]) {
  return "﻿" + rows.map((r) => r.map(csvCell).join(",")).join("\r\n");
}

export function downloadCsv(filename: string, rows: Cell[][]) {
  downloadText(filename, toCsv(rows), "text/csv");
}
