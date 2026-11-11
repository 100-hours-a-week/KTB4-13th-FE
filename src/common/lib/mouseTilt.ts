import type { PointerEvent as ReactPointerEvent } from "react";

// Largest lean at the cover's edge. Kept small: the cover should feel picked up, not spun.
const MAX_TILT_DEG = 6;
const LIFT_PX = -4;

let reducedMotionQuery: MediaQueryList | null = null;

function prefersReducedMotion() {
  reducedMotionQuery ??= window.matchMedia("(prefers-reduced-motion: reduce)");
  return reducedMotionQuery.matches;
}

/*
 * Pointer handlers that lean an element toward the mouse. Pair them with the `.mouse-tilt` class.
 * Touch and pen are ignored: a tap reports a pointer position too and would leave the element tilted.
 * Angles go into CSS variables on the element, so following the mouse does not re-render.
 */
export function tiltTowardMouse(event: ReactPointerEvent<HTMLElement>) {
  if (event.pointerType !== "mouse" || prefersReducedMotion()) return;
  const node = event.currentTarget;
  const rect = node.getBoundingClientRect();
  if (rect.width === 0 || rect.height === 0) return;
  // -0.5 at the left/top edge, 0.5 at the right/bottom edge.
  const x = (event.clientX - rect.left) / rect.width - 0.5;
  const y = (event.clientY - rect.top) / rect.height - 0.5;
  node.dataset.tilting = "";
  node.style.setProperty("--tilt-x", `${(-y * 2 * MAX_TILT_DEG).toFixed(2)}deg`);
  node.style.setProperty("--tilt-y", `${(x * 2 * MAX_TILT_DEG).toFixed(2)}deg`);
  node.style.setProperty("--tilt-lift", `${LIFT_PX}px`);
}

export function resetMouseTilt(event: ReactPointerEvent<HTMLElement>) {
  const node = event.currentTarget;
  delete node.dataset.tilting;
  node.style.removeProperty("--tilt-x");
  node.style.removeProperty("--tilt-y");
  node.style.removeProperty("--tilt-lift");
}
