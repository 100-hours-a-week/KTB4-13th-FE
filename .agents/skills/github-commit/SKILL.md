---
name: github-commit
description: Commit verified, scoped frontend changes on main and push them to origin/main as the default delivery step.
---

# Frontend commit and push

Use at the end of the default flow in `.docs/GIT_CONVENTIONS.md`, after implementation and validation. Read that file first. Skip committing or pushing when the user limited the request (for example "commit 하지 마", "push 하지 마", "로컬 수정까지만"), and stop at whichever step they allowed.

1. Confirm the current branch is `main`, fetch, and compare with `origin/main`.
2. Inspect `git status`, the staged diff, the unstaged diff, and untracked files. Confirm the changed-file scope matches the request.
3. Confirm the relevant validation passed and report its result.
4. Stage only the files for this change. Preserve unrelated existing staged or unstaged changes and never include other people's work.
5. Keep one commit to one logical change; split unrelated edits. Use `<type>: <Korean summary>` with an action-oriented summary and no final period. Add `(#<issue-number>)` only when a real Issue is linked. Describe only implemented work, and exclude generated files, secrets, and personal config.
6. Push to `origin/main`. Pushing to `main` triggers CI and the Dev deployment. If `origin/main` is ahead, inspect it before integrating; if integration conflicts, stop and report.

Never force-push, amend or rebase pushed commits, reset with `--hard`, or rewrite history without an explicit request. Do not stage, commit, or push in the backend repository.
