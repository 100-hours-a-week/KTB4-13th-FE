import { useId, useState } from "react";

import { ChevronDownIcon } from "@/common/components/AppIcons";
import { CHAT_GUIDE_TOPICS, quoteExamples, type ChatGuideTopic } from "@/pages/recommendation-chat/lib/chatGuide";

export const CHAT_EXAMPLE_CHIP_CLASS_NAME =
  "min-h-10 rounded-full border border-border bg-surface px-3.5 text-left type-body-small text-text-primary transition-colors hover:border-border-strong hover:bg-muted focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-text-disabled disabled:hover:border-border disabled:hover:bg-surface";

// "card" sits in 북적이's answer bubble column; "sheet" runs edge to edge in the guidebook sheet.
type ChatGuideTopicListAppearance = "card" | "sheet";

const LIST_CLASS_NAMES: Record<ChatGuideTopicListAppearance, string> = {
  card: "mt-1.5 divide-y divide-hairline overflow-hidden rounded-panel border border-hairline bg-surface",
  sheet: "divide-y divide-hairline border-t border-hairline",
};
const ROW_PADDING_CLASS_NAMES: Record<ChatGuideTopicListAppearance, string> = {
  card: "px-3",
  sheet: "px-5",
};
// In the sheet the examples line up under the row title (row padding + icon + gap).
const PANEL_PADDING_CLASS_NAMES: Record<ChatGuideTopicListAppearance, string> = {
  card: "px-3 pb-3",
  sheet: "pb-3.5 pl-15.5 pr-5",
};

// Topics with sendable questions get the accent circle; "추천받은 뒤에" is text only, so it stays neutral.
function ChatGuideTopicIcon({ topic }: { topic: ChatGuideTopic }) {
  const { Icon } = topic;
  return (
    <span
      aria-hidden="true"
      className={`inline-flex size-8 shrink-0 items-center justify-center rounded-full ${
        topic.kind === "questions" ? "bg-accent-soft text-accent-hover" : "bg-muted text-text-secondary"
      }`}
    >
      <Icon className="size-4.5" strokeWidth={2} />
    </span>
  );
}

interface ChatGuideTopicListProps {
  appearance: ChatGuideTopicListAppearance;
  // While a reply is still coming the chat ignores new messages, so the examples are disabled.
  canSend?: boolean;
  onSelect: (question: string) => void;
}

// What 북적이 can do, one row per topic and one open at a time (the first to begin with), so only a title and a
// short line per topic show until a row is opened. An open row shows its questions as buttons that send the
// question, or the after-cards tips as text.
export function ChatGuideTopicList({ appearance, canSend = true, onSelect }: ChatGuideTopicListProps) {
  const [openTopicId, setOpenTopicId] = useState<string | null>(CHAT_GUIDE_TOPICS[0].id);
  const panelIdPrefix = useId();

  return (
    <ul className={LIST_CLASS_NAMES[appearance]}>
      {CHAT_GUIDE_TOPICS.map((topic) => {
        const isOpen = openTopicId === topic.id;
        const panelId = `${panelIdPrefix}-${topic.id}`;
        return (
          <li key={topic.id}>
            <button
              aria-controls={panelId}
              aria-expanded={isOpen}
              className={`flex min-h-15 w-full items-center gap-2.5 py-2.5 text-left transition-colors hover:bg-muted focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-primary ${ROW_PADDING_CLASS_NAMES[appearance]}`}
              onClick={() => setOpenTopicId(isOpen ? null : topic.id)}
              type="button"
            >
              <ChatGuideTopicIcon topic={topic} />
              <span className="flex min-w-0 flex-1 flex-col">
                <span className="type-body font-semibold text-text-primary">{topic.title}</span>
                <span className="type-caption text-text-secondary">{topic.summary}</span>
              </span>
              <ChevronDownIcon
                className={`size-4.5 shrink-0 text-text-tertiary transition-transform motion-reduce:transition-none ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            <div className={PANEL_PADDING_CLASS_NAMES[appearance]} hidden={!isOpen} id={panelId}>
              {topic.kind === "questions" ? (
                <ul aria-label={topic.title} className="flex flex-wrap gap-2">
                  {topic.questions.map((question) => (
                    <li key={question}>
                      <button
                        className={CHAT_EXAMPLE_CHIP_CLASS_NAME}
                        disabled={!canSend}
                        onClick={() => onSelect(question)}
                        type="button"
                      >
                        {question}
                      </button>
                    </li>
                  ))}
                </ul>
              ) : (
                <>
                  <p className="mb-1.5 type-caption text-text-secondary">{topic.intro}</p>
                  <ul className="flex flex-col gap-1.5">
                    {topic.tips.map((examples) => (
                      <li className="rounded-control bg-muted px-3 py-2 type-body-small text-text-primary" key={examples.join("|")}>
                        {quoteExamples(examples)}
                      </li>
                    ))}
                  </ul>
                </>
              )}
            </div>
          </li>
        );
      })}
    </ul>
  );
}
