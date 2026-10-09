import React, { useState } from 'react';
import { X, Scale, Send } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';

export const QuotePostModal: React.FC = () => {
  const {
    quoteTargetPost,
    setQuoteTargetPost,
    createQuotePost,
    currentUser,
    users
  } = useApp();

  const [commentary, setCommentary] = useState('');

  if (!quoteTargetPost) return null;

  const targetAuthor = users.find(u => u.id === quoteTargetPost.authorId) || {
    id: quoteTargetPost.authorId,
    name: 'Legal Author',
    username: 'author',
    avatar: '',
    role: 'citizen' as const,
    isVerified: false,
    bio: '',
    location: '',
    languages: [],
    joinedDate: '',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0
  };

  const handleQuoteSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentary.trim()) return;

    createQuotePost(commentary.trim(), quoteTargetPost.id);
    setCommentary('');
    setQuoteTargetPost(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-blue-700" />
            <h2 className="text-sm font-bold text-slate-900">
              Quote Legal Post
            </h2>
          </div>
          <button
            onClick={() => setQuoteTargetPost(null)}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleQuoteSubmit} className="p-4 space-y-3">
          <div className="flex items-start gap-2.5">
            <UserAvatar user={currentUser} size="sm" />
            <textarea
              value={commentary}
              onChange={e => setCommentary(e.target.value)}
              placeholder="Add your legal perspective or commentary..."
              rows={3}
              autoFocus
              className="w-full text-xs text-slate-900 placeholder:text-slate-400 focus:outline-none resize-none leading-relaxed"
            />
          </div>

          {/* Quoted Post Preview */}
          <div className="border border-slate-200 rounded-xl p-3 bg-slate-50/70">
            <div className="flex items-center gap-1.5 mb-1">
              <UserAvatar user={targetAuthor} size="xs" />
              <span className="text-xs font-bold text-slate-900">
                {targetAuthor.name}
              </span>
              <span className="text-2xs text-slate-400">
                @{targetAuthor.username}
              </span>
            </div>
            <p className="text-xs text-slate-700 line-clamp-3">
              {quoteTargetPost.content}
            </p>
          </div>

          <div className="flex justify-end pt-2 border-t border-slate-100">
            <button
              type="submit"
              disabled={!commentary.trim()}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-1.5 ${
                commentary.trim()
                  ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-3.5 h-3.5" />
              <span>Quote & Publish</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
