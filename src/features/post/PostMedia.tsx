import React, { useState } from 'react';
import { Lightbox } from './Lightbox';

interface MediaItem {
  url: string;
  alt?: string;
  aspectRatio?: string;
}

interface PostMediaProps {
  media: MediaItem[];
}

export const PostMedia: React.FC<PostMediaProps> = ({ media }) => {
  const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);

  if (!media || media.length === 0) return null;

  const count = media.length;

  return (
    <>
      <div className="mt-2.5 rounded-[12px] overflow-hidden">
        {/* 1 image: keeps ratio, max height 420, radius 12 */}
        {count === 1 && (
          <div
            onClick={(e) => {
              e.stopPropagation();
              setLightboxIndex(0);
            }}
            className="w-full max-h-[420px] overflow-hidden rounded-[12px] bg-[var(--surface)] cursor-pointer"
          >
            <img
              src={media[0].url}
              alt={media[0].alt || 'Post image'}
              loading="lazy"
              decoding="async"
              className="w-full h-auto max-h-[420px] object-cover hover:opacity-95 transition-opacity"
            />
          </div>
        )}

        {/* 2 images: two columns, 240px high, 2px gap */}
        {count === 2 && (
          <div className="grid grid-cols-2 gap-[2px] h-[240px] rounded-[12px] overflow-hidden bg-[var(--surface)]">
            {media.slice(0, 2).map((item, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(idx);
                }}
                className="h-full overflow-hidden cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.alt || `Post image ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                />
              </div>
            ))}
          </div>
        )}

        {/* 3 images: one tall left, two stacked right */}
        {count === 3 && (
          <div className="grid grid-cols-2 gap-[2px] h-[280px] rounded-[12px] overflow-hidden bg-[var(--surface)]">
            <div
              onClick={(e) => {
                e.stopPropagation();
                setLightboxIndex(0);
              }}
              className="h-full overflow-hidden cursor-pointer"
            >
              <img
                src={media[0].url}
                alt={media[0].alt || 'Post image 1'}
                loading="lazy"
                decoding="async"
                className="w-full h-full object-cover hover:opacity-95 transition-opacity"
              />
            </div>
            <div className="grid grid-rows-2 gap-[2px] h-full overflow-hidden">
              {media.slice(1, 3).map((item, idx) => (
                <div
                  key={idx}
                  onClick={(e) => {
                    e.stopPropagation();
                    setLightboxIndex(idx + 1);
                  }}
                  className="h-full overflow-hidden cursor-pointer"
                >
                  <img
                    src={item.url}
                    alt={item.alt || `Post image ${idx + 2}`}
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 4 or more images: 2x2 grid */}
        {count >= 4 && (
          <div className="grid grid-cols-2 gap-[2px] h-[280px] rounded-[12px] overflow-hidden bg-[var(--surface)]">
            {media.slice(0, 4).map((item, idx) => (
              <div
                key={idx}
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIndex(idx);
                }}
                className="h-full overflow-hidden cursor-pointer"
              >
                <img
                  src={item.url}
                  alt={item.alt || `Post image ${idx + 1}`}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover hover:opacity-95 transition-opacity"
                />
              </div>
            ))}
          </div>
        )}
      </div>

      <Lightbox
        images={media}
        initialIndex={lightboxIndex ?? 0}
        isOpen={lightboxIndex !== null}
        onClose={() => setLightboxIndex(null)}
      />
    </>
  );
};
