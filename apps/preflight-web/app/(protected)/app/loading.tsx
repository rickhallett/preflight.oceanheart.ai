"use client";

import { Skeleton, SkeletonCard } from "@/components/ui/skeleton";

export default function DashboardLoading() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div>
        <Skeleton className="h-8 w-64 mb-2" />
        <Skeleton className="h-4 w-96" />
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 auto-rows-auto">
        {/* Survey CTA - Large Card */}
        <div className="col-span-full md:col-span-2 md:row-span-2">
          <div className="h-full bg-zinc-900/50 border border-zinc-800 rounded-md p-4">
            <div className="flex flex-col h-full">
              <div className="flex items-start justify-between mb-3">
                <Skeleton className="h-5 w-5" />
                <Skeleton className="h-4 w-12" />
              </div>
              <div className="flex-1">
                <Skeleton className="h-5 w-48 mb-2" />
                <Skeleton className="h-4 w-full mb-1" />
                <Skeleton className="h-4 w-3/4 mb-4" />
              </div>
              <Skeleton className="h-10 w-full rounded-md" />
            </div>
          </div>
        </div>

        {/* Quick Stats */}
        {Array.from({ length: 4 }).map((_, i) => (
          <SkeletonCard key={`stat-${i}`} />
        ))}

        {/* Recent Activity - Wide Card */}
        <div className="col-span-full md:col-span-3">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-28" />
              <Skeleton className="h-4 w-4" />
            </div>
            <div className="space-y-3">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={`activity-${i}`} className="flex items-center justify-between py-1.5">
                  <div className="flex items-center space-x-3">
                    <Skeleton className="w-2 h-2 rounded-full" />
                    <Skeleton className="h-3 w-48" />
                  </div>
                  <Skeleton className="h-3 w-12" />
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Analytics Preview */}
        <div className="col-span-full md:col-span-1">
          <div className="bg-zinc-900/50 border border-zinc-800 rounded-md p-4">
            <div className="flex items-center justify-between mb-3">
              <Skeleton className="h-4 w-4" />
              <Skeleton className="h-3 w-16" />
            </div>
            <div className="flex items-end space-x-1 h-16">
              {[40, 65, 45, 80, 55, 70, 45].map((height, i) => (
                <div
                  key={`bar-${i}`}
                  className="flex-1 bg-zinc-800/50 rounded-t animate-pulse"
                  style={{ height: `${height}%` }}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Quick Actions Grid */}
        <div className="col-span-full">
          <Skeleton className="h-4 w-24 mb-2" />
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={`action-${i}`} className="h-16 rounded-md" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
