---
name: github-issue
description: Draft a concise, implementation-ready frontend GitHub Issue without creating it unless the user explicitly requests creation.
---

# Frontend GitHub Issue drafting

Use when the user asks to write or prepare a frontend issue. Read `.docs/GIT_CONVENTIONS.md`, current frontend architecture, and actual repository Issue templates and labels before creating one. Use the title format `<type>: <Korean summary>`.

Use this shape, adapting sections only when the request needs it:

```markdown
## 작업 내용

무엇을 구현/수정하는지

## 작업 범위

- ...

## 구현 고려사항

- architecture/convention
- API dependency
- UI state
- 예외 처리

## 완료 조건

- ...

## 제외 범위

- ...
```

Keep it factual and bounded. Do not write unverified requirements as facts, force a detailed implementation prematurely, or combine broad frontend and backend work in one issue. Confirm actual labels before applying them. Drafting is not authorization to create an Issue: create one only on an explicit request. Creating an Issue does not authorize a branch, commit, push, or PR.
