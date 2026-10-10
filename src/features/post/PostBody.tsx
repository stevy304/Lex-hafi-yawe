import React, { useState } from 'react';
import { renderLinkifiedContent } from '../feed/lib/linkify';

interface PostBodyProps {
  postId: string;
  content: string;
  lang?: 'en' | 'rw' | 'fr';
  currentUiLang?: string;
  onNavigate?: (href: string) => void;
}

export const PostBody: React.FC<PostBodyProps> = ({
  postId,
  content,
  lang,
  currentUiLang = 'en',
  onNavigate,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [translatedText, setTranslatedText] = useState<string | null>(null);
  const [isTranslating, setIsTranslating] = useState(false);
  const [showOriginal, setShowOriginal] = useState(false);

  const featureTranslate = import.meta.env.VITE_FEATURE_TRANSLATE === 'true';
  const canTranslate = featureTranslate && lang && lang !== currentUiLang;

  const handleTranslate = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (translatedText) {
      setShowOriginal(false);
      return;
    }

    setIsTranslating(true);
    try {
      const res = await fetch('/api/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ postId, target: currentUiLang }),
      });
      if (res.ok) {
        const data = await res.json();
        setTranslatedText(data.text);
      }
    } catch {}
    setIsTranslating(false);
  };

  const displayText = translatedText && !showOriginal ? translatedText : content;
  const isLong = content.length > 320 || content.split('\n').length > 6;

  return (
    <div className="mt-1 text-[15px] leading-[1.55] text-[var(--text)] select-text">
      <div className={!isExpanded && isLong ? 'line-clamp-6' : ''}>
        {renderLinkifiedContent(displayText, onNavigate)}
      </div>

      {isLong && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setIsExpanded((prev) => !prev);
          }}
          className="text-[13px] text-[var(--accent)] hover:underline font-medium mt-1 cursor-pointer block"
        >
          {isExpanded ? 'Show less' : 'Show more'}
        </button>
      )}

      {canTranslate && (
        <div className="mt-1.5 text-[12px]">
          {isTranslating ? (
            <span className="text-[var(--muted)]">Translating...</span>
          ) : translatedText ? (
            <div className="text-[var(--muted)] flex items-center gap-2">
              <span>Translated from {lang === 'rw' ? 'Kinyarwanda' : lang === 'fr' ? 'French' : 'English'}</span>
              <span>·</span>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowOriginal((prev) => !prev);
                }}
                className="text-[var(--accent)] hover:underline cursor-pointer"
              >
                {showOriginal ? 'Show translation' : 'Show original'}
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={handleTranslate}
              className="text-[var(--accent)] hover:underline cursor-pointer"
            >
              Translate post
            </button>
          )}
        </div>
      )}
    </div>
  );
};
