/**
 * Media Utilities for Lex Hafi Yawe
 * Poster frame extraction, dimension probing, and file validation.
 */

export interface VideoMetadata {
  duration: number;
  width: number;
  height: number;
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
  posterDataUrl: string;
}

export const MAX_VIDEO_SIZE_BYTES = 50 * 1024 * 1024; // 50 MB
export const MAX_IMAGE_SIZE_BYTES = 15 * 1024 * 1024; // 15 MB
export const MAX_VIDEO_DURATION_SECONDS = 120; // 2 minutes for feed video
export const MAX_STORY_DURATION_SECONDS = 15; // 15 seconds for story

export function formatBytes(bytes: number, decimals: number = 1): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

export function determineAspectRatio(width: number, height: number): '1:1' | '4:5' | '16:9' | '9:16' {
  const ratio = width / height;
  if (ratio > 1.4) return '16:9';
  if (ratio < 0.65) return '9:16';
  if (ratio < 0.9) return '4:5';
  return '1:1';
}

/**
 * Extracts poster frame from a video file at ~0.5s (or start for very short videos)
 */
export async function extractVideoPoster(file: File): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.muted = true;
    video.playsInline = true;

    const objectUrl = URL.createObjectURL(file);
    video.src = objectUrl;

    const cleanup = () => {
      URL.revokeObjectURL(objectUrl);
      video.remove();
    };

    video.onerror = () => {
      cleanup();
      reject(new Error('Failed to load video file for metadata extraction.'));
    };

    video.onloadedmetadata = () => {
      const duration = video.duration || 0;
      const width = video.videoWidth || 640;
      const height = video.videoHeight || 360;
      const aspectRatio = determineAspectRatio(width, height);

      // Seek to target ~0.5s or duration / 2 for short videos
      const seekTime = Math.min(0.5, Math.max(0.1, duration / 2));
      video.currentTime = seekTime;

      video.onseeked = () => {
        try {
          const canvas = document.createElement('canvas');
          canvas.width = Math.min(width, 1080);
          canvas.height = Math.round((canvas.width / width) * height);

          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
            const posterDataUrl = canvas.toDataURL('image/jpeg', 0.85);
            cleanup();
            resolve({
              duration,
              width,
              height,
              aspectRatio,
              posterDataUrl
            });
          } else {
            cleanup();
            resolve({
              duration,
              width,
              height,
              aspectRatio,
              posterDataUrl: ''
            });
          }
        } catch (err) {
          cleanup();
          // Fallback if canvas draw fails (e.g. cross-origin/codec)
          resolve({
            duration,
            width,
            height,
            aspectRatio,
            posterDataUrl: ''
          });
        }
      };
    };
  });
}

/**
 * Probes image dimensions and aspect ratio
 */
export async function probeImageDimensions(file: File): Promise<{
  width: number;
  height: number;
  aspectRatio: '1:1' | '4:5' | '16:9' | '9:16';
}> {
  return new Promise((resolve) => {
    const img = new Image();
    const objectUrl = URL.createObjectURL(file);
    img.src = objectUrl;

    img.onload = () => {
      URL.revokeObjectURL(objectUrl);
      const width = img.naturalWidth || 800;
      const height = img.naturalHeight || 800;
      resolve({
        width,
        height,
        aspectRatio: determineAspectRatio(width, height)
      });
    };

    img.onerror = () => {
      URL.revokeObjectURL(objectUrl);
      resolve({
        width: 800,
        height: 800,
        aspectRatio: '1:1'
      });
    };
  });
}
