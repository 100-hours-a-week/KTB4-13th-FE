import { parseApiResponse } from "@/common/api/apiResponse";
import { isEventStreamResponse, readServerSentEvents } from "@/common/api/eventStream";
import { fetchWithAuth } from "@/features/auth/lib/httpClient";
import type {
  AgentButton,
  AgentCartChangeItem,
  AgentCartProposal,
  AgentCheckout,
  AgentExecution,
  ChatHistoryMessage,
  ChatSessionSummary,
  RecommendationChatCard,
  SessionChatReply,
} from "@/features/recommendation/types/recommendationChat";

const HISTORY_PAGE_SIZE = 100;

type ApiFailure = { ok: false; reason: "invalid-request" | "busy" | "timeout" | "error" };

// "in-progress" and "interrupted" mean the server may still finish this request, so retry with the same key.
type SendFailure = { ok: false; reason: ApiFailure["reason"] | "in-progress" | "interrupted" };

export interface SendSessionMessageInput {
  excludeBookIds: number[];
  idempotencyKey: string;
  message: string;
}

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

function parseCartChangeItem(value: unknown): AgentCartChangeItem | null {
  if (
    !isRecord(value) ||
    typeof value.productId !== "number" ||
    (value.operation !== "set" && value.operation !== "remove") ||
    !nullableNumber(value.quantity) ||
    typeof value.expectedQuantity !== "number" ||
    !nullableNumber(value.expectedUnitPrice)
  ) {
    return null;
  }

  return {
    expectedQuantity: value.expectedQuantity,
    expectedUnitPrice: value.expectedUnitPrice ?? null,
    operation: value.operation,
    productId: value.productId,
    quantity: value.quantity ?? null,
  };
}

function parseProposal(value: unknown): AgentCartProposal | null {
  if (
    !isRecord(value) ||
    typeof value.proposalId !== "number" ||
    typeof value.expiresAt !== "string" ||
    !nullableNumber(value.executionId) ||
    !Array.isArray(value.items) ||
    (value.status !== "pending" &&
      value.status !== "executed" &&
      value.status !== "expired" &&
      value.status !== "invalidated")
  ) {
    return null;
  }

  const items = value.items.map(parseCartChangeItem);
  if (!items.every((item): item is AgentCartChangeItem => item !== null)) {
    return null;
  }

  return {
    executionId: value.executionId ?? null,
    expiresAt: value.expiresAt,
    items,
    proposalId: value.proposalId,
    status: value.status,
  };
}

