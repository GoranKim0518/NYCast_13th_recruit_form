import FormHtml from './FormHtml';

export default function FormField({
  label,
  required = false,
  html,
  hint,
  error,
  children,
  htmlFor,
}) {
  const guidanceId = htmlFor && html ? `${htmlFor}-guidance` : undefined;
  const hintId = htmlFor && hint ? `${htmlFor}-hint` : undefined;
  const errorId = htmlFor ? `${htmlFor}-error` : undefined;

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
      <FormHtml html={html} id={guidanceId} />
      {children}
      <FormHtml html={hint} className="form-hint" id={hintId} />
      <p
        id={errorId}
        className="min-h-5 text-sm text-red-600"
        role={error ? 'alert' : undefined}
      >
        {error || '\u00a0'}
      </p>
    </div>
  );
}
