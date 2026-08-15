import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

function gtmIdFromEnv(env) {
  const id = typeof env.VITE_GTM_CONTAINER_ID === 'string'
    ? env.VITE_GTM_CONTAINER_ID.trim()
    : '';

  return /^GTM-[A-Z0-9]+$/.test(id) ? id : '';
}

function injectGtmSnippet(id) {
  const head = `<!-- Google Tag Manager -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','${id}');</script>
<!-- End Google Tag Manager -->`;

  const body = `<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=${id}"
height="0" width="0" style="display:none;visibility:hidden" title="Google Tag Manager"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->`;

  return {
    name: 'inject-gtm',
    transformIndexHtml(html) {
      return html
        .replace('<head>', `<head>\n    ${head}`)
        .replace('<body>', `<body>\n    ${body}`);
    },
  };
}

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '');
  const gtmId = gtmIdFromEnv(env);

  return {
    plugins: [
      react(),
      tailwindcss(),
      ...(gtmId ? [injectGtmSnippet(gtmId)] : []),
    ],
  };
});
