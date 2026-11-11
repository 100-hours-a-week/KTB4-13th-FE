import type { ReactNode } from "react";
import { Link } from "react-router-dom";

import { similarBooksAsk } from "@/features/library/lib/similarBooksAsk";
import { chatAskPath, rememberChatAsk } from "@/features/recommendation/lib/chatEntry";

interface SimilarBooksLinkProps {
  children?: ReactNode;
  className: string;
  // 사진 화면처럼 뒤로 돌아오면 안 되는 화면에서 기록을 바꿔 넣는다
  replace?: boolean;
  title: string;
}

// 북적이에게 "『제목』과 비슷한 책 더 보여줘"를 보내며 챗봇으로 간다
export function SimilarBooksLink({ children = "비슷한 책 추천받기", className, replace = false, title }: SimilarBooksLinkProps) {
  const path = chatAskPath(similarBooksAsk(title));

  return (
    <Link
      className={className}
      onClick={(event) => {
        if (event.defaultPrevented || event.button !== 0 ||
          event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
        // 앱에서 고른 질문만 채팅 화면이 바로 보낸다(chatEntry)
        rememberChatAsk(path);
      }}
      replace={replace}
      to={path}
    >
      {children}
    </Link>
  );
}
