import React, { useState } from 'react';
import { X, Send, Heart, CornerDownRight } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from './PostCard';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';

export const PostDetailModal: React.FC = () => {
  const {
    selectedPostForThread,
    setSelectedPostForThread,
    replies,
    createReply,
    currentUser,
    users,
    openLoginModal
  } = useApp();

  const [replyText, setReplyText] = useState('');
  const [replyingToReplyId, setReplyingToReplyId] = useState<string | null>(null);

  if (!selectedPostForThread) return null;

  // Filter replies for this post
  const postReplies = replies.filter(r => r.postId === selectedPostForThread.id);

  const handleSubmitReply = (e: React.FormEvent) => {
    e.preventDefault();
    if (!replyText.trim()) return;

    createReply(selectedPostForThread.id, replyText.trim(), replyingToReplyId || undefined);
    setReplyText('');
    setReplyingToReplyId(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
        {/* Modal Top Bar */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-extrabold text-slate-900">
              Legal Discussion Thread
            </h2>
            <span className="text-2xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full">
              {postReplies.length} Replies
            </span>
          </div>

          <button
            onClick={() => setSelectedPostForThread(null)}
            className="p-1.5 text-slate-400 hover:text-slate-800 rounded-full hover:bg-slate-200/60 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable Thread Content */}
        <div className="overflow-y-auto flex-1 p-2 sm:p-4 space-y-4">
          {/* Main Original Post */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <PostCard post={selectedPostForThread} isDetailedView={true} />
          </div>

          {/* Threaded Replies List */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Discussion & Legal Opinions
            </h3>

            {postReplies.length === 0 ? (
              <div className="text-center py-8 px-4 bg-slate-50 rounded-xl border border-dashed border-slate-200">
                <p className="text-xs text-slate-500 font-medium">
                  No replies yet. Be the first legal practitioner or citizen to contribute your perspective.
                </p>
              </div>
            ) : (
              postReplies.map(reply => {
                const author = users.find(u => u.id === reply.authorId) || {
                  id: reply.authorId,
                  name: 'Legal Contributor',
                  username: 'contributor',
                  avatar: '',
                  role: 'citizen' as const,
                  isVerified: false,
                  bio: '',
                  location: 'Kigali',
                  languages: ['Kinyarwanda'],
                  joinedDate: '2024',
                  followersCount: 0,
                  followingCount: 0,
                  postsCount: 0
                };

                return (
                  <div
                    key={reply.id}
                    className={`p-3 rounded-xl border transition ${
                      reply.parentReplyId
                        ? 'ml-6 bg-slate-50/80 border-slate-200/70'
                        : 'bg-white border-slate-200 shadow-2xs'
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <UserAvatar user={author} size="sm" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-1.5 mb-0.5">
                          <span className="text-xs font-bold text-slate-900 truncate">
                            {author.name}
                          </span>
                          <VerificationBadge user={author} size="sm" />
                          <span className="text-2xs text-slate-400">
                            @{author.username}
                          </span>
                        </div>

                        <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                          {reply.content}
                        </p>

                        <div className="flex items-center gap-4 mt-2 text-2xs text-slate-500">
                          <button
                            onClick={() => setReplyingToReplyId(reply.id)}
                            className="flex items-center gap-1 hover:text-blue-700 font-semibold"
                          >
                            <CornerDownRight className="w-3.5 h-3.5" />
                            <span>Reply to {author.name.split(' ')[0]}</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Reply Composer at Bottom */}
        {currentUser ? (
          <form
            onSubmit={handleSubmitReply}
            className="p-3 border-t border-slate-200 bg-white flex items-center gap-2"
          >
            <UserAvatar user={currentUser} size="sm" />
            <div className="flex-1 relative">
              <input
                type="text"
                value={replyText}
                onChange={e => setReplyText(e.target.value)}
                placeholder={
                  replyingToReplyId
                    ? 'Write your reply...'
                    : 'Post your reply or legal insight...'
                }
                className="w-full text-xs bg-slate-100 hover:bg-slate-150 focus:bg-white border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-blue-600"
              />
            </div>
            <button
              type="submit"
              disabled={!replyText.trim()}
              className={`p-2.5 rounded-xl font-bold transition flex items-center justify-center ${
                replyText.trim()
                  ? 'bg-blue-700 text-white hover:bg-blue-800 cursor-pointer shadow-xs'
                  : 'bg-slate-100 text-slate-400 cursor-not-allowed'
              }`}
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        ) : (
          <div className="p-3.5 border-t border-slate-200 bg-slate-50 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-xs text-slate-600 font-medium text-center sm:text-left">
              Sign in to contribute your legal opinion or ask clarifying questions on this thread.
            </p>
            <button
              type="button"
              onClick={openLoginModal}
              className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shrink-0 cursor-pointer transition shadow-xs"
            >
              Sign In to Reply
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
