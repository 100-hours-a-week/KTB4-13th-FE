---
name: frontend-accessibility
description: Review frontend UI changes for semantic HTML, keyboard access, accessible state, and mobile-friendly interaction without adding a UI library.
---

# Frontend accessibility

Use for UI, form, navigation, and interactive-component work. Check the changed interface against the existing design and component conventions.

- Use native semantics: `button` for actions, `a` for navigation, and correctly associated `label` elements for controls. Do not nest interactive elements.
- Ensure every interactive control works by keyboard, has a visible `:focus-visible` treatment, and retains a practical touch target on mobile.
- Give icon-only or otherwise ambiguous controls an accessible name. Use ARIA only to supply missing meaning; prefer native elements and semantics first.
- Announce meaningful async success, error, or status updates with an appropriate `aria-live` region. Communicate disabled and loading states both visually and programmatically, and prevent duplicate submissions.
- Do not make color the only indicator of state; check text, icon, or shape cues and basic contrast against the paper/ink palette.
- Give informative images useful `alt` text. Use empty alt text only for decorative images; never leave product-cover meaning inaccessible when it matters to the task.

Do not add a UI or accessibility dependency solely for this review. Apply only changes that fit the request and existing UI system.
