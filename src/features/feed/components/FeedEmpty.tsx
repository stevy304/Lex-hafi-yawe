import React from 'react';
import { Sparkles, Users, Filter, MessageSquare } from 'lucide-react';

interface FeedEmptyProps {
  tab: string;
  hasFilters: boolean;
  onAction: () => void;
  labels?: {
    forYouTitle?: string;
    forYouDesc?: string;
    forYouAction?: string;
    followingTitle?: string;
    followingDesc?: string;
    followingAction?: string;
    filterTitle?: string;
    filterDesc?: string;
    filterAction?: string;
    communityTitle?: string;
    communityDesc?: string;
    communityAction?: string;
  };
}

export const FeedEmpty: React.FC<FeedEmptyProps> = ({
  tab,
  hasFilters,
  onAction,
  labels = {},
}) => {
  let icon = <Sparkles className="w-6 h-6 text-[var(--accent)]" />;
  let title = 'Your feed is quiet';
  let description = 'Follow verified advocates and official bodies to see their legal updates.';
  let actionLabel = 'Follow advocates';

  if (hasFilters) {
    icon = <Filter className="w-6 h-6 text-[var(--muted)]" />;
    title = labels.filterTitle || 'No posts match these filters';
    description = labels.filterDesc || 'Try selecting a different topic or clearing your active filters.';
    actionLabel = labels.filterAction || 'Clear filters';
  } else if (tab === 'following') {
    icon = <Users className="w-6 h-6 text-[var(--accent)]" />;
    title = labels.followingTitle || "You're not following anyone yet";
    description = labels.followingDesc || 'Follow verified advocates and statutory institutions to populate your timeline.';
    actionLabel = labels.followingAction || 'Find advocates';
  } else if (tab === 'communities') {
    icon = <MessageSquare className="w-6 h-6 text-[var(--accent)]" />;
    title = labels.communityTitle || 'Join a community to see its posts';
    description = labels.communityDesc || 'Connect with specialized legal groups in labor, property, and dispute resolution.';
    actionLabel = labels.communityAction || 'Browse communities';
  } else {
    title = labels.forYouTitle || 'Your feed is quiet';
    description = labels.forYouDesc || 'Follow verified legal practitioners and stay informed on court precedents.';
    actionLabel = labels.forYouAction || 'Follow advocates';
  }

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center max-w-[420px] mx-auto my-12">
      <div className="w-12 h-12 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center mb-3">
        {icon}
      </div>
      <h3 className="text-[16px] font-medium text-[var(--text)] mb-1">{title}</h3>
      <p className="text-[13px] text-[var(--muted)] mb-4 leading-normal">{description}</p>
      <button
        type="button"
        onClick={onAction}
        className="px-5 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white font-medium text-[13px] transition-colors cursor-pointer"
      >
        {actionLabel}
      </button>
    </div>
  );
};
