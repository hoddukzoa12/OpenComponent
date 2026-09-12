# shadcn 카탈로그 지원 범위

2026-09-12에 확인한 [공식 카탈로그](https://ui.shadcn.com/docs/components)와 [new-york-v4 레지스트리](https://ui.shadcn.com/r/styles/new-york-v4/registry.json)를 기준으로 전체 항목을 편집기에서 선택할 수 있다. **레지스트리 UI 61종과 문서 조합 5종, 총 66개 shadcn 항목**이다. Footer를 포함한 OpenComponent 요소 5개와 Magic UI 2개를 포함한 전체 라이브러리는 73개다.

각 항목은 공식 소스의 대표 조합과 편집 가능한 속성을 제공한다. 원시 컴포넌트의 모든 prop, 하위 요소, 이벤트 연결 기능을 노출한 것은 아니다. 기존 Stack·Grid·Card·Tabs·Dialog는 자식 노드를 배치할 수 있고, 새 항목들은 콘텐츠·옵션·변형·수치·데이터를 속성 패널에서 바꾸는 독립적인 조합이다.

## 카탈로그 구분

| 구분            | 항목 / 동작                                                                                        |
| --------------- | -------------------------------------------------------------------------------------------------- |
| 공식 레지스트리 | 기존 14종과 추가 47종을 포함한 UI 61종                                                             |
| Data Table      | TanStack Table 기반 필터·열 정렬·페이지 이동. 열과 행 편집                                         |
| Date Picker     | Popover와 Calendar 조합. 날짜 선택·기본 날짜·비활성 상태                                           |
| Typography      | 제목, 본문, 인용문, 코드 등 11개 표현                                                              |
| Questionnaire   | 공식 `@shadcn/react/questionnaire` 기반 선택·필수 응답 검증·제출. 현재 편집 조합은 질문 하나       |
| Toast           | 공식 문서의 deprecated 항목. 권장 대체인 Sonner를 사용한다고 카탈로그에 명시                       |
| Direction       | 지역적인 좌→우 / 우→좌 콘텐츠 영역. 프로젝트 전체 언어 설정은 아님                                 |
| Form            | React Hook Form 기반 필수 입력 한 개와 최소 두 글자 검증·로컬 제출. API는 내보낸 프로젝트에서 연결 |
| Sidebar         | 화면 안에 배치하는 인라인 탐색 조합. 항목 선택이 로컬로 반영됨                                     |

문서 목록과 레지스트리의 개수는 같지 않다. Data Table, Date Picker, Typography 등은 여러 기본 요소를 사용하는 조합이며, 레지스트리는 Form과 Sonner도 포함한다. Questionnaire는 같은 고정 리비전의 `bases/radix/ui` 소스를 사용했다. [Toast 공식 안내](https://ui.shadcn.com/docs/components/radix/toast), [Questionnaire 사용법](https://ui.shadcn.com/docs/components/radix/questionnaire).

## 로컬 Footer 블록

Components에서 `Footer`를 검색하거나 OpenComponent 소스로 필터링한다. Brand·Description·Links·Copyright를 편집할 수 있다. Links는 한 줄에 `표시 문구 | URL`을 입력하며, 비어 있거나 지원하지 않는 URL은 일반 텍스트로 표시한다. 외부 HTTP(S) 링크는 새 탭으로 열린다.

Footer는 프로젝트 색상·글꼴·간격을 따르고 좁은 화면에서는 줄을 바꿔 배치한다. 페이지 흐름 안에서 이동하는 조합이며 하단 고정이나 임의 자식 슬롯은 제공하지 않는다. [구현](../src/components/ui/footer.tsx)은 로컬 소스이고, Footer만 내보낼 때는 대형 ExtendedNode 의존성을 포함하지 않는다.

## 편집·테마·내보내기 계약

- [extended-catalog.ts](../src/core/extended-catalog.ts)가 새 항목의 기본값과 속성 패널 스키마를 함께 정의한다. 줄 단위 목록, CSV 행, 날짜 문자열처럼 문서에 저장할 수 있는 값만 사용한다.
- [extended-node.tsx](../src/components/ui/extended-node.tsx)가 캔버스, Preview, 내보낸 앱에서 같은 공식 컴포넌트 조합을 렌더링한다. 편집기 저장소에 의존하지 않는다.
- Chart에는 공유 디자인의 chart 색상, Sidebar에는 sidebar 색상을 사용한다. 새 토큰이 없는 기존 문서에는 기본값을 적용한다.
- 팝업은 프로젝트 테마 영역에 렌더링한다. 지역적인 토스트·폼·탐색 동작은 Preview에서 실험할 수 있으며 프로젝트 문서 값을 수정하지 않는다.
- 내보내기는 로컬 source import를 재귀적으로 수집하고 실제 외부 패키지를 잠금 파일 버전으로 고정한다. 구현체와 테마 CSS, MIT 고지가 포함된다.
- 현재 확장 shadcn 조합을 하나라도 사용하면 공유 ExtendedNode가 가져오는 전체 추가 카탈로그 코드가 내보내기 의존성에 포함된다. 항목별 분할은 남은 번들 최적화 과제다. 자동 생성 API 코드나 백엔드는 포함하지 않는다.

속성을 수정하면 해당 조합의 임시 상호작용 상태가 초기화된다. 옵션 목록은 빈 줄과 중복을 제거하지만 표의 행·차트 데이터·메시지는 같은 내용의 반복도 유지한다.

CSV 편집은 쉼표로 구분하는 간단한 형식이다. 인용된 쉼표나 복잡한 중첩 데이터 편집기는 아직 제공하지 않는다. URL 이미지에는 HTTPS 또는 PNG/JPEG/WebP/GIF data URL을 사용한다.

## 출처와 검증

소스 리비전은 [`3ba91b1cc83e1bbe4ab35a422ff2a694849c5048`](https://github.com/shadcn-ui/ui/tree/3ba91b1cc83e1bbe4ab35a422ff2a694849c5048)이다. 각 소스의 실제 응답 해시, 로컬 파일 해시, 편집기 통합 변경 사항은 [소스 명세](catalog/shadcn-sources.json)에 기록했다. 핵심 변경은 import 경로, 테마 팝업 영역, Sidebar의 전역 쿠키 쓰기 제거, 프로젝트 viewport 참조다. 원본 소스의 MIT 라이선스를 유지한다.

검증 명령과 현재 제한은 [README](../README.md#development)에 정리했다. 컴포넌트 변경 시 실제 브라우저 상호작용과 새로 내보낸 React 프로젝트를 함께 확인한다. 서버 렌더링 성공만으로 상호작용 QA를 통과했다고 판정하지 않는다.
