import FormField from './FormField';
import { getFieldHint, getFieldHtml } from '../constants/formHints';

const inputClassName =
  'w-full min-h-12 touch-manipulation rounded-lg border border-gray-200 bg-white px-4 py-3 text-base leading-normal text-gray-900 placeholder:text-gray-400 transition-colors focus:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/20';

function FieldControl({
  id,
  label,
  required,
  hint,
  html,
  placeholder,
  maxLength,
  defaultValue = '',
  error,
  multiline = false,
  rows = 5,
}) {
  const describedBy = [
    html ? `${id}-guidance` : null,
    hint || getFieldHint(id) ? `${id}-hint` : null,
    `${id}-error`,
  ]
    .filter(Boolean)
    .join(' ');

  const sharedProps = {
    id,
    name: id,
    defaultValue,
    placeholder,
    maxLength,
    autoComplete: 'off',
    className: multiline
      ? `${inputClassName} min-h-32 resize-y`
      : inputClassName,
    'aria-invalid': error ? 'true' : 'false',
    'aria-required': required ? 'true' : 'false',
    'aria-describedby': describedBy,
  };

  return (
    <FormField
      label={label}
      required={required}
      html={getFieldHtml(id, html)}
      hint={getFieldHint(id, hint)}
      error={error}
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

export default function TextInput(props) {
  return <FieldControl {...props} />;
}

export function TextAreaInput(props) {
  return <FieldControl {...props} multiline />;
}
