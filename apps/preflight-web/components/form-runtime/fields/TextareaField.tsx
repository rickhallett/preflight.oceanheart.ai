"use client";

import { Label } from "@/components/ui/label";
import type { FieldValue, TextareaBlock } from "@/lib/types/form-dsl";

interface TextareaFieldProps {
  block: TextareaBlock;
  value: string;
  onChange: (value: FieldValue) => void;
  error?: string;
}

export function TextareaField({
  block,
  value,
  onChange,
  error,
}: TextareaFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={block.name} className="mb-2 block">
        {block.label}
        {block.required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <textarea
        id={block.name}
        name={block.name}
        placeholder={block.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        rows={block.rows || 4}
        minLength={block.minLength}
        maxLength={block.maxLength}
        required={block.required}
        aria-invalid={!!error}
        aria-describedby={error ? `${block.name}-error` : undefined}
        className="w-full rounded-lg border-none bg-zinc-800 px-3 py-2 text-sm text-white shadow-[0px_0px_1px_1px_#404040] placeholder:text-neutral-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-neutral-600 disabled:cursor-not-allowed disabled:opacity-50 transition duration-300"
      />
      {error && (
        <p id={`${block.name}-error`} className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
