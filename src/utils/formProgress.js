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

export function calculateFormProgress(values) {
  const requiredFields = getRequiredFields(values.position);

  if (requiredFields.length === 0) {
    return 0;
  }

  const filledCount = requiredFields.filter((field) =>
    isFieldFilled(values[field]),
  ).length;

  return Math.round((filledCount / requiredFields.length) * 100);
}

export function getProgressDetail(values) {
  const requiredFields = getRequiredFields(values.position);
  const filledCount = requiredFields.filter((field) =>
    isFieldFilled(values[field]),
  ).length;

  return {
    percent: calculateFormProgress(values),
    filledCount,
    totalCount: requiredFields.length,
  };
}
