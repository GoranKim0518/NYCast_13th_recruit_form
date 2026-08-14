import { useEffect, useRef, useState } from 'react';
import {
  SAVE_DEBOUNCE_MS,
  clearFormCache,
  hasMeaningfulDraft,
  loadFormCache,
  saveFormCache,
} from '../lib/formCache';

export function useFormCache(watch) {
  const [isRestored, setIsRestored] = useState(false);
  const debounceRef = useRef(null);

  useEffect(() => {
    const cached = loadFormCache();
    if (cached && hasMeaningfulDraft(cached)) {
      setIsRestored(true);
    }

    const subscription = watch((data) => {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveFormCache(data);
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(debounceRef.current);
    };
  }, [watch]);

  return {
    isRestored,
    clearCacheOnSubmit: clearFormCache,
  };
}
