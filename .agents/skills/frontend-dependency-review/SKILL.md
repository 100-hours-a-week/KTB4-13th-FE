---
name: frontend-dependency-review
description: Assess whether a proposed frontend dependency is justified and compatible before any installation is requested or performed.
---

# Frontend dependency review

Use before adding a package or changing dependency versions.

- First determine whether existing project dependencies, a small local implementation, or browser APIs solve the need.
- Add a library only for a clear, recurring benefit rather than one isolated convenience.
- Consider bundle cost, maintenance health, security posture when relevant, and compatibility with the repository's React 19, Vite, TypeScript, and Tailwind CSS 4 setup.
- Consider whether the team will maintain and reuse the dependency.

Do not install dependencies automatically. Present the recommendation and wait for an explicit user request or approval, unless the user has already explicitly directed installation. Preserve the existing lockfile and dependency choices otherwise.