function parseCheckout(value: unknown): AgentCheckout | null {
  if (!isRecord(value)) return null;
  const { useOwnedCouponId, usePoint } = value;
  if (
    (useOwnedCouponId !== null &&
      (typeof useOwnedCouponId !== "number" || !Number.isSafeInteger(useOwnedCouponId) || useOwnedCouponId <= 0)) ||
    typeof usePoint !== "number" ||
    !Number.isSafeInteger(usePoint) ||
    usePoint < 0
  ) {
    return null;
  }
  return { useOwnedCouponId, usePoint };
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
  return {
    buttons,
    cards,
    checkout: route === "shop" ? parseCheckout(value.checkout) : null,
    execution,
    followup: value.followup ?? null,
    reply: value.reply,
    route,
  };
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

export async function fetchChatHistory(
  sessionId: number,
  signal?: AbortSignal,
): Promise<{ data: ChatHistoryMessage[]; ok: true } | ApiFailure> {
  const messages: ChatHistoryMessage[] = [];
  let afterSequence = 0;

  try {
    while (!signal?.aborted) {
      const result = await parseApiResponse(
        await fetchWithAuth(
          `/api/v1/recommend/chat/sessions/${sessionId}/messages?afterSequence=${afterSequence}&limit=${HISTORY_PAGE_SIZE}`,
          { signal },
        ),
      );
      if (!result.ok) return failure(result.status);
      if (!isRecord(result.data) || !Array.isArray(result.data.messages)) {
        return { ok: false, reason: "error" };
      }

      for (const value of result.data.messages) {
        if (
          !isRecord(value) ||
          typeof value.id !== "number" ||
          typeof value.sequence !== "number" ||
          !Number.isSafeInteger(value.sequence) ||
          value.sequence <= afterSequence ||
          (value.role !== "user" && value.role !== "assistant") ||
          typeof value.text !== "string" ||
          typeof value.createdAt !== "string"
        ) {
          return { ok: false, reason: "error" };
        }
        const response = value.response == null ? null : parseReply(value.response);
        if (value.response != null && response === null) return { ok: false, reason: "error" };
        messages.push({
          createdAt: value.createdAt,
          id: value.id,
          response,
          role: value.role,
          sequence: value.sequence,
          text: value.text,
        });
        afterSequence = value.sequence;
      }

      if (result.data.messages.length < HISTORY_PAGE_SIZE) {
        return { data: messages, ok: true };
      }
    }
  } catch {
    return { ok: false, reason: "error" };
  }
  return { ok: false, reason: "error" };
}

function sendFailure(status: number, code: string | undefined): SendFailure {
  if (code === "CHAT_IN_PROGRESS") return { ok: false, reason: "in-progress" };
  return failure(status);
}

// SSE error events carry only the error body, so the HTTP status is read from its code.
function streamErrorFailure(data: unknown): SendFailure {
  const code = isRecord(data) && typeof data.code === "string" ? data.code : undefined;
  if (code === "CHAT_IN_PROGRESS") return { ok: false, reason: "in-progress" };
  if (code === "E400") return { ok: false, reason: "invalid-request" };
  if (code === "E429" || code === "E503") return { ok: false, reason: "busy" };
  if (code === "E504") return { ok: false, reason: "timeout" };
  return { ok: false, reason: "error" };
}

function parseEventData(data: string): unknown {
  try {
    return JSON.parse(data);
  } catch {
    return undefined;
  }
}

async function readReplyStream(
  body: ReadableStream<Uint8Array>,
  onDelta: (text: string) => void,
): Promise<{ data: SessionChatReply; ok: true } | SendFailure> {
  for await (const event of readServerSentEvents(body)) {
    const data = parseEventData(event.data);
    if (event.event === "delta") {
      if (isRecord(data) && typeof data.text === "string") onDelta(data.text);
      continue;
    }
    if (event.event === "done") {
      // done carries the same ApiResponse envelope as the JSON reply.
      const reply = isRecord(data) && data.success === true ? parseReply(data.data) : null;
      return reply ? { data: reply, ok: true } : { ok: false, reason: "error" };
    }
    if (event.event === "error") return streamErrorFailure(data);
  }
  return { ok: false, reason: "interrupted" };
}

// Sends one attempt; the caller reuses the same input and key to recover an interrupted attempt.
export async function sendSessionMessage(
  sessionId: number,
  { excludeBookIds, idempotencyKey, message }: SendSessionMessageInput,
  onDelta: (text: string) => void,
): Promise<{ data: SessionChatReply; ok: true } | SendFailure> {
  let response: Response;
  try {
    response = await fetchWithAuth(`/api/v1/recommend/chat/sessions/${sessionId}/messages`, {
      body: JSON.stringify({ consented: false, excludeBookIds, idempotencyKey, message }),
      // JSON stays acceptable so a backend without SSE, and errors raised before the stream starts, still answer.
      headers: { Accept: "text/event-stream, application/json", "Content-Type": "application/json" },
      method: "POST",
    });
  } catch {
    return { ok: false, reason: "interrupted" };
  }

  if (response.ok && isEventStreamResponse(response) && response.body) {
    try {
      return await readReplyStream(response.body, onDelta);
    } catch {
      return { ok: false, reason: "interrupted" };
    }
  }

  try {
    const result = await parseApiResponse(response);
    // A 2xx reply whose body could not be read may still have been saved.
    if (!result.ok && response.ok) return { ok: false, reason: "interrupted" };
    if (!result.ok) return sendFailure(result.status, result.error?.code);
    const data = parseReply(result.data);
    return data ? { data, ok: true } : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "interrupted" };
  }
}

export async function confirmCartProposal(proposalId: number, idempotencyKey: string): Promise<{ data: AgentExecution; ok: true } | ApiFailure> {
  try {
    const result = await parseApiResponse(await fetchWithAuth("/api/v1/agent/cart/executions", {
      body: JSON.stringify({ idempotencyKey, proposalId }),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    }));
    if (!result.ok) return failure(result.status);
    if (!isRecord(result.data) || typeof result.data.executionId !== "number" || typeof result.data.proposalId !== "number" || typeof result.data.appliedAt !== "string") return { ok: false, reason: "error" };
    return { data: { executionId: result.data.executionId, proposalId: result.data.proposalId, rejectionCode: null, status: "executed" }, ok: true };
  } catch { return { ok: false, reason: "error" }; }
}

export async function fetchAgentCartExecution(
  executionId: number,
  signal?: AbortSignal,
): Promise<{ data: AgentCartChangeItem[]; ok: true } | ApiFailure> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/agent/cart/executions/${executionId}`, { signal }),
    );
    if (!result.ok) return failure(result.status);
    if (
      !isRecord(result.data) ||
      result.data.executionId !== executionId ||
      !Array.isArray(result.data.items)
    ) {
      return { ok: false, reason: "error" };
    }
    const items = result.data.items.map(parseCartChangeItem);
    return items.every((item): item is AgentCartChangeItem => item !== null)
      ? { data: items, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}

export async function fetchCartProposal(
  proposalId: number,
  signal?: AbortSignal,
): Promise<{ data: AgentCartProposal; ok: true } | ApiFailure> {
  try {
    const result = await parseApiResponse(
      await fetchWithAuth(`/api/v1/agent/cart/proposals/${proposalId}`, { signal }),
    );
    if (!result.ok) return failure(result.status);
    const proposal = parseProposal(result.data);
    return proposal
      ? { data: proposal, ok: true }
      : { ok: false, reason: "error" };
  } catch {
    return { ok: false, reason: "error" };
  }
}
