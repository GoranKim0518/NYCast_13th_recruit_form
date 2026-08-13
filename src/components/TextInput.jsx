import FormField from './FormField';

const inputClassName =
  'w-full rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20';

function mergeBlurHandler(registerBlur, onAnalyticsBlur) {
  if (!onAnalyticsBlur) {
    return registerBlur;
  }

  return async (event) => {
    await registerBlur(event);
    onAnalyticsBlur();
  };
}

export default function TextInput({
  id,
  label,
  required,
  hint,
  error,
  type = 'text',
  placeholder,
  register,
  registerOptions,
  onAnalyticsBlur,
}) {
  const { onBlur, ...rest } = register(id, registerOptions);

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      htmlFor={id}
    >
      <input
        id={id}
        type={type}
        placeholder={placeholder}
        className={inputClassName}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required ? 'true' : 'false'}
        {...rest}
        onBlur={mergeBlurHandler(onBlur, onAnalyticsBlur)}
      />
    </FormField>
  );
}

export function TextAreaInput({
  id,
  label,
  required,
  hint,
  error,
  placeholder,
  rows = 5,
  register,
  registerOptions,
  onAnalyticsBlur,
}) {
  const { onBlur, ...rest } = register(id, registerOptions);

  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      htmlFor={id}
    >
      <textarea
        id={id}
        rows={rows}
        placeholder={placeholder}
        className={`${inputClassName} min-h-[140px] resize-y`}
        aria-invalid={error ? 'true' : 'false'}
        aria-required={required ? 'true' : 'false'}
        {...rest}
        onBlur={mergeBlurHandler(onBlur, onAnalyticsBlur)}
      />
    </FormField>
  );
}
