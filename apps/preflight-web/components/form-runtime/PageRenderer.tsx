"use client";

import type {
  FieldValue,
  FormBlock,
  FormPage,
  PageAnswers,
} from "@/lib/types/form-dsl";
import {
  isCheckboxBlock,
  isMarkdownBlock,
  isRadioBlock,
  isSelectBlock,
  isTextareaBlock,
  isTextBlock,
} from "@/lib/types/form-dsl";
import {
  CheckboxField,
  MarkdownField,
  RadioField,
  SelectField,
  TextareaField,
  TextField,
} from "./fields";

interface PageRendererProps {
  page: FormPage;
  values: PageAnswers;
  errors: Record<string, string>;
  onChange: (fieldName: string, value: FieldValue) => void;
}

export function PageRenderer({
  page,
  values,
  errors,
  onChange,
}: PageRendererProps) {
  const renderBlock = (block: FormBlock, index: number) => {
    if (isMarkdownBlock(block)) {
      return <MarkdownField key={`markdown-${index}`} block={block} />;
    }

    if (isTextBlock(block)) {
      return (
        <TextField
          key={block.name}
          block={block}
          value={(values[block.name] as string) || ""}
          onChange={(value) => onChange(block.name, value)}
          error={errors[block.name]}
        />
      );
    }

    if (isTextareaBlock(block)) {
      return (
        <TextareaField
          key={block.name}
          block={block}
          value={(values[block.name] as string) || ""}
          onChange={(value) => onChange(block.name, value)}
          error={errors[block.name]}
        />
      );
    }

    if (isSelectBlock(block)) {
      return (
        <SelectField
          key={block.name}
          block={block}
          value={(values[block.name] as string | number) || ""}
          onChange={(value) => onChange(block.name, value)}
          error={errors[block.name]}
        />
      );
    }

    if (isRadioBlock(block)) {
      return (
        <RadioField
          key={block.name}
          block={block}
          value={(values[block.name] as string | number) || ""}
          onChange={(value) => onChange(block.name, value)}
          error={errors[block.name]}
        />
      );
    }

    if (isCheckboxBlock(block)) {
      const currentValue = values[block.name];
      const checkboxValue = block.options
        ? Array.isArray(currentValue)
          ? currentValue
          : []
        : Boolean(currentValue);

      return (
        <CheckboxField
          key={block.name}
          block={block}
          value={checkboxValue}
          onChange={(value) => onChange(block.name, value)}
          error={errors[block.name]}
        />
      );
    }

    // Unknown block type
    return (
      <div key={`unknown-${index}`} className="text-red-400 text-sm">
        Unknown block type: {(block as FormBlock).type}
      </div>
    );
  };

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-semibold text-zinc-100 mb-4">{page.title}</h2>
      {page.blocks.map((block, index) => renderBlock(block, index))}
    </div>
  );
}
