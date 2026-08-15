export const POSITIONS = ['PD', '홍보마케터', '디자이너'];

export const REQUIRED_MESSAGE = '필수 질문입니다.';
export const PHONE_REGEX = /^010-\d{4}-\d{4}$/;
export const EMAIL_REGEX = /@/;
export const BIRTH_DATE_REGEX = /^\d{8}$/;

export const defaultValues = {
  name: '',
  birth_date: '',
  academic_info: '',
  residence: '',
  activity_location: '',
  phone: '',
  email: '',
  position: '',
  inspiration_source: '',
  pd_strategy: '',
  pd_idea: '',
  pd_tools: '',
  pd_experience: '',
  pd_comment: '',
  pd_inflow_channel: '',
  mkt_strategy: '',
  mkt_tools: '',
  mkt_experience: '',
  mkt_comment: '',
  mkt_inflow_channel: '',
  des_challenge: '',
  des_portfolio_url: '',
  des_comment: '',
  des_inflow_channel: '',
};

export function buildSubmissionPayload(data) {
  const payload = {
    name: data.name,
    birth_date: data.birth_date,
    academic_info: data.academic_info,
    residence: data.residence,
    activity_location: data.activity_location,
    phone: data.phone,
    email: data.email,
    position: data.position,
    inspiration_source: data.inspiration_source,
    pd_strategy: null,
    pd_idea: null,
    pd_tools: null,
    pd_experience: null,
    pd_comment: null,
    pd_inflow_channel: null,
    mkt_strategy: null,
    mkt_tools: null,
    mkt_experience: null,
    mkt_comment: null,
    mkt_inflow_channel: null,
    des_challenge: null,
    des_portfolio_url: null,
    des_comment: null,
    des_inflow_channel: null,
  };

  if (data.position === 'PD') {
    payload.pd_strategy = data.pd_strategy;
    payload.pd_idea = data.pd_idea;
    payload.pd_tools = data.pd_tools;
    payload.pd_experience = data.pd_experience || null;
    payload.pd_comment = data.pd_comment || null;
    payload.pd_inflow_channel = data.pd_inflow_channel;
  } else if (data.position === '홍보마케터') {
    payload.mkt_strategy = data.mkt_strategy;
    payload.mkt_tools = data.mkt_tools;
    payload.mkt_experience = data.mkt_experience || null;
    payload.mkt_comment = data.mkt_comment || null;
    payload.mkt_inflow_channel = data.mkt_inflow_channel;
  } else if (data.position === '디자이너') {
    payload.des_challenge = data.des_challenge;
    payload.des_portfolio_url = data.des_portfolio_url;
    payload.des_comment = data.des_comment || null;
    payload.des_inflow_channel = data.des_inflow_channel;
  }

  return payload;
}

export function readFormData(form) {
  const data = { ...defaultValues };

  if (!form) {
    return data;
  }

  const formData = new FormData(form);

  for (const key of Object.keys(defaultValues)) {
    const value = formData.get(key);
    if (typeof value === 'string') {
      data[key] = value;
    }
  }

  return data;
}

function htmlMessage(value) {
  if (typeof value !== 'string') {
    return null;
  }

  const trimmed = value.trim();
  if (/<[^>]*>/i.test(trimmed) || /<script/i.test(trimmed)) {
    return 'HTML 또는 Script 태그는 입력할 수 없습니다.';
  }

  return null;
}

function setRequired(errors, data, id) {
  if (!data[id] || !String(data[id]).trim()) {
    errors[id] = { message: REQUIRED_MESSAGE, type: 'required' };
    return;
  }

  const html = htmlMessage(data[id]);
  if (html) {
    errors[id] = { message: html, type: 'validate' };
  }
}

function setOptional(errors, data, id) {
  if (!data[id]) {
    return;
  }

  const html = htmlMessage(data[id]);
  if (html) {
    errors[id] = { message: html, type: 'validate' };
  }
}

export function validateApplication(data) {
  const errors = {};

  setRequired(errors, data, 'name');
  setRequired(errors, data, 'birth_date');

  if (
    !errors.birth_date &&
    data.birth_date &&
    !BIRTH_DATE_REGEX.test(data.birth_date.trim())
  ) {
    errors.birth_date = {
      message: 'YYYYMMDD 8자리로 입력해 주세요.',
      type: 'pattern',
    };
  }

  setRequired(errors, data, 'academic_info');
  setRequired(errors, data, 'residence');
  setRequired(errors, data, 'activity_location');
  setRequired(errors, data, 'phone');

  if (!errors.phone && data.phone && !PHONE_REGEX.test(data.phone.trim())) {
    errors.phone = {
      message: '010-0000-0000 형식으로 입력해 주세요.',
      type: 'pattern',
    };
  }

  setRequired(errors, data, 'email');

  if (!errors.email && data.email && !EMAIL_REGEX.test(data.email.trim())) {
    errors.email = {
      message: '유효한 이메일 주소를 입력해 주세요.',
      type: 'pattern',
    };
  }

  setRequired(errors, data, 'inspiration_source');
  setRequired(errors, data, 'position');

  if (data.position === 'PD') {
    setRequired(errors, data, 'pd_strategy');
    setRequired(errors, data, 'pd_idea');
    setRequired(errors, data, 'pd_tools');
    setOptional(errors, data, 'pd_experience');
    setOptional(errors, data, 'pd_comment');
    setRequired(errors, data, 'pd_inflow_channel');
  } else if (data.position === '홍보마케터') {
    setRequired(errors, data, 'mkt_strategy');
    setRequired(errors, data, 'mkt_tools');
    setOptional(errors, data, 'mkt_experience');
    setOptional(errors, data, 'mkt_comment');
    setRequired(errors, data, 'mkt_inflow_channel');
  } else if (data.position === '디자이너') {
    setRequired(errors, data, 'des_challenge');
    setRequired(errors, data, 'des_portfolio_url');
    setOptional(errors, data, 'des_comment');
    setRequired(errors, data, 'des_inflow_channel');
  }

  return errors;
}
