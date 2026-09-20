---
name: frontend-fundamentals
description: Review or implement React frontend code for readable, predictable, cohesive, and appropriately simple changes within this project's architecture.
---

# Frontend fundamentals

Use this skill while implementing a frontend feature or for the implementation self-review. Follow `AGENTS.md`, `.docs/ARCHITECTURE.md`, and `.docs/FRONTEND_CONVENTIONS.md` first.

Review the changed code with these questions:

- **Readability:** Do names explain the role, and does each component or function have a focused responsibility? Simplify deeply nested conditions when doing so improves the current change. Prefer code that explains itself over comments that merely narrate it.
- **Predictability:** Does the name match behavior? Do equivalent UI states use the established pattern? Keep side effects visible at their trigger point and avoid surprising mutation or implicit navigation.
- **Cohesion:** Keep code that changes together near the page or feature that owns it. Do not promote page-local code to `common` before a second real use exists.
- **Coupling:** Preserve the dependency direction: `app → pages/features/common`, `pages → features/common`, `features → common`. `common` must not depend on a feature or page.
- **Abstraction:** Extract only when it clarifies a repeated, stable responsibility. Do not add variants, layers, or future-oriented structure without a present use case.

Use this as a review guide, not authorization to refactor unrelated code or change the project architecture.
