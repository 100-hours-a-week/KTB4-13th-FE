import { useState } from "react";

import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { SelectableOptionList } from "@/features/onboarding/components/SelectableOptionList";
import type { OnboardingQuestion } from "@/features/onboarding/types/onboarding";

// TODO(KTB4-13th-BE#129): The retention period is a provisional wording until the policy is confirmed.
const consentDetails = [
  { term: "이용 목적", description: "독서 취향 분석 및 개인화 도서 추천 제공" },
  {
    term: "수집·이용 항목",
    description: "온보딩 질문 응답, 선택한 관심 도서",
  },
  {
    term: "보유·이용 기간",
    description: "회원 탈퇴 또는 개인화 추천 동의 철회 시까지",
  },
  {
    term: "동의 거부",
    description:
      "동의를 거부할 수 있으며, 거부 시 개인화 추천 기능 이용이 제한돼요.",
  },
];

interface ReadingTimeStepProps {
  hasAgreedToPersonalization: boolean;
  onSetHasAgreedToPersonalization: (value: boolean) => void;
  onToggleOption: (optionId: number) => void;
  question: OnboardingQuestion;
  selectedOptionIds: number[];
}

export function ReadingTimeStep({
  hasAgreedToPersonalization,
  onSetHasAgreedToPersonalization,
  onToggleOption,
  question,
  selectedOptionIds,
}: ReadingTimeStepProps) {
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  return (
    <div className="flex flex-col gap-6">
      <OnboardingQuestionHeader
        counter={`${selectedOptionIds.length}/${question.maxSelection ?? question.options.length}개 선택`}
        title={question.content}
      />
      <SelectableOptionList
        onToggle={onToggleOption}
        options={question.options}
        selectedIds={selectedOptionIds}
      />

      <div className="border-t border-border pt-5">
        <h3 className="type-title text-text-primary">맞춤 추천을 위한 정보 활용</h3>
        <label className="mt-3 flex items-start gap-2.5">
          <input
            checked={hasAgreedToPersonalization}
            className="mt-0.5 size-4 accent-accent"
            onChange={(event) =>
              onSetHasAgreedToPersonalization(event.target.checked)
            }
            type="checkbox"
          />
          <span className="flex flex-col gap-1">
            <span className="type-body-small font-medium text-text-primary">
              개인화 도서 추천을 위한 정보 수집·이용에 동의합니다
            </span>
            <span className="type-caption text-text-secondary">
              동의하지 않으면 개인화 추천 없이 홈으로 이동할 수 있어요.
            </span>
          </span>
        </label>
        <button
          aria-controls="personalization-consent-detail"
          aria-expanded={isDetailOpen}
          className="mt-2 type-caption font-semibold text-accent focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
          onClick={() => setIsDetailOpen((current) => !current)}
          type="button"
        >
          수집·이용 내용 자세히 보기 →
        </button>
        <dl
          className="mt-2 flex flex-col gap-1.5 rounded-control bg-muted px-3 py-2.5 type-caption"
          hidden={!isDetailOpen}
          id="personalization-consent-detail"
        >
          {consentDetails.map(({ description, term }) => (
            <div className="flex gap-2" key={term}>
              <dt className="w-24 shrink-0 font-semibold text-text-secondary">
                {term}
              </dt>
              <dd className="text-text-tertiary">{description}</dd>
            </div>
          ))}
        </dl>
      </div>
    </div>
  );
}
