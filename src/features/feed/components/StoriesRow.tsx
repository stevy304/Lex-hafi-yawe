import React from 'react';
import { Plus } from 'lucide-react';
import { Story, User } from '../../../types';

interface StoriesRowProps {
  currentUser: User | null;
  stories: Story[];
  users: User[];
  onOpenCreateStory?: () => void;
  onOpenStory?: (story: Story) => void;
  yourStoryLabel?: string;
}

export const StoriesRow: React.FC<StoriesRowProps> = ({
  currentUser,
  stories,
  users,
  onOpenCreateStory,
  onOpenStory,
  yourStoryLabel = 'Your story',
}) => {
  const otherStories = stories.filter((s) => s.authorId !== currentUser?.id);
  const hasOthers = otherStories.length > 0;
  const height = hasOthers ? 88 : 72;

  // Group stories by author
  const storiesByAuthor: { author: User; story: Story; isSeen: boolean }[] = [];
  const seenAuthors = new Set<string>();

  for (const s of otherStories) {
    if (!seenAuthors.has(s.authorId)) {
      seenAuthors.add(s.authorId);
      const author = users.find((u) => u.id === s.authorId) || {
        id: s.authorId,
        name: 'Advocate',
        username: 'user',
        role: 'advocate' as const,
        isVerified: true,
        bio: '',
        location: '',
        languages: [],
        joinedDate: '',
        followersCount: 0,
        followingCount: 0,
        postsCount: 0,
      };
      const isSeen = s.viewedBy?.includes(currentUser?.id || '') || false;
      storiesByAuthor.push({ author, story: s, isSeen });
    }
  }

  return (
    <div
      style={{ height }}
      className="w-full border-b border-[var(--border)] px-4 flex items-center overflow-x-auto no-scrollbar transition-all duration-200"
    >
      <div className="flex items-center gap-[14px] py-1">
        {/* Your story item */}
        <button
          type="button"
          onClick={onOpenCreateStory}
          className="flex flex-col items-center shrink-0 w-[56px] text-center cursor-pointer group focus-visible:outline-none"
        >
          <div className="relative w-[48px] h-[48px] rounded-full border-[1.5px] border-dashed border-[var(--border)] group-hover:border-[var(--accent)] flex items-center justify-center bg-[var(--surface)] transition-colors">
            {currentUser?.avatar ? (
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-[42px] h-[42px] rounded-full object-cover"
              />
            ) : (
              <span className="font-semibold text-xs text-[var(--muted)]">
                {currentUser?.name?.slice(0, 2).toUpperCase() || 'LX'}
              </span>
            )}
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 rounded-full bg-[var(--accent)] text-white flex items-center justify-center border-2 border-[var(--bg)] shadow-xs">
              <Plus className="w-3 h-3 stroke-[3]" />
            </div>
          </div>
          <span className="text-[11px] text-[var(--muted)] group-hover:text-[var(--text)] mt-1 truncate max-w-[56px]">
            {yourStoryLabel}
          </span>
        </button>

        {/* Other active stories */}
        {storiesByAuthor.map(({ author, story, isSeen }) => (
          <button
            key={story.id}
            type="button"
            onClick={() => onOpenStory?.(story)}
            className="flex flex-col items-center shrink-0 w-[56px] text-center cursor-pointer group focus-visible:outline-none"
          >
            <div
              className={`w-[48px] h-[48px] rounded-full p-[2px] transition-transform group-hover:scale-105 ${
                isSeen
                  ? 'border-2 border-[var(--border)]'
                  : 'border-2 border-[var(--accent)]'
              }`}
            >
              {author.avatar ? (
                <img
                  src={author.avatar}
                  alt={author.name}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[var(--surface)] text-[var(--text)] flex items-center justify-center font-bold text-xs">
                  {author.name.slice(0, 2).toUpperCase()}
                </div>
              )}
            </div>
            <span className="text-[11px] text-[var(--muted)] group-hover:text-[var(--text)] mt-1 truncate max-w-[56px]">
              {author.name.split(' ')[0]}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
};
