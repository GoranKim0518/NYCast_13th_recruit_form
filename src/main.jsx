import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initAnalytics } from './lib/analytics';
import App from './App.jsx';
import './index.css';

const GORAN_MARK = `
   ▄▄     ▄▄▄   ▄▄▄      ▄   ▄▄▄▄
   ██▄   ██▀   █▀██  ██  ▀██████▀             █▄
   ███▄  ██      ██  ██    ██                ▄██▄
   ██ ▀█▄██      ██  ██    ██     ▄▀▀█▄ ▄██▀█ ██
   ██   ▀██      ██  ██    ██     ▄█▀██ ▀███▄ ██
 ▀██▀    ██      ▀█████▄   ▀█████▄▀█▄███▄▄██▀▄██
                 ▄   ██
                 ▀████▀

                                                               ▄▄
                                       █▄                      ██
                                 ▄    ▄██▄                     ██
▀█▄ █▄ ██▀▄█▀█▄  ▀█▄ █▄ ██▀▄▀▀█▄ ████▄ ██    ██ ██ ▄███▄ ██ ██ ██
 ██▄██▄██ ██▄█▀   ██▄██▄██ ▄█▀██ ██ ██ ██    ██▄██ ██ ██ ██ ██
  ▀██▀██▀▄▀█▄▄▄    ▀██▀██▀▄▀█▄██▄██ ▀█▄██   ▄▄▀██▀▄▀███▀▄▀██▀█ ██
                                               ██
                                             ▀▀▀

Found this console? You're already a NYCast candidate.
Made by Goran
`.replace(/^\n/, '');

console.log(
  `%c${GORAN_MARK}`,
  [
    'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    'font-size: 11px',
    'line-height: 1.05',
    'white-space: pre',
    'display: block',
    'color: #f3f4f6',
  ].join(';'),
);

// 분석 초기화가 실패해도(인앱 브라우저의 storage/crypto 제약 등) 폼은 반드시 렌더한다.
try {
  initAnalytics();
} catch (error) {
  console.warn('[analytics] init skipped', error);
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
