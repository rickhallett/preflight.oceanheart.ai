"use client";

import { Label } from "@/components/ui/label";
import type { CheckboxBlock, FieldValue } from "@/lib/types/form-dsl";

interface CheckboxFieldProps {
  block: CheckboxBlock;
  value: boolean | (string | number)[];
  onChange: (value: FieldValue) => void;
  error?: string;
}

export function CheckboxField({
  block,
  value,
  onChange,
  error,
}: CheckboxFieldProps) {
  // Multi-select mode (with options)
  if (block.options && block.options.length > 0) {
    const selectedValues = Array.isArray(value) ? value.map(String) : [];

    const handleOptionChange = (option: string | number, checked: boolean) => {
      const optionStr = String(option);
      if (checked) {
        onChange([...selectedValues, option]);
      } else {
        onChange(
          selectedValues
            .filter((v) => v !== optionStr)
            .map((v) => {
              // Try to preserve original type
              const original = block.options?.find((o) => String(o) === v);
              return original ?? v;
            }),
        );
      }
    };

    return (
      <div className="mb-4">
        <Label className="mb-2 block">
          {block.label}
          {block.required && <span className="text-red-400 ml-1">*</span>}
        </Label>
        <div
          role="group"
          aria-labelledby={`${block.name}-label`}
          aria-invalid={!!error}
          aria-describedby={error ? `${block.name}-error` : undefined}
          className="space-y-2"
        >
          {block.options.map((option) => {
            const optionValue = String(option);
            const optionId = `${block.name}-${optionValue}`;
            const isSelected = selectedValues.includes(optionValue);

            return (
              <div key={optionValue} className="flex items-center">
                <input
                  type="checkbox"
                  id={optionId}
                  name={block.name}
                  value={optionValue}
                  checked={isSelected}
                  onChange={(e) => handleOptionChange(option, e.target.checked)}
                  className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-neutral-600 focus:ring-offset-0 cursor-pointer"
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

  // Single boolean mode (no options)
  const isChecked = Boolean(value);

  return (
    <div className="mb-4">
      <div className="flex items-center">
        <input
          type="checkbox"
          id={block.name}
          name={block.name}
          checked={isChecked}
          onChange={(e) => onChange(e.target.checked)}
          required={block.required}
          aria-invalid={!!error}
          aria-describedby={error ? `${block.name}-error` : undefined}
          className="h-4 w-4 rounded border-zinc-600 bg-zinc-800 text-blue-500 focus:ring-2 focus:ring-neutral-600 focus:ring-offset-0 cursor-pointer"
        />
        <label
          htmlFor={block.name}
          className="ml-2 text-sm text-zinc-300 cursor-pointer"
        >
          {block.label}
          {block.required && <span className="text-red-400 ml-1">*</span>}
        </label>
      </div>
      {error && (
        <p id={`${block.name}-error`} className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
