# 공통 Stage 구현 및 검증 기록 — 2026-10-05

상태: 작업 브랜치 구현. main/Preview/Pages/학생 저장소 미반영.
기준 main: `23302820290463cc23f69403fc20f636030a9592`.
브랜치: `work/phycom-unified-stage-fit-20261005`.

## 좌표계 선택

| 후보 | 기존 콘텐츠에 미치는 영향 | 판단 |
|---|---|---|
| 1280×720 | 190px 사이드바를 포함하면 본문 1090px. 코드·악보·핀 설명을 더 많이 줄여야 하고 회로 영역도 작아짐 | 제외 |
| 1600×900 | 사이드바 190px, 본문 1410px. 기존 1600×900 모바일 호스트와 핀 설명 원본 좌표를 활용하며 회로 724×390 및 Entry 블록 원본 좌표 유지 가능 | 선택 |
| 1920×1080 | 본문 1730px로 커져 비율 기반 배치·회로 영역이 기존보다 확대됨. 고정 px 글자와 블록은 상대적으로 작아짐 | 제외 |

사이드바·헤더·본문·이동 버튼·페이지 표시·팝업을 포함하는 1600×900 iframe이 모든 기기의 공통 Stage다. iframe 내부 문서는 고정 논리 좌표이고 호스트만 `min(availableWidth/1600, availableHeight/900)`으로 한 번 축소/확대한다. native dialog top layer도 같은 browsing context 안에 있어 전체 Stage transform을 공유한다.

내부 CSS의 vw/vh는 1600×900 기준 px로 고정했다. 화면 크기 media query, `.9/.78` Entry 화면 축소, fullscreen 전용 grid/위치 분기를 제거했다. `mobile.html`은 공통 호스트의 호환 경로이며 별도 모바일 Stage가 아니다. 콘텐츠 자체 맞춤인 회로 724×390, 핀 설명 원본 1600×900의 **일정한 내부 맞춤**, 코드 영역 맞춤, 애니메이션 transform은 유지했다.

Entry slide: top 12px, bottom 42px. workspace는 slide 높이 100%의 border-box이며 52px toolbar를 그 높이 안에 포함한다. Entry 여부는 실제 `.entry-slide` class로 판단한다. 헤더가 있는 페이지는 고정 Stage 안에서 실제 헤더 높이를 읽어 본문 시작점을 정한다. 물리 viewport 변화로 내부 레이아웃을 다시 계산하지 않는다.

## PC viewport: 자동 계산 결과 (브라우저 실측 아님)

| viewport | scale | Stage 크기 | Stage x/y | 포함·16:9 |
|---|---:|---|---|---|
| 1920×1080 | 1.2 | 1920×1080 | 0 / 0 | 통과 |
| 1600×900 | 1 | 1600×900 | 0 / 0 | 통과 |
| 1366×768 | 0.8533333333 | 1365.333333×768 | 0.333333 / 0 | 통과 |
| 1363×936 | 0.851875 | 1363×766.6875 | 0 / 84.65625 | 통과 |
| 1280×720 | 0.8 | 1280×720 | 0 / 0 | 통과 |
| 1024×768 | 0.64 | 1024×576 | 0 / 96 | 통과 |

사이드바·fullscreen·좌우 이동 버튼의 영역 포함은 계산 테스트에서 확인했다. 헤더·본문 콘텐츠·팝업 전체의 실제 렌더링은 미검증이다.

## DC모터 4페이지, 1363×936 회귀

수정 전은 이전 진단에서의 **실측**. 수정 후는 CSS 논리 크기와 공통 fit으로 산출한 **예상값**이며 getBoundingClientRect 실측이 아니다.

| 영역 | 수정 전 x / y / width / height / bottom | 수정 후 예상 물리 CSS px x / y / width / height / bottom |
|---|---|---|
| wrap | 190 / 0 / 1173 / 936 / 936 | 161.85625 / 84.65625 / 1201.14375 / 766.6875 / 851.34375 |
| active slide | 206 / 112 / 1141 / 782 / 894 | 175.48625 / 94.87875 / 1173.88375 / 720.68625 / 815.565 |
| workspace | 206 / 112 / 1141 / 884 / 996 | 175.48625 / 94.87875 / 1173.88375 / 720.68625 / 815.565 |
| Entry stage | 284 / 164 / 1063 / 832 / 996 | 241.9325 / 139.17625 / 1107.4375 / 676.38875 / 815.565 |

논리 workspace=1378×846, Entry stage=1300×794. 둘 다 부모 안에 포함되는 계산은 통과했다. 본문 전체 위치와 그림의 시각적 관계는 실제 브라우저에서 확인해야 한다.

## 자동 검사 및 기기 결과

실행: `node middle/phyCom/tests/stage-fit.test.cjs`.

