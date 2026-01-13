"use client";

import type React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { FormElement, FormValue } from "../../types";

interface ElementRegistryProps {
  element: FormElement;
  onChange?: (value: FormValue) => void;
}

const resolveDefaultValue = (
  value: FormValue | undefined,
): string | number | readonly string[] | undefined => {
  if (typeof value === "string" || typeof value === "number") {
    return value;
  }
  if (Array.isArray(value)) {
    return value.map((item) => String(item));
  }
  return undefined;
};

export const ElementRegistry: React.FC<ElementRegistryProps> = ({
  element,
  onChange,
}) => {
  const elementProps: Record<string, unknown> = element.props ?? {};

  const labelHtmlFor = (() => {
    const htmlFor = elementProps.htmlFor;
    if (typeof htmlFor === "string") {
      return htmlFor;
    }
    const legacyFor = elementProps.for;
    if (typeof legacyFor === "string") {
      return legacyFor;
    }
    return element.id;
  })();

  const buttonOnClick = (() => {
    const handler = elementProps.onClick;
    if (typeof handler === "function") {
      return handler as React.MouseEventHandler<HTMLButtonElement>;
    }
    return undefined;
  })();

  const labelContent: React.ReactNode =
    element.label ?? (elementProps.children as React.ReactNode | undefined);

  const renderElement = () => {
    switch (element.type) {
      case "input":
        return (
          <Input
            id={element.id}
            name={element.name}
            placeholder={element.placeholder}
            disabled={element.disabled}
            defaultValue={resolveDefaultValue(element.value)}
            onChange={(e) => onChange?.(e.target.value)}
            {...elementProps}
          />
        );

      case "textarea":
        return (
          <textarea
            id={element.id}
            name={element.name}
            placeholder={element.placeholder}
            disabled={element.disabled}
            defaultValue={resolveDefaultValue(element.value)}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-100 placeholder-zinc-500 focus:outline-none focus:border-zinc-600 transition-all duration-150"
            rows={4}
            {...elementProps}
          />
        );

      case "select":
        return (
          <select
            id={element.id}
            name={element.name}
            disabled={element.disabled}
            defaultValue={resolveDefaultValue(element.value)}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-2.5 py-1.5 text-sm text-zinc-100 focus:outline-none focus:border-zinc-600 transition-all duration-150"
            {...elementProps}
          >
            <option value="">Select...</option>
            {element.options?.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        );

      case "radio":
        return (
          <div className="space-y-2">
            {element.options?.map((option) => (
              <div key={option.value} className="flex items-center">
                <input
                  type="radio"
                  id={`${element.id}-${option.value}`}
                  name={element.name || element.id}
                  value={option.value}
                  disabled={element.disabled}
                  defaultChecked={element.value === option.value}
                  onChange={() => onChange?.(option.value)}
                  className="mr-2"
                  {...elementProps}
                />
                <label
                  htmlFor={`${element.id}-${option.value}`}
                  className="text-sm text-zinc-300"
                >
                  {option.label}
                </label>
              </div>
            ))}
          </div>
        );

      case "checkbox":
        return (
          <div className="flex items-center">
            <input
              type="checkbox"
              id={element.id}
              name={element.name}
              disabled={element.disabled}
              defaultChecked={Boolean(element.value)}
              onChange={(e) => onChange?.(e.target.checked)}
              className="mr-2"
              {...elementProps}
            />
            {element.label && (
              <label htmlFor={element.id} className="text-sm text-zinc-300">
                {element.label}
              </label>
            )}
          </div>
        );

      case "label":
        return (
          <Label htmlFor={labelHtmlFor} {...elementProps}>
            {labelContent}
          </Label>
        );

      case "button":
        return (
          <button
            type="button"
            id={element.id}
            disabled={element.disabled}
            onClick={buttonOnClick}
            className="px-3 py-1.5 rounded-md bg-zinc-700 text-zinc-100 hover:bg-zinc-600 disabled:opacity-50 transition-all duration-150 text-sm"
            {...elementProps}
          >
            {element.label || "Button"}
          </button>
        );

      default:
        return <div>Unknown element type: {element.type}</div>;
    }
  };

  return (
    <div className="w-full">
      {element.label &&
        element.type !== "checkbox" &&
        element.type !== "label" && (
          <Label htmlFor={element.id} className="mb-2 block">
            {element.label}
            {element.required && <span className="text-red-400 ml-1">*</span>}
          </Label>
        )}
      {renderElement()}
    </div>
  );
};
