"use client";

import { useState } from "react";
import { FileSpreadsheet } from "lucide-react";

export function ExportCsvButton({ programId }: { programId: string }) {
  const [isExporting, setIsExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleExport() {
    setIsExporting(true);
    setError(null);
    const res = await fetch(`/api/programs/${programId}/export-csv`);
    setIsExporting(false);

    if (!res.ok) {
      setError("L'export a échoué.");
      return;
    }

    const blob = await res.blob();
    const match = res.headers.get("Content-Disposition")?.match(/filename="([^"]+)"/);
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = match?.[1] ?? "lots.csv";
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div>
      <button
        onClick={handleExport}
        disabled={isExporting}
        className="flex items-center gap-1.5 rounded-md border dark:border-gray-700 px-4 py-2 text-sm hover:bg-gray-50 disabled:opacity-50 dark:hover:bg-gray-700"
      >
        <FileSpreadsheet className="h-4 w-4" />
        {isExporting ? "Export..." : "Exporter en CSV"}
      </button>
      {error && <p className="mt-1.5 text-sm text-red-600">{error}</p>}
    </div>
  );
}
