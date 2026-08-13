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
| Analytics | react-ga4 (비식별 메타데이터만) |

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

### 5. 프로덕션 빌드

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

측정 ID(`G-XXXXXXXXXX`)를 `.env`의 `VITE_GA_MEASUREMENT_ID`에 넣은 뒤 `sync-vercel-env.sh` → `npm run deploy` 순서로 재배포해야 Production에 반영됩니다.

### Vercel 환경 변수 (필수)

| 변수 | 설명 |
|------|------|
| `VITE_SUPABASE_URL` | Supabase Project URL |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key |
| `VITE_GA_MEASUREMENT_ID` | GA4 측정 ID |

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

### GA4 PII 방지

전송되는 이벤트 파라미터 (비식별 메타데이터만):

| 이벤트 | 파라미터 |
|--------|----------|
| `position_selected` | `position_selected` (지원 분야명) |
| `step_completed` | `step_name`, `is_completed` |
| `form_submitted` | `step_name`, `is_completed` |

**전송 금지**: 이름, 연락처, 이메일, 작성 텍스트 등 모든 PII

### XSS 방어

- `react-hook-form` 검증 단계에서 HTML/Script 태그 차단
- 제출 전 `sanitizeFormData()`로 입력값 정규화

## 지원서 필드

### 공통 (필수)

이름, 생년월일, 학교명/전공/학번, 거주지, 활동하는 곳, 연락처, 이메일, 지원분야, 영감의 출처

### PD (조건부)

| 필드 | 필수 |
|------|------|
| 홍보 전략/개선점 | 선택 |
| 노원구 기반 프로그램 아이디어 | **필수** |
| 사용 가능한 툴 | 선택 |
| 콘텐츠 제작 경력 | 선택 |
| 마무리 한마디 | 선택 |
| 유입 경로 | **필수** |

### 홍보마케터 (조건부)

| 필드 | 필수 |
|------|------|
| 홍보 전략/개선점 | 선택 |
| 사용 가능한 툴 | 선택 |
| 홍보 관련 경력 | 선택 |
| 마무리 한마디 | 선택 |
| 유입 경로 | **필수** |

### 디자이너 (조건부)

| 필드 | 필수 |
|------|------|
| 도전하고 싶은 디자인 작업 | 선택 |
| 포트폴리오 URL | **필수** |
| 마무리 한마디 | 선택 |
| 유입 경로 | **필수** |

## License

[MIT License](LICENSE)
