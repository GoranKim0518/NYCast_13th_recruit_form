# GA4 이벤트 명세 · GTM 적용 가이드

이 폼은 SPA입니다. 페이지가 바뀌지 않으므로 GTM에서 클릭·CSS로 폼을 긁으면 안 됩니다.  
앱이 `dataLayer.push({ event, ... })`로 이미 보냅니다. GTM은 **맞춤 이벤트 트리거**만 걸면 됩니다.

```
사용자 행동
  → 앱 코드 (analytics.js)
  → dataLayer.push({ event: '이름', ...파라미터 })
  → GTM 맞춤 이벤트 트리거
  → 픽셀/광고 태그

같은 이벤트를 react-ga4가 GA4로도 직접 보냄 (VITE_GA_MEASUREMENT_ID)
```

**GTM에 Google 태그(구성 태그, `G-` 측정 ID)를 다시 넣지 마세요.** 페이지뷰·전환이 두 번 잡힙니다.

관련: [utm-campaigns.md](./utm-campaigns.md), [ga4-gtm-and-sheets.md](./ga4-gtm-and-sheets.md)

---

## 1. 전송 구조

| 항목 | 값 |
|------|-----|
| `form_name` | `nycast_13th_recruit` |
| 공통 파라미터 | 모든 이벤트에 아래 표가 붙음 |
| PII | 이름, 전화, 이메일, 작성 문구는 보내지 않음 |
| 이탈 | `pagehide` + `transport_type: beacon` (탭 전환은 제외) |

### 모든 이벤트에 붙는 공통 파라미터

| 파라미터 | 예시 | 설명 |
|----------|------|------|
| `event` | `form_view` | GTM 트리거 이름과 동일 |
| `form_name` | `nycast_13th_recruit` | |
| `form_session_id` | UUID | 탭 sessionStorage. PII 아님 |
| `engagement_time_msec` | `12000` | 페이지 연 뒤 경과 ms |
| `campaign_source` | `everytime` | utm_source / 리퍼러 / `direct` |
| `campaign_medium` | `community` | utm_medium / `referral` / `none` |
| `campaign_name` | `13th_recruit` | 없으면 `(not set)` |
| `campaign_content` | `kwangwoon` | 없으면 `(not set)` |
| `campaign_term` | | 없으면 `(not set)` |
| `has_gclid` | `true` / `false` | gclid, wbraid, gbraid |
| `has_fbclid` | `true` / `false` | |

`page_view`만 추가로 `page_path`, `page_location`, `page_title`이 붙습니다.

---

## 2. 수집 이벤트 전체

퍼널 순서:

`page_view` → `form_view` → `form_start` → `position_selected` → `submit_attempt` → `form_submitted` / `generate_lead`

| # | event | 언제 | 추가 파라미터 | 비고 |
|---|--------|------|----------------|------|
| 1 | `page_view` | 앱 초기화 | `page_path`, `page_location`, `page_title` | 쿼리스트링 포함 |
| 2 | `form_view` | 지원서 마운트 | | 커스텀 퍼널 시작 |
| 3 | `form_engaged` | 첫 유효 입력 완료 | | `form_start`와 같이 나감 |
| 4 | `form_start` | 첫 유효 입력 완료 | | GA4 권장 이벤트 |
| 5 | `section_reached` | 섹션 30% 노출, 1회 | `section_name` | `common` `pd` `marketer` `designer` |
| 6 | `field_completed` | 칸을 벗어남 + 값 있음 + 검증 통과 | `field_name`, `section_name` | 빈 칸은 안 나감 |
| 7 | `field_error` | 값 있는데 형식 오류, 또는 제출 검증 실패 | `field_name`, `error_type` | 아래 값 목록 |
| 8 | `position_selected` | 지원분야 라디오 | `position_selected` | 사용자 속성 `selected_position`도 set |
| 9 | `form_disclosure` | 접기/펼치기 | `section_name`, `disclosure_action`, `disclosure_trigger` | |
| 10 | `submit_attempt` | 검증 통과 후 제출 클릭 | `position_selected` | |
| 11 | `form_submit` | 위와 동일 시점 | `form_name`, `position_selected` | GA4 권장 이벤트 |
| 12 | `form_submitted` | DB 저장 성공 | `position_selected`, `is_completed` | **전환** |
| 13 | `generate_lead` | DB 저장 성공 | `currency`, `value`, `lead_source`, `position_selected`, `is_completed` | **전환** |
| 14 | `submit_failed` | 네트워크/서버 오류 | `error_type` | |
| 15 | `form_abandon` | 페이지 이탈 (`pagehide`) | `last_section`, `last_field`, `fields_completed_count`, `position_selected`, `abandon_type` | 제출 성공 시 안 나감. 칸을 안 건드리면 `last_field`는 `(none)` |
| 16 | `draft_restored` | 초안 복원 | | |
| 17 | `draft_cleared` | 제출 후 초안 삭제 | | |
| 18 | `form_completed_view` | 완료 화면 | `is_completed` | |

