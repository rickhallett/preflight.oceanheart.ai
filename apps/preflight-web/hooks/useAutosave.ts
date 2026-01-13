"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export type SaveStatus = "idle" | "pending" | "saving" | "saved" | "error";

interface UseAutosaveOptions<T> {
  /** Data to save */
  data: T;
  /** Save function - should return a promise */
  onSave: (data: T) => Promise<void>;
  /** Debounce delay in milliseconds (default: 30000ms = 30s) */
  debounceMs?: number;
  /** Whether autosave is enabled (default: true) */
  enabled?: boolean;
  /** Callback when save status changes */
  onStatusChange?: (status: SaveStatus) => void;
}

interface UseAutosaveReturn {
  /** Current save status */
  status: SaveStatus;
  /** Trigger an immediate save */
  saveNow: () => Promise<void>;
  /** Cancel any pending save */
  cancel: () => void;
  /** Last saved timestamp */
  lastSaved: Date | null;
  /** Last error if any */
  error: Error | null;
}

/**
 * Hook for debounced autosave functionality
 * Automatically saves data after a debounce period, with support for
 * immediate saves, cancellation, and status tracking.
 */
export function useAutosave<T>({
  data,
  onSave,
  debounceMs = 30000,
  enabled = true,
  onStatusChange,
}: UseAutosaveOptions<T>): UseAutosaveReturn {
  const [status, setStatus] = useState<SaveStatus>("idle");
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);
  const dataRef = useRef<T>(data);
  const isMountedRef = useRef(true);

  // Keep data ref updated
  useEffect(() => {
    dataRef.current = data;
  }, [data]);

  // Track mounted state
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Update status and notify
  const updateStatus = useCallback(
    (newStatus: SaveStatus) => {
      if (isMountedRef.current) {
        setStatus(newStatus);
        onStatusChange?.(newStatus);
      }
    },
    [onStatusChange]
  );

  // Cancel pending saves
  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
    if (status === "pending") {
      updateStatus("idle");
    }
  }, [status, updateStatus]);

  // Perform the actual save
  const performSave = useCallback(async () => {
    if (!isMountedRef.current) return;

    // Cancel any existing save
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    updateStatus("saving");
    setError(null);

    try {
      await onSave(dataRef.current);

      if (isMountedRef.current) {
        setLastSaved(new Date());
        updateStatus("saved");

        // Reset to idle after showing "saved" briefly
        setTimeout(() => {
          if (isMountedRef.current && status !== "pending") {
            updateStatus("idle");
          }
        }, 2000);
      }
    } catch (err) {
      if (isMountedRef.current) {
        const error = err instanceof Error ? err : new Error(String(err));
        // Don't report abort errors
        if (error.name !== "AbortError") {
          setError(error);
          updateStatus("error");
        }
      }
    }
  }, [onSave, updateStatus, status]);

  // Immediate save
  const saveNow = useCallback(async () => {
    cancel();
    await performSave();
  }, [cancel, performSave]);

  // Schedule debounced save when data changes
  useEffect(() => {
    if (!enabled) return;

    // Mark as pending
    updateStatus("pending");

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Schedule new save
    timeoutRef.current = setTimeout(() => {
      performSave();
    }, debounceMs);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [data, debounceMs, enabled, performSave, updateStatus]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cancel();
    };
  }, [cancel]);

  return {
    status,
    saveNow,
    cancel,
    lastSaved,
    error,
  };
}
