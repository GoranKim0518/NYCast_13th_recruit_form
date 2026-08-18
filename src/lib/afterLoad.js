// 카카오톡 iOS 인앱 브라우저(WKWebView)는 window.load 전까지 자체 로딩 인디케이터를
// 유지한다. async 스크립트조차 삽입 시점이 load 이전이면 load 이벤트를 지연시키므로,
// 외부 도메인 리소스는 전부 이 헬퍼로 load 이후에 붙인다.
export function runAfterLoad(callback) {
  if (typeof window === 'undefined') {
    return;
  }

  const run = () => window.setTimeout(callback, 0);

  if (document.readyState === 'complete') {
    run();
    return;
  }

  window.addEventListener('load', run, { once: true });
}
