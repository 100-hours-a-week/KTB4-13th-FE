import { Link } from "react-router-dom";

import { BookjeogiCharacter } from "@/common/components/BookjeogiCharacter";
import { chatAskPath } from "@/features/recommendation/lib/chatEntry";

export function AskBookjeogiCard({ hasNoResults, query }: { hasNoResults: boolean; query: string }) {
  return (
    <Link
      className="flex items-center gap-3 rounded-panel border border-accent/40 bg-accent-soft px-3 py-3 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      to={chatAskPath(query)}
    >
      <span aria-hidden="true" className="flex size-10 shrink-0 rounded-full bg-surface p-0.5">
        <BookjeogiCharacter mood="idle" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block type-body-small font-semibold text-text-primary">
          북적이에게 물어보기
        </span>
        <span className="block break-words type-caption text-text-secondary">
          {hasNoResults ? "검색 대신 북적이에게 책을 추천받아 보세요" : "입력한 문장을 보내면 북적이가 책을 골라 드려요"}
        </span>
      </span>
      <span aria-hidden="true" className="shrink-0 type-title text-accent">›</span>
    </Link>
  );
}
