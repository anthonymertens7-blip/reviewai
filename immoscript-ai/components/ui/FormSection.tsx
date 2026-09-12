import { CARD_ACCENT_CLASSES, type CardAccent } from "./cardAccents";

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
  return (
    <div className="rounded-3xl border border-gray-100 bg-white p-6 shadow-[0_10px_28px_-10px_rgba(15,23,42,0.16)] dark:border-gray-700 dark:bg-gray-800 dark:shadow-[0_10px_28px_-10px_rgba(0,0,0,0.6)]">
      <div className="mb-5 flex items-center gap-2.5">
        <span className={`flex h-10 w-10 items-center justify-center rounded-2xl ${CARD_ACCENT_CLASSES[accent]}`}>
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
