import { MAX_CHAT_MESSAGE_LENGTH } from "./chatMessage";

export const CHAT_ASK_PARAM = "ask";

export function chatAskPath(message: string) {
  // Keep the question through the existing login return path.
  const params = new URLSearchParams({
    [CHAT_ASK_PARAM]: message.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH),
  });
  return `/recommendations/chat?${params.toString()}`;
}

export function readChatAsk(search: string) {
  const question = new URLSearchParams(search).get(CHAT_ASK_PARAM);
  return question?.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH) || null;
}
