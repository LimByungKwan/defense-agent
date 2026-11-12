// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
const AI_SECRET_PATTERN = /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|secret|credential|token|비밀번호|토큰|열쇠|인증키)\s*[:=]\s*\S+)/i;
const safeAiCode = value => typeof value === 'string'
  && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(value)
  && !AI_SECRET_PATTERN.test(value)
  ? value
  : '확인 불가';
const safeAiMessage = value => typeof value === 'string'
  && value.length <= 500
  && !/[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(value)
  ? AI_SECRET_PATTERN.test(value) ? '민감 정보가 포함되어 있어 원문을 표시하지 않습니다.' : value
  : '안전한 오류 메시지를 확인할 수 없습니다.';
const aiErrorGuidance = code => {
  const value = typeof code === 'string' ? code.toUpperCase() : '';
  if (value === 'ON_AI_AUTHORIZATION_CHANGED') return 'AI 이용 권한 내용이 점검 도중 바뀌었습니다. 다시 점검하기 전에 담당자에게 현재 권한을 확인하세요. 이는 학생의 잘못을 뜻하지 않습니다.';
  if (/CANCEL/.test(value)) return '요청이 취소됐습니다. 이전 결과는 현재 결과가 아닙니다.';
  if (/MODEL|NO_MODEL/.test(value)) return '사용할 수 있는 모델이 없습니다. 담당자에게 모델 허용 설정을 확인해 달라고 요청하세요.';
  if (/AUTH|CREDENTIAL|UNAUTHENTICATED/.test(value)) return '인증에 실패했습니다. 계정 연결을 다시 확인하고 담당자에게 앱 권한을 확인해 달라고 요청하세요.';
  if (/ACCESS|FORBIDDEN|DENIED|RESTRICT/.test(value)) return '접근이 제한됐습니다. 계정 연결을 다시 확인하고 담당자에게 확인을 요청하세요.';
  if (/COHORT.*BUDGET|BUDGET|QUOTA|LIMIT_REACHED|USAGE/.test(value)) return '반 사용량 또는 이용 한도에 도달했을 수 있습니다. 담당자에게 확인을 요청하세요.';
  if (/SESSION_CLOSED|OUTSIDE.*HOUR|SCHEDULE|TIME_WINDOW/.test(value)) return '현재 이용 시간이 아닙니다. 이용 시간을 확인하세요.';
  if (/RATE_LIMIT|TOO_MANY|THROTTL/.test(value)) return '요청이 제한됐습니다. 잠시 뒤 사용자가 직접 다시 점검하세요.';
  if (/TIMEOUT|TIME_OUT|NETWORK|CONNECTION|UNAVAILABLE|SERVER_ERROR/.test(value)) return '요청 시간 초과 또는 네트워크 오류일 수 있습니다. 잠시 뒤 사용자가 직접 다시 점검하세요.';
  if (/PROVISION|PENDING|NOT_CONFIGURED|UNVERIFIED|UNKNOWN/.test(value)) return '권한 준비 중이거나 확인할 수 없습니다. 담당자에게 계정 연결과 앱 권한을 확인해 달라고 요청하세요. 이는 학생의 잘못을 뜻하지 않습니다.';
  return '오류 원인을 확인할 수 없습니다. 담당자에게 계정 연결과 앱 권한 확인을 요청하세요.';
};

// ---------- 마무리: 하늘 히어로 배너(정적, 움직임 없음) ----------
// 상태 카드 맨 위의 장식 배너입니다. 왼쪽은 글자, 오른쪽은 종이비행기·종이 산·구름 그림입니다.
// 그림은 모두 div 와 element.style(clipPath 등)로 그리며, 상태 글자와 겹치지 않는 별도 영역입니다.
const HERO_NAVY = '#0d2b5e';

const heroPiece = (parent, styles) => {
  const piece = document.createElement('div');
  Object.assign(piece.style, { position: 'absolute', ...styles });
  parent.append(piece);
  return piece;
};

// 종이비행기: 상자(가로세로 비율 고정) 안에 접힌 면 세 개를 다각형으로 그립니다.
function heroPaperPlane(parent, box, tint = false) {
  const plane = heroPiece(parent, {
    aspectRatio: '16 / 9',
    filter: 'drop-shadow(8px 12px 8px rgba(20, 70, 140, 0.18))',
    ...box,
  });
  const face = (clipPath, background) => heroPiece(plane, { inset: '0', clipPath, background });
  face('polygon(100% 0%, 20% 28%, 32% 70%)', tint ? '#c7dbf3' : '#d7e5f7');
  face('polygon(100% 0%, 32% 70%, 40% 100%)', tint ? '#9dbbe3' : '#a9c3e6');
  face('polygon(100% 0%, 0% 55%, 32% 70%)', tint ? '#eef5fd' : '#ffffff');
  return plane;
}

// 각진 흰 종이 산: 밝은 면과 그늘진 면 두 개
function heroMountain(parent, box) {
  const mountain = heroPiece(parent, { aspectRatio: '2 / 1', ...box });
  heroPiece(mountain, { inset: '0', clipPath: 'polygon(50% 0%, 0% 100%, 58% 100%)', background: 'linear-gradient(180deg, #ffffff, #eef4fc)' });
  heroPiece(mountain, { inset: '0', clipPath: 'polygon(50% 0%, 58% 100%, 100% 100%)', background: 'linear-gradient(180deg, #d9e6f5, #c4d6ee)' });
}

function createSkyHero() {
  const hero = document.createElement('div');
  hero.dataset.studentHero = 'v1';
  Object.assign(hero.style, {
    position: 'relative',
    overflow: 'hidden',
    minHeight: '180px',
    borderRadius: '16px',
    marginBottom: '14px',
    border: '1px solid #d6e6f7',
    // 왼쪽(글자 쪽)은 아주 밝게, 오른쪽(그림 쪽)으로 갈수록 진한 하늘색
    background: 'linear-gradient(100deg, #f6faff 0%, #e4f1fd 40%, #9fd0f6 72%, #3d8de6 100%)',
  });

  // 그림(읽지 않는 장식)
  const art = heroPiece(hero, { top: '0', right: '0', bottom: '0', width: '58%', pointerEvents: 'none' });
  art.setAttribute('aria-hidden', 'true');
  heroPiece(art, { top: '-60px', right: '-40px', width: '220px', height: '220px', borderRadius: '50%', background: 'radial-gradient(circle, rgba(255, 249, 232, 0.75) 0%, rgba(255, 249, 232, 0) 70%)' });
  for (const [left, top, size] of [[18, 22, 4], [34, 12, 3], [52, 30, 4], [70, 16, 3], [86, 38, 4], [44, 48, 3]]) {
    heroPiece(art, { left: `${left}%`, top: `${top}%`, width: `${size}px`, height: `${size}px`, borderRadius: '50%', background: '#ffffff', boxShadow: '0 0 6px 2px rgba(255, 255, 255, 0.7)' });
  }
  heroMountain(art, { right: '30%', bottom: '18px', width: '34%' });
  heroMountain(art, { right: '6%', bottom: '14px', width: '24%' });
  // 점선 비행 궤적
  heroPiece(art, {
    left: '12%', top: '30%', width: '34%', height: '34%',
    border: '2px dashed rgba(255, 255, 255, 0.95)', borderColor: 'rgba(255, 255, 255, 0.95) transparent transparent rgba(255, 255, 255, 0.95)',
    borderRadius: '50%', transform: 'rotate(-18deg)',
  });
  heroPaperPlane(art, { right: '8%', top: '10%', width: '36%' });
  heroPaperPlane(art, { left: '6%', top: '14%', width: '10%' }, true);
  // 아래쪽 뭉게구름
  for (const [left, size, drop] of [[-4, 90, 40], [8, 70, 30], [20, 110, 52], [36, 80, 34], [48, 120, 58], [63, 90, 40], [76, 115, 54], [90, 85, 36]]) {
    heroPiece(art, {
      left: `${left}%`, bottom: `-${drop}px`, width: `${size}px`, height: `${size}px`, borderRadius: '50%',
      background: 'radial-gradient(circle at 50% 30%, #ffffff 55%, #dbe8f6 100%)',
    });
  }

  // 글자(그림과 겹치지 않는 왼쪽)
  const text = document.createElement('div');
  Object.assign(text.style, { position: 'relative', maxWidth: '46%', minWidth: '200px', padding: '26px 28px' });
  const line = (content, styles) => {
    const node = document.createElement('p');
    node.textContent = content;
    Object.assign(node.style, { margin: '0', ...styles });
    text.append(node);
  };
  line('내 PC 보호 대시보드', { color: 'var(--accent, #0a58c2)', fontSize: '14px', fontWeight: '700', letterSpacing: '0.04em' });
  line('보호 현황', { color: HERO_NAVY, fontSize: '32px', fontWeight: '800', lineHeight: '1.25', margin: '6px 0 8px' });
  line('연결·기기·세션·알림을 한눈에', { color: '#24446f', fontSize: '16px' });
  hero.append(text);
  return hero;
}

// ---------- 마무리: 흰 종이 카드(내 카드 8칸 공통 스타일) ----------
// 내가 돌려주는 요소 안에서만 element.style 로 꾸밉니다. 글자·속성·버튼 이름은 바꾸지 않습니다.
// 버튼·입력칸·summary 는 제공 스타일(키보드 포커스 표시 포함)을 그대로 둡니다.
// 흰 종이 카드: 가장 진한 바탕(#f1f7fe)에서도 본문·제목·상태 글자 대비 4.5 이상을 확인했습니다.
const SKY_PAPER_TEXT_TAGS = 'h3, h4, p, ul, ol, details';
const SKY_PAPER_RENDERERS = [
  'renderIdentity', 'renderDecision', 'renderEvents', 'renderStatus',
  'renderVulnerabilities', 'renderAiConnection', 'renderExplanation', 'renderAction',
];
const skyPaperPolished = new WeakSet();

const styleSkyPaperText = node => {
  const keepMargin = node.style.margin !== '' || node.style.marginTop !== '' || node.style.marginBottom !== '';
  if (node.tagName === 'H3') {
    // 진한 남색 제목 + 왼쪽 파란 막대
    node.style.color = '#0d2b5e';
    node.style.fontSize = '20px';
    node.style.fontWeight = '800';
    node.style.borderLeft = '4px solid var(--accent, #0a58c2)';
    node.style.paddingLeft = '10px';
    if (!keepMargin) node.style.margin = '0 0 12px';
  } else if (node.tagName === 'H4') {
    node.style.color = 'var(--accent, #0a58c2)';
    node.style.fontSize = '16px';
    if (!keepMargin) node.style.margin = '18px 0 6px';
  } else if (!keepMargin) {
    node.style.margin = '0 0 8px';
  }
};

const polishSkyPaperTree = node => {
  if (!(node instanceof Element)) return;
  if (node.matches(SKY_PAPER_TEXT_TAGS)) styleSkyPaperText(node);
  for (const child of node.querySelectorAll(SKY_PAPER_TEXT_TAGS)) styleSkyPaperText(child);
};

function applySkyPaper(root) {
  if (skyPaperPolished.has(root)) return;
  skyPaperPolished.add(root);
  Object.assign(root.style, {
    // 흰 종이 카드: 위쪽만 아주 옅은 하늘빛, 넓고 부드러운 파란 그림자
    background: 'linear-gradient(180deg, #f1f7fe 0px, #ffffff 140px)',
    border: '1px solid #d6e6f7',
    borderRadius: '18px',
    boxShadow: '0 12px 32px rgba(16, 76, 160, 0.10), 0 2px 6px rgba(16, 76, 160, 0.06)',
    padding: '20px',
    color: 'var(--text, #1c2430)',
    fontSize: '16px',
    lineHeight: '1.6',
  });
  for (const child of root.children) polishSkyPaperTree(child);
  // 필터·상세 버튼으로 나중에 붙는 내용에도 같은 스타일을 입힙니다.
  // childList·subtree 만 보므로 스타일(속성) 변경은 다시 관찰되지 않습니다.
  if (typeof MutationObserver === 'function') {
    const observer = new MutationObserver(records => {
      for (const record of records) {
        for (const added of record.addedNodes) polishSkyPaperTree(added);
      }
    });
    observer.observe(root, { childList: true, subtree: true });
  }
}

// 한눈 요약용 작은 흰 종이 카드. 앞의 아이콘은 장식이라 따로 span 에 넣고 화면 낭독기가 읽지 않게 합니다.
function createPaperSummaryCard({ glyph, name, level, text }) {
  const box = document.createElement('div');
  Object.assign(box.style, {
    background: '#ffffff',
    border: '1px solid #d6e6f7',
    borderRadius: '16px',
    boxShadow: '0 8px 22px rgba(16, 76, 160, 0.10)',
    padding: '14px',
  });
  const head = document.createElement('div');
  Object.assign(head.style, { display: 'flex', alignItems: 'center', gap: '8px' });
  const tile = document.createElement('span');
  tile.setAttribute('aria-hidden', 'true');
  tile.textContent = glyph;
  Object.assign(tile.style, {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    width: '30px', height: '30px', borderRadius: '10px', flex: '0 0 auto',
    background: 'linear-gradient(180deg, #e6f2fe, #d3e7fb)', color: 'var(--accent, #0a58c2)', fontSize: '16px',
  });
  const nameNode = document.createElement('p');
  nameNode.textContent = name;
  // 한국어 단어 중간에서 줄이 바뀌지 않게 띄어쓰기 단위로만 줄을 바꿉니다.
  Object.assign(nameNode.style, { margin: '0', fontSize: '15px', fontWeight: '700', color: 'var(--accent, #0a58c2)', wordBreak: 'keep-all' });
  head.append(tile, nameNode);
  const levelNode = document.createElement('p');
  levelNode.textContent = level;
  Object.assign(levelNode.style, { margin: '6px 0 4px', fontSize: '18px', fontWeight: '700' });
  const textNode = document.createElement('p');
  textNode.textContent = text;
  textNode.style.margin = '0';
  box.append(head, levelNode, textNode);
  return box;
}

// 8개 함수를 감쌉니다. 결과가 Element 일 때만 꾸미고, 글자·null 은 그대로 돌려주며 예외는 그대로 던집니다.
function withSkyPaper(view) {
  for (const name of SKY_PAPER_RENDERERS) {
    const original = view[name];
    if (typeof original !== 'function') continue;
    view[name] = function skyPaperRender(...args) {
      const output = original.apply(this, args);
      if (output instanceof Element) applySkyPaper(output);
      return output;
    };
  }
  return view;
}

export function createStudentView() {
  return withSkyPaper({
    renderIdentity({ me, devices, sessions } = {}) {
      const root = document.createElement('section');
      const title = document.createElement('h3');
      title.textContent = '로그인 사용자·기기·세션';
      root.append(title);

      const modeLabels = {
        connected: '연결됨 (connected)',
        demo: '예제 자료 (demo)',
        disconnected: '연결 없음 (disconnected)',
        unknown: '확인 불가 (unknown)',
      };
      const deviceLabels = {
        compliant: '보안 기준 충족',
        noncompliant: '보안 기준 미충족',
        unknown: '확인 불가',
      };
      const sessionLabels = {
        active: '활성',
        expired: '만료',
        revoked: '철회됨',
        unknown: '확인 불가',
      };

      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };
      const valueText = value => typeof value === 'string' ? value : '확인 불가';
      const addMode = (parent, resource) => {
        const mode = resource && Object.hasOwn(modeLabels, resource.mode) ? resource.mode : 'unknown';
        addText(parent, 'p', `연결 모드: ${modeLabels[mode]}`);
      };
      const addStatus = (parent, resource, showData) => {
        if (resource?.status === 'loading') {
          addText(parent, 'p', '불러오는 중 (loading)');
        } else if (resource?.status === 'error') {
          const code = resource.error?.code;
          const label = code === 'CONTRACT_MISMATCH' || code === 'ENGINE_RESULT_UNVERIFIED' ? '확인 불가' : '연결 실패';
          const message = typeof resource.error?.message === 'string' ? resource.error.message : '오류 메시지가 없습니다.';
          addText(parent, 'p', `${label}: ${message}`);
        } else if (resource?.status === 'ok') {
          showData(parent, resource.data);
        } else {
          addText(parent, 'p', `확인 불가: 상태를 확인할 수 없습니다 (${valueText(resource?.status)})`);
        }
      };
      // 상세 근거: 기존 세 묶음 원문은 글자를 바꾸지 않고 이 펼치기 안에 둡니다.
      const detailBox = document.createElement('details');
      const detailSummary = document.createElement('summary');
      detailSummary.textContent = '상세 근거 펼치기 (사용자·기기·세션 원문)';
      detailBox.append(detailSummary);
      const addGroup = (label, resource, showData) => {
        const group = document.createElement('section');
        addText(group, 'h4', label);
        addMode(group, resource);
        addStatus(group, resource, showData);
        detailBox.append(group);
      };
      const formatState = (value, labels) => {
        const key = typeof value === 'string' && Object.hasOwn(labels, value) ? value : 'unknown';
        return `${labels[key]} (${key})`;
      };

      // ---------- 마무리: 한눈 요약 → 다음 할 일 → 상세 근거 ----------
      // 받은 자료만 요약합니다. 실패·확인 불가는 정상으로 바꾸지 않고 요약에도 그대로 보입니다.
      const resources = [
        { name: '로그인 사용자', glyph: '👤', resource: me },
        { name: '기기 목록', glyph: '▭', resource: devices },
        { name: '세션 목록', glyph: '⧗', resource: sessions },
      ];
      const errorLabel = resource => {
        const code = resource?.error?.code;
        return code === 'CONTRACT_MISMATCH' || code === 'ENGINE_RESULT_UNVERIFIED' ? '확인 불가' : '연결 실패';
      };
      const summarizeRows = (data, labels, warnKeys, okKey, emptyText, unit) => {
        if (!Array.isArray(data)) return { level: '? 확인 불가', text: '자료 형식을 확인할 수 없습니다.' };
        if (data.length === 0) return { level: '○ 없음', text: emptyText };
        const states = data.map(row => typeof row?.status === 'string' && Object.hasOwn(labels, row.status) ? row.status : 'unknown');
        const warnCount = states.filter(state => warnKeys.includes(state)).length;
        const unknownCount = states.filter(state => state === 'unknown').length;
        if (warnCount > 0) return { level: '▲ 주의', text: `확인 필요 ${warnCount}${unit} / 전체 ${states.length}${unit}` };
        if (unknownCount > 0) return { level: '? 확인 불가', text: `확인 불가 ${unknownCount}${unit} / 전체 ${states.length}${unit}` };
        return { level: '● 정상', text: `전체 ${states.length}${unit} ${labels[okKey]} (${okKey})` };
      };
      const okSummaries = {
        '로그인 사용자': data => ({
          level: typeof data?.user?.label === 'string' ? data.user.label : '? 확인 불가',
          text: `기기 ${formatState(data?.device?.status, deviceLabels)} · 세션 ${formatState(data?.session?.status, sessionLabels)}`,
        }),
        '기기 목록': data => summarizeRows(data, deviceLabels, ['noncompliant'], 'compliant', '표시할 기기 정보가 없습니다.', '대'),
        '세션 목록': data => summarizeRows(data, sessionLabels, ['expired', 'revoked'], 'active', '표시할 세션 정보가 없습니다.', '개'),
      };
      const summarizeResource = ({ name, resource }) => {
        if (resource?.status === 'loading') return { level: '… 불러오는 중', text: '조회 중입니다. 이전 값은 표시하지 않습니다.' };
        if (resource?.status === 'error') return { level: '? 확인 불가', text: errorLabel(resource) };
        if (resource?.status === 'ok') return okSummaries[name](resource.data);
        return { level: '? 확인 불가', text: '상태를 확인할 수 없습니다.' };
      };

      const summaryBox = document.createElement('section');
      summaryBox.setAttribute('aria-label', '로그인 사용자·기기·세션 한눈 요약');
      // 연결 모드: 셋이 같으면 한 번만, 다르면 각각 적습니다.
      const modeKeys = resources.map(({ resource }) => resource && Object.hasOwn(modeLabels, resource.mode) ? resource.mode : 'unknown');
      if (modeKeys.every(key => key === modeKeys[0])) {
        addText(summaryBox, 'p', `연결 모드: ${modeLabels[modeKeys[0]]}`);
      } else {
        addText(summaryBox, 'p', `연결 모드: ${resources.map(({ name }, index) => `${name} ${modeLabels[modeKeys[index]]}`).join(' · ')}`);
      }

      addText(summaryBox, 'h4', '한눈 요약');
      const cardRow = document.createElement('div');
      Object.assign(cardRow.style, { display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' });
      const summaries = resources.map(item => ({ ...item, ...summarizeResource(item) }));
      for (const item of summaries) cardRow.append(createPaperSummaryCard(item));
      summaryBox.append(cardRow);

      // 실패 이유 묶기: 같은 구분·같은 메시지는 한 줄로(원문은 상세 근거에 그대로)
      const failures = new Map();
      for (const { name, resource } of resources) {
        if (resource?.status !== 'error') continue;
        const label = errorLabel(resource);
        const message = safeAiMessage(typeof resource.error?.message === 'string' ? resource.error.message : '오류 메시지가 없습니다.');
        const key = `${label}\u0000${message}`;
        if (!failures.has(key)) failures.set(key, { label, message, names: [] });
        failures.get(key).names.push(name);
      }
      if (failures.size > 0) {
        const failedCount = [...failures.values()].reduce((sum, group) => sum + group.names.length, 0);
        addText(summaryBox, 'h4', `실패 이유 (${failedCount}곳 → ${failures.size}줄)`);
        const failureList = document.createElement('ul');
        for (const group of failures.values()) addText(failureList, 'li', `${group.label} (${group.names.join('·')}): ${group.message}`);
        summaryBox.append(failureList);
      }

      // 다음 할 일
      const nextSteps = [];
      if (modeKeys.includes('disconnected')) {
        nextSteps.push('회사 서버(기존 엔진)에 연결하지 않은 기본 실행이라 사용자·기기·세션이 확인 불가로 보입니다. 앱 고장이 아닙니다. 실제 연결에는 담당자가 발급하는 설정이 필요합니다.');
      } else if (failures.size > 0) {
        nextSteps.push('불러오지 못한 자료가 있습니다. 위쪽 「다시 불러오기」 버튼을 직접 눌러 다시 조회하세요. 자동으로 다시 요청하지 않습니다.');
      }
      if (modeKeys.includes('demo')) nextSteps.push('지금 보이는 값은 예제 자료(demo)이며 실제 조회 결과가 아닙니다.');
      if (modeKeys.includes('unknown') && !modeKeys.includes('disconnected')) nextSteps.push('연결 상태를 확인할 수 없습니다. 위쪽 「다시 불러오기」 버튼을 직접 눌러 다시 조회하세요.');
      if (summaries.some(item => item.level === '▲ 주의')) nextSteps.push('확인이 필요한 기기 또는 세션이 있습니다. 아래 「상세 근거」를 펼쳐 어느 항목인지 확인하세요.');
      if (nextSteps.length === 0) nextSteps.push('지금 따로 할 일은 없습니다. 새 값을 보려면 위쪽 「다시 불러오기」를 직접 누르세요.');
      addText(summaryBox, 'h4', '다음 할 일');
      const stepList = document.createElement('ul');
      for (const step of nextSteps) addText(stepList, 'li', step);
      summaryBox.append(stepList);
      addText(summaryBox, 'p', '요약은 아래 원문 자료로만 만들었습니다. 확인 불가는 정상이나 안전을 뜻하지 않습니다.');
      root.append(summaryBox);

      addGroup('현재 로그인 사용자·기기·세션', me, (group, data) => {
        addText(group, 'p', `사용자: ${valueText(data?.user?.label)} (ID: ${valueText(data?.user?.id)})`);
        addText(group, 'p', `현재 기기: ${valueText(data?.device?.label)} (ID: ${valueText(data?.device?.id)})`);
        addText(group, 'p', `기기 보안 상태: ${formatState(data?.device?.status, deviceLabels)}`);
        addText(group, 'p', `현재 세션 ID: ${valueText(data?.session?.id)}`);
        addText(group, 'p', `세션 상태: ${formatState(data?.session?.status, sessionLabels)}`);
      });

      addGroup('기기 목록', devices, (group, data) => {
        if (!Array.isArray(data) || data.length === 0) {
          addText(group, 'p', '표시할 기기 정보가 없습니다.');
          return;
        }
        const list = document.createElement('ul');
        for (const device of data) {
          const item = document.createElement('li');
          item.textContent = `${valueText(device?.label)} (ID: ${valueText(device?.id)}) · ${formatState(device?.status, deviceLabels)}`;
          list.append(item);
        }
        group.append(list);
      });

      addGroup('세션 목록', sessions, (group, data) => {
        if (!Array.isArray(data) || data.length === 0) {
          addText(group, 'p', '표시할 세션 정보가 없습니다.');
          return;
        }
        const list = document.createElement('ul');
        for (const session of data) {
          const item = document.createElement('li');
          item.textContent = `세션 ID: ${valueText(session?.id)} · ${formatState(session?.status, sessionLabels)}`;
          list.append(item);
        }
        group.append(list);
      });

      root.append(detailBox);
      return root;
    },
    renderDecision({ status, mode, data, error, appId } = {}) {
      const root = document.createElement('section');
      const addText = (tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        root.append(node);
      };

      if (status === 'idle') {
        addText('p', '업무 앱을 선택하고 접속을 요청하세요 (idle)');
        return root;
      }
      if (status === 'loading') {
        addText('p', '판정 확인 중 (loading)');
        return root;
      }
      if (status === 'error') {
        const message = typeof error?.message === 'string' ? error.message : '오류 메시지가 없습니다.';
        addText('p', `요청 실패 (error): ${message}`);
        addText('p', '접근 거부 판정이 아닙니다.');
        return root;
      }
      if (status !== 'ok') {
        addText('p', '확인 불가: 요청 상태를 확인할 수 없습니다.');
        return root;
      }

      const decisionLabels = {
        allow: '접근 허용(allow)',
        deny: '접근 거부(deny)',
        challenge: '추가 확인 필요(challenge)',
        unknown: '확인 불가(unknown)',
      };
      const decision = typeof data?.decision === 'string' && Object.hasOwn(decisionLabels, data.decision)
        ? data.decision
        : 'unknown';
      const requestedAppId = typeof appId === 'string' ? appId : '확인 불가';
      const resultAppId = typeof data?.appId === 'string' ? data.appId : '확인 불가';
      addText('p', `요청한 업무 앱 ID: ${requestedAppId}`);
      addText('p', `판정 응답의 업무 앱 ID: ${resultAppId}`);
      addText('p', decisionLabels[decision]);
      if (decision === 'allow') {
        addText('p', '정책상 접근 허용이며 실제 업무 앱 접속 성공을 보장하지 않습니다.');
      } else if (decision === 'challenge') {
        addText('p', '이 앱이 추가 인증 또는 확인 절차를 대신 수행하지 않습니다.');
      }
      addText('p', `판정 이유: ${typeof data?.reason === 'string' ? data.reason : '확인 불가'}`);
      addText('p', `판정 시각: ${typeof data?.checkedAt === 'string' ? data.checkedAt : '확인 불가'}`);
      return root;
    },
    renderEvents({ status, mode, data, error } = {}) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      if (status === 'loading') {
        addText(root, 'p', '기록을 불러오는 중 (loading)');
        return root;
      }
      if (status === 'error') {
        const message = typeof error?.message === 'string' ? error.message : '오류 메시지가 없습니다.';
        if (error?.code === 'CONTRACT_MISMATCH') {
          addText(root, 'p', `확인 불가 (CONTRACT_MISMATCH): ${message}`);
        } else {
          addText(root, 'p', `기록을 불러오지 못했습니다: ${message}`);
        }
        return root;
      }
      if (status !== 'ok' || !Array.isArray(data)) {
        addText(root, 'p', '확인 불가: 기록 상태 또는 데이터 형식을 확인할 수 없습니다.');
        return root;
      }

      // 새 root와 목록은 호출마다 다시 만들며, 받은 배열 자체는 정렬하지 않습니다.
      const sortedEvents = [...data].sort((a, b) => Date.parse(b.at) - Date.parse(a.at));
      const filters = [
        { key: 'kind', label: '기록 종류', values: [...new Set(sortedEvents.map(event => event?.kind).filter(value => typeof value === 'string'))] },
        { key: 'appId', label: '업무 앱', values: [...new Set(sortedEvents.map(event => event?.appId).filter(value => typeof value === 'string' && value.length > 0))] },
        { key: 'access', label: '접속 상태', values: [...new Set(sortedEvents.map(event => event?.state?.access).filter(value => typeof value === 'string'))] },
      ];
      const selected = { kind: 'all', appId: 'all', access: 'all' };
      const selects = {};
      for (const filter of filters) {
        const label = document.createElement('label');
        label.textContent = filter.label;
        const select = document.createElement('select');
        select.setAttribute('aria-label', filter.label);
        const allOption = document.createElement('option');
        allOption.value = 'all';
        allOption.textContent = '전체';
        select.append(allOption);
        if (filter.key === 'appId' && sortedEvents.some(event => typeof event?.appId !== 'string' || event.appId.length === 0)) {
          const missingOption = document.createElement('option');
          missingOption.value = '';
          missingOption.textContent = '앱을 확인할 수 없습니다 (appId 없음)';
          select.append(missingOption);
        }
        for (const value of filter.values) {
          const option = document.createElement('option');
          option.value = value;
          option.textContent = value;
          select.append(option);
        }
        label.append(select);
        root.append(label);
        selects[filter.key] = select;
        select.addEventListener('change', () => {
          selected[filter.key] = select.value;
          renderFilteredEvents();
        });
      }

      const count = addText(root, 'p', '표시 건수: 0건');
      const result = document.createElement('div');
      root.append(result);
      const detail = document.createElement('section');
      detail.setAttribute('aria-live', 'polite');
      root.append(detail);
      let selectedEventId = null;

      const renderEventDetail = event => {
        detail.replaceChildren();
        detail.removeAttribute('data-student-event-detail');
        if (!event) return;

        detail.dataset.studentEventDetail = event.id;
        addText(detail, 'h3', `${event.id} 상세`);
        addText(detail, 'p', `사건 ID: ${event.id}`);
        const appId = typeof event.appId === 'string' && event.appId.length > 0
          ? event.appId
          : '앱을 확인할 수 없습니다 (appId 없음)';
        addText(detail, 'p', `업무 앱 ID: ${appId}`);

        const addEntries = (title, entries, idLabel) => {
          addText(detail, 'h4', title);
          if (!Array.isArray(entries) || entries.length === 0) {
            addText(detail, 'p', title === '근거' ? '표시할 근거가 없습니다.' : '표시할 규칙이 없습니다.');
            return;
          }
          const list = document.createElement('ul');
          for (const entry of entries) {
            const item = document.createElement('li');
            addText(item, 'p', `${idLabel}: ${typeof entry?.id === 'string' ? entry.id : '확인 불가'}`);
            addText(item, 'p', `내용: ${typeof entry?.text === 'string' ? entry.text : '확인 불가'}`);
            list.append(item);
          }
          detail.append(list);
        };
        addEntries('근거', event.evidence, '근거 ID');
        addEntries('규칙', event.rules, '규칙 ID');

        const accessLabels = { allowed: '접근 허용', denied: '접근 거부', unknown: '확인 불가' };
        const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
        const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
        const formatEventState = (value, labels) => {
          if (value === 'unknown') return '확인 불가(unknown)';
          if (typeof value !== 'string') return '확인 불가';
          return `${labels[value] ?? '확인 불가'} (${value})`;
        };
        addText(detail, 'h4', '상태');
        addText(detail, 'p', `접속 상태: ${formatEventState(event.state?.access, accessLabels)}`);
        addText(detail, 'p', `세션 상태: ${formatEventState(event.state?.session, sessionLabels)}`);
        addText(detail, 'p', `기기 상태: ${formatEventState(event.state?.device, deviceLabels)}`);

        if (Array.isArray(event.supportedActions) && event.supportedActions.length > 0) {
          addText(detail, 'p', '조치 실행 연결은 준비 중입니다. 요청은 전송되지 않습니다.');
          for (const action of event.supportedActions) {
            const unsupportedButton = document.createElement('button');
            unsupportedButton.type = 'button';
            unsupportedButton.disabled = true;
            unsupportedButton.setAttribute('aria-label', `${action} 미지원`);
            unsupportedButton.textContent = `${action} 미지원`;
            detail.append(unsupportedButton);
          }
        }
      };

      const renderFilteredEvents = () => {
        result.replaceChildren();
        const visibleEvents = sortedEvents.filter(event => {
          const kindMatches = selected.kind === 'all' || event?.kind === selected.kind;
          const appMatches = selected.appId === 'all'
            || (selected.appId === '' ? typeof event?.appId !== 'string' || event.appId.length === 0 : event?.appId === selected.appId);
          const accessMatches = selected.access === 'all' || event?.state?.access === selected.access;
          return kindMatches && appMatches && accessMatches;
        });
        count.textContent = `표시 건수: ${visibleEvents.length}건`;
        if (selectedEventId !== null && !visibleEvents.some(event => event?.id === selectedEventId)) {
          selectedEventId = null;
          renderEventDetail(null);
        }
        if (visibleEvents.length === 0) {
          addText(result, 'p', sortedEvents.length === 0 ? '표시할 기록이 없습니다' : '선택한 조건에 해당하는 기록이 없습니다');
          return;
        }

        const list = document.createElement('ul');
        for (const event of visibleEvents) {
          const row = document.createElement('li');
          row.dataset.studentEventId = event.id;
          addText(row, 'p', `사건 ID: ${event.id}`);
          addText(row, 'p', `시각: ${event.at}`);
          const kindLabel = event.kind === 'access' ? '접속 기록' : event.kind === 'xdr' ? 'XDR 경보' : event.kind;
          addText(row, 'p', `종류: ${kindLabel} (${event.kind})`);
          addText(row, 'p', `업무 앱: ${typeof event.appId === 'string' && event.appId ? event.appId : '앱을 확인할 수 없습니다'}`);
          addText(row, 'p', `요약: ${event.summary}`);
          const detailButton = document.createElement('button');
          detailButton.type = 'button';
          detailButton.setAttribute('aria-label', `${event.id} 상세`);
          detailButton.textContent = `${event.id} 상세`;
          detailButton.addEventListener('click', () => {
            selectedEventId = event.id;
            renderEventDetail(event);
          });
          row.append(detailButton);
          list.append(row);
        }
        result.append(list);
      };
      renderFilteredEvents();
      return root;
    },
    renderStatus({ devices, sessions, notifications, diagnostics, mode } = {}) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };
      const modeLabels = {
        connected: '연결됨 (connected)',
        demo: '예제 자료 (demo)',
        disconnected: '연결 없음 (disconnected)',
        unknown: '확인 불가 (unknown)',
      };
      const secretPattern = /(?:Bearer\s+\S+|sk-(?:proj-|ant-|svcacct-)?[A-Za-z0-9_-]{8,}|-----BEGIN [A-Z ]*PRIVATE KEY-----|(?:api[_ -]?key|authorization|password|secret|비밀번호|토큰|인증키)\s*[:=]\s*\S+)/i;
      const safeValue = value => {
        if (typeof value !== 'string' && typeof value !== 'number') return '확인 불가';
        const text = String(value);
        return secretPattern.test(text) ? '민감 정보가 포함되어 있어 표시하지 않습니다.' : text;
      };
      const safeCode = value => typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9._:-]{0,79}$/.test(value) && !secretPattern.test(value)
        ? value
        : '확인 불가';
      const modeLabel = Object.hasOwn(modeLabels, mode) ? modeLabels[mode] : modeLabels.unknown;
      addText(root, 'h3', '상태·알림·도움정보');
      addText(root, 'p', `연결 모드: ${modeLabel}`);

      const deviceLabels = { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' };
      const sessionLabels = { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' };
      const formatState = (value, labels) => {
        const key = typeof value === 'string' && Object.hasOwn(labels, value) ? value : 'unknown';
        return `${labels[key]} (${key})`;
      };
      const isTimeout = error => {
        const code = typeof error?.code === 'string' ? error.code : '';
        const message = typeof error?.message === 'string' ? error.message : '';
        return /timeout|time.?out|시간 초과/i.test(`${code} ${message}`);
      };

      // ---------- 마무리: 한눈 요약(관제 대시보드형) ----------
      // 받은 자료만 요약합니다. 확인하지 못한 것은 정상으로 바꾸지 않고 '확인 불가'로 둡니다.
      const levelLabels = {
        ok: '● 정상',
        warn: '▲ 주의',
        unknown: '? 확인 불가',
        off: '○ 연결 안 함',
        empty: '○ 없음',
        loading: '… 불러오는 중',
      };
      const codeHints = {
        ENGINE_NOT_CONNECTED: '회사 서버 미연결',
        CONTRACT_MISMATCH: '응답 형식 확인 불가',
        ENGINE_RESULT_UNVERIFIED: '서버 결과 확인 불가',
      };
      const modeKey = Object.hasOwn(modeLabels, mode) ? mode : 'unknown';
      const connectionCard = modeKey === 'connected'
        ? { level: 'ok', text: modeLabels.connected }
        : modeKey === 'demo'
          ? { level: 'warn', text: '예제 자료 (demo) · 실제 조회 결과 아님' }
          : modeKey === 'disconnected'
            ? { level: 'off', text: modeLabels.disconnected }
            : { level: 'unknown', text: modeLabels.unknown };
      const summarizeList = (resource, labels, warnKeys, okKey, emptyText, unit) => {
        if (resource?.status === 'loading') return { level: 'loading', text: '조회 중입니다. 이전 값은 표시하지 않습니다.' };
        if (resource?.status === 'error') {
          const code = safeCode(resource.error?.code);
          const hint = Object.hasOwn(codeHints, code) ? ` · ${codeHints[code]}` : '';
          return { level: 'unknown', text: `${isTimeout(resource.error) ? '조회 시간 초과' : '조회 실패'} (${code})${hint}` };
        }
        if (resource?.status !== 'ok' || !Array.isArray(resource.data)) return { level: 'unknown', text: '상태를 확인할 수 없습니다.' };
        if (resource.data.length === 0) return { level: 'empty', text: emptyText };
        const states = resource.data.map(row => typeof row?.status === 'string' && Object.hasOwn(labels, row.status) ? row.status : 'unknown');
        const warnCount = states.filter(state => warnKeys.includes(state)).length;
        const unknownCount = states.filter(state => state === 'unknown').length;
        if (warnCount > 0) return { level: 'warn', text: `확인 필요 ${warnCount}${unit} / 전체 ${states.length}${unit}` };
        if (unknownCount > 0) return { level: 'unknown', text: `확인 불가 ${unknownCount}${unit} / 전체 ${states.length}${unit}` };
        return { level: 'ok', text: `전체 ${states.length}${unit} ${labels[okKey]} (${okKey})` };
      };
      const deviceCard = summarizeList(devices, { compliant: '보안 기준 충족', noncompliant: '보안 기준 미충족', unknown: '확인 불가' }, ['noncompliant'], 'compliant', '등록된 기기가 없습니다.', '대');
      const sessionCard = summarizeList(sessions, { active: '활성', expired: '만료', revoked: '철회됨', unknown: '확인 불가' }, ['expired', 'revoked'], 'active', '현재 연결이 없습니다.', '개');
      const notificationCard = !Array.isArray(notifications)
        ? { level: 'unknown', text: '알림 형식을 확인할 수 없습니다.' }
        : notifications.length === 0
          ? { level: 'ok', text: '주의할 알림이 없습니다.' }
          : { level: 'warn', text: `알림 ${notifications.length}건 · 아래 알림 묶음 참고` };

      const summaryBox = document.createElement('section');
      summaryBox.setAttribute('aria-label', '보호 현황 한눈 요약');
      summaryBox.dataset.studentSummaryBox = 'v1';
      // 정적 하늘 히어로 배너(장식 그림 + 제목). 상태 글자는 이 아래에 그대로 있습니다.
      summaryBox.append(createSkyHero());
      addText(summaryBox, 'h4', '한눈 요약');
      const cardRow = document.createElement('div');
      cardRow.style.display = 'grid';
      cardRow.style.gridTemplateColumns = 'repeat(auto-fit, minmax(150px, 1fr))';
      cardRow.style.gap = '8px';
      for (const [label, card] of [['연결', connectionCard], ['기기', deviceCard], ['세션', sessionCard], ['알림', notificationCard]]) {
        const box = document.createElement('div');
        box.dataset.studentSummary = label;
        box.dataset.studentLevel = card.level;
        // 흰 종이 카드 느낌(글자·기호는 그대로, 흰 바탕이라 대비 충분)
        box.style.background = '#ffffff';
        box.style.border = '1px solid #d6e6f7';
        box.style.borderRadius = '16px';
        box.style.boxShadow = '0 8px 22px rgba(16, 76, 160, 0.10)';
        box.style.padding = '14px';
        // 이름 앞의 옅은 하늘색 둥근 타일(장식, 상태 기호와 헷갈리지 않는 모양)
        const head = document.createElement('div');
        Object.assign(head.style, { display: 'flex', alignItems: 'center', gap: '8px' });
        const tile = document.createElement('span');
        tile.setAttribute('aria-hidden', 'true');
        tile.textContent = { 연결: '⇄', 기기: '▭', 세션: '⧗', 알림: '✉' }[label] ?? '';
        Object.assign(tile.style, {
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          width: '30px', height: '30px', borderRadius: '10px',
          background: 'linear-gradient(180deg, #e6f2fe, #d3e7fb)', color: 'var(--accent, #0a58c2)', fontSize: '16px',
        });
        head.append(tile);
        box.append(head);
        const name = addText(head, 'p', label);
        name.style.margin = '0';
        name.style.fontSize = '15px';
        name.style.fontWeight = '700';
        name.style.color = 'var(--accent, #0a58c2)';
        const level = addText(box, 'p', levelLabels[card.level]);
        level.style.margin = '4px 0';
        level.style.fontWeight = '700';
        level.style.fontSize = '18px';
        const detail = addText(box, 'p', card.text);
        detail.style.margin = '0';
        cardRow.append(box);
      }
      summaryBox.append(cardRow);

      // 다음 행동: 지금 사용자가 무엇을 하면 되는지
      const nextSteps = [];
      if (modeKey === 'disconnected') {
        nextSteps.push('회사 서버(기존 엔진)에 연결하지 않은 기본 실행입니다. 로그인·기기·세션·기록은 연결 전까지 확인 불가로 보이며, 앱 고장이 아닙니다. 실제 연결에는 담당자가 발급하는 설정이 필요합니다.');
        nextSteps.push('이 상태에서도 위쪽 「내 PC 상태」의 「내 PC 확인」은 쓸 수 있습니다(제공 기능).');
      } else if (modeKey === 'demo') {
        nextSteps.push('지금 보이는 값은 예제 자료(demo)이며 실제 조회 결과가 아닙니다.');
      } else if (modeKey === 'unknown') {
        nextSteps.push('연결 상태를 확인할 수 없습니다. 위쪽 「다시 불러오기」 버튼을 직접 눌러 다시 조회하세요.');
      }
      const failedResources = [devices, sessions].filter(resource => resource?.status === 'error');
      if (failedResources.some(resource => isTimeout(resource.error))) {
        nextSteps.push('조회 시간 초과가 있었습니다. 위쪽 「다시 불러오기」 버튼을 직접 눌러 다시 조회하세요. 자동으로 다시 요청하지 않습니다.');
      } else if (modeKey === 'connected' && failedResources.length > 0) {
        nextSteps.push('불러오지 못한 자료가 있습니다. 위쪽 「다시 불러오기」 버튼을 직접 눌러 다시 조회하세요. 자동으로 다시 요청하지 않습니다.');
      }
      if (deviceCard.level === 'warn' || sessionCard.level === 'warn') {
        nextSteps.push('확인이 필요한 기기 또는 세션이 있습니다. 아래 「상세 근거」를 펼쳐 어느 항목인지 확인하세요.');
      }
      if (nextSteps.length === 0) {
        nextSteps.push('지금 따로 할 일은 없습니다. 새 값을 보려면 위쪽 「다시 불러오기」를 직접 누르세요.');
      }
      addText(summaryBox, 'h4', '다음 할 일');
      const stepList = document.createElement('ul');
      for (const step of nextSteps) addText(stepList, 'li', step);
      summaryBox.append(stepList);

      // 알림 묶음: 같은 코드·같은 메시지는 한 줄로 묶습니다(원문은 상세 근거에 그대로 남김).
      if (Array.isArray(notifications) && notifications.length > 0) {
        const grouped = new Map();
        for (const notification of notifications) {
          const code = safeCode(notification?.code);
          const message = safeValue(notification?.message);
          const key = `${code}\u0000${message}`;
          if (!grouped.has(key)) grouped.set(key, { code, message, resources: [] });
          grouped.get(key).resources.push(safeValue(notification?.resource));
        }
        addText(summaryBox, 'h4', `알림 묶음 (원문 ${notifications.length}건 → ${grouped.size}줄)`);
        const groupList = document.createElement('ul');
        for (const group of grouped.values()) {
          const hint = Object.hasOwn(codeHints, group.code) ? ` · ${codeHints[group.code]}` : '';
          addText(groupList, 'li', `${group.code}${hint} — 자료 ${group.resources.length}개(${group.resources.join(', ')}): ${group.message}`);
        }
        summaryBox.append(groupList);
      }
      addText(summaryBox, 'p', '요약은 아래 원문 자료로만 만들었습니다. 확인 불가는 정상이나 안전을 뜻하지 않습니다.');
      root.append(summaryBox);

      // 상세 근거: 기존 기기·세션·알림 원문 표시를 펼치기 안에 그대로 둡니다.
      const detailBox = document.createElement('details');
      detailBox.dataset.studentStatusDetail = 'v1';
      const detailSummary = document.createElement('summary');
      detailSummary.textContent = '상세 근거 펼치기 (등록 기기·세션·알림 원문)';
      detailBox.append(detailSummary);

      const addResourceGroup = (title, resource, emptyText, retryText, renderData) => {
        const group = document.createElement('section');
        addText(group, 'h4', title);
        if (resource?.status === 'loading') {
          addText(group, 'p', `불러오는 중 (loading): ${title}`);
        } else if (resource?.status === 'ok') {
          if (Array.isArray(resource.data)) {
            if (resource.data.length === 0) addText(group, 'p', emptyText);
            else renderData(group, resource.data);
          } else {
            addText(group, 'p', `확인 불가: ${title} 데이터 형식이 올바르지 않습니다.`);
          }
        } else if (resource?.status === 'error') {
          const message = safeValue(typeof resource.error?.message === 'string' ? resource.error.message : '오류 메시지가 없습니다.');
          addText(group, 'p', `${title}${isTimeout(resource.error) ? ' 조회 시간 초과' : ' 조회 실패'} (${safeCode(resource.error?.code)}): ${message}`);
          addText(group, 'p', retryText);
        } else {
          addText(group, 'p', `확인 불가: ${title} 상태를 확인할 수 없습니다 (${safeValue(resource?.status)})`);
        }
        detailBox.append(group);
      };

      addResourceGroup('등록 기기', devices, '등록된 기기가 없습니다.', '다시 시도하려면 위쪽 「다시 불러오기」 버튼을 직접 누르세요.', (group, rows) => {
        const list = document.createElement('ul');
        for (const device of rows) {
          const item = document.createElement('li');
          item.textContent = `기기: ${safeValue(device?.label)} · 상태: ${formatState(device?.status, deviceLabels)}`;
          list.append(item);
        }
        group.append(list);
      });

      const sessionGroup = document.createElement('section');
      addText(sessionGroup, 'h4', '세션');
      addText(sessionGroup, 'p', '현재 검증된 연결 한 개의 조회이며, 과거 세션 전체 목록은 아닙니다.');
      if (sessions?.status === 'loading') {
        addText(sessionGroup, 'p', '불러오는 중 (loading): 세션');
      } else if (sessions?.status === 'ok') {
        if (!Array.isArray(sessions.data)) {
          addText(sessionGroup, 'p', '확인 불가: 세션 데이터 형식이 올바르지 않습니다.');
        } else if (sessions.data.length === 0) {
          addText(sessionGroup, 'p', '현재 연결이 없습니다.');
        } else {
          const list = document.createElement('ul');
          for (const session of sessions.data) {
            const item = document.createElement('li');
            item.textContent = `세션 ID: ${safeValue(session?.id)} · 상태: ${formatState(session?.status, sessionLabels)}`;
            list.append(item);
          }
          sessionGroup.append(list);
        }
      } else if (sessions?.status === 'error') {
        const message = safeValue(typeof sessions.error?.message === 'string' ? sessions.error.message : '오류 메시지가 없습니다.');
        addText(sessionGroup, 'p', `세션${isTimeout(sessions.error) ? ' 조회 시간 초과' : ' 조회 실패'} (${safeCode(sessions.error?.code)}): ${message}`);
        addText(sessionGroup, 'p', '다시 시도하려면 위쪽 「다시 불러오기」 버튼을 직접 누르세요.');
      } else {
        addText(sessionGroup, 'p', `확인 불가: 세션 상태를 확인할 수 없습니다 (${safeValue(sessions?.status)})`);
      }
      detailBox.append(sessionGroup);

      const notificationGroup = document.createElement('section');
      addText(notificationGroup, 'h4', '알림');
      if (!Array.isArray(notifications)) {
        addText(notificationGroup, 'p', '확인 불가: 알림 데이터 형식을 확인할 수 없습니다.');
      } else if (notifications.length === 0) {
        addText(notificationGroup, 'p', '알림 없음: 주의할 알림이 없습니다.');
      } else {
        const list = document.createElement('ul');
        for (const notification of notifications) {
          const item = document.createElement('li');
          addText(item, 'p', `자료(resource): ${safeValue(notification?.resource)}`);
          addText(item, 'p', `코드(code): ${safeCode(notification?.code)}`);
          addText(item, 'p', `메시지(message): ${safeValue(notification?.message)}`);
          list.append(item);
        }
        notificationGroup.append(list);
      }
      detailBox.append(notificationGroup);
      root.append(detailBox);

      const diagnosticsGroup = document.createElement('section');
      addText(diagnosticsGroup, 'h4', '진단 정보');
      const diagnosticFields = [
        ['requestId', '요청 ID'],
        ['component', '구성 요소'],
        ['version', '버전'],
        ['checkedAt', '확인 시각'],
        ['engine.mode', '엔진 모드'],
        ['engine.code', '엔진 코드'],
      ];
      const getDiagnosticValue = (data, path) => path === 'engine.mode' || path === 'engine.code'
        ? data?.engine?.[path.slice('engine.'.length)]
        : data?.[path];
      const diagnosticCopyLines = [];
      if (diagnostics?.status === 'loading') {
        addText(diagnosticsGroup, 'p', '진단 정보를 불러오는 중 (loading)');
      } else if (diagnostics?.status === 'error') {
        const message = safeValue(typeof diagnostics.error?.message === 'string' ? diagnostics.error.message : '오류 메시지가 없습니다.');
        addText(diagnosticsGroup, 'p', `진단 정보를${isTimeout(diagnostics.error) ? ' 불러오는 시간이 초과됐습니다' : ' 불러오지 못했습니다'} (${safeCode(diagnostics.error?.code)}): ${message}`);
        addText(diagnosticsGroup, 'p', '다시 시도는 제공 화면 「도움정보」 칸의 「도움정보 불러오기」 버튼을 직접 누르세요.');
      } else if (diagnostics?.status === 'idle') {
        addText(diagnosticsGroup, 'p', '진단 정보를 아직 불러오지 않았습니다 (idle). 제공 화면 「도움정보」 칸의 「도움정보 불러오기」 버튼을 직접 누르면 불러옵니다.');
      } else if (diagnostics?.status === 'ok') {
        if (diagnostics.data === null || typeof diagnostics.data !== 'object' || Array.isArray(diagnostics.data)) {
          addText(diagnosticsGroup, 'p', '확인 불가: 진단 정보의 데이터 형식이 올바르지 않습니다.');
        } else {
          for (const [path, label] of diagnosticFields) {
            const rawValue = getDiagnosticValue(diagnostics.data, path);
            const shownValue = safeValue(rawValue);
            addText(diagnosticsGroup, 'p', `${label} (${path}): ${shownValue}`);
            const isSafeScalar = typeof rawValue === 'string' || typeof rawValue === 'number';
            if (isSafeScalar && !secretPattern.test(String(rawValue))) diagnosticCopyLines.push(`${label} (${path}): ${String(rawValue)}`);
          }
        }
      } else {
        addText(diagnosticsGroup, 'p', `확인 불가: 진단 정보 상태를 확인할 수 없습니다 (${safeValue(diagnostics?.status)})`);
      }
      addText(diagnosticsGroup, 'p', '복사되는 진단 정보는 도움 요청에 사용합니다. 비밀이 감지된 값은 표시하거나 복사하지 않습니다.');
      const copyButton = document.createElement('button');
      copyButton.type = 'button';
      copyButton.setAttribute('aria-label', '도움정보 복사');
      copyButton.textContent = '도움정보 복사';
      const copyStatus = addText(diagnosticsGroup, 'p', '도움정보 복사 전입니다.');
      copyButton.addEventListener('click', async () => {
        if (diagnosticCopyLines.length === 0) {
          copyStatus.textContent = '복사할 안전한 진단 정보가 없습니다.';
          return;
        }
        try {
          if (!globalThis.navigator?.clipboard?.writeText) throw new Error('CLIPBOARD_UNAVAILABLE');
          await globalThis.navigator.clipboard.writeText(diagnosticCopyLines.join('\n'));
          copyStatus.textContent = '도움정보를 복사했습니다.';
        } catch {
          copyStatus.textContent = '도움정보를 복사하지 못했습니다.';
        }
      });
      diagnosticsGroup.append(copyButton);
      root.append(diagnosticsGroup);
      return root;
    },
    renderVulnerabilities({ status, mode, data, error } = {}) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      if (status === 'idle') {
        addText(root, 'p', '조회 전 (idle)');
        return root;
      }
      if (status === 'loading') {
        addText(root, 'p', '조회 중 (loading)');
        return root;
      }
      if (status === 'error') {
        const message = typeof error?.message === 'string' ? error.message : '오류 메시지를 확인할 수 없습니다.';
        addText(root, 'p', `조회 실패 (error): ${message}`);
        if (typeof error?.code === 'string') {
          addText(root, 'p', `오류 코드: ${error.code}`);
        }
        addText(root, 'p', '이전 결과는 현재 결과가 아닙니다. 「설치 패키지 조회」를 다시 눌러 새로 조회하세요.');
        return root;
      }
      if (status !== 'ok') {
        addText(root, 'p', `조회 상태를 확인할 수 없습니다 (${typeof status === 'string' ? status : 'unknown'}).`);
        return root;
      }

      addText(root, 'h3', '설치 패키지 취약점 조회');
      if (data === null || typeof data !== 'object' || Array.isArray(data)) {
        addText(root, 'p', '조회 결과를 확인할 수 없습니다');
        return root;
      }

      const statusLabels = {
        complete: '모두 조회 (complete)',
        partial: '일부 조회 실패 (partial)',
        not_checked: '아직 조회 안 함 (not_checked): 승인된 공개 조회 대상이 없어 조회하지 않았습니다.',
        not_configured: '조회 준비 미완료 (not_configured): 조회 대상 프로젝트 설정이 필요합니다.',
        unverifiable: 'lock 파일 확인 불가 (unverifiable): package-lock.json을 확인할 수 없습니다.',
      };
      const resultStatus = typeof data.status === 'string' && Object.hasOwn(statusLabels, data.status)
        ? data.status
        : null;
      if (resultStatus === null) {
        addText(root, 'p', `조회 상태를 확인할 수 없습니다 (${String(data.status)})`);
      } else {
        addText(root, 'p', statusLabels[resultStatus]);
      }
      if (resultStatus !== 'complete') {
        addText(root, 'p', '미조회·조회 실패는 취약점 없음을 뜻하지 않습니다.');
      }
      if (typeof data.lockfileVersion === 'number') {
        addText(root, 'p', '설치 목록 원천: package-lock.json과 설치된 node_modules 메타데이터 대조');
        addText(root, 'p', `lock 파일 버전 (lockfileVersion): ${data.lockfileVersion}`);
      }
      if (typeof data.lockfileHash === 'string') {
        addText(root, 'p', `lock 파일 해시 (lockfileHash): ${data.lockfileHash}`);
      }
      if (typeof data.checkedAt === 'string') {
        addText(root, 'p', `조회 시각 (checkedAt): ${data.checkedAt}`);
      }
      if (!Array.isArray(data.packages)) {
        addText(root, 'p', '패키지 목록을 확인할 수 없습니다.');
      } else if (data.packages.length === 0) {
        addText(root, 'p', '조회한 패키지 행이 없습니다.');
      } else {
        const packageList = document.createElement('ul');
        for (const packageData of data.packages) {
          const packageRow = document.createElement('li');
          if (packageData === null || typeof packageData !== 'object' || Array.isArray(packageData)) {
            addText(packageRow, 'p', '패키지 행을 확인할 수 없습니다.');
            packageList.append(packageRow);
            continue;
          }
          const isExactVersion = typeof packageData.version === 'string'
            && /^\d+\.\d+\.\d+(?:[-+][0-9A-Za-z.+-]+)?$/.test(packageData.version);
          if (typeof packageData.name === 'string') {
            packageRow.dataset.studentPackageName = packageData.name;
          }
          if (isExactVersion) {
            packageRow.dataset.studentPackageVersion = packageData.version;
          }
          addText(packageRow, 'p', `패키지: ${typeof packageData.name === 'string' ? packageData.name : '확인 불가'}`);
          if (isExactVersion) {
            addText(packageRow, 'p', `설치 버전: ${packageData.version}`);
          } else {
            addText(packageRow, 'p', `정확한 설치 버전 확인 불가 (${String(packageData.version)})`);
          }
          const vulnerabilities = packageData.vulnerabilities;
          if (packageData.status === 'known_vulnerabilities') {
            addText(packageRow, 'p', '알려진 항목 있음 (known_vulnerabilities)');
          } else if (packageData.status === 'none_found') {
            addText(packageRow, 'p', '알려진 항목 없음 (none_found): 조회 범위에서 알려진 취약점 항목이 없다는 뜻이며 안전을 보장하지 않습니다.');
          } else if (packageData.status === 'unverifiable' && Array.isArray(vulnerabilities) && vulnerabilities.length > 0) {
            addText(packageRow, 'p', '일부 확인·전체 조회 확인 불가 (unverifiable)');
          } else if (packageData.status === 'unverifiable') {
            addText(packageRow, 'p', '조회 확인 불가 (unverifiable): 취약점 없음이 아닙니다.');
          } else {
            addText(packageRow, 'p', `상태 확인 불가 (${String(packageData.status)})`);
          }
          if (typeof packageData.source === 'string') {
            addText(packageRow, 'p', `출처 (source): ${packageData.source}`);
          }
          if (typeof packageData.checkedAt === 'string') {
            addText(packageRow, 'p', `조회 시각 (checkedAt): ${packageData.checkedAt}`);
          }
          if (Array.isArray(vulnerabilities) && vulnerabilities.length > 0) {
            for (const vulnerability of vulnerabilities) {
              addText(packageRow, 'p', `취약점 ID: ${typeof vulnerability?.id === 'string' ? vulnerability.id : '확인 불가'}`);
              if (typeof vulnerability?.modified === 'string') {
                addText(packageRow, 'p', `수정 시각 (modified): ${vulnerability.modified}`);
              }
            }
          }
          if (packageData.status === 'known_vulnerabilities' && (!Array.isArray(vulnerabilities) || vulnerabilities.length === 0)) {
            addText(packageRow, 'p', '취약점 목록을 확인할 수 없습니다.');
          }
          packageList.append(packageRow);
        }
        root.append(packageList);
      }
      addText(root, 'p', 'OSV는 알려진 취약점 데이터베이스이며, 조회 결과가 없어도 패키지나 앱 전체의 안전을 보장하지 않습니다.');
      return root;
    },
    renderAiConnection({ status, mode, data, error, checkedAt, explanationAccepted } = {}) {
      const root = document.createElement('section');
      const addText = (tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        root.append(node);
        return node;
      };
      const modeLabels = {
        connected: '연결됨 (connected)',
        demo: '예제 자료 (demo)',
        disconnected: '연결 없음 (disconnected)',
        unknown: '확인 불가 (unknown)',
      };
      const modeLabel = Object.hasOwn(modeLabels, mode) ? modeLabels[mode] : modeLabels.unknown;

      if (status === 'idle') {
        addText('p', 'AI 연결 점검 전 (idle). 자동 점검은 하지 않습니다. 점검은 제공 화면의 「현재 API 연결 점검」 버튼을 직접 누르세요.');
        return root;
      }
      if (status === 'loading') {
        addText('p', 'AI 연결 점검 중 (loading). 취소하거나 결과를 기다리세요. 다시 점검은 사용자가 직접 시작합니다.');
        return root;
      }
      if (status === 'error') {
        const code = safeAiCode(error?.code);
        const message = safeAiMessage(error?.message);
        const rawCode = typeof error?.code === 'string' ? error.code : '';
        addText('p', `AI 연결 점검 실패 (error) · 오류 코드: ${code} · 메시지: ${message}`);
        addText('p', aiErrorGuidance(rawCode));
        addText('p', '자동으로 다시 점검하지 않습니다. 필요하면 제공 화면의 「현재 API 연결 점검」 버튼을 직접 누르세요.');
        return root;
      }
      if (status !== 'ok') {
        addText('p', `AI 연결 점검 상태를 확인할 수 없습니다 (${typeof status === 'string' ? status : '확인 불가'}).`);
        return root;
      }

      const authorizationLabels = {
        test: '시험 연결 점검(test)',
        verified: '앱 권한 확인 후 점검(verified)',
      };
      const authorization = Object.hasOwn(authorizationLabels, data?.audienceAuthorization)
        ? authorizationLabels[data.audienceAuthorization]
        : '권한 확인 상태를 확인할 수 없습니다.';
      addText('p', authorization);
      if (mode === 'demo') addText('p', `예제 자료(demo) · ${modeLabel}`);
      addText('p', `모델 수: ${Number.isInteger(data?.modelCount) && data.modelCount >= 0 ? data.modelCount : '확인 불가'}`);
      addText('p', `점검 시각: ${typeof checkedAt === 'string' ? checkedAt : '확인 불가'}`);
      addText('p', 'AI 연결과 모델 응답만 점검했습니다. 사건 설명은 아직 실행하지 않았습니다.');
      addText('p', '다시 점검할 때는 제공 화면의 「현재 API 연결 점검」 버튼을 사용자가 직접 누르세요.');
      return root;
    },
    renderExplanation({ event, explanation, checkedAt } = {}) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };

      if (explanation?.status === 'error') {
        const code = safeAiCode(explanation.error?.code);
        const message = safeAiMessage(explanation.error?.message);
        const rawCode = typeof explanation.error?.code === 'string' ? explanation.error.code : '';
        addText(root, 'p', `AI 설명 실패 (error) · 오류 코드: ${code} · 메시지: ${message}`);
        if (rawCode === 'ON_AI_INVALID_INPUT') {
          addText(root, 'p', '요청 입력이 유효하지 않아 AI 설명을 생성하지 못했습니다.');
        } else if (rawCode === 'ON_AI_INVALID_OUTPUT') {
          addText(root, 'p', 'AI 응답이 필수 형식 또는 근거 조건을 충족하지 않아 설명을 사용할 수 없습니다.');
        } else {
          addText(root, 'p', aiErrorGuidance(rawCode));
        }
        addText(root, 'p', '기록은 그대로입니다.');
        return root;
      }

      if (!event) {
        addText(root, 'p', '보안 기록에서 기록을 먼저 고르세요.');
        return root;
      }
      if (explanation?.status === 'loading') {
        addText(root, 'p', 'AI 설명 요청 중 (loading)');
        return root;
      }
      if (explanation?.status !== 'ok') {
        addText(root, 'p', 'AI 설명 결과가 없습니다. 보안 기록은 그대로입니다.');
        return root;
      }

      const data = explanation.data;
      if (data?.executed === true) {
        addText(root, 'p', 'AI가 이미 실행했다고 답한 설명은 사용할 수 없습니다.');
        addText(root, 'p', '기록은 그대로입니다.');
        return root;
      }

      const evidence = Array.isArray(event.evidence) ? event.evidence : null;
      const expectedEvidenceIds = evidence?.map(item => item?.id);
      const actualEvidenceIds = data?.evidenceIds;
      const expectedIdsAreValid = Array.isArray(expectedEvidenceIds)
        && expectedEvidenceIds.every(id => typeof id === 'string' && id.length > 0)
        && new Set(expectedEvidenceIds).size === expectedEvidenceIds.length;
      const actualIdsAreValid = Array.isArray(actualEvidenceIds)
        && actualEvidenceIds.every(id => typeof id === 'string' && id.length > 0)
        && new Set(actualEvidenceIds).size === actualEvidenceIds.length;
      const evidenceMatches = expectedIdsAreValid
        && actualIdsAreValid
        && expectedEvidenceIds.length === actualEvidenceIds.length
        && expectedEvidenceIds.every(id => actualEvidenceIds.includes(id));
      const summaryIsValid = typeof data?.summary === 'string' && data.summary.trim().length > 0;
      if (!evidenceMatches || !summaryIsValid) {
        addText(root, 'p', '근거가 현재 선택한 기록과 일치하지 않아 AI 설명을 사용할 수 없습니다. 근거가 맞지 않거나 부족합니다.');
        if (typeof explanation.error?.code === 'string') {
          addText(root, 'p', `오류 코드: ${safeAiCode(explanation.error.code)}`);
        }
        return root;
      }

      const proposalsAreValid = Array.isArray(data.proposals)
        && data.proposals.every(proposal => typeof proposal?.action === 'string' && typeof proposal?.reason === 'string');
      if (!proposalsAreValid) {
        addText(root, 'p', 'AI 설명 자료 형식이 올바르지 않아 사용할 수 없습니다.');
        return root;
      }
      if (typeof event.id !== 'string' || event.id.length === 0) {
        addText(root, 'p', '사건 ID를 확인할 수 없어 AI 설명을 사용할 수 없습니다.');
        return root;
      }

      root.setAttribute('data-student-explanation-event', event.id);
      addText(root, 'p', `사건 ID: ${event.id}`);
      addText(root, 'h3', 'AI 설명(참고용)');
      addText(root, 'p', data.summary);

      addText(root, 'h4', '인용한 근거');
      for (const id of actualEvidenceIds) {
        const item = evidence.find(entry => entry.id === id);
        const text = typeof item.text === 'string' ? item.text : '확인 불가';
        addText(root, 'p', `${id} — ${text}`);
      }

      addText(root, 'h4', '규칙');
      if (Array.isArray(event.rules)) {
        if (event.rules.length === 0) {
          addText(root, 'p', '없음');
        } else {
          for (const rule of event.rules) {
            const id = typeof rule?.id === 'string' ? rule.id : '확인 불가';
            const text = typeof rule?.text === 'string' ? rule.text : '확인 불가';
            addText(root, 'p', `${id} — ${text}`);
          }
        }
      } else {
        addText(root, 'p', '규칙 정보를 확인할 수 없습니다.');
      }

      addText(root, 'h4', '확인 불가 상태');
      if (!event.state || typeof event.state !== 'object' || Array.isArray(event.state)) {
        addText(root, 'p', '상태 정보를 확인할 수 없습니다(확인 불가)');
      } else {
        const unknownStates = [
          ['access', '접속'],
          ['session', '세션'],
          ['device', '기기'],
        ].filter(([key]) => event.state[key] === 'unknown');
        if (unknownStates.length === 0) {
          addText(root, 'p', '없음');
        } else {
          for (const [key, label] of unknownStates) {
            addText(root, 'p', `${label}: 확인 불가(${event.state[key]})`);
          }
        }
      }

      addText(root, 'h4', 'AI 제안');
      if (data.proposals.length === 0) {
        if (Array.isArray(event.supportedActions) && event.supportedActions.length === 0) {
          addText(root, 'p', '연동 시스템이 지원하는 조치가 없어 제안이 없습니다(정상).');
        } else {
          addText(root, 'p', 'AI가 제안한 조치가 없습니다.');
        }
      } else {
        for (const proposal of data.proposals) {
          addText(root, 'p', `조치: ${proposal.action}`);
          addText(root, 'p', `이유: ${proposal.reason}`);
          addText(root, 'p', '사람 확인이 필요하며 아직 실행되지 않았습니다.');
        }
      }
      return root;
    },
    renderAction({ status, event, actionId, target, receipt, observation, message, confirmationExpiresAt, error } = {}) {
      const root = document.createElement('section');
      const addText = (parent, tag, text) => {
        const node = document.createElement(tag);
        node.textContent = text;
        parent.append(node);
        return node;
      };
      const addActionId = (label, value) => {
        if (typeof value === 'string' && value.length > 0) addText(root, 'p', `${label}: ${value}`);
        else if (typeof value === 'number' && Number.isFinite(value)) addText(root, 'p', `${label}: ${value}`);
      };
      const resultLookup = () => addText(root, 'p', '결과를 판단하지 않습니다. 제공 화면의 「원천 결과만 재조회」를 눌러 결과를 확인하세요.');
      const statusLabels = {
        idle: '아직 미실행 (idle)',
        loading: '조치 준비 또는 결과 조회 중 (loading). 처리 결과는 아직 확인되지 않았습니다.',
        prepared: '준비됨·미실행 (prepared). 제공 화면의 「대상과 조치를 확인했으며 집행합니다」를 사람이 누르기 전에는 실행되지 않습니다.',
        executing: '서버에 전달 중 (executing). 처리 결과는 아직 확인되지 않았습니다. 결과가 나올 때까지 집행 버튼을 다시 누르지 말고 「원천 결과만 재조회」로 확인하세요.',
        pending: '서버 접수·처리 중 (pending). 서버가 받았다는 응답(ACK)은 효과 확인이 아니며, 처리 결과는 아직 확인되지 않았습니다. 결과가 나올 때까지 집행 버튼을 다시 누르지 말고 「원천 결과만 재조회」로 확인하세요.',
        succeeded: '효과 확인 (succeeded)',
        denied: '연동 시스템에서 거절 (denied)',
        failed: '연동 시스템에서 실패 (failed)',
        unknown: '결과 불명 (unknown). 효과 없음이나 성공으로 판단할 수 없습니다.',
        expired: '확인 기한 지남 (expired). 다시 준비해야 합니다.',
        error: '요청 처리 안 됨 (error)',
      };
      const knownStatus = typeof status === 'string' && Object.hasOwn(statusLabels, status) ? status : 'unknown';
      const receiptMismatch = receipt != null && (receipt.eventId !== event?.id || receipt.actionId !== actionId);
      const succeededWithObservation = status === 'succeeded'
        && observation?.effectApplied === true
        && typeof observation?.observedAt === 'string'
        && typeof receipt?.receiptId === 'string'
        && !receiptMismatch
        && receipt?.superseded !== true;
      const actionPreparationLabel = typeof actionId === 'string' && actionId.length > 0
        ? `${actionId} 조치 준비`
        : '조치 준비';
      let needsLookup = false;

      if (receiptMismatch) {
        addText(root, 'p', '현재 사건·조치와 맞지 않는 결과입니다 (결과 불명)');
        needsLookup = true;
      } else if (status === 'succeeded') {
        if (succeededWithObservation) {
          addText(root, 'p', '효과 확인 (succeeded)');
          addText(root, 'p', `관측 시각 (observation.observedAt): ${observation.observedAt}`);
          addText(root, 'p', 'effectApplied: true');
          addText(root, 'p', `접수 ID (receipt.receiptId): ${receipt.receiptId}`);
        } else {
          addText(root, 'p', '결과 불명 (unknown): 효과 확인 조건을 충족하지 않아 효과를 확정할 수 없습니다.');
          needsLookup = true;
        }
      } else {
        addText(root, 'p', statusLabels[knownStatus]);
      }

      if (knownStatus === 'prepared') {
        addText(root, 'p', `확인 기한 (confirmationExpiresAt): ${typeof confirmationExpiresAt === 'string' ? confirmationExpiresAt : '확인 불가'}`);
      }
      if (knownStatus === 'denied' || knownStatus === 'failed') {
        addText(root, 'p', `메시지: ${safeAiMessage(message)}`);
      }
      if (knownStatus === 'unknown') needsLookup = true;
      if (knownStatus === 'expired') addText(root, 'p', `제공 화면의 AI 제안에서 「${actionPreparationLabel}」를 다시 누르세요.`);
      if (knownStatus === 'error') {
        addText(root, 'p', `오류 코드 (error.code): ${safeAiCode(error?.code)}`);
        addText(root, 'p', `오류 메시지 (error.message): ${safeAiMessage(error?.message)}`);
      }
      if (receipt?.replayed === true) {
        addText(root, 'p', '같은 요청(requestId)에 대한 기존 결과를 다시 받은 것입니다 (replayed: true). 조치를 한 번 더 실행한 것이 아닙니다.');
      } else if (receipt?.replayed === false) {
        addText(root, 'p', 'replayed: false');
      }
      if (receipt?.superseded === true) {
        addText(root, 'p', '이후 결과가 바뀌어 대체되었습니다 (superseded). 결과 불명으로 처리합니다.');
        needsLookup = true;
      }
      if (needsLookup) resultLookup();

      addActionId('사건 ID (event.id)', event?.id);
      if (Array.isArray(event?.evidence)) {
        for (const evidence of event.evidence) addActionId('근거 ID (event.evidence.id)', evidence?.id);
      }
      addActionId('조치 ID (actionId)', actionId);
      addActionId('실제 대상 ID (target.id)', target?.id);
      addActionId('대상 세대 (target.generation)', target?.generation);
      addActionId('요청 ID (receipt.requestId)', receipt?.requestId);
      addActionId('접수 ID (receipt.receiptId)', receipt?.receiptId);
      addActionId('영수증 버전 (receipt.version)', receipt?.version);

      if (typeof event?.id === 'string' && event.id.length > 0) root.setAttribute('data-student-action-event', event.id);
      if (!receiptMismatch && typeof receipt?.requestId === 'string' && receipt.requestId.length > 0) root.setAttribute('data-student-action-request', receipt.requestId);
      return root;
    },
  });
}
