# 노원유쓰캐스트 13기 신입 국원 모집 지원서

노원유쓰캐스트 13기 신입 국원 모집을 위한 Tally 스타일 웹 지원서입니다.  
React + Vite + Tailwind CSS + Supabase + GA4 스택으로 구성되어 있습니다.

## 주요 기능

- **Tally 스타일 UI**: 미니멀하고 문서형 레이아웃, 보라색 액센트
- **직군별 조건부 폼**: PD / 홍보마케터 / 디자이너 선택에 따른 분기
- **보안**: Supabase RLS (INSERT 전용), XSS 입력값 검증, GA4 PII 미수집
- **모바일 최적화**: iOS 자동 줌 방지 (16px), 44px 터치 타겟, Safe Area 대응

## 기술 스택

| 영역 | 기술 |
|------|------|
| Frontend | React 19, Vite 6, Tailwind CSS 4 |
| Form | react-hook-form (Uncontrolled Components) |
| Backend | Supabase (PostgreSQL + RLS) |
| Analytics | react-ga4 + GTM dataLayer (비식별 메타데이터만) |

## 시작하기

### 1. 의존성 설치

```bash
npm install
```

### 2. 환경 변수 설정

`.env.example`을 복사하여 `.env` 파일을 생성합니다.

```bash
cp .env.example .env
```

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX
VITE_GTM_CONTAINER_ID=GTM-XXXXXXX
```

### 3. Supabase 스키마 적용

Supabase Dashboard → SQL Editor에서 `schema.sql` 내용을 실행합니다.

- `applications` 테이블 생성
- RLS 활성화
- `anon` 역할에 **INSERT 전용** 정책 적용 (SELECT/UPDATE/DELETE 차단)

### 4. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 http://localhost:5173/ 접속

### 5. Vercel 배포

> **중요:** Vercel CLI 47.2.2 이상 필요. 구버전(45.x) 사용 시 `icn1::...` 내부 오류 발생.

```bash
# 최신 CLI로 배포 (권장)
npm run deploy

# 또는
npx vercel@latest deploy --prod
```

**Production URL:** https://nycast-13th-recruit-form.vercel.app

#### Vercel 환경 변수 설정 (필수)

Vercel Dashboard → Project → Settings → Environment Variables에 아래 4개를 **Production / Preview / Development** 모두 추가:

| Key | Value |
|-----|-------|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_GA_MEASUREMENT_ID` | GA4 측정 ID (G-XXXXXXXXXX) |
| `VITE_GTM_CONTAINER_ID` | GTM 컨테이너 ID (GTM-XXXXXXX) |

환경 변수 추가 후 **Redeploy**해야 빌드에 반영됩니다.

#### GA4 스트림 설정

GA4 Admin → Data Streams → Web stream URL을 Vercel Production URL로 설정:

```
https://nycast-13th-recruit-form.vercel.app
```

### 6. 프로덕션 빌드

```bash
npm run build
npm run preview
```

## Vercel 배포

**Production URL:** https://nycast-13th-recruit-form.vercel.app

### 배포 (최초 / 재배포)

```bash
npm install
bash scripts/sync-vercel-env.sh   # .env → Vercel 환경 변수 동기화
npm run deploy                    # Production 배포
```

> **icn1 에러 해결:** 구버전 전역 Vercel CLI(`vercel@45`)는 업로드 API가 차단됩니다.  
> `npm run deploy`는 프로젝트 로컬 `vercel@58+`를 사용하므로 `icn1::wgxzr-...` 오류가 발생하지 않습니다.

### GA4 스트림 설정

GA4 Admin → 데이터 스트림 → 웹 URL에 아래 주소를 입력하세요.

```
https://nycast-13th-recruit-form.vercel.app
```

측정 ID(`G-XXXXXXXXXX`)와 GTM ID(`GTM-XXXXXXX`)를 `.env`에 넣은 뒤 `sync-vercel-env.sh` → `npm run deploy` 순서로 재배포해야 Production에 반영됩니다.

### Vercel 환경 변수 (필수)

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_GA_MEASUREMENT_ID` | GA4 측정 ID |
| `VITE_GTM_CONTAINER_ID` | GTM 컨테이너 ID |

Vite는 **빌드 시점**에 `VITE_` 변수를 번들에 포함하므로, 환경 변수 변경 후 반드시 재배포하세요.


### 브랜치 전략

| 브랜치 | 용도 |
|--------|------|
| `main` | 프로덕션 기준 브랜치 |
| `feature/form-ui-setup` | UI/폼 구성 |
| `feature/security-supabase` | RLS, 입력 검증 |
| `feature/ga4-tracking` | GA4 이벤트 |
| `feature/docs` | 문서화 |

### Commit Convention (Conventional Commits)

```
feat: [기능 내용]
fix: [버그 내용]
security: [보안 설정]
style: [스타일 내용]
refactor: [리팩토링 내용]
docs: [문서 내용]
```

## 보안 & 개인정보

### Supabase RLS

- `public` / `anon` 키로는 **INSERT만** 가능
- 타인 지원 데이터 **조회·수정·삭제 불가**
- `client_submission_id` UNIQUE — 제출 중 네트워크가 끊겨도 같은 지원서가 두 번 들어가지 않음

기존 테이블이면 SQL Editor에서 한 번 실행:

```sql
ALTER TABLE public.applications
  ADD COLUMN IF NOT EXISTS client_submission_id UUID;
CREATE UNIQUE INDEX IF NOT EXISTS applications_client_submission_id_uidx
  ON public.applications (client_submission_id);
