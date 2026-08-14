const CAMPAIGN_KEY = 'nycast_13th_campaign_v1';
const SESSION_KEY = 'nycast_13th_analytics_session_v1';

const UTM_KEYS = [
  'utm_source',
  'utm_medium',
  'utm_campaign',
  'utm_content',
  'utm_term',
];
const CLICK_KEYS = ['gclid', 'wbraid', 'gbraid', 'fbclid'];

function getStorage() {
  try {
    return window.sessionStorage;
  } catch {
    return null;
  }
}

function readJson(key) {
  try {
    const raw = getStorage()?.getItem(key);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function writeJson(key, value) {
  try {
    getStorage()?.setItem(key, JSON.stringify(value));
  } catch {
    // private browsing
  }
}

function getSearchParams() {
  try {
    return new URLSearchParams(window.location.search);
  } catch {
    return new URLSearchParams();
  }
}

function referrerHost() {
  try {
    if (!document.referrer) {
      return '';
    }

    const host = new URL(document.referrer).hostname.replace(/^www\./, '');
    const current = window.location.hostname.replace(/^www\./, '');
    return host && host !== current ? host : '';
  } catch {
    return '';
  }
}

function clip(value) {
  return String(value).slice(0, 100);
}

export function getAnalyticsSessionId() {
  const storage = getStorage();
  const existing = storage?.getItem(SESSION_KEY);

  if (existing) {
    return existing;
  }

  const id = crypto.randomUUID();
  storage?.setItem(SESSION_KEY, id);
  return id;
}

export function captureCampaignContext() {
  const stored = readJson(CAMPAIGN_KEY);
  if (stored?.captured) {
    return stored;
  }

  const params = getSearchParams();
  const campaign = {};

  for (const key of [...UTM_KEYS, ...CLICK_KEYS]) {
    const value = params.get(key);
    if (value) {
      campaign[key] = clip(value);
    }
  }

  if (!campaign.utm_source) {
    const referrer = referrerHost();
    if (referrer) {
      campaign.utm_source = referrer;
      campaign.utm_medium = 'referral';
    } else {
      campaign.utm_source = 'direct';
      campaign.utm_medium = 'none';
    }
  }

  campaign.captured = true;
  writeJson(CAMPAIGN_KEY, campaign);
  return campaign;
}

export function getCampaignEventParams() {
  const campaign = captureCampaignContext();

  return {
    campaign_source: campaign.utm_source || 'direct',
    campaign_medium: campaign.utm_medium || 'none',
    campaign_name: campaign.utm_campaign || '(not set)',
    campaign_content: campaign.utm_content || '(not set)',
    campaign_term: campaign.utm_term || '(not set)',
    has_gclid: Boolean(campaign.gclid || campaign.wbraid || campaign.gbraid),
    has_fbclid: Boolean(campaign.fbclid),
  };
}
