"use client";

import type { SaveStatus } from "@/hooks/useAutosave";

interface SaveIndicatorProps {
  status: SaveStatus;
  lastSaved?: Date | null;
  isOnline?: boolean;
  error?: Error | null;
}

export function SaveIndicator({
  status,
  lastSaved,
  isOnline = true,
  error,
}: SaveIndicatorProps) {
  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  // Offline indicator
  if (!isOnline) {
    return (
      <div className="flex items-center gap-2 text-sm text-amber-400">
        <svg
          className="w-4 h-4"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m-2.829-2.829a5 5 0 000-7.07m-4.243 4.243a1 1 0 01-1.414 0m7.072-7.072a9 9 0 00-12.728 0m2.829 2.829a5 5 0 017.07 0"
          />
        </svg>
        <span>Offline - changes saved locally</span>
      </div>
    );
  }

  switch (status) {
    case "pending":
      return (
        <div className="flex items-center gap-2 text-sm text-zinc-500">
          <div className="w-2 h-2 rounded-full bg-zinc-500" />
          <span>Unsaved changes</span>
        </div>
      );

    case "saving":
      return (
        <div className="flex items-center gap-2 text-sm text-blue-400">
          <svg
            className="w-4 h-4 animate-spin"
            fill="none"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          <span>Saving...</span>
        </div>
      );

    case "saved":
      return (
        <div className="flex items-center gap-2 text-sm text-green-400">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
          <span>
            Saved{lastSaved ? ` at ${formatTime(lastSaved)}` : ""}
          </span>
        </div>
      );

    case "error":
      return (
        <div className="flex items-center gap-2 text-sm text-red-400">
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <span>{error?.message || "Failed to save"}</span>
        </div>
      );

    case "idle":
    default:
      if (lastSaved) {
        return (
          <div className="flex items-center gap-2 text-sm text-zinc-500">
            <svg
              className="w-4 h-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              aria-hidden="true"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
              />
            </svg>
            <span>Last saved {formatTime(lastSaved)}</span>
          </div>
        );
      }
      return null;
  }
}
