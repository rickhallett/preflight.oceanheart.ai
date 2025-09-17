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
        <span className="text-green-600 dark:text-green-400">"{data}"</span>
      );
    }
    if (typeof data === "number") {
      return <span className="text-blue-600 dark:text-blue-400">{data}</span>;
    }
    if (typeof data === "boolean") {
      return (
        <span className="text-purple-600 dark:text-purple-400">
          {String(data)}
        </span>
      );
    }
    if (data === null) {
      return <span className="text-gray-500">null</span>;
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
        className={`flex items-center hover:bg-gray-100 dark:hover:bg-gray-800 rounded px-1 ${hasChildren ? "cursor-pointer" : ""}`}
        style={{ paddingLeft: `${depth * 16}px` }}
        {...interactiveProps}
      >
        {hasChildren && (
          <span className="mr-1 text-gray-500 text-xs">
            {isExpanded ? "▼" : "▶"}
          </span>
        )}
        <span className="text-gray-700 dark:text-gray-300 font-mono text-sm">
          {label}
          {hasChildren && !isExpanded && (
            <span className="text-gray-500 ml-1">
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
    <div className="w-full h-full p-6 overflow-auto">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        JSON Configuration
      </h3>
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
        <TreeNode
          label="surveyConfig"
          data={config}
          depth={0}
          defaultExpanded={true}
        />
      </div>
      <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
        <p className="text-sm text-blue-700 dark:text-blue-300">
          Current Step: {currentStep + 1} / {config.steps.length}
        </p>
      </div>
    </div>
  );
};
