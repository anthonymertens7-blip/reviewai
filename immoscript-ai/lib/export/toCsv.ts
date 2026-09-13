function escapeCsvField(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/** CSV avec BOM UTF-8 (compatibilité Excel) et fin de ligne CRLF, prêt pour l'import en masse vers un portail ou un CRM. */
export function buildCsv(columns: string[], rows: Record<string, string>[]): string {
  const header = columns.map(escapeCsvField).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvField(row[c] ?? "")).join(","));
  return "﻿" + [header, ...lines].join("\r\n");
}
