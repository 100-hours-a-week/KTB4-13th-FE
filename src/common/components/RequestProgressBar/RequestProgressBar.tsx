import { useEffect, useRef, useState } from "react";

import { subscribeRequestActivity } from "@/common/api/requestActivity";

// Fast responses show nothing; only a wait longer than this gets the bar (NN/g: under ~1s needs no indicator).
const SHOW_AFTER_MS = 400;
const HIDE_AFTER_DONE_MS = 260;

type BarPhase = "hidden" | "running" | "done";

// A thin bar at the top of the app while the server is slow to answer.
export function RequestProgressBar() {
  const [phase, setPhase] = useState<BarPhase>("hidden");
  const phaseRef = useRef<BarPhase>("hidden");
  const showTimerRef = useRef<number | null>(null);
  const hideTimerRef = useRef<number | null>(null);

  useEffect(() => {
    const changePhase = (next: BarPhase) => {
      phaseRef.current = next;
      setPhase(next);
    };
    const clearTimer = (timerRef: typeof showTimerRef) => {
      if (timerRef.current !== null) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
    };

    const unsubscribe = subscribeRequestActivity((pendingCount) => {
      if (pendingCount > 0) {
        clearTimer(hideTimerRef);
        if (phaseRef.current === "done") {
          changePhase("running");
        } else if (phaseRef.current === "hidden" && showTimerRef.current === null) {
          showTimerRef.current = window.setTimeout(() => {
            showTimerRef.current = null;
            changePhase("running");
          }, SHOW_AFTER_MS);
        }
        return;
      }

      clearTimer(showTimerRef);
      if (phaseRef.current === "running") {
        changePhase("done");
        hideTimerRef.current = window.setTimeout(() => {
          hideTimerRef.current = null;
          changePhase("hidden");
        }, HIDE_AFTER_DONE_MS);
      }
    });

    return () => {
      unsubscribe();
      clearTimer(showTimerRef);
      clearTimer(hideTimerRef);
    };
  }, []);

  if (phase === "hidden") {
    return null;
  }

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute inset-x-0 top-0 z-50 h-0.5 overflow-hidden"
    >
      <div className={`request-progress h-full bg-accent ${phase === "done" ? "request-progress-done" : ""}`} />
    </div>
  );
}
