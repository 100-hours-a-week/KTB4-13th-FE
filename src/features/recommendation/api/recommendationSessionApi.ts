import { parseApiResponse } from "@/common/api/apiResponse";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  AgentButton,
  AgentExecution,
  ChatHistoryMessage,
  ChatSessionSummary,
  RecommendationChatCard,
  SessionChatReply,
} from "@/features/recommendation/types/recommendationChat";

type ApiFailure = { ok: false; reason: "invalid-request" | "busy" | "timeout" | "error" };

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function nullableString(value: unknown): value is string | null | undefined {
  return value === null || value === undefined || typeof value === "string";
}

function nullableNumber(value: unknown): value is number | null | undefined {
  return value === null || value === undefined || typeof value === "number";
}

function parseCard(value: unknown): RecommendationChatCard | null {
  if (!isRecord(value) || typeof value.recommendationCardId !== "number" || typeof value.bookId !== "number" || typeof value.title !== "string" || typeof value.matchScore !== "number" || !nullableNumber(value.productId) || !nullableNumber(value.price) || !nullableString(value.author) || !nullableString(value.coverImageUrl) || !nullableString(value.reasonShort)) return null;
  return {
    author: value.author ?? null,
    bookId: value.bookId,
    coverImageUrl: value.coverImageUrl ?? null,
    matchScore: value.matchScore,
    price: value.price ?? null,
    productId: value.productId ?? null,
    reasonShort: value.reasonShort ?? null,
    recommendationCardId: value.recommendationCardId,
    title: value.title,
  };
}

function parseButton(value: unknown): AgentButton | null {
  if (!isRecord(value) || typeof value.label !== "string" || typeof value.action !== "string" || !nullableString(value.target) || !nullableNumber(value.proposalId)) return null;
  return { action: value.action, label: value.label, proposalId: value.proposalId ?? null, target: value.target ?? null };
}

function parseExecution(value: unknown): AgentExecution | null | undefined {
  if (value === null || value === undefined) return null;
  if (!isRecord(value) || !nullableNumber(value.executionId) || !nullableNumber(value.proposalId) || typeof value.status !== "string" || !nullableString(value.rejectionCode)) return undefined;
  return { executionId: value.executionId ?? null, proposalId: value.proposalId ?? null, rejectionCode: value.rejectionCode ?? null, status: value.status };
}

function parseReply(value: unknown): SessionChatReply | null {
  if (!isRecord(value) || typeof value.reply !== "string") return null;
  const rawCards = value.cards === undefined ? [] : value.cards;
  const rawButtons = value.buttons === undefined ? [] : value.buttons;
  if (!Array.isArray(rawCards) || !Array.isArray(rawButtons) || !nullableString(value.followup)) return null;
  const cards = rawCards.map(parseCard);
  const buttons = rawButtons.flatMap((button) => {
    if (typeof button === "string") return [];
    const parsed = parseButton(button);
    return parsed ? [parsed] : [];
  });
  const execution = parseExecution(value.execution);
  if (!cards.every((card): card is RecommendationChatCard => card !== null) || execution === undefined) return null;
  const route = value.route === "recommend" || value.route === "shop" ? value.route : null;
  return { buttons, cards, execution, followup: value.followup ?? null, reply: value.reply, route };
}

function failure(status: number): ApiFailure {
  if (status === 400) return { ok: false, reason: "invalid-request" };
  if (status === 429 || status === 503) return { ok: false, reason: "busy" };
  if (status === 504) return { ok: false, reason: "timeout" };
  return { ok: false, reason: "error" };
}

export async function createChatSession(): Promise<{ data: number; ok: true } | ApiFailure> {
  try {
    const result = await parseApiResponse(await fetchWithAuth("/api/v1/recommend/chat/sessions", { method: "POST" }));
    return result.ok && isRecord(result.data) && typeof result.data.sessionId === "number"
      ? { data: result.data.sessionId, ok: true }
      : failure(result.status);
  } catch { return { ok: false, reason: "error" }; }
}

