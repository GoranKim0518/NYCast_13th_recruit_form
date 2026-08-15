const ACCOUNT_ID = '0';
const CONTAINER_ID = '0';

const ids = {
  accountId: ACCOUNT_ID,
  containerId: CONTAINER_ID,
};

function customEventTrigger(triggerId, name, eventName) {
  return {
    ...ids,
    triggerId: String(triggerId),
    name,
    type: 'CUSTOM_EVENT',
    customEventFilter: [
      {
        type: 'EQUALS',
        parameter: [
          { type: 'TEMPLATE', key: 'arg0', value: '{{_event}}' },
          { type: 'TEMPLATE', key: 'arg1', value: eventName },
        ],
      },
    ],
  };
}

function dataLayerVariable(variableId, name, key, folderId) {
  return {
    ...ids,
    variableId: String(variableId),
    name,
    type: 'v',
    parentFolderId: String(folderId),
    parameter: [
      { type: 'INTEGER', key: 'dataLayerVersion', value: '2' },
      { type: 'BOOLEAN', key: 'setDefaultValue', value: 'false' },
      { type: 'TEMPLATE', key: 'name', value: key },
    ],
    formatValue: {},
  };
}

function constantVariable(variableId, name, value, folderId) {
  return {
    ...ids,
    variableId: String(variableId),
    name,
    type: 'c',
    parentFolderId: String(folderId),
    parameter: [{ type: 'TEMPLATE', key: 'value', value }],
  };
}

function htmlTag({
  tagId,
  name,
  html,
  triggerId,
  folderId,
  paused = false,
}) {
  return {
    ...ids,
    tagId: String(tagId),
    name,
    type: 'html',
    parentFolderId: String(folderId),
    paused,
    parameter: [
      { type: 'TEMPLATE', key: 'html', value: html },
      { type: 'BOOLEAN', key: 'supportDocumentWrite', value: 'false' },
    ],
    firingTriggerId: [String(triggerId)],
    tagFiringOption: 'ONCE_PER_EVENT',
    monitoringMetadata: { type: 'MAP' },
    consentSettings: { consentStatus: 'NOT_SET' },
  };
}

const FOLDER_DROPOFF = 1;
const FOLDER_CONVERSION = 2;
const FOLDER_VARIABLES = 3;

const TRIGGER = {
  page_view: 1,
  form_view: 2,
  form_start: 3,
  form_engaged: 4,
  input_leave: 5,
  field_completed: 6,
  field_error: 7,
  position_selected: 8,
  submit_attempt: 9,
  form_submit: 10,
  form_submitted: 11,
  generate_lead: 12,
  form_abandon: 13,
  submit_failed: 14,
  form_completed_view: 15,
  section_reached: 16,
  form_disclosure: 17,
};

const DLV_KEYS = [
  ['form_name', 'form_name'],
  ['form_session_id', 'form_session_id'],
  ['engagement_time_msec', 'engagement_time_msec'],
  ['campaign_source', 'campaign_source'],
  ['campaign_medium', 'campaign_medium'],
  ['campaign_name', 'campaign_name'],
  ['campaign_content', 'campaign_content'],
  ['campaign_term', 'campaign_term'],
  ['has_gclid', 'has_gclid'],
  ['has_fbclid', 'has_fbclid'],
  ['position_selected', 'position_selected'],
  ['selected_position', 'selected_position'],
  ['section_name', 'section_name'],
  ['field_name', 'field_name'],
  ['field_filled', 'field_filled'],
  ['field_valid', 'field_valid'],
  ['error_type', 'error_type'],
  ['last_section', 'last_section'],
  ['last_field', 'last_field'],
  ['fields_completed_count', 'fields_completed_count'],
  ['abandon_type', 'abandon_type'],
  ['lead_source', 'lead_source'],
  ['is_completed', 'is_completed'],
  ['disclosure_action', 'disclosure_action'],
  ['disclosure_trigger', 'disclosure_trigger'],
  ['page_path', 'page_path'],
  ['page_location', 'page_location'],
  ['page_title', 'page_title'],
  ['currency', 'currency'],
  ['value', 'value'],
];

