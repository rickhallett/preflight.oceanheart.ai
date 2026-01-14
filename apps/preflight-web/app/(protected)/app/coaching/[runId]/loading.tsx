"use client";

import { Skeleton } from "@/components/ui/skeleton";

export default function CoachingLoading() {
  return (
    <div className="max-w-3xl mx-auto py-8 px-4">
      {/* Header */}
      <div className="mb-6">
        <Skeleton className="h-7 w-48 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Session info */}
      <div className="flex items-center justify-between mb-6 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <div className="flex items-center space-x-4">
          <Skeleton className="h-10 w-10 rounded-full" />
          <div>
            <Skeleton className="h-4 w-24 mb-1" />
            <Skeleton className="h-3 w-32" />
          </div>
        </div>
        <Skeleton className="h-8 w-20 rounded-md" />
      </div>

      {/* Chat messages */}
      <div className="space-y-4 mb-6 min-h-[400px]">
        {/* Assistant message */}
        <div className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 max-w-[80%]">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-3/4" />
            </div>
          </div>
        </div>

        {/* User message */}
        <div className="flex items-start space-x-3 justify-end">
          <div className="flex-1 max-w-[80%]">
            <div className="bg-zinc-700/50 rounded-lg p-4 ml-auto">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-2/3" />
            </div>
          </div>
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
        </div>

        {/* Assistant response */}
        <div className="flex items-start space-x-3">
          <Skeleton className="h-8 w-8 rounded-full flex-shrink-0" />
          <div className="flex-1 max-w-[80%]">
            <div className="bg-zinc-800/50 rounded-lg p-4">
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-full mb-2" />
              <Skeleton className="h-4 w-1/2" />
            </div>
          </div>
        </div>
      </div>

      {/* Input area */}
      <div className="flex items-center space-x-3 p-4 bg-zinc-900/50 border border-zinc-800 rounded-lg">
        <Skeleton className="h-10 flex-1 rounded-md" />
        <Skeleton className="h-10 w-10 rounded-md" />
      </div>
    </div>
  );
}
