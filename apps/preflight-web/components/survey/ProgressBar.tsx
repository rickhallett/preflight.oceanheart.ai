"use client";

import React from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";

export function ProgressBar() {
  const { currentStep, totalSteps, getProgress } = useSurveyStore();
  const progress = getProgress();

  return (
    <div className="w-full bg-zinc-800 rounded-full h-2 mb-4">
      <div 
        className="bg-zinc-600 h-2 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="flex justify-between items-center mt-1.5 text-xs text-zinc-500">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{progress}% Complete</span>
      </div>
    </div>
  );
}