import ReactGA from 'react-ga4';
import {
  captureCampaignContext,
  getAnalyticsSessionId,
  getCampaignEventParams,
} from './campaign';
import { runAfterLoad } from './afterLoad';
import { getDataLayer, initGtm, pushDataLayer } from './gtm';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;
const FORM_NAME = 'nycast_13th_recruit';
const MAX_QUEUED_GA4_CALLS = 100;
export const ANALYTICS_ENABLED = true;

let initialized = false;
let ga4Ready = false;
let viewedAt = 0;

// GA4는 load 이후에 초기화되므로 그 전의 호출은 순서를 유지한 채 큐에 담는다.
let queuedGa4Calls = [];

function withGa4(call) {
  if (ga4Ready) {
    call();
    return;
  }

  if (queuedGa4Calls.length < MAX_QUEUED_GA4_CALLS) {
    queuedGa4Calls.push(call);
  }
}

function flushGa4Queue() {
  const calls = queuedGa4Calls;
  queuedGa4Calls = [];

  for (const call of calls) {
    try {
      call();
    } catch (error) {
      console.warn('[analytics] queued call failed', error);
    }
  }
}

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
  if (!ANALYTICS_ENABLED) {
    return;
  }

  const payload = {
    ...baseParams(),
    ...params,
  };

  pushDataLayer(name, payload);

  const gaPayload = beacon
    ? { ...payload, transport_type: 'beacon' }
    : payload;

  withGa4(() => ReactGA.event(name, gaPayload));
}

export function initAnalytics() {
  if (!ANALYTICS_ENABLED || initialized) {
    return;
  }

  captureCampaignContext();
  getAnalyticsSessionId();
  getDataLayer();
  initGtm();

  viewedAt = Date.now();
  initialized = true;

  const measurementId =
    typeof MEASUREMENT_ID === 'string' ? MEASUREMENT_ID.trim() : '';

  const pagePath = `${window.location.pathname}${window.location.search}`;
  const pageParams = {
    ...baseParams(),
    page_path: pagePath,
    page_location: window.location.href,
    page_title: document.title,
  };

  pushDataLayer('page_view', pageParams);

  if (!measurementId) {
    return;
  }

  withGa4(() =>
    ReactGA.send({
      hitType: 'pageview',
      page: pagePath,
      title: document.title,
    }),
  );

  // gtag/js는 async여도 load 이전에 삽입되면 load 이벤트를 지연시킨다.
  // 인앱 브라우저의 무한 로딩을 막기 위해 초기화 자체를 load 이후로 미룬다.
  runAfterLoad(() => {
    try {
      ReactGA.initialize(measurementId, {
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
      ga4Ready = true;
      flushGa4Queue();
    } catch (error) {
      queuedGa4Calls = [];
      console.warn('[analytics] GA4 init failed', error);
    }
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

export function trackInputLeave({
  fieldName,
  sectionName,
  fieldFilled,
  fieldValid,
  errorType,
  positionSelected,
}) {
  sendEvent('input_leave', {
    field_name: fieldName,
    section_name: sectionName,
    field_filled: fieldFilled ? 'true' : 'false',
    field_valid: fieldValid ? 'true' : 'false',
    error_type: errorType || '(not set)',
    position_selected: positionSelected || '(not set)',
  });
}

export function trackPositionSelected(position) {
  if (!ANALYTICS_ENABLED) {
    return;
  }

  if (position) {
    getDataLayer().push({ selected_position: position });
    withGa4(() =>
      ReactGA.gtag('set', 'user_properties', {
        selected_position: position,
      }),
    );
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
  abandonType,
}) {
  sendEvent(
    'form_abandon',
    {
      last_section: lastSection,
      last_field: lastField,
      fields_completed_count: fieldsCompletedCount,
      position_selected: positionSelected || '(not set)',
      abandon_type: abandonType || 'empty',
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
