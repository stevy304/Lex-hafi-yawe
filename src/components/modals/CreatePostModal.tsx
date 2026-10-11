import React, { useEffect } from 'react';
import { X, Feather } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostComposer } from '../feed/PostComposer';
import { useBreakpoint } from '../../hooks/useBreakpoint';

export const CreatePostModal: React.FC = () => {
  const { isCreatePostModalOpen, setIsCreatePostModalOpen } = useApp();
  const { isMobile } = useBreakpoint();

  useEffect(() => {
    if (!isCreatePostModalOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsCreatePostModalOpen(false);
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [isCreatePostModalOpen, setIsCreatePostModalOpen]);

  if (!isCreatePostModalOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label="Create post"
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs select-none"
    >
      <div
        className={`relative w-full max-w-xl bg-[var(--surface)] border border-[var(--border)] shadow-2xl overflow-hidden flex flex-col transition-all duration-200 ${
          isMobile
            ? 'rounded-t-2xl max-h-[calc(100dvh-var(--safe-top))] pb-[var(--safe-bottom)]'
            : 'rounded-2xl max-h-[85vh]'
        }`}
        style={{
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        }}
      >
        {/* Mobile drag bar indicator */}
        {isMobile && (
          <div className="w-full flex justify-center pt-2 pb-1">
            <div className="w-10 h-1 rounded-full bg-[var(--border)]" />
          </div>
        )}

        {/* Modal Header */}
        <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between bg-[var(--surface)] shrink-0">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-[var(--accent)]/15 flex items-center justify-center text-[var(--accent)]">
              <Feather className="w-4 h-4" />
            </div>
            <h2 className="text-[16px] font-semibold text-[var(--text)]">
              Create post
            </h2>
          </div>
          <button
            type="button"
            onClick={() => setIsCreatePostModalOpen(false)}
            aria-label="Close"
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] active:bg-[var(--hover)] transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Composer Content */}
        <div className="p-4 overflow-y-auto flex-1 min-h-0">
          <PostComposer
            isModal={true}
            onPostCreated={() => setIsCreatePostModalOpen(false)}
          />
        </div>
      </div>
    </div>
  );
};
