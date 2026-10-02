# AI Workflow

AI로 작업할 때는 아래 순서를 따릅니다. 사용자가 범위를 제한하면("commit 하지 마", "push 하지 마", "분석만 해줘", "수정까지만 해줘") 그 요청이 우선합니다.

1. 현재 branch가 `main`인지, `git status`와 `origin/main` 상태를 확인합니다. 기존 uncommitted 변경은 덮어쓰지 않습니다.
2. `AGENTS.md`, `.docs/ARCHITECTURE.md`, `.docs/FRONTEND_CONVENTIONS.md`, `.docs/GIT_CONVENTIONS.md`와 관련 파일을 확인합니다.
3. 기존 component, hook, utility와 중복 기능이 있는지 찾고 재사용을 우선합니다.
4. API 계약이 필요하면 sibling backend를 read-only로 확인합니다. 계약을 추측하거나 실제 요청처럼 보이는 mock을 만들지 않습니다.
5. `main`에서 요청 범위만 최소로 구현합니다. dependency, 새로운 architecture pattern, Tailwind 이외의 스타일링 방식을 임의로 추가하지 않고, 요청과 무관한 파일을 수정하거나 전체 구조를 리팩터링하지 않습니다. 공통 component 수정 전에는 사용처와 영향 범위를 확인합니다.
6. 관련 frontend skill 기준으로 구현을 검토합니다.
7. typecheck, lint, build 등 repository에 실제로 있는 검증을 실행합니다.
8. `frontend-final-review`로 diff를 검토합니다.
9. 관련 파일만 stage합니다.
10. `main`에 commit합니다.
11. `origin/main`에 push합니다.
12. 변경한 파일과 이유, 검증 결과, commit SHA와 push 결과를 보고합니다.

## Skill workflow

- 기능 구현 뒤에는 `frontend-fundamentals`를 사용합니다.
- UI 작업에는 `frontend-ui-review`와 `frontend-accessibility`를 사용합니다.
- API 연동에는 기존 frontend 명세를 먼저 확인하고, 필요한 경우에만 `frontend-api-integration`에 따라 sibling backend를 읽기 전용으로 확인합니다. 계약이 불명확하면 추측해 연결하지 않습니다.
- package 추가 전에는 `frontend-dependency-review`를 사용합니다. 명시적 요청 또는 승인 전에는 설치하지 않습니다.
- 완료 전에는 실제 scripts 기준으로 `frontend-testing`, 이어서 diff 기준 `frontend-final-review`를 사용합니다.
- commit과 push에는 `github-commit`을 사용합니다.
- Issue, 별도 branch, PR은 기본 흐름이 아니며 사용자가 요청할 때만 `github-issue`, `github-branch`, `github-pr`을 사용합니다. 구현이 끝났다고 PR을 자동으로 만들지 않습니다.
- force push, `reset --hard`, history rewrite 같은 destructive Git action은 `.docs/GIT_CONVENTIONS.md`에 따라 명시적 요청이 있을 때만 수행합니다.

## Backend read-only policy

Backend는 sibling repository `../KTB4-13th-BE`를 포함한 frontend API 계약 확인용 read-only reference입니다. path는 현재 frontend repository에서 상대 경로로 확인하며 개인 absolute path를 문서에 추가하지 않습니다. backend 코드, skill, `AGENTS.md`, `.docs`를 포함한 파일을 생성·수정·삭제·이동하지 않고, backend에서 formatter, test, dependency 설치, stage, commit, push, branch 변경도 수행하지 않습니다. Cross-repo 변경이 필요하면 자동으로 수행하지 않고 사용자에게 알립니다.

## Mobile UI rules

모든 Page는 `AppLayout` 안에서 렌더링됩니다. Page의 기본 좌우 여백은 `page-content`(20px)를 사용합니다. 간격은 Tailwind 기본 spacing scale을 우선 사용하고, section 간격에는 보통 `gap-6` 또는 `space-y-6`부터 검토합니다.

Typography는 `type-display`, `type-heading`, `type-subheading`, `type-title`, `type-body`, `type-body-small`, `type-caption`을 필요한 경우에만 사용합니다. Button과 입력 control에는 Tailwind 기본 radius 또는 `rounded-control`을 사용합니다.

하단 고정 CTA가 필요한 화면만 `padding-bottom: env(safe-area-inset-bottom)`을 적용합니다. 모든 화면에 safe area padding을 강제하지 않습니다.
