function escapeCsvField(value: string): string {
  // Neutralise l'injection de formule CSV (OWASP) : un champ texte utilisateur (référence de lot,
  // adresse...) commençant par =, +, -, @ ou une tabulation est interprété comme une formule par
  // Excel/Sheets/LibreOffice à l'ouverture, pouvant exécuter du code arbitraire chez qui l'ouvre.
  const neutralized = /^[=+\-@\t]/.test(value) ? `'${value}` : value;
  if (/[",\n\r]/.test(neutralized)) {
    return `"${neutralized.replace(/"/g, '""')}"`;
  }
  return neutralized;
}

/** CSV avec BOM UTF-8 (compatibilité Excel) et fin de ligne CRLF, prêt pour l'import en masse vers un portail ou un CRM. */
export function buildCsv(columns: string[], rows: Record<string, string>[]): string {
  const header = columns.map(escapeCsvField).join(",");
  const lines = rows.map((row) => columns.map((c) => escapeCsvField(row[c] ?? "")).join(","));
  return "﻿" + [header, ...lines].join("\r\n");
}
