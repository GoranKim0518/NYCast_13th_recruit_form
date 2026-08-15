export function prefersReducedMotion() {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function scrollElementIntoView(
  element,
  { block = 'start', behavior: behaviorOverride } = {},
) {
  if (!element) {
    return;
  }

  const behavior =
    behaviorOverride ?? (prefersReducedMotion() ? 'auto' : 'smooth');

  if (block === 'center') {
    element.scrollIntoView({ behavior, block });
    return;
  }

  const offset = 24;
  const top =
    element.getBoundingClientRect().top + window.scrollY - offset;

  window.scrollTo({
    top: Math.max(0, top),
    behavior,
  });
}
