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

export function createStudentView() {
  return {
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
      const addGroup = (label, resource, showData) => {
        const group = document.createElement('section');
        addText(group, 'h4', label);
        addMode(group, resource);
        addStatus(group, resource, showData);
        root.append(group);
      };
      const formatState = (value, labels) => {
        const key = typeof value === 'string' && Object.hasOwn(labels, value) ? value : 'unknown';
        return `${labels[key]} (${key})`;
      };

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
        root.append(group);
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
      root.append(sessionGroup);

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
      root.append(notificationGroup);

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
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
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
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
