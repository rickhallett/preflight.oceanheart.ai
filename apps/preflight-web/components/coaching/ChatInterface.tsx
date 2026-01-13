"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChatMessage } from "./ChatMessage";
import { ChatInput } from "./ChatInput";
import { TypingIndicator } from "./TypingIndicator";
import { CoachingAPI, CoachingAPIError } from "@/lib/api/coaching";
import type { ChatMessage as ChatMessageType, CoachingSession } from "@/lib/types/coaching";
import { cn } from "@/lib/utils";

interface ChatInterfaceProps {
  runId: string;
  onComplete?: () => void;
  onError?: (error: Error) => void;
}

type ChatStatus = "idle" | "loading" | "active" | "completed" | "error";

export function ChatInterface({ runId, onComplete, onError }: ChatInterfaceProps) {
  const [messages, setMessages] = useState<ChatMessageType[]>([]);
  const [status, setStatus] = useState<ChatStatus>("idle");
  const [isTyping, setIsTyping] = useState(false);
  const [session, setSession] = useState<CoachingSession | null>(null);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  // Scroll to bottom when messages change
  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [messages, isTyping, scrollToBottom]);

  // Start coaching session on mount with proper cleanup
  useEffect(() => {
    let cancelled = false;
    abortControllerRef.current = new AbortController();

    const startSession = async () => {
      setStatus("loading");
      setError(null);

      try {
        const response = await CoachingAPI.startCoaching(runId);

        // Check if component was unmounted during async operation
        if (cancelled) return;

        setSession(response.session);

        // Add initial AI message
        const initialMessage: ChatMessageType = {
          id: response.initial_message.id,
          role: "assistant",
          content: response.initial_message.content,
          timestamp: new Date(response.initial_message.created_at),
        };
        setMessages([initialMessage]);
        setStatus("active");
      } catch (err) {
        // Don't update state if cancelled
        if (cancelled) return;

        const errorMessage = err instanceof CoachingAPIError
          ? err.message
          : "Failed to start coaching session";
        setError(errorMessage);
        setStatus("error");
        onError?.(err instanceof Error ? err : new Error(errorMessage));
      }
    };

    startSession();

    // Cleanup function to prevent state updates after unmount
    return () => {
      cancelled = true;
      abortControllerRef.current?.abort();
    };
  }, [runId, onError]);

  // Handle sending messages
  const handleSendMessage = useCallback(async (content: string) => {
    if (status !== "active" || !session) return;

    // Add user message to UI immediately (optimistic update)
    const userMessage: ChatMessageType = {
      id: `user-${Date.now()}`,
      role: "user",
      content,
      timestamp: new Date(),
    };
    setMessages((prev) => [...prev, userMessage]);
    setIsTyping(true);
    setError(null);

    try {
      const response = await CoachingAPI.sendMessage(runId, content);

      // Check if component is still mounted
      if (abortControllerRef.current?.signal.aborted) return;

      // Update user message with actual ID
      setMessages((prev) => {
        const updated = [...prev];
        const lastIndex = updated.length - 1;
        if (updated[lastIndex]?.role === "user") {
          updated[lastIndex] = {
            ...updated[lastIndex],
            id: response.user_turn.id,
          };
        }
        return updated;
      });

      // Add AI response
      const assistantMessage: ChatMessageType = {
        id: response.assistant_turn.id,
        role: "assistant",
        content: response.assistant_turn.content,
        timestamp: new Date(response.assistant_turn.created_at),
      };
      setMessages((prev) => [...prev, assistantMessage]);

      // Update session state
      if (response.session_status === "completed") {
        setStatus("completed");
        onComplete?.();
      }

      setSession((prev) =>
        prev
          ? {
              ...prev,
              current_round: response.current_round,
              status: response.session_status as CoachingSession["status"],
            }
          : null
      );
    } catch (err) {
      // Don't update state if aborted
      if (abortControllerRef.current?.signal.aborted) return;

      if (err instanceof CoachingAPIError) {
        if (err.type === "session_ended") {
          setStatus("completed");
          onComplete?.();
        } else if (err.type === "rate_limit") {
          setError(`Rate limit exceeded. Please wait ${err.retry_after || 60} seconds.`);
        } else {
          setError(err.message);
        }
      } else {
        setError("Failed to send message. Please try again.");
      }
      onError?.(err instanceof Error ? err : new Error("Unknown error"));
    } finally {
      if (!abortControllerRef.current?.signal.aborted) {
        setIsTyping(false);
      }
    }
  }, [status, session, runId, onComplete, onError]);

  // Handle ending session
  const handleEndSession = useCallback(async () => {
    if (status !== "active") return;

    try {
      await CoachingAPI.endCoaching(runId);

      if (abortControllerRef.current?.signal.aborted) return;

      setStatus("completed");
      onComplete?.();
    } catch (err) {
      if (abortControllerRef.current?.signal.aborted) return;

      setError("Failed to end session");
      onError?.(err instanceof Error ? err : new Error("Failed to end session"));
    }
  }, [status, runId, onComplete, onError]);

  // Calculate remaining rounds
  const remainingRounds = session
    ? session.max_rounds - session.current_round
    : 0;

  return (
    <div className="flex flex-col h-full max-h-[600px] bg-background rounded-xl border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b bg-muted/30">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
          <span className="text-sm font-medium">AI Coach</span>
        </div>
        {session && status === "active" && (
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground">
              {remainingRounds} {remainingRounds === 1 ? "round" : "rounds"} remaining
            </span>
            <button
              onClick={handleEndSession}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              End Session
            </button>
          </div>
        )}
        {status === "completed" && (
          <span className="text-xs text-muted-foreground">Session Complete</span>
        )}
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Loading state */}
        {status === "loading" && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Starting your coaching session...</p>
            </div>
          </div>
        )}

        {/* Error state */}
        {status === "error" && (
          <div className="flex items-center justify-center h-full">
            <div className="text-center p-6 bg-destructive/10 rounded-xl max-w-sm">
              <p className="text-sm text-destructive mb-3">{error}</p>
              <button
                onClick={() => window.location.reload()}
                className="text-sm text-primary hover:underline"
              >
                Try again
              </button>
            </div>
          </div>
        )}

        {/* Messages */}
        <AnimatePresence mode="popLayout">
          {messages.map((message) => (
            <ChatMessage key={message.id} message={message} />
          ))}
        </AnimatePresence>

        {/* Typing indicator */}
        {isTyping && <TypingIndicator />}

        {/* Scroll anchor */}
        <div ref={messagesEndRef} />
      </div>

      {/* Error banner */}
      <AnimatePresence>
        {error && status === "active" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="bg-destructive/10 px-4 py-2 text-center"
          >
            <p className="text-xs text-destructive">{error}</p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Session completed message */}
      {status === "completed" && (
        <div className="bg-muted/50 px-4 py-3 text-center border-t">
          <p className="text-sm text-muted-foreground">
            Thank you for completing this coaching session!
          </p>
        </div>
      )}

      {/* Input Area */}
      <div className="p-4 border-t">
        <ChatInput
          onSend={handleSendMessage}
          disabled={status !== "active" || isTyping}
          placeholder={
            status === "completed"
              ? "Session complete"
              : isTyping
                ? "AI is thinking..."
                : "Type your response..."
          }
        />
      </div>
    </div>
  );
}
