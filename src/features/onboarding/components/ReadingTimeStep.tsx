import { useState } from "react";

import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { SelectableOptionList } from "@/features/onboarding/components/SelectableOptionList";
import { readingTimeOptions } from "@/features/onboarding/mocks/onboardingMockData";

const MAX_READING_TIME_SELECTION = 5;

interface ReadingTimeStepProps {
  hasAgreedToPrivacy: boolean;
  onSetHasAgreedToPrivacy: (value: boolean) => void;
  onToggleReadingTime: (id: string) => void;
  readingTimeIds: string[];
}

export function ReadingTimeStep({
  hasAgreedToPrivacy,
  onSetHasAgreedToPrivacy,
  onToggleReadingTime,
  readingTimeIds,
}: ReadingTimeStepProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <OnboardingQuestionHeader
        counter={`${readingTimeIds.length}/${MAX_READING_TIME_SELECTION}개 선택`}
        title="주로 언제 책을 읽으시나요?"
      />
      <SelectableOptionList
        onToggle={onToggleReadingTime}
        options={readingTimeOptions}
        selectedIds={readingTimeIds}
      />

      <div className="border-t border-border pt-5">
        <h3 className="type-title text-text-primary">맞춤 추천을 위한 정보 활용</h3>
        <label className="mt-3 flex items-start gap-2.5">
          <input
            checked={hasAgreedToPrivacy}
            className="mt-0.5 size-4 accent-accent"
            onChange={(event) => onSetHasAgreedToPrivacy(event.target.checked)}
            type="checkbox"
          />
          <span className="flex flex-col gap-1">
            <span className="type-body-small font-medium text-text-primary">
              개인정보 수집·이용에 동의합니다 (필수)
            </span>
            <span className="type-caption text-text-secondary">
              입력한 취향 정보는 맞춤 도서 추천에 활용돼요.
            </span>
          </span>
        </label>
        <button
          aria-expanded={isDetailOpen}
          className="mt-2 type-caption font-semibold text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setIsDetailOpen((current) => !current)}
          type="button"
        >
          수집 항목 자세히 보기 →
        </button>
        {isDetailOpen ? (
          <p className="mt-2 type-caption text-text-tertiary">
            수집 항목: 읽는 시간대, 책 선택 기준, 관심 카테고리, 선택한 도서
          </p>
        ) : null}
      </div>
    </div>
  );
}
