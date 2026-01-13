"use client";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FieldValue, TextBlock } from "@/lib/types/form-dsl";

interface TextFieldProps {
  block: TextBlock;
  value: string;
  onChange: (value: FieldValue) => void;
  error?: string;
}

export function TextField({ block, value, onChange, error }: TextFieldProps) {
  return (
    <div className="mb-4">
      <Label htmlFor={block.name} className="mb-2 block">
        {block.label}
        {block.required && <span className="text-red-400 ml-1">*</span>}
      </Label>
      <Input
        id={block.name}
        name={block.name}
        type="text"
        placeholder={block.placeholder}
        value={value || ""}
        onChange={(e) => onChange(e.target.value)}
        minLength={block.minLength}
        maxLength={block.maxLength}
        required={block.required}
        aria-invalid={!!error}
        aria-describedby={error ? `${block.name}-error` : undefined}
      />
      {error && (
        <p id={`${block.name}-error`} className="mt-1 text-sm text-red-400">
          {error}
        </p>
      )}
    </div>
  );
}
