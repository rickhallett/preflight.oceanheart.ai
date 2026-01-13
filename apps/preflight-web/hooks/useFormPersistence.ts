"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FieldValue, FormAnswers, PageAnswers } from "@/lib/types/form-dsl";

interface PendingSave {
  pageId: string;
  answers: PageAnswers;
  timestamp: number;
}

interface UseFormPersistenceOptions {
  /** Unique key for this form (e.g., formId + runId) */
  storageKey: string;
  /** Initial answers to merge with */
  initialAnswers?: FormAnswers;
  /** Whether persistence is enabled */
  enabled?: boolean;
}

interface UseFormPersistenceReturn {
  /** Current answers state */
  answers: FormAnswers;
  /** Update answers for a page */
  setPageAnswers: (pageId: string, answers: PageAnswers) => void;
  /** Update a single field */
  setFieldValue: (pageId: string, fieldName: string, value: FieldValue) => void;
  /** Get pending saves that need to be synced */
  getPendingSaves: () => PendingSave[];
  /** Clear pending saves after successful sync */
  clearPendingSaves: () => void;
  /** Add to pending saves queue */
  queueSave: (pageId: string, answers: PageAnswers) => void;
  /** Check if we're online */
  isOnline: boolean;
  /** Clear all persisted data */
  clear: () => void;
}

const PENDING_SAVES_KEY_SUFFIX = "-pending";

/**
 * Hook for persisting form answers to localStorage with offline support.
 * Maintains a queue of pending saves that can be synced when back online.
 */
export function useFormPersistence({
  storageKey,
  initialAnswers = {},
  enabled = true,
}: UseFormPersistenceOptions): UseFormPersistenceReturn {
  const [answers, setAnswers] = useState<FormAnswers>(initialAnswers);
  const [isOnline, setIsOnline] = useState(true);
  const isInitializedRef = useRef(false);

  // Initialize from localStorage on mount
  useEffect(() => {
    if (!enabled || isInitializedRef.current) return;

    try {
      const stored = localStorage.getItem(storageKey);
      if (stored) {
        const parsed = JSON.parse(stored) as FormAnswers;
        setAnswers((prev) => ({ ...prev, ...parsed }));
      }
      isInitializedRef.current = true;
    } catch {
      // localStorage not available or parse error
    }
  }, [storageKey, enabled]);

  // Persist to localStorage when answers change
  useEffect(() => {
    if (!enabled || !isInitializedRef.current) return;

    try {
      localStorage.setItem(storageKey, JSON.stringify(answers));
    } catch {
      // localStorage not available or quota exceeded
    }
  }, [answers, storageKey, enabled]);

  // Track online status
  useEffect(() => {
    if (typeof window === "undefined") return;

    setIsOnline(navigator.onLine);

    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  // Set answers for a page
  const setPageAnswers = useCallback((pageId: string, pageAnswers: PageAnswers) => {
    setAnswers((prev) => ({
      ...prev,
      [pageId]: pageAnswers,
    }));
  }, []);

  // Set a single field value
  const setFieldValue = useCallback(
    (pageId: string, fieldName: string, value: FieldValue) => {
      setAnswers((prev) => ({
        ...prev,
        [pageId]: {
          ...prev[pageId],
          [fieldName]: value,
        },
      }));
    },
    []
  );

  // Get pending saves from localStorage
  const getPendingSaves = useCallback((): PendingSave[] => {
    if (!enabled) return [];

    try {
      const stored = localStorage.getItem(storageKey + PENDING_SAVES_KEY_SUFFIX);
      if (stored) {
        return JSON.parse(stored) as PendingSave[];
      }
    } catch {
      // Ignore errors
    }
    return [];
  }, [storageKey, enabled]);

  // Clear pending saves
  const clearPendingSaves = useCallback(() => {
    if (!enabled) return;

    try {
      localStorage.removeItem(storageKey + PENDING_SAVES_KEY_SUFFIX);
    } catch {
      // Ignore errors
    }
  }, [storageKey, enabled]);

  // Queue a save for later (when offline)
  const queueSave = useCallback(
    (pageId: string, pageAnswers: PageAnswers) => {
      if (!enabled) return;

      try {
        const pending = getPendingSaves();

        // Remove existing entry for this page
        const filtered = pending.filter((p) => p.pageId !== pageId);

        // Add new entry
        filtered.push({
          pageId,
          answers: pageAnswers,
          timestamp: Date.now(),
        });

        localStorage.setItem(
          storageKey + PENDING_SAVES_KEY_SUFFIX,
          JSON.stringify(filtered)
        );
      } catch {
        // Ignore errors
      }
    },
    [storageKey, enabled, getPendingSaves]
  );

  // Clear all persisted data
  const clear = useCallback(() => {
    if (!enabled) return;

    try {
      localStorage.removeItem(storageKey);
      localStorage.removeItem(storageKey + PENDING_SAVES_KEY_SUFFIX);
    } catch {
      // Ignore errors
    }
    setAnswers({});
  }, [storageKey, enabled]);

  return {
    answers,
    setPageAnswers,
    setFieldValue,
    getPendingSaves,
    clearPendingSaves,
    queueSave,
    isOnline,
    clear,
  };
}
