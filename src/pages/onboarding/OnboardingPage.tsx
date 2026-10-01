import { useRef, useState } from "react";
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
import { RetryButton } from "@/common/components/RetryButton";
import { SubcategoryStep } from "@/features/onboarding/components/SubcategoryStep";
import { useOnboardingFlow } from "@/features/onboarding/hooks/useOnboardingFlow";
import { usePersonalizationConsent } from "@/features/onboarding/hooks/usePersonalizationConsent";

export function OnboardingPage() {
  const navigate = useNavigate();
  const consentActionRef = useRef(false);
  const [isSubmittingConsent, setIsSubmittingConsent] = useState(false);
  const {
    hasAgreedToPersonalization,
    hasConsentSaveError,
    isSavingConsent,
    setHasAgreedToPersonalization,
    submitConsentSelection,
  } = usePersonalizationConsent();
  const {
    bookCandidates,
    bookCandidatesStatus,
    goToPreviousStep,
    hasSaveError,
    isSaving,
    isSelectionValid,
    limitNotice,
    optionLabelsById,
    progressStatus,
    question,
    questionStatus,
    retryBookCandidates,
    retryProgress,
    retryQuestion,
    saveAnswersAndGoNext,
    saveBooksAndComplete,
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

  const handleSaveAnswersAndGoNext = async () => {
    if (step !== 1) {
      await saveAnswersAndGoNext();
      return;
    }

    if (consentActionRef.current) {
      return;
    }

    consentActionRef.current = true;
    setIsSubmittingConsent(true);
    const isConsentSaved = await submitConsentSelection();

    if (isConsentSaved) {
      await saveAnswersAndGoNext();
    }

    consentActionRef.current = false;
    setIsSubmittingConsent(false);
  };

  const handleCompleteOnboarding = async () => {
    const isSaved = await saveBooksAndComplete();

    if (isSaved) {
      navigate("/");
    }
  };

  if (progressStatus === "completed") {
    return <Navigate replace to="/" />;
  }

  if (progressStatus !== "ready") {
    const hasEntryError = progressStatus === "error";

    return (
      <main className="flex min-h-dvh items-center justify-center bg-surface px-5 py-10">
        <div className="w-full max-w-sm">
          {hasEntryError ? (
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
  const isConsentBusy = isSubmittingConsent || isSavingConsent;

  return (
    <main className="flex h-dvh flex-col overflow-hidden bg-surface">
      <OnboardingHeader
        action={
          step === 5 ? (
            <button
              aria-busy={isSaving || undefined}
              className="type-body-small font-semibold text-text-secondary transition-colors hover:text-text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary disabled:cursor-not-allowed disabled:text-text-disabled"
              disabled={bookCandidatesStatus !== "ready" || isSaving}
              onClick={handleCompleteOnboarding}
              type="button"
            >
              {isSaving ? "저장 중" : "홈으로 이동"}
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
            optionLabelsById={optionLabelsById}
            question={question}
            selectedOptionIds={selectedOptionIds}
          />
        ) : null}
        {step === 5 ? (
          bookCandidatesStatus === "loading" ? (
            <p
              aria-live="polite"
              className="type-body text-text-secondary"
              role="status"
            >
              추천 도서를 불러오는 중이에요
            </p>
          ) : bookCandidatesStatus === "error" ? (
            <Toast
              action={<RetryButton onClick={retryBookCandidates} />}
              variant="error"
            >
              추천 도서를 불러오지 못했어요
            </Toast>
          ) : bookCandidates.length === 0 ? (
            <div className="rounded-panel border border-border bg-muted px-4 py-6 text-center">
              <p className="type-body font-medium text-text-primary">
                선택할 수 있는 책이 아직 없어요
              </p>
              <p className="mt-1 type-caption text-text-secondary">
                상단의 홈으로 이동을 눌러 온보딩을 완료해 주세요.
              </p>
            </div>
          ) : (
            <BookPickStep
              books={bookCandidates}
              onToggleBook={toggleBook}
              selectedBookIds={selectedBookIds}
            />
          )
        ) : null}
      </div>

      <OnboardingActions feedback={limitNotice ?? undefined}>
        {hasSaveError ? (
          <Toast variant="error">
            {step === 5
              ? "선택한 책을 저장하지 못했어요. 다시 시도해 주세요"
              : "답변을 저장하지 못했어요. 다시 시도해 주세요"}
          </Toast>
        ) : null}
        {hasConsentSaveError ? (
          <Toast variant="error">
            동의 상태를 저장하지 못했어요. 다시 시도해 주세요
          </Toast>
        ) : null}
        {step < 5 ? (
          <Button
            className="w-full"
            disabled={!canGoNext || isConsentBusy}
            isLoading={
              step === 1 ? isSubmittingConsent : isSaving
            }
            onClick={handleSaveAnswersAndGoNext}
          >
            {step === 1 ? "동의하고 다음" : "다음"}
          </Button>
        ) : (
          <Button
            className="w-full"
            disabled={
              bookCandidatesStatus !== "ready" || selectedBookIds.length === 0
            }
            isLoading={isSaving}
            onClick={handleCompleteOnboarding}
          >
            내 서재에 담고 취향 확인하기
          </Button>
        )}
      </OnboardingActions>
    </main>
  );
}
