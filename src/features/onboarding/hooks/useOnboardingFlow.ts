import { useEffect, useRef, useState } from "react";

import {
  fetchOnboardingBookCandidates,
  fetchOnboardingProgress,
  fetchOnboardingQuestion,
  saveOnboardingAnswers,
  saveOnboardingBooks,
} from "@/features/onboarding/api/onboardingApi";
import {
  QUESTION_ID_BY_STEP,
  getResumeStep,
  isQuestionStep,
} from "@/features/onboarding/lib/onboardingSteps";
import { toSubcategoryCodes } from "@/features/onboarding/lib/subcategoryCodes";
import type {
  BookCandidate,
  OnboardingQuestion,
  OnboardingStep,
} from "@/features/onboarding/types/onboarding";

const TOTAL_STEPS = 5;
const LIMIT_NOTICE_DURATION_MS = 2_000;

function hasSameOptionIds(selectedOptionIds: number[], savedOptionIds: number[]) {
  return (
    selectedOptionIds.length === savedOptionIds.length &&
    selectedOptionIds.every((optionId) => savedOptionIds.includes(optionId))
  );
}

type LoadStatus = "loading" | "error" | "ready";
type ProgressStatus = LoadStatus | "completed";

export function useOnboardingFlow() {
  const [progressStatus, setProgressStatus] =
    useState<ProgressStatus>("loading");
  const [progressRequestKey, setProgressRequestKey] = useState(0);
  const [step, setStep] = useState<OnboardingStep>(1);
  const [selectedOptionIdsByQuestion, setSelectedOptionIdsByQuestion] =
    useState<Record<number, number[]>>({});
  // Answers the server already holds, so going back and forward unchanged does not re-save them.
  const [savedOptionIdsByQuestion, setSavedOptionIdsByQuestion] = useState<
    Record<number, number[]>
  >({});
  const [question, setQuestion] = useState<OnboardingQuestion | null>(null);
  const [questionStatus, setQuestionStatus] = useState<LoadStatus>("loading");
  const [questionRequestKey, setQuestionRequestKey] = useState(0);
  const [optionLabelsById, setOptionLabelsById] = useState<
    Record<number, string>
  >({});
  const [bookCandidates, setBookCandidates] = useState<BookCandidate[]>([]);
  const [bookCandidatesStatus, setBookCandidatesStatus] =
    useState<LoadStatus>("loading");
  const [bookCandidatesRequestKey, setBookCandidatesRequestKey] = useState(0);
  const [isSaving, setIsSaving] = useState(false);
  const [hasSaveError, setHasSaveError] = useState(false);
  const [limitNotice, setLimitNotice] = useState<string | null>(null);
  const [selectedBookIds, setSelectedBookIds] = useState<number[]>([]);
  const isSavingRef = useRef(false);

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
        if (result.progress.status === "COMPLETED") {
          setProgressStatus("completed");
          return;
        }

        const savedAnswers = Object.fromEntries(
          result.progress.answers.map((answer) => [
            answer.questionId,
            answer.optionIds,
          ]),
        );
        setSelectedOptionIdsByQuestion(savedAnswers);
        setSavedOptionIdsByQuestion(savedAnswers);
        setSelectedBookIds(result.progress.bookIds);
        setStep(getResumeStep(result.progress.answers));
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

    const parentQuestionPromise =
      questionId === QUESTION_ID_BY_STEP[4]
        ? fetchOnboardingQuestion(QUESTION_ID_BY_STEP[3])
        : Promise.resolve(null);

    void Promise.all([
      fetchOnboardingQuestion(questionId),
      parentQuestionPromise,
    ]).then(([loadedQuestion, parentQuestion]) => {
      if (!isActive) {
        return;
      }

      if (
        !loadedQuestion ||
        (questionId === QUESTION_ID_BY_STEP[4] && !parentQuestion)
      ) {
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
      setOptionLabelsById((current) => ({
        ...current,
        ...Object.fromEntries(
          [...(parentQuestion?.options ?? []), ...loadedQuestion.options].map(
            (option) => [option.optionId, option.content],
          ),
        ),
      }));
      setQuestionStatus("ready");
    });

    return () => {
      isActive = false;
    };
  }, [progressStatus, questionId, questionRequestKey]);

  useEffect(() => {
    if (progressStatus !== "ready" || step !== 5) {
      return undefined;
    }

    let isActive = true;
    const subcategoryQuestionId = QUESTION_ID_BY_STEP[4];
    const selectedSubcategoryOptionIds =
      selectedOptionIdsByQuestion[subcategoryQuestionId] ?? [];

    // Rebuilt from the saved Q4 answer and the server's Q4 options on every load and retry,
    // so a refresh or re-entry at step 5 sends the same codes as the first visit.
    void fetchOnboardingQuestion(subcategoryQuestionId).then(
      async (subcategoryQuestion) => {
        const subcategoryCodes = subcategoryQuestion
          ? toSubcategoryCodes(subcategoryQuestion, selectedSubcategoryOptionIds)
          : null;
        const loadedBooks = subcategoryCodes
          ? await fetchOnboardingBookCandidates(subcategoryCodes)
          : null;

        if (!isActive) {
          return;
        }

        if (!loadedBooks) {
          setBookCandidatesStatus("error");
          return;
        }

        setBookCandidates(loadedBooks);
        setBookCandidatesStatus("ready");
      },
    );

    return () => {
      isActive = false;
    };
  }, [bookCandidatesRequestKey, progressStatus, selectedOptionIdsByQuestion, step]);

  const moveToStep = (nextStep: OnboardingStep) => {
    setStep(nextStep);
    setQuestion(null);
    setQuestionStatus("loading");
    if (nextStep === 5) {
      setBookCandidatesStatus("loading");
    }
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

  const retryBookCandidates = () => {
    setBookCandidatesStatus("loading");
    setBookCandidatesRequestKey((current) => current + 1);
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
    if (!question || !isSelectionValid || isSavingRef.current) {
      return;
    }

    const nextStep = Math.min(step + 1, TOTAL_STEPS) as OnboardingStep;
    const savedOptionIds = savedOptionIdsByQuestion[question.questionId] ?? [];

    // The backend rejects re-saving an answer it already holds, and nothing would change anyway.
    if (hasSameOptionIds(selectedOptionIds, savedOptionIds)) {
      moveToStep(nextStep);
      return;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setHasSaveError(false);

    const isSaved = await saveOnboardingAnswers(
      question.questionId,
      selectedOptionIds,
    );

    isSavingRef.current = false;
    setIsSaving(false);

    if (!isSaved) {
      setHasSaveError(true);
      return;
    }

    setSavedOptionIdsByQuestion((current) => ({
      ...current,
      [question.questionId]: selectedOptionIds,
    }));
    moveToStep(nextStep);
  };

  const goToPreviousStep = () => {
    if (step > 1) {
      moveToStep((step - 1) as OnboardingStep);
    }
  };

  const toggleBook = (id: number) => {
    setSelectedBookIds((current) =>
      current.includes(id)
        ? current.filter((bookId) => bookId !== id)
        : [...current, id],
    );
  };

  const saveBooksAndComplete = async () => {
    if (bookCandidatesStatus !== "ready" || isSavingRef.current) {
      return false;
    }

    isSavingRef.current = true;
    setIsSaving(true);
    setHasSaveError(false);

    const isSaved = await saveOnboardingBooks(selectedBookIds);

    isSavingRef.current = false;
    setIsSaving(false);

    if (!isSaved) {
      setHasSaveError(true);
      return false;
    }

    return true;
  };

  return {
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
    totalSteps: TOTAL_STEPS,
  };
}
