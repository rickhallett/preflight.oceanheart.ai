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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Survey</h1>
          <p className="text-gray-400">{currentForm.title}</p>
        </div>
        <button
          onClick={handleClose}
          className="text-gray-400 hover:text-white transition-colors p-2"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      {/* Progress Bar */}
      <ProgressBar />

      {/* Form Content */}
      <div className="bg-gray-900/50 backdrop-blur-sm rounded-lg border border-gray-800 p-8 mb-8">
        <CurrentFormComponent />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={prevStep}
          disabled={isFirstStep}
          className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
            isFirstStep
              ? "bg-gray-800 text-gray-500 cursor-not-allowed"
              : "bg-gray-700 text-white hover:bg-gray-600"
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
                className={`w-3 h-3 rounded-full transition-colors ${
                  index < currentStep
                    ? "bg-green-500"
                    : index === currentStep
                    ? "bg-indigo-500"
                    : "bg-gray-700"
                }`}
              />
            ))}
          </div>
        </div>

        {isLastStep ? (
          <button
            onClick={handleSubmit}
            disabled={!canSubmit}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-medium transition-colors ${
              canSubmit
                ? "bg-green-600 text-white hover:bg-green-700"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            <Send className="w-4 h-4" />
            <span>Submit Survey</span>
          </button>
        ) : (
          <button
            onClick={handleNext}
            disabled={!canProceed}
            className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-colors ${
              canProceed
                ? "bg-indigo-600 text-white hover:bg-indigo-700"
                : "bg-gray-800 text-gray-500 cursor-not-allowed"
            }`}
          >
            <span>Next</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Validation message */}
      {!canProceed && (
        <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-900/50 rounded-lg">
          <p className="text-yellow-400 text-sm">
            Please fill in all required fields marked with <span className="text-red-400">*</span> before proceeding.
          </p>
        </div>
      )}
    </div>
  );
}