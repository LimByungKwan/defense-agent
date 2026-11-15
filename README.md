# 마르셀 갈랑

회사 서버 없이도 내 PC 상태를 직접 재서 보여 주는 보안 도우미 화면 (2026 KIT K-뉴딜 SKT ALEPH 공동 방어전 과제)

## 핵심 기능 3개
1. **내 PC 추이 대시보드**: 「지금 측정」으로 CPU·메모리·디스크·Windows 방화벽·네트워크 구성·Windows 기록을 재고, 「다시 조회」로 이전 대비 차이·추이 그래프·측정 기록을 봅니다.
2. **실패를 정직하게 보여 주기**: 읽지 못한 값은 0이나 예시 값 대신 「? 확인 불가」와 이유, 오류 상자, 다음 할 일로 보여 줍니다.
3. **회사 서버 연결 요약**: SDP 서버 연결 상태, 알림 묶음(원문 5건 → 1줄), 로그인 실패 이유 묶음(3곳 → 1줄), 다음 할 일.

## 빠른 실행 (Windows PowerShell)
```powershell
git clone https://github.com/LimByungKwan/defense-agent
cd defense-agent\on-client
powershell -NoProfile -ExecutionPolicy Bypass -File .\tools\start-alekov.ps1
```
브라우저에서 `http://127.0.0.1:5189` 를 엽니다. 끌 때는 켠 PowerShell 창에서 `Ctrl+C`. 자세한 안내와 막혔을 때는 [on-client/docs/STUDENT_RUNBOOK.md](on-client/docs/STUDENT_RUNBOOK.md)를 보세요.

**「연결 없음」·「SDP 미연결」은 정상입니다.** 회사 서버에 연결하지 않은 기본 실행이며, ① 내 PC 추이는 연결 없이도 동작합니다.

## 한 일
- **1~12단계**: 이전 공개 저장소 [choi-bujang-secret-vault](https://github.com/LimByungKwan/choi-bujang-secret-vault)에서 진행. 「최부장 자료실」 웹앱(Vercel + Supabase) 보안, 1~12단계 모두 심판 100점(12단계 탈환 작전실).
- **보너스 XDR**: xdr-01 brute-force 80/80, xdr-02 web-injection 100, xdr-03 known-cve 120/120, xdr-04 persistence 100, xdr-05 권한 가로채기 100, xdr-06 exfiltration 100
- **13~22단계 (이 저장소)**: 시작 틀 화면 8곳을 학생 코드로 구현, 21단계 실행 안내와 구성도, 22단계까지 포털 통과(2026-11-11)
- **마무리**
  - 1일차: 상태 요약 카드·다음 할 일·알림 묶음·상세 근거 펼치기
  - 2일차: ① 내 PC 추이(기록·그래프·30초 자동 측정, 작업 관리자·C: 속성과 비교 — 비교는 2026-11-15)
  - 3일차: 네트워크·Windows 기록 카드, ② SDP 연결 요약
  - 4일차: 다시 조회·조회 중 표시·실패 안내, 실제 실패와 회복 확인
  - 5일차: 실행 안내 한 장, 새 폴더에서 재현
  - 6일차: 포장 없이 커밋·push·40자리 커밋 확인
  - 7일차: 실패 재현을 포함한 시연, 한계와 근거 정리
  - 꾸밈: 종이비행기 하늘 테마

## 확인한 것 / 안 한 것
- **확인함**: 내 PC 값은 이 PC에서 실제로 잰 값(잰 시각 표시). 서버를 끈 실제 실패(`NETWORK_ERROR`)와 회복.
- **미확인**: SDP·XDR·AI 연결(회사 서버 미연결). 항목별 실패와 자동 측정 멈춤은 시험용 가짜 응답으로만 확인.

## 문서
- [on-client/docs/STUDENT_RUNBOOK.md](on-client/docs/STUDENT_RUNBOOK.md): 처음 보는 사람용 실행 안내 한 장과 21단계 기록
- [on-client/docs/FINAL_RECORD.md](on-client/docs/FINAL_RECORD.md): 완성 기록(시연 순서, 핵심 기능, 값의 종류, 근거 커밋, 한계)

## 폴더
- **내가 만든 부분**: `on-client/student/extension.mjs`(화면 코드), `on-client/student/appearance.json`과 `on-client/student/assets/`(앱 이름·색·그림), `on-client/docs/STUDENT_RUNBOOK.md`·`STAGE_22_REPRODUCTION_RECORD.md`·`FINAL_RECORD.md`(학생 문서)
- **제공된 부분**: `on-client/public/`(공통 화면), `on-client/src/`(로컬 서버), `on-client/tools/`(실행·포장 도구), `on-client/student/engine-adapter.mjs`, 그 밖의 `on-client/docs/` 문서
