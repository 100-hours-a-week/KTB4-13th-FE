---
name: frontend-ui-review
description: Review Bookjeokbookjeok React UI changes for its mobile-first paper-and-ink visual system, responsive shell, and information hierarchy.
---

# Bookjeokbookjeok UI review

Use after a screen or visual component change. Read `src/app/styles/global.css` and the frontend conventions before reviewing.

- Reuse semantic color, radius, typography, and spacing tokens such as `background`, `surface`, `text-primary`, `page-content`, and `rounded-control`. Avoid casual arbitrary colors, spacing, and font sizes.
- Keep a warm paper/ink-neutral commerce interface: book covers and product details lead; typography, spacing, and CTA prominence establish hierarchy. Avoid a cute, heavily decorated treatment.
- Prefer borders to decorative shadow. Do not stack gradients, shadows, or cards without a clear information-grouping purpose. Keep radii consistent.
- Verify small and tall mobile viewports, scrolling, overflow, fixed CTA safe area when applicable, and loading/empty/error states.
- Pages must use the existing `AppLayout`; do not duplicate its mobile viewport behavior or desktop 9:19.5 centered shell. Check the wide-screen shell as well as the phone layout.

This is a consistency review, not a redesign mandate. Do not globally change tokens or the design system unless the request specifically requires it.