한 번의 사용자 행동으로 두 개가 나가는 쌍:

- 첫 유효 입력 → `form_engaged` + `form_start`
- 검증 통과 제출 → `submit_attempt` + `form_submit`
- DB 성공 → `form_submitted` + `generate_lead`

### 파라미터 값 목록

**`section_name`**

| 값 | 의미 |
|----|------|
| `common` | 공통 정보 |
| `pd` | PD 문항 |
| `marketer` | 홍보마케터 문항 |
| `designer` | 디자이너 문항 |
| `recruitment_details` | 모집요강 접기 (`form_disclosure`만) |

**`field_name`**

공통: `name`, `birth_date`, `academic_info`, `residence`, `activity_location`, `phone`, `email`, `position`, `inspiration_source`  
PD: `pd_strategy`, `pd_idea`, `pd_tools`, `pd_experience`, `pd_comment`, `pd_inflow_channel`  
마케터: `mkt_strategy`, `mkt_tools`, `mkt_experience`, `mkt_comment`, `mkt_inflow_channel`  
디자이너: `des_challenge`, `des_portfolio_url`, `des_comment`, `des_inflow_channel`

**`error_type` (필드)**

| 값 | 의미 |
|----|------|
| `required` | 제출 시 필수 누락 |
| `pattern` | 전화/이메일 형식 |
| `sanitize` | HTML/스크립트 입력 |

**`error_type` (제출 실패)**

`network`, `rls`, `config`, `unknown` 또는 서버 `code`

**`position_selected`**

`PD` | `홍보마케터` | `디자이너` | `(not set)`

**`abandon_type`**

| 값 | 의미 |
|----|------|
| `empty` | 열기만 하고 나감 |
| `partial` | 하나라도 쓰고 나감 |

**`disclosure_action`:** `open` | `close`  
**`disclosure_trigger`:** `user` | `position_selected` | `validation_error`

**`generate_lead` 전용**

| 파라미터 | 값 |
|----------|-----|
| `currency` | `KRW` |
| `value` | `1` |
| `lead_source` | `campaign_source`와 동일 |
| `is_completed` | `true` |

---

## 3. SPA에서 GTM을 직접 다는 방법

클릭 트리거, 양식 제출 트리거, 요소 노출, 히스토리 변경으로 이 폼을 추적하지 마세요.  
라우팅이 없고, 제출은 `preventDefault`라 GTM 기본 양식 제출이 안 뜹니다.

할 일: **데이터 영역 변수 → 맞춤 이벤트 트리거 → (픽셀) 태그**

### 3.1 컨테이너

