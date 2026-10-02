---
name: github-issue
description: Draft or create a concise frontend tracking Issue only when the user asks; Issues are optional and not a prerequisite for implementation.
---

# Frontend GitHub Issue

Use only when the user asks to write or create a frontend Issue. Issues are optional tracking in `.docs/GIT_CONVENTIONS.md`; normal implementation does not need one. Read that file, current frontend architecture, and actual repository Issue templates and labels before creating one. Use the title format `<type>: <Korean summary>`.

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

Keep it factual and bounded. Do not write unverified requirements as facts, force a detailed implementation prematurely, or combine broad frontend and backend work in one issue. Confirm actual labels before applying them. Drafting is not a request to create the Issue: create one only when the user asks. Creating an Issue does not automatically create a branch, commit, or PR.
