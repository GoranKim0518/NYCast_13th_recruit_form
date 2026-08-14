import { memo } from 'react';
import { useFormContext, useFormState } from 'react-hook-form';
import FormField from './FormField';
import { getFieldHint, getFieldHtml } from '../constants/formHints';
import { commitPreviousInput } from '../utils/commitPreviousInput';

const inputClassName =
  'relative z-10 w-full touch-manipulation rounded-lg border border-gray-200 bg-white px-4 py-3 text-base text-gray-900 placeholder:text-gray-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20';

function FieldControl({
  id,
  rules,
  label,
  required,
  hint,
  html,
  placeholder,
  maxLength,
  onFieldBlur,
  multiline = false,
  rows = 5,
}) {
  const { register, control } = useFormContext();
  const { errors } = useFormState({ control, name: id, exact: true });
  const { ref, onChange, onBlur, name } = register(id, rules);
  const describedBy = [
    html ? `${id}-guidance` : null,
    hint || getFieldHint(id) ? `${id}-hint` : null,
    `${id}-error`,
  ]
    .filter(Boolean)
    .join(' ');

  const sharedProps = {
    id,
    name,
    ref,
    placeholder,
    maxLength,
    autoComplete: 'off',
    className: multiline
      ? `${inputClassName} min-h-[140px] resize-y`
      : inputClassName,
    'aria-invalid': errors[id] ? 'true' : 'false',
    'aria-required': required ? 'true' : 'false',
    'aria-describedby': describedBy,
    onPointerDown: commitPreviousInput,
    onChange,
    onBlur: (event) => {
      onBlur(event);
      onFieldBlur?.(id);
    },
  };

  return (
    <FormField
      label={label}
      required={required}
      html={getFieldHtml(id, html)}
      hint={getFieldHint(id, hint)}
      error={errors[id]?.message}
      htmlFor={id}
    >
      {multiline ? (
        <textarea rows={rows} {...sharedProps} />
      ) : (
        <input type="text" {...sharedProps} />
      )}
    </FormField>
  );
}

const TextInput = memo(FieldControl);

export default TextInput;

export const TextAreaInput = memo(function TextAreaInput(props) {
  return <FieldControl {...props} multiline />;
});
