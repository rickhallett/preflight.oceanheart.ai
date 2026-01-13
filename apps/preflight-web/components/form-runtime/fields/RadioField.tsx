"use client";

import { Label } from "@/components/ui/label";
import type { FieldValue, RadioBlock } from "@/lib/types/form-dsl";

interface RadioFieldProps {
  block: RadioBlock;
  value: string | number;
  onChange: (value: FieldValue) => void;
  error?: string;
}

export function RadioField({ block, value, onChange, error }: RadioFieldProps) {
  return (
    <div className="mb-4">
      <Label className="mb-2 block">
        {block.label}
        {block.required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <div
        role="radiogroup"
        aria-labelledby={`${block.name}-label`}
        aria-invalid={!!error}
        aria-describedby={error ? `${block.name}-error` : undefined}
        className="space-y-2"
      >
        {block.options.map((option) => {
          const optionValue = String(option);
          const optionId = `${block.name}-${optionValue}`;
          const isSelected = String(value) === optionValue;

          return (
            <div key={optionValue} className="flex items-center">
              <input
                type="radio"
                id={optionId}
                name={block.name}
                value={optionValue}
                checked={isSelected}
                onChange={() => onChange(option)}
                required={block.required}
                className="h-4 w-4 border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-neutral-600 focus:ring-offset-0 cursor-pointer"
              />
              <label
                htmlFor={optionId}
                className="ml-2 text-sm text-zinc-300 cursor-pointer"
              >
                {optionValue}
              </label>
            </div>
          );
        })}
      </div>
      {error && (
        <p id={`${block.name}-error`} className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
