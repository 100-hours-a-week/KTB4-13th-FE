import { useEffect, useRef, useState } from "react";

// Reveal pace: at least this many characters per second, and long text finishes within MAX_REVEAL_SECONDS.
const MIN_CHARS_PER_SECOND = 45;
const MAX_REVEAL_SECONDS = 1.6;

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function commonPrefixLength(a: string, b: string) {
  const limit = Math.min(a.length, b.length);
  let index = 0;
  while (index < limit && a[index] === b[index]) index += 1;
  return index;
}

// Shows streamed text at a steady pace instead of all at once. When the final reply differs from the draft,
// the part already shown stays and only the changed tail is revealed again.
export function useRevealedText(text: string, shouldAnimate: boolean) {
  const [isReducedMotion] = useState(prefersReducedMotion);
  const isEnabled = shouldAnimate && !isReducedMotion;
  const [shownLength, setShownLength] = useState(isEnabled ? 0 : text.length);
  const [previousText, setPreviousText] = useState(text);
  const shownLengthRef = useRef(shownLength);

  // Adjusts during render when the target text changes, so no frame shows text that is no longer in the reply.
  if (previousText !== text) {
    setPreviousText(text);
    setShownLength(Math.min(shownLength, commonPrefixLength(previousText, text)));
  }

  const isAnimating = isEnabled && shownLength < text.length;

  useEffect(() => {
    shownLengthRef.current = shownLength;
  }, [shownLength]);

  useEffect(() => {
    if (!isAnimating) return undefined;
    let frame = 0;
    let last = performance.now();
    let position = shownLengthRef.current;
    const step = (now: number) => {
      const seconds = (now - last) / 1000;
      last = now;
      const speed = Math.max(MIN_CHARS_PER_SECOND, (text.length - position) / MAX_REVEAL_SECONDS);
      position = Math.min(text.length, position + Math.max(1, speed * seconds));
      setShownLength(Math.floor(position));
      if (position < text.length) frame = window.requestAnimationFrame(step);
    };
    frame = window.requestAnimationFrame(step);
    return () => window.cancelAnimationFrame(frame);
  }, [isAnimating, text]);

  return {
    isDone: !isEnabled || shownLength >= text.length,
    shownText: isEnabled ? text.slice(0, shownLength) : text,
  };
}
