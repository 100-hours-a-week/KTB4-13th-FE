import { useState } from "react";

import { BookjeogiCharacter, type BookjeogiMood } from "@/pages/recommendation-chat/components/BookjeogiCharacter";

export const ASSISTANT_NAME = "북적이";

// Decorative: the visible "북적이" label next to it carries the name for assistive tech.
export function AssistantAvatar({
  className = "size-9",
  mood = "still",
}: {
  className?: string;
  mood?: BookjeogiMood;
}) {
  return (
    <span aria-hidden="true" className={`flex shrink-0 rounded-full bg-accent-soft p-0.5 ${className}`}>
      <BookjeogiCharacter mood={mood} />
    </span>
  );
}

// The first-screen 북적이: waves hello, then floats and looks around; a tap makes it hop.
export function WelcomeAvatar() {
  const [pokeKey, setPokeKey] = useState(0);

  return (
    <button
      aria-label={`${ASSISTANT_NAME} 콕 누르기`}
      className="flex size-16 shrink-0 touch-manipulation rounded-full bg-accent-soft p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={() => setPokeKey((key) => key + 1)}
      type="button"
    >
      <BookjeogiCharacter mood="welcome" pokeKey={pokeKey} />
    </button>
  );
}
