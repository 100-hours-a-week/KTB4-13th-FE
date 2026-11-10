import { MAX_CHAT_MESSAGE_LENGTH } from "./chatMessage";

export const CHAT_ASK_PARAM = "ask";
const CHAT_PATH = "/recommendations/chat";
const PENDING_ASK_KEY = "bookjeokbookjeok.chat.pending-ask";
const ASK_LIFETIME_MS = 30 * 60_000;

export function chatAskPath(message: string) {
  const params = new URLSearchParams({
    [CHAT_ASK_PARAM]: message.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH),
  });
  return `${CHAT_PATH}?${params.toString()}`;
}

export function readChatAsk(search: string) {
  const question = new URLSearchParams(search).get(CHAT_ASK_PARAM);
  return question?.trim().slice(0, MAX_CHAT_MESSAGE_LENGTH) || null;
}

export function getChatAskReturnTo(value: unknown) {
  if (typeof value !== "string" || !value.startsWith(`${CHAT_PATH}?`)) return null;
  return readChatAsk(value.slice(CHAT_PATH.length).split("#", 1)[0]) ? value : null;
}

// The chat can change the cart. Only a question explicitly selected in the app is auto-sent.
export function rememberChatAsk(path: string) {
  const question = readChatAsk(path.slice(CHAT_PATH.length));
  if (!question) return;

  try {
    window.sessionStorage.setItem(PENDING_ASK_KEY, JSON.stringify([question, Date.now() + ASK_LIFETIME_MS]));
  } catch {
    // Without storage the question is still available as a draft.
  }
}

export function consumeChatAsk(question: string) {
  try {
    const pending: unknown = JSON.parse(window.sessionStorage.getItem(PENDING_ASK_KEY) ?? "null");
    if (!Array.isArray(pending) || pending[0] !== question || typeof pending[1] !== "number") return false;
    window.sessionStorage.removeItem(PENDING_ASK_KEY);
    return pending[1] > Date.now();
  } catch {
    return false;
  }
}
