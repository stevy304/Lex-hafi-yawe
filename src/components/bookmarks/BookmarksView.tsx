import React from 'react';
import { Bookmark, LogIn } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';

export const BookmarksView: React.FC = () => {
  const { posts, currentUser, openLoginModal } = useApp();

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center">
        <div>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <Bookmark className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Saved Legal Bookmarks
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Sign in to access your private collection of saved legal analyses, statutory interpretations, and discussions.
          </p>
          <button
            onClick={openLoginModal}
            className="px-5 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition flex items-center gap-2 mx-auto cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to View Bookmarks</span>
          </button>
        </div>
      </div>
    );
  }

  const bookmarkedPosts = posts.filter(p => p.bookmarkedBy.includes(currentUser.id));

  return (
    <div className="min-h-screen bg-slate-50/50">
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Bookmark className="w-5 h-5 text-blue-700" />
          <h1 className="text-lg font-black text-slate-900">
            Saved Legal Bookmarks
          </h1>
        </div>
        <p className="text-xs text-slate-600">
          Your private collection of saved legal analyses, statutory interpretations, and discussions.
        </p>
      </div>

      <div className="divide-y divide-slate-200">
        {bookmarkedPosts.length === 0 ? (
          <div className="p-16 text-center bg-white text-xs text-slate-500">
            <Bookmark className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="font-semibold text-slate-800">No bookmarked posts yet</p>
            <p className="text-2xs text-slate-400 mt-0.5">
              Save insightful legal posts to review later from your feed.
            </p>
          </div>
        ) : (
          bookmarkedPosts.map(post => <PostCard key={post.id} post={post} />)
        )}
      </div>
    </div>
  );
};
