export const FIELD_HINTS = {
  academic_info:
    '현재 학생이 아닌 경우: 마지막 학교명과 전공 작성 / 직장인의 경우:  회사명과 직무 작성',
  phone: '010-XXXX-XXXX 형식으로 입력해 주세요.',
  inspiration_source:
    '영감을 주는 레퍼런스 채널(인스타그램, 핀터레스트, 유튜브 등), 책, 음악, 공간, 혹은 자신만의 일상적인 루틴이 있다면 들려주세요.',
  des_portfolio_url:
    'http:// 또는 https:// 로 시작하는 URL을 입력해 주세요.',
  pd_strategy:
    '<i>💡 정답이 있는 질문이 아니니, 평소 느꼈던 점이나 재미있는 아이디어를 자유롭게 적어주시면 됩니다!</i>',
};

FIELD_HINTS.mkt_strategy = FIELD_HINTS.pd_strategy;

export const FIELD_HTML = {
  pd_strategy: `<p>노원유쓰캐스트의 콘텐츠를 더 많은 사람들에게 전달하기 위한 <b>본인만의 홍보 전략/개선점과 그 이유</b>를 자유롭게 제안해 주세요.</p>
<p>인스타그램: <a href="https://instagram.com/nowon_youthcast" target="_blank" rel="noopener noreferrer">https://instagram.com/nowon_youthcast</a></p>
<p>유튜브: <a href="https://www.youtube.com/@nycast" target="_blank" rel="noopener noreferrer">https://www.youtube.com/@nycast</a></p>
<ul>
  <li>
    <b>예시 유의사항 (참고용):</b>
    <ul>
      <li><b>SNS 활용:</b> 인스타그램 릴스/숏폼 트렌드 활용, 이벤팅 콘텐츠 등</li>
      <li><b>오프라인/타겟팅:</b> 노원구 지역 연계, 대학생/청소년 타겟 오프라인 홍보 방안</li>
      <li><b>콘텐츠 개선:</b> 채널 톤앤매너, 썸네일/제목 스타일, 타겟 맞춤형 기획 등</li>
    </ul>
  </li>
</ul>`,
};

FIELD_HTML.mkt_strategy = FIELD_HTML.pd_strategy;

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
