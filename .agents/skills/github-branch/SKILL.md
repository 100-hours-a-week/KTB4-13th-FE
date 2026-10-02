---
name: github-branch
description: Create or manage a separate frontend Git branch only when the user explicitly asks for branch-based work; the default flow works on main.
---

# Frontend Git branch

The default flow in `.docs/GIT_CONVENTIONS.md` works directly on `main`. Use this skill only when the user explicitly asks for a separate branch.

1. Inspect the current branch, `git status`, and the base. Use the latest `main` as the base unless the user names another.
2. Name the branch in the existing style `<type>/<kebab-case-summary>`. Include an Issue number (`<type>/<issue-number>-<summary>`) only when a real Issue exists; never invent one.
3. Preserve uncommitted work and existing branches. If the working tree or an existing branch makes creation unsafe, explain the conflict before acting.

Creating a branch does not by itself create an Issue or PR. Do not modify backend repositories.
