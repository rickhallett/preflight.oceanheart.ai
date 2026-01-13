"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type {
  FieldValue,
  FormAnswers,
  FormDefinition,
  FormPage,
  PageAnswers,
} from "@/lib/types/form-dsl";
import { isInputBlock } from "@/lib/types/form-dsl";
import { useAutosave, type SaveStatus } from "@/hooks/useAutosave";
import { useFormPersistence } from "@/hooks/useFormPersistence";
import { PageRenderer } from "./PageRenderer";
import { ProgressBar } from "./ProgressBar";
import { SaveIndicator } from "./SaveIndicator";

interface FormRuntimeProps {
  /** Form definition */
  form: FormDefinition;
  /** Run ID for this survey session */
  runId: string;
  /** Initial answers to populate */
  initialAnswers?: FormAnswers;
  /** Callback to save answers to server */
  onSaveAnswers?: (pageId: string, answers: PageAnswers) => Promise<void>;
  /** Callback when page changes */
  onPageChange?: (
    pageIndex: number,
    pageId: string,
    answers: PageAnswers
  ) => void;
  /** Callback when form is completed */
  onComplete?: (answers: FormAnswers) => void;
  /** Autosave debounce delay in ms (default: 30000) */
  autosaveDelay?: number;
  /** Whether autosave is enabled (default: true) */
  autosaveEnabled?: boolean;
}