export async function fetchChatSessions(signal?: AbortSignal): Promise<{ data: ChatSessionSummary[]; ok: true } | ApiFailure> {
  try {
    const result = await parseApiResponse(await fetchWithAuth("/api/v1/recommend/chat/sessions?limit=100", { signal }));
    if (!result.ok) return failure(result.status);
    if (!isRecord(result.data) || !Array.isArray(result.data.sessions)) return { ok: false, reason: "error" };
    const sessions = result.data.sessions.map((value): ChatSessionSummary | null => isRecord(value) && typeof value.sessionId === "number" && typeof value.createdAt === "string" ? { createdAt: value.createdAt, sessionId: value.sessionId } : null);
    return sessions.every((session): session is ChatSessionSummary => session !== null) ? { data: sessions, ok: true } : { ok: false, reason: "error" };
  } catch { return { ok: false, reason: "error" }; }
}

export async function fetchChatHistory(sessionId: number, signal?: AbortSignal): Promise<{ data: ChatHistoryMessage[]; ok: true } | ApiFailure> {
  try {
    const result = await parseApiResponse(await fetchWithAuth(`/api/v1/recommend/chat/sessions/${sessionId}/messages?afterSequence=0&limit=100`, { signal }));
    if (!result.ok) return failure(result.status);
    if (!isRecord(result.data) || !Array.isArray(result.data.messages)) return { ok: false, reason: "error" };
    const messages = result.data.messages.map((value): ChatHistoryMessage | null => {
      if (!isRecord(value) || typeof value.id !== "number" || typeof value.sequence !== "number" || (value.role !== "user" && value.role !== "assistant") || typeof value.text !== "string" || typeof value.createdAt !== "string") return null;
      const response = value.response === null || value.response === undefined ? null : parseReply(value.response);
      if (value.response !== null && value.response !== undefined && response === null) return null;
      return { createdAt: value.createdAt, id: value.id, response, role: value.role, sequence: value.sequence, text: value.text };
    });
    return messages.every((message): message is ChatHistoryMessage => message !== null) ? { data: messages, ok: true } : { ok: false, reason: "error" };
  } catch { return { ok: false, reason: "error" }; }
}

export async function sendSessionMessage(sessionId: number, message: string, excludeBookIds: number[]): Promise<{ data: SessionChatReply; ok: true } | ApiFailure> {
  try {
    const result = await parseApiResponse(await fetchWithAuth(`/api/v1/recommend/chat/sessions/${sessionId}/messages`, {
      body: JSON.stringify({ consented: false, excludeBookIds, idempotencyKey: crypto.randomUUID(), message }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }));
    if (!result.ok) return failure(result.status);
    const data = parseReply(result.data);
    return data ? { data, ok: true } : { ok: false, reason: "error" };
  } catch { return { ok: false, reason: "error" }; }
}

export async function confirmCartProposal(proposalId: number): Promise<{ data: AgentExecution; ok: true } | ApiFailure> {
  try {
    const result = await parseApiResponse(await fetchWithAuth("/api/v1/agent/cart/executions", {
      body: JSON.stringify({ idempotencyKey: crypto.randomUUID(), proposalId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }));
    if (!result.ok) return failure(result.status);
    if (!isRecord(result.data) || typeof result.data.executionId !== "number" || typeof result.data.proposalId !== "number" || typeof result.data.appliedAt !== "string") return { ok: false, reason: "error" };
    return { data: { executionId: result.data.executionId, proposalId: result.data.proposalId, rejectionCode: null, status: "executed" }, ok: true };
  } catch { return { ok: false, reason: "error" }; }
}

export async function fetchCartProposalStatus(
  proposalId: number,
  signal?: AbortSignal,
): Promise<"pending" | "executed" | "unavailable"> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/agent/cart/proposals/${proposalId}`, { signal }),
    );
    if (!result.ok || !isRecord(result.data) || typeof result.data.status !== "string") {
      return "unavailable";
    }
    if (result.data.status === "pending") return "pending";
    if (result.data.status === "executed") return "executed";
    return "unavailable";
  } catch {
    return "unavailable";
  }
}
