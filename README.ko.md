<p align="center"><img src="public/logo.svg" width="88" height="88" alt="OpenComponent 로고" /></p>
<h1 align="center">OpenComponent</h1>
<p align="center">실제 컴포넌트로 React 화면을 시각적으로 구성하세요.</p>
<p align="center"><a href="README.md">English</a> · <strong>한국어</strong></p>

OpenComponent는 검토된 컴포넌트를 조합해 React 인터페이스를 만드는 오픈소스 시각적 작업 공간입니다. 디자인 토큰을 정의하고, 컴포넌트를 드래그해 배치하고, 미리보기로 확인한 뒤 독립적인 React 프로젝트로 내보낼 수 있습니다.

익숙한 디자인 도구의 작업 흐름을 참고한 초기 로컬 프로토타입입니다. 프로젝트는 브라우저에 저장되며 계정이나 백엔드 없이 사용할 수 있습니다.

## 소개 영상

https://github.com/user-attachments/assets/60a3fe2c-4172-463f-bd3b-46f0b97ee573

[MP4 다운로드](https://github.com/hoddukzoa12/OpenComponent/raw/refs/heads/main/docs/media/OpenComponent-intro.mp4)

25초 · 1080p · 영어 문구 · 실제 OpenComponent 화면을 기반으로 Motion으로 제작했습니다.

## 주요 기능

- **카탈로그 73개:** shadcn 컴포넌트·조합 66개, Footer를 포함한 자체 요소 5개, Magic UI 지표 컴포넌트 2개. 지원 속성과 제한은 [카탈로그 안내](docs/SHADCN_CATALOG.md)를 참고하세요.
- **여러 화면 관리:** 화면 추가·이름 변경·복제·삭제·전환, 독립적인 컴포넌트 트리와 공유 디자인 토큰.
- **시각적 구성:** 컴포넌트와 레이어 드래그, 콘텐츠·레이아웃 편집, 실행 취소·다시 실행.
- **Design.md:** 화면을 구성하기 전에 밝은/어두운 색상, 글꼴, 간격, 모서리와 그림자 설정.
- **작업 공간 조절:** 양쪽 패널 너비 조절·저장, 캔버스 공간에 화면 전체 맞춤.
- **인터랙티브 Preview:** 전체 창 또는 실제 375/768/1280px 너비에서 저장된 속성을 바꾸지 않고 상호작용 확인.
- **React 내보내기:** 소스, 컴포넌트 구현, 테마 CSS와 직접 의존성 버전이 포함된 Vite 프로젝트 다운로드.

## 시작하기

Node.js **22.12 이상**과 npm이 필요합니다.

```sh
git clone https://github.com/hoddukzoa12/OpenComponent.git
cd OpenComponent
npm ci
npm run dev
```

Vite가 출력한 로컬 주소를 여세요. 첫 실행에서는 설정 화면 예제가 열립니다. 빈 화면은 **Projects → New project → Blank screen**에서 만들 수 있습니다.

## 사용 흐름

1. **Design**에서 토큰을 설정하거나 `Design.md`를 가져와 편집합니다.
2. **Components**에서 검색한 항목을 클릭해 선택한 컨테이너에 넣거나 드롭 위치로 끌어옵니다. **Footer**를 검색하면 브랜드·링크·저작권 문구를 편집하는 푸터를 추가할 수 있습니다.
3. **Screens**, **Layers**, **Properties**에서 화면을 정리하고 속성을 편집합니다. 레이아웃은 모바일 우선이며 768px와 1024px에서 재정의할 수 있습니다.
4. 패널 안쪽 경계를 드래그해 너비를 조절하고 더블클릭으로 기본값을 복원합니다. **Fit screen**은 가로·세로 전체와 위치를 맞춥니다. 긴 화면은 고정 배율로 확대해 편집하세요.
5. **Preview**에서 상호작용과 반응형 너비를 확인합니다. 미리보기 상태는 임시이며 저장할 값은 Properties에서 설정합니다.
6. **Export → React project .zip**을 선택합니다. 압축을 풀고 `npm install`, `npm run dev`를 실행하세요. 배포용 빌드는 `npm run build`로 생성합니다.

| 동작 | 단축키 |
| --- | --- |
| 실행 취소 / 다시 실행 | Cmd/Ctrl+Z / Cmd/Ctrl+Shift+Z |
| 선택 항목 복제 | Cmd/Ctrl+D |
| 선택 항목 삭제 | Delete 또는 Backspace |
| 팝업 닫기 / Preview 종료 | Escape |
| 포커스한 패널 경계 조절 | 좌우 방향키, Shift로 큰 간격, Home/End로 최소·최대 |

## 저장 방식과 현재 제한

프로젝트는 현재 브라우저와 접속 주소의 IndexedDB에 저장됩니다. 이동하거나 보관하려면 프로젝트 JSON 백업을 내보내고 **Projects → Import project**로 복원하세요. 브라우저 저장 공간을 지우면 로컬 프로젝트도 삭제됩니다.

편집기는 데스크톱 브라우저를 대상으로 합니다. 프로젝트 하나에 화면 50개, 노드 500개, 중첩 20단계까지 지원합니다. 조합은 선택된 편집 속성을 제공하며 모든 원시 API나 임의의 자식 구성을 노출하지는 않습니다. Footer는 브라우저 하단에 고정되지 않고 페이지 흐름 안에 배치됩니다.

폼 등의 상호작용은 로컬 예제입니다. 내보낸 뒤 API·인증·저장 기능을 연결하세요. 글꼴은 기기에 설치하거나 출력 프로젝트에 포함해야 합니다. 표는 단순 쉼표 구분 행을 사용하며 인용된 CSV는 지원하지 않습니다. 내보낸 코드를 다시 편집기로 동기화할 수는 없습니다. 출력된 `Design.md`는 기록용이며 실행 중인 테마는 `src/styles.css`에서 수정합니다.

카탈로그는 검토된 소스를 번들로 제공합니다. 컴포넌트별 번들 분리, 브라우저·접근성 검증 확대, 복합 조합의 세부 편집 기능은 개발 중입니다.

## 개발 및 검증

```sh
npm test
npm run build
npm run verify:export
```

내보내기 검증은 임시 폴더에 모든 컴포넌트와 두 화면을 포함한 프로젝트를 생성하고 의존성을 설치해 빌드합니다. npm 레지스트리 접근이 필요합니다. `npm run format`은 제외된 외부 소스를 보존하면서 프로젝트 코드를 정리합니다.

문서 계약은 `src/core/model.ts`, 카탈로그는 `src/core/catalog.ts`, 어댑터는 `src/core/systems.ts`, 소스 생성은 `src/core/generate.ts`에 있습니다. Paperthin은 개발·QA 흐름을 안내하며 애플리케이션은 React로 동작합니다. 로컬 에이전트 설정과 QA 원본 기록은 빌드에 필요하지 않습니다.

개발·검토·컴포넌트 기여는 [CONTRIBUTING.md](CONTRIBUTING.md), 출처는 [SOURCES.md](docs/SOURCES.md)를 참고하세요.

## 로드맵

- 독립적인 테마 어댑터와 내보내기를 갖춘 별도 디자인 시스템으로 Astryx 추가.
- MCP를 통한 카탈로그 검색, 디자인 설정, 화면 편집과 내보내기.
- 컴포넌트 범위, 조합 편집과 번들 크기 개선.

클라우드 협업과 소스 코드 왕복 동기화는 아직 구현하지 않았습니다.

## 라이선스

OpenComponent의 자체 코드는 [Apache License 2.0](LICENSE)을 따릅니다. [NOTICE](NOTICE)도 참고하세요. 포함된 외부 코드는 원래 라이선스를 유지합니다. shadcn/ui와 Magic UI는 MIT, 로고에 사용한 Lucide 아이콘은 ISC 라이선스입니다. [외부 라이선스 고지](public/THIRD_PARTY_LICENSES.txt)와 [소스 기록](docs/SOURCES.md)을 확인하세요.
