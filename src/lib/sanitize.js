/**
 * XSS 방어: HTML/Script 태그 제거 및 입력값 정규화
 */
const HTML_TAG_REGEX = /<[^>]*>/g;
const SCRIPT_REGEX = /(<script\b[^>]*>[\s\S]*?<\/script>|<script\b[^>]*\/?>)/gi;

export function sanitizeInput(value) {
  if (value == null || typeof value !== 'string') {
    return value;
  }

  return value
    .trim()
    .replace(SCRIPT_REGEX, '')
    .replace(HTML_TAG_REGEX, '')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '');
}

export function sanitizeFormData(data) {
  const sanitized = {};

  for (const [key, value] of Object.entries(data)) {
    if (typeof value === 'string') {
      sanitized[key] = sanitizeInput(value);
    } else {
      sanitized[key] = value;
    }
  }

  return sanitized;
}
