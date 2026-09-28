import { useNavigate } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { BookCriteriaStep } from "@/features/onboarding/components/BookCriteriaStep";
import { BookPickStep } from "@/features/onboarding/components/BookPickStep";
import { MainCategoryStep } from "@/features/onboarding/components/MainCategoryStep";
import { OnboardingActions } from "@/features/onboarding/components/OnboardingActions";
import { OnboardingHeader } from "@/features/onboarding/components/OnboardingHeader";
import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { ReadingTimeStep } from "@/features/onboarding/components/ReadingTimeStep";
import { SubcategoryStep } from "@/features/onboarding/components/SubcategoryStep";
import { useOnboardingFlow } from "@/features/onboarding/hooks/useOnboardingFlow";

export function OnboardingPage() {
  const navigate = useNavigate();
  const {
    criteriaIds,
    goToNextStep,
    goToPreviousStep,
    hasAgreedToPrivacy,
    isCurrentStepValid,
    limitNotice,
    mainCategoryIds,
    readingTimeIds,
    selectedBookIds,
    selectedMainCategories,
    setHasAgreedToPrivacy,
    step,
    subcategoryIds,
    toggleBook,
    toggleCriteria,
    toggleMainCategory,
    toggleReadingTime,
    toggleSubcategory,
    totalSteps,
  } = useOnboardingFlow();

  const handleBack = () => {
    if (step > 1) {
      goToPreviousStep();
      return;
    }

    if (window.history.length > 1) {
      navigate(-1);
      return;
    }

    navigate("/login");
  };

  const handleFinishWithBooks = () => {
    // TODO: 온보딩 완료·도서 저장 API가 생기면 이 로그를 실제 요청으로 교체하고, 성공 시 홈으로 이동한다.
    console.log("[onboarding] 내 서재에 담고 취향 확인하기", {
      criteriaIds,
      hasAgreedToPrivacy,
      mainCategoryIds,
      readingTimeIds,
      selectedBookIds,
      subcategoryIds,
    });
  };

  const handleFinishWithoutBooks = () => {
    // TODO: 온보딩 완료 API가 생기면 이 로그를 실제 요청으로 교체하고, 성공 시 홈으로 이동한다.
    console.log("[onboarding] 홈으로 이동 (책 저장 없이 완료)", {
      criteriaIds,
      hasAgreedToPrivacy,
      mainCategoryIds,
      readingTimeIds,
      subcategoryIds,
    });
  };

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-surface">
      <OnboardingHeader
        action={
          step === 5 ? (
            <button
              className="type-body-small font-semibold text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={handleFinishWithoutBooks}
              type="button"
            >
              홈으로 이동
            </button>
          ) : undefined
        }
        onBack={handleBack}
        step={step}
        totalSteps={totalSteps}
      />

      {step === 5 ? (
        <div className="page-content mt-6 shrink-0">
          <OnboardingQuestionHeader
            counter={`${selectedBookIds.length}권 선택`}
            description="많이 고를수록 추천이 더 정확해져요"
            title={
              <>
                마음에 드는 책이 있으면
                <br />
                골라주세요
              </>
            }
          />
        </div>
      ) : null}

      <div className="page-content min-h-0 flex-1 overflow-y-auto pb-6 pt-6">
        {step === 1 ? (
          <ReadingTimeStep
            hasAgreedToPrivacy={hasAgreedToPrivacy}
            onSetHasAgreedToPrivacy={setHasAgreedToPrivacy}
            onToggleReadingTime={toggleReadingTime}
            readingTimeIds={readingTimeIds}
          />
        ) : null}
        {step === 2 ? (
          <BookCriteriaStep
            criteriaIds={criteriaIds}
            onToggleCriteria={toggleCriteria}
          />
        ) : null}
        {step === 3 ? (
          <MainCategoryStep
            mainCategoryIds={mainCategoryIds}
            onToggleMainCategory={toggleMainCategory}
          />
        ) : null}
        {step === 4 ? (
          <SubcategoryStep
            onToggleSubcategory={toggleSubcategory}
            selectedMainCategories={selectedMainCategories}
            subcategoryIds={subcategoryIds}
          />
        ) : null}
        {step === 5 ? (
          <BookPickStep onToggleBook={toggleBook} selectedBookIds={selectedBookIds} />
        ) : null}
      </div>

      <OnboardingActions feedback={limitNotice}>
        {step < 5 ? (
          <Button
            className="w-full"
            disabled={!isCurrentStepValid}
            onClick={goToNextStep}
          >
            {step === 1 ? "동의하고 다음" : "다음"}
          </Button>
        ) : (
          <Button className="w-full" onClick={handleFinishWithBooks}>
            내 서재에 담고 취향 확인하기
          </Button>
        )}
      </OnboardingActions>
    </main>
  );
}
