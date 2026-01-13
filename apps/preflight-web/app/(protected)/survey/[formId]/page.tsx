"use client";

import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import { FormRuntime } from "@/components/form-runtime";
import {
  ApiError,
  answersToFormAnswers,
  completeRun,
  createRun,
  getFormDefinition,
  getRun,
  saveAnswers,
} from "@/lib/api/forms";
import type {
  FormAnswers,
  FormDefinition,
  PageAnswers,
} from "@/lib/types/form-dsl";

type LoadingState = "loading" | "error" | "ready" | "completed";

export default function SurveyPage() {
  const params = useParams();
  const router = useRouter();
  const formId = params.formId as string;

  const [loadingState, setLoadingState] = useState<LoadingState>("loading");
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState<FormDefinition | null>(null);
  const [runId, setRunId] = useState<string | null>(null);
  const [initialAnswers, setInitialAnswers] = useState<FormAnswers>({});

  // Load form definition and create/resume run
  useEffect(() => {
    async function initialize() {
      try {
        setLoadingState("loading");
        setError(null);

        // Fetch form definition
        const formDef = await getFormDefinition(formId);
        setForm(formDef);

        // Check for existing run in localStorage
        const storedRunId = localStorage.getItem(`preflight-run-${formId}`);

        if (storedRunId) {
          try {
            // Try to resume existing run
            const existingRun = await getRun(storedRunId);

            if (existingRun.status === "completed") {
              // Run already completed, start fresh
              localStorage.removeItem(`preflight-run-${formId}`);
              localStorage.removeItem(`preflight-answers-${storedRunId}`);
              const newRun = await createRun(formId);
              setRunId(newRun.run_id);
              localStorage.setItem(`preflight-run-${formId}`, newRun.run_id);
            } else {
              // Resume existing run
              setRunId(storedRunId);
              const formAnswers = answersToFormAnswers(existingRun.answers);
              setInitialAnswers(formAnswers);
            }
          } catch {
            // Run not found, create new one
            localStorage.removeItem(`preflight-run-${formId}`);
            const newRun = await createRun(formId);
            setRunId(newRun.run_id);
            localStorage.setItem(`preflight-run-${formId}`, newRun.run_id);
          }
        } else {
          // Create new run
          const newRun = await createRun(formId);
          setRunId(newRun.run_id);
          localStorage.setItem(`preflight-run-${formId}`, newRun.run_id);
        }

        setLoadingState("ready");
      } catch (err) {
        console.error("Failed to initialize survey:", err);
        if (err instanceof ApiError) {
          if (err.status === 404) {
            setError(`Survey "${formId}" not found`);
          } else {
            setError(`Failed to load survey: ${err.message}`);
          }
        } else {
          setError("An unexpected error occurred");
        }
        setLoadingState("error");
      }
    }

    initialize();
  }, [formId]);

  // Handle saving answers (called by FormRuntime autosave)
  const handleSaveAnswers = useCallback(
    async (pageId: string, answers: PageAnswers) => {
      if (!runId) return;
      await saveAnswers(runId, pageId, answers);
    },
    [runId]
  );

  // Handle form completion
  const handleComplete = useCallback(
    async (answers: FormAnswers) => {
      if (!runId) return;

      try {
        // Save all remaining answers
        const pageIds = Object.keys(answers);
        for (const pageId of pageIds) {
          const pageAnswers = answers[pageId];
          if (Object.keys(pageAnswers).length > 0) {
            await saveAnswers(runId, pageId, pageAnswers);
          }
        }

        // Mark run as complete
        await completeRun(runId);

        // Clear stored run ID and local answers
        localStorage.removeItem(`preflight-run-${formId}`);
        localStorage.removeItem(`preflight-answers-${runId}`);

        setLoadingState("completed");
      } catch (err) {
        console.error("Failed to complete survey:", err);
        setError("Failed to submit survey. Please try again.");
      }
    },
    [runId, formId]
  );

  // Loading state
  if (loadingState === "loading") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4" />
          <p className="text-zinc-400">Loading survey...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (loadingState === "error" || error) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-red-400 text-6xl mb-4">!</div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            Unable to Load Survey
          </h2>
          <p className="text-zinc-400 mb-6">{error}</p>
          <button
            type="button"
            onClick={() => router.push("/app")}
            className="px-4 py-2 bg-zinc-800 text-zinc-200 rounded-lg hover:bg-zinc-700 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Completed state
  if (loadingState === "completed") {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center max-w-md">
          <div className="text-green-400 text-6xl mb-4">✓</div>
          <h2 className="text-xl font-semibold text-zinc-100 mb-2">
            Survey Complete!
          </h2>
          <p className="text-zinc-400 mb-6">
            Thank you for completing the survey. Your responses have been saved.
          </p>
          <button
            type="button"
            onClick={() => router.push("/app")}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-500 transition-colors"
          >
            Return to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Ready state - show form
  if (!form || !runId) {
    return null;
  }

  return (
    <div className="py-8 px-4">
      <FormRuntime
        form={form}
        runId={runId}
        initialAnswers={initialAnswers}
        onSaveAnswers={handleSaveAnswers}
        onComplete={handleComplete}
        autosaveDelay={30000}
        autosaveEnabled={true}
      />
    </div>
  );
}
