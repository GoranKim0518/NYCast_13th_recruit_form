import { RECRUITMENT_INFO } from './recruitmentInfo';

const {
  email: CONTACT_EMAIL,
  instagram: INSTAGRAM_URL,
  youtube: YOUTUBE_URL,
} = RECRUITMENT_INFO.section2.contact;

function extLink(href, label = href) {
  return `<a href="${href}" target="_blank" rel="noopener noreferrer">${label}</a>`;
}

function mailLink(email = CONTACT_EMAIL) {
  return `<a href="mailto:${email}">${email}</a>`;
}

const SOFTWARE_LIST = `<p>(포토샵, 일러스트레이터, 프리미어, 파이널컷, 피그마, CapCut, Vllo, 나노바나나, 미드저니, 클링, 베오)</p>`;

const STRATEGY_HTML = `<p>아래는 노원유쓰캐스트의 콘텐츠입니다.</p>
<p>인스타그램: ${extLink(INSTAGRAM_URL)}</p>
<p>유튜브: ${extLink(YOUTUBE_URL)}</p>
<ul>
  <li>
    <b>예시 유의사항 (참고용):</b>
    <ul>
      <li><b>SNS 활용:</b> 인스타그램 릴스/숏폼 트렌드 활용, 이벤팅 콘텐츠 등</li>
      <li><b>오프라인/타겟팅:</b> 노원구 지역 연계, 대학생/청소년 타겟 오프라인 홍보 방안</li>
      <li><b>콘텐츠 개선:</b> 채널 톤앤매너, 썸네일/제목 스타일, 타겟 맞춤형 기획 등</li>
    </ul>
  </li>
</ul>
<p>💡 정답이 있는 질문이 아니니, 평소 느꼈던 점이나 재미있는 아이디어를 자유롭게 적어주세요!</p>`;

const PORTFOLIO_CHANNEL_EXAMPLES =
  '개인 블로그, 인스타그램, 유튜브, 노션, 구글 드라이브, 대외활동 포트폴리오 링크 등';

const PORTFOLIO_SUBMIT_HTML = `<ul>
  <li>
    🔗 <strong>온라인 링크 (포트폴리오 / 작업물)</strong>
    <ul>
      <li>${PORTFOLIO_CHANNEL_EXAMPLES}</li>
      <li>여러 개일 경우 줄바꿈(Enter)으로 구분해서 입력해 주세요.</li>
    </ul>
  </li>
  <li>
    ✉️ <strong>메일 제출 (온라인 공유가 어려운 첨부 파일)</strong>
    <ul>
      <li>제출처: ${mailLink()}</li>
      <li>메일 제목 형식: <strong>[노원유쓰캐스트 13기 지원] 지원자 이름_포트폴리오</strong></li>
    </ul>
  </li>
</ul>`;

const EXPERIENCE_HTML = `<p>글, 사진, 음성, 영상 등 다양한 미디어의 <strong>기획, 제작, 홍보</strong>와 관련된 경험이 있다면 공유해 주세요!</p>
${PORTFOLIO_SUBMIT_HTML}`;

const COMMENT_HTML = `<p>그 외 궁금한 내용은 모집 게시물에 댓글이나 ${mailLink()} 메일,
${extLink(INSTAGRAM_URL, '노유캐 인스타그램')} DM 문의 남겨주시면 24시간 내에 답변드립니다(무물보 진행 예정!!)</p>`;

const INFLOW_HINT =
  '포스터, 전단지, 온라인(Instagram, YouTube, 블로그, 에브리타임, 캠퍼스픽, 링커리어 등등)';

export const FIELD_HINTS = {
  academic_info:
    '현재 학생이 아닌 경우: 마지막 학교명과 전공 작성 / 직장인의 경우:  회사명과 직무 작성',
  residence: '거주지 주소를 동까지만 작성해주세요.',
  activity_location:
    '학교나 학원, 회사 등 가장 많은 시간을 보내는 곳',
  phone:
    '입력하신 내용으로 서류 합격자 발표 연락드립니다. 정확하게 작성해주세요.',
  email:
    '입력하신 내용으로 서류 합격자 발표 연락드립니다. 정확하게 작성해주세요.',
  inspiration_source:
    '영감을 주는 레퍼런스 채널(인스타그램, 핀터레스트, 유튜브 등), 책, 음악, 공간, 혹은 자신만의 일상적인 루틴이 있다면 들려주세요.',
  pd_inflow_channel: INFLOW_HINT,
  mkt_inflow_channel: INFLOW_HINT,
  des_inflow_channel: INFLOW_HINT,
};

export const FIELD_HTML = {
  pd_strategy: STRATEGY_HTML,
  mkt_strategy: STRATEGY_HTML,
  pd_experience: EXPERIENCE_HTML,
  mkt_experience: EXPERIENCE_HTML,
  pd_comment: COMMENT_HTML,
  mkt_comment: COMMENT_HTML,
  des_comment: COMMENT_HTML,
  pd_idea: `<p>노원유쓰캐스트에서 '노원구'라는 지역을 기반으로 만들고 싶은 영상 콘텐츠 프로그램 아이디어를 자유롭게 작성해주세요</p>`,
  pd_tools: `${SOFTWARE_LIST}
  <p><b>영상제작/디자인/AI 제작 소프트웨어 중 본인이 활용이 가능한 것 + 실력을 모두 적어주세요.</b></p>`,
  mkt_tools: `${SOFTWARE_LIST}
<p><b>디자인/AI 제작 소프트웨어 중 본인이 활용이 가능한 것 + 실력을 모두 적어주세요.</b></p>`,
  des_challenge: `<p>노원유쓰캐스트 디자인 팀에서는 다음과 같은 다채로운 디자인 작업을 진행합니다.</p>
  <ul>
    <li><strong>이벤트 공지 이미지</strong> (카드뉴스, 이벤트 썸네일 등)</li>
    <li><strong>각종 홍보 이미지</strong> (SNS 홍보 포스터, 메인 포스터 등)</li>
    <li><strong>영상 요소 디자인</strong> (PD 영상 콘텐츠 내 로고, 자막 템플릿 등)</li>
    <li><strong>실물 굿즈 디자인</strong> (스티커, 키링, 마스킹테이프 등 홍보용 굿즈)</li>
  </ul>
  <p>📌 <strong>작성 안내</strong> 위 목록 중 <strong>가장 경험해보고 싶은 디자인 유형 1가지</strong>를 선택하고,
  <b>해당 유형에서 어떤 디자인(콘셉트/아이디어)을 구현해보고 싶은지</b> 자유롭게 적어주세요.</p>`,
  des_portfolio_url: `<p><strong>[첫 페이지에 다룰 줄 아는 툴, 활용 능력(상/중/하), 활동이력 명시 필수]</strong></p>
  <p>다양한 미디어의 <strong>디자인과</strong> 관련된 경험이 있다면 공유해 주세요!</p>
  ${PORTFOLIO_SUBMIT_HTML}`,
};

function pickFieldValue(map, id, override) {
  if (override !== undefined && override !== null && override !== false) {
    return override;
  }

  return map[id];
}

export function getFieldHint(id, hint) {
  return pickFieldValue(FIELD_HINTS, id, hint);
}

export function getFieldHtml(id, html) {
  return pickFieldValue(FIELD_HTML, id, html);
}
