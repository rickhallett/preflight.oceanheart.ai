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
    <div className="w-full h-full p-4">
      <h2 className="text-xl font-bold mb-4 text-zinc-100">
        {step.title}
      </h2>

      <LayoutEngine layout={step.layout}>
        {step.containers.map((container) => (
          <LayoutEngine
            key={container.id}
            layout={container.layout}
            className="border border-zinc-800 rounded-md p-3 mb-3 bg-zinc-900/50"
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
