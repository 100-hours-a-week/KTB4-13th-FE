---
name: github-commit
description: Prepare a frontend commit plan and accurate commit message while preserving repository conventions and requiring explicit authorization for Git mutations.
---

# Frontend commit preparation

Use when the user requests commit preparation, a commit message, or an actual commit. Read `.docs/GIT_CONVENTIONS.md` first, then inspect the current branch, matching Issue number, `git status`, staged diff, unstaged diff, and untracked files.

- Never commit on `main`. Confirm the branch follows `<type>/<issue-number>-<slug>` and matches the actual Issue; do not infer an Issue number.
- Keep one commit to one logical change; separate unrelated edits. Stage only approved paths and preserve unrelated existing staged changes.
- Use `<type>: <Korean summary>(#<issue-number>)`, with an action-oriented summary and no final period. Describe only implemented work and exclude generated files, secrets, and personal config.
- Run relevant validation before committing when the change warrants it, and report the result.

Without an explicit request to commit, provide the plan or message only. Do not stage, commit, push, or change branches. An explicit commit request does not imply permission to push or alter other repositories.
