import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;
const SUBMIT_TIMEOUT_MS = 20000;
const SUBMISSION_ID_KEY = 'nycast_13th_submission_id';

const isConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!isConfigured) {
  console.warn(
    '[Supabase] VITE_SUPABASE_URL 또는 VITE_SUPABASE_ANON_KEY가 설정되지 않았습니다.',
  );
}

export const supabase = isConfigured
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export function isSupabaseConfigured() {
  return isConfigured;
}

export class SubmitError extends Error {
  constructor(code, message) {
    super(message);
    this.name = 'SubmitError';
    this.code = code;
  }
}

function getLocalStorage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function getOrCreateSubmissionId() {
  const storage = getLocalStorage();
  const existing = storage?.getItem(SUBMISSION_ID_KEY);

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  storage?.setItem(SUBMISSION_ID_KEY, id);
  return id;
}

export function clearSubmissionId() {
  getLocalStorage()?.removeItem(SUBMISSION_ID_KEY);
}

function isOffline() {
  return typeof navigator !== 'undefined' && navigator.onLine === false;
}

function isDuplicateSubmission(error) {
  if (error?.code !== '23505') {
    return false;
  }

  const text = `${error.message || ''} ${error.details || ''} ${error.hint || ''}`;
  if (/client_submission_id/i.test(text)) {
    return true;
  }

  return !/applications_pkey|_pkey/i.test(text);
}

function toSubmitError(error, signal) {
  if (error instanceof SubmitError) {
    return error;
  }

  const aborted = error?.name === 'AbortError' || signal?.aborted;
  if (aborted || isOffline()) {
    if (signal?.reason === 'timeout') {
      return new SubmitError(
        'timeout',
        '서버 응답이 지연되고 있습니다. 연결 상태를 확인한 뒤 다시 제출해 주세요. 작성 내용은 저장되어 있습니다.',
      );
    }

    return new SubmitError(
      'offline',
      '제출 중 인터넷 연결이 끊어졌습니다. 연결 후 다시 제출해 주세요. 같은 지원서는 중복 저장되지 않습니다.',
    );
  }

  return new SubmitError(
    'unknown',
    error?.message ||
      '제출 중 오류가 발생했습니다. 잠시 후 다시 시도해 주세요.',
  );
}

export async function submitApplication(data) {
  if (!supabase) {
    throw new SubmitError(
      'config',
      'Supabase가 설정되지 않았습니다. 관리자에게 문의해 주세요.',
    );
  }

  if (isOffline()) {
    throw new SubmitError(
      'offline',
      '인터넷 연결이 끊어졌습니다. 연결 후 다시 제출해 주세요. 작성 내용은 저장되어 있습니다.',
    );
  }

  const client_submission_id = getOrCreateSubmissionId();
  const controller = new AbortController();
  const timeoutId = window.setTimeout(() => {
    controller.abort('timeout');
  }, SUBMIT_TIMEOUT_MS);

  const onOffline = () => controller.abort('offline');
  window.addEventListener('offline', onOffline);

  try {
    const { error } = await supabase
      .from('applications')
      .insert([{ ...data, client_submission_id }])
      .abortSignal(controller.signal);

    if (error) {
      // 같은 탭에서 재시도: UNIQUE 충돌은 이미 저장된 것으로 본다.
      if (isDuplicateSubmission(error)) {
        clearSubmissionId();
        return;
      }

      throw new SubmitError('unknown', error.message);
    }

    clearSubmissionId();
  } catch (error) {
    throw toSubmitError(error, controller.signal);
  } finally {
    window.clearTimeout(timeoutId);
    window.removeEventListener('offline', onOffline);
  }
}
