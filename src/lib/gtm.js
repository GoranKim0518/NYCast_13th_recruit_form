import { runAfterLoad } from './afterLoad';

const GTM_CONTAINER_ID = import.meta.env.VITE_GTM_CONTAINER_ID;

export function getDataLayer() {
  window.dataLayer = window.dataLayer || [];
  return window.dataLayer;
}

export function pushDataLayer(eventName, params = {}) {
  getDataLayer().push({
    event: eventName,
    ...params,
  });
}

function isGtmInstalled() {
  return Boolean(
    window.__nycastGtmHandled ||
      document.getElementById('gtm-script') ||
      document.querySelector('script[src*="googletagmanager.com/gtm.js"]'),
  );
}

function injectGtm(id) {
  getDataLayer().push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);
}

export function initGtm() {
  const id = typeof GTM_CONTAINER_ID === 'string' ? GTM_CONTAINER_ID.trim() : '';

  if (!id || isGtmInstalled()) {
    return;
  }

  runAfterLoad(() => injectGtm(id));
}
