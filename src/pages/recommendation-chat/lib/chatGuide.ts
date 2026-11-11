import type { ComponentType, SVGProps } from "react";

import { BookOpenIcon, CartIcon, SearchIcon, TagIcon } from "@/common/components/AppIcons";

// The first-screen chip that shows the guide as 북적이's answer. It is answered on the screen and never sent.
export const CHAT_GUIDE_QUESTION = "북적이는 뭘 할 수 있어?";

interface ChatGuideTopicBase {
  Icon: ComponentType<SVGProps<SVGSVGElement>>;
  id: string;
  // One short line under the title, shown while the row is closed.
  summary: string;
  title: string;
}

export type ChatGuideTopic =
  | (ChatGuideTopicBase & { kind: "questions"; questions: readonly string[] })
  // Each tip is one line of examples that say the same kind of thing.
  | (ChatGuideTopicBase & { intro: string; kind: "tips"; tips: readonly (readonly string[])[] });

// What 북적이 can do. The "뭘 할 수 있어?" answer and the guidebook sheet both show this list as the same rows, so
// copy changes land in one place. Questions are sent as-is when tapped; each was sent as a first turn to the dev
// chatbot twice (2026-11-11) and answered the same way both times. Things that change the cart ("…담아 줘" adds a
// book the user never picked) or point at a card (there are no cards yet) are tips, shown as text and never as buttons.
export const CHAT_GUIDE_TOPICS: readonly ChatGuideTopic[] = [
  {
    Icon: SearchIcon,
    id: "find",
    kind: "questions",
    questions: ["출퇴근길에 읽기 좋은 짧은 에세이", "사회초년생 재테크 입문서"],
    summary: "언제, 어떤 마음으로 읽을지",
    title: "기분·상황으로 찾기",
  },
  {
    Icon: BookOpenIcon,
    id: "widen",
    kind: "questions",
    questions: ["『아몬드』 재밌게 읽었는데 비슷한 책"],
    summary: "재밌게 읽은 책과 비슷한 책",
    title: "읽은 책에서 넓히기",
  },
  {
    Icon: TagIcon,
    id: "shop",
    kind: "questions",
    questions: ["『아몬드』 얼마야?", "주문 내역 보여 줘"],
    summary: "책값·주문 내역·장바구니",
    title: "가격·주문 묻기",
  },
  {
    Icon: CartIcon,
    id: "after-cards",
    intro: "책 카드가 나오면 이렇게 말할 수 있어요",
    kind: "tips",
    summary: "카드를 담고, 비교하고, 주문",
    tips: [["1번 담아 줘", "2권으로 바꿔 줘"], ["1번이랑 2번 뭐가 달라?"], ["3만 원 안에서 2권 골라 줘"], ["1번 주문해 줘"]],
    title: "추천받은 뒤에",
  },
];

export function quoteExamples(examples: readonly string[]) {
  return examples.map((example) => `“${example}”`).join(", ");
}
