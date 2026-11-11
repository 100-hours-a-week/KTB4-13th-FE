import type { ComponentType, SVGProps } from "react";

import { BookOpenIcon, CartIcon, SearchIcon, TagIcon } from "@/common/components/AppIcons";

// The first-screen chip that shows the guide as 북적이's answer. It is answered on the screen and never sent.
export const CHAT_GUIDE_QUESTION = "북적이는 뭘 할 수 있어?";

export interface ChatGuideTip {
  examples: readonly string[];
  label: string;
}

interface ChatGuideTopicBase {
  // The fuller line under the title in the guidebook sheet.
  description: string;
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  id: string;
  // The short line under the title in the chat answer.
  summary: string;
  title: string;
}

export type ChatGuideTopic =
  | (ChatGuideTopicBase & { kind: "questions"; questions: readonly string[] })
  | (ChatGuideTopicBase & { kind: "tips"; tips: readonly ChatGuideTip[] });

// What 북적이 can do. The "뭘 할 수 있어?" answer and the guidebook sheet both read this list, so copy changes land in
// one place. Questions are sent as-is when tapped; each was sent as a first turn to the dev chatbot twice (2026-11-11)
// and answered the same way both times. Things that change the cart ("…담아 줘" adds a book the user never picked) or
// point at a card (there are no cards yet) are tips, shown as text and never as buttons.
export const CHAT_GUIDE_TOPICS: readonly ChatGuideTopic[] = [
  {
    description: "언제, 어떤 마음으로 읽을지 말해 주세요",
    Icon: SearchIcon,
    id: "find",
    kind: "questions",
    questions: ["출퇴근길에 읽기 좋은 짧은 에세이", "사회초년생 재테크 입문서"],
    summary: "언제, 어떤 마음으로 읽을지",
    title: "기분·상황으로 찾기",
  },
  {
    description: "재밌게 읽은 책을 알려 주면 비슷한 책을 찾아요",
    Icon: BookOpenIcon,
    id: "widen",
    kind: "questions",
    questions: ["『아몬드』 재밌게 읽었는데 비슷한 책"],
    summary: "재밌게 읽은 책과 비슷한 책",
    title: "읽은 책에서 넓히기",
  },
  {
    description: "책값, 주문 내역, 장바구니를 바로 알려 드려요",
    Icon: TagIcon,
    id: "shop",
    kind: "questions",
    questions: ["『아몬드』 얼마야?", "주문 내역 보여 줘"],
    summary: "책값·주문 내역·장바구니",
    title: "가격·주문 묻기",
  },
  {
    description: "책 카드가 나오면 이렇게 말할 수 있어요",
    Icon: CartIcon,
    id: "after-cards",
    kind: "tips",
    summary: "카드를 담고, 비교하고, 주문",
    tips: [
      { examples: ["1번 담아 줘", "2권으로 바꿔 줘"], label: "담기·수량" },
      { examples: ["1번이랑 2번 뭐가 달라?"], label: "비교" },
      { examples: ["3만 원 안에서 2권 골라 줘"], label: "예산 안에서" },
      { examples: ["1번 주문해 줘"], label: "주문" },
    ],
    title: "추천받은 뒤에",
  },
];

export function quoteExamples(examples: readonly string[]) {
  return examples.map((example) => `“${example}”`).join(", ");
}
