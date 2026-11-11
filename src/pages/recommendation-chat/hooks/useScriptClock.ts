import { useEffect, useState } from "react";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

// Plays a short scripted sequence and returns how far it has got, in ms since the first render. The value only
// moves at the given times, so the screen re-renders once per step. With reduced motion the script has already
// finished on the first render. Pass a module-level array: a new array restarts the script.
export function useScriptClock(stepTimesMs: readonly number[]) {
  const [isReducedMotion] = useState(prefersReducedMotion);
  const [elapsedMs, setElapsedMs] = useState(isReducedMotion ? Number.POSITIVE_INFINITY : 0);

  useEffect(() => {
    if (isReducedMotion) return undefined;
    const timers = stepTimesMs.map((stepMs) =>
      window.setTimeout(() => setElapsedMs((current) => Math.max(current, stepMs)), stepMs),
    );
    return () => timers.forEach((timer) => window.clearTimeout(timer));
  }, [isReducedMotion, stepTimesMs]);

  return elapsedMs;
}
