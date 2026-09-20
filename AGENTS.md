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
| Issue, commit, or PR request | `.agents/skills/github-issue/SKILL.md`, `.agents/skills/github-commit/SKILL.md`, or `.agents/skills/github-pr/SKILL.md` |
| Issue-linked branch request | `.agents/skills/github-branch/SKILL.md` |

## Repository boundary and Git actions

The sibling backend repository is read-only reference material during frontend work. Discover it with a relative sibling path; do not hardcode a personal absolute path. Never modify backend files, skills, `AGENTS.md`, or `.docs`; never format, test, install dependencies, stage, commit, push, or switch branches there. If work appears to need a cross-repository change, explain it and wait for the user rather than changing it.

Only create Issues, create/switch branches, stage, commit, push, or create PRs when the user explicitly requests that exact action. Each action is separate: Issue does not authorize branch creation, branch does not authorize commit, commit does not authorize push, and push does not authorize PR creation. A request to draft related content is not authorization to perform the GitHub or Git operation.
