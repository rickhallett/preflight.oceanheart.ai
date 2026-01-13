"use client";

import type React from "react";

interface StepNavigatorProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
  stepTitle?: string;
}

export const StepNavigator: React.FC<StepNavigatorProps> = ({
  currentStep,
  totalSteps,
  onPrevious,
  onNext,
  stepTitle,
}) => {
  const isPreviousDisabled = currentStep === 0;
  const isNextDisabled = currentStep === totalSteps - 1;

  return (
    <div className="w-full bg-zinc-900/50 backdrop-blur border-b border-zinc-800 px-4 py-2">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className={`px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
            isPreviousDisabled
              ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
              : "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          }`}
        >
          ← Previous
        </button>

        <div className="flex items-center space-x-3">
          <span className="text-xs text-zinc-400">
            Step {currentStep + 1} of {totalSteps}
          </span>
          {stepTitle && (
            <>
              <span className="text-zinc-600">•</span>
              <span className="text-sm font-medium text-zinc-100">
                {stepTitle}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className={`px-3 py-1.5 rounded-md text-sm transition-all duration-150 ${
            isNextDisabled
              ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
              : "bg-zinc-700 hover:bg-zinc-600 text-zinc-100"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
