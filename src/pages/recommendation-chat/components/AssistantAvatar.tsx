export const ASSISTANT_NAME = "북적이";

const ASSISTANT_PROFILE_IMAGE_URL = `${import.meta.env.BASE_URL}assets/(nobg)bookjeok-character.png`;

// Decorative: the visible "북적이" label next to it carries the name for assistive tech.
export function AssistantAvatar({ className = "size-9" }: { className?: string }) {
  return (
    <img
      alt=""
      aria-hidden="true"
      className={`shrink-0 rounded-full bg-accent-soft object-contain p-0.5 ${className}`}
      decoding="async"
      src={ASSISTANT_PROFILE_IMAGE_URL}
    />
  );
}
