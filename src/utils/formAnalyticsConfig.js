export const FIELD_SECTIONS = {
  common: [
    'name',
    'birth_date',
    'academic_info',
    'residence',
    'activity_location',
    'phone',
    'email',
    'position',
    'inspiration_source',
  ],
  pd: [
    'pd_strategy',
    'pd_idea',
    'pd_tools',
    'pd_experience',
    'pd_comment',
    'pd_inflow_channel',
  ],
  marketer: [
    'mkt_strategy',
    'mkt_tools',
    'mkt_experience',
    'mkt_comment',
    'mkt_inflow_channel',
  ],
  designer: [
    'des_challenge',
    'des_portfolio_url',
    'des_comment',
    'des_inflow_channel',
  ],
};

export const POSITION_TO_SECTION = {
  PD: 'pd',
  홍보마케터: 'marketer',
  디자이너: 'designer',
};

export const COMMON_REQUIRED_FIELDS = [
  'name',
  'birth_date',
  'academic_info',
  'residence',
  'activity_location',
  'phone',
  'email',
  'position',
  'inspiration_source',
];

export const POSITION_REQUIRED_FIELDS = {
  PD: ['pd_idea', 'pd_inflow_channel'],
  홍보마케터: ['mkt_inflow_channel'],
  디자이너: ['des_portfolio_url', 'des_inflow_channel'],
};

export function getFieldSection(fieldName) {
  for (const [section, fields] of Object.entries(FIELD_SECTIONS)) {
    if (fields.includes(fieldName)) {
      return section;
    }
  }
  return 'common';
}

function isFieldFilled(value) {
  return typeof value === 'string' && value.trim().length > 0;
}

export function getRequiredFields(position) {
  const fields = [...COMMON_REQUIRED_FIELDS];

  if (position && POSITION_REQUIRED_FIELDS[position]) {
    fields.push(...POSITION_REQUIRED_FIELDS[position]);
  }

  return fields;
}

export function getFirstErrorField(errors, position) {
  if (!errors) {
    return undefined;
  }

  return getRequiredFields(position).find((field) => errors[field]);
}

export function isCollapsedCommonField(fieldName) {
  return (
    FIELD_SECTIONS.common.includes(fieldName) &&
    fieldName !== 'inspiration_source'
  );
}

export function countCompletedRequiredFields(values) {
  return getRequiredFields(values.position).filter((field) =>
    isFieldFilled(values[field]),
  ).length;
}

export function mapValidationErrorType(error) {
  if (!error) {
    return 'unknown';
  }

  if (error.type === 'required') {
    return 'required';
  }

  if (error.type === 'pattern') {
    return 'pattern';
  }

  if (error.type === 'validate') {
    return 'sanitize';
  }

  return error.type || 'unknown';
}

export function classifySubmitError(error) {
  if (error?.code) {
    return error.code;
  }

  const message = (error?.message ?? '').toLowerCase();

  if (
    message.includes('network') ||
    message.includes('fetch') ||
    message.includes('failed to fetch') ||
    message.includes('offline')
  ) {
    return 'network';
  }

  if (
    message.includes('row-level') ||
    message.includes('rls') ||
    message.includes('policy')
  ) {
    return 'rls';
  }

  if (message.includes('supabase') || message.includes('설정')) {
    return 'config';
  }

  return 'unknown';
}
