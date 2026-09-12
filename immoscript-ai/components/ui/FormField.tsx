export function FormField({
  label,
  required,
  type = "text",
  value,
  onChange,
  placeholder,
}: {
  label: string;
  required?: boolean;
  type?: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
}) {
  return (
    <div>
      <label className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      <input
        type={type}
        required={required}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        className="w-full rounded-xl border-gray-300 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-100 text-sm"
      />
    </div>
  );
}
