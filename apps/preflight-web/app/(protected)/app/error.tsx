"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { ErrorFallback } from "@/components/error/ErrorBoundary";

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const router = useRouter();

  useEffect(() => {
    // Log error to console in development
    console.error("Dashboard error:", error);
  }, [error]);

  return (
    <ErrorFallback
      error={error}
      onReset={reset}
      onGoHome={() => router.push("/")}
    />
  );
}
