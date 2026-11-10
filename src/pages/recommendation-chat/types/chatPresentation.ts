import type { AgentButton, AgentCheckout } from "@/features/recommendation/types/recommendationChat";

export interface ChatCheckout {
  benefits: AgentCheckout | null;
  executionId: number;
  label: string;
}

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

export interface CartProposalItemViewModel {
  expectedQuantity: number;
  expectedUnitPrice: number | null;
  itemName: string | null;
  operation: "remove" | "set";
  productId: number;
  quantity: number | null;
}

export interface CartProposalViewModel {
  executionId: number | null;
  expiresAt: string;
  items: CartProposalItemViewModel[];
  proposalId: number;
  status: "executed" | "expired" | "invalidated" | "pending";
}

export type ProposalExecutionStatus =
  | "declined"
  | "error"
  | "executed"
  | "executing"
  | "expired"
  | "invalidated"
  | "pending"
  | "proposal-error"
  | "rejected";

export type ChatPresentationMessage =
  | {
      content: string;
      errorReason?: ChatErrorReason;
      id: string;
      role: "user";
    }
  | {
      agentButtons?: AgentButton[];
      checkout?: ChatCheckout;
      content: string;
      executionStatus?: ProposalExecutionStatus;
      id: string;
      proposal?: CartProposalViewModel;
      recommendations?: RecommendationCardViewModel[];
      role: "assistant";
    };
