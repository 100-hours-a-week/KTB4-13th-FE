import { Link } from "react-router-dom";

import { BookjeogiCharacter } from "@/common/components/BookjeogiCharacter";
import { chatAskPath, rememberChatAsk } from "@/features/recommendation/lib/chatEntry";

export function AskBookjeogiCard({ query }: { query: string }) {
  const path = chatAskPath(query);

  return (
    <Link
      className="flex items-center gap-3 rounded-panel border border-accent/40 bg-accent-soft px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      onClick={(event) => {
        if (event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        rememberChatAsk(path);
      }}
      to={path}
    >
      <span aria-hidden="true" className="flex size-10 shrink-0 rounded-full bg-surface p-0.5">
        <BookjeogiCharacter mood="idle" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block type-body-small font-semibold text-text-primary">
          북적이에게 물어보기
        </span>
        <span className="block break-words type-caption text-text-secondary">
          검색어를 그대로 보내 책을 추천받아요
        </span>
      </span>
      <span aria-hidden="true" className="shrink-0 type-title text-accent">›</span>
    </Link>
  );
}
