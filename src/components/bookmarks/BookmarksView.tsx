import React from 'react';
import { Bookmark } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';
import { PageHeader } from '../common/PageHeader';
import { EmptyState } from '../common/EmptyState';

export const BookmarksView: React.FC = () => {
  const { posts, currentUser, openLoginModal } = useApp();

  if (!currentUser) {
    return (
      <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text flex items-center justify-center">
        <EmptyState
          icon={<Bookmark className="w-6 h-6 text-[var(--accent)]" />}
          title="Saved legal bookmarks"
          description="Sign in to access your private collection of saved legal analyses, statutory interpretations, and discussions."
          action={{
            label: 'Sign in to view bookmarks',
            onClick: openLoginModal,
          }}
        />
      </div>
    );
  }

  const bookmarkedPosts = posts.filter((p) => p.bookmarkedBy.includes(currentUser.id));

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Bookmarks"
        subtitle="Your private collection of saved legal analyses and statutory precedents"
      />

      <div className="divide-y divide-[var(--border)]">
        {bookmarkedPosts.length === 0 ? (
          <EmptyState
            icon={<Bookmark className="w-6 h-6 text-[var(--muted)]" />}
            title="No bookmarks yet"
            description="Save insightful legal posts to review later from your feed."
          />
        ) : (
          bookmarkedPosts.map((post) => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
