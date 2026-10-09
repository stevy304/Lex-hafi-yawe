import React, { useState } from 'react';
import { FeedTabs, FeedFilter } from './FeedTabs';
import { PostComposer } from './PostComposer';
import { PostCard } from './PostCard';
import { useApp } from '../../context/AppContext';
import { Sparkles, Users, Award, ShieldCheck, MessageSquare } from 'lucide-react';

export const FeedView: React.FC = () => {
  const { posts, users, currentUser } = useApp();
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

  return (
    <div className="min-h-screen bg-slate-100/60 flex flex-col">
      {/* Top Feed Navigation Tabs */}
      <FeedTabs currentTab={currentTab} onTabChange={setCurrentTab} />

      {/* Main Post Composer */}
      <PostComposer />

      {/* Posts Stream */}
      <div className="flex-1 divide-y divide-slate-200">
        {filteredPosts.length === 0 ? (
          <div className="text-center py-16 px-4 bg-white">
            <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center mx-auto mb-3">
              {currentTab === 'official' ? (
                <Award className="w-6 h-6" />
              ) : currentTab === 'advocates' ? (
                <ShieldCheck className="w-6 h-6" />
              ) : (
                <Sparkles className="w-6 h-6" />
              )}
            </div>
            <h3 className="text-sm font-bold text-slate-800 mb-1">
              No posts found in this feed
            </h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto">
              {currentTab === 'official'
                ? 'Official gazette communiqués and Ministry updates will appear here once published.'
                : 'Follow verified advocates or join legal topic communities to personalize your feed.'}
            </p>
          </div>
        ) : (
          filteredPosts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
