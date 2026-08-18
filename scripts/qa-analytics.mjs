// GTM/GA4를 window.load 이후에 주입하도록 바꾼 것이 분석에 영향을 주는지 검증한다.
//
// 1) 엔진 호환: Chromium / WebKit(Safari) / Firefox에서 load가 발생하고 에러가 없는지
// 2) GTM 재생: 컨테이너가 늦게 떠도 그 전에 쌓인 dataLayer 이벤트를 처리하는지
// 3) 전송: /g/collect 히트가 실제로 나가는지, 첫 히트가 얼마나 늦어지는지
// 4) 조기 이탈: load 전에 떠나면 손실이 생기는지 (지연 주입 전 빌드와 비교)
//
// 사용법 (비교군은 지연 주입 이전 커밋 빌드):
//   git worktree add /tmp/nodefer <ref> && (cd /tmp/nodefer && npm run build)
//   node scripts/qa-analytics.mjs /tmp/nodefer/dist dist

import { chromium, webkit, firefox } from 'playwright';
import {
  serveDist,
  KAKAO_IOS_UA,
  SE3_VIEWPORT,
  NETWORKS,
} from './lib/staticServer.mjs';

const [baseDir, headDir = 'dist'] = process.argv.slice(2);

const HEAD_PORT = 5202;
const BASE_PORT = 5201;
const HEAD_URL = `http://127.0.0.1:${HEAD_PORT}/`;
const BASE_URL = `http://127.0.0.1:${BASE_PORT}/`;

const COLLECT_RE = /\/g\/collect/;

function contextOptions() {
  return {
    userAgent: KAKAO_IOS_UA,
    viewport: SE3_VIEWPORT,
    deviceScaleFactor: 2,
    isMobile: true,
    hasTouch: true,
  };
}

// WebKit/Firefox는 isMobile/hasTouch를 지원하지 않는다.
function contextOptionsFor(name) {
  const options = contextOptions();
  if (name !== 'chromium') {
    delete options.isMobile;
    delete options.deviceScaleFactor;
  }
  return options;
}

function collectedEvents(page, sink) {
  page.on('request', (request) => {
    const url = request.url();
    if (!COLLECT_RE.test(url)) {
      return;
    }

    const params = new URL(url).searchParams;
    const name = params.get('en');
    const at = Date.now();

    if (name) {
      sink.push({ name, at });
      return;
    }

    // 배치 히트는 POST 본문에 여러 이벤트가 담긴다.
    const body = request.postData() ?? '';
    for (const line of body.split('\n')) {
      const match = /(?:^|&)en=([^&]+)/.exec(line);
      if (match) {
        sink.push({ name: decodeURIComponent(match[1]), at });
      }
    }
  });
}

async function flushGtag(page) {
  // gtag는 이벤트를 배칭하므로 이탈 시점 신호로 강제 전송시킨다.
  await page.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('pagehide'));
  });
  await page.waitForTimeout(2500);
}

// ── 1) 엔진 호환 + 2) GTM 재생 + 3) 전송 ────────────────────────────────
async function runEngineCheck(name, launcher) {
  const browser = await launcher.launch();
  const context = await browser.newContext(contextOptionsFor(name));
  const page = await context.newPage();

  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  const hits = [];
  collectedEvents(page, hits);

  let gtmAfterLoad = null;
  let loadFired = false;
  page.on('load', () => {
    loadFired = true;
  });
  page.on('request', (request) => {
    if (request.url().includes('googletagmanager.com/gtm.js')) {
      gtmAfterLoad ??= loadFired;
    }
  });

  const started = Date.now();
  await page.goto(HEAD_URL, { waitUntil: 'load' });
  const loadMs = Date.now() - started;

  // GTM 컨테이너가 뜨고 dataLayer를 처리할 시간을 준다.
  await page
    .waitForFunction(() => Boolean(window.google_tag_manager), null, {
      timeout: 15000,
    })
    .catch(() => {});
  await page.waitForTimeout(2000);
  await flushGtag(page);

  // GTM은 처리한 dataLayer 메시지에 gtm.uniqueEventId를 붙인다.
  // load 전에 쌓인 page_view에 이 값이 있으면 늦게 떠도 재생된 것이다.
  const replay = await page.evaluate(() => {
    const layer = Array.from(window.dataLayer || []);
    const pageView = layer.find((entry) => entry && entry.event === 'page_view');
    return {
      pageViewPresent: Boolean(pageView),
      pageViewProcessed: Boolean(pageView && 'gtm.uniqueEventId' in pageView),
      gtmLoaded: Boolean(window.google_tag_manager),
      totalMessages: layer.length,
    };
  });

  const delivered = [...new Set(hits.map((hit) => hit.name))];
  const ok =
    errors.length === 0 &&
    gtmAfterLoad === true &&
    replay.pageViewProcessed &&
    delivered.includes('page_view');

  console.log(`\n[엔진 호환 · ${name}]`);
  console.log(`  window.load                 : ${loadMs}ms`);
  console.log(`  gtm.js가 load 이후에 요청됨 : ${gtmAfterLoad}`);
  console.log(`  GTM 컨테이너 로드           : ${replay.gtmLoaded}`);
  console.log(`  load 전 page_view를 GTM 처리: ${replay.pageViewProcessed}`);
  console.log(`  dataLayer 메시지 수         : ${replay.totalMessages}`);
  console.log(`  GA4 전송 확인               : ${delivered.length ? delivered.join(', ') : '없음'}`);
  console.log(`  pageerror                   : ${errors.length ? errors.join(' | ') : '없음'}`);
  console.log(`  결과                        : ${ok ? 'PASS' : 'FAIL'}`);

  await browser.close();
  return ok;
}

