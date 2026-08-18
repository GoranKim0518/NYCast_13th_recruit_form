// 두 빌드의 체감 로딩을 비교한다. 각각 정적 서버로 띄우고 네트워크/CPU를 조절해
// FCP, 최종 폰트 적용 시점, window.load(카카오톡 로딩바가 사라지는 시점)를 잰다.
//
// 사용법:
//   git worktree add /tmp/base <ref> && (cd /tmp/base && npm run build)
//   node scripts/perf-compare.mjs /tmp/base/dist dist
//
// 정적 서버가 Vercel처럼 gzip을 적용하지 않으면 느린 회선 수치가 크게 비관적으로
// 나오므로 텍스트 자산은 반드시 압축해서 보낸다.

import http from 'node:http';
import { gzipSync } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';
import { chromium, devices } from 'playwright';

const [baseDir, headDir = 'dist'] = process.argv.slice(2);

if (!baseDir) {
  console.error('사용법: node scripts/perf-compare.mjs <기준-dist> [비교-dist]');
  process.exit(1);
}

const BUILDS = [
  { label: `기준  (${baseDir})`, dir: baseDir, port: 5191 },
  { label: `비교  (${headDir})`, dir: headDir, port: 5192 },
];

// 한국 LTE 실측에 가까운 값과, 지하철/혼잡 셀 같은 최악값
const NETWORKS = [
  { label: 'LTE (20Mbps, RTT 50ms)', downloadThroughput: (20 * 1024 * 1024) / 8, uploadThroughput: (5 * 1024 * 1024) / 8, latency: 50 },
  { label: 'Slow 3G (400kbps, RTT 400ms)', downloadThroughput: (400 * 1024) / 8, uploadThroughput: (400 * 1024) / 8, latency: 400 },
];

const RUNS = 5;
const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.txt']);
const CPU_THROTTLE = 4; // 중급 모바일 기기 근사

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

function serve(dir, port) {
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(dir, urlPath);

    try {
      const info = await stat(filePath);
      if (info.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } catch {
      filePath = path.join(dir, 'index.html');
    }

    try {
      const ext = path.extname(filePath);
      let body = await readFile(filePath);
      const headers = {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      };

      // Vercel과 동일하게 텍스트 자산은 압축해서 보낸다. 압축을 빼면
      // 느린 회선 측정이 실제보다 크게 비관적으로 나온다.
      if (COMPRESSIBLE.has(ext) && /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')) {
        body = gzipSync(body, { level: 9 });
        headers['Content-Encoding'] = 'gzip';
      }

      headers['Content-Length'] = body.byteLength;
      res.writeHead(200, headers);
      res.end(body);
    } catch {
      res.writeHead(404).end();
    }
  });

  return new Promise((resolve) => {
    server.listen(port, '127.0.0.1', () => resolve(server));
  });
}

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

async function measure(browser, port, network) {
  const context = await browser.newContext(SE3);
  const page = await context.newPage();
  const cdp = await context.newCDPSession(page);

  await cdp.send('Network.enable');
  await cdp.send('Network.emulateNetworkConditions', {
    offline: false,
    ...network,
  });
  await cdp.send('Emulation.setCPUThrottlingRate', { rate: CPU_THROTTLE });

  // paint 엔트리는 조회 시점에 누락될 수 있어 옵저버로 직접 받는다.
  await page.addInitScript(() => {
    window.__fcp = null;
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        if (entry.name === 'first-contentful-paint') {
          window.__fcp ??= entry.startTime;
        }
      }
    }).observe({ type: 'paint', buffered: true });
  });

  await page.goto(`http://127.0.0.1:${port}/`, { waitUntil: 'commit' });

  // document.fonts.check()는 매칭되는 @font-face가 없으면 참을 반환하므로
  // FontFace 객체의 status를 직접 본다.
  const fontAppliedPromise = page
    .waitForFunction(
      () => {
        const loaded = Array.from(document.fonts).some(
          (face) =>
            face.family.includes('Wanted Sans') && face.status === 'loaded',
        );
        return loaded ? performance.now() : null;
      },
      null,
      { timeout: 60000, polling: 16 },
    )
    .then((handle) => handle.jsonValue())
    .catch(() => null);

  await page.waitForLoadState('load', { timeout: 60000 });
  const fontAppliedMs = await fontAppliedPromise;

  const metrics = await page.evaluate(() => {
    const nav = performance.getEntriesByType('navigation')[0];
    const resources = performance.getEntriesByType('resource');
    const bytesOf = (predicate) =>
      resources
        .filter(predicate)
        .reduce((sum, entry) => sum + (entry.transferSize || 0), 0);

    return {
      fcp: window.__fcp,
      load: nav ? nav.loadEventStart : null,
      transferred: bytesOf(() => true),
      fontBytes: bytesOf((entry) => entry.name.endsWith('.woff2')),
    };
  });

  await context.close();
  return { ...metrics, fontApplied: fontAppliedMs };
}

function median(values) {
  const sorted = values.filter((value) => value != null).sort((a, b) => a - b);
  if (sorted.length === 0) {
    return null;
  }
  return sorted[Math.floor(sorted.length / 2)];
}

const fmt = (value) => (value == null ? '측정 실패' : `${Math.round(value)}ms`);

const servers = [];
for (const build of BUILDS) {
  servers.push(await serve(build.dir, build.port));
}

const browser = await chromium.launch();

for (const network of NETWORKS) {
  console.log(`\n=== ${network.label} / CPU ${CPU_THROTTLE}x 감속 / ${RUNS}회 중앙값 ===`);

  for (const build of BUILDS) {
    const samples = [];
    for (let i = 0; i < RUNS; i += 1) {
      samples.push(await measure(browser, build.port, network));
    }

    const fcp = median(samples.map((s) => s.fcp));
    const fontApplied = median(samples.map((s) => s.fontApplied));
    const load = median(samples.map((s) => s.load));
    const bytes = median(samples.map((s) => s.transferred));
    const fontBytes = median(samples.map((s) => s.fontBytes));

    const swapMs =
      fcp != null && fontApplied != null ? Math.max(0, fontApplied - fcp) : null;

    console.log(`\n  ${build.label}`);
    console.log(`    FCP (첫 글자 표시)       : ${fmt(fcp)}`);
    console.log(`    최종 폰트 적용           : ${fmt(fontApplied)}`);
    console.log(`    폰트 스왑 노출 시간      : ${fmt(swapMs)}`);
    console.log(`    window.load (카톡 로딩바): ${fmt(load)}`);
    console.log(`    전송량                   : ${bytes ? `${(bytes / 1024).toFixed(0)}KB` : 'n/a'} (폰트 ${fontBytes ? `${(fontBytes / 1024).toFixed(0)}KB` : '0KB'})`);
  }
}

await browser.close();
for (const server of servers) {
  server.close();
}
