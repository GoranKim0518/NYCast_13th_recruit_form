export const POSITIONS = ['PD', '홍보마케터', '디자이너'];

export const PHONE_REGEX = /^010-\d{4}-\d{4}$/;
export const EMAIL_REGEX = /^[^@\s]+@[^@\s]+$/;
export const URL_REGEX = /^https?:\/\/.+/i;

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