// ── 3) 첫 전송 지연 + 4) 조기 이탈 손실 ─────────────────────────────────
async function runDeliveryTiming({
  label,
  url,
  network,
  abandonAtMs,
  settleMs = 4000,
}) {
  const browser = await chromium.launch();
  const context = await browser.newContext(contextOptions());
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    ...network,
  });

  const hits = [];
  collectedEvents(page, hits);

  const started = Date.now();
  await page.goto(url, { waitUntil: 'commit' });

  if (abandonAtMs) {
    // load 여부와 무관하게 정해진 시점에 이탈한다.
    await page.waitForTimeout(abandonAtMs);
    await page.evaluate(() => {
      document.dispatchEvent(new Event('visibilitychange'));
      window.dispatchEvent(new Event('pagehide'));
    });
    await page.waitForTimeout(1500);
  } else {
    await page.waitForLoadState('load', { timeout: 120000 });
    // 느린 회선에서는 gtag.js 자체를 내려받는 데도 시간이 걸린다.
    await page.waitForTimeout(settleMs);
    await flushGtag(page);
  }

  const firstHit = hits.length ? hits[0].at - started : null;
  const delivered = [...new Set(hits.map((hit) => hit.name))];

  await browser.close();
  return { label, firstHit, delivered };
}

const servers = [await serveDist(headDir, HEAD_PORT)];
if (baseDir) {
  servers.push(await serveDist(baseDir, BASE_PORT));
}

const results = [];

results.push(await runEngineCheck('chromium', chromium));
results.push(await runEngineCheck('webkit', webkit));
results.push(await runEngineCheck('firefox', firefox));

const timingCases = [];
for (const [key, network] of Object.entries(NETWORKS)) {
  const settleMs = key === 'slow3g' ? 40000 : 5000;

  if (baseDir) {
    timingCases.push({
      label: `${network.label} · 지연 주입 전`,
      url: BASE_URL,
      network,
      settleMs,
    });
  }
  timingCases.push({
    label: `${network.label} · 현재`,
    url: HEAD_URL,
    network,
    settleMs,
  });
}

console.log('\n=== GA4 첫 전송 시점 ===');
for (const testCase of timingCases) {
  const result = await runDeliveryTiming(testCase);
  const ok = result.delivered.includes('page_view');
  results.push(ok);
  console.log(`\n  ${result.label}`);
  console.log(`    첫 /g/collect : ${result.firstHit == null ? '전송 없음' : `${result.firstHit}ms`}`);
  console.log(`    전송된 이벤트 : ${result.delivered.length ? result.delivered.join(', ') : '없음'}`);
  console.log(`    page_view 도달: ${ok ? 'PASS' : 'FAIL'}`);
}

console.log('\n=== 조기 이탈 (Slow 3G에서 2초 만에 이탈) ===');
const abandonCases = [];
if (baseDir) {
  abandonCases.push({ label: '지연 주입 전', url: BASE_URL });
}
abandonCases.push({ label: '현재', url: HEAD_URL });

for (const testCase of abandonCases) {
  const result = await runDeliveryTiming({
    ...testCase,
    network: NETWORKS.slow3g,
    abandonAtMs: 2000,
  });
  console.log(`\n  ${result.label}`);
  console.log(`    첫 /g/collect : ${result.firstHit == null ? '전송 없음' : `${result.firstHit}ms`}`);
  console.log(`    전송된 이벤트 : ${result.delivered.length ? result.delivered.join(', ') : '없음 (손실)'}`);
}

for (const server of servers) {
  server.close();
}

const allPass = results.every(Boolean);
console.log(`\n총평: ${allPass ? '전부 PASS' : 'FAIL 있음'}`);
process.exit(allPass ? 0 : 1);
