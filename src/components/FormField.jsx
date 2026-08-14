function HtmlContent({ html }) {
  if (!html) {
    return null;
  }

  return (
    <div
      className="form-html"
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}

function FieldHint({ hint }) {
  if (!hint) {
    return null;
  }

  return (
    <div
      className="form-hint"
      dangerouslySetInnerHTML={{ __html: hint }}
    />
  );
}

export default function FormField({
  label,
  required = false,
  html,
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
      <HtmlContent html={html} />
      <FieldHint hint={hint} />
      {children}
      {error && (
        <p className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