const container = {
  exportFormatVersion: 2,
  exportTime: '2026-08-16 01:59:00',
  containerVersion: {
    path: 'accounts/0/containers/0/versions/0',
    accountId: ACCOUNT_ID,
    containerId: CONTAINER_ID,
    containerVersionId: '0',
    name: 'NYCast 13기 지원 폼 제출 완료',
    description:
      '이탈지점(input_leave, form_abandon)과 전환(generate_lead) 분석용. Google 태그(G-)는 넣지 않음. 앱이 GA4로 이미 보냄.',
    container: {
      path: 'accounts/0/containers/0',
      accountId: ACCOUNT_ID,
      containerId: CONTAINER_ID,
      name: 'NYCast 13기 지원 폼',
      publicId: 'GTM-XXXXXXX',
      usageContext: ['WEB'],
    },
    folder: [
      { ...ids, folderId: String(FOLDER_DROPOFF), name: '이탈 분석' },
      { ...ids, folderId: String(FOLDER_CONVERSION), name: '전환 분석' },
      { ...ids, folderId: String(FOLDER_VARIABLES), name: '변수' },
    ],
    builtInVariable: [
      { ...ids, type: 'EVENT', name: 'Event' },
      { ...ids, type: 'PAGE_URL', name: 'Page URL' },
      { ...ids, type: 'PAGE_PATH', name: 'Page Path' },
      { ...ids, type: 'PAGE_HOSTNAME', name: 'Page Hostname' },
      { ...ids, type: 'REFERRER', name: 'Referrer' },
    ],
    trigger: [
      customEventTrigger(TRIGGER.page_view, 'CE - page_view', 'page_view'),
      customEventTrigger(TRIGGER.form_view, 'CE - form_view', 'form_view'),
      customEventTrigger(TRIGGER.form_start, 'CE - form_start', 'form_start'),
      customEventTrigger(
        TRIGGER.form_engaged,
        'CE - form_engaged',
        'form_engaged',
      ),
      customEventTrigger(TRIGGER.input_leave, 'CE - input_leave', 'input_leave'),
      customEventTrigger(
        TRIGGER.field_completed,
        'CE - field_completed',
        'field_completed',
      ),
      customEventTrigger(TRIGGER.field_error, 'CE - field_error', 'field_error'),
      customEventTrigger(
        TRIGGER.position_selected,
        'CE - position_selected',
        'position_selected',
      ),
      customEventTrigger(
        TRIGGER.submit_attempt,
        'CE - submit_attempt',
        'submit_attempt',
      ),
      customEventTrigger(TRIGGER.form_submit, 'CE - form_submit', 'form_submit'),
      customEventTrigger(
        TRIGGER.form_submitted,
        'CE - form_submitted',
        'form_submitted',
      ),
      customEventTrigger(
        TRIGGER.generate_lead,
        'CE - generate_lead',
        'generate_lead',
      ),
      customEventTrigger(
        TRIGGER.form_abandon,
        'CE - form_abandon',
        'form_abandon',
      ),
      customEventTrigger(
        TRIGGER.submit_failed,
        'CE - submit_failed',
        'submit_failed',
      ),
      customEventTrigger(
        TRIGGER.form_completed_view,
        'CE - form_completed_view',
        'form_completed_view',
      ),
      customEventTrigger(
        TRIGGER.section_reached,
        'CE - section_reached',
        'section_reached',
      ),
      customEventTrigger(
        TRIGGER.form_disclosure,
        'CE - form_disclosure',
        'form_disclosure',
      ),
    ],
    variable: [
      constantVariable(1, 'C - Meta Pixel ID', 'YOUR_META_PIXEL_ID', FOLDER_VARIABLES),
      constantVariable(
        2,
        'C - Kakao Pixel ID',
        'YOUR_KAKAO_PIXEL_ID',
        FOLDER_VARIABLES,
      ),
      ...DLV_KEYS.map(([label, key], index) =>
        dataLayerVariable(index + 3, `DLV - ${label}`, key, FOLDER_VARIABLES),
      ),
    ],
    tag: [
      htmlTag({
        tagId: 1,
        name: '이탈 분석 - input_leave',
        folderId: FOLDER_DROPOFF,
        triggerId: TRIGGER.input_leave,
        html: `<script>
(function () {
  window.__nycastGtm = window.__nycastGtm || [];
  window.__nycastGtm.push({
    type: 'input_leave',
    field_name: '{{DLV - field_name}}',
    section_name: '{{DLV - section_name}}',
    field_filled: '{{DLV - field_filled}}',
    field_valid: '{{DLV - field_valid}}',
    error_type: '{{DLV - error_type}}',
    position_selected: '{{DLV - position_selected}}'
  });
})();
</script>`,
      }),
      htmlTag({
        tagId: 2,
        name: '이탈 분석 - form_abandon',
        folderId: FOLDER_DROPOFF,
        triggerId: TRIGGER.form_abandon,
        html: `<script>
(function () {
  window.__nycastGtm = window.__nycastGtm || [];
  window.__nycastGtm.push({
    type: 'form_abandon',
    last_field: '{{DLV - last_field}}',
    last_section: '{{DLV - last_section}}',
    abandon_type: '{{DLV - abandon_type}}',
    fields_completed_count: '{{DLV - fields_completed_count}}',
    position_selected: '{{DLV - position_selected}}'
  });
})();
</script>`,
      }),
      htmlTag({
        tagId: 3,
        name: '전환 분석 - generate_lead',
        folderId: FOLDER_CONVERSION,
        triggerId: TRIGGER.generate_lead,
        html: `<script>
(function () {
  window.__nycastGtm = window.__nycastGtm || [];
  window.__nycastGtm.push({
    type: 'generate_lead',
    position_selected: '{{DLV - position_selected}}',
    lead_source: '{{DLV - lead_source}}',
    campaign_source: '{{DLV - campaign_source}}',
    campaign_medium: '{{DLV - campaign_medium}}',
    campaign_content: '{{DLV - campaign_content}}'
  });
})();
</script>`,
      }),
      htmlTag({
        tagId: 4,
        name: 'Meta Pixel - Lead',
        folderId: FOLDER_CONVERSION,
        triggerId: TRIGGER.generate_lead,
        paused: true,
        html: `<script>
if (typeof fbq === 'function') {
  fbq('track', 'Lead', {
    content_name: 'nycast_13th_recruit',
    content_category: '{{DLV - position_selected}}'
  });
}
</script>`,
      }),
      htmlTag({
        tagId: 5,
        name: 'Kakao Pixel - Conversion',
        folderId: FOLDER_CONVERSION,
        triggerId: TRIGGER.generate_lead,
        paused: true,
        html: `<script>
if (typeof kakaoPixel === 'function') {
  kakaoPixel('{{C - Kakao Pixel ID}}').conversion();
}
</script>`,
      }),
      htmlTag({
        tagId: 6,
        name: 'Meta Pixel - PageView',
        folderId: FOLDER_CONVERSION,
        triggerId: TRIGGER.page_view,
        paused: true,
        html: `<script>
!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', '{{C - Meta Pixel ID}}');
fbq('track', 'PageView');
</script>`,
      }),
    ],
  },
};

process.stdout.write(`${JSON.stringify(container, null, 2)}\n`);
