import { Children, cloneElement, isValidElement } from 'react';
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
  const errorId = htmlFor && error ? `${htmlFor}-error` : undefined;
  const describedBy = [guidanceId, hintId, errorId].filter(Boolean).join(' ');

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
      <FormHtml html={hint} className="form-hint" id={hintId} />
      {Children.map(children, (child) => {
        if (!isValidElement(child) || !describedBy) {
          return child;
        }

        return cloneElement(child, {
          'aria-describedby': [child.props['aria-describedby'], describedBy]
            .filter(Boolean)
            .join(' '),
        });
      })}
      {error && (
        <p id={errorId} className="text-sm text-red-600" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