- 6개 viewport의 Stage 16:9, viewport 포함, DC4 부모 포함, sidebar/이동 버튼 포함 계산 통과.
- safe-area와 visualViewport offset 계산 통과.
- 네 모듈의 공통 호스트 경로, query 보존, viewport 변경 및 fullscreen 이벤트 모의 테스트 통과.
- 스마트폰 390×844 → 844×390 → 390×844: 불투명 안내/Stage visibility/inert 전환 모의 테스트 통과. 실제 iPhone/Safari 미검증.
- 태블릿 화면을 스마트폰 회전 안내로 차단하지 않는 모의 테스트 통과. 태블릿 가로 fit 계산 통과. 실제 iPad/Safari 미검증.
- 키보드 이벤트를 child body에 전달하고, Entry class 변경에 따라 헤더/본문 시작점을 동기화하는 모의 테스트 통과.
- Stage 내부 CSS에서 viewport 길이 단위, 화면 크기 media query, fullscreen 분기가 남지 않는 정적 검사 통과.
- JS 전체 및 inline JS 문법 검사, 네 모듈 HTML의 ID 중복/stylesheet head 배치, `git diff --check` 통과.
- 회로 JS, LED Entry/PWM, 하드웨어 연결, 버저 악보/학생 코드 JS 원본 보존 검사 통과.
- 버저 JS의 변경은 표시 좌표 호출과 fullscreen 호출 두 줄뿐이며 iPhone Audio Session/AudioContext/재생·정지 로직은 기준 main과 동일함.

`window.lessonStage.audit()`는 실제 화면에서 실행 가능한 overflow 검사기다. 부모의 hidden/clip과 rect를 비교하고 의도적 내부 scroll과 `data-stage-overflow="intentional"`을 구분한다. child rect는 논리 px, `physical`과 `stage`는 호스트 CSS px로 반환한다. 기존 102px 초과를 검출하고 포함 상태를 통과시키는 **합성 DOM 테스트**는 통과했다. 실제 네 모듈에서 이 검사기를 실행한 결과는 아직 없다.

## 네 모듈 검증 범위

| 모듈 | 개념 / 회로 / Entry / popup | 실제 브라우저 |
|---|---|---|
| LED | HTML·CSS·호스트 연결 확인, Entry/PWM controller 보존 | 미검증 |
| 수동버저 | HTML·CSS·호스트 연결 확인, 오디오/악보 controller 보존 | 미검증 |
| DC모터 | HTML·CSS·호스트 연결 및 DC4 판별/예상 부모 포함 확인 | 미검증 |
| 서보모터 | HTML·CSS·호스트 연결 및 motor controller 상태 처리 보존 | 미검증 |

## 남은 예외·main 전 확인 항목

확정된 잔여 overflow 목록은 없다. **실제 화면 전체 검증을 하지 않았으므로 0건이라고 판정할 수 없다.**

의도적 내부 scroll: DC5 `.dc5-stage`, 학생 악보/코드 영역, 긴 실행 팝업과 일부 dialog. 기존 이미지 확대/이동과 장식·애니메이션은 그대로이며 검사 시 실제 오류와 구분해야 한다. 내부 콘텐츠 맞춤 scale은 viewport 반응형 scale과 다르다.

main 반영 전 실제 브라우저에서 네 모듈의 개념/회로/Entry/popup, 정·역방향 단계 복원, 초기 iframe 포커스와 키보드, native dialog 내 이전/다음, fullscreen 진입/종료, Safari 주소창/안전영역/회전 및 홈 화면 실행을 확인해야 한다. 특히 iframe 안의 iPhone 오디오를 실기기에서 재검증해야 한다. 오디오 코드는 보존했지만 browsing context 통합은 재생 환경에 영향을 줄 가능성이 있다. Safari가 fullscreen API를 지원하지 않으면 별도 레이아웃을 흉내 내지 않고 사용 가능 viewport에 맞춘다.

현재 환경의 로컬 브라우저 화면 접근이 차단되어 변경본 브라우저 검증은 수행하지 못했다. Preview 갱신/배포 금지 지시를 유지했다. 이 브랜치는 검토용 구현이며 시각적 검증 완료나 학생 배포 가능 상태로 표시하지 않는다.

## 수정 파일 (24개)

- `middle/phyCom/STAGE_VALIDATION.md`
- `middle/phyCom/WORK_STATUS.md`
- `middle/phyCom/buzzer/buzzer.css`
- `middle/phyCom/buzzer/buzzer.js`
- `middle/phyCom/buzzer/index.html`
- `middle/phyCom/common/css/hardware-connect.css`
- `middle/phyCom/common/css/mobile-fit.css`
- `middle/phyCom/common/css/motor-lesson.css`
- `middle/phyCom/common/css/slides.css`
- `middle/phyCom/common/css/stage-host.css`
- `middle/phyCom/common/css/stage-layout.css`
- `middle/phyCom/common/js/mobile-fit.js`
- `middle/phyCom/common/js/motor-lesson.js`
- `middle/phyCom/common/js/pin-info.js`
- `middle/phyCom/common/js/slides.js`
- `middle/phyCom/common/js/stage-fit.js`
- `middle/phyCom/common/js/stage-geometry.js`
- `middle/phyCom/common/mobile.html`
- `middle/phyCom/common/stage.html`
- `middle/phyCom/dc-motor/index.html`
- `middle/phyCom/led/index.html`
- `middle/phyCom/led/page8.css`
- `middle/phyCom/servo-motor/index.html`
- `middle/phyCom/tests/stage-fit.test.cjs`
