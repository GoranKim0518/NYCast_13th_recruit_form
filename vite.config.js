import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  build: {
    // Vite 기본값(baseline-widely-available)은 Safari 16이 하한이다.
    // 카카오톡 iOS는 iOS 15까지 지원하고 구형 안드로이드 웹뷰도 들어오므로
    // 하한을 낮춰 둔다.
    target: ['es2020', 'safari14', 'chrome87', 'firefox78', 'edge88'],
  },
});
