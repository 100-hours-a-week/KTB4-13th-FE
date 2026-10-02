# Frontend Agent Guide

This repository's rules are indexed here; the user's current request always takes precedence.

## Read first

For every frontend task, read in this order:

1. `AGENTS.md`
2. `.docs/ARCHITECTURE.md`
3. `.docs/FRONTEND_CONVENTIONS.md`
4. `.docs/GIT_CONVENTIONS.md` for Git work
5. `.docs/AI_WORKFLOW.md`
6. Relevant existing files and the applicable skill in `.docs/SKILL_DOCS.md`

## Skill routing

| Work | Read skill |
| --- | --- |
| Feature implementation or implementation review | `.agents/skills/frontend-fundamentals/SKILL.md` |
| UI or form work | `.agents/skills/frontend-ui-review/SKILL.md`, then `.agents/skills/frontend-accessibility/SKILL.md` |
| API call, auth, or API type work | `.agents/skills/frontend-api-integration/SKILL.md` |
| Proposed package addition | `.agents/skills/frontend-dependency-review/SKILL.md` |
| Verification | `.agents/skills/frontend-testing/SKILL.md` |
| Final handoff | `.agents/skills/frontend-final-review/SKILL.md` |
| Commit and push in the default flow | `.agents/skills/github-commit/SKILL.md` |
| Issue, branch, or PR request (optional) | `.agents/skills/github-issue/SKILL.md`, `.agents/skills/github-branch/SKILL.md`, or `.agents/skills/github-pr/SKILL.md` |

## Git workflow

`.docs/GIT_CONVENTIONS.md` is the source of truth. In short:

- `main` is the working branch. Implement general requests on `main`, verify, stage only the related files, commit, and push to `origin/main`.
- A general request ("작업해줘", "수정해줘", "반영해줘", "구현해줘") covers implementation through push. A narrower request such as "commit 하지 마", "push 하지 마", or "분석만 해줘" takes precedence.
- Issues, branches, and PRs are optional; create them only when the user asks.
- Destructive Git actions (force push, `reset --hard`, history rewrite, amending or rebasing shared commits, deleting others' changes, large checkouts or reverts) require an explicit user request.

## Backend boundary

The sibling backend repository is read-only reference material during frontend work. Discover it with a relative sibling path; do not hardcode a personal absolute path. Never modify backend files, skills, `AGENTS.md`, or `.docs`; never format, test, install dependencies, stage, commit, push, or switch branches there. If work appears to need a cross-repository change, explain it and wait for the user rather than changing it.
