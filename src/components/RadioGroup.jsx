import { useFormContext, useFormState } from 'react-hook-form';
import FormField from './FormField';
import { getFieldHint, getFieldHtml } from '../constants/formHints';
import { commitPreviousInput } from '../utils/commitPreviousInput';

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
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control, name, exact: true });
  const { ref, onChange: onFieldChange, onBlur, name: fieldName } = register(
    name,
    rules,
  );

  return (
    <FormField
      label={label}
      required={required}
      html={getFieldHtml(name, html)}
      hint={getFieldHint(name, hint)}
      error={errors[name]?.message}
    >
      <div className="space-y-2" role="radiogroup" aria-required={required ? 'true' : 'false'}>
        {options.map((option, index) => (
          <label
            key={option}
            htmlFor={`${name}-${option}`}
            onPointerDown={commitPreviousInput}
            className="flex min-h-11 cursor-default items-center gap-3 rounded-lg border border-gray-200 px-4 py-3 transition-colors touch-manipulation [@media(hover:hover)_and_(pointer:fine)]:cursor-pointer [@media(hover:hover)]:hover:border-violet-300 has-[:checked]:border-violet-500 has-[:checked]:bg-violet-50"
          >
            <input
              id={`${name}-${option}`}
              type="radio"
              name={fieldName}
              value={option}
              className="h-5 w-5 shrink-0 touch-manipulation accent-violet-600"
              ref={index === 0 ? ref : undefined}
              onPointerDown={commitPreviousInput}
              onBlur={onBlur}
              onChange={(event) => {
                onFieldChange(event);
                onChange?.(event);
              }}
            />
            <span className="text-base text-gray-900">{option}</span>
          </label>
        ))}
      </div>
    </FormField>
  );
}
