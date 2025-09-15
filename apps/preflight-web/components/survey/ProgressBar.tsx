"use client";

import React from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";

export function ProgressBar() {
  const { currentStep, totalSteps, getProgress } = useSurveyStore();
  const progress = getProgress();

  return (
    <div className="w-full bg-gray-800 rounded-full h-3 mb-6">
      <div 
        className="bg-gradient-to-r from-indigo-500 to-purple-600 h-3 rounded-full transition-all duration-300 ease-out"
        style={{ width: `${progress}%` }}
      />
      <div className="flex justify-between items-center mt-2 text-sm text-gray-400">
        <span>Step {currentStep + 1} of {totalSteps}</span>
        <span>{progress}% Complete</span>
      </div>
    </div>
  );
}