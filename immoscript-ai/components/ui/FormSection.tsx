import { CARD_ACCENT_STYLES, type CardAccent } from "./cardAccents";

export function FormSection({
  icon: Icon,
  title,
  required,
  accent = "brand",
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  required?: boolean;
  accent?: CardAccent;
  children: React.ReactNode;
}) {
  const styles = CARD_ACCENT_STYLES[accent];

  return (
    <div className={`rounded-3xl border p-6 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)] ${styles.card}`}>
      <div className="mb-5 flex items-center gap-2.5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${styles.badge}`}>
          <Icon className="h-4 w-4" />
        </span>
        <h2 className="font-semibold text-gray-900 dark:text-gray-100">
          {title}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </h2>
      </div>
      {children}
    </div>
  );
}
