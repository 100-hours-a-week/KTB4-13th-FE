import { Navigate, useNavigate } from "react-router-dom";

import { Button } from "@/common/components/Button";
import { Toast } from "@/common/components/Toast";
import { BookCriteriaStep } from "@/features/onboarding/components/BookCriteriaStep";
import { BookPickStep } from "@/features/onboarding/components/BookPickStep";
import { MainCategoryStep } from "@/features/onboarding/components/MainCategoryStep";
import { OnboardingActions } from "@/features/onboarding/components/OnboardingActions";
import { OnboardingHeader } from "@/features/onboarding/components/OnboardingHeader";
import { OnboardingQuestionHeader } from "@/features/onboarding/components/OnboardingQuestionHeader";
import { ReadingTimeStep } from "@/features/onboarding/components/ReadingTimeStep";
import { RetryButton } from "@/features/onboarding/components/RetryButton";
import { SubcategoryStep } from "@/features/onboarding/components/SubcategoryStep";
import { useOnboardingFlow } from "@/features/onboarding/hooks/useOnboardingFlow";
import { usePersonalizationConsent } from "@/features/onboarding/hooks/usePersonalizationConsent";

// TODO(KTB4-13th-BE#129): Save selections with PUT /api/v1/onboarding/books once candidates come
// from the backend. Mock candidate ids are not books.id values, so saving (and completing
// onboarding) stays disabled instead of sending fake ids or an empty list.
const BOOK_SAVE_UNAVAILABLE_NOTICE = "도서 저장은 준비 중이에요";

export function OnboardingPage() {
  const navigate = useNavigate();
  const { hasAgreedToPersonalization, setHasAgreedToPersonalization } =
    usePersonalizationConsent();
  const {
    goToPreviousStep,
    hasSaveError,
    isCompleted,
    isSaving,
    isSelectionValid,
    limitNotice,
    progressStatus,
    question,
    questionStatus,
    retryProgress,
    retryQuestion,
    saveAnswersAndGoNext,
    selectedBookIds,
    selectedOptionIds,
    step,
    toggleBook,
    toggleOption,
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

  const goHome = () => navigate("/");

  if (isCompleted) {
    return <Navigate replace to="/" />;
  }

  if (progressStatus !== "ready") {
    return (
      <main className="flex min-h-dvh items-center justify-center bg-surface px-5 py-10">
        <div className="w-full max-w-sm">
          {progressStatus === "error" ? (
            <Toast action={<RetryButton onClick={retryProgress} />} variant="error">
              온보딩 정보를 불러오지 못했어요
            </Toast>
          ) : (
            <p
              aria-live="polite"
              className="text-center type-body text-text-secondary"
              role="status"
            >
              온보딩 정보를 불러오는 중이에요
            </p>
          )}
        </div>
      </main>
    );
  }

  const canGoNext =
    isSelectionValid && (step !== 1 || hasAgreedToPersonalization);

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-surface">
      <OnboardingHeader
        action={
          step === 5 ? (
            <button
              className="type-body-small font-semibold text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
              onClick={goHome}
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
        {step !== 5 && questionStatus === "loading" ? (
          <p
            aria-live="polite"
            className="type-body text-text-secondary"
            role="status"
          >
            질문을 불러오는 중이에요
          </p>
        ) : null}
        {step !== 5 && questionStatus === "error" ? (
          <Toast action={<RetryButton onClick={retryQuestion} />} variant="error">
            질문을 불러오지 못했어요
          </Toast>
        ) : null}
        {step === 1 && question ? (
          <ReadingTimeStep
            hasAgreedToPersonalization={hasAgreedToPersonalization}
            onSetHasAgreedToPersonalization={setHasAgreedToPersonalization}
            onToggleOption={toggleOption}
            question={question}
            selectedOptionIds={selectedOptionIds}
          />
        ) : null}
        {step === 2 && question ? (
          <BookCriteriaStep
            onToggleOption={toggleOption}
            question={question}
            selectedOptionIds={selectedOptionIds}
          />
        ) : null}
        {step === 3 && question ? (
          <MainCategoryStep
            onToggleOption={toggleOption}
            question={question}
            selectedOptionIds={selectedOptionIds}
          />
        ) : null}
        {step === 4 && question ? (
          <SubcategoryStep
            onToggleOption={toggleOption}
            question={question}
            selectedOptionIds={selectedOptionIds}
          />
        ) : null}
        {step === 5 ? (
          <BookPickStep onToggleBook={toggleBook} selectedBookIds={selectedBookIds} />
        ) : null}
      </div>

      <OnboardingActions
        feedback={
          limitNotice ?? (step === 5 ? BOOK_SAVE_UNAVAILABLE_NOTICE : undefined)
        }
      >
        {hasSaveError ? (
          <Toast variant="error">
            답변을 저장하지 못했어요. 다시 시도해 주세요
          </Toast>
        ) : null}
        {step < 5 ? (
          <Button
            className="w-full"
            disabled={!canGoNext}
            isLoading={isSaving}
            onClick={saveAnswersAndGoNext}
          >
            {step === 1 ? "동의하고 다음" : "다음"}
          </Button>
        ) : (
          <Button className="w-full" disabled>
            내 서재에 담고 취향 확인하기
          </Button>
        )}
        {step === 1 ? (
          <Button className="w-full" onClick={goHome} variant="secondary">
            개인화 없이 홈으로 이동
          </Button>
        ) : null}
      </OnboardingActions>
    </main>
  );
}
