// 빌드 산출물을 재는 테스트용 정적 서버.
// Vercel과 마찬가지로 텍스트 자산을 압축한다. 압축을 빼면 느린 회선 측정이
// 실제 배포보다 크게 비관적으로 나온다.

import http from 'node:http';
import { gzipSync } from 'node:zlib';
import { readFile, stat } from 'node:fs/promises';
import path from 'node:path';

const MIME = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript',
  '.css': 'text/css',
  '.png': 'image/png',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

const COMPRESSIBLE = new Set(['.html', '.js', '.css', '.txt']);

export function serveDist(dir, port) {
  const server = http.createServer(async (req, res) => {
    const urlPath = decodeURIComponent(req.url.split('?')[0]);
    let filePath = path.join(dir, urlPath);

    try {
      const info = await stat(filePath);
      if (info.isDirectory()) {
        filePath = path.join(filePath, 'index.html');
      }
    } catch {
      // SPA 폴백
      filePath = path.join(dir, 'index.html');
    }

    try {
      const ext = path.extname(filePath);
      let body = await readFile(filePath);
      const headers = {
        'Content-Type': MIME[ext] ?? 'application/octet-stream',
        'Cache-Control': 'no-store',
      };

      if (
        COMPRESSIBLE.has(ext) &&
        /\bgzip\b/.test(req.headers['accept-encoding'] ?? '')
      ) {
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

export const KAKAO_IOS_UA =
  'Mozilla/5.0 (iPhone; CPU iPhone OS 17_5_1 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Mobile/15E148 KAKAOTALK 10.5.0';

export const SE3_VIEWPORT = { width: 375, height: 667 };

export const NETWORKS = {
  lte: {
    label: 'LTE (20Mbps, RTT 50ms)',
    downloadThroughput: (20 * 1024 * 1024) / 8,
    uploadThroughput: (5 * 1024 * 1024) / 8,
    latency: 50,
  },
  slow3g: {
    label: 'Slow 3G (400kbps, RTT 400ms)',
    downloadThroughput: (400 * 1024) / 8,
    uploadThroughput: (400 * 1024) / 8,
    latency: 400,
  },
};
