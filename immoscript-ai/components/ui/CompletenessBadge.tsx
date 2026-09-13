function colorForScore(score: number): string {
  if (score >= 80) return "text-teal-600 dark:text-teal-400 bg-teal-100 dark:bg-teal-950/40";
  if (score >= 50) return "text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-950/40";
  return "text-rose-600 dark:text-rose-400 bg-rose-100 dark:bg-rose-950/40";
}

export function CompletenessBadge({ score }: { score: number }) {
  return (
    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${colorForScore(score)}`}>
      {score}% complet
    </span>
  );
}

export function CompletenessDetails({ score, missing }: { score: number; missing: string[] }) {
  return (
    <div className="rounded-3xl border dark:border-gray-700 bg-white dark:bg-gray-800 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] p-4">
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-sm font-medium text-gray-700 dark:text-gray-300">Complétude du programme</h2>
        <CompletenessBadge score={score} />
      </div>
      <div className="mb-3 h-2 w-full overflow-hidden rounded-full bg-gray-100 dark:bg-gray-700">
        <div
          className={`h-full rounded-full ${score >= 80 ? "bg-teal-500" : score >= 50 ? "bg-amber-500" : "bg-rose-500"}`}
          style={{ width: `${score}%` }}
        />
      </div>
      {missing.length > 0 ? (
        <p className="text-xs text-gray-500 dark:text-gray-400">
          Pour une génération IA optimale, complétez : {missing.join(", ")}.
        </p>
      ) : (
        <p className="text-xs text-gray-500 dark:text-gray-400">Toutes les informations recommandées sont renseignées.</p>
      )}
    </div>
  );
}
