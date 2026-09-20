# Git Conventions

This is the frontend Git workflow source of truth. It follows the verified team conventions in the sibling backend while applying them to this repository.

## Flow

```text
Issue → Branch → Commit → Pull Request → Review → Merge → Issue close
```

One Issue, branch, and PR should normally have one focused purpose. Each Git or GitHub action requires an explicit user request; completing one step does not authorize the next.

## Issue

Create an Issue before implementation when the work is being tracked. Titles use one of `feat`, `fix`, `refactor`, `test`, `docs`, or `chore`:

```text
<type>: <Korean summary>
```

State the background, goal, scope, exclusions, completion conditions, and dependencies. Confirm actual repository labels and templates before applying them. Issue creation does not create a branch.

## Branch

`main` is the base branch. Do not work directly on it or push to it. Confirm the latest base state and an actual Issue number before creating a branch:

```text
<type>/<issue-number>-<kebab-case-summary>
```

Examples: `feat/123-login-screen`, `fix/124-login-layout`, `docs/125-git-conventions`.

The Issue number is required; never invent one. Keep unrelated work out of a branch. The verified backend rules do not prescribe automatic branch deletion, so delete a merged branch only when the repository policy or user request confirms it.

## Commit

Make independently understandable, reversible commits. The message format is:

```text
<type>: <Korean summary>(#<issue-number>)
```

Use the same six types as Issues. Keep summaries action-oriented, short, and without a final period. Do not use `WIP`, vague `update`, or vague `change` messages. Stage only approved paths after reviewing staged and unstaged diffs. Never commit secrets, personal settings, or build artifacts.

Do not commit on `main`. If a branch and Issue do not match, stop and resolve the discrepancy before staging. Push is a separate explicit action.

## Pull Request

Open a PR from the Issue branch into `main` only after its scope and validation are reviewed. The title is:

```text
<type>: <Korean summary>
```

The body must distinguish completed checks from skipped or failed checks and include the real Issue connection under Related Issue:

```text
Closes #<issue-number>
```

`Fixes #<issue-number>` is also valid when appropriate. For UI work, state whether screenshots are needed. Document unconnected APIs and remaining TODOs. Keep PRs reviewable; the backend convention recommends around 400 changed lines, not a hard limit.

This frontend repository currently has no PR template. Until one is added, use the backend-aligned sections below in this order:

```markdown
## Summary
## Changes
## Related Issue
Closes #<issue-number>
## Validation
- 실행한 검증 및 결과:
- 미검증 사항 및 사유:
## Notes
```

Do not force-push, merge, enable auto-merge, or push to `main` without a separate explicit request. Do not claim uncommitted changes are part of a PR.
