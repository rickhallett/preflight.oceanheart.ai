"use client";

import { Skeleton, FormSkeleton } from "@/components/ui/skeleton";

export default function SurveyLoading() {
  return (
    <div className="max-w-2xl mx-auto py-8 px-4">
      {/* Progress bar */}
      <div className="mb-8">
        <div className="flex justify-between items-center mb-2">
          <Skeleton className="h-4 w-24" />
          <Skeleton className="h-4 w-16" />
        </div>
        <Skeleton className="h-2 w-full rounded-full" />
      </div>

      {/* Form header */}
      <div className="mb-6">
        <Skeleton className="h-7 w-64 mb-2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4 mt-1" />
      </div>

      {/* Form content */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <FormSkeleton />
      </div>

      {/* Navigation */}
      <div className="flex justify-between mt-6">
        <Skeleton className="h-10 w-24 rounded-md" />
        <Skeleton className="h-10 w-24 rounded-md" />
      </div>
    </div>
  );
}
