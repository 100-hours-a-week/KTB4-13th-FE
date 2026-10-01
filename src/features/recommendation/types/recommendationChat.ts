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
