import { useEffect, useState } from "react";

import {
  fetchOnboardingProgress,
  fetchOnboardingQuestion,
  saveOnboardingAnswers,
} from "@/features/onboarding/api/onboardingApi";
import {
  QUESTION_ID_BY_STEP,
  getResumeStep,
  isQuestionStep,
} from "@/features/onboarding/lib/onboardingSteps";
import type {
  OnboardingQuestion,
  OnboardingStep,
} from "@/features/onboarding/types/onboarding";

const TOTAL_STEPS = 5;
const LIMIT_NOTICE_DURATION_MS = 2_000;

type LoadStatus = "loading" | "error" | "ready";

export function useOnboardingFlow() {
  const [progressStatus, setProgressStatus] = useState<LoadStatus>("loading");
  const [progressRequestKey, setProgressRequestKey] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);
  const [step, setStep] = useState<OnboardingStep>(1);
  const [resumeStep, setResumeStep] = useState<OnboardingStep>(1);
  const [selectedOptionIdsByQuestion, setSelectedOptionIdsByQuestion] =
    useState<Record<number, number[]>>({});
  const [question, setQuestion] = useState<OnboardingQuestion | null>(null);
  const [questionStatus, setQuestionStatus] = useState<LoadStatus>("loading");
  const [questionRequestKey, setQuestionRequestKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<string[]>([]);

  const questionId = isQuestionStep(step) ? QUESTION_ID_BY_STEP[step] : null;
  const selectedOptionIds = question
    ? (selectedOptionIdsByQuestion[question.questionId] ?? [])
    : [];

  useEffect(() => {
    if (!limitNotice) {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setLimitNotice(null);
    }, LIMIT_NOTICE_DURATION_MS);

    return () => window.clearTimeout(timeoutId);
  }, [limitNotice]);

  useEffect(() => {
    let isActive = true;

    void fetchOnboardingProgress().then((result) => {
      if (!isActive) {
        return;
      }

      if (result.kind === "error") {
        setProgressStatus("error");
        return;
      }

      if (result.kind === "found") {
        setIsCompleted(result.progress.status === "COMPLETED");
        setSelectedOptionIdsByQuestion(
          Object.fromEntries(
            result.progress.answers.map((answer) => [
              answer.questionId,
              answer.optionIds,
            ]),
          ),
        );
        setResumeStep(getResumeStep(result.progress.answers));
      }

      setProgressStatus("ready");
    });

    return () => {
      isActive = false;
    };
  }, [progressRequestKey]);

  useEffect(() => {
    if (progressStatus !== "ready" || questionId === null) {
      return undefined;
    }

    let isActive = true;

    void fetchOnboardingQuestion(questionId).then((loadedQuestion) => {
      if (!isActive) {
        return;
      }

      if (!loadedQuestion) {
        setQuestionStatus("error");
        return;
      }

      // Drop selections the server no longer offers, e.g. Q4 options after Q3 changed.
      const offeredOptionIds = new Set(
        loadedQuestion.options.map((option) => option.optionId),
      );

      setSelectedOptionIdsByQuestion((current) => ({
        ...current,
        [questionId]: (current[questionId] ?? []).filter((optionId) =>
          offeredOptionIds.has(optionId),
        ),
      }));
      setQuestion(loadedQuestion);
      setQuestionStatus("ready");
    });

    return () => {
      isActive = false;
    };
  }, [progressStatus, questionId, questionRequestKey]);

  const moveToStep = (nextStep: OnboardingStep) => {
    setStep(nextStep);
    setQuestion(null);
    setQuestionStatus("loading");
    setHasSaveError(false);
    setLimitNotice(null);
  };

  const retryProgress = () => {
    setProgressStatus("loading");
    setProgressRequestKey((current) => current + 1);
  };

  const retryQuestion = () => {
    setQuestionStatus("loading");
    setQuestionRequestKey((current) => current + 1);
  };

  const toggleOption = (optionId: number) => {
    if (!question) {
      return;
    }

    const { maxSelection, questionId: currentQuestionId } = question;

    if (selectedOptionIds.includes(optionId)) {
      setSelectedOptionIdsByQuestion((current) => ({
        ...current,
        [currentQuestionId]: selectedOptionIds.filter((id) => id !== optionId),
      }));
      return;
    }

    if (maxSelection !== null && selectedOptionIds.length >= maxSelection) {
      setLimitNotice(`최대 ${maxSelection}개까지 선택할 수 있어요`);
      return;
    }

    setSelectedOptionIdsByQuestion((current) => ({
      ...current,
      [currentQuestionId]: [...selectedOptionIds, optionId],
    }));
  };

  const isSelectionValid =
    question !== null &&
    selectedOptionIds.length >= question.minSelection &&
    (question.maxSelection === null ||
      selectedOptionIds.length <= question.maxSelection);

  // Moves forward only after the answer is saved, so a failed save never skips a step.
  const saveAnswersAndGoNext = async () => {
    if (!question || !isSelectionValid || isSaving) {
      return;
    }

    setIsSaving(true);
    setHasSaveError(false);

    const isSaved = await saveOnboardingAnswers(
      question.questionId,
      selectedOptionIds,
    );

    setIsSaving(false);

    if (!isSaved) {
      setHasSaveError(true);
      return;
    }

    // Consent is not stored server-side yet, so a returning user re-confirms it on Q1
    // and then continues from the first question without a saved answer.
    const nextStep =
      step === 1 && resumeStep > 2
        ? resumeStep
        : (Math.min(step + 1, TOTAL_STEPS) as OnboardingStep);

    setResumeStep(1);
    moveToStep(nextStep);
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      moveToStep((step - 1) as OnboardingStep);
    }
  };

  const toggleBook = (id: string) => {
    setSelectedBookIds((current) =>
      current.includes(id)
        ? current.filter((bookId) => bookId !== id)
        : [...current, id],
    );
  };

  return {
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
    totalSteps: TOTAL_STEPS,
  };
}