```

### GA4 마케팅 분석 설정

이벤트 이름·GTM 트리거·UTM·시트 동기화 명세는 로컬 `docs/`에만 둡니다. 공개 저장소에는 포함하지 않습니다.

**전송 금지:** 이름, 연락처, 이메일, 작성 텍스트 등 모든 PII  
**핵심 이벤트(전환):** `generate_lead`

랜딩 URL에 UTM을 붙이면 세션 획득(소스/매체/캠페인)과 모든 이벤트 파라미터에 같이 남습니다.

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=instagram&utm_medium=social&utm_campaign=13th_recruit&utm_content=cardnews
```

#### Admin에서 할 일

1. 데이터 스트림 웹 URL: `https://nycast-13th-recruit-form.vercel.app`
2. 향상된 측정 → **양식 상호작용 OFF** (폼 이벤트는 코드에서 직접 전송)
3. 관리 → 이벤트 → `generate_lead`를 **핵심 이벤트로 표시** (메타 전환도 이것)
4. 관리 → 맞춤 정의에 아래 이벤트 매개변수를 등록 (범위: 이벤트)
5. 관리 → 데이터 필터/비교: `hostname`이 `localhost`인 세션 제외

| 용도 | 매개변수 |
|------|----------|
| 유입 | `campaign_source`, `campaign_medium`, `campaign_name`, `campaign_content`, `campaign_term`, `has_fbclid`, `lead_source` |
| 행동 | `position_selected`, `section_name`, `field_name`, `field_filled`, `field_valid`, `error_type`, `disclosure_action`, `disclosure_trigger` |
| 이탈 | `last_section`, `last_field`, `abandon_type`, `fields_completed_count` |

#### 이벤트

| 이벤트 | 언제 | 비고 |
|--------|------|------|
| `page_view` | 진입 (쿼리스트링 포함) | GA4 획득 보고서에 UTM 반영 |
| `form_view` | 폼 마운트 | 커스텀 퍼널 시작 |
| `form_engaged` / `form_start` | 첫 유효 입력 | `form_start`는 GA4 권장 이벤트 |
| `section_reached` | 섹션 30% 노출, 1회 | |
| `field_completed` | blur + 검증 통과 | |
| `input_leave` | 칸을 벗어남 (빈 칸 포함) | 이탈 칸. `field_name`, `field_filled`, `field_valid` |
| `field_error` | 검증 실패 | |
| `position_selected` | 기본 정보 통과 후 직군 선택 | 이벤트 파라미터로 분석(퍼널 기준). 기본 정보 전에 누르면 이벤트 없음 |
| `submit_attempt` / `form_submit` | **검증 통과 후** 제출 | 유효성 실패는 제외 |
| `form_submitted` / `generate_lead` | DB 저장 성공 | 전환 |
| `submit_failed` | 네트워크/서버 오류 | `offline`, `timeout`, `config` 등 |
| `form_abandon` | 실제 페이지 이탈 (`pagehide`) | 탭 전환 제외, beacon. `abandon_type`: `empty` / `partial` |
| `draft_restored` / `draft_cleared` | 초안 복원/제출 후 삭제 | |
| `form_completed_view` | 완료 화면 | |

Exploration 퍼널:

`form_view → form_start → position_selected → submit_attempt → generate_lead`

- **시도(attempt)**: `submit_attempt`(또는 `form_submit`)
  - 이 이벤트는 **검증 통과 후**에만 찍힙니다.
- **성공(success/전환)**: `generate_lead`(또는 `form_submitted`)
  - DB 저장 성공 이후에 찍히는 전환 이벤트입니다.

- **직군별 퍼널**: 각 step(최소 `submit_attempt`과 `generate_lead`)의 조건에
  이벤트 파라미터 `position_selected` 값을 `PD` / `홍보마케터` / `디자이너`로 필터링해서
  퍼널을 만드세요.

`position_selected`는 기본 정보(이름~영감, 형식 포함)를 통과한 뒤에만 찍힙니다.  
이탈 칸: `input_leave`를 `field_name`으로, `form_abandon`을 `last_field`로 쪼갭니다.

획득 보고서:

`캠페인 소스/매체 → generate_lead`

### XSS 방어

- `react-hook-form` 검증 단계에서 HTML/Script 태그 차단
- 제출 전 `sanitizeFormData()`로 입력값 정규화

## 지원서 필드

작성 순서: **기본 정보 → 지원분야 → 직군 문항**. 지원분야는 기본 정보가 모두 채워져야 선택할 수 있습니다.

### 공통 (필수)

이름, 생년월일, 학교명/전공/학번, 거주지, 활동하는 곳, 연락처, 이메일, 영감의 출처, 지원분야

### PD (조건부)

| 필드 | 필수 |
|------|------|
| 홍보 전략/개선점 | **필수** |
| 노원구 기반 프로그램 아이디어 | **필수** |
| 사용 가능한 툴 | **필수** |
| 콘텐츠 제작 경력 | 선택 |
| 마무리 한마디 | 선택 |
| 유입 경로 | **필수** |

### 홍보마케터 (조건부)

| 필드 | 필수 |
|------|------|
| 홍보 전략/개선점 | **필수** |
| 사용 가능한 툴 | **필수** |
| 홍보 관련 경력 | 선택 |
| 마무리 한마디 | 선택 |
| 유입 경로 | **필수** |

### 디자이너 (조건부)

| 필드 | 필수 |
|------|------|
| 도전하고 싶은 디자인 작업 | **필수** |
| 포트폴리오 | **필수** |
| 마무리 한마디 | 선택 |
| 유입 경로 | **필수** |

## License

[MIT License](LICENSE)
