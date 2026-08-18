// Wanted Sans(OFL-1.1)를 같은 출처에서 서빙하기 위해 subset woff2와 @font-face CSS를
// 저장소로 가져온다. 외부 CDN을 첫 화면 경로에 두면 카카오톡 iOS 인앱 브라우저에서
// window.load가 끝나지 않아 무한 로딩으로 보이기 때문이다.
//
// 폰트 버전을 올릴 때: scripts/fetch-webfont.mjs의 VERSION을 바꾸고 `node scripts/fetch-webfont.mjs`.

import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const VERSION = 'v1.0.3';
const REPO = 'wanteddev/wanted-sans';
const CDN_DIR = `https://cdn.jsdelivr.net/gh/${REPO}@${VERSION}/packages/wanted-sans/fonts/webfonts/variable/split`;
const CSS_URL = `${CDN_DIR}/WantedSansVariable.min.css`;
const LICENSE_URL = `https://raw.githubusercontent.com/${REPO}/${VERSION}/OFL.txt`;

const ROOT = path.resolve(import.meta.dirname, '..');
const PUBLIC_DIR = path.join(ROOT, 'public/fonts/wanted-sans');
const WOFF2_DIR = path.join(PUBLIC_DIR, 'woff2');
const CSS_OUT = path.join(ROOT, 'src/styles/wanted-sans.css');
const SERVE_PATH = '/fonts/wanted-sans/woff2';

const WOFF2_SIGNATURE = 'wOF2';

async function fetchOrThrow(url) {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`${response.status} ${response.statusText} — ${url}`);
  }
  return response;
}

async function main() {
  await mkdir(WOFF2_DIR, { recursive: true });
  await mkdir(path.dirname(CSS_OUT), { recursive: true });

  const css = await (await fetchOrThrow(CSS_URL)).text();

  const files = [...css.matchAll(/url\("woff2\/([^"]+)"\)/g)].map(
    (match) => match[1],
  );

  if (files.length === 0) {
    throw new Error('CSS에서 woff2 참조를 찾지 못했습니다.');
  }

  let bytes = 0;
  for (const file of files) {
    const buffer = Buffer.from(
      await (await fetchOrThrow(`${CDN_DIR}/woff2/${file}`)).arrayBuffer(),
    );

    if (buffer.subarray(0, 4).toString('latin1') !== WOFF2_SIGNATURE) {
      throw new Error(`woff2 시그니처가 아닙니다: ${file}`);
    }

    await writeFile(path.join(WOFF2_DIR, file), buffer);
    bytes += buffer.byteLength;
  }

  const localCss = css
    // jsDelivr가 붙인 헤더 주석은 출처가 바뀌었으니 제거한다.
    .replace(/^\/\*[\s\S]*?\*\/\s*/, '')
    .replaceAll('url("woff2/', `url("${SERVE_PATH}/`);

  const header = [
    '/*',
    ` * Wanted Sans ${VERSION} — https://github.com/${REPO}`,
    ' * SIL Open Font License 1.1 (public/fonts/wanted-sans/OFL.txt)',
    ' *',
    ' * 자동 생성 파일입니다. 직접 수정하지 말고 `node scripts/fetch-webfont.mjs`를 실행하세요.',
    ' */',
    '',
  ].join('\n');

  await writeFile(CSS_OUT, `${header}${localCss}\n`);

  const license = await (await fetchOrThrow(LICENSE_URL)).text();
  await writeFile(path.join(PUBLIC_DIR, 'OFL.txt'), license);

  console.log(`woff2 ${files.length}개, ${(bytes / 1024 / 1024).toFixed(2)}MB`);
  console.log(`CSS  -> ${path.relative(ROOT, CSS_OUT)}`);
  console.log(`폰트 -> ${path.relative(ROOT, WOFF2_DIR)}`);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
