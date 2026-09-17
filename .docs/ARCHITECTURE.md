# Frontend Architecture

## Current stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

북적북적은 Feature-based Frontend Architecture를 사용하는 모바일 웹 서비스입니다. 복잡한 FSD 구조는 도입하지 않습니다. 모든 화면은 공통 `AppLayout` 안에서 렌더링됩니다. 좁은 화면에서는 실제 viewport 너비를 사용하고, 넓은 화면에서는 viewport 높이를 기준으로 9:19.5 비율의 세로형 shell을 가운데에 배치합니다.

## Folder responsibilities

| Folder | Responsibility |
| --- | --- |
| `app` | 앱 진입점, 전역 레이아웃, Router, Provider처럼 앱 전체에 적용되는 설정 |
| `pages` | URL 또는 화면 단위 구성 |
| `features` | 로그인, 장바구니처럼 큰 사용자 기능 영역의 UI와 로직 |
| `common` | 두 곳 이상에서 실제로 재사용되는 API 기반 코드, UI, hook, type, utility |

`pages`는 화면을 조합하고, 기능의 세부 동작은 필요할 때 `features`에 둡니다. Page에서만 쓰는 UI는 해당 page 폴더 안에 둡니다. 여러 화면에서 재사용되는 기능은 `features`로, 특정 기능에 종속되지 않는 공통 코드는 `common`으로 옮깁니다. 기능이 생기기 전에는 feature 폴더를 미리 만들지 않습니다.

## Dependency direction

`app`은 `pages`, `features`, `common`을 조합할 수 있습니다. `pages`는 `features`와 `common`을 사용할 수 있고, `features`는 `common`을 사용할 수 있습니다. `common`은 상위 레이어에 의존하지 않습니다.

새 파일을 만들 때는 먼저 그것이 화면인지, 사용자 기능인지, 실제 공통 코드인지를 판단합니다. 아직 필요하지 않은 기능 폴더나 공통 추상화는 만들지 않고, 기능을 구현하는 시점에 생성합니다.
