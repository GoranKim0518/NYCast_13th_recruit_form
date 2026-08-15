import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { initAnalytics } from './lib/analytics';
import App from './App.jsx';
import './index.css';

const GOAN_MARK = `
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
  `%c${GOAN_MARK}`,
  [
    'font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
    'font-size: 11px',
    'line-height: 1.05',
    'white-space: pre',
    'display: block',
    'color: #f3f4f6',
  ].join(';'),
);

initAnalytics();

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
