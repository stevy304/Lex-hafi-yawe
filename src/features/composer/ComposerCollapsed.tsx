import React from 'react';
import { Image as ImageIcon, FileText, BookOpen, Shield } from 'lucide-react';
import { User } from '../../types';

interface ComposerCollapsedProps {
  currentUser: User | null;
  onExpand: () => void;
  placeholder?: string;
  noticeText?: string;
  postButtonLabel?: string;
}

export const ComposerCollapsed: React.FC<ComposerCollapsedProps> = ({
  currentUser,
  onExpand,
  placeholder = 'Share an update or ask a question',
  noticeText = 'Never post client files, citizen IDs, or confidential trial details.',
  postButtonLabel = 'Post',
}) => {
  return (
    <div
      onClick={onExpand}
      className="w-full border-b border-[var(--border)] px-4 py-3 cursor-pointer select-none bg-[var(--bg)] hover:bg-[var(--hover)] transition-colors"
    >
      {/* 56px high row */}
      <div className="flex items-center gap-3 h-[56px]">
        {/* 40px Avatar */}
        <div className="w-10 h-10 rounded-full shrink-0 overflow-hidden bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center font-bold text-xs text-[var(--text)]">
          {currentUser?.avatar ? (
            <img src={currentUser.avatar} alt={currentUser.name} className="w-full h-full object-cover" />
          ) : (
            <span>{currentUser?.name?.slice(0, 2).toUpperCase() || 'LX'}</span>
          )}
        </div>

        {/* Pill input */}
        <div className="flex-1 h-[40px] px-4 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center text-[14px] text-[var(--muted)]">
          {placeholder}
        </div>

        {/* Quick action buttons (Photo, Document, Cite law) */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            title="Add photo"
            aria-label="Add photo"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
          >
            <ImageIcon className="w-5 h-5" />
          </button>
          <button
            type="button"
            title="Attach document"
            aria-label="Attach document"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
          >
            <FileText className="w-5 h-5" />
          </button>
          <button
            type="button"
            title="Cite Rwanda law"
            aria-label="Cite Rwanda law"
            onClick={(e) => {
              e.stopPropagation();
              onExpand();
            }}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
          >
            <BookOpen className="w-5 h-5 text-[var(--gold)]" />
          </button>
        </div>

        {/* Disabled Post pill */}
        <button
          type="button"
          disabled
          className="h-[36px] px-4 rounded-full bg-[var(--border)] text-[var(--muted)] text-[14px] font-medium cursor-not-allowed shrink-0"
        >
          {postButtonLabel}
        </button>
      </div>

      {/* 20px quiet notice line */}
      <div className="flex items-center gap-1.5 text-[12px] text-[var(--muted)] mt-1 px-1">
        <Shield className="w-3.5 h-3.5 text-[var(--muted)] shrink-0" />
        <span className="truncate">{noticeText}</span>
      </div>
    </div>
  );
};
