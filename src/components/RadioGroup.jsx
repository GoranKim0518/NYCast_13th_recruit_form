import FormField from './FormField';
import { getFieldHint, getFieldHtml } from '../constants/formHints';

export default function RadioGroup({
  name,
  label,
  required,
  hint,
  html,
  options,
  value,
  error,
  onChange,
  locked = false,
  onLockedSelect,
}) {
  return (
    <FormField
      label={label}
      required={required}
      html={getFieldHtml(name, html)}
      hint={getFieldHint(name, hint)}
      error={error}
    >
      <div
        className="space-y-2"
        role="radiogroup"
        aria-required={required ? 'true' : 'false'}
        aria-disabled={locked ? 'true' : undefined}
      >
        {options.map((option) => (
          <label
            key={option}
            htmlFor={locked ? undefined : `${name}-${option}`}
            onPointerDown={() => {
              if (!locked) {
                return;
              }

              onLockedSelect?.(option);
            }}
            onClick={(event) => {
              if (!locked) {
                return;
              }

              event.preventDefault();
            }}
            className={`flex min-h-12 items-center gap-3 rounded-lg border px-4 py-3 transition-colors touch-manipulation has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50 ${
              locked
                ? 'cursor-not-allowed'
                : 'cursor-default [@media(hover:hover)_and_(pointer:fine)]:cursor-pointer'
            } ${
              error
                ? 'border-red-500'
                : locked
                  ? 'border-gray-200'
                  : 'border-gray-200 [@media(hover:hover)]:hover:border-violet-300'
            }`}
          >
            <input
              id={`${name}-${option}`}
              type="radio"
              name={name}
              value={option}
              checked={value === option}
              className="pointer-events-none h-5 w-5 shrink-0 accent-violet-600"
              tabIndex={locked ? -1 : 0}
              onChange={onChange}
            />
            <span className="text-base text-gray-900">{option}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
}
