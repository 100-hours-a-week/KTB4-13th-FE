# Frontend Conventions

## Naming

- React component와 TypeScript type/interface는 `PascalCase`를 사용합니다.
- Hook은 `useSomething` 형식을 사용합니다.
- 일반 함수와 변수는 `camelCase`를 사용합니다.
- React component 파일은 `PascalCase.tsx`, 일반 module 파일은 역할을 드러내는 `camelCase.ts`를 기본으로 합니다.

## Components

Page는 화면과 URL 단위의 조합을 담당하고, Feature component는 큰 사용자 기능 영역을 담당합니다. 한 화면 전용 UI는 해당 page 안에 둡니다. 여러 화면에서 같은 책임으로 재사용되는 component만 `common/components`에 둡니다. feature와 common으로 과도하게 승격하지 않습니다.

props는 component가 실제로 필요한 값만 받습니다. 사용 사례가 생기기 전부터 많은 variant나 지나치게 범용적인 component를 만들지 않습니다.

## Tailwind CSS

Tailwind CSS를 기본 스타일링 방식으로 사용합니다. 색상은 `background`, `surface`, `text-primary`, `primary` 같은 semantic token을 우선 사용합니다. 반복되는 의미 있는 스타일은 공통화할지 검토하되, arbitrary value 남용과 새 CSS-in-JS 방식의 도입은 피합니다.

## TypeScript

`any`와 불필요한 type assertion을 최소화합니다. 확정되지 않은 API response는 추측해 type으로 만들지 않습니다.

## Imports

`@/`는 `src/`를 가리킵니다. 깊은 상대 경로 대신 기존 alias를 우선 사용합니다. 가까운 파일끼리는 간단한 상대 경로를 사용해도 됩니다.
