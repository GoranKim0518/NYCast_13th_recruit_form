import { chromium, devices } from 'playwright';

const BASE = process.env.QA_BASE_URL ?? 'http://127.0.0.1:5175';

// 카카오톡 iOS 인앱 브라우저(WKWebView) UA + iPhone SE3 해상도
const KAKAO_IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.5.0';

const SE3 = {
  ...devices['iPhone SE'],
  userAgent: KAKAO_IOS_UA,
  viewport: { width: 375, height: 667 },
  deviceScaleFactor: 2,
  isMobile: true,
  hasTouch: true,
};

const THIRD_PARTY = [
  '**cdn.jsdelivr.net**',
  '**www.googletagmanager.com**',
  '**google-analytics.com**',
];

async function run({ label, hangThirdParty, blockStorage, blockCrypto }) {
  const browser = await chromium.launch();
  const context = await browser.newContext(SE3);
  const page = await context.newPage();

  if (blockStorage) {
    // 인앱 브라우저/쿠키 차단 환경: storage 접근 자체가 throw한다.
    await page.addInitScript(() => {
      for (const key of ['localStorage', 'sessionStorage']) {
        Object.defineProperty(window, key, {
          configurable: true,
          get() {
            throw new DOMException('blocked', 'SecurityError');
          },
        });
      }
    });
  }

  if (blockCrypto) {
    // 구형 WebKit: crypto.randomUUID 없음
    await page.addInitScript(() => {
      delete window.crypto.randomUUID;
    });
  }

  const errors = [];
  page.on('pageerror', (error) => errors.push(String(error)));

  let loadFired = false;
  const thirdPartyBeforeLoad = [];
  page.on('request', (request) => {
    const url = request.url();
    if (loadFired || url.startsWith(BASE)) {
      return;
    }
    if (/^https?:\/\//.test(url)) {
      thirdPartyBeforeLoad.push(url);
    }
  });
  page.on('load', () => {
    loadFired = true;
  });

  if (hangThirdParty) {
    // 응답을 절대 주지 않아 CDN 차단/타임아웃 상황을 그대로 재현한다.
    for (const pattern of THIRD_PARTY) {
      await page.route(pattern, () => {});
    }
  }

  const started = Date.now();
  await page.goto(BASE, { waitUntil: 'commit' });

  // 첫 화면이 실제로 그려지는지 (무한 흰 화면 여부)
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 8000 });
  const paintedMs = Date.now() - started;

  // 카카오톡 로딩바가 사라지는 기준: window.load
  let loadMs = null;
  try {
    await page.waitForLoadState('load', { timeout: 12000 });
    loadMs = Date.now() - started;
  } catch {
    loadMs = null;
  }

  const state = await page.evaluate(() => ({
    readyState: document.readyState,
    rootChildren: document.getElementById('root')?.childElementCount ?? 0,
    hasHeading: Boolean(document.querySelector('h1')),
  }));

  const ok =
    loadMs !== null &&
    state.readyState === 'complete' &&
    state.rootChildren > 0 &&
    thirdPartyBeforeLoad.length === 0;

  console.log(`\n[${label}]`);
  console.log(`  first paint (h1 visible) : ${paintedMs}ms`);
  console.log(`  window.load              : ${loadMs === null ? 'FIRED 안 됨 (무한로딩)' : `${loadMs}ms`}`);
  console.log(`  document.readyState      : ${state.readyState}`);
  console.log(`  #root 자식 노드           : ${state.rootChildren}`);
  console.log(
    `  load 이전 외부 요청       : ${thirdPartyBeforeLoad.length ? thirdPartyBeforeLoad.join(' | ') : '없음'}`,
  );
  console.log(`  pageerror                : ${errors.length ? errors.join(' | ') : '없음'}`);
  console.log(`  결과                      : ${ok ? 'PASS' : 'FAIL'}`);

  await browser.close();
  return ok && errors.length === 0;
}

