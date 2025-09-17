"use client";

import { useState } from "react";
import { FormRenderer } from "./components/FormRenderer";
import { JsonViewer } from "./components/JsonViewer";
import { StepNavigator } from "./components/StepNavigator";
import { sampleSurveyConfig } from "./sample-config";
import type { FormDataMap } from "./types";

type StepFormData = Record<string, FormDataMap>;

export default function SandboxPage() {
  const [currentStep, setCurrentStep] = useState(0);
  const [_formData, setFormData] = useState<StepFormData>({});

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleNext = () => {
    if (currentStep < sampleSurveyConfig.steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleFormDataChange = (data: FormDataMap) => {
    setFormData((prev) => ({
      ...prev,
      [sampleSurveyConfig.steps[currentStep].stepId]: data,
    }));
  };

  return (
    <div className="flex flex-col h-screen bg-gray-50 dark:bg-gray-900">
      <StepNavigator
        currentStep={currentStep}
        totalSteps={sampleSurveyConfig.steps.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        stepTitle={sampleSurveyConfig.steps[currentStep].title}
      />

      <div className="flex flex-1 overflow-hidden">
        <div className="w-1/2 border-r border-gray-200 dark:border-gray-700 overflow-y-auto bg-white dark:bg-gray-900">
          <JsonViewer config={sampleSurveyConfig} currentStep={currentStep} />
        </div>

        <div className="w-1/2 overflow-y-auto bg-gray-50 dark:bg-gray-800">
          <FormRenderer
            step={sampleSurveyConfig.steps[currentStep]}
            onFormDataChange={handleFormDataChange}
          />
        </div>
      </div>
    </div>
  );
}
