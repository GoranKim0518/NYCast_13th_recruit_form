# GA4 · GTM 연결 / 스프레드시트 연동

이벤트 전체 목록과 GTM 트리거·변수 명세는 [`ga4-event-spec.md`](./ga4-event-spec.md)를 따릅니다.

행동 분석(퍼널·이탈)과 전환 분석(`generate_lead`)은 **둘 다 동작해야** 합니다.

```
폼 이벤트
  ├─ dataLayer.push  →  GTM 트리거·태그 (픽셀, 광고)
  └─ react-ga4       →  GA4 보고서 (퍼널, 획득, 핵심 이벤트)
```

GA4는 `VITE_GA_MEASUREMENT_ID`가 있으면 코드가 직접 보냅니다. GTM은 같은 이벤트를 dataLayer에서 받아 태그를 켭니다. **GTM에 같은 G- 측정 ID로 Google 태그(구성 태그)를 다시 넣지 마세요.** 페이지뷰·전환이 두 번 잡힙니다.

---

## 1. GTM 연결

### 환경 변수

| 변수 | 역할 |
|------|------|
| `VITE_GA_MEASUREMENT_ID` | GA4 행동·전환 분석 (필수) |
| `VITE_GTM_CONTAINER_ID` | GTM 컨테이너 로드 (권장) |

둘 다 `.env`와 Vercel Production/Preview에 넣고 **재배포**합니다. `scripts/sync-vercel-env.sh`가 두 키를 같이 올립니다.

### 컨테이너 만들기

1. [Google Tag Manager](https://tagmanager.google.com/) → 계정 → 컨테이너 만들기
2. 대상: **웹**
3. 컨테이너 ID (`GTM-XXXXXXX`)를 `VITE_GTM_CONTAINER_ID`에 넣습니다

앱이 `gtm.js`와 noscript iframe을 주입합니다. `index.html`에 스니펫을 손으로 또 붙이지 마세요.

프로덕션 URL 기준으로 미리보기·제출합니다.

### 변수 (GTM)

**내장 변수**에서 켭니다: Event, Page URL, Page Path, Page Hostname.

**데이터 영역 변수** (데이터 영역 버전 2). 이름은 코드 매개변수와 같게 둡니다.

| 변수 이름 | 데이터 영역 변수 이름 |
|-----------|----------------------|
| DLV - campaign_source | `campaign_source` |
| DLV - campaign_medium | `campaign_medium` |
| DLV - campaign_name | `campaign_name` |
| DLV - campaign_content | `campaign_content` |
| DLV - position_selected | `position_selected` |
| DLV - section_name | `section_name` |
| DLV - field_name | `field_name` |
| DLV - error_type | `error_type` |
| DLV - last_section | `last_section` |
| DLV - last_field | `last_field` |
| DLV - fields_completed_count | `fields_completed_count` |
| DLV - lead_source | `lead_source` |
| DLV - form_session_id | `form_session_id` |
| DLV - form_name | `form_name` |

### 트리거 (맞춤 이벤트)

트리거 유형: **맞춤 이벤트**. 이벤트 이름은 dataLayer의 `event` 값입니다.

| 트리거 이름 | 이벤트 이름 | 용도 |
|-------------|-------------|------|
| CE - page_view | `page_view` | 진입 |
| CE - form_view | `form_view` | 퍼널 시작 |
| CE - form_start | `form_start` | 첫 유효 입력 |
| CE - position_selected | `position_selected` | 직군 선택 |
| CE - submit_attempt | `submit_attempt` | 제출 시도 |
| CE - generate_lead | `generate_lead` | **전환** |
| CE - form_submitted | `form_submitted` | 전환(커스텀) |
| CE - form_abandon | `form_abandon` | 이탈 |

미리보기에서 `dataLayer` 탭에 위 이름이 보여야 연결입니다.

`position_selected`는 기본 정보(이름~영감)를 통과한 뒤에만 나갑니다. 직군부터 눌러도 이 트리거는 켜지지 않습니다.

로컬에서 GTM/gtag 스크립트가 차단되면 광고 차단기입니다. 미리보기는 프로덕션 URL에서 합니다.

### 태그

**하지 말 것**

- Google 태그 / GA4 구성 태그 (`G-` 측정 ID) — 앱이 이미 보냄
- GA4 이벤트 태그로 `form_submitted` / `generate_lead` 재전송

**해도 되는 것** (전환 픽셀 예시)

| 태그 | 유형 | 트리거 |
|------|------|--------|
| Meta Pixel - PageView | 맞춤 HTML / 픽셀 | All Pages 또는 CE - page_view |
| Meta Pixel - Lead | 맞춤 HTML / 픽셀 | CE - generate_lead |
| 카카오 픽셀 | 맞춤 HTML | CE - generate_lead |

제출 후 미리보기에서 각 태그가 **한 번씩만** 나가는지 확인합니다.

---

## 2. GA4 연결

코드 연결은 `.env` / Vercel 환경 변수입니다.

- `VITE_GA_MEASUREMENT_ID=G-XXXXXXXXXX` — 없으면 GA4로 이벤트가 안 갑니다 (행동·전환 분석 불가)
- `VITE_GTM_CONTAINER_ID=GTM-XXXXXXX` — 없으면 GTM 태그는 안 뜨지만, dataLayer에는 이벤트가 쌓입니다

변경 후 **재배포**해야 합니다.

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
4. 기본 정보를 채운 뒤 직군을 고르면 `position_selected`가 보입니다
5. 테스트 제출 후 `generate_lead`가 보이면 전환까지 연결된 것입니다

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
