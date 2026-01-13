"use client";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";

interface SkeletonProps {
  className?: string;
  variant?: "default" | "shimmer" | "pulse";
}

export function Skeleton({ className, variant = "shimmer" }: SkeletonProps) {
  if (variant === "shimmer") {
    return (
      <div
        className={cn(
          "relative overflow-hidden rounded-md bg-zinc-800/50",
          className
        )}
      >
        <motion.div
          className="absolute inset-0 -translate-x-full bg-gradient-to-r from-transparent via-zinc-700/30 to-transparent"
          animate={{
            translateX: ["100%", "-100%"],
          }}
          transition={{
            duration: 1.5,
            repeat: Number.POSITIVE_INFINITY,
            ease: "linear",
          }}
        />
      </div>
    );
  }

  if (variant === "pulse") {
    return (
      <motion.div
        className={cn("rounded-md bg-zinc-800/50", className)}
        animate={{
          opacity: [0.5, 1, 0.5],
        }}
        transition={{
          duration: 1.5,
          repeat: Number.POSITIVE_INFINITY,
          ease: "easeInOut",
        }}
      />
    );
  }

  return (
    <div className={cn("rounded-md bg-zinc-800/50 animate-pulse", className)} />
  );
}

export function SkeletonCard() {
  return (
    <div className="rounded-lg border border-zinc-800 bg-zinc-900/50 p-5">
      <div className="flex items-start justify-between mb-3">
        <Skeleton className="h-5 w-5" />
        <Skeleton className="h-4 w-4" />
      </div>
      <Skeleton className="h-5 w-3/4 mb-2" />
      <Skeleton className="h-4 w-full mb-1" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton
          key={`skeleton-line-${i}`}
          className={cn(
            "h-4",
            i === lines - 1 ? "w-2/3" : "w-full"
          )}
        />
      ))}
    </div>
  );
}

export function SkeletonAvatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  const sizes = {
    sm: "h-8 w-8",
    md: "h-10 w-10",
    lg: "h-12 w-12",
  };

  return <Skeleton className={cn("rounded-full", sizes[size])} />;
}

export function SkeletonButton() {
  return <Skeleton className="h-10 w-24 rounded-md" />;
}

export function SkeletonInput() {
  return <Skeleton className="h-10 w-full rounded-md" />;
}

export function FormSkeleton() {
  return (
    <div className="space-y-6">
      <div>
        <Skeleton className="h-4 w-24 mb-2" />
        <SkeletonInput />
      </div>
      <div>
        <Skeleton className="h-4 w-32 mb-2" />
        <SkeletonInput />
      </div>
      <div>
        <Skeleton className="h-4 w-28 mb-2" />
        <Skeleton className="h-24 w-full rounded-md" />
      </div>
      <div className="flex justify-between pt-4">
        <SkeletonButton />
        <SkeletonButton />
      </div>
    </div>
  );
}
