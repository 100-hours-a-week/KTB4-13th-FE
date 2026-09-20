---
name: github-pr
description: Draft a frontend pull-request body from the actual diff, or create a PR only when the user explicitly authorizes it.
---

# Frontend pull-request drafting

Use when the user asks to prepare or create a frontend PR. Read `.docs/GIT_CONVENTIONS.md` and the actual frontend PR template first. If no template exists, use the fallback structure in `GIT_CONVENTIONS.md`. Inspect the Issue-linked branch, `git status`, commits, and full diff from `origin/main` before drafting.

```markdown
## 작업 내용

- ...

## 주요 변경 사항

- ...

## 검증

- [ ] build
- [ ] lint
- [ ] 주요 UI 확인

## 관련 Issue

- ...

## 참고 사항

- API 미연결
- 후속 작업
- 리뷰 시 확인할 부분
```

Use `<type>: <Korean summary>` for the title and connect the real Issue with `Closes #<issue-number>` or `Fixes #<issue-number>` in the body. Do not claim backend work, validation, screenshots, or features that are absent from the diff. Indicate whether screenshots are useful for UI changes and make review points concrete. Drafting does not authorize branch changes, pushes, PR creation, merge, or auto-merge; each requires the user's explicit request.
