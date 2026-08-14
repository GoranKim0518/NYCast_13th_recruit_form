import ReactGA from 'react-ga4';
import {
  captureCampaignContext,
  getAnalyticsSessionId,
  getCampaignEventParams,
} from './campaign';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const FORM_NAME = 'nycast_13th_recruit';

let initialized = false;
let viewedAt = 0;

function engagementTimeMsec() {
  return viewedAt ? Math.max(0, Date.now() - viewedAt) : 0;
}

function baseParams() {
  return {
    form_name: FORM_NAME,
    form_session_id: getAnalyticsSessionId(),
    engagement_time_msec: engagementTimeMsec(),
    ...getCampaignEventParams(),
  };
}

function sendEvent(name, params = {}, { beacon = false } = {}) {
  if (!initialized) {
    return;
  }

  const payload = {
    ...baseParams(),
    ...params,
  };

  if (beacon) {
    payload.transport_type = 'beacon';
  }

  ReactGA.event(name, payload);
}

export function initAnalytics() {
  if (initialized || !MEASUREMENT_ID) {
    return;
  }

  captureCampaignContext();
  getAnalyticsSessionId();

  ReactGA.initialize(MEASUREMENT_ID, {
    gaOptions: {
      anonymize_ip: true,
    },
    gtagOptions: {
      anonymize_ip: true,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      send_page_view: false,
      debug_mode: Boolean(import.meta.env.DEV),
    },
  });

  initialized = true;
  viewedAt = Date.now();

  ReactGA.send({
    hitType: 'pageview',
    page: `${window.location.pathname}${window.location.search}`,
    title: document.title,
  });
}

export function trackFormView() {
  sendEvent('form_view');
}

export function trackFormEngaged() {
  sendEvent('form_engaged');
  sendEvent('form_start', { form_name: FORM_NAME });
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
  if (initialized && position) {
    ReactGA.gtag('set', 'user_properties', {
      selected_position: position,
    });
  }

  sendEvent('position_selected', {
    position_selected: position,
  });
}

export function trackSubmitAttempt(positionSelected) {
  sendEvent('submit_attempt', {
    position_selected: positionSelected || '(not set)',
  });
  sendEvent('form_submit', {
    form_name: FORM_NAME,
    position_selected: positionSelected || '(not set)',
  });
}

export function trackFormSubmitted(positionSelected) {
  const position = positionSelected || '(not set)';
  const campaign = getCampaignEventParams();

  sendEvent('form_submitted', {
    position_selected: position,
    is_completed: true,
  });
  sendEvent('generate_lead', {
    currency: 'KRW',
    value: 1,
    lead_source: campaign.campaign_source,
    position_selected: position,
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
  sendEvent(
    'form_abandon',
    {
      last_section: lastSection,
      last_field: lastField,
      fields_completed_count: fieldsCompletedCount,
      position_selected: positionSelected || '(not set)',
    },
    { beacon: true },
  );
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
