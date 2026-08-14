# GA4 · GTM 연결 / 스프레드시트 연동

이 폼은 **앱에서 GA4로 이벤트를 직접 보냅니다.** (`VITE_GA_MEASUREMENT_ID` + `react-ga4`)  
GTM은 광고·픽셀용으로만 쓰고, **같은 측정 ID로 GA4 구성 태그를 다시 넣지 마세요.** 페이지뷰·전환이 두 번 잡힙니다.

---

## 1. GTM 연결

이미 GA4 전환·퍼널은 코드가 담당합니다. GTM은 Meta Pixel, 카카오 픽셀, 추가 마케팅 태그가 필요할 때만 붙입니다.

### 컨테이너 만들기

1. [Google Tag Manager](https://tagmanager.google.com/) → 계정 → 컨테이너 만들기
2. 대상: **웹**
3. 컨테이너 ID (`GTM-XXXXXXX`)를 복사합니다

### 사이트에 스니펫 넣기

지금은 GTM 스니펫이 코드에 없습니다. 넣으려면 `index.html`의 `<head>` 안과 `<body>` 바로 아래에 GTM이 안내하는 두 조각을 그대로 붙입니다.

- `<head>`: `gtm.js` 스크립트
- `<body>` 직후: `noscript` iframe

Vercel에 올린 **프로덕션 URL** 기준으로 미리보기·제출합니다.

### GTM에서 하지 말 것

- GA4 구성 태그 (`G-` 측정 ID) 추가 — 앱이 이미 보냄
- GA4 이벤트 태그로 `form_submitted` / `generate_lead` 재전송

### GTM에서 해도 되는 것

- Meta/카카오 픽셀
- 전환 픽셀 (GA4와 다른 도구)
- 동의 배너 이후 픽셀만 켜기

제출 후 미리보기에서 태그가 한 번씩만 나가는지 확인합니다.

---

## 2. GA4 연결

코드 연결은 `.env` / Vercel 환경 변수 `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` 한 줄입니다. 값이 없으면 이벤트는 나가지 않습니다. 변경 후 **재배포**해야 합니다.

### 속성·스트림

1. [Google Analytics](https://analytics.google.com/) → 관리 → 속성 만들기 (없으면)
2. 데이터 스트림 → 웹
3. 스트림 URL:

```
https://nycast-13th-recruit-form.vercel.app
```

4. 측정 ID (`G-…`)를 `.env`와 Vercel Production/Preview에 넣습니다
5. 데이터 스트림 → 향상된 측정 → **양식 상호작용 OFF**  
   (`form_start` / `form_submit`은 코드에서 보냅니다)

### 핵심 이벤트

관리 → 이벤트에서 아래 두 개를 **핵심 이벤트로 표시**합니다.

- `generate_lead` — 마케팅 전환 (권장)
- `form_submitted` — 동일 전환의 커스텀 이름

### 맞춤 정의 (이벤트 범위)

관리 → 맞춤 정의 → 맞춤 측정기준 만들기. 이벤트 매개변수 이름을 그대로 넣습니다.

| 측정기준 이름 | 이벤트 매개변수 |
|---------------|-----------------|
| Campaign source | `campaign_source` |
| Campaign medium | `campaign_medium` |
| Campaign name | `campaign_name` |
| Campaign content | `campaign_content` |
| Position | `position_selected` |
| Section | `section_name` |
| Field | `field_name` |
| Error type | `error_type` |
| Last section | `last_section` |
| Last field | `last_field` |
| Fields completed | `fields_completed_count` |
| Has GCLID | `has_gclid` |
| Has FBCLID | `has_fbclid` |
| Lead source | `lead_source` |
| Form session | `form_session_id` |

사용자 범위 하나:

| 측정기준 이름 | 사용자 속성 |
|---------------|-------------|
| Selected position | `selected_position` |

### 내부 트래픽 제외

관리 → 데이터 스트림 → 더보기 → 내부 트래픽 규칙, 또는 보고서 비교에서 `hostname`이 `localhost`인 세션을 제외합니다.

### 확인

1. GA4 관리 → DebugView
2. 지원 링크에 UTM을 붙인 채로 폼을 엽니다
3. `page_view`, `form_view`가 보이면 연결 성공입니다
4. 테스트 제출 후 `generate_lead`가 보이면 전환까지 연결된 것입니다

채널별 URL은 [`utm-campaigns.md`](./utm-campaigns.md)를 씁니다.

---

## 3. 구글 시트 ↔ Supabase (4시간마다)

anon 키는 **INSERT만** 됩니다. 시트에서 읽으려면 **service_role 키**가 필요합니다. 이 키는 RLS를 우회하므로 시트 셀이 아니라 Apps Script 속성창에만 넣습니다.

### 준비

1. [Google Sheets](https://sheets.google.com)에서 새 스프레드시트 생성 (예: `NYCast 13기 지원서`)
2. Supabase → Project Settings → API
   - Project URL (`https://xxxx.supabase.co`)
   - `service_role` **secret** (anon 아님)
3. 시트 메뉴 **확장 프로그램 → Apps Script**

### 스크립트

아래를 붙여 넣고 저장합니다. 파일 이름 예: `SyncApplications`

```javascript
const SHEET_NAME = 'applications';
const PAGE_SIZE = 1000;

const COLUMNS = [
  'id',
  'created_at',
  'client_submission_id',
  'name',
  'birth_date',
  'academic_info',
  'residence',
  'activity_location',
  'phone',
  'email',
  'position',
  'inspiration_source',
  'pd_strategy',
  'pd_idea',
  'pd_tools',
  'pd_experience',
  'pd_comment',
  'pd_inflow_channel',
  'mkt_strategy',
  'mkt_tools',
  'mkt_experience',
  'mkt_comment',
  'mkt_inflow_channel',
  'des_challenge',
  'des_portfolio_url',
  'des_comment',
  'des_inflow_channel',
];

function getSecrets_() {
  const props = PropertiesService.getScriptProperties();
  const url = props.getProperty('SUPABASE_URL');
  const key = props.getProperty('SUPABASE_SERVICE_ROLE_KEY');

  if (!url || !key) {
    throw new Error(
      '스크립트 속성 SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY를 설정하세요.',
    );
  }

  return { url: url.replace(/\/$/, ''), key };
}

function fetchPage_(baseUrl, key, from, to) {
  const endpoint =
    baseUrl + '/rest/v1/applications?select=*&order=created_at.asc';
  const response = UrlFetchApp.fetch(endpoint, {
    method: 'get',
    headers: {
      apikey: key,
      Authorization: 'Bearer ' + key,
      Range: from + '-' + to,
      Prefer: 'count=exact',
    },
    muteHttpExceptions: true,
  });

  const code = response.getResponseCode();
  if (code !== 200 && code !== 206) {
    throw new Error('Supabase ' + code + ': ' + response.getContentText());
  }

  const rows = JSON.parse(response.getContentText() || '[]');
  const contentRange = response.getHeaders()['Content-Range'] || '';
  const totalMatch = String(contentRange).match(/\/(\d+)$/);
  const total = totalMatch ? Number(totalMatch[1]) : rows.length;

  return { rows, total };
}

function fetchAllApplications_() {
  const { url, key } = getSecrets_();
  const all = [];
  let from = 0;
  let total = Infinity;

  while (from < total) {
    const to = from + PAGE_SIZE - 1;
    const page = fetchPage_(url, key, from, to);
    total = page.total;
    all.push.apply(all, page.rows);
    from += PAGE_SIZE;
    if (page.rows.length === 0) {
      break;
    }
  }

  return all;
}

function rowFromRecord_(record) {
  return COLUMNS.map(function (column) {
    const value = record[column];
    if (value === null || value === undefined) {
      return '';
    }
    return value;
  });
}

function syncApplications() {
  const records = fetchAllApplications_();
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(SHEET_NAME);

  if (!sheet) {
    sheet = ss.insertSheet(SHEET_NAME);
  }

  sheet.clearContents();
  sheet.getRange(1, 1, 1, COLUMNS.length).setValues([COLUMNS]);
  sheet.setFrozenRows(1);

  if (records.length > 0) {
    const values = records.map(rowFromRecord_);
    sheet.getRange(2, 1, values.length, COLUMNS.length).setValues(values);
  }

  const stamp = Utilities.formatDate(
    new Date(),
    'Asia/Seoul',
    'yyyy-MM-dd HH:mm:ss',
  );
  sheet.getRange('A1').setNote('마지막 동기화: ' + stamp + ' / ' + records.length + '건');
}
```

### 비밀 값 넣기

1. Apps Script 왼쪽 **프로젝트 설정**(톱니) → **스크립트 속성**
2. 속성 추가:

| 속성 | 값 |
|------|-----|
| `SUPABASE_URL` | `https://xxxx.supabase.co` |
| `SUPABASE_SERVICE_ROLE_KEY` | service_role secret |

anon public 키를 넣으면 조회가 거부됩니다.

### 권한 · 첫 실행

1. 함수 선택: `syncApplications`
2. **실행** → Google 계정 권한 허용 (스프레드시트, 외부 URL)
3. 시트의 `applications` 탭에 행이 채워지는지 확인합니다

### 4시간마다 돌리기

1. Apps Script 왼쪽 **트리거**(시계)
2. 트리거 추가
3. 설정:

| 항목 | 값 |
|------|-----|
| 실행할 함수 | `syncApplications` |
| 이벤트 소스 | 시간 기반 |
| 시간 기반 트리거 유형 | 시간 간격 타이머 |
| 시간 간격 | **4시간마다** |
| 오류 알림 | 나에게 즉시 알림 (권장) |

타임존은 스크립트/시트를 `아시아/서울`로 맞춥니다. 스프레드시트 **파일 → 설정 → 타임존**.

### 동작 방식

- 매번 시트를 비우고 **전체 목록을 다시 씁니다.** 지원 규모에서는 중복·누락이 가장 적습니다.
- 1000건 단위로 페이지를 가져옵니다.
- 실패하면 트리거 이메일이 옵니다. 키가 바뀌었거나 프로젝트가 일시 정지된 경우가 많습니다.

### 보안

- service_role 키를 시트 칸, GitHub, 채팅에 붙이지 마세요
- 시트 공유는 운영진만, **링크가 있는 모든 사용자**로 열지 마세요
- 담당자가 바뀌면 Supabase에서 service_role을 재발급하고 스크립트 속성을 교체합니다
