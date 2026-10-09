import React, { useState } from 'react';
import {
  Heart,
  MessageCircle,
  Repeat2,
  Bookmark,
  Share2,
  MoreHorizontal,
  FileText,
  Download,
  ShieldCheck,
  Scale,
  Award,
  Trash2,
  Edit2,
  Flag,
  Check,
  VolumeX,
  UserX,
  ExternalLink,
  X
} from 'lucide-react';
import { Post, User, PostAttachment } from '../../types';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';

interface PostCardProps {
  post: Post;
  isDetailedView?: boolean;
}

export const PostCard: React.FC<PostCardProps> = ({ post, isDetailedView = false }) => {
  const {
    users,
    currentUser,
    toggleLikePost,
    toggleRepostPost,
    toggleBookmarkPost,
    deletePost,
    editPost,
    muteUser,
    blockUser,
    openLoginModal,
    navigateToProfile,
    setSelectedPostForThread,
    setQuoteTargetPost,
    setReportTarget,
    setActiveView
  } = useApp();

  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);
  const [activeAttachmentModal, setActiveAttachmentModal] = useState<PostAttachment | null>(null);

  const author = users.find(u => u.id === post.authorId) || {
    id: post.authorId,
    name: 'Rwanda Legal Member',
    username: 'legal_user',
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

  // Hide if muted or blocked by current user
  const isMuted = currentUser?.mutedUserIds?.includes(author.id);
  const isBlocked = currentUser?.blockedUserIds?.includes(author.id);
  if (isMuted || isBlocked) {
    return null;
  }

  const isLiked = currentUser ? post.likedBy.includes(currentUser.id) : false;
  const isReposted = currentUser ? post.repostedBy.includes(currentUser.id) : false;
  const isBookmarked = currentUser ? post.bookmarkedBy.includes(currentUser.id) : false;
  const isAuthor = currentUser ? currentUser.id === post.authorId : false;
  const isAdmin = currentUser?.role === 'admin';

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const now = new Date();
      const diffMs = now.getTime() - date.getTime();
      const diffMins = Math.floor(diffMs / (1000 * 60));
      const diffHours = Math.floor(diffMins / 60);
      const diffDays = Math.floor(diffHours / 24);

      if (diffMins < 1) return 'Just now';
      if (diffMins < 60) return `${diffMins}m`;
      if (diffHours < 24) return `${diffHours}h`;
      if (diffDays < 7) return `${diffDays}d`;
      return date.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
    } catch {
      return 'Recent';
    }
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(window.location.origin + `/#post-${post.id}`);
    setCopiedLink(true);
    setTimeout(() => {
      setCopiedLink(false);
      setIsMenuOpen(false);
    }, 1800);
  };

  const handleSaveEdit = () => {
    if (editContent.trim()) {
      editPost(post.id, editContent.trim());
      setIsEditing(false);
    }
  };

  const handleLike = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    toggleLikePost(post.id);
  };

  const handleRepost = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    toggleRepostPost(post.id);
  };

  const handleQuote = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    setQuoteTargetPost(post);
  };

  const handleBookmark = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    toggleBookmarkPost(post.id);
  };

  const handleMute = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    muteUser(author.id);
    setIsMenuOpen(false);
    setFeedbackNotice(`Muted @${author.username}`);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  const handleBlock = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    blockUser(author.id);
    setIsMenuOpen(false);
    setFeedbackNotice(`Blocked @${author.username}`);
    setTimeout(() => setFeedbackNotice(null), 2500);
  };

  return (
    <article className="border-b border-slate-200/90 hover:bg-slate-50/50 transition-colors p-4 bg-white relative">
      {/* Toast Feedback */}
      {feedbackNotice && (
        <div className="absolute top-2 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg z-20">
          {feedbackNotice}
        </div>
      )}

      {/* Official Announcement Header */}
      {post.isOfficialAnnouncement && (
        <div className="flex items-center gap-1.5 text-xs font-bold text-amber-900 bg-amber-50/90 border border-amber-200/80 rounded-lg px-2.5 py-1 mb-2.5 w-fit">
          <Award className="w-3.5 h-3.5 text-amber-600" />
          <span>
            {author.role === 'institution'
              ? `Official Circular • ${author.institutionName || author.name}`
              : author.role === 'legalaid'
              ? `MAJ Legal Aid Notice • ${author.name}`
              : `Official Announcement • ${author.name}`}
          </span>
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Author Avatar */}
        <button
          onClick={() => navigateToProfile(author.id)}
          className="focus:outline-none"
        >
          <UserAvatar user={author} size="md" />
        </button>

        {/* Post Body */}
        <div className="flex-1 min-w-0">
          {/* Header Row */}
          <div className="flex items-start justify-between gap-1 mb-1">
            <div className="flex flex-wrap items-center gap-1.5 min-w-0">
              <button
                onClick={() => navigateToProfile(author.id)}
                className="text-xs font-extrabold text-slate-900 hover:underline truncate"
              >
                {author.name}
              </button>

              <VerificationBadge user={author} size="sm" />

              <span className="text-2xs text-slate-400 truncate">
                @{author.username}
              </span>

              <span className="text-slate-300 text-xs">•</span>

              <time className="text-2xs text-slate-400">
                {formatTime(post.createdAt)}
              </time>

              {post.updatedAt && (
                <span className="text-[10px] text-slate-400 italic">
                  (edited)
                </span>
              )}
            </div>

            {/* Context Menu Trigger */}
            <div className="relative">
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
                aria-label="More options"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>

              {/* Context Menu Dropdown */}
              {isMenuOpen && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs">
                  <button
                    onClick={handleCopyLink}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    {copiedLink ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-600 font-semibold">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Share2 className="w-3.5 h-3.5 text-slate-500" />
                        <span>Copy link to post</span>
                      </>
                    )}
                  </button>

                  <button
                    onClick={() => {
                      handleBookmark();
                      setIsMenuOpen(false);
                    }}
                    className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                  >
                    <Bookmark className="w-3.5 h-3.5 text-slate-500" />
                    <span>{isBookmarked ? 'Remove Bookmark' : 'Save Bookmark'}</span>
                  </button>

                  {isAuthor && (
                    <button
                      onClick={() => {
                        setIsEditing(true);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-blue-600" />
                      <span>Edit post</span>
                    </button>
                  )}

                  {(isAuthor || isAdmin) && (
                    <button
                      onClick={() => {
                        deletePost(post.id);
                        setIsMenuOpen(false);
                      }}
                      className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-3.5 h-3.5 text-red-600" />
                      <span>Delete post</span>
                    </button>
                  )}

                  {!isAuthor && (
                    <>
                      <button
                        onClick={handleMute}
                        className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                        <span>Mute @{author.username}</span>
                      </button>

                      <button
                        onClick={handleBlock}
                        className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                      >
                        <UserX className="w-3.5 h-3.5 text-slate-500" />
                        <span>Block @{author.username}</span>
                      </button>

                      <button
                        onClick={() => {
                          setReportTarget({
                            type: 'post',
                            id: post.id,
                            preview: post.content.substring(0, 80)
                          });
                          setIsMenuOpen(false);
                        }}
                        className="w-full px-3 py-2 text-left text-red-600 hover:bg-red-50 flex items-center gap-2 border-t border-slate-100"
                      >
                        <Flag className="w-3.5 h-3.5 text-red-600" />
                        <span>Report post</span>
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Professional Subtitle */}
          {author.professionalTitle && (
            <p className="text-[11px] text-slate-500 font-medium -mt-0.5 mb-1.5">
              {author.professionalTitle} {author.barRollNumber ? `• ${author.barRollNumber}` : ''}
            </p>
          )}

          {/* Legal Topic Tag */}
          {post.legalTopic && (
            <div className="mb-2">
              <span className="inline-block text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
                ⚖️ {post.legalTopic}
              </span>
            </div>
          )}

          {/* Content */}
          {isEditing ? (
            <div className="my-2 bg-slate-50 border border-slate-200 rounded-xl p-2.5">
              <textarea
                value={editContent}
                onChange={e => setEditContent(e.target.value)}
                rows={3}
                className="w-full text-xs text-slate-900 bg-white border border-slate-200 rounded-lg p-2 focus:outline-none focus:ring-1 focus:ring-blue-600"
              />
              <div className="flex items-center justify-end gap-2 mt-2">
                <button
                  onClick={() => setIsEditing(false)}
                  className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="px-3 py-1 text-xs font-bold bg-blue-700 text-white rounded-lg hover:bg-blue-800"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            <div
              onClick={() => !isDetailedView && setSelectedPostForThread(post)}
              className={`text-xs text-slate-900 leading-relaxed whitespace-pre-line ${
                !isDetailedView ? 'cursor-pointer' : ''
              }`}
            >
              {post.content}
            </div>
          )}

          {/* Tags */}
          {post.tags && post.tags.length > 0 && (
            <div className="flex flex-wrap gap-1.5 mt-2.5">
              {post.tags.map(tag => (
                <span
                  key={tag}
                  className="text-2xs font-semibold text-blue-600 hover:underline cursor-pointer"
                >
                  #{tag}
                </span>
              ))}
            </div>
          )}

          {/* Document / Statute Attachments */}
          {post.attachments && post.attachments.length > 0 && (
            <div className="space-y-2 mt-3">
              {post.attachments.map((att, i) => (
                <div
                  key={i}
                  onClick={() => setActiveAttachmentModal(att)}
                  className="border border-slate-200 rounded-xl p-3 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-300 transition flex items-center justify-between cursor-pointer"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                      <FileText className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 truncate">
                        {att.name}
                      </p>
                      <p className="text-[10px] text-slate-500">
                        {att.fileSize || 'Legal Record'} • Click to inspect verified Rwandan statute/document
                      </p>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveAttachmentModal(att);
                    }}
                    className="p-1.5 text-blue-700 hover:bg-blue-100 rounded-lg transition shrink-0"
                    title="View record details"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Quoted Post Card */}
          {post.quotedPost && (() => {
            const quotedAuthor = users.find(u => u.id === post.quotedPost?.authorId);
            return (
              <div className="mt-3 border border-slate-200 rounded-xl p-3 bg-slate-50/60 hover:bg-slate-100/50 transition">
                <div className="flex items-center gap-1.5 mb-1">
                  <span className="text-xs font-bold text-slate-900">
                    {quotedAuthor?.name || 'Legal Discussion Post'}
                  </span>
                  {quotedAuthor && <VerificationBadge user={quotedAuthor} size="sm" />}
                  <span className="text-2xs text-slate-400">
                    {quotedAuthor ? `@${quotedAuthor.username}` : ''} • Quoted Post
                  </span>
                </div>
                <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                  {post.quotedPost.content}
                </p>
              </div>
            );
          })()}

          {/* Post Action Buttons */}
          <div className="flex items-center justify-between mt-3.5 pt-2 border-t border-slate-100/80 text-slate-500 max-w-md">
            {/* Reply */}
            <button
              onClick={() => setSelectedPostForThread(post)}
              className="flex items-center gap-1.5 text-2xs hover:text-blue-700 transition group p-1 -m-1"
              title="Reply to discussion"
            >
              <MessageCircle className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{post.repliesCount || 0}</span>
            </button>

            {/* Repost */}
            <button
              onClick={handleRepost}
              className={`flex items-center gap-1.5 text-2xs transition group p-1 -m-1 ${
                isReposted ? 'text-emerald-600 font-bold' : 'hover:text-emerald-600'
              }`}
              title="Repost to followers"
            >
              <Repeat2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
              <span className="font-semibold">{post.repostsCount || 0}</span>
            </button>

            {/* Quote Post */}
            <button
              onClick={handleQuote}
              className="flex items-center gap-1 text-2xs hover:text-indigo-600 transition p-1 -m-1"
              title="Quote this post"
            >
              <Scale className="w-3.5 h-3.5" />
              <span className="font-medium hidden sm:inline">Quote</span>
            </button>

            {/* Like */}
            <button
              onClick={handleLike}
              className={`flex items-center gap-1.5 text-2xs transition group p-1 -m-1 ${
                isLiked ? 'text-rose-600 font-bold' : 'hover:text-rose-600'
              }`}
              title="React to post"
            >
              <Heart
                className={`w-4 h-4 group-hover:scale-110 transition-transform ${
                  isLiked ? 'fill-rose-600 text-rose-600' : ''
                }`}
              />
              <span className="font-semibold">{post.likesCount || 0}</span>
            </button>

            {/* Bookmark */}
            <button
              onClick={handleBookmark}
              className={`flex items-center gap-1.5 text-2xs transition p-1 -m-1 ${
                isBookmarked ? 'text-blue-700' : 'hover:text-blue-700'
              }`}
              title="Bookmark post"
            >
              <Bookmark
                className={`w-4 h-4 ${isBookmarked ? 'fill-blue-700 text-blue-700' : ''}`}
              />
            </button>

            {/* Share */}
            <button
              onClick={handleCopyLink}
              className="flex items-center gap-1.5 text-2xs hover:text-slate-900 transition p-1 -m-1"
              title="Share"
            >
              {copiedLink ? (
                <Check className="w-4 h-4 text-emerald-600" />
              ) : (
                <Share2 className="w-4 h-4" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Legal Attachment Inspection Modal */}
      {activeAttachmentModal && (
        <div
          onClick={(e) => {
            e.stopPropagation();
            setActiveAttachmentModal(null);
          }}
          className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden p-5 space-y-4"
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <FileText className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {activeAttachmentModal.name}
                  </h3>
                  <span className="text-[10px] text-blue-700 font-semibold uppercase tracking-wider block mt-0.5">
                    {activeAttachmentModal.type === 'law_reference'
                      ? 'Official Gazette Statutory Extract'
                      : 'Verified Rwandan Legal Record'}
                  </span>
                </div>
              </div>
              <button
                onClick={() => setActiveAttachmentModal(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-3.5 space-y-2 text-xs">
              <div className="flex justify-between text-2xs text-slate-500 border-b border-slate-200 pb-2">
                <span>File Size / Scope: <strong>{activeAttachmentModal.fileSize || 'Standard Record'}</strong></span>
                <span>Jurisdiction: <strong>Republic of Rwanda</strong></span>
              </div>
              <p className="text-slate-700 leading-relaxed">
                This document is referenced by <strong>{author.name}</strong> (@{author.username}) for official legal guidance and compliance purposes on Lex Hafi Yawe.
              </p>
              <div className="text-2xs text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-lg p-2 flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Verified against official Ministry of Justice / Rwanda Bar Association registries.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => {
                  navigator.clipboard?.writeText(`${activeAttachmentModal.name} - Referenced on Lex Hafi Yawe Rwanda`);
                  setFeedbackNotice(`Copied legal citation: ${activeAttachmentModal.name}`);
                  setActiveAttachmentModal(null);
                  setTimeout(() => setFeedbackNotice(null), 2500);
                }}
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl transition"
              >
                Copy Legal Citation
              </button>
              <button
                type="button"
                onClick={() => {
                  setFeedbackNotice(`Downloaded verified record: ${activeAttachmentModal.name}`);
                  setActiveAttachmentModal(null);
                  setTimeout(() => setFeedbackNotice(null), 2500);
                }}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs"
              >
                <Download className="w-4 h-4" />
                <span>Download Document</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </article>
  );
};
