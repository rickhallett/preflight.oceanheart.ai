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
    <div className="w-full bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 px-6 py-3">
      <div className="flex items-center justify-between">
        <button
          type="button"
          onClick={onPrevious}
          disabled={isPreviousDisabled}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isPreviousDisabled
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          ← Previous
        </button>

        <div className="flex items-center space-x-4">
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Step {currentStep + 1} of {totalSteps}
          </span>
          {stepTitle && (
            <>
              <span className="text-gray-400 dark:text-gray-600">•</span>
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {stepTitle}
              </span>
            </>
          )}
        </div>

        <button
          type="button"
          onClick={onNext}
          disabled={isNextDisabled}
          className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${
            isNextDisabled
              ? "bg-gray-100 dark:bg-gray-700 text-gray-400 dark:text-gray-500 cursor-not-allowed"
              : "bg-blue-500 hover:bg-blue-600 text-white"
          }`}
        >
          Next →
        </button>
      </div>
    </div>
  );
};
