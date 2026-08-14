# 13기 지원 링크 UTM

기본 URL: `https://nycast-13th-recruit-form.vercel.app`

모든 채널의 `utm_campaign`은 `13th_recruit`로 통일합니다. GA4에서 채널 비교는 `utm_source` / `utm_medium`으로 합니다.

복붙할 때 앞뒤 공백·줄바꿈을 넣지 마세요.

## 규칙

| 파라미터 | 값 | 의미 |
|----------|----|------|
| `utm_source` | 채널 영문 슬러그 | 어디서 왔는지 |
| `utm_medium` | 매체 유형 | 어떤 종류의 유입인지 |
| `utm_campaign` | `13th_recruit` | 이번 모집 캠페인 |
| `utm_content` | 소재 구분 (선택) | 같은 채널의 게시물·영상 구분 |

`utm_medium`은 아래만 사용합니다.

| medium | 쓰는 곳 |
|--------|---------|
| `community` | 링커리어, 에브리타임, 캠퍼스픽 |
| `organic` | 네이버 블로그 |
| `video` | 유튜브 |

## 채널별 링크

### 링커리어

- source: `linkareer`
- medium: `community`

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=linkareer&utm_medium=community&utm_campaign=13th_recruit&utm_content=job_post
```

### 에브리타임

- source: `everytime`
- medium: `community`

학교별로 `utm_content`만 바꿉니다.

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=everytime&utm_medium=community&utm_campaign=13th_recruit&utm_content=kwangwoon
```

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=everytime&utm_medium=community&utm_campaign=13th_recruit&utm_content=seoultech
```

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=everytime&utm_medium=community&utm_campaign=13th_recruit&utm_content=kookmin
```

### 네이버 블로그

- source: `naver_blog`
- medium: `organic`

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=naver_blog&utm_medium=organic&utm_campaign=13th_recruit&utm_content=recruit_post
```

### 유튜브

- source: `youtube`
- medium: `video`

설명란·고정댓글용:

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=youtube&utm_medium=video&utm_campaign=13th_recruit&utm_content=description
```

영상 카드·고정 댓글을 나누려면:

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=youtube&utm_medium=video&utm_campaign=13th_recruit&utm_content=pinned_comment
```

### 캠퍼스픽

- source: `campuspick`
- medium: `community`

```
https://nycast-13th-recruit-form.vercel.app/?utm_source=campuspick&utm_medium=community&utm_campaign=13th_recruit&utm_content=activity_post
```

## 한눈에 보기

| 채널 | utm_source | utm_medium | utm_campaign | utm_content 예시 |
|------|------------|------------|--------------|------------------|
| 링커리어 | `linkareer` | `community` | `13th_recruit` | `job_post` |
| 에브리타임 | `everytime` | `community` | `13th_recruit` | `kwangwoon` |
| 네이버 블로그 | `naver_blog` | `organic` | `13th_recruit` | `recruit_post` |
| 유튜브 | `youtube` | `video` | `13th_recruit` | `description` |
| 캠퍼스픽 | `campuspick` | `community` | `13th_recruit` | `activity_post` |

## GA4에서 확인

1. 게시 전에 링크를 한 번 직접 열어 DebugView에 `campaign_source`가 맞는지 봅니다.
2. 보고서 → 획득 → 트래픽 획득에서 세션 소스/매체가 `everytime / community`처럼 보여야 합니다.
3. 탐색 퍼널에서 `generate_lead`를 소스별로 쪼개면 채널별 지원 전환이 나옵니다.

QR·단축 URL을 쓸 때도 **최종 도착 URL에 UTM이 남아 있어야** 합니다. 단축 서비스가 쿼리를 지우면 전부 `direct / none`으로 잡힙니다.
