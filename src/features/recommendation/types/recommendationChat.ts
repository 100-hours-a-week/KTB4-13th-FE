// The six-key recommendation condition the server returns each turn; the client sends it back unchanged.
export type RecommendationChatSpec = Record<string, unknown>;

export interface RecommendationChatTurn {
  role: "user" | "assistant";
  text: string;
}

export interface RecommendationChatRequest {
  consented: boolean;
  excludeBookIds: number[];
  message: string;
  recentTurns: RecommendationChatTurn[];
  spec: RecommendationChatSpec;
}

// Mirrors backend RecommendationCardResponse; productId and price are null for books without an active product.
export interface RecommendationChatCard {
  author: string | null;
  bookId: number;
  coverImageUrl: string | null;
  matchScore: number;
  price: number | null;
  productId: number | null;
  reasonShort: string | null;
  recommendationCardId: number;
  title: string;
}

export interface RecommendationChatReply {
  cards: RecommendationChatCard[];
  followup: string | null;
  reply: string;
  spec: RecommendationChatSpec;
}

export interface AgentButton {
  action: string;
  label: string;
  proposalId: number | null;
  target: string | null;
}

export interface AgentExecution {
  executionId: number | null;
  proposalId: number | null;
  rejectionCode: string | null;
  status: string;
}

export type AgentCartProposalStatus =
  | "executed"
  | "expired"
  | "invalidated"
  | "pending";

export interface AgentCartProposalItem {
  expectedQuantity: number;
  expectedUnitPrice: number | null;
  operation: "remove" | "set";
  productId: number;
  quantity: number | null;
}

export interface AgentCartProposal {
  executionId: number | null;
  expiresAt: string;
  items: AgentCartProposalItem[];
  proposalId: number;
  status: AgentCartProposalStatus;
}

export interface SessionChatReply {
  buttons: AgentButton[];
  cards: RecommendationChatCard[];
  execution: AgentExecution | null;
  followup: string | null;
  reply: string;
  route: "recommend" | "shop" | null;
}

export interface ChatSessionSummary {
  createdAt: string;
  sessionId: number;
}

export interface ChatHistoryMessage {
  createdAt: string;
  id: number;
  response: SessionChatReply | null;
  role: "assistant" | "user";
  sequence: number;
  text: string;
}
