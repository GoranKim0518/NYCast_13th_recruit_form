export default function FormHtml({ html, className = 'form-html', id }) {
  if (!html) {
    return null;
  }

  return (
    <div
      id={id}
      className={className}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
