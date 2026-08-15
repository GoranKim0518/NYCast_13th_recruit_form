import { useCallback, useEffect, useRef } from 'react';
import {
  ANALYTICS_ENABLED,
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
import { hasMeaningfulDraft } from '../lib/formCache';
import { validateApplication } from '../utils/formConfig';

function isFormControl(element) {
  return (
    element instanceof HTMLInputElement ||
    element instanceof HTMLTextAreaElement
  );
}

function isComposing(element, event) {
  return Boolean(
    event?.isComposing ||
      element?.composing ||
      (typeof element?.isComposing === 'boolean' && element.isComposing),
  );
}

export function useFormAnalytics({
  formRef,
  getValues,
  position,
}) {
  const viewedRef = useRef(false);
  const engagedRef = useRef(false);
  const submittedRef = useRef(false);
  const abandonSentRef = useRef(false);
  const completedFieldsRef = useRef(new Set());
  const reachedSectionsRef = useRef(new Set());
  const lastFieldRef = useRef('');
  const lastSectionRef = useRef('common');
  const sectionRefs = useRef({});
  const getValuesRef = useRef(getValues);
  getValuesRef.current = getValues;

  const setSectionRef = useCallback((sectionName) => {
    return (node) => {
      sectionRefs.current[sectionName] = node;
    };
  }, []);

  useEffect(() => {
    if (ANALYTICS_ENABLED) {
      viewedRef.current = true;
      trackFormView();
    }
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
    if (
      !ANALYTICS_ENABLED ||
      !viewedRef.current ||
      submittedRef.current ||
      abandonSentRef.current
    ) {
      return;
    }

    abandonSentRef.current = true;

    const values = getValuesRef.current();
    const fieldsCompletedCount = countCompletedRequiredFields(values);
    const abandonType =
      fieldsCompletedCount > 0 || hasMeaningfulDraft(values)
        ? 'partial'
        : 'empty';

    trackFormAbandon({
      lastSection: lastSectionRef.current,
      lastField: lastFieldRef.current || '(none)',
      fieldsCompletedCount,
      positionSelected: values.position,
      abandonType,
    });
  }, []);

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

  useEffect(() => {
    if (!ANALYTICS_ENABLED) {
      return undefined;
    }

    const form = formRef.current;
    if (!form) {
      return undefined;
    }

    const trackField = (fieldName) => {
      const sectionName = getFieldSection(fieldName);
      lastFieldRef.current = fieldName;
      lastSectionRef.current = sectionName;

      const values = getValuesRef.current();
      const value = values[fieldName];
      const filled = typeof value === 'string' && value.trim().length > 0;

      if (!filled) {
        return;
      }

      const fieldError = validateApplication(values)[fieldName];
      if (fieldError) {
        trackFieldError(fieldName, mapValidationErrorType(fieldError));
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
    };

    const leaveField = (fieldName) => {
      window.setTimeout(() => {
        trackField(fieldName);
      }, 0);
    };

    const onCompositionStart = (event) => {
      if (isFormControl(event.target)) {
        event.target.composing = true;
      }
    };

    const onCompositionEnd = (event) => {
      const target = event.target;
      if (!isFormControl(target)) {
        return;
      }

      target.composing = false;

      if (document.activeElement !== target && target.name) {
        leaveField(target.name);
      }
    };

    const onFocusOut = (event) => {
      const target = event.target;
      if (!isFormControl(target) || !target.name) {
        return;
      }

      if (isComposing(target, event)) {
        return;
      }

      leaveField(target.name);
    };

    const rememberField = (event) => {
      if (!isFormControl(event.target) || !event.target.name) {
        return;
      }

      lastFieldRef.current = event.target.name;
      lastSectionRef.current = getFieldSection(event.target.name);
    };

    form.addEventListener('compositionstart', onCompositionStart, true);
    form.addEventListener('compositionend', onCompositionEnd, true);
    form.addEventListener('focusout', onFocusOut);
    form.addEventListener('focusin', rememberField);
    form.addEventListener('input', rememberField, true);

    return () => {
      form.removeEventListener('compositionstart', onCompositionStart, true);
      form.removeEventListener('compositionend', onCompositionEnd, true);
      form.removeEventListener('focusout', onFocusOut);
      form.removeEventListener('focusin', rememberField);
      form.removeEventListener('input', rememberField, true);
    };
  }, [formRef]);

  const onValidationFailed = useCallback((formErrors) => {
    for (const [fieldName, error] of Object.entries(formErrors)) {
      trackFieldError(fieldName, mapValidationErrorType(error));
    }
  }, []);

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
    onValidationFailed,
    onSubmitAttempt,
    onSubmitFailed,
    markFormSubmitted,
  };
}
