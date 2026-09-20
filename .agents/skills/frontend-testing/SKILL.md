---
name: frontend-testing
description: Verify frontend changes using only the scripts, dependencies, and test tooling that actually exist in this repository.
---

# Frontend verification

Use before handing off a frontend implementation. Start by inspecting `package.json`; never claim a command was run when it does not exist.

Run the applicable checks in this order when they exist and are relevant:

1. Inspect available scripts and dependencies.
2. Run lint.
3. Run the production build, including TypeScript checking when it is part of the build script.
4. For UI work, inspect mobile and desktop shell layouts and look for console errors using the available development workflow.

Do not invent test commands, report uninstalled frameworks as tests, or install tooling solely to make a validation step possible. Report skipped checks and their reason accurately.
