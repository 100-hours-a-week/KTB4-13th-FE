import type { ChatPresentationMessage } from "@/pages/recommendation-chat/types/chatPresentation";

export const initialChatPresentation: ChatPresentationMessage[] = [
  {
    content: "이별하고 나서 읽을 소설 추천해줘",
    id: "sample-user-message",
    role: "user",
  },
  {
    content: "잔잔한 소설과 최근 취향을 참고해서 몇 권 골라봤어요.",
    id: "sample-assistant-message",
    recommendations: [
      {
        author: "김애란",
        coverImageUrl: null,
        id: "sample-book-1",
        matchScore: 92,
        price: 13500,
        reasonShort: "담백한 문장이 취향과 잘 맞아요",
        title: "두근두근 내 인생",
      },
      {
        author: "최은영",
        coverImageUrl: null,
        id: "sample-book-2",
        matchScore: 87,
        price: 13500,
        reasonShort: "관계의 온도를 섬세하게 그려내요",
        title: "밝은 밤",
      },
      {
        author: "김금희",
        coverImageUrl: null,
        id: "sample-book-3",
        matchScore: 81,
        price: 13500,
        reasonShort: "차분한 위로가 필요한 순간에 어울려요",
        title: "경애의 마음",
      },
    ],
    role: "assistant",
  },
];
