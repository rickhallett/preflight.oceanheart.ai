"use client";

import type React from "react";
import { useState } from "react";
import type { SurveyConfig } from "../types";

interface JsonViewerProps {
  config: SurveyConfig;
  currentStep: number;
}

interface TreeNodeProps {
  label: string;
  data: unknown;
  depth: number;
  defaultExpanded?: boolean;
}

const TreeNode: React.FC<TreeNodeProps> = ({
  label,
  data,
  depth,
  defaultExpanded = false,
}) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded || depth === 0);

  const isObject =
    data !== null && typeof data === "object" && !Array.isArray(data);
  const isArray = Array.isArray(data);
  const hasChildren = isObject || isArray;

  const toggleExpand = () => {
    if (hasChildren) {
      setIsExpanded((prev) => !prev);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (!hasChildren) return;
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      toggleExpand();
    }
  };

  const renderValue = () => {
    if (hasChildren) {
      return null;
    }
    if (typeof data === "string") {
      return (
        <span className="text-zinc-400">"{data}"</span>
      );
    }
    if (typeof data === "number") {
      return <span className="text-zinc-300">{data}</span>;
    }
    if (typeof data === "boolean") {
      return (
        <span className="text-zinc-500">
          {String(data)}
        </span>
      );
    }
    if (data === null) {
      return <span className="text-zinc-600">null</span>;
    }
    return <span>{String(data)}</span>;
  };

  const renderChildren = () => {
    if (!isExpanded || !hasChildren) return null;

    if (isArray) {
      return (data as unknown[]).map((item, index) => {
        let key: string;
        if (item && typeof item === "object") {
          try {
            key = `${index}-${JSON.stringify(item)}`;
          } catch {
            key = `${index}-object`;
          }
        } else {
          key = `${index}-${String(item)}`;
        }

        return (
          <TreeNode
            key={key}
            label={`[${index}]`}
            data={item}
            depth={depth + 1}
            defaultExpanded={depth < 1}
          />
        );
      });
    }

    return Object.entries(data as Record<string, unknown>).map(
      ([key, value]) => (
        <TreeNode
          key={key}
          label={key}
          data={value}
          depth={depth + 1}
          defaultExpanded={depth < 1}
        />
      ),
    );
  };

  const interactiveProps = hasChildren
    ? {
        role: "button" as const,
        tabIndex: 0,
        onClick: toggleExpand,
        onKeyDown: handleKeyDown,
        "aria-expanded": isExpanded,
        "aria-label": `Toggle ${label}`,
      }
    : { tabIndex: -1 };

  return (
    <div className="select-none">
      <div
        className={`flex items-center hover:bg-zinc-800/50 rounded px-1 ${hasChildren ? "cursor-pointer" : ""}`}
        style={{ paddingLeft: `${depth * 12}px` }}
        {...interactiveProps}
      >
        {hasChildren && (
          <span className="mr-1 text-zinc-500 text-xs">
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        <span className="text-zinc-300 font-mono text-xs">
          {label}
          {hasChildren && !isExpanded && (
            <span className="text-zinc-600 ml-1">
              {isArray ? `[${(data as unknown[]).length}]` : "{...}"}
            </span>
          )}
          {!hasChildren && ": "}
        </span>
        {renderValue()}
      </div>
      {renderChildren()}
    </div>
  );
};

export const JsonViewer: React.FC<JsonViewerProps> = ({
  config,
  currentStep,
}) => {
  return (
    <div className="w-full h-full p-4 overflow-auto">
      <h3 className="text-base font-semibold mb-3 text-zinc-100">
        JSON Configuration
      </h3>
      <div className="bg-zinc-900/50 rounded-md border border-zinc-800 p-3">
        <TreeNode
          label="surveyConfig"
          data={config}
          depth={0}
          defaultExpanded={true}
        />
      </div>
      <div className="mt-3 p-2 bg-zinc-800/50 rounded-md border border-zinc-700">
        <p className="text-xs text-zinc-400">
          Current Step: {currentStep + 1} / {config.steps.length}
        </p>
      </div>
    </div>
  );
};
