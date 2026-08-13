import { useCallback, useEffect, useRef, useState } from 'react';
import {
  SAVE_DEBOUNCE_MS,
  clearFormCache,
  hasMeaningfulDraft,
  loadFormCache,
  saveFormCache,
} from '../lib/formCache';

export function useFormCache(watch) {
  const [isRestored, setIsRestored] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
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
        if (hasMeaningfulDraft(data)) {
          setLastSavedAt(new Date());
        } else {
          setLastSavedAt(null);
        }
      }, SAVE_DEBOUNCE_MS);
    });

    return () => {
      subscription.unsubscribe();
      clearTimeout(debounceRef.current);
    };
  }, [watch]);

  const dismissRestoredNotice = useCallback(() => {
    setIsRestored(false);
  }, []);

  const clearDraft = useCallback(() => {
    clearFormCache();
    setIsRestored(false);
    setLastSavedAt(null);
  }, []);

  return {
    isRestored,
    lastSavedAt,
    dismissRestoredNotice,
    clearDraft,
    clearCacheOnSubmit: clearFormCache,
  };
}
