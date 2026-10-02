# Git Conventions

This is the frontend Git workflow source of truth. `AGENTS.md`, `.docs/AI_WORKFLOW.md`, `.docs/SKILL_DOCS.md`, and the `github-*` skills follow this file.

## Default Flow

```text
Check main → Implement → Verify → Review diff → Stage → Commit → Push
```

Work directly on `main`. Issues, branches, and pull requests are optional and used only when the user asks for them.

A general request such as "작업해줘", "수정해줘", "반영해줘", or "구현해줘" covers the whole flow through commit and push. A narrower request takes precedence, for example "commit 하지 마", "push 하지 마", "로컬 수정까지만", "분석만 해줘", or "PR만 만들어".

## Working on main

- Confirm the current branch is `main` and check `git status` before starting.
- Fetch and compare with `origin/main` when possible.
- Do not overwrite existing uncommitted changes. Leave other people's or unrelated changes untouched, and do not include them in your commit.

## Commit

```text
<type>: <Korean summary>
```

- Types: `feat`, `fix`, `refactor`, `test`, `docs`, `chore`.
- Keep the summary action-oriented, short, and without a final period. Do not use `WIP` or vague `update`/`change` messages.
- An Issue number such as `(#123)` is optional; add it only when a real Issue exists and should be linked.
- Commit only after the relevant validation passes.
- Before staging, review `git status`, the staged diff, the unstaged diff, and untracked files. Stage only the files for this change.
- Never commit secrets, personal settings, or build artifacts.

## Push

- Push to `origin/main` directly. A push to `main` runs CI (lint and build) and dispatches the Dev deployment, so verify before pushing.
- Never force-push.
- If `origin/main` is ahead, check what changed before integrating it. If integration conflicts, stop and report instead of resolving it by force.
- Do not delete unrelated commits or rewrite history.

## Optional Issue

- Create an Issue only when the user asks, when long-term tracking is needed, or when team collaboration requires it. It is not a prerequisite for implementation.
- Title: `<type>: <Korean summary>`. Creating an Issue does not create a branch, commit, or PR.

## Optional Branch

- Create a separate branch only when the user asks for branch-based work.
- Branch from the latest `main` and keep the existing style `<type>/<kebab-case-summary>`; an Issue number such as `<type>/<issue-number>-<summary>` is optional.
- Preserve uncommitted work when creating or switching branches.

## Optional Pull Request

- Create a PR only when the user asks for one, asks for a review workflow, or the work is on a separate branch.
- Title: `<type>: <Korean summary>`. Linking an Issue (`Closes #<issue-number>`) is optional and only for a real Issue.
- Do not merge or enable auto-merge unless the user asks.
- This repository has no PR template. Use these sections:

```markdown
## Summary
## Changes
## Related Issue (optional)
## Validation
- 실행한 검증 및 결과:
- 미검증 사항 및 사유:
## Notes
```

## Safety Rules

These require an explicit user request even within the default flow:

- force push
- `git reset --hard` or other discarding of work
- rewriting shared history, amending existing commits, or rebasing commits that were already pushed
- deleting other people's changes
- large checkouts or reverts

The sibling backend repository is read-only: never modify, format, test, install dependencies in, stage, commit, push, or switch branches there.
