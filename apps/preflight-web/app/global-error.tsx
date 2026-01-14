"use client";

import { useEffect } from "react";
import { AlertTriangle, RefreshCw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error("Global error:", error);
  }, [error]);

  return (
    <html>
      <body className="bg-zinc-950 text-zinc-100">
        <div className="min-h-screen flex items-center justify-center p-8">
          <div className="max-w-md w-full text-center">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-red-500/10 mb-8">
              <AlertTriangle className="w-10 h-10 text-red-500" />
            </div>

            <h1 className="text-2xl font-bold text-zinc-100 mb-3">
              Application Error
            </h1>

            <p className="text-zinc-400 mb-8">
              A critical error occurred. We apologize for the inconvenience.
              Please try reloading the page.
            </p>

            <button
              onClick={reset}
              className="inline-flex items-center space-x-2 px-6 py-3 bg-zinc-800 border border-zinc-700 text-zinc-100 font-medium rounded-lg hover:bg-zinc-700 transition-colors"
            >
              <RefreshCw className="w-5 h-5" />
              <span>Reload Application</span>
            </button>

            {error.digest && (
              <p className="mt-6 text-xs text-zinc-600">
                Error ID: {error.digest}
              </p>
            )}
          </div>
        </div>
      </body>
    </html>
  );
}
