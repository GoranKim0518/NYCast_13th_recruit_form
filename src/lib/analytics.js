import ReactGA from 'react-ga4';

const MEASUREMENT_ID = import.meta.env.VITE_GA_MEASUREMENT_ID;

let initialized = false;

/**
 * GA4 초기화 — PII 수집 금지 설정
 * 개인식별정보(이름, 연락처, 이메일, 작성 텍스트 등)는 절대 전송하지 않음
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

/**
 * @param {string} stepName - 단계명 (예: 'common_info', 'position_specific', 'submit')
 * @param {boolean} isCompleted - 해당 단계 완료 여부
 */
export function trackStepCompleted(stepName, isCompleted = true) {
  if (!initialized) return;

  ReactGA.event('step_completed', {
    step_name: stepName,
    is_completed: isCompleted,
  });
}

/**
 * @param {string} position - 지원 분야명 ('PD' | '홍보마케터' | '디자이너')
 */
export function trackPositionSelected(position) {
  if (!initialized) return;

  ReactGA.event('position_selected', {
    position_selected: position,
  });
}

/**
 * @param {boolean} isCompleted - 제출 완료 여부
 */
export function trackFormSubmitted(isCompleted = true) {
  if (!initialized) return;

  ReactGA.event('form_submitted', {
    step_name: 'submit',
    is_completed: isCompleted,
  });
}
