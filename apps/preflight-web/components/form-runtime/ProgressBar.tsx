"use client";

interface ProgressBarProps {
  currentPage: number;
  totalPages: number;
  pageTitle?: string;
}

export function ProgressBar({
  currentPage,
  totalPages,
  pageTitle,
}: ProgressBarProps) {
  const progress = ((currentPage + 1) / totalPages) * 100;

  return (
    <div className="w-full mb-6">
      <div className="flex justify-between items-center mb-2">
        <span className="text-sm text-zinc-400">
          Page {currentPage + 1} of {totalPages}
        </span>
        {pageTitle && (
          <span className="text-sm font-medium text-zinc-200">{pageTitle}</span>
        )}
      </div>
      <div className="w-full h-2 bg-zinc-800 rounded-full overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all duration-300 ease-out rounded-full"
          style={{ width: `${progress}%` }}
          role="progressbar"
          aria-valuenow={currentPage + 1}
          aria-valuemin={1}
          aria-valuemax={totalPages}
          aria-label={`Progress: page ${currentPage + 1} of ${totalPages}`}
        />
      </div>
    </div>
  );
}
