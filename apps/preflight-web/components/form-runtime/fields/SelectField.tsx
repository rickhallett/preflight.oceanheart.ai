"use client";

import { Label } from "@/components/ui/label";
import type { FieldValue, SelectBlock } from "@/lib/types/form-dsl";

interface SelectFieldProps {
  block: SelectBlock;
  value: string | number;
  onChange: (value: FieldValue) => void;
  error?: string;
}

export function SelectField({
  block,
  value,
  onChange,
  error,
}: SelectFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={block.name} className="mb-2 block">
        {block.label}
        {block.required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <select
        id={block.name}
        name={block.name}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        required={block.required}
        aria-invalid={!!error}
        aria-describedby={error ? `${block.name}-error` : undefined}
        className="w-full rounded-lg border-none bg-zinc-800 px-3 py-2 text-sm text-white shadow-[0px_0px_1px_1px_#404040] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 transition duration-300 appearance-none cursor-pointer"
      >
        <option value="">{block.placeholder || "Select an option..."}</option>
        {block.options.map((option) => (
          <option key={String(option)} value={String(option)}>
            {String(option)}
          </option>
        ))}
      </select>
      {error && (
        <p id={`${block.name}-error`} className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
