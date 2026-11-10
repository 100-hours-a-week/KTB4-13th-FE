import { useEffect, useState } from "react";

const NOTICE_DURATION_MS = 2_000;

// Shows a value for a short while, then clears it. A notice with an action can ask for longer.
export function useTransientNotice<T = string>(durationMs = NOTICE_DURATION_MS) {
  const [notice, setNotice] = useState<T | null>(null);

  useEffect(() => {
    if (notice === null) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => setNotice(null), durationMs);

    return () => window.clearTimeout(timeoutId);
  }, [durationMs, notice]);

  return { notice, showNotice: setNotice };
}
