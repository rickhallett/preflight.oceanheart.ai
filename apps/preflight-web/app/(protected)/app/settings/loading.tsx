"use client";

import { Skeleton, SkeletonInput } from "@/components/ui/skeleton";

export default function SettingsLoading() {
  return (
    <div className="max-w-2xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <Skeleton className="h-8 w-32 mb-2" />
        <Skeleton className="h-4 w-64" />
      </div>

      {/* Profile Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <Skeleton className="h-5 w-24 mb-4" />
        <div className="flex items-center space-x-4 mb-6">
          <Skeleton className="h-16 w-16 rounded-full" />
          <div className="flex-1">
            <Skeleton className="h-4 w-32 mb-2" />
            <Skeleton className="h-3 w-48" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <Skeleton className="h-3 w-16 mb-2" />
            <SkeletonInput />
          </div>
          <div>
            <Skeleton className="h-3 w-20 mb-2" />
            <SkeletonInput />
          </div>
        </div>
      </div>

      {/* Preferences Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <Skeleton className="h-5 w-28 mb-4" />
        <div className="space-y-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={`pref-${i}`} className="flex items-center justify-between">
              <div>
                <Skeleton className="h-4 w-32 mb-1" />
                <Skeleton className="h-3 w-48" />
              </div>
              <Skeleton className="h-6 w-11 rounded-full" />
            </div>
          ))}
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-6">
        <Skeleton className="h-5 w-20 mb-4" />
        <div className="space-y-4">
          <div>
            <Skeleton className="h-3 w-28 mb-2" />
            <SkeletonInput />
          </div>
          <div>
            <Skeleton className="h-3 w-24 mb-2" />
            <SkeletonInput />
          </div>
        </div>
        <Skeleton className="h-10 w-32 rounded-md mt-4" />
      </div>
    </div>
  );
}
