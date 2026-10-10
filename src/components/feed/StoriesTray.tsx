import React, { useState, useEffect } from 'react';
import { Plus, Award, ShieldCheck, Scale, Sparkles } from 'lucide-react';
import { Story, User } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { UserAvatar } from '../common/UserAvatar';
import { StoryViewerModal } from './StoryViewerModal';
import { CreateStoryModal } from './CreateStoryModal';

interface GroupedStoryAuthor {
  author: User;
  stories: Story[];
  hasUnread: boolean;
  isOfficialBulletin: boolean;
  isAdvocateStory: boolean;
}

export const StoriesTray: React.FC = () => {
  const { currentUser, users, openLoginModal } = useApp();
  const [stories, setStories] = useState<Story[]>([]);
  const [activeViewerAuthorId, setActiveViewerAuthorId] = useState<string | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Load active stories
  const loadStories = async () => {
    try {
      const data = await api.getStories();
      setStories(data);
    } catch {
      // ignore
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStories();
    // Poll every 60s for new stories or expiration
    const interval = setInterval(loadStories, 60000);
    return () => clearInterval(interval);
  }, []);

  // Group stories by author
  const authorsMap = new Map<string, Story[]>();
  for (const story of stories) {
    if (!authorsMap.has(story.authorId)) {
      authorsMap.set(story.authorId, []);
    }
    authorsMap.get(story.authorId)!.push(story);
  }

  const groupedAuthors: GroupedStoryAuthor[] = [];
  for (const [authorId, authorStories] of authorsMap.entries()) {
    const author = users.find(u => u.id === authorId);
    if (!author) continue;

    const hasUnread = currentUser
      ? authorStories.some(s => !s.viewedBy.includes(currentUser.id))
      : true;

    const isOfficialBulletin = authorStories.some(
      s => s.storyType === 'official_bulletin'
    );
    const isAdvocateStory = authorStories.some(
      s => s.storyType === 'advocate_story'
    );

    groupedAuthors.push({
      author,
      stories: authorStories,
      hasUnread,
      isOfficialBulletin,
      isAdvocateStory
    });
  }

  // Sort: Official bulletins first, then unread, then others
  groupedAuthors.sort((a, b) => {
    if (a.isOfficialBulletin && !b.isOfficialBulletin) return -1;
    if (!a.isOfficialBulletin && b.isOfficialBulletin) return 1;
    if (a.hasUnread && !b.hasUnread) return -1;
    if (!a.hasUnread && b.hasUnread) return 1;
    return 0;
  });

  const handleOpenStories = (authorId: string) => {
    setActiveViewerAuthorId(authorId);
  };

  const handleAddStoryClick = () => {
    if (!currentUser) {
      openLoginModal();
    } else {
      setIsCreateModalOpen(true);
    }
  };

  // Find all stories for the viewer
  const viewerStories = activeViewerAuthorId
    ? groupedAuthors.find(g => g.author.id === activeViewerAuthorId)?.stories || []
    : [];

  return (
    <>
      <div className="bg-white border-b border-slate-200/80 px-4 py-3 select-none">
        <div className="flex items-center gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth py-0.5">
          {/* Add Story Bubble for Current User */}
          <div className="flex flex-col items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleAddStoryClick}
              className="relative w-15 h-15 rounded-full p-0.5 flex items-center justify-center group focus:outline-none cursor-pointer"
            >
              <div className="w-full h-full rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden transition group-hover:bg-blue-50">
                {currentUser ? (
                  <UserAvatar user={currentUser} size="md" />
                ) : (
                  <Scale className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition" />
                )}
              </div>
              <div className="absolute bottom-0 right-0 w-5 h-5 rounded-full bg-blue-700 text-white flex items-center justify-center border-2 border-white shadow-xs group-hover:scale-110 transition-transform">
                <Plus className="w-3 h-3 stroke-[3]" />
              </div>
            </button>
            <span className="text-[11px] font-semibold text-slate-700 truncate max-w-[68px] text-center">
              Your Story
            </span>
          </div>

          {/* Grouped Author Story Bubbles */}
          {groupedAuthors.map(({ author, stories: authorStories, hasUnread, isOfficialBulletin, isAdvocateStory }) => {
            // Pick ring styling
            let ringClass = 'p-[2px] bg-slate-200';
            if (hasUnread) {
              if (isOfficialBulletin) {
                ringClass = 'bg-gradient-to-tr from-amber-500 via-yellow-400 to-amber-600 p-[2.5px] shadow-xs shadow-amber-300/40';
              } else if (isAdvocateStory) {
                ringClass = 'bg-gradient-to-tr from-blue-700 via-indigo-500 to-blue-500 p-[2.5px] shadow-xs shadow-blue-400/30';
              } else {
                ringClass = 'bg-gradient-to-tr from-emerald-600 via-teal-400 to-emerald-500 p-[2.5px] shadow-xs shadow-emerald-400/30';
              }
            }

            return (
              <div
                key={author.id}
                className="flex flex-col items-center gap-1 shrink-0"
              >
                <button
                  type="button"
                  onClick={() => {
                    if (typeof navigator !== 'undefined' && navigator.vibrate) {
                      try { navigator.vibrate([10]); } catch {}
                    }
                    handleOpenStories(author.id);
                  }}
                  className={`relative w-15 h-15 rounded-full flex items-center justify-center transition hover:scale-105 active:scale-95 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 cursor-pointer ${ringClass}`}
                  title={`${author.name} (${authorStories.length} updates)`}
                >
                  <div className="w-full h-full rounded-full bg-white p-[2px] flex items-center justify-center overflow-hidden">
                    <UserAvatar user={author} size="md" />
                  </div>

                  {/* Badge indicator on ring */}
                  {isOfficialBulletin ? (
                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-amber-500 text-white flex items-center justify-center border-2 border-white shadow-xs">
                      <Award className="w-2.5 h-2.5" />
                    </div>
                  ) : isAdvocateStory ? (
                    <div className="absolute -top-1 -right-1 w-4.5 h-4.5 rounded-full bg-blue-700 text-white flex items-center justify-center border-2 border-white shadow-xs">
                      <ShieldCheck className="w-2.5 h-2.5" />
                    </div>
                  ) : null}
                </button>

                <span className="text-[11px] font-medium text-slate-800 truncate max-w-[68px] text-center">
                  {author.name.split(' ')[0]}
                </span>
              </div>
            );
          })}

          {/* Clean Prompt when zero stories exist yet */}
          {groupedAuthors.length === 0 && !isLoading && (
            <div className="flex items-center gap-2 px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-2xl text-slate-500 text-2xs font-medium">
              <Sparkles className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span>Share 24-hour statutory alerts, courtroom insights, or legal notices.</span>
            </div>
          )}
        </div>
      </div>

      {/* Story Viewer Modal */}
      {activeViewerAuthorId && viewerStories.length > 0 && (
        <StoryViewerModal
          stories={viewerStories}
          onClose={() => setActiveViewerAuthorId(null)}
          onStoryDeleted={(deletedId) => {
            setStories(prev => prev.filter(s => s.id !== deletedId));
          }}
        />
      )}

      {/* Create Story Modal */}
      <CreateStoryModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onStoryCreated={(newStory) => {
          setStories(prev => [newStory, ...prev]);
        }}
      />
    </>
  );
};
