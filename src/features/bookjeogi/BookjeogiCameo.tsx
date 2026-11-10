import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";

import { BookjeogiCharacter } from "@/common/components/BookjeogiCharacter";
import {
  CAMEO_PATHS,
  CAMEO_RULES,
  canShowCameo,
  markCameoShown,
  randomBetween,
} from "@/features/bookjeogi/cameoSchedule";

// 북적이 now and then peeks up from the lower corner; a tap opens the chat. It never blocks anything.
export function BookjeogiCameo() {
  const { pathname } = useLocation();
  const [shownOn, setShownOn] = useState<string | null>(null);
  const isAllowedHere = CAMEO_PATHS.includes(pathname);
  const isVisible = shownOn === pathname;

  useEffect(() => {
    if (!isAllowedHere) return undefined;

    let timer: number | undefined;
    const roll = (chance: number) => {
      const now = Date.now();
      if (Math.random() < chance && canShowCameo(now)) {
        markCameoShown(now);
        setShownOn(pathname);
        return;
      }
      timer = window.setTimeout(
        () => roll(CAMEO_RULES.retryChance),
        randomBetween(CAMEO_RULES.retryMin, CAMEO_RULES.retryMax),
      );
    };

    timer = window.setTimeout(
      () => roll(CAMEO_RULES.chance),
      randomBetween(CAMEO_RULES.delayMin, CAMEO_RULES.delayMax),
    );

    return () => window.clearTimeout(timer);
  }, [isAllowedHere, pathname]);

  useEffect(() => {
    if (!isVisible) return undefined;
    const timer = window.setTimeout(() => setShownOn(null), CAMEO_RULES.visibleFor);
    return () => window.clearTimeout(timer);
  }, [isVisible]);

  if (!isVisible) return null;

  return (
    <div className="bookjeogi-cameo pointer-events-none absolute bottom-20 right-4 z-20 flex items-end gap-2">
      <p className="pointer-events-auto mb-3 rounded-panel rounded-br-sm bg-surface px-3 py-2 type-caption text-text-primary shadow-[0_8px_20px_-12px_rgba(36,33,31,0.5)] ring-1 ring-hairline">
        책 고민 있으면 말해 줘요
      </p>
      <Link
        aria-label="북적이에게 책 추천받기"
        className="pointer-events-auto flex size-14 shrink-0 rounded-full bg-accent-soft p-1 shadow-[0_10px_24px_-12px_rgba(36,33,31,0.55)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
        onClick={() => setShownOn(null)}
        to="/recommendations/chat"
      >
        <BookjeogiCharacter mood="welcome" />
      </Link>
      <button
        aria-label="북적이 닫기"
        className="pointer-events-auto absolute -right-1 -top-2 flex size-6 items-center justify-center rounded-full bg-surface type-caption text-text-tertiary ring-1 ring-hairline"
        onClick={() => setShownOn(null)}
        type="button"
      >
        ×
      </button>
    </div>
  );
}
