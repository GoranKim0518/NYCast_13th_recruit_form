import { defaultValues } from '../utils/formConfig';

export const FORM_CACHE_KEY = 'nycast_13th_application_draft_v1';
const CACHE_VERSION = 1;
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;
const SAVE_DEBOUNCE_MS = 600;

export { SAVE_DEBOUNCE_MS };

function isBrowser() {
  if (typeof window === 'undefined') {
    return false;
  }

  // 인앱 브라우저나 쿠키 차단 환경에서는 localStorage 접근 자체가 throw한다.
  try {
    return Boolean(window.localStorage);
  } catch {
    return false;
  }
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
    const merged = mergeCachedValues({
      ...(loadFormCache() || {}),
      ...data,
    });

    if (!hasMeaningfulDraft(merged)) {
      clearFormCache();
      return;
    }

    localStorage.setItem(
      FORM_CACHE_KEY,
      JSON.stringify({
        version: CACHE_VERSION,
        savedAt: Date.now(),
        data: merged,
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

export function readMountedFormData(form) {
  const data = {};

  if (!form) {
    return data;
  }

  const formData = new FormData(form);

  for (const key of Object.keys(defaultValues)) {
    if (!form.elements.namedItem(key)) {
      continue;
    }

    const value = formData.get(key);
    data[key] = typeof value === 'string' ? value : '';
  }

  return data;
}

export function saveMountedFormCache(form) {
  saveFormCache(readMountedFormData(form));
}
