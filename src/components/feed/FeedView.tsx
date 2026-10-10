import React, { useState, useEffect, useRef, useCallback } from 'react';
import { FeedHeader } from './FeedHeader';
import { FeedFilter } from './FeedTabs';
import { StoriesTray } from './StoriesTray';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { PostCardSkeleton } from './PostCardSkeleton';
import { VerticalVideoViewerModal } from './VerticalVideoViewerModal';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { Post } from '../../types';
import {
  Sparkles,
  Users,
  ShieldCheck,
  BookOpen,
  HeartHandshake,
  Scale,
  Feather,
  ArrowRight,
  Filter,
  RefreshCw,
  Loader2
} from 'lucide-react';

const LEGAL_TOPIC_FILTERS = [
  'All Topics',
  'Land & Property',
  'Labor & Employment',
  'Commercial & Companies',
  'Criminal & Constitutional',
  'Family & Succession',
  'Alternative Dispute Resolution (Abunzi)',
  'Data Protection & Tech',
  'Taxation & Regulatory'
];

export const FeedView: React.FC = () => {
  const {
    posts: initialPosts,
    users,
    currentUser,
    setActiveView,
    setIsCreatePostModalOpen,
    openLoginModal
  } = useApp();

  const [currentTab, setCurrentTab] = useState<FeedFilter>('for_you');
  const [selectedTopic, setSelectedTopic] = useState<string>('All Topics');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [mediaOnly, setMediaOnly] = useState<boolean>(false);
  const [feedPosts, setFeedPosts] = useState<Post[]>(initialPosts);
  const [nextCursor, setNextCursor] = useState<string | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [verticalVideoModalPostId, setVerticalVideoModalPostId] = useState<string | null>(null);

  const sentinelRef = useRef<HTMLDivElement>(null);

  // Synchronize initial context posts
  useEffect(() => {
    setFeedPosts(initialPosts);
  }, [initialPosts]);

  // Load posts with cursor pagination and topic/tab filters
  const loadPosts = useCallback(async (reset: boolean = false, cursorToUse?: string) => {
    if (reset) {
      setIsRefreshing(true);
    } else {
      setIsLoadingMore(true);
    }

    try {
      const topicParam = selectedTopic === 'All Topics' ? undefined : selectedTopic;
      const res = await api.getPostsPaginated({
        tab: currentTab,
        topic: topicParam,
        cursor: reset ? undefined : cursorToUse,
        limit: 15
      });

      if (reset) {
        setFeedPosts(res.posts);
      } else {
        setFeedPosts(prev => {
          const existingIds = new Set(prev.map(p => p.id));
          const uniqueNew = res.posts.filter(p => !existingIds.has(p.id));
          return [...prev, ...uniqueNew];
        });
      }

      setNextCursor(res.nextCursor);
      setHasMore(res.hasMore);
    } catch {
      // Fallback: keep current posts
    } finally {
      setIsRefreshing(false);
      setIsLoadingMore(false);
    }
  }, [currentTab, selectedTopic]);

  // Reload when tab or topic filter changes
  useEffect(() => {
    loadPosts(true);
  }, [currentTab, selectedTopic, loadPosts]);

  // Real-Time Server-Sent Events (SSE) stream listener
  useEffect(() => {
    let eventSource: EventSource | null = null;
    try {
      eventSource = new EventSource('/api/feed/stream');

      eventSource.addEventListener('post:created', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const newPost = payload.data as Post;
          setFeedPosts(prev => {
            if (prev.some(p => p.id === newPost.id)) return prev;
            return [newPost, ...prev];
          });
        } catch {}
      });

      eventSource.addEventListener('post:liked', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const { post: updatedPost } = payload.data;
          setFeedPosts(prev =>
            prev.map(p => (p.id === updatedPost.id ? { ...p, ...updatedPost } : p))
          );
        } catch {}
      });

      eventSource.addEventListener('post:reply', (e: MessageEvent) => {
        try {
          const payload = JSON.parse(e.data);
          const { postId, reply } = payload.data;
          setFeedPosts(prev =>
            prev.map(p => {
              if (p.id !== postId) return p;
              const preview = p.previewReplies ? [...p.previewReplies, reply].slice(-2) : [reply];
              return { ...p, repliesCount: (p.repliesCount || 0) + 1, previewReplies: preview };
            })
          );
        } catch {}
      });
    } catch {
      // EventSource fallback
    }

    return () => {
      eventSource?.close();
    };
  }, []);

  // Infinite Scroll Sentinel Intersection Observer
  useEffect(() => {
    if (!sentinelRef.current || !hasMore || isLoadingMore) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && nextCursor && !isLoadingMore) {
          loadPosts(false, nextCursor);
        }
      },
      { threshold: 0.1, rootMargin: '300px' }
    );

    observer.observe(sentinelRef.current);
    return () => observer.disconnect();
  }, [hasMore, isLoadingMore, nextCursor, loadPosts]);

  const handleStartPost = () => {
    if (!currentUser) {
      openLoginModal();
    } else {
      const textarea = document.querySelector('[data-composer-input]') as HTMLTextAreaElement | null;
      if (textarea) {
        textarea.scrollIntoView({ behavior: 'smooth', block: 'center' });
        textarea.focus();
      } else {
        setIsCreatePostModalOpen(true);
      }
    }
  };

  // Filter posts based on precision toggles (verified counsel only, media only)
  const displayedPosts = feedPosts.filter(post => {
    if (verifiedOnly) {
      const author = users.find(u => u.id === post.authorId);
      if (
        !author ||
        (!author.isVerified &&
          author.role !== 'advocate' &&
          author.role !== 'institution')
      ) {
        return false;
      }
    }
    if (mediaOnly) {
      const hasAttachments = Boolean(post.attachments && post.attachments.length > 0);
      if (!hasAttachments) return false;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-[#F6F4EF] flex flex-col">
      {/* Sticky Feed Navigation Tabs & Scope Filter Chips */}
      <FeedHeader
        currentTab={currentTab}
        onTabChange={setCurrentTab}
        selectedTopic={selectedTopic}
        onSelectTopic={setSelectedTopic}
        verifiedOnly={verifiedOnly}
        onToggleVerifiedOnly={() => setVerifiedOnly(prev => !prev)}
        mediaOnly={mediaOnly}
        onToggleMediaOnly={() => setMediaOnly(prev => !prev)}
      />

      {/* Stories and Legal Bulletins Tray */}
      <StoriesTray />

      {/* Main Post Composer */}
      <PostComposer onPostCreated={() => loadPosts(true)} />

      {/* Posts Stream */}
      <div className="flex-1 divide-y divide-[#EAE5DC]">
        {displayedPosts.length === 0 ? (
          <div className="p-4 sm:p-6 space-y-6 bg-slate-50/50">
            {/* Main Welcome & Purpose Card */}
            <div className="bg-white rounded-3xl border border-slate-200/90 p-6 sm:p-8 shadow-xs text-left relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-br from-blue-100/50 via-indigo-50/30 to-transparent rounded-full blur-2xl -mr-16 -mt-16 pointer-events-none" />

              <div className="relative z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-blue-50 border border-blue-200/70 rounded-full text-blue-900 text-xs font-bold mb-4">
                  <Scale className="w-3.5 h-3.5 text-blue-700" />
                  <span>Rwanda Digital Justice Network</span>
                </div>

                <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight leading-snug">
                  Welcome to Lex Hafi Yawe
                </h2>

                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mt-2 max-w-2xl font-normal">
                  Lex Hafi Yawe connects Rwandan citizens, licensed advocates, and authorized institutions in a secure, transparent legal ecosystem. Your social timeline is currently clear and ready for authentic legal exchange.
                </p>

                {/* Purpose Pillars */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-5 pt-5 border-t border-slate-100">
                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center shrink-0 font-bold">
                      <ShieldCheck className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Verified Advocates</h4>
                      <p className="text-2xs text-slate-500 leading-normal mt-0.5">
                        Attorneys certified against the Rwanda Bar Association Roll.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0 font-bold">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Free Legal Aid (MAJ)</h4>
                      <p className="text-2xs text-slate-500 leading-normal mt-0.5">
                        Direct access to Ministry of Justice district legal officers.
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-2.5">
                    <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center shrink-0 font-bold">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900">Rwandan Legislation</h4>
                      <p className="text-2xs text-slate-500 leading-normal mt-0.5">
                        Authoritative official codes, labor statutes, and property acts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Action Cards Grid */}
            <div className="space-y-2">
              <h3 className="text-xs font-extrabold uppercase tracking-wider text-slate-500 px-1">
                Explore the Platform
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={handleStartPost}
                  className="bg-white hover:bg-blue-50/40 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 text-left transition shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-blue-700 text-white flex items-center justify-center shadow-xs">
                      <Feather className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-800 transition">
                    Share a Legal Question or Insight
                  </h4>
                  <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                    Start a civil discussion on statutory rights, contract terms, or procedural rules.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('laws')}
                  className="bg-white hover:bg-blue-50/40 border border-slate-200/90 hover:border-blue-300 rounded-2xl p-4 text-left transition shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center shadow-xs">
                      <BookOpen className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-blue-700 group-hover:translate-x-0.5 transition" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-blue-800 transition">
                    Browse Rwandan Legislation
                  </h4>
                  <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                    Search Labor Law N° 66/2018, Land Law N° 027/2021, and the Company Act.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('communities')}
                  className="bg-white hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-4 text-left transition shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                      <Users className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-emerald-800 transition">
                    Join Practice Communities
                  </h4>
                  <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                    Engage in specialized forums on Property Conveyancing, Commercial Law, and ADR.
                  </p>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveView('legalaid')}
                  className="bg-white hover:bg-emerald-50/40 border border-slate-200/90 hover:border-emerald-300 rounded-2xl p-4 text-left transition shadow-xs group cursor-pointer"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="w-9 h-9 rounded-xl bg-teal-700 text-white flex items-center justify-center shadow-xs">
                      <HeartHandshake className="w-4 h-4" />
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-teal-700 group-hover:translate-x-0.5 transition" />
                  </div>
                  <h4 className="text-xs font-extrabold text-slate-900 group-hover:text-teal-800 transition">
                    Access Free Legal Aid (MAJ)
                  </h4>
                  <p className="text-2xs text-slate-500 mt-1 leading-relaxed">
                    Find your district Maison d'Accès à la Justice office or dial national hotline 3922.
                  </p>
                </button>
              </div>
            </div>

            {/* Tab-Specific Notice if not on 'for_you' */}
            {currentTab !== 'for_you' && (
              <div className="p-4 rounded-2xl bg-white border border-slate-200 text-center">
                <span className="text-xs font-bold text-slate-700">
                  {currentTab === 'following'
                    ? 'You are not following any legal practitioners yet. Follow verified counsel from the Legal Services marketplace.'
                    : currentTab === 'advocates'
                    ? 'No advocate publications yet. Certified Rwanda Bar Association members publish commentaries here.'
                    : currentTab === 'official'
                    ? 'Official gazette communiqués and Ministry updates will appear here once published by authorized institutions.'
                    : 'No community discussions active yet. Select a legal community above to participate.'}
                </span>
              </div>
            )}
          </div>
        ) : (
          <>
            {isRefreshing && (
              <div className="divide-y divide-slate-200">
                <PostCardSkeleton />
                <PostCardSkeleton />
              </div>
            )}
            {displayedPosts.map(post => (
              <PostCard
                key={post.id}
                post={post}
                onOpenVerticalVideo={(postId) => setVerticalVideoModalPostId(postId)}
              />
            ))}
          </>
        )}

        {/* Infinite Scroll Sentinel */}
        <div ref={sentinelRef} className="py-2">
          {isLoadingMore && (
            <div className="divide-y divide-slate-200">
              <PostCardSkeleton />
            </div>
          )}
        </div>
      </div>

      {/* Full-Screen Vertical Video (Shorts) Experience */}
      {verticalVideoModalPostId && (
        <VerticalVideoViewerModal
          posts={displayedPosts}
          initialPostId={verticalVideoModalPostId}
          onClose={() => setVerticalVideoModalPostId(null)}
        />
      )}
    </div>
  );
};
