import { useEffect, useState } from "react";

const NOTICE_DURATION_MS = 2_000;

export function useTransientNotice() {
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(
      () => setNotice(null),
      NOTICE_DURATION_MS,
    );

    return () => window.clearTimeout(timeoutId);
  }, [notice]);

  return { notice, showNotice: setNotice };
}
