---
name: github-pr
description: Draft or create a frontend pull request only when the user asks for one; PRs are optional and not part of the default main flow.
---

# Frontend pull request

The default flow in `.docs/GIT_CONVENTIONS.md` commits and pushes directly to `main`. Use this skill only when the user asks for a PR, asks for a review workflow, or the work is on a separate branch. Never create a PR automatically after implementation.

Read `.docs/GIT_CONVENTIONS.md` and the actual frontend PR template first. If no template exists, use the fallback structure in `GIT_CONVENTIONS.md`. Inspect the branch, `git status`, commits, and the full diff from `origin/main` before drafting.

```markdown
## 작업 내용

- ...

## 주요 변경 사항

- ...

## 검증

- [ ] build
- [ ] lint
- [ ] 주요 UI 확인

## 관련 Issue (선택)

- ...

## 참고 사항

- API 미연결
- 후속 작업
- 리뷰 시 확인할 부분
```

Use `<type>: <Korean summary>` for the title. Link an Issue with `Closes #<issue-number>` or `Fixes #<issue-number>` only when a real Issue exists. Base the body on the actual diff and validation results; do not claim backend work, validation, screenshots, or features that are absent. Indicate whether screenshots are useful for UI changes and make review points concrete. Do not merge or enable auto-merge unless the user asks.
