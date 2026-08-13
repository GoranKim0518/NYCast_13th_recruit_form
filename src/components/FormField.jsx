export default function FormField({
  label,
  required = false,
  hint,
  error,
  children,
  htmlFor,
}) {
  return (
    <div className="space-y-2">
      <label
        htmlFor={htmlFor}
        className="block text-base font-semibold text-gray-900"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      {hint && <p className="text-sm text-gray-500">{hint}</p>}
      {children}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
