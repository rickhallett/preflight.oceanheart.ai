"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, ArrowLeft, MessageSquare } from "lucide-react";

export default function CoachingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Coaching error:", error);
  }, [error]);

  // Check error type
  const isSessionNotFound = error.message?.toLowerCase().includes("not found");
  const isRateLimited = error.message?.toLowerCase().includes("rate limit");

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-6">
        {isRateLimited ? (
          <MessageSquare className="w-8 h-8 text-amber-500" />
        ) : (
          <AlertTriangle className="w-8 h-8 text-amber-500" />
        )}
      </div>

      <h2 className="text-xl font-semibold text-zinc-100 mb-2">
        {isSessionNotFound
          ? "Session Not Found"
          : isRateLimited
          ? "Too Many Messages"
          : "Coaching Error"}
      </h2>

      <p className="text-sm text-zinc-400 mb-6">
        {isSessionNotFound
          ? "This coaching session doesn't exist or has expired."
          : isRateLimited
          ? "You've sent too many messages. Please wait a moment before trying again."
          : "We encountered an error with the coaching session. Please try again."}
      </p>

      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={() => router.push("/app")}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {!isSessionNotFound && (
          <button
            onClick={reset}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-800 border border-zinc-700 text-zinc-100 text-sm font-medium rounded-md hover:bg-zinc-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        )}
      </div>
    </div>
  );
}
