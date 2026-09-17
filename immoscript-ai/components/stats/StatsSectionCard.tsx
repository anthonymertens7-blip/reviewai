export function StatsSectionCard({ title, subtitle, children }: { title: string; subtitle?: string; children: React.ReactNode }) {
  return (
    <div className="rounded-3xl border bg-white p-5 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
      <h2 className="text-base font-medium">{title}</h2>
      {subtitle && <p className="mb-4 mt-0.5 text-xs text-gray-500 dark:text-gray-400">{subtitle}</p>}
      <div className={subtitle ? "" : "mt-4"}>{children}</div>
    </div>
  );
}
