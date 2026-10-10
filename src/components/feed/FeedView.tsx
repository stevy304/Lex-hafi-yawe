import React, { useState } from 'react';
import { FeedTabs, FeedFilter } from './FeedTabs';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { useApp } from '../../context/AppContext';
import {
  Sparkles,
  Users,
  Award,
  ShieldCheck,
  MessageSquare,
  BookOpen,
  HeartHandshake,
  Scale,
  Feather,
  ArrowRight,
  Lock,
  Compass
} from 'lucide-react';

export const FeedView: React.FC = () => {
  const {
    posts,
    users,
    currentUser,
    setActiveView,
    setIsCreatePostModalOpen,
    openLoginModal
  } = useApp();
  const [currentTab, setCurrentTab] = useState<FeedFilter>('for_you');

  // Filter posts based on active tab
  const filteredPosts = posts.filter(post => {
    const author = users.find(u => u.id === post.authorId);

    if (currentTab === 'for_you') {
      return true; // Algorithmically balanced feed
    }
    if (currentTab === 'following') {
      if (!currentUser) return author?.role === 'advocate';
      const isFollowing = currentUser.followingIds?.includes(post.authorId);
      return isFollowing || post.authorId === currentUser.id;
    }
    if (currentTab === 'advocates') {
      return author?.role === 'advocate' || author?.verificationType === 'bar_member';
    }
    if (currentTab === 'official') {
      return post.isOfficialAnnouncement || author?.role === 'institution' || author?.verificationType === 'official_institution';
    }
    if (currentTab === 'communities') {
      return !!post.communityId;
    }
    return true;
  });

  const handleStartPost = () => {
    if (!currentUser) {
      openLoginModal();
    } else {
      setIsCreatePostModalOpen(true);
    }
  };

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      {/* Top Feed Navigation Tabs */}
      <FeedTabs currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Post Composer */}
      <PostComposer />

      {/* Posts Stream */}
      <div className="flex-1 divide-y divide-slate-200">
        {filteredPosts.length === 0 ? (
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
          filteredPosts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
