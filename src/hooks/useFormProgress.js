import { useEffect, useState } from 'react';
import { getInitialFormValues } from '../lib/formCache';
import { getProgressDetail } from '../utils/formProgress';

export function useFormProgress(watch) {
  const [progress, setProgress] = useState(() =>
    getProgressDetail(getInitialFormValues()),
  );

  useEffect(() => {
    const subscription = watch((data) => {
      setProgress(getProgressDetail(data));
    });

    return () => subscription.unsubscribe();
  }, [watch]);

  return progress;
}
