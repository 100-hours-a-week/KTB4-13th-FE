# Frontend Code Conventions

This document is the source of truth for frontend code rules. Architecture placement is defined in `ARCHITECTURE.md`; Git workflow is defined in `GIT_CONVENTIONS.md`; detailed implementation review is in the relevant frontend Skills.

## Naming

- React component, component file, TypeScript type/interface는 `PascalCase`를 사용합니다.
- Hook은 `useSomething`, 일반 함수와 변수는 `camelCase`를 사용합니다.
- Boolean은 `is`, `has`, `can`, `should`로 시작합니다.
- Event handler는 `handleSomething`, props callback은 `onSomething` 형식을 사용합니다.
- 일반 module은 역할을 드러내는 `camelCase.ts`를 기본으로 합니다. 상수는 기존 파일의 스타일을 따르며, 의미 있는 module-level constant에만 `UPPER_SNAKE_CASE`를 사용합니다.

## Components and React

- 화면 전체는 Page, 기능 UI·로직은 Feature, 실제 범용 UI만 Common에 둡니다. page-local component는 page와 co-location합니다.
- JSX 길이만으로 component를 분리하지 않고 의미 있는 책임 단위로 분리합니다. props drilling 회피나 미래 예측만으로 전역 상태·공통화를 도입하지 않습니다.
- 함수형 component와 Hook을 사용하고, Hook은 최상위에서만 호출합니다. render 중 side effect를 만들지 않습니다.
- 계산 가능한 값은 별도 state로 저장하지 않습니다. `useEffect`는 외부 시스템 동기화에만 사용하고, 필요 없는 `useMemo`와 `useCallback`은 추가하지 않습니다.
- 서버 데이터와 화면 local state를 구분합니다. 화면 요구에 맞는 loading, error, empty state와 재시도 동작을 고려합니다.
- 목록 key는 안정적인 식별자를 우선하며, 순서가 변할 수 있는 목록에 index를 사용하지 않습니다.

## TypeScript

- `any`와 불필요한 `as`를 피합니다. 불확실한 외부 입력은 `unknown`부터 좁힙니다.
- API type은 검증된 backend contract를 기준으로 작성합니다. optional과 nullable은 서로 다른 의미로 사용합니다.
- props는 필요한 값만 노출하고, type과 interface 선택은 가까운 기존 코드의 스타일을 우선합니다.

## Imports

`@/`는 `src/`를 가리킵니다. 깊은 상대 경로 대신 기존 alias를 우선 사용하고 가까운 local module은 상대 경로를 허용합니다. ESLint가 정한 import 순서를 우선하며, alias를 불필요하게 늘리거나 circular dependency를 만들지 않습니다.

## Tailwind CSS

- Tailwind CSS v4를 기본으로 사용합니다. `global.css`의 semantic token, typography, radius를 우선 재사용하고 arbitrary color/spacing/font-size 남용을 피합니다.
- CSS Module과 CSS-in-JS는 요청 없이 도입하지 않습니다. inline style은 동적 값처럼 명확한 이유가 있을 때만 사용합니다.
- `AppLayout`이 mobile viewport와 desktop 9:19.5 shell을 관리합니다. Page에서 shell 폭이나 aspect ratio를 재정의하지 않습니다.

## Accessibility

- semantic HTML과 올바른 interactive element를 사용하고 keyboard 접근과 `focus-visible`을 보장합니다.
- form control은 label을 갖고, 이미지에는 목적에 맞는 alt를 제공합니다.
- native semantics를 우선하며 loading/disabled 상태를 전달합니다. color만으로 상태를 표현하지 않습니다.

## API, environment, and hygiene

- API endpoint, request, response, status, auth/token 정책을 추측하지 않습니다. 필요하면 sibling backend `../KTB4-13th-BE`를 read-only로 확인합니다.
- secret은 코드·로그·문서에 하드코딩하지 않습니다. `VITE_` 변수는 browser에 노출될 수 있으므로 공개 가능한 값만 사용합니다.
- `console.log`, 임시 mock, 죽은 코드와 사용하지 않는 asset은 작업 완료 전에 제거합니다. 남겨야 할 TODO는 미확정 계약 또는 후속 작업을 구체적으로 설명합니다.
- 새 dependency는 `frontend-dependency-review`에 따라 검토하고 명시적 승인 전에는 설치하지 않습니다.
