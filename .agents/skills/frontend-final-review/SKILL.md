---
name: frontend-final-review
description: Perform a focused final review of a frontend diff for requirement coverage, project conventions, verified API usage, and handoff risks.
---

# Frontend final review

Use after implementation and before the final response. Review the actual diff and relevant existing files; do not broaden the change merely to satisfy this checklist.

Check for:

- missing requirements, unrelated edits, speculative refactors, duplication, dead/debug code, `console.log`, temporary mocks, and excessive TODOs;
- architecture and convention compliance, type safety, loading/error states, and accessibility;
- mobile layout and the desktop 9:19.5 shell for visual work;
- unverified backend-contract assumptions or accidental dependency changes; and
- the actual lint/build results from `frontend-testing` when those checks were applicable.

In the handoff, list changed files and reasons, verification results, remaining TODOs, deliberately unconnected pieces, and material risks. State clearly when a check or contract could not be verified.
