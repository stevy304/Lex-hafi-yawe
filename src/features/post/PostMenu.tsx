import React, { useState, useRef, useEffect } from 'react';
import { MoreHorizontal, Link as LinkIcon, EyeOff, VolumeX, Ban, Flag, Trash2 } from 'lucide-react';

interface PostMenuProps {
  postId: string;
  authorHandle: string;
  topic?: string;
  isOwnPost: boolean;
  isForYouTab?: boolean;
  onCopyLink: () => void;
  onNotInterested?: () => void;
  onMuteAuthor?: () => void;
  onBlockAuthor?: () => void;
  onReportClick: () => void;
  onDeleteClick?: () => void;
}

export const PostMenu: React.FC<PostMenuProps> = ({
  postId,
  authorHandle,
  topic,
  isOwnPost,
  isForYouTab = false,
  onCopyLink,
  onNotInterested,
  onMuteAuthor,
  onBlockAuthor,
  onReportClick,
  onDeleteClick,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false);
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen]);

  return (
    <div ref={menuRef} className="relative inline-block text-left">
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={isOpen}
        aria-label="More post options"
        onClick={(e) => {
          e.stopPropagation();
          setIsOpen((prev) => !prev);
        }}
        className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
      >
        <MoreHorizontal className="w-4 h-4" />
      </button>

      {isOpen && (
        <div
          role="menu"
          onClick={(e) => e.stopPropagation()}
          className="absolute right-0 top-full mt-1 w-56 rounded-xl bg-[var(--surface)] border border-[var(--border)] shadow-xl z-40 py-1.5 text-[13px] animate-in fade-in duration-100"
        >
          {/* Copy link */}
          <button
            type="button"
            role="menuitem"
            onClick={() => {
              onCopyLink();
              setIsOpen(false);
            }}
            className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer"
          >
            <LinkIcon className="w-4 h-4 text-[var(--muted)]" />
            <span>Copy link</span>
          </button>

          {/* Not interested (For you tab only) */}
          {isForYouTab && topic && onNotInterested && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onNotInterested();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer"
            >
              <EyeOff className="w-4 h-4 text-[var(--muted)]" />
              <span>Not interested in {topic}</span>
            </button>
          )}

          {!isOwnPost && onMuteAuthor && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onMuteAuthor();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer"
            >
              <VolumeX className="w-4 h-4 text-[var(--muted)]" />
              <span>Mute @{authorHandle}</span>
            </button>
          )}

          {!isOwnPost && onBlockAuthor && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onBlockAuthor();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[var(--text)] hover:bg-[var(--hover)] cursor-pointer"
            >
              <Ban className="w-4 h-4 text-[var(--muted)]" />
              <span>Block @{authorHandle}</span>
            </button>
          )}

          {!isOwnPost && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onReportClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[var(--danger)] hover:bg-[var(--hover)] cursor-pointer"
            >
              <Flag className="w-4 h-4" />
              <span>Report post</span>
            </button>
          )}

          {isOwnPost && onDeleteClick && (
            <button
              type="button"
              role="menuitem"
              onClick={() => {
                onDeleteClick();
                setIsOpen(false);
              }}
              className="w-full flex items-center gap-2.5 px-3.5 py-2 text-left text-[var(--danger)] hover:bg-[var(--hover)] cursor-pointer font-medium"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete post</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
