---
name: github-branch
description: Propose or create a frontend Issue-linked Git branch using the repository Git conventions, only when the user explicitly requests branch creation.
---

# Frontend Git branch

Read `.docs/GIT_CONVENTIONS.md` before branch work. Inspect the current branch, working tree, base ref, and actual Issue number.

1. Confirm the Issue number from the user or existing Issue. Never invent one.
2. Confirm `main` as the base and propose `<type>/<issue-number>-<kebab-case-summary>` using the Issue type and a short English slug.
3. Preserve uncommitted work and existing branches. If the working tree or target branch makes creation unsafe, explain the conflict before acting.
4. Create or switch a branch only when the user explicitly requests that operation. Branch creation does not authorize a commit, push, Issue creation, or PR creation.

Do not create a branch directly from an unverified base, work on `main`, or modify backend repositories.
