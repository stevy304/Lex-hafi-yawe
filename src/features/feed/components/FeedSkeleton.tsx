import React from 'react';

interface FeedSkeletonProps {
  count?: number;
}

export const FeedSkeleton: React.FC<FeedSkeletonProps> = ({ count = 3 }) => {
  return (
    <div className="w-full" aria-busy="true" aria-label="Loading posts">
      {Array.from({ length: count }).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[40px_minmax(0,1fr)] gap-3 p-[14px_16px] border-b border-[var(--border)] skeleton-pulse"
        >
          {/* Avatar Skeleton */}
          <div className="w-10 h-10 rounded-full bg-[var(--skeleton)]" />

          {/* Body Content Skeleton */}
          <div className="space-y-2.5">
            {/* Header row */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-28 h-3.5 rounded-full bg-[var(--skeleton)]" />
                <div className="w-16 h-3 rounded-full bg-[var(--skeleton)]" />
              </div>
              <div className="w-14 h-4 rounded-full bg-[var(--skeleton)]" />
            </div>

            {/* Post text lines */}
            <div className="space-y-1.5 pt-1">
              <div className="w-full h-3.5 rounded-md bg-[var(--skeleton)]" />
              <div className="w-4/5 h-3.5 rounded-md bg-[var(--skeleton)]" />
              <div className="w-2/3 h-3.5 rounded-md bg-[var(--skeleton)]" />
            </div>

            {/* Actions placeholder */}
            <div className="flex items-center gap-7 pt-2">
              <div className="w-5 h-5 rounded-full bg-[var(--skeleton)]" />
              <div className="w-5 h-5 rounded-full bg-[var(--skeleton)]" />
              <div className="w-5 h-5 rounded-full bg-[var(--skeleton)]" />
              <div className="w-5 h-5 rounded-full bg-[var(--skeleton)]" />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