// GA4 초기화를 load 이후로 미뤘으므로, 그 전에 발생한 이벤트가 큐를 통해
// 실제로 전송되는지 확인한다.
async function runGa4QueueCheck() {
  const browser = await chromium.launch();
  const context = await browser.newContext(SE3);
  const page = await context.newPage();

  const collected = [];
  page.on('request', (request) => {
    const url = request.url();
    if (url.includes('google-analytics.com/g/collect') || url.includes('/g/collect')) {
      const params = new URL(url).searchParams;
      collected.push(params.get('en') ?? 'page_view');
    }
  });

  await page.goto(BASE, { waitUntil: 'load' });

  // 지원분야 라디오는 기본 정보가 채워질 때까지 잠겨 있다.
  const basicInfo = {
    name: '홍길동',
    birth_date: '20000101',
    academic_info: '노원고 3학년',
    residence: '서울시 노원구',
    activity_location: '노원구',
    phone: '010-1234-5678',
    email: 'qa@example.com',
    inspiration_source: '인스타그램',
  };

  for (const [field, value] of Object.entries(basicInfo)) {
    await page.locator(`#${field}`).fill(value);
    await page.locator(`#${field}`).blur();
  }

  await page.locator('label[for="position-디자이너"]').click();
  await page.waitForTimeout(1500);

  const positionChecked = await page
    .locator('#position-디자이너')
    .isChecked();

  // GA4 gtag는 이벤트를 배칭하므로 이탈 시점에 강제로 플러시한다.
  await page.evaluate(() => {
    document.dispatchEvent(new Event('visibilitychange'));
    window.dispatchEvent(new Event('pagehide'));
  });
  await page.waitForTimeout(2500);

  const dataLayerEvents = await page.evaluate(() =>
    (window.dataLayer || [])
      .map((entry) => (entry && entry.event) || null)
      .filter(Boolean),
  );

  const expected = ['page_view', 'position_selected'];
  const missingFromCode = expected.filter((name) => !dataLayerEvents.includes(name));
  const sentToGa4 = expected.filter((name) => collected.includes(name));
  const ok =
    positionChecked && missingFromCode.length === 0 && sentToGa4.length > 0;

  console.log('\n[GA4 이벤트 큐 검증]');
  console.log(`  지원분야 선택  : ${positionChecked ? 'OK' : '실패'}`);
  console.log(`  dataLayer 기록 : ${dataLayerEvents.length ? [...new Set(dataLayerEvents)].join(', ') : '없음'}`);
  console.log(`  GA4 전송 확인  : ${collected.length ? [...new Set(collected)].join(', ') : '없음'}`);
  console.log(`  코드 누락      : ${missingFromCode.length ? missingFromCode.join(', ') : '없음'}`);
  console.log(`  결과           : ${ok ? 'PASS' : 'FAIL'}`);

  await browser.close();
  return ok;
}

const results = [];
results.push(await run({ label: '정상 네트워크', hangThirdParty: false }));
results.push(await run({ label: '외부 CDN 무응답 (카카오톡 최악 케이스)', hangThirdParty: true }));
results.push(await run({ label: 'storage 접근 차단', blockStorage: true }));
results.push(await run({ label: 'crypto.randomUUID 미지원 (구형 WebKit)', blockCrypto: true }));
results.push(await runGa4QueueCheck());

// 웹폰트가 같은 출처에서 첫 페인트 시점에 이미 적용되는지 확인한다.
async function runWebfontCheck() {
  const browser = await chromium.launch();

  const cases = [
    { label: '모바일 (iPhone SE3 / 카카오톡)', options: SE3 },
    { label: 'PC (1440x900)', options: { viewport: { width: 1440, height: 900 } } },
  ];

  let allOk = true;

  for (const { label, options } of cases) {
    const context = await browser.newContext(options);
    const page = await context.newPage();
    const errors = [];
    page.on('pageerror', (error) => errors.push(String(error)));

    const fontRequests = [];
    page.on('request', (request) => {
      if (request.url().endsWith('.woff2')) {
        fontRequests.push(request.url());
      }
    });

    // 첫 페인트 시점(load 이전)에 이미 폰트가 실제로 쓰이는지 본다.
    await page.goto(BASE, { waitUntil: 'domcontentloaded' });
    const readyAtFirstPaint = await page
      .waitForFunction(
        () => document.fonts.check('1em "Wanted Sans Variable"'),
        null,
        { timeout: 5000 },
      )
      .then(() => true)
      .catch(() => false);

    await page.waitForLoadState('load');

    const crossOrigin = fontRequests.filter((url) => !url.startsWith(BASE));
    const usedFont = await page.evaluate(
      () => getComputedStyle(document.body).fontFamily,
    );
    const headingVisible = await page.locator('h1').first().isVisible();
    const ok =
      readyAtFirstPaint &&
      fontRequests.length > 0 &&
      crossOrigin.length === 0 &&
      headingVisible &&
      errors.length === 0;
    allOk = allOk && ok;

    console.log(`\n[웹폰트 자체 호스팅 — ${label}]`);
    console.log(`  첫 페인트에 폰트 준비  : ${readyAtFirstPaint}`);
    console.log(`  woff2 요청 수          : ${fontRequests.length}`);
    console.log(`  외부 도메인 폰트 요청  : ${crossOrigin.length ? crossOrigin.join(' | ') : '없음'}`);
    console.log(`  body font-family       : ${usedFont}`);
    console.log(`  h1 표시                : ${headingVisible}`);
    console.log(`  pageerror              : ${errors.length ? errors.join(' | ') : '없음'}`);
    console.log(`  결과                   : ${ok ? 'PASS' : 'FAIL'}`);

    await context.close();
  }

  await browser.close();
  return allOk;
}

results.push(await runWebfontCheck());

const allPass = results.every(Boolean);
console.log(`\n총평: ${allPass ? '전부 PASS' : 'FAIL 있음'}`);
process.exit(allPass ? 0 : 1);
