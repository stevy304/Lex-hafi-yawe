import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  Heart,
  MessageCircle,
  Share2,
  Bookmark,
  ChevronUp,
  ChevronDown,
  Calendar,
  Check,
  Scale
} from 'lucide-react';
import { Post, User } from '../../types';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { videoManager } from '../../utils/videoPlaybackManager';

interface VerticalVideoViewerModalProps {
  posts: Post[];
  initialPostId: string;
  onClose: () => void;
}

export const VerticalVideoViewerModal: React.FC<VerticalVideoViewerModalProps> = ({
  posts,
  initialPostId,
  onClose
}) => {
  const {
    currentUser,
    users,
    legalServices,
    toggleLikePost,
    toggleBookmarkPost,
    openLoginModal,
    navigateToProfile,
    setSelectedPostForThread,
    setActiveView
  } = useApp();

  // Filter only posts with video attachments
  const videoPosts = posts.filter(p =>
    p.attachments?.some(a => a.type === 'video')
  );

  const initialIndex = Math.max(
    0,
    videoPosts.findIndex(p => p.id === initialPostId)
  );
  const [currentIndex, setCurrentIndex] = useState(initialIndex >= 0 ? initialIndex : 0);
  const [isMuted, setIsMuted] = useState(videoManager.getGlobalMuted());
  const [isPlaying, setIsPlaying] = useState(true);
  const [showHeartPop, setShowHeartPop] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const currentPost = videoPosts[currentIndex];

  const author = users.find(u => u.id === currentPost?.authorId);
  const isLiked = currentUser && currentPost ? currentPost.likedBy.includes(currentUser.id) : false;
  const isBookmarked = currentUser && currentPost ? currentPost.bookmarkedBy.includes(currentUser.id) : false;

  // Check if author has an active bookable service
  const authorService = legalServices.find(s => s.providerId === author?.id);
  const canBookConsultation =
    author &&
    (author.role === 'advocate' || author.verificationType === 'bar_member') &&
    !!authorService;

  const videoAttachment = currentPost?.attachments?.find(a => a.type === 'video');

  const goToNextVideo = useCallback(() => {
    if (currentIndex < videoPosts.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setIsPlaying(true);
    }
  }, [currentIndex, videoPosts.length]);

  const goToPrevVideo = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setIsPlaying(true);
    }
  }, [currentIndex]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowDown') goToNextVideo();
      if (e.key === 'ArrowUp') goToPrevVideo();
      if (e.key === ' ') {
        e.preventDefault();
        togglePlayPause();
      }
      if (e.key.toLowerCase() === 'm') {
        toggleMute();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToNextVideo, goToPrevVideo]);

  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().catch(() => {});
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    videoManager.setGlobalMuted(nextMuted);
    if (videoRef.current) {
      videoRef.current.muted = nextMuted;
    }
  };

  const handleDoubleTap = () => {
    if (!currentPost) return;
    if (!currentUser) {
      openLoginModal();
      return;
    }
    if (!isLiked) {
      toggleLikePost(currentPost.id);
    }
    setShowHeartPop(true);
    setTimeout(() => setShowHeartPop(false), 900);
  };

  const handleLikeClick = () => {
    if (!currentPost) return;
    if (!currentUser) {
      openLoginModal();
      return;
    }
    toggleLikePost(currentPost.id);
  };

  const handleShare = () => {
    if (!currentPost) return;
    navigator.clipboard?.writeText(`${window.location.origin}/#post-${currentPost.id}`);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  if (!currentPost || !videoAttachment) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none overflow-hidden">
      {/* Background ambient poster */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${videoAttachment.previewUrl || videoAttachment.url})` }}
      />

      {/* Main 9:16 Shorts Canvas */}
      <div className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] bg-slate-950 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between">
        {/* Video Player */}
        <div
          className="absolute inset-0 z-0 bg-black flex items-center justify-center cursor-pointer"
          onClick={togglePlayPause}
          onDoubleClick={handleDoubleTap}
        >
          <video
            ref={videoRef}
            src={videoAttachment.url}
            poster={videoAttachment.previewUrl}
            autoPlay
            loop
            playsInline
            muted={isMuted}
            className="w-full h-full object-cover"
          />

          {/* Heart Pop Animation */}
          {showHeartPop && (
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
              <div className="animate-ping duration-300">
                <Heart className="w-24 h-24 text-rose-500 fill-rose-500 drop-shadow-2xl" />
              </div>
            </div>
          )}

          {/* Paused Overlay Indicator */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/30 z-10 pointer-events-none">
              <div className="w-16 h-16 rounded-full bg-black/60 text-white flex items-center justify-center backdrop-blur-xs">
                <div className="w-0 h-0 border-y-[12px] border-y-transparent border-l-[20px] border-l-white ml-1.5" />
              </div>
            </div>
          )}
        </div>

        {/* Top Vignette Gradient */}
        <div className="absolute top-0 inset-x-0 h-28 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

        {/* Bottom Vignette Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-44 bg-gradient-to-t from-black/95 via-black/60 to-transparent z-10 pointer-events-none" />

        {/* Top Controls */}
        <div className="relative z-20 p-4 flex items-center justify-between text-white">
          <div className="flex items-center gap-2">
            <span className="text-xs font-black tracking-tight text-white flex items-center gap-1.5 bg-black/40 backdrop-blur-xs px-2.5 py-1 rounded-full border border-white/10">
              <Scale className="w-3.5 h-3.5 text-blue-400" />
              <span>Lex Legal Shorts</span>
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={toggleMute}
              className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
              aria-label={isMuted ? 'Unmute video' : 'Mute video'}
            >
              {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
              aria-label="Close vertical video"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Right Action Rail */}
        <div className="absolute right-3.5 bottom-20 z-20 flex flex-col items-center gap-4 text-white">
          {/* Like */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleLikeClick}
              className={`p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs transition cursor-pointer ${
                isLiked ? 'text-rose-500' : 'text-white'
              }`}
              title="Like"
            >
              <Heart className={`w-6 h-6 ${isLiked ? 'fill-rose-500' : ''}`} />
            </button>
            <span className="text-[11px] font-bold drop-shadow-md">
              {currentPost.likesCount || 0}
            </span>
          </div>

          {/* Comments */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => {
                setSelectedPostForThread(currentPost);
                onClose();
              }}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs text-white transition cursor-pointer"
              title="View comments"
            >
              <MessageCircle className="w-6 h-6" />
            </button>
            <span className="text-[11px] font-bold drop-shadow-md">
              {currentPost.repliesCount || 0}
            </span>
          </div>

          {/* Bookmark */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={() => {
                if (!currentUser) return openLoginModal();
                toggleBookmarkPost(currentPost.id);
              }}
              className={`p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs transition cursor-pointer ${
                isBookmarked ? 'text-blue-400' : 'text-white'
              }`}
              title="Bookmark"
            >
              <Bookmark className={`w-6 h-6 ${isBookmarked ? 'fill-blue-400' : ''}`} />
            </button>
          </div>

          {/* Share */}
          <div className="flex flex-col items-center gap-1">
            <button
              type="button"
              onClick={handleShare}
              className="p-2.5 rounded-full bg-black/50 hover:bg-black/70 backdrop-blur-xs text-white transition cursor-pointer"
              title="Share video"
            >
              {copiedLink ? <Check className="w-6 h-6 text-emerald-400" /> : <Share2 className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Bottom Information Overlay */}
        <div className="relative z-20 p-4 max-w-[80%] text-white">
          {/* Creator Pill */}
          {author && (
            <div className="flex items-center gap-2 mb-2">
              <button
                type="button"
                onClick={() => {
                  navigateToProfile(author.id);
                  onClose();
                }}
                className="flex items-center gap-2 focus:outline-none"
              >
                <UserAvatar user={author} size="sm" />
                <div className="flex items-center gap-1">
                  <span className="text-xs font-bold text-white hover:underline drop-shadow-md">
                    {author.name}
                  </span>
                  <VerificationBadge user={author} size="sm" />
                </div>
              </button>
            </div>
          )}

          {/* Caption */}
          <p className="text-xs text-white/95 leading-relaxed drop-shadow-md line-clamp-3 mb-2 font-normal">
            {currentPost.content}
          </p>

          {/* Consultation CTA if verified advocate with active service */}
          {canBookConsultation && (
            <button
              type="button"
              onClick={() => {
                onClose();
                setActiveView('services');
              }}
              className="mt-1 inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg transition"
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Book Consultation</span>
            </button>
          )}
        </div>
      </div>

      {/* External Desktop Arrows for Next/Prev */}
      <div className="hidden md:flex flex-col gap-3 absolute right-6 top-1/2 -translate-y-1/2">
        {currentIndex > 0 && (
          <button
            type="button"
            onClick={goToPrevVideo}
            className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Previous video"
          >
            <ChevronUp className="w-6 h-6" />
          </button>
        )}
        {currentIndex < videoPosts.length - 1 && (
          <button
            type="button"
            onClick={goToNextVideo}
            className="w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white flex items-center justify-center transition cursor-pointer"
            aria-label="Next video"
          >
            <ChevronDown className="w-6 h-6" />
          </button>
        )}
      </div>
    </div>
  );
};
