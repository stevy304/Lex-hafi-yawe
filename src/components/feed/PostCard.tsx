import React, { useState, useRef, useEffect, useCallback } from 'react';
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
  Volume2,
  Play,
  Pause,
  Maximize2,
  ChevronLeft,
  ChevronRight,
  UserX,
  Calendar,
  Send,
  ExternalLink,
  Smartphone
} from 'lucide-react';
import { Post, User, PostAttachment, Reply, LegalService } from '../../types';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { videoManager } from '../../utils/videoPlaybackManager';
import { LegalDocumentLightbox } from './LegalDocumentLightbox';
import { ServiceBookingModal } from '../services/ServiceBookingModal';

interface PostCardProps {
  post: Post;
  isDetailedView?: boolean;
  onOpenVerticalVideo?: (postId: string) => void;
}

export const PostCard: React.FC<PostCardProps> = ({
  post,
  isDetailedView = false,
  onOpenVerticalVideo
}) => {
  const {
    users,
    currentUser,
    legalServices,
    toggleLikePost,
    toggleRepostPost,
    toggleBookmarkPost,
    deletePost,
    editPost,
    createReply,
    muteUser,
    blockUser,
    openLoginModal,
    navigateToProfile,
    setSelectedPostForThread,
    setQuoteTargetPost,
    setReportTarget
  } = useApp();

  // Optimistic Interaction States
  const isLikedInitial = currentUser ? post.likedBy.includes(currentUser.id) : false;
  const isBookmarkedInitial = currentUser ? post.bookmarkedBy.includes(currentUser.id) : false;
  const isRepostedInitial = currentUser ? post.repostedBy.includes(currentUser.id) : false;

  const [isLiked, setIsLiked] = useState(isLikedInitial);
  const [likesCount, setLikesCount] = useState(post.likesCount || 0);
  const [isBookmarked, setIsBookmarked] = useState(isBookmarkedInitial);
  const [isReposted, setIsReposted] = useState(isRepostedInitial);
  const [repostsCount, setRepostsCount] = useState(post.repostsCount || 0);

  // Sync with prop updates
  useEffect(() => {
    setIsLiked(currentUser ? post.likedBy.includes(currentUser.id) : false);
    setLikesCount(post.likesCount || 0);
    setIsBookmarked(currentUser ? post.bookmarkedBy.includes(currentUser.id) : false);
    setIsReposted(currentUser ? post.repostedBy.includes(currentUser.id) : false);
    setRepostsCount(post.repostsCount || 0);
  }, [post.likedBy, post.likesCount, post.bookmarkedBy, post.repostedBy, post.repostsCount, currentUser]);

  // UI States
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState(post.content);
  const [isCaptionExpanded, setIsCaptionExpanded] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState<string | null>(null);

  // Media & Carousel State
  const [carouselIndex, setCarouselIndex] = useState(0);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [activeDocumentAttachment, setActiveDocumentAttachment] = useState<PostAttachment | null>(null);
  const [isBookingModalOpen, setIsBookingModalOpen] = useState(false);

  // Video State
  const [isVideoPlaying, setIsVideoPlaying] = useState(false);
  const [isVideoMuted, setIsVideoMuted] = useState(videoManager.getGlobalMuted());
  const [videoProgress, setVideoProgress] = useState(0);
  const [videoDuration, setVideoDuration] = useState(0);
  const [showPlayOverlay, setShowPlayOverlay] = useState(false);

  // Inline Comment State
  const [inlineComment, setInlineComment] = useState('');
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [localReplies, setLocalReplies] = useState<Reply[]>(post.previewReplies || []);

  const videoRef = useRef<HTMLVideoElement>(null);
  const touchStartXRef = useRef<number>(0);
  const lastTapTimeRef = useRef<number>(0);
  const singleTapTimeoutRef = useRef<any>(null);

  const author = users.find(u => u.id === post.authorId) || {
    id: post.authorId,
    name: 'Rwanda Legal Member',
    username: 'legal_member',
    role: 'citizen' as const,
    isVerified: false,
    bio: '',
    location: 'Kigali',
    languages: ['Kinyarwanda'],
    joinedDate: '2026',
    followersCount: 0,
    followingCount: 0,
    postsCount: 0
  };

  // Hide if muted or blocked
  const isMutedUser = currentUser?.mutedUserIds?.includes(author.id);
  const isBlockedUser = currentUser?.blockedUserIds?.includes(author.id);
  if (isMutedUser || isBlockedUser) {
    return null;
  }

  const isAuthor = currentUser ? currentUser.id === post.authorId : false;
  const isAdmin = currentUser?.role === 'admin';

  // Check if author has an active bookable service
  const authorService: LegalService | undefined = legalServices.find(
    s => s.providerId === author.id
  );
  const canBookConsultation =
    (author.role === 'advocate' || author.verificationType === 'bar_member') &&
    !!authorService;

  // Categorize attachments
  const mediaAttachments = (post.attachments || []).filter(
    a => a.type === 'image' || a.type === 'video'
  );
  const documentAttachments = (post.attachments || []).filter(
    a => a.type === 'document' || a.type === 'law_reference'
  );

  const activeMedia = mediaAttachments[carouselIndex] || mediaAttachments[0];
  const isVideoMedia = activeMedia?.type === 'video';

  // Aspect ratio calculation to avoid layout shift
  let aspectRatioClass = 'aspect-[4/5]'; // Default Instagram portrait
  if (activeMedia?.aspectRatio === '1:1') aspectRatioClass = 'aspect-square';
  else if (activeMedia?.aspectRatio === '16:9') aspectRatioClass = 'aspect-video';
  else if (activeMedia?.aspectRatio === '9:16') aspectRatioClass = 'aspect-[9/16]';

  // Register video with centralized video playback manager
  useEffect(() => {
    if (isVideoMedia && videoRef.current) {
      const el = videoRef.current;
      videoManager.register(post.id, el, (playing, muted) => {
        setIsVideoPlaying(playing);
        setIsVideoMuted(muted);
      });

      const onTimeUpdate = () => {
        if (el.duration) {
          setVideoProgress((el.currentTime / el.duration) * 100);
          setVideoDuration(el.duration);
        }
      };
      el.addEventListener('timeupdate', onTimeUpdate);

      return () => {
        el.removeEventListener('timeupdate', onTimeUpdate);
        videoManager.unregister(post.id);
      };
    }
  }, [isVideoMedia, post.id, carouselIndex]);

  // Format Relative Timestamp
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const diffMs = Date.now() - date.getTime();
      const diffMins = Math.floor(diffMs / 60000);
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

  // Double-tap to like gesture handler
  const handleMediaPointerDown = () => {
    const now = Date.now();
    const timeSinceLast = now - lastTapTimeRef.current;

    if (timeSinceLast < 300) {
      // Double Tap!
      if (singleTapTimeoutRef.current) {
        clearTimeout(singleTapTimeoutRef.current);
        singleTapTimeoutRef.current = null;
      }
      triggerDoubleTapLike();
      lastTapTimeRef.current = 0;
    } else {
      lastTapTimeRef.current = now;
      if (isVideoMedia) {
        singleTapTimeoutRef.current = setTimeout(() => {
          handleTogglePlayPause();
          singleTapTimeoutRef.current = null;
        }, 300);
      }
    }
  };

  const triggerDoubleTapLike = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    // Trigger subtle physical haptic feedback where device supports it
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      try { navigator.vibrate([15]); } catch {}
    }

    if (!isLiked) {
      setIsLiked(true);
      setLikesCount(prev => prev + 1);
      toggleLikePost(post.id).catch(() => {
        setIsLiked(false);
        setLikesCount(prev => Math.max(0, prev - 1));
      });
    }

    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 850);
  };

  const handleTogglePlayPause = () => {
    videoManager.togglePlay(post.id);
    setShowPlayOverlay(true);
    setTimeout(() => setShowPlayOverlay(false), 800);
  };

  const handleToggleMute = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextMuted = videoManager.toggleGlobalMute();
    setIsVideoMuted(nextMuted);
  };

  const handleFullscreen = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (videoRef.current) {
      if (videoRef.current.requestFullscreen) {
        videoRef.current.requestFullscreen();
      }
    }
  };

  // Carousel Navigation
  const handlePrevCarousel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carouselIndex > 0) setCarouselIndex(prev => prev - 1);
  };

  const handleNextCarousel = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (carouselIndex < mediaAttachments.length - 1) setCarouselIndex(prev => prev + 1);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartXRef.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    const touchEndX = e.changedTouches[0].clientX;
    const diff = touchStartXRef.current - touchEndX;

    if (Math.abs(diff) > 40) {
      if (diff > 0 && carouselIndex < mediaAttachments.length - 1) {
        setCarouselIndex(prev => prev + 1);
      } else if (diff < 0 && carouselIndex > 0) {
        setCarouselIndex(prev => prev - 1);
      }
    }
  };

  // Optimistic Like
  const handleLike = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const nextLiked = !isLiked;
    setIsLiked(nextLiked);
    setLikesCount(prev => (nextLiked ? prev + 1 : Math.max(0, prev - 1)));

    toggleLikePost(post.id).catch(() => {
      // Rollback on network failure
      setIsLiked(!nextLiked);
      setLikesCount(prev => (nextLiked ? Math.max(0, prev - 1) : prev + 1));
    });
  };

  // Optimistic Bookmark
  const handleBookmark = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const nextBookmarked = !isBookmarked;
    setIsBookmarked(nextBookmarked);
    toggleBookmarkPost(post.id).catch(() => {
      setIsBookmarked(!nextBookmarked);
    });
  };

  // Optimistic Repost
  const handleRepost = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const nextReposted = !isReposted;
    setIsReposted(nextReposted);
    setRepostsCount(prev => (nextReposted ? prev + 1 : Math.max(0, prev - 1)));

    toggleRepostPost(post.id).catch(() => {
      setIsReposted(!nextReposted);
      setRepostsCount(prev => (nextReposted ? Math.max(0, prev - 1) : prev + 1));
    });
  };

  const handleCopyLink = () => {
    navigator.clipboard?.writeText(`${window.location.origin}/#post-${post.id}`);
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

  // Inline Comment Submit
  const handleInlineCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inlineComment.trim()) return;

    if (!currentUser) {
      openLoginModal();
      return;
    }

    const contentToAdd = inlineComment.trim();
    setInlineComment('');
    setIsSubmittingComment(true);

    try {
      await createReply(post.id, contentToAdd);
      // Optimistic preview comment
      const tempReply: Reply = {
        id: `reply_local_${Date.now()}`,
        postId: post.id,
        authorId: currentUser.id,
        content: contentToAdd,
        createdAt: new Date().toISOString(),
        likesCount: 0,
        likedBy: []
      };
      setLocalReplies(prev => [...prev.slice(-1), tempReply]);
    } catch (err: any) {
      setFeedbackNotice('Failed to post comment');
      setTimeout(() => setFeedbackNotice(null), 2500);
    } finally {
      setIsSubmittingComment(false);
    }
  };

  // Liked By display string
  const getLikedByString = () => {
    if (likesCount === 0) return null;
    if (post.likedBy.length > 0) {
      const firstLikerId = post.likedBy[0];
      const firstLiker = users.find(u => u.id === firstLikerId);
      if (firstLiker) {
        if (likesCount === 1) {
          return `Liked by @${firstLiker.username}`;
        }
        return `Liked by @${firstLiker.username} and ${likesCount - 1} other${likesCount > 2 ? 's' : ''}`;
      }
    }
    return `${likesCount} ${likesCount === 1 ? 'like' : 'likes'}`;
  };

  const isLongCaption = post.content.length > 160;

  return (
    <article
      id={`post-${post.id}`}
      data-feed-post-id={post.id}
      tabIndex={0}
      className="border-b border-slate-200/90 bg-white transition-colors relative focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-inset"
    >
      {/* Toast Notice */}
      {feedbackNotice && (
        <div className="absolute top-3 right-4 bg-slate-900 text-white text-xs px-3 py-1.5 rounded-xl shadow-lg z-20">
          {feedbackNotice}
        </div>
      )}

      {/* Official Circular Ribbon */}
      {post.isOfficialAnnouncement && (
        <div className="bg-amber-50/90 border-b border-amber-200/80 px-4 py-1.5 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1.5 text-amber-900 font-bold">
            <Award className="w-4 h-4 text-amber-600 shrink-0" />
            <span>
              {author.role === 'institution'
                ? `Official Circular • ${author.institutionName || author.name}`
                : author.role === 'legalaid'
                ? `MAJ District Legal Notice • ${author.name}`
                : `Official Gazette Legal Update`}
            </span>
          </div>
          <span className="text-[10px] text-amber-700 font-medium">Republic of Rwanda</span>
        </div>
      )}

      {/* Card Header: Author, Verification, Timestamp, More Menu */}
      <div className="p-3 sm:p-4 flex items-center justify-between">
        <div className="flex items-center gap-3 min-w-0">
          <button
            type="button"
            onClick={() => navigateToProfile(author.id)}
            className="focus:outline-none shrink-0"
          >
            <UserAvatar user={author} size="md" />
          </button>

          <div className="min-w-0">
            <div className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => navigateToProfile(author.id)}
                className="text-xs font-extrabold text-slate-900 hover:underline truncate"
              >
                {author.name}
              </button>
              <VerificationBadge user={author} size="sm" />
              <span className="text-slate-300 text-xs">•</span>
              <time className="feed-timestamp shrink-0">
                {formatTime(post.createdAt)}
              </time>
            </div>

            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 truncate mt-0.5">
              <span>@{author.username}</span>
              {author.professionalTitle && (
                <>
                  <span>•</span>
                  <span className="truncate">{author.professionalTitle}</span>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Top Right: Consultation CTA or More Menu */}
        <div className="flex items-center gap-1.5">
          {canBookConsultation && (
            <button
              type="button"
              onClick={() => setIsBookingModalOpen(true)}
              className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-lg text-2xs font-bold transition cursor-pointer"
            >
              <Calendar className="w-3 h-3 text-blue-600" />
              <span>Consult</span>
            </button>
          )}

          <div className="relative">
            <button
              type="button"
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-1 rounded-full text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition"
              aria-label="More options"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {/* Dropdown Menu */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-slate-200 rounded-xl shadow-xl py-1 z-30 text-xs">
                <button
                  type="button"
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
                  type="button"
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
                    type="button"
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
                    type="button"
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
                      type="button"
                      onClick={() => {
                        muteUser(author.id);
                        setIsMenuOpen(false);
                        setFeedbackNotice(`Muted @${author.username}`);
                        setTimeout(() => setFeedbackNotice(null), 2500);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <VolumeX className="w-3.5 h-3.5 text-slate-500" />
                      <span>Mute @${author.username}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        blockUser(author.id);
                        setIsMenuOpen(false);
                        setFeedbackNotice(`Blocked @${author.username}`);
                        setTimeout(() => setFeedbackNotice(null), 2500);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-700 hover:bg-slate-50 flex items-center gap-2"
                    >
                      <UserX className="w-3.5 h-3.5 text-slate-500" />
                      <span>Block @${author.username}</span>
                    </button>

                    <button
                      type="button"
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
      </div>

      {/* Primary Media Container (Zero CLS Reserved Aspect Ratio) */}
      {mediaAttachments.length > 0 && (
        <div
          className={`relative w-full ${aspectRatioClass} max-h-[640px] bg-slate-950 overflow-hidden select-none`}
          onPointerDown={handleMediaPointerDown}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
        >
          {/* Active Media Rendering */}
          {isVideoMedia ? (
            <div className="relative w-full h-full flex items-center justify-center bg-black">
              <video
                ref={videoRef}
                src={activeMedia.url}
                poster={activeMedia.previewUrl}
                playsInline
                loop
                muted={isVideoMuted}
                className="w-full h-full object-cover"
              />

              {/* Video Controls Bar Overlay */}
              <div
                className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent p-3 flex items-center justify-between text-white z-20 pointer-events-auto"
                onClick={e => e.stopPropagation()}
              >
                {/* Thin Playback Progress Bar */}
                <div className="absolute top-0 inset-x-0 h-1 bg-white/20">
                  <div
                    className="h-full bg-blue-500 transition-all duration-100 ease-linear"
                    style={{ width: `${videoProgress}%` }}
                  />
                </div>

                <div className="flex items-center gap-2 mt-1">
                  <button
                    type="button"
                    onClick={handleTogglePlayPause}
                    className="p-1 rounded-md hover:bg-white/20 text-white transition cursor-pointer"
                    aria-label={isVideoPlaying ? 'Pause video' : 'Play video'}
                  >
                    {isVideoPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                  </button>

                  <button
                    type="button"
                    onClick={handleToggleMute}
                    className="p-1 rounded-md hover:bg-white/20 text-white transition cursor-pointer"
                    aria-label={isVideoMuted ? 'Unmute video' : 'Mute video'}
                  >
                    {isVideoMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                  </button>
                </div>

                <div className="flex items-center gap-2 mt-1">
                  {/* Dedicated 9:16 Shorts viewer button if onOpenVerticalVideo available */}
                  {onOpenVerticalVideo && (
                    <button
                      type="button"
                      onClick={() => onOpenVerticalVideo(post.id)}
                      className="inline-flex items-center gap-1 text-[10px] font-bold bg-white/20 hover:bg-white/30 px-2 py-0.5 rounded-md transition text-white"
                      title="Open full-screen legal shorts experience"
                    >
                      <Smartphone className="w-3 h-3" />
                      <span>9:16 View</span>
                    </button>
                  )}

                  <button
                    type="button"
                    onClick={handleFullscreen}
                    className="p-1 rounded-md hover:bg-white/20 text-white transition cursor-pointer"
                    aria-label="Fullscreen"
                  >
                    <Maximize2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Play/Pause Center Indicator on Toggle */}
              {showPlayOverlay && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/30 pointer-events-none z-10">
                  <div className="w-14 h-14 rounded-full bg-black/60 text-white flex items-center justify-center">
                    {isVideoPlaying ? (
                      <Play className="w-6 h-6 ml-0.5" />
                    ) : (
                      <Pause className="w-6 h-6" />
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <img
              src={activeMedia.url}
              alt={post.content.substring(0, 40) || 'Legal discussion post'}
              loading="lazy"
              className="w-full h-full object-cover"
            />
          )}

          {/* Double-Tap Heart Pop Animation */}
          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="animate-heart-pop">
                <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
              </div>
            </div>
          )}

          {/* Multi-Image Carousel Controls */}
          {mediaAttachments.length > 1 && (
            <>
              {/* Carousel Position Badge (e.g. "1/4") */}
              <div className="absolute top-3 right-3 bg-black/60 backdrop-blur-xs text-white text-2xs font-bold px-2 py-0.5 rounded-full z-20 pointer-events-none">
                {carouselIndex + 1}/{mediaAttachments.length}
              </div>

              {/* Left Navigation Arrow */}
              {carouselIndex > 0 && (
                <button
                  type="button"
                  onClick={handlePrevCarousel}
                  className="absolute left-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition z-20 cursor-pointer shadow-md"
                  aria-label="Previous attachment"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              )}

              {/* Right Navigation Arrow */}
              {carouselIndex < mediaAttachments.length - 1 && (
                <button
                  type="button"
                  onClick={handleNextCarousel}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 w-7 h-7 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center transition z-20 cursor-pointer shadow-md"
                  aria-label="Next attachment"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}

              {/* Synchronized Pagination Dots */}
              <div className="absolute bottom-3 inset-x-0 flex items-center justify-center gap-1.5 z-20 pointer-events-none">
                {mediaAttachments.map((_, dotIdx) => (
                  <div
                    key={dotIdx}
                    className={`h-1.5 rounded-full transition-all duration-150 ${
                      dotIdx === carouselIndex
                        ? 'w-4 bg-blue-500'
                        : 'w-1.5 bg-white/60'
                    }`}
                  />
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {/* Action Row: Like, Comment, Send/Share, Bookmark */}
      <div className="px-3 sm:px-4 pt-3 flex items-center justify-between text-slate-800">
        <div className="flex items-center gap-4">
          {/* Like */}
          <button
            type="button"
            onClick={handleLike}
            className={`transition group focus:outline-none cursor-pointer ${
              isLiked ? 'text-rose-600' : 'text-slate-700 hover:text-rose-600'
            }`}
            aria-label={isLiked ? 'Unlike post' : 'Like post'}
          >
            <Heart
              className={`w-6 h-6 group-hover:scale-110 transition-transform ${
                isLiked ? 'fill-rose-600 text-rose-600' : ''
              }`}
            />
          </button>

          {/* Comment */}
          <button
            type="button"
            onClick={() => setSelectedPostForThread(post)}
            className="text-slate-700 hover:text-blue-700 transition group focus:outline-none cursor-pointer"
            aria-label="Comment on post"
          >
            <MessageCircle className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Repost */}
          <button
            type="button"
            onClick={handleRepost}
            className={`transition group focus:outline-none cursor-pointer ${
              isReposted ? 'text-emerald-600 font-bold' : 'text-slate-700 hover:text-emerald-600'
            }`}
            aria-label="Repost"
          >
            <Repeat2 className="w-6 h-6 group-hover:scale-110 transition-transform" />
          </button>

          {/* Quote */}
          <button
            type="button"
            onClick={() => {
              if (!currentUser) return openLoginModal();
              setQuoteTargetPost(post);
            }}
            className="text-slate-700 hover:text-indigo-600 transition focus:outline-none cursor-pointer"
            title="Quote post"
          >
            <Scale className="w-5.5 h-5.5" />
          </button>

          {/* Share */}
          <button
            type="button"
            onClick={handleCopyLink}
            className="text-slate-700 hover:text-slate-900 transition focus:outline-none cursor-pointer"
            aria-label="Share post"
          >
            {copiedLink ? <Check className="w-5.5 h-5.5 text-emerald-600" /> : <Share2 className="w-5.5 h-5.5" />}
          </button>
        </div>

        {/* Bookmark */}
        <button
          type="button"
          onClick={handleBookmark}
          className={`transition focus:outline-none cursor-pointer ${
            isBookmarked ? 'text-blue-700' : 'text-slate-700 hover:text-blue-700'
          }`}
          aria-label={isBookmarked ? 'Remove bookmark' : 'Bookmark post'}
        >
          <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-blue-700 text-blue-700' : ''}`} />
        </button>
      </div>

      {/* Engagement & Caption Section */}
      <div className="px-3 sm:px-4 pt-2 pb-3 space-y-1.5 text-xs text-slate-800">
        {/* Liked By String */}
        {getLikedByString() && (
          <p className="font-extrabold text-slate-900 leading-tight">
            {getLikedByString()}
          </p>
        )}

        {/* Legal Topic Tag */}
        {post.legalTopic && (
          <div className="pt-0.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-100 px-2 py-0.5 rounded-md">
              ⚖️ {post.legalTopic}
            </span>
          </div>
        )}

        {/* Caption with Author Username */}
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
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                className="px-3 py-1 text-xs font-bold bg-blue-700 text-white rounded-lg hover:bg-blue-800"
              >
                Save Changes
              </button>
            </div>
          </div>
        ) : (
          <div className="feed-content">
            <button
              type="button"
              onClick={() => navigateToProfile(author.id)}
              className="feed-username hover:underline mr-1.5"
            >
              {author.username}
            </button>
            <span className="text-slate-800 whitespace-pre-line">
              {isLongCaption && !isCaptionExpanded
                ? `${post.content.substring(0, 150)}...`
                : post.content}
            </span>
            {isLongCaption && (
              <button
                type="button"
                onClick={() => setIsCaptionExpanded(!isCaptionExpanded)}
                className="text-slate-500 hover:text-slate-800 font-semibold ml-1.5 focus:outline-none cursor-pointer"
              >
                {isCaptionExpanded ? 'less' : 'more'}
              </button>
            )}
          </div>
        )}

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="flex flex-wrap gap-1.5 pt-0.5">
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

        {/* Document Attachments */}
        {documentAttachments.length > 0 && (
          <div className="space-y-1.5 pt-1">
            {documentAttachments.map((att, i) => (
              <div
                key={i}
                onClick={() => setActiveDocumentAttachment(att)}
                className="border border-slate-200 rounded-xl p-2.5 bg-slate-50/70 hover:bg-blue-50/50 hover:border-blue-300 transition flex items-center justify-between cursor-pointer"
              >
                <div className="flex items-center gap-2 min-w-0">
                  <div className="w-7 h-7 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center shrink-0">
                    <FileText className="w-3.5 h-3.5" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {att.name}
                    </p>
                    <p className="text-[10px] text-slate-500">
                      {att.fileSize || 'Statute Record'} • Click to inspect official Rwandan citation
                    </p>
                  </div>
                </div>
                <Download className="w-3.5 h-3.5 text-blue-700 shrink-0" />
              </div>
            ))}
          </div>
        )}

        {/* Quoted Post Card */}
        {post.quotedPost && (() => {
          const quotedAuthor = users.find(u => u.id === post.quotedPost?.authorId);
          return (
            <div className="mt-2 border border-slate-200 rounded-xl p-3 bg-slate-50/70">
              <div className="flex items-center gap-1.5 mb-1">
                <span className="text-xs font-bold text-slate-900">
                  {quotedAuthor?.name || 'Legal Discussion Post'}
                </span>
                {quotedAuthor && <VerificationBadge user={quotedAuthor} size="sm" />}
                <span className="text-2xs text-slate-400">
                  {quotedAuthor ? `@${quotedAuthor.username}` : ''} • Quoted
                </span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed line-clamp-3">
                {post.quotedPost.content}
              </p>
            </div>
          );
        })()}

        {/* View All Comments Link */}
        {post.repliesCount > (localReplies.length || 0) && (
          <button
            type="button"
            onClick={() => setSelectedPostForThread(post)}
            className="text-2xs text-slate-500 hover:text-slate-800 font-semibold block pt-1 focus:outline-none cursor-pointer"
          >
            View all {post.repliesCount} comments
          </button>
        )}

        {/* Preview of up to 2 real comments */}
        {localReplies.length > 0 && (
          <div className="space-y-1 pt-1 border-t border-slate-100">
            {localReplies.slice(-2).map(rep => {
              const repAuthor = users.find(u => u.id === rep.authorId);
              return (
                <div key={rep.id} className="text-xs leading-snug">
                  <span className="font-bold text-slate-900 mr-1.5">
                    {repAuthor ? repAuthor.username : 'advocate_member'}
                  </span>
                  <span className="text-slate-700">{rep.content}</span>
                </div>
              );
            })}
          </div>
        )}

        {/* Inline "Add a comment..." composer */}
        <form
          onSubmit={handleInlineCommentSubmit}
          className="flex items-center gap-2 pt-2 border-t border-slate-100 mt-2"
        >
          <input
            type="text"
            value={inlineComment}
            onChange={e => setInlineComment(e.target.value)}
            placeholder="Add a comment..."
            className="flex-1 text-xs text-slate-800 placeholder:text-slate-400 focus:outline-none bg-transparent"
          />
          {inlineComment.trim() && (
            <button
              type="submit"
              disabled={isSubmittingComment}
              className="text-xs font-bold text-blue-700 hover:text-blue-900 focus:outline-none transition cursor-pointer"
            >
              Post
            </button>
          )}
        </form>
      </div>

      {/* Legal Document Lightbox */}
      {activeDocumentAttachment && (
        <LegalDocumentLightbox
          attachment={activeDocumentAttachment}
          author={author}
          onClose={() => setActiveDocumentAttachment(null)}
        />
      )}

      {/* Service Consultation Booking Modal */}
      {isBookingModalOpen && authorService && (
        <ServiceBookingModal
          service={authorService}
          onClose={() => setIsBookingModalOpen(false)}
        />
      )}
    </article>
  );
};
