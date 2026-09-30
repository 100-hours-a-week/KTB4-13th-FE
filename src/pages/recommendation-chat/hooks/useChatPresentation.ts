import { useRef, useState } from "react";

import { initialChatPresentation } from "@/pages/recommendation-chat/data/chatPresentation";
import type {
  ChatPresentationMessage,
  ChatPresentationStatus,
} from "@/pages/recommendation-chat/types/chatPresentation";

export function useChatPresentation() {
  const [messages, setMessages] = useState<ChatPresentationMessage[]>(
    initialChatPresentation,
  );
  const nextMessageIdRef = useRef(initialChatPresentation.length + 1);
  const status: ChatPresentationStatus = "idle";

  const addUserMessage = (content: string) => {
    const id = `local-user-${nextMessageIdRef.current}`;
    nextMessageIdRef.current += 1;
    setMessages((current) => [
      ...current,
      {
        content,
        id,
        role: "user",
      },
    ]);
  };

  return { addUserMessage, messages, status };
}
