import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  X,
  Volume2,
  VolumeX,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  Award,
  Eye,
  Trash2,
  Clock,
  ExternalLink
} from 'lucide-react';
import { Story, User } from '../../types';
import { useApp } from '../../context/AppContext';
import { api } from '../../api/client';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';

interface StoryViewerModalProps {
  stories: Story[];
  initialStoryIndex?: number;
  onClose: () => void;
  onStoryDeleted?: (storyId: string) => void;
}

export const StoryViewerModal: React.FC<StoryViewerModalProps> = ({
  stories,
  initialStoryIndex = 0,
  onClose,
  onStoryDeleted
}) => {
  const { currentUser, users, navigateToProfile } = useApp();
  const [currentIndex, setCurrentIndex] = useState(initialStoryIndex);
  const [progress, setProgress] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [viewsCount, setViewsCount] = useState<number>(0);

  const videoRef = useRef<HTMLVideoElement>(null);
  const progressTimerRef = useRef<any>(null);

  const currentStory = stories[currentIndex];
  const author = users.find(u => u.id === currentStory?.authorId);
  const isAuthor = currentUser?.id === currentStory?.authorId;
  const isAdmin = currentUser?.role === 'admin';

  const storyDuration = Math.min(currentStory?.duration || 6, 15); // max 15 seconds

  // Record view on story open
  useEffect(() => {
    if (!currentStory) return;
    setViewsCount(currentStory.viewsCount || 0);

    if (currentUser && !currentStory.viewedBy.includes(currentUser.id)) {
      api.recordStoryView(currentStory.id).then((res) => {
        setViewsCount(res.viewsCount);
        if (!currentStory.viewedBy.includes(currentUser.id)) {
          currentStory.viewedBy.push(currentUser.id);
        }
      }).catch(() => {});
    }
  }, [currentStory?.id, currentUser?.id]);

  const goToNextStory = useCallback(() => {
    if (currentIndex < stories.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setProgress(0);
    } else {
      onClose();
    }
  }, [currentIndex, stories.length, onClose]);

  const goToPrevStory = useCallback(() => {
    if (currentIndex > 0) {
      setCurrentIndex(prev => prev - 1);
      setProgress(0);
    } else {
      setProgress(0);
    }
  }, [currentIndex]);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
      if (e.key === 'ArrowRight') goToNextStory();
      if (e.key === 'ArrowLeft') goToPrevStory();
      if (e.key === ' ') {
        e.preventDefault();
        setIsPaused(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose, goToNextStory, goToPrevStory]);

  // Progress animation ticker
  useEffect(() => {
    if (isPaused || !currentStory) return;

    const intervalMs = 50;
    const step = 100 / ((storyDuration * 1000) / intervalMs);

    progressTimerRef.current = setInterval(() => {
      setProgress(prev => {
        if (prev >= 100) {
          clearInterval(progressTimerRef.current);
          goToNextStory();
          return 0;
        }
        return prev + step;
      });
    }, intervalMs);

    return () => {
      if (progressTimerRef.current) clearInterval(progressTimerRef.current);
    };
  }, [currentIndex, isPaused, storyDuration, goToNextStory, currentStory]);

  // Pause / Resume Video
  useEffect(() => {
    if (videoRef.current) {
      if (isPaused) {
        videoRef.current.pause();
      } else {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [isPaused, currentIndex]);

  const handleDeleteStory = async () => {
    if (!currentStory) return;
    if (confirm('Delete this story?')) {
      try {
        await api.deleteStory(currentStory.id);
        if (onStoryDeleted) onStoryDeleted(currentStory.id);
        if (stories.length > 1) {
          goToNextStory();
        } else {
          onClose();
        }
      } catch (err: any) {
        alert(err.message || 'Failed to delete story');
      }
    }
  };

  if (!currentStory) return null;

  const hoursRemaining = Math.max(
    0,
    Math.round((new Date(currentStory.expiresAt).getTime() - Date.now()) / (1000 * 60 * 60))
  );

  return (
    <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex items-center justify-center select-none overflow-hidden">
      {/* Background ambient blur */}
      <div
        className="absolute inset-0 bg-cover bg-center filter blur-3xl opacity-20 pointer-events-none"
        style={{ backgroundImage: `url(${currentStory.previewUrl || currentStory.mediaUrl})` }}
      />

      {/* Main 9:16 Stories Stage */}
      <div
        className="relative w-full max-w-[420px] h-[92vh] max-h-[820px] bg-slate-900 rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl flex flex-col justify-between"
        onMouseDown={() => setIsPaused(true)}
        onMouseUp={() => setIsPaused(false)}
        onTouchStart={() => setIsPaused(true)}
        onTouchEnd={() => setIsPaused(false)}
      >
        {/* Media Canvas */}
        <div className="absolute inset-0 z-0 bg-black flex items-center justify-center">
          {currentStory.mediaType === 'video' ? (
            <video
              ref={videoRef}
              src={currentStory.mediaUrl}
              poster={currentStory.previewUrl}
              autoPlay
              playsInline
              muted={isMuted}
              className="w-full h-full object-cover"
            />
          ) : (
            <img
              src={currentStory.mediaUrl}
              alt={currentStory.caption || 'Legal Story'}
              className="w-full h-full object-cover"
            />
          )}
        </div>

        {/* Top Vignette Gradient */}
        <div className="absolute top-0 inset-x-0 h-32 bg-gradient-to-b from-black/80 via-black/40 to-transparent z-10 pointer-events-none" />

        {/* Bottom Vignette Gradient */}
        <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-black/90 via-black/50 to-transparent z-10 pointer-events-none" />

        {/* Segmented Top Progress Bars */}
        <div className="relative z-20 pt-3 px-3.5 flex items-center gap-1.5">
          {stories.map((st, i) => (
            <div
              key={st.id}
              className="flex-1 h-1 bg-white/30 rounded-full overflow-hidden"
            >
              <div
                className="h-full bg-white transition-all duration-75 ease-linear rounded-full"
                style={{
                  width:
                    i < currentIndex
                      ? '100%'
                      : i === currentIndex
                      ? `${progress}%`
                      : '0%'
                }}
              />
            </div>
          ))}
        </div>

        {/* Header Bar */}
        <div className="relative z-20 px-3.5 pt-2 flex items-center justify-between text-white">
          <div className="flex items-center gap-2.5 min-w-0">
            {author && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  navigateToProfile(author.id);
                  onClose();
                }}
                className="shrink-0 focus:outline-none"
              >
                <UserAvatar user={author} size="sm" />
              </button>
            )}

            <div className="min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-white truncate drop-shadow-md">
                  {author?.name || 'Verified Member'}
                </span>
                {author && <VerificationBadge user={author} size="sm" />}
              </div>

              {/* Classification Label */}
              <div className="flex items-center gap-2 text-[10px] text-white/80">
                {currentStory.storyType === 'official_bulletin' ? (
                  <span className="inline-flex items-center gap-1 font-bold text-amber-300">
                    <Award className="w-3 h-3 text-amber-400" />
                    <span>Official Gazette Bulletin</span>
                  </span>
                ) : currentStory.storyType === 'advocate_story' ? (
                  <span className="inline-flex items-center gap-1 font-semibold text-blue-300">
                    <ShieldCheck className="w-3 h-3 text-blue-400" />
                    <span>Advocate Legal Brief</span>
                  </span>
                ) : (
                  <span className="font-normal text-white/70">Community Story</span>
                )}
                <span>•</span>
                <span className="flex items-center gap-0.5">
                  <Clock className="w-2.5 h-2.5" />
                  <span>{hoursRemaining}h left</span>
                </span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0" onClick={e => e.stopPropagation()}>
            {currentStory.mediaType === 'video' && (
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
                aria-label={isMuted ? 'Unmute story audio' : 'Mute story audio'}
              >
                {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
              </button>
            )}

            {(isAuthor || isAdmin) && (
              <button
                type="button"
                onClick={handleDeleteStory}
                className="p-1.5 rounded-full bg-black/40 text-red-300 hover:text-red-400 hover:bg-black/60 transition cursor-pointer"
                title="Delete story"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            )}

            <button
              type="button"
              onClick={onClose}
              className="p-1.5 rounded-full bg-black/40 text-white hover:bg-black/60 transition cursor-pointer"
              aria-label="Close story viewer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Tap Navigation Overlays (Left 35% for prev, Right 35% for next) */}
        <div className="absolute inset-y-16 inset-x-0 z-10 flex">
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goToPrevStory();
            }}
            title="Previous story"
          />
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              setIsPaused(prev => !prev);
            }}
          />
          <div
            className="w-1/3 h-full cursor-pointer"
            onClick={(e) => {
              e.stopPropagation();
              goToNextStory();
            }}
            title="Next story"
          />
        </div>

        {/* Bottom Footer Info */}
        <div className="relative z-20 px-4 pb-4 pt-2 text-white">
          {/* Caption */}
          {currentStory.caption && (
            <p className="text-xs sm:text-sm text-white/95 leading-relaxed drop-shadow-md bg-black/30 backdrop-blur-xs p-2.5 rounded-xl border border-white/10 mb-2">
              {currentStory.caption}
            </p>
          )}

          {/* Views count and statutory footnote */}
          <div className="flex items-center justify-between text-2xs text-white/70">
            <div className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5" />
              <span>{viewsCount} {viewsCount === 1 ? 'view' : 'views'}</span>
            </div>

            {currentStory.isOfficialGazetteAlert && (
              <span className="text-amber-300 font-semibold flex items-center gap-1">
                ⚖️ Law of Rwanda Notice
              </span>
            )}
          </div>
        </div>
      </div>

      {/* External Prev/Next arrows for desktop */}
      {currentIndex > 0 && (
        <button
          type="button"
          onClick={goToPrevStory}
          className="hidden md:flex absolute left-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center transition cursor-pointer"
          aria-label="Previous story"
        >
          <ChevronLeft className="w-6 h-6" />
        </button>
      )}

      {currentIndex < stories.length - 1 && (
        <button
          type="button"
          onClick={goToNextStory}
          className="hidden md:flex absolute right-6 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-white/20 hover:bg-white/30 text-white items-center justify-center transition cursor-pointer"
          aria-label="Next story"
        >
          <ChevronRight className="w-6 h-6" />
        </button>
      )}
    </div>
  );
};
