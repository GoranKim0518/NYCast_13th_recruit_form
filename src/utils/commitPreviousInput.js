export function commitPreviousInput(event) {
  const next = event.currentTarget;
  const prev = document.activeElement;

  if (
    !(prev instanceof HTMLElement) ||
    prev === next ||
    (prev.tagName !== 'INPUT' && prev.tagName !== 'TEXTAREA')
  ) {
    return;
  }

  prev.blur();
}
