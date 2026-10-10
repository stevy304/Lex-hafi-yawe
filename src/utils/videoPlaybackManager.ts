/**
 * Centralized Feed Video Playback Controller
 * Manages IntersectionObserver-based autoplay, mutual exclusivity (only 1 video plays),
 * visibilitychange pausing, and session-wide sound preferences.
 */

type VideoCallback = (isPlaying: boolean, isMuted: boolean) => void;

interface RegisteredVideo {
  id: string;
  element: HTMLVideoElement;
  intersectionRatio: number;
  callback: VideoCallback;
}

class VideoPlaybackManager {
  private videos: Map<string, RegisteredVideo> = new Map();
  private activeVideoId: string | null = null;
  private observer: IntersectionObserver | null = null;
  private isMuted: boolean = true;
  private prefersReducedData: boolean = false;

  constructor() {
    if (typeof window !== 'undefined') {
      // Check session storage for sound preference
      const storedMute = sessionStorage.getItem('lex_feed_sound_muted');
      this.isMuted = storedMute !== null ? storedMute === 'true' : true;

      // Check reduced data preference (Save-Data header / connection)
      const nav = navigator as any;
      if (nav.connection?.saveData) {
        this.prefersReducedData = true;
      }

      // Initialize single intersection observer
      this.initObserver();

      // Pause playback on page hide
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAll();
        } else {
          this.evaluatePlayback();
        }
      });
    }
  }

  private initObserver() {
    if (typeof window === 'undefined') return;

    this.observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const videoId = (entry.target as HTMLElement).dataset.videoId;
          if (videoId && this.videos.has(videoId)) {
            const reg = this.videos.get(videoId)!;
            reg.intersectionRatio = entry.intersectionRatio;
          }
        }
        this.evaluatePlayback();
      },
      {
        threshold: [0, 0.25, 0.5, 0.6, 0.75, 1.0],
        rootMargin: '0px'
      }
    );
  }

  public register(id: string, element: HTMLVideoElement, callback: VideoCallback) {
    element.dataset.videoId = id;
    element.muted = this.isMuted;
    element.playsInline = true;

    const registered: RegisteredVideo = {
      id,
      element,
      intersectionRatio: 0,
      callback
    };

    this.videos.set(id, registered);
    this.observer?.observe(element);
    callback(false, this.isMuted);
  }

  public unregister(id: string) {
    const registered = this.videos.get(id);
    if (registered) {
      if (this.activeVideoId === id) {
        this.pauseVideo(registered);
        this.activeVideoId = null;
      }
      this.observer?.unobserve(registered.element);
      this.videos.delete(id);
    }
  }

  public evaluatePlayback() {
    if (document.hidden || this.prefersReducedData) {
      this.pauseAll();
      return;
    }

    // Find the eligible video with the highest intersection ratio >= 0.6 (60%)
    let bestCandidate: RegisteredVideo | null = null;
    let highestRatio = 0.59; // Minimum threshold 60%

    for (const video of this.videos.values()) {
      if (video.intersectionRatio >= 0.6 && video.intersectionRatio > highestRatio) {
        bestCandidate = video;
        highestRatio = video.intersectionRatio;
      }
    }

    if (bestCandidate) {
      if (this.activeVideoId !== bestCandidate.id) {
        // Pause any previously active video
        if (this.activeVideoId && this.videos.has(this.activeVideoId)) {
          this.pauseVideo(this.videos.get(this.activeVideoId)!);
        }
        this.playVideo(bestCandidate);
        this.activeVideoId = bestCandidate.id;
      }
    } else {
      // No video meets 60% threshold
      if (this.activeVideoId && this.videos.has(this.activeVideoId)) {
        this.pauseVideo(this.videos.get(this.activeVideoId)!);
        this.activeVideoId = null;
      }
    }
  }

  private playVideo(reg: RegisteredVideo) {
    reg.element.muted = this.isMuted;
    const playPromise = reg.element.play();
    if (playPromise !== undefined) {
      playPromise
        .then(() => {
          reg.callback(true, this.isMuted);
        })
        .catch((err) => {
          // Autoplay policy restriction or aborted
          if (err.name === 'NotAllowedError') {
            // Fallback: force muted if unmuted autoplay failed
            reg.element.muted = true;
            this.isMuted = true;
            reg.element.play().catch(() => {});
          }
          reg.callback(!reg.element.paused, reg.element.muted);
        });
    }
  }

  private pauseVideo(reg: RegisteredVideo) {
    if (!reg.element.paused) {
      reg.element.pause();
    }
    reg.callback(false, this.isMuted);
  }

  public pauseAll() {
    for (const video of this.videos.values()) {
      this.pauseVideo(video);
    }
    this.activeVideoId = null;
  }

  public togglePlay(id: string) {
    const target = this.videos.get(id);
    if (!target) return;

    if (target.element.paused) {
      // Pause others
      for (const [otherId, other] of this.videos.entries()) {
        if (otherId !== id) {
          this.pauseVideo(other);
        }
      }
      this.playVideo(target);
      this.activeVideoId = id;
    } else {
      this.pauseVideo(target);
      if (this.activeVideoId === id) {
        this.activeVideoId = null;
      }
    }
  }

  public getGlobalMuted(): boolean {
    return this.isMuted;
  }

  public setGlobalMuted(muted: boolean) {
    this.isMuted = muted;
    try {
      sessionStorage.setItem('lex_feed_sound_muted', muted ? 'true' : 'false');
    } catch {}

    // Apply to all registered videos
    for (const video of this.videos.values()) {
      video.element.muted = muted;
      video.callback(!video.element.paused, muted);
    }
  }

  public toggleGlobalMute(): boolean {
    this.setGlobalMuted(!this.isMuted);
    return this.isMuted;
  }
}

export const videoManager = new VideoPlaybackManager();
