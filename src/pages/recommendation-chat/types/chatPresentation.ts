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
      errorReason?: ChatErrorReason;
      id: string;
      role: "user";
    }
  | {
      agentButtons?: Array<{
        action: string;
        label: string;
        proposalId: number | null;
        target: string | null;
      }>;
      content: string;
      executionStatus?: "declined" | "error" | "executed" | "executing" | "pending" | "rejected";
      id: string;
      recommendations?: RecommendationCardViewModel[];
      role: "assistant";
    };
