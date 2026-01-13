"use client";

import type { ReactNode } from "react";
import type { MarkdownBlock } from "@/lib/types/form-dsl";

interface MarkdownFieldProps {
  block: MarkdownBlock;
}

export function MarkdownField({ block }: MarkdownFieldProps) {
  // Simple markdown rendering - supports headers, bold, italic, lists
  const renderMarkdown = (content: string): ReactNode[] => {
    const lines = content.split("\n");

    return lines.map((line, index) => {
      // Headers
      if (line.startsWith("### ")) {
        return (
          <h3
            key={index}
            className="text-lg font-semibold text-zinc-100 mt-4 mb-2"
          >
            {line.slice(4)}
          </h3>
        );
      }
      if (line.startsWith("## ")) {
        return (
          <h2
            key={index}
            className="text-xl font-semibold text-zinc-100 mt-4 mb-2"
          >
            {line.slice(3)}
          </h2>
        );
      }
      if (line.startsWith("# ")) {
        return (
          <h1
            key={index}
            className="text-2xl font-bold text-zinc-100 mt-4 mb-3"
          >
            {line.slice(2)}
          </h1>
        );
      }

      // List items
      if (line.startsWith("- ") || line.startsWith("* ")) {
        return (
          <li key={index} className="text-zinc-300 ml-4 list-disc">
            {formatInlineMarkdown(line.slice(2))}
          </li>
        );
      }

      // Empty lines
      if (line.trim() === "") {
        return <br key={index} />;
      }

      // Regular paragraphs
      return (
        <p key={index} className="text-zinc-300 mb-2">
          {formatInlineMarkdown(line)}
        </p>
      );
    });
  };

  // Handle inline markdown (bold, italic)
  const formatInlineMarkdown = (text: string): ReactNode => {
    // This is a simplified version - a full implementation would use a proper markdown parser
    const parts: ReactNode[] = [];
    let remaining = text;
    let keyCounter = 0;

    // Match **bold** and *italic*
    const boldRegex = /\*\*(.+?)\*\*/g;
    const italicRegex = /\*(.+?)\*/g;

    // Replace bold
    remaining = remaining.replace(
      boldRegex,
      (_, content) => `<b>${content}</b>`,
    );

    // Replace italic (but not already bolded)
    remaining = remaining.replace(italicRegex, (_, content) => {
      if (content.startsWith("<b>") || content.endsWith("</b>")) {
        return `*${content}*`;
      }
      return `<i>${content}</i>`;
    });

    // Parse the HTML-like tags into React elements
    const tagRegex = /<(b|i)>(.+?)<\/\1>/g;
    let lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = tagRegex.exec(remaining)) !== null) {
      // Add text before the match
      if (match.index > lastIndex) {
        parts.push(remaining.slice(lastIndex, match.index));
      }

      // Add the formatted element
      const [, tag, content] = match;
      if (tag === "b") {
        parts.push(
          <strong
            key={`bold-${keyCounter++}`}
            className="font-semibold text-zinc-100"
          >
            {content}
          </strong>,
        );
      } else {
        parts.push(
          <em key={`italic-${keyCounter++}`} className="italic">
            {content}
          </em>,
        );
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < remaining.length) {
      parts.push(remaining.slice(lastIndex));
    }

    return parts.length > 0 ? parts : text;
  };

  return <div className="mb-4">{renderMarkdown(block.content)}</div>;
}
