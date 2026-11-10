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
