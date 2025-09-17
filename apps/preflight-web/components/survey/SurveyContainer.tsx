"use client";

import React from "react";
import { useSurveyStore } from "@/lib/stores/survey-store";
import { ProgressBar } from "./ProgressBar";
import { PersonalInfoForm } from "./forms/PersonalInfoForm";
import { PreferencesForm } from "./forms/PreferencesForm";
import { TechnicalForm } from "./forms/TechnicalForm";
import { FeedbackForm } from "./forms/FeedbackForm";
import { FinalForm } from "./forms/FinalForm";
import { ChevronLeft, ChevronRight, Send, X } from "lucide-react";

export function SurveyContainer() {
  const { 
    currentStep, 
    nextStep, 
    prevStep, 
    endSurvey, 
    isStepComplete,
    isAllComplete,
    totalSteps 
  } = useSurveyStore();

  const forms = [
    { 
      id: "personal-info", 
      component: PersonalInfoForm, 
      title: "Personal Information",
      requiredFields: ["firstName", "lastName", "email"]
    },
    { 
      id: "preferences", 
      component: PreferencesForm, 
      title: "Preferences & Background",
      requiredFields: ["role", "experience"]
    },
    { 
      id: "technical", 
      component: TechnicalForm, 
      title: "Technical Skills",
      requiredFields: ["languages", "frameworks"]
    },
    { 
      id: "feedback", 
      component: FeedbackForm, 
      title: "Feedback & Experience",
      requiredFields: ["rating", "improvement"]
    },
    { 
      id: "final", 
      component: FinalForm, 
      title: "Final Details",
      requiredFields: ["newsletter"]
    }
  ];

  const currentForm = forms[currentStep];
  const CurrentFormComponent = currentForm.component;
  const isLastStep = currentStep === totalSteps - 1;
  const isFirstStep = currentStep === 0;

  const canProceed = isStepComplete(currentForm.id, currentForm.requiredFields);
  const canSubmit = isAllComplete();

  const handleNext = () => {
    if (canProceed) {
      nextStep();
    }
  };

  const handleSubmit = () => {
    if (canSubmit) {
      // Here you would typically send the data to your API
      console.log("Survey submitted!", useSurveyStore.getState().formData);
      
      // Show success message and return to dashboard
      alert("Survey submitted successfully! Thank you for your feedback.");
      endSurvey();
    } else {
      alert("Please complete all required fields before submitting.");
    }
  };

  const handleClose = () => {
    if (confirm("Are you sure you want to close the survey? Your progress will be lost.")) {
      endSurvey();
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100 mb-1">Survey</h1>
          <p className="text-sm text-zinc-400">{currentForm.title}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-zinc-400 hover:text-zinc-100 transition-colors p-1.5"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Bar */}
      <ProgressBar />

      {/* Form Content */}
      <div className="bg-zinc-900/50 backdrop-blur-sm rounded-md border border-zinc-800 p-6 mb-6">
        <CurrentFormComponent />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={isFirstStep}
          className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-150 text-sm ${
            isFirstStep
              ? "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
              : "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
          }`}
        >
          <ChevronLeft className="w-4 h-4" />
          <span>Previous</span>
        </button>

        <div className="flex items-center space-x-3">
          {/* Step indicators */}
          <div className="flex space-x-2">
            {forms.map((_, index) => (
              <div
                key={index}
                className={`w-2.5 h-2.5 rounded-full transition-colors duration-200 ${
                  index < currentStep
                    ? "bg-zinc-500"
                    : index === currentStep
                    ? "bg-zinc-300"
                    : "bg-zinc-700"
                }`}
              />
            ))}
          </div>
        </div>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md font-medium transition-all duration-150 text-sm ${
              canSubmit
                ? "bg-zinc-600 text-zinc-100 hover:bg-zinc-500"
                : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Submit Survey</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center space-x-2 px-4 py-2 rounded-md transition-all duration-150 text-sm ${
              canProceed
                ? "bg-zinc-700 text-zinc-100 hover:bg-zinc-600"
                : "bg-zinc-800/50 text-zinc-600 cursor-not-allowed"
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Validation message */}
      {!canProceed && (
        <div className="mt-3 p-2.5 bg-zinc-800/30 border border-zinc-700 rounded-md">
          <p className="text-zinc-400 text-xs">
            Please fill in all required fields marked with <span className="text-red-400">*</span> before proceeding.
          </p>
        </div>
      )}
    </div>
  );
}