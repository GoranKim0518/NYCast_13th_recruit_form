import { useEffect, useRef, useState } from 'react';
import {
  SAVE_DEBOUNCE_MS,
  clearFormCache,
  hasMeaningfulDraft,
  loadFormCache,
  saveMountedFormCache,
} from '../lib/formCache';

export function useFormCache(formRef) {
  const [isRestored, setIsRestored] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const cached = loadFormCache();
    if (cached && hasMeaningfulDraft(cached)) {
      setIsRestored(true);
    }
  }, []);

  useEffect(() => {
    const form = formRef.current;
    if (!form) {
      return undefined;
    }

    const persist = (event) => {
      if (event?.isComposing || event?.target?.composing) {
        return;
      }

      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveMountedFormCache(form);
      }, SAVE_DEBOUNCE_MS);
    };

    form.addEventListener('input', persist, true);
    form.addEventListener('change', persist, true);

    return () => {
      form.removeEventListener('input', persist, true);
      form.removeEventListener('change', persist, true);
      clearTimeout(debounceRef.current);
    };
  }, [formRef]);

  return {
    isRestored,
    clearCacheOnSubmit: clearFormCache,
  };
}
