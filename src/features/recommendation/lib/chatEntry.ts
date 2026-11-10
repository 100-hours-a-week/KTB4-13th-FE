// Opening the chat with a sentence from another screen: /recommendations/chat?ask=...
// A query parameter, not router state, so the sentence survives the login redirect (RequireAuth keeps the search).
export const CHAT_ASK_PARAM = "ask";
// Same cap as the chat composer (MAX_CHAT_MESSAGE_LENGTH).
const CHAT_ASK_MAX_LENGTH = 200;

export function chatAskPath(message: string) {
  const params = new URLSearchParams({ [CHAT_ASK_PARAM]: message.trim().slice(0, CHAT_ASK_MAX_LENGTH) });

  return `/recommendations/chat?${params.toString()}`;
}

export function readChatAsk(search: string) {
  return new URLSearchParams(search).get(CHAT_ASK_PARAM)?.trim().slice(0, CHAT_ASK_MAX_LENGTH) || null;
}