export function FormRuntime({
  form,
  runId,
  initialAnswers = {},
  onSaveAnswers,
  onPageChange,
  onComplete,
  autosaveDelay = 30000,
  autosaveEnabled = true,
}: FormRuntimeProps) {
  const [currentPageIndex, setCurrentPageIndex] = useState(0);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saveStatus, setSaveStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);

  const currentPage = form.pages[currentPageIndex];
  const isFirstPage = currentPageIndex === 0;
  const isLastPage = currentPageIndex === form.pages.length - 1;

  // Use form persistence for localStorage backup
  const {
    answers,
    setFieldValue,
    setPageAnswers,
    queueSave,
    getPendingSaves,
    clearPendingSaves,
    isOnline,
  } = useFormPersistence({
    storageKey: `preflight-answers-${runId}`,
    initialAnswers,
    enabled: true,
  });

  // Track which page has pending changes for autosave
  const pendingPageRef = useRef<string | null>(null);
  const pendingAnswersRef = useRef<PageAnswers>({});

  // Get current page answers
  const pageAnswers = answers[currentPage.id] || {};

  // Save function for autosave
  const handleAutosave = useCallback(async () => {
    if (!onSaveAnswers || !pendingPageRef.current) return;

    const pageId = pendingPageRef.current;
    const pageAnswersToSave = pendingAnswersRef.current;

    if (Object.keys(pageAnswersToSave).length === 0) return;

    if (!isOnline) {
      // Queue for later when offline
      queueSave(pageId, pageAnswersToSave);
      return;
    }

    await onSaveAnswers(pageId, pageAnswersToSave);
  }, [onSaveAnswers, isOnline, queueSave]);

  // Autosave hook
  const { status: autosaveStatus, saveNow, cancel: cancelAutosave } = useAutosave({
    data: { pageId: currentPage.id, answers: pageAnswers },
    onSave: handleAutosave,
    debounceMs: autosaveDelay,
    enabled: autosaveEnabled && !!onSaveAnswers,
    onStatusChange: (status) => {
      setSaveStatus(status);
      if (status === "saved") {
        setLastSaved(new Date());
        setSaveError(null);
      }
    },
  });

  // Update pending refs when answers change
  useEffect(() => {
    pendingPageRef.current = currentPage.id;
    pendingAnswersRef.current = pageAnswers;
  }, [currentPage.id, pageAnswers]);

  // Sync pending saves when coming back online
  useEffect(() => {
    if (!isOnline || !onSaveAnswers) return;

    const syncPendingSaves = async () => {
      const pending = getPendingSaves();
      if (pending.length === 0) return;

      for (const { pageId, answers: pageAnswers } of pending) {
        try {
          await onSaveAnswers(pageId, pageAnswers);
        } catch {
          // If sync fails, leave in queue
          return;
        }
      }

      clearPendingSaves();
    };

    syncPendingSaves();
  }, [isOnline, onSaveAnswers, getPendingSaves, clearPendingSaves]);

  // Validate current page
  const validatePage = useCallback(
    (page: FormPage, pageAnswers: PageAnswers): Record<string, string> => {
      const validationErrors: Record<string, string> = {};

      for (const block of page.blocks) {
        if (!isInputBlock(block)) continue;

        const value = pageAnswers[block.name];

        // Required validation
        if (block.required) {
          const isEmpty =
            value === undefined ||
            value === null ||
            value === "" ||
            (Array.isArray(value) && value.length === 0);

          if (isEmpty) {
            validationErrors[block.name] =
              `${block.label || block.name} is required`;
          }
        }

        // Min/max length validation for text fields
        if (
          "minLength" in block &&
          block.minLength &&
          typeof value === "string"
        ) {
          if (value.length < block.minLength) {
            validationErrors[block.name] =
              `Minimum ${block.minLength} characters required`;
          }
        }

        if (
          "maxLength" in block &&
          block.maxLength &&
          typeof value === "string"
        ) {
          if (value.length > block.maxLength) {
            validationErrors[block.name] =
              `Maximum ${block.maxLength} characters allowed`;
          }
        }
      }

      return validationErrors;
    },
    []
  );

  // Handle field change
  const handleFieldChange = useCallback(
    (fieldName: string, value: FieldValue) => {
      setFieldValue(currentPage.id, fieldName, value);

      // Clear error for this field
      setErrors((prev) => {
        const { [fieldName]: _, ...rest } = prev;
        return rest;
      });
    },
    [currentPage.id, setFieldValue]
  );

  // Handle previous page
  const handlePrevious = useCallback(async () => {
    if (isFirstPage) return;

    // Save current page before navigating
    if (onSaveAnswers && Object.keys(pageAnswers).length > 0) {
      cancelAutosave();
      try {
        await onSaveAnswers(currentPage.id, pageAnswers);
      } catch {
        // Non-blocking, continue with navigation
      }
    }

    const newIndex = currentPageIndex - 1;
    setCurrentPageIndex(newIndex);
    setErrors({});

    onPageChange?.(
      newIndex,
      form.pages[newIndex].id,
      answers[form.pages[newIndex].id] || {}
    );
  }, [
    currentPageIndex,
    isFirstPage,
    form.pages,
    answers,
    pageAnswers,
    currentPage.id,
    onPageChange,
    onSaveAnswers,
    cancelAutosave,
  ]);

  // Handle next page
  const handleNext = useCallback(async () => {
    // Validate current page
    const validationErrors = validatePage(currentPage, pageAnswers);

    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    // Save current page before navigating
    if (onSaveAnswers && Object.keys(pageAnswers).length > 0) {
      cancelAutosave();
      try {
        await onSaveAnswers(currentPage.id, pageAnswers);
      } catch {
        // Non-blocking, continue with navigation
      }
    }

    onPageChange?.(currentPageIndex, currentPage.id, pageAnswers);

    if (isLastPage) {
      // Complete the form
      onComplete?.(answers);
    } else {
      // Move to next page
      const newIndex = currentPageIndex + 1;
      setCurrentPageIndex(newIndex);
      setErrors({});

      onPageChange?.(
        newIndex,
        form.pages[newIndex].id,
        answers[form.pages[newIndex].id] || {}
      );
    }
  }, [
    currentPageIndex,
    currentPage,
    pageAnswers,
    isLastPage,
    answers,
    form.pages,
    validatePage,
    onPageChange,
    onComplete,
    onSaveAnswers,
    cancelAutosave,
  ]);

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h1 className="text-2xl font-bold text-zinc-100">{form.title}</h1>
          <SaveIndicator
            status={saveStatus}
            lastSaved={lastSaved}
            isOnline={isOnline}
            error={saveError}
          />
        </div>
        <ProgressBar
          currentPage={currentPageIndex}
          totalPages={form.pages.length}
          pageTitle={currentPage.title}
        />
      </div>

      <div className="bg-zinc-900/50 rounded-lg p-6 border border-zinc-800">
        <PageRenderer
          page={currentPage}
          values={pageAnswers}
          errors={errors}
          onChange={handleFieldChange}
        />

        <div className="flex justify-between mt-8 pt-4 border-t border-zinc-800">
          <button
            type="button"
            onClick={handlePrevious}
            disabled={isFirstPage}
            className="px-4 py-2 rounded-lg text-sm font-medium text-zinc-300 bg-zinc-800 hover:bg-zinc-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>

          <button
            type="button"
            onClick={handleNext}
            className="px-6 py-2 rounded-lg text-sm font-medium text-white bg-blue-600 hover:bg-blue-500 transition-colors"
          >
            {isLastPage ? "Complete" : "Next"}
          </button>
        </div>
      </div>
    </div>
  );
}
