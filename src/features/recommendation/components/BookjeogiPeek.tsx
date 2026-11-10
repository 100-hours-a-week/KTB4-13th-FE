import { useEffect, useState } from "react";
import { Link } from "react-router-dom";

import { BookjeogiCharacter } from "@/common/components/BookjeogiCharacter";

const PEEK_DELAY_MS = 8_000;
const PEEK_CHANCE = 0.3;
const DAILY_LIMIT = 2;
const TAB_KEY = "bookjeogi-peek-shown";
const DAILY_KEY = "bookjeogi-peek-daily";

function claimPeek() {
  const now = new Date();
  const day = `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;

  try {
    if (window.sessionStorage.getItem(TAB_KEY)) return false;
    const [storedDay, storedCount] = (window.localStorage.getItem(DAILY_KEY) ?? "").split(":");
    const count = storedDay === day ? Number(storedCount) || 0 : 0;
    if (count >= DAILY_LIMIT) return false;

    window.sessionStorage.setItem(TAB_KEY, "1");
    window.localStorage.setItem(DAILY_KEY, `${day}:${count + 1}`);
    return true;
  } catch {
    return false;
  }
}

export function BookjeogiPeek() {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    let isActive = true;
    let timeoutId: number | undefined;
    const schedule = () => {
      window.clearTimeout(timeoutId);
      if (document.visibilityState !== "visible") return;
      timeoutId = window.setTimeout(() => {
        document.removeEventListener("visibilitychange", schedule);
        if (Math.random() >= PEEK_CHANCE) return;
        const claim = () => {
          if (isActive && document.visibilityState === "visible" && claimPeek()) {
            setIsVisible(true);
          }
        };
        if (navigator.locks) {
          // Tabs share the daily counter, so serialize its read and increment.
          void navigator.locks.request(DAILY_KEY, claim).catch(() => {});
        } else {
          claim();
        }
      }, PEEK_DELAY_MS);
    };

    schedule();
    document.addEventListener("visibilitychange", schedule);
    return () => {
      isActive = false;
      window.clearTimeout(timeoutId);
      document.removeEventListener("visibilitychange", schedule);
    };
  }, []);

  if (!isVisible) return null;

  return (
    <aside aria-label="북적이 안내" className="bookjeogi-peek absolute bottom-3 right-4 z-10 flex items-center rounded-full border border-border bg-surface pl-1 shadow-sm">
      <Link
        className="flex min-h-11 items-center gap-1 rounded-full pr-2 type-caption font-semibold text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        to="/recommendations/chat"
      >
        <span aria-hidden="true" className="block size-10"><BookjeogiCharacter mood="idle" /></span>
        북적이에게 물어보기
      </Link>
      <button
        aria-label="북적이 안내 닫기"
        className="min-h-11 min-w-11 rounded-full type-title text-text-secondary focus-visible:outline-2 focus-visible:outline-primary"
        onClick={() => setIsVisible(false)}
        type="button"
      >
        <span aria-hidden="true">×</span>
      </button>
    </aside>
  );
}
