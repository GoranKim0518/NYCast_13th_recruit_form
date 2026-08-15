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
    document.getElementById('gtm-script') ||
      document.querySelector('script[src*="googletagmanager.com/gtm.js"]'),
  );
}

export function initGtm() {
  const id = typeof GTM_CONTAINER_ID === 'string' ? GTM_CONTAINER_ID.trim() : '';

  if (!id || isGtmInstalled()) {
    return;
  }

  getDataLayer().push({
    'gtm.start': Date.now(),
    event: 'gtm.js',
  });

  const script = document.createElement('script');
  script.id = 'gtm-script';
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(id)}`;
  document.head.appendChild(script);

  const noscript = document.createElement('noscript');
  const iframe = document.createElement('iframe');
  iframe.src = `https://www.googletagmanager.com/ns.html?id=${encodeURIComponent(id)}`;
  iframe.height = '0';
  iframe.width = '0';
  iframe.style.display = 'none';
  iframe.style.visibility = 'hidden';
  iframe.setAttribute('title', 'Google Tag Manager');
  noscript.appendChild(iframe);
  document.body.insertBefore(noscript, document.body.firstChild);
}
