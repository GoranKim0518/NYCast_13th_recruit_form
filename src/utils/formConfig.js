export const POSITIONS = ['PD', '홍보마케터', '디자이너'];

export const PHONE_REGEX = /^010-\d{4}-\d{4}$/;
export const EMAIL_REGEX = /@/;

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
    payload.pd_strategy = data.pd_strategy || null;
    payload.pd_idea = data.pd_idea;
    payload.pd_tools = data.pd_tools || null;
    payload.pd_experience = data.pd_experience || null;
    payload.pd_comment = data.pd_comment || null;
    payload.pd_inflow_channel = data.pd_inflow_channel;
  } else if (data.position === '홍보마케터') {
    payload.mkt_strategy = data.mkt_strategy || null;
    payload.mkt_tools = data.mkt_tools || null;
    payload.mkt_experience = data.mkt_experience || null;
    payload.mkt_comment = data.mkt_comment || null;
    payload.mkt_inflow_channel = data.mkt_inflow_channel;
  } else if (data.position === '디자이너') {
    payload.des_challenge = data.des_challenge || null;
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

function setRequired(errors, data, id, message) {
  if (!data[id] || !String(data[id]).trim()) {
    errors[id] = { message, type: 'required' };
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

  setRequired(errors, data, 'name', '이름을 입력해 주세요.');
  setRequired(errors, data, 'birth_date', '생년월일을 입력해 주세요.');
  setRequired(errors, data, 'academic_info', '학교 정보를 입력해 주세요.');
  setRequired(errors, data, 'residence', '거주지를 입력해 주세요.');
  setRequired(errors, data, 'activity_location', '활동하는 곳을 입력해 주세요.');
  setRequired(errors, data, 'phone', '연락처를 입력해 주세요.');

  if (!errors.phone && data.phone && !PHONE_REGEX.test(data.phone.trim())) {
    errors.phone = {
      message: '010-0000-0000 형식으로 입력해 주세요.',
      type: 'pattern',
    };
  }

  setRequired(errors, data, 'email', '이메일을 입력해 주세요.');

  if (!errors.email && data.email && !EMAIL_REGEX.test(data.email.trim())) {
    errors.email = {
      message: '이메일 주소에 @가 포함되어야 합니다.',
      type: 'pattern',
    };
  }

  setRequired(errors, data, 'position', '지원분야를 선택해 주세요.');
  setRequired(errors, data, 'inspiration_source', '영감의 출처를 입력해 주세요.');

  if (data.position === 'PD') {
    setOptional(errors, data, 'pd_strategy');
    setRequired(errors, data, 'pd_idea', '프로그램 아이디어를 입력해 주세요.');
    setOptional(errors, data, 'pd_tools');
    setOptional(errors, data, 'pd_experience');
    setOptional(errors, data, 'pd_comment');
    setRequired(errors, data, 'pd_inflow_channel', '유입 경로를 입력해 주세요.');
  } else if (data.position === '홍보마케터') {
    setOptional(errors, data, 'mkt_strategy');
    setOptional(errors, data, 'mkt_tools');
    setOptional(errors, data, 'mkt_experience');
    setOptional(errors, data, 'mkt_comment');
    setRequired(errors, data, 'mkt_inflow_channel', '유입 경로를 입력해 주세요.');
  } else if (data.position === '디자이너') {
    setOptional(errors, data, 'des_challenge');
    setOptional(errors, data, 'des_portfolio_url');
    setOptional(errors, data, 'des_comment');
    setRequired(errors, data, 'des_inflow_channel', '유입 경로를 입력해 주세요.');
  }

  return errors;
}
