export type ChatPresentationStatus = "idle" | "sending" | "error";

export interface RecommendationCardViewModel {
  author: string;
  coverImageUrl: string | null;
  id: string;
  matchScore: number;
  price: number;
  reasonShort: string;
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
