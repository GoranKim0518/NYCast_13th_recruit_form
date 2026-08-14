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
} from '../utils/formAnalyticsConfig';

export function useFormAnalytics({
  getValues,
  position,
}) {
  const engagedRef = useRef(false);
  const submittedRef = useRef(false);
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
    if (!engagedRef.current || submittedRef.current) {
      return;
    }

    const values = getValues();

    trackFormAbandon({
      lastSection: lastSectionRef.current,
      lastField: lastFieldRef.current || '(none)',
      fieldsCompletedCount: countCompletedRequiredFields(values),
      positionSelected: values.position,
    });
  }, [getValues]);

  useEffect(() => {
    const handlePageHide = (event) => {
      if (event.persisted) {
        return;
      }

      sendAbandon();
    };

    window.addEventListener('pagehide', handlePageHide);

    return () => {
      window.removeEventListener('pagehide', handlePageHide);
    };
  }, [sendAbandon]);

  const onFieldBlur = useCallback(
    (fieldName) => {
      const sectionName = getFieldSection(fieldName);
      lastFieldRef.current = fieldName;
      lastSectionRef.current = sectionName;

      const value = getValues(fieldName);
      const filled = typeof value === 'string' && value.trim().length > 0;

      if (!filled) {
        trackFieldError(fieldName, 'required');
        return;
      }

      if (!completedFieldsRef.current.has(fieldName)) {
        completedFieldsRef.current.add(fieldName);
        trackFieldCompleted(fieldName, sectionName);
      }

      if (!engagedRef.current) {
        engagedRef.current = true;
        trackFormEngaged();
      }
    },
    [getValues],
  );

  const onSubmitAttempt = useCallback(() => {
    trackSubmitAttempt(position);
  }, [position]);

  const onSubmitFailed = useCallback((error) => {
    trackSubmitFailed(classifySubmitError(error));
  }, []);

  const markFormSubmitted = useCallback(() => {
    submittedRef.current = true;
  }, []);

  return {
    setSectionRef,
    onFieldBlur,
    onSubmitAttempt,
    onSubmitFailed,
    markFormSubmitted,
  };
}
