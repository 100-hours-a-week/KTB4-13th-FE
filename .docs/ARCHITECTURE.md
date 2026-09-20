# Frontend Architecture

## Current stack

- React 19
- TypeScript
- Vite
- Tailwind CSS 4

북적북적은 Feature-based Frontend Architecture를 사용하는 모바일 웹 서비스입니다. 복잡한 FSD 구조는 도입하지 않습니다. 모든 화면은 공통 `AppLayout` 안에서 렌더링됩니다. 좁은 화면에서는 실제 viewport 너비를 사용하고, 넓은 화면에서는 viewport 높이를 기준으로 9:19.5 비율의 세로형 shell을 가운데에 배치합니다.

## Source structure

```text
src/
├── app/       # App, Router, Layout, provider, global styles
├── pages/     # URL and screen composition
├── features/  # user-oriented feature UI and logic
├── common/    # feature-independent reusable UI, hooks, types, utilities, API client
└── main.tsx
```

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

## Placement rules

- URL path와 route composition은 `app/router`와 `pages`가 소유합니다. URL은 소문자 kebab-case를 사용하고, 화면 전용 UI는 page 가까이에 둡니다.
- API client와 공통 transport/error handling은 실제 재사용이 확인된 경우 `common`에 둡니다. feature 전용 API type과 adapter는 해당 feature 가까이에 둡니다.
- 공통 `AppLayout`이 mobile viewport와 desktop shell을 소유합니다. Page는 shell 폭이나 aspect ratio를 다시 정의하지 않습니다.
- 이미지와 정적 asset은 의미가 드러나는 kebab-case 이름을 사용합니다. feature 전용 asset은 feature/page 가까이에, 공유 asset은 `src/assets` 또는 `public`에 둡니다.

새 파일을 만들 때는 먼저 그것이 화면인지, 사용자 기능인지, 실제 공통 코드인지를 판단합니다. 아직 필요하지 않은 기능 폴더나 공통 추상화는 만들지 않고, 기능을 구현하는 시점에 생성합니다.
