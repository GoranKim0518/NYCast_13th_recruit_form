import ReactGA from 'react-ga4';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialized = false;

function sendEvent(name, params = {}) {
  if (!initialized) {
    return;
  }

  ReactGA.event(name, params);
}

/**
 * GA4 초기화 — PII 수집 금지 설정
 */
export function initAnalytics() {
  if (initialized || !MEASUREMENT_ID) {
    return;
  }

  ReactGA.initialize(MEASUREMENT_ID, {
    gaOptions: {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
    },
  });

  initialized = true;
}

export function trackFormView() {
  sendEvent('form_view');
}

export function trackFormEngaged() {
  sendEvent('form_engaged');
}

export function trackSectionReached(sectionName) {
  sendEvent('section_reached', { section_name: sectionName });
}

export function trackFieldCompleted(fieldName, sectionName) {
  sendEvent('field_completed', {
    field_name: fieldName,
    section_name: sectionName,
  });
}

export function trackFieldError(fieldName, errorType) {
  sendEvent('field_error', {
    field_name: fieldName,
    error_type: errorType,
  });
}

export function trackPositionSelected(position) {
  sendEvent('position_selected', { position_selected: position });
}

export function trackSubmitAttempt(positionSelected) {
  sendEvent('submit_attempt', {
    position_selected: positionSelected || '(not set)',
  });
}

export function trackFormSubmitted(positionSelected) {
  sendEvent('form_submitted', {
    position_selected: positionSelected || '(not set)',
    is_completed: true,
  });
}

export function trackSubmitFailed(errorType) {
  sendEvent('submit_failed', { error_type: errorType });
}

export function trackFormAbandon({
  lastSection,
  lastField,
  fieldsCompletedCount,
  positionSelected,
}) {
  sendEvent('form_abandon', {
    last_section: lastSection,
    last_field: lastField,
    fields_completed_count: fieldsCompletedCount,
    position_selected: positionSelected || '(not set)',
  });
}

export function trackDraftRestored() {
  sendEvent('draft_restored');
}

export function trackDraftCleared() {
  sendEvent('draft_cleared');
}

export function trackFormCompletedView() {
  sendEvent('form_completed_view', { is_completed: true });
}

export function trackFormDisclosure({
  sectionName,
  disclosureAction,
  disclosureTrigger,
}) {
  sendEvent('form_disclosure', {
    section_name: sectionName,
    disclosure_action: disclosureAction,
    disclosure_trigger: disclosureTrigger,
  });
}
