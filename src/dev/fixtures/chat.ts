import type { RecommendationCardViewModel } from "@/pages/recommendation-chat/types/chatPresentation";

// Illustrative replies in the shape the AI sends after #652: option lines ("• ") in followup.
export interface ChatPreviewReply {
  cards: RecommendationCardViewModel[];
  // Draft streamed before the final reply. It may differ from the final reply, as in production.
  draft: string;
  followup: string | null;
  reply: string;
}

function card(id: number, title: string, author: string, reasonShort: string, matchScore: number): RecommendationCardViewModel {
  return {
    author,
    coverImageUrl: null,
    id: String(id),
    matchScore,
    price: 13500,
    productId: id,
    reasonShort,
    title,
  };
}

export const chatPreviewReplies: ChatPreviewReply[] = [
  {
    cards: [
      card(9001, "페인트", "이희영", "『아몬드』를 읽은 사람들이 함께 읽은 책이에요(도서관 정보나루).", 82),
      card(9002, "세계를 건너 너에게 갈게", "이꽃님", "『아몬드』를 읽은 사람들이 함께 읽은 책이에요(도서관 정보나루).", 76),
      card(9003, "시간을 파는 상점", "김선영", "『아몬드』를 읽은 사람들이 함께 읽은 책이에요(도서관 정보나루).", 71),
    ],
    draft: "청소년의 감정과 관계를 다룬 이야기들이에요.",
    followup: "• 『페인트』 함께 읽은 책 보여줘\n• 『페인트』와 비슷한 책 더 보여줘",
    reply: "청소년의 감정과 관계를 다룬 이야기들이에요.",
  },
  {
    cards: [],
    draft: "AI 책이 두 쪽으로 나뉘어요.",
    followup: "기술 입문 쪽인가요, 사회 영향 쪽인가요?\n\n• AI 기술 입문서 보여줘\n• AI 사회 영향 책 보여줘",
    reply: "AI 책이 두 쪽으로 나뉘어요.",
  },
  {
    cards: [
      card(9011, "코스모스", "칼 세이건", "우주의 탄생과 인류의 자리를 한 권으로 훑어요.", 88),
      card(9012, "이기적 유전자", "리처드 도킨스", "진화를 유전자의 눈으로 다시 보게 해요.", 80),
    ],
    // The final reply drops the draft's last sentence, as the server's cleanup sometimes does.
    draft: "과학 교양서의 고전 두 권이에요. 처음 읽기에도 어렵지 않아요. 우주 쪽이 좋으세요, 생명 쪽이 좋으세요?",
    followup: "우주 쪽이 좋으세요, 생명 쪽이 좋으세요?",
    reply: "과학 교양서의 고전 두 권이에요. 처음 읽기에도 어렵지 않아요.",
  },
  {
    cards: [],
    draft: "추천해 드리려면 조금 더 알아야 해요.",
    followup:
      "어떤 분야가 좋으세요? 골라 주시거나 알고 있는 제목·저자를 알려 주세요.\n\n• 소설 책 추천해줘\n• 에세이 책 추천해줘\n• 인문 책 추천해줘\n• 경제경영 책 추천해줘\n• 자기계발 책 추천해줘\n• 과학 책 추천해줘",
    reply: "추천해 드리려면 조금 더 알아야 해요.",
  },
];
