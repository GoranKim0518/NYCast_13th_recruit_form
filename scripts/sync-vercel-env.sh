#!/usr/bin/env bash
# .env → Vercel 환경 변수 동기화 (Production / Preview / Development)
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ENV_FILE="$ROOT/.env"

if [[ ! -f "$ENV_FILE" ]]; then
  echo "❌ .env 파일이 없습니다. cp .env.example .env 후 값을 입력하세요."
  exit 1
fi

set -a
# shellcheck disable=SC1090
source "$ENV_FILE"
set +a

KEYS=(VITE_SUPABASE_URL VITE_SUPABASE_ANON_KEY VITE_GA_MEASUREMENT_ID VITE_GTM_CONTAINER_ID)

for key in "${KEYS[@]}"; do
  value="${!key:-}"
  if [[ -z "$value" ]]; then
    echo "⚠️  $key 가 비어 있어 건너뜁니다."
    continue
  fi

  for target in production preview development; do
    printf '%s' "$value" | npx vercel env add "$key" "$target" --force --yes 2>/dev/null \
      || printf '%s' "$value" | npx vercel env add "$key" "$target" --force
    echo "✅ $key → $target"
  done
done

echo ""
echo "환경 변수 반영을 위해 재배포가 필요합니다:"
echo "  npm run deploy"
