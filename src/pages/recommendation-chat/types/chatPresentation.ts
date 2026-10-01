export type ChatPresentationStatus = "idle" | "sending" | "error";

export type ChatErrorReason = "invalid-request" | "busy" | "timeout" | "error";

export interface RecommendationCardViewModel {
  author: string | null;
  coverImageUrl: string | null;
  id: string;
  matchScore: number;
  price: number | null;
  productId: number | null;
  reasonShort: string | null;
  title: string;
}

export type ChatPresentationMessage =
  | {
      content: string;
      id: string;
      role: "user";
    }
  | {
      content: string;
      id: string;
      recommendations?: RecommendationCardViewModel[];
      role: "assistant";
    };