1. [tagmanager.google.com](https://tagmanager.google.com/) → 웹 컨테이너
2. ID를 `VITE_GTM_CONTAINER_ID`에 넣고 재배포
3. `index.html`에 GTM 스니펫을 또 넣지 않음 (앱이 주입)

### 3.2 내장 변수

구성 → 내장 변수에서 켭니다.

- Event
- Page URL, Page Path, Page Hostname
- (픽셀용) Referrer

### 3.3 데이터 영역 변수

변수 → 새로 만들기 → **데이터 영역 변수**, 버전 **2**.  
변수 이름은 아래 **데이터 영역 변수 이름**과 같게 둡니다.

| GTM 변수 이름 | 데이터 영역 변수 이름 |
|---------------|----------------------|
| DLV - form_name | `form_name` |
| DLV - form_session_id | `form_session_id` |
| DLV - engagement_time_msec | `engagement_time_msec` |
| DLV - campaign_source | `campaign_source` |
| DLV - campaign_medium | `campaign_medium` |
| DLV - campaign_name | `campaign_name` |
| DLV - campaign_content | `campaign_content` |
| DLV - campaign_term | `campaign_term` |
| DLV - has_gclid | `has_gclid` |
| DLV - has_fbclid | `has_fbclid` |
| DLV - position_selected | `position_selected` |
| DLV - section_name | `section_name` |
| DLV - field_name | `field_name` |
| DLV - error_type | `error_type` |
| DLV - last_section | `last_section` |
| DLV - last_field | `last_field` |
| DLV - fields_completed_count | `fields_completed_count` |
| DLV - abandon_type | `abandon_type` |
| DLV - lead_source | `lead_source` |
| DLV - disclosure_action | `disclosure_action` |
| DLV - disclosure_trigger | `disclosure_trigger` |
| DLV - is_completed | `is_completed` |
| DLV - page_path | `page_path` |
| DLV - page_location | `page_location` |
| DLV - page_title | `page_title` |
| DLV - currency | `currency` |
| DLV - value | `value` |
| DLV - selected_position | `selected_position` |

`selected_position`은 `position_selected` 이벤트 때 dataLayer 루트에도 push됩니다.

### 3.4 맞춤 이벤트 트리거 (명세 전부)

트리거 → 새로 만들기 → **맞춤 이벤트**.  
이벤트 이름은 **정규식 아님**, 아래와 **완전히 동일**.

| 트리거 이름 | 이벤트 이름 | 용도 |
|-------------|-------------|------|
| CE - page_view | `page_view` | 진입, 픽셀 PageView |
| CE - form_view | `form_view` | 퍼널 시작 |
| CE - form_engaged | `form_engaged` | 참여 |
| CE - form_start | `form_start` | 첫 유효 입력 |
| CE - section_reached | `section_reached` | 섹션 노출 |
| CE - field_completed | `field_completed` | 칸 완료 |
| CE - field_error | `field_error` | 검증 실패 |
| CE - position_selected | `position_selected` | 직군 |
| CE - form_disclosure | `form_disclosure` | 접기/펼치기 |
| CE - submit_attempt | `submit_attempt` | 제출 시도 |
| CE - form_submit | `form_submit` | 제출(권장 이벤트명) |
| CE - form_submitted | `form_submitted` | DB 성공 |
| CE - generate_lead | `generate_lead` | **전환 픽셀** |
| CE - submit_failed | `submit_failed` | 제출 실패 |
| CE - form_abandon | `form_abandon` | 이탈 |
| CE - draft_restored | `draft_restored` | 초안 복원 |
| CE - draft_cleared | `draft_cleared` | 초안 삭제 |
| CE - form_completed_view | `form_completed_view` | 완료 화면 |

조건이 필요하면 예:

- 빈 이탈만: `CE - form_abandon` + `{{DLV - abandon_type}}` 같음 `empty`
- PD만 전환: `CE - generate_lead` + `{{DLV - position_selected}}` 같음 `PD`

### 3.5 태그

**넣지 말 것**

- Google 태그 / GA4 구성 (`G-…`)
- GA4 이벤트 태그로 위 이벤트를 다시 보냄  
  → 앱이 이미 GA4로 보냄. 중복됨.

**넣어도 되는 것 (픽셀)**

| 태그 | 유형 | 트리거 |
|------|------|--------|
| Meta Pixel - PageView | 맞춤 HTML | CE - page_view |
| Meta Pixel - Lead | 맞춤 HTML | CE - generate_lead |
| 카카오 픽셀 - 전환 | 맞춤 HTML | CE - generate_lead |
| (선택) 이탈 리타겟 | 맞춤 HTML | CE - form_abandon |

`generate_lead` 한 번만 전환으로 쓰세요. `form_submitted`와 같이 걸면 전환이 두 번입니다.

### 3.6 미리보기 확인

1. GTM 미리보기 → 프로덕션 URL
2. UTM 붙인 링크로 폼 오픈
3. dataLayer 탭에 `page_view`, `form_view`가 있으면 연결됨
4. 이름 칸 채우고 다음 칸 → `field_completed`, `form_start`
5. 직군 선택 → `position_selected`
6. 제출 성공 → `generate_lead` **1회**
7. 작성 중 탭 닫기 → `form_abandon` (미리보기는 이탈 재현이 어려울 수 있음)

SPA History Change 트리거는 이 사이트에서 쓰지 않습니다.

---

## 4. GA4 Admin (보고서가 비지 않게)

앱이 이벤트를 보내도, 아래를 안 하면 탐색에서 차원을 못 씁니다.

1. 데이터 스트림 URL: `https://nycast-13th-recruit-form.vercel.app`
2. 향상된 측정 → **양식 상호작용 OFF**
3. `generate_lead`, `form_submitted` → 핵심 이벤트
4. 맞춤 정의(이벤트 범위)에 등록:

`campaign_source`, `campaign_medium`, `campaign_name`, `campaign_content`, `campaign_term`, `position_selected`, `section_name`, `field_name`, `error_type`, `last_section`, `last_field`, `abandon_type`, `fields_completed_count`, `has_gclid`, `has_fbclid`, `lead_source`, `form_session_id`, `disclosure_action`, `disclosure_trigger`

5. 사용자 범위: `selected_position`
6. `hostname` = `localhost` 세션 제외

탐색 퍼널 권장:

`form_view` → `form_start` → `position_selected` → `submit_attempt` → `generate_lead`

이탈 칸: `form_abandon`을 `last_field`, `abandon_type`으로 쪼갭니다.

---

## 5. 환경 변수

| 변수 | 역할 |
|------|------|
| `VITE_GA_MEASUREMENT_ID` | GA4 직접 전송. 없으면 보고서 비어 있음 |
| `VITE_GTM_CONTAINER_ID` | GTM 로드. 없어도 dataLayer는 쌓임 |

Vite는 빌드 시 값을 넣습니다. Vercel에서 바꾼 뒤 **재배포**해야 합니다.
