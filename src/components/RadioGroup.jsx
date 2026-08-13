import FormField from './FormField';

export default function RadioGroup({
  name,
  label,
  required,
  hint,
  error,
  options,
  register,
  registerOptions,
  onChange,
}) {
  return (
    <FormField
      label={label}
      required={required}
      hint={hint}
      error={error}
      htmlFor={`${name}-${options[0]}`}
    >
      <fieldset className="space-y-2">
        <legend className="sr-only">{label}</legend>
        {options.map((option) => (
          <label
            key={option}
            htmlFor={`${name}-${option}`}
            className="flex min-h-11 cursor-pointer items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors hover:border-violet-300 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50"
          >
            <input
              id={`${name}-${option}`}
              type="radio"
              value={option}
              className="h-5 w-5 shrink-0 accent-violet-600"
              aria-required={required ? 'true' : 'false'}
              {...register(name, {
                ...registerOptions,
                onChange,
              })}
            />
            <span className="text-base text-gray-900">{option}</span>
          </label>
        ))}
      </fieldset>
    </FormField>
  );
}
