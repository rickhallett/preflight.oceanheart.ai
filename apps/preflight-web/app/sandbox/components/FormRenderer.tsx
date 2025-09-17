"use client";

import type React from "react";
import { useState } from "react";
import type { FormDataMap, FormElement, FormStep, FormValue } from "../types";
import { ElementRegistry } from "./elements/ElementRegistry";
import { LayoutEngine } from "./elements/LayoutEngine";

interface FormRendererProps {
  step: FormStep;
  onFormDataChange?: (data: FormDataMap) => void;
}

export const FormRenderer: React.FC<FormRendererProps> = ({
  step,
  onFormDataChange,
}) => {
  const [formData, setFormData] = useState<FormDataMap>({});

  const handleElementChange = (elementId: string, value: FormValue) => {
    const updatedData: FormDataMap = { ...formData, [elementId]: value };
    setFormData(updatedData);
    onFormDataChange?.(updatedData);
  };

  return (
    <div className="w-full h-full p-6">
      <h2 className="text-2xl font-bold mb-6 text-gray-900 dark:text-white">
        {step.title}
      </h2>

      <LayoutEngine layout={step.layout}>
        {step.containers.map((container) => (
          <LayoutEngine
            key={container.id}
            layout={container.layout}
            className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 mb-4"
          >
            {container.elements.map((element: FormElement) => (
              <ElementRegistry
                key={element.id}
                element={element}
                onChange={(value) => handleElementChange(element.id, value)}
              />
            ))}
          </LayoutEngine>
        ))}
      </LayoutEngine>
    </div>
  );
};
