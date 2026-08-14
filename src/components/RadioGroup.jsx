import { Controller, useFormContext } from 'react-hook-form';
import FormField from './FormField';
import { getFieldHint, getFieldHtml } from '../constants/formHints';

export default function RadioGroup({
  name,
  label,
  required,
  hint,
  html,
  options,
  rules,
  onChange,
}) {
  const { control } = useFormContext();

  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState }) => (
        <FormField
          label={label}
          required={required}
          html={getFieldHtml(name, html)}
          hint={getFieldHint(name, hint)}
          error={fieldState.error?.message}
        >
          <div className="space-y-2" role="radiogroup" aria-required={required ? 'true' : 'false'}>
            {options.map((option, index) => (
              <label
                key={option}
                htmlFor={`${name}-${option}`}
                className="flex min-h-11 cursor-default items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors touch-manipulation [@media(hover:hover)_and_(pointer:fine)]:cursor-pointer [@media(hover:hover)]:hover:border-violet-300 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50"
              >
                <input
                  id={`${name}-${option}`}
                  type="radio"
                  name={field.name}
                  value={option}
                  checked={field.value === option}
                  className="h-5 w-5 shrink-0 touch-manipulation accent-violet-600"
                  ref={index === 0 ? field.ref : undefined}
                  onPointerDown={() => {
                    const prev = document.activeElement;
                    if (
                      prev instanceof HTMLElement &&
                      prev.tagName !== 'BODY' &&
                      (prev.tagName === 'INPUT' || prev.tagName === 'TEXTAREA') &&
                      prev.type !== 'radio'
                    ) {
                      prev.blur();
                    }
                  }}
                  onBlur={field.onBlur}
                  onChange={(event) => {
                    field.onChange(event.target.value);
                    onChange?.(event);
                  }}
                />
                <span className="text-base text-gray-900">{option}</span>
              </label>
            ))}
          </div>
        </FormField>
      )}
    />
  );
}
