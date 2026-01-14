"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, RefreshCw, ArrowLeft } from "lucide-react";

export default function SurveyError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    console.error("Survey error:", error);
  }, [error]);

  // Check if it's a "not found" type error
  const isNotFound = error.message?.toLowerCase().includes("not found");

  return (
    <div className="max-w-md mx-auto py-16 px-4 text-center">
      <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-amber-500/10 mb-6">
        <AlertTriangle className="w-8 h-8 text-amber-500" />
      </div>

      <h2 className="text-xl font-semibold text-zinc-100 mb-2">
        {isNotFound ? "Survey Not Found" : "Unable to Load Survey"}
      </h2>

      <p className="text-sm text-zinc-400 mb-6">
        {isNotFound
          ? "The survey you're looking for doesn't exist or may have been removed."
          : "We couldn't load the survey. Please try again or return to the dashboard."}
      </p>

      <div className="flex items-center justify-center space-x-3">
        <button
          onClick={() => router.push("/app")}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-zinc-900 border border-zinc-800 text-zinc-300 text-sm font-medium rounded-md hover:bg-zinc-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Dashboard</span>
        </button>

        {!isNotFound && (
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
