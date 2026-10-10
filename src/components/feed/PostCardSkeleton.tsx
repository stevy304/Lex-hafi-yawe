import React from 'react';

export const PostCardSkeleton: React.FC = () => {
  return (
    <article className="border-b border-slate-200/90 bg-white p-3 sm:p-4 space-y-3 animate-pulse">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-slate-200 skeleton-shimmer shrink-0" />
        <div className="flex-1 space-y-1.5 min-w-0">
          <div className="h-3.5 bg-slate-200 skeleton-shimmer rounded-md w-36" />
          <div className="h-2.5 bg-slate-100 skeleton-shimmer rounded-md w-24" />
        </div>
      </div>

      {/* Reserved Media Aspect Ratio (4:5) */}
      <div className="w-full aspect-[4/5] bg-slate-100 skeleton-shimmer rounded-xl" />

      {/* Action Row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-4">
          <div className="w-6 h-6 rounded-md bg-slate-200 skeleton-shimmer" />
          <div className="w-6 h-6 rounded-md bg-slate-200 skeleton-shimmer" />
          <div className="w-6 h-6 rounded-md bg-slate-200 skeleton-shimmer" />
        </div>
        <div className="w-6 h-6 rounded-md bg-slate-200 skeleton-shimmer" />
      </div>

      {/* Caption lines */}
      <div className="space-y-1.5 pt-1">
        <div className="h-3 bg-slate-200 skeleton-shimmer rounded-md w-full" />
        <div className="h-3 bg-slate-100 skeleton-shimmer rounded-md w-4/5" />
      </div>
    </article>
  );
};
