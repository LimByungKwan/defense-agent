// 이 파일은 학생이 같은 프로젝트에서 이어서 구현합니다.
// 제공 UI를 받은 것만으로 단계 완료를 인정하지 않습니다.
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
    renderDecision() { return '학생 구현 대기: 서버의 판정과 이유를 연결하세요.'; },
    renderEvents() { return '학생 구현 대기: 본인 접속·XDR 기록을 연결하세요.'; },
    renderStatus() { return '학생 구현 대기: 기기·세션·알림과 연결 점검 상태를 구분하세요.'; },
    renderVulnerabilities() { return '학생 구현 대기: 정확한 설치 버전·OSV 출처·조회 시각·부분 결과·조회 실패를 구분하세요.'; },
    renderAiConnection() { return '학생 구현 대기: 모델 응답 점검과 실제 사건 설명을 구분하고 AI 오류·취소·수동 복구를 안내하세요.'; },
    renderExplanation() { return '학생 구현 대기: 선택한 사건의 근거·규칙·현재 상태와 AI 설명을 연결하세요. 제안은 자동 실행하지 않습니다.'; },
    renderAction() { return '학생 구현 대기: 현재 사건·조치·실제 대상·사람 확인·ACK와 원천 효과·unknown을 구분하세요.'; },
  };
}
