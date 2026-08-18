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
        className="block text-pretty text-base font-semibold leading-snug tracking-tight text-gray-900"
      >
        {label}
        {required && (
          <span className="ml-0.5 text-red-500" aria-hidden="true">
            *
          </span>
        )}
      </label>
      <FormHtml html={html} id={guidanceId} />
      <FormHtml html={hint} className="form-hint" id={hintId} />
      {children}
      {error ? (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      ) : (
        <p id={errorId} className="sr-only" />
      )}
    </div>
  );
}
