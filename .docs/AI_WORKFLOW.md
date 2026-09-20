# AI Workflow

AI로 작업할 때는 아래 순서를 따릅니다.

1. `.docs` 문서, 현재 파일 구조와 관련 파일을 먼저 확인합니다.
2. `AGENTS.md`, `.docs/ARCHITECTURE.md`, `.docs/FRONTEND_CONVENTIONS.md`를 읽습니다.
3. 기존 component, hook, utility가 있는지 찾고 재사용을 우선합니다.
4. dependency, 새로운 architecture pattern, Tailwind 이외의 스타일링 방식을 임의로 추가하지 않습니다.
5. API 계약을 추측하지 않습니다. backend 명세가 불확실하면 실제 요청처럼 보이는 mock을 만들지 않습니다.
6. feature 구조를 임의로 세분화하거나 common으로 과도하게 승격하지 않습니다.
7. 요청과 무관한 파일은 수정하지 않고, 기능 하나 때문에 전체 구조를 리팩터링하지 않습니다.
8. 공통 component 수정 전에는 사용하는 곳과 영향 범위를 확인합니다.
9. 작업 뒤에는 변경한 파일과 이유를 보고하고, 가능한 범위에서 build, typecheck, lint를 검증합니다.
10. Git 작업에는 `.docs/GIT_CONVENTIONS.md`와 관련 Git Skill을 읽습니다.

## Skill workflow

- 기능 구현 뒤에는 `frontend-fundamentals`를 사용합니다.
- UI 작업에는 `frontend-ui-review`와 `frontend-accessibility`를 사용합니다.
- API 연동에는 기존 frontend 명세를 먼저 확인하고, 필요한 경우에만 `frontend-api-integration`에 따라 sibling backend를 읽기 전용으로 확인합니다. 계약이 불명확하면 추측해 연결하지 않습니다.
- package 추가 전에는 `frontend-dependency-review`를 사용합니다. 명시적 요청 또는 승인 전에는 설치하지 않습니다.
- 완료 전에는 실제 scripts 기준으로 `frontend-testing`, 이어서 diff 기준 `frontend-final-review`를 사용합니다.
- Issue 요청에는 `github-issue`, branch 생성 요청에는 `github-branch`, commit 요청에는 `github-commit`, PR 요청에는 `github-pr`을 사용합니다.
- Issue 생성 후 branch를 자동 생성하지 않고, branch 생성 후 commit하지 않으며, commit 후 push하지 않고, push 후 PR을 만들지 않습니다.

## Backend read-only policy

Backend는 sibling repository `../KTB4-13th-BE`를 포함한 frontend API 계약 확인용 read-only reference입니다. path는 현재 frontend repository에서 상대 경로로 확인하며 개인 absolute path를 문서에 추가하지 않습니다. backend 코드, skill, `AGENTS.md`, `.docs`를 포함한 파일을 생성·수정·삭제·이동하지 않고, backend에서 formatter, test, dependency 설치, stage, commit, push, branch 변경도 수행하지 않습니다. Cross-repo 변경이 필요하면 자동으로 수행하지 않고 사용자에게 알립니다.

## Mobile UI rules

모든 Page는 `AppLayout` 안에서 렌더링됩니다. Page의 기본 좌우 여백은 `page-content`(20px)를 사용합니다. 간격은 Tailwind 기본 spacing scale을 우선 사용하고, section 간격에는 보통 `gap-6` 또는 `space-y-6`부터 검토합니다.

Typography는 `type-display`, `type-heading`, `type-subheading`, `type-title`, `type-body`, `type-body-small`, `type-caption`을 필요한 경우에만 사용합니다. Button과 입력 control에는 Tailwind 기본 radius 또는 `rounded-control`을 사용합니다.

하단 고정 CTA가 필요한 화면만 `padding-bottom: env(safe-area-inset-bottom)`을 적용합니다. 모든 화면에 safe area padding을 강제하지 않습니다.
