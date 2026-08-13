import { useCallback, useEffect, useRef } from 'react';
import {
  trackFieldCompleted,
  trackFieldError,
  trackFormAbandon,
  trackFormEngaged,
  trackFormView,
  trackSectionReached,
  trackSubmitAttempt,
  trackSubmitFailed,
} from '../lib/analytics';
import {
  classifySubmitError,
  countCompletedRequiredFields,
  getFieldSection,
  mapValidationErrorType,
} from '../utils/formAnalyticsConfig';

export function useFormAnalytics({
  trigger,
  getValues,
  getFieldState,
  position,
}) {
  const engagedRef = useRef(false);
  const completedFieldsRef = useRef(new Set());
  const reachedSectionsRef = useRef(new Set());
  const lastFieldRef = useRef('');
  const lastSectionRef = useRef('common');
  const sectionRefs = useRef({});

  const setSectionRef = useCallback((sectionName) => {
    return (node) => {
      sectionRefs.current[sectionName] = node;
    };
  }, []);

  useEffect(() => {
    trackFormView();
  }, []);

  useEffect(() => {
    const sections = Object.values(sectionRefs.current).filter(Boolean);
    if (sections.length === 0) {
      return undefined;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) {
            continue;
          }

          const sectionName = entry.target.getAttribute('data-section');
          if (!sectionName || reachedSectionsRef.current.has(sectionName)) {
            continue;
          }

          reachedSectionsRef.current.add(sectionName);
          trackSectionReached(sectionName);
        }
      },
      { threshold: 0.3 },
    );

    for (const section of sections) {
      observer.observe(section);
    }

    return () => observer.disconnect();
  }, [position]);

  const sendAbandon = useCallback(() => {
    const values = getValues();

    trackFormAbandon({
      lastSection: lastSectionRef.current,
      lastField: lastFieldRef.current || '(none)',
      fieldsCompletedCount: countCompletedRequiredFields(values),
      positionSelected: values.position,
    });
  }, [getValues]);

  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'hidden' && engagedRef.current) {
        sendAbandon();
      }
    };

    const handleBeforeUnload = () => {
      if (engagedRef.current) {
        sendAbandon();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [sendAbandon]);

  const onFieldBlur = useCallback(
    async (fieldName) => {
      const sectionName = getFieldSection(fieldName);
      lastFieldRef.current = fieldName;
      lastSectionRef.current = sectionName;

      const isValid = await trigger(fieldName);
      const fieldState = getFieldState(fieldName);

      if (isValid && !fieldState.invalid) {
        if (!completedFieldsRef.current.has(fieldName)) {
          completedFieldsRef.current.add(fieldName);
          trackFieldCompleted(fieldName, sectionName);
        }

        if (!engagedRef.current) {
          engagedRef.current = true;
          trackFormEngaged();
        }
        return;
      }

      if (fieldState.error) {
        trackFieldError(fieldName, mapValidationErrorType(fieldState.error));
      }
    },
    [trigger, getFieldState],
  );

  const onSubmitAttempt = useCallback(() => {
    trackSubmitAttempt(position);
  }, [position]);

  const onSubmitFailed = useCallback((error) => {
    trackSubmitFailed(classifySubmitError(error));
  }, []);

  return {
    setSectionRef,
    onFieldBlur,
    onSubmitAttempt,
    onSubmitFailed,
  };
}
