import { defaultValues } from '../utils/formConfig';

export const FORM_CACHE_KEY = 'nycast_13th_application_draft_v1';
const CACHE_VERSION = 1;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SAVE_DEBOUNCE_MS = 600;

export { SAVE_DEBOUNCE_MS };

function isBrowser() {
  return typeof window !== 'undefined' && typeof localStorage !== 'undefined';
}

export function hasMeaningfulDraft(data) {
  return Object.values(data).some(
    (value) => typeof value === 'string' && value.trim().length > 0,
  );
}

export function mergeCachedValues(cached) {
  if (!cached || typeof cached !== 'object') {
    return { ...defaultValues };
  }

  const merged = { ...defaultValues };

  for (const key of Object.keys(defaultValues)) {
    if (typeof cached[key] === 'string') {
      merged[key] = cached[key];
    }
  }

  return merged;
}

export function loadFormCache() {
  if (!isBrowser()) {
    return null;
  }

  try {
    const raw = localStorage.getItem(FORM_CACHE_KEY);
    if (!raw) {
      return null;
    }

    const parsed = JSON.parse(raw);

    if (
      !parsed ||
      parsed.version !== CACHE_VERSION ||
      typeof parsed.data !== 'object'
    ) {
      clearFormCache();
      return null;
    }

    if (Date.now() - parsed.savedAt > CACHE_TTL_MS) {
      clearFormCache();
      return null;
    }

    return mergeCachedValues(parsed.data);
  } catch {
    clearFormCache();
    return null;
  }
}

export function saveFormCache(data) {
  if (!isBrowser()) {
    return;
  }

  try {
    if (!hasMeaningfulDraft(data)) {
      clearFormCache();
      return;
    }

    localStorage.setItem(
      FORM_CACHE_KEY,
      JSON.stringify({
        version: CACHE_VERSION,
        savedAt: Date.now(),
        data: mergeCachedValues(data),
      }),
    );
  } catch {
    // quota exceeded or private browsing — silently ignore
  }
}

export function clearFormCache() {
  if (!isBrowser()) {
    return;
  }

  try {
    localStorage.removeItem(FORM_CACHE_KEY);
  } catch {
    // ignore
  }
}

export function getInitialFormValues() {
  return loadFormCache() ?? { ...defaultValues };
}
