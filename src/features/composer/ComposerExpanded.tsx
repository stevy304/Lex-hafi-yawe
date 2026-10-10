import React, { useState, useRef, useEffect } from 'react';
import {
  Image as ImageIcon,
  FileText,
  BookOpen,
  AlertTriangle,
  Loader2,
  X,
} from 'lucide-react';
import { User, Post, PostCitation, PostDocumentItem } from '../../types';
import { VisibilityMenu } from './VisibilityMenu';
import { TopicMenu } from './TopicMenu';
import { AttachmentTray, ImageAttachment } from './AttachmentTray';
import { CitationPalette } from './CitationPalette';
import { ConfidentialOverlay } from './ConfidentialOverlay';
import { findConfidentialMatches, evaluateConfidentialRisk } from './confidential';

interface ComposerExpandedProps {
  currentUser: User | null;
  onCollapse: () => void;
  onPostSuccess: (newPost: Post) => void;
  initialTopic?: string;
}

export const ComposerExpanded: React.FC<ComposerExpandedProps> = ({
  currentUser,
  onCollapse,
  onPostSuccess,
  initialTopic = 'General legal',
}) => {
  const [content, setContent] = useState('');
  const [visibility, setVisibility] = useState<'public' | 'followers'>('public');
  const [topic, setTopic] = useState(initialTopic);
  const [images, setImages] = useState<ImageAttachment[]>([]);
  const [documents, setDocuments] = useState<PostDocumentItem[]>([]);
  const [citations, setCitations] = useState<PostCitation[]>([]);

  const [isSending, setIsSending] = useState(false);
  const [allowBypassWarning, setAllowBypassWarning] = useState(false);
  const [isCitationPaletteOpen, setIsCitationPaletteOpen] = useState(false);
  const [showDiscardConfirm, setShowDiscardConfirm] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const docInputRef = useRef<HTMLInputElement>(null);

  const MAX_CHARS = 1000;
  const charsCount = content.length;
  const remainingChars = MAX_CHARS - charsCount;
  const isOverLimit = charsCount > MAX_CHARS;

  // Confidential risk check
  const confidentialMatches = findConfidentialMatches(content);
  const risk = evaluateConfidentialRisk(confidentialMatches);

  const canPost =
    content.trim().length > 0 &&
    !isOverLimit &&
    !isSending &&
    (!risk.blocksPost || allowBypassWarning) &&
    (!risk.hasRisk || allowBypassWarning || risk.blocksPost === false);

  // Focus textarea on mount
  useEffect(() => {
    textareaRef.current?.focus();
  }, []);

  // Auto-grow textarea up to 12 lines
  useEffect(() => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = 'auto';
    const newHeight = Math.min(Math.max(el.scrollHeight, 72), 300);
    el.style.height = `${newHeight}px`;
  }, [content]);

  // Click outside to collapse if empty
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (cardRef.current && !cardRef.current.contains(e.target as Node)) {
        if (!content.trim() && images.length === 0 && documents.length === 0 && citations.length === 0) {
          onCollapse();
        }
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [content, images, documents, citations, onCollapse]);

  // Keyboard shortcut: Esc to collapse or confirm discard
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      if (!content.trim() && images.length === 0 && documents.length === 0 && citations.length === 0) {
        onCollapse();
      } else {
        setShowDiscardConfirm(true);
      }
    } else if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      if (canPost) {
        handleSendPost();
      }
    }
  };

  const handleImagePicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remainingSlots = 4 - images.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      const url = URL.createObjectURL(file);
      setImages((prev) => [...prev, { url, alt: '' }]);
    });
    if (imageInputRef.current) imageInputRef.current.value = '';
  };

  const handleDocPicked = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;
    const remainingSlots = 2 - documents.length;
    const filesToAdd = Array.from(files).slice(0, remainingSlots);

    filesToAdd.forEach((file) => {
      if (file.size > 8 * 1024 * 1024) {
        alert('Document exceeds 8 MB limit.');
        return;
      }
      const newDoc: PostDocumentItem = {
        id: `doc_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
        name: file.name,
        size: file.size,
        url: URL.createObjectURL(file),
      };
      setDocuments((prev) => [...prev, newDoc]);
    });
    if (docInputRef.current) docInputRef.current.value = '';
  };

  const handleSendPost = async () => {
    if (!canPost || isSending) return;
    setIsSending(true);

    try {
      const tags = content.match(/#[a-zA-Z0-9_\u00C0-\u024F]+/g)?.map((t) => t.slice(1)) || [];
      const postPayload = {
        content: content.trim(),
        legalTopic: topic,
        tags,
        audience: visibility,
        citations,
        documents,
        media: images.map((img) => ({ url: img.url, alt: img.alt })),
        lang: 'en' as const,
      };

      const res = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(postPayload),
      });

      if (!res.ok) {
        throw new Error('Failed to create post');
      }

      const created: Post = await res.json();
      onPostSuccess(created);
      onCollapse();
    } catch {
      // Create optimistic mock post if offline or error
      const mockPost: Post = {
        id: `post_local_${Date.now()}`,
        authorId: currentUser?.id || 'usr_citizen',
        content: content.trim(),
        createdAt: new Date().toISOString(),
        legalTopic: topic,
        tags: [],
        audience: visibility,
        likesCount: 0,
        repliesCount: 0,
        repostsCount: 0,
        quotesCount: 0,
        likedBy: [],
        repostedBy: [],
        bookmarkedBy: [],
        citations,
        documents,
        media: images.map((img) => ({ url: img.url, alt: img.alt })),
        lang: 'en',
      };
      onPostSuccess(mockPost);
      onCollapse();
    } finally {
      setIsSending(false);
    }
  };

  const isAdvocate = currentUser?.role === 'advocate';

  return (
    <div
      ref={cardRef}
      onKeyDown={handleKeyDown}
      className="w-full border-b border-[var(--border)] p-4 bg-[var(--surface)] transition-all duration-150 ease-out"
    >
      <div className="border border-[var(--border)] rounded-[12px] p-[14px_16px] bg-[var(--bg)] space-y-3 shadow-xs">
        {/* Row 1: Visibility & Topic popover buttons */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <VisibilityMenu value={visibility} onChange={setVisibility} />
            <TopicMenu value={topic} onChange={setTopic} />
          </div>
          <button
            type="button"
            onClick={() => {
              if (content.trim() || images.length > 0 || citations.length > 0) {
                setShowDiscardConfirm(true);
              } else {
                onCollapse();
              }
            }}
            aria-label="Collapse composer"
            className="w-6 h-6 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Row 2: Textarea with Mirror-Overlay */}
        <div className="relative min-h-[72px]">
          <ConfidentialOverlay text={content} matches={confidentialMatches} />
          <textarea
            ref={textareaRef}
            value={content}
            onChange={(e) => {
              setContent(e.target.value);
              setAllowBypassWarning(false);
            }}
            placeholder="Share an update or ask a question"
            rows={3}
            className="w-full bg-transparent text-[var(--text)] text-[15px] leading-[1.55] resize-none focus:outline-none placeholder:text-[var(--muted)] p-0 border-none"
          />
        </div>

        {/* Row 3: Attachments Tray */}
        <AttachmentTray
          images={images}
          onRemoveImage={(idx) => setImages((prev) => prev.filter((_, i) => i !== idx))}
          onUpdateImageAlt={(idx, alt) =>
            setImages((prev) => prev.map((img, i) => (i === idx ? { ...img, alt } : img)))
          }
          documents={documents}
          onRemoveDocument={(idx) => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
          citations={citations}
          onRemoveCitation={(idx) => setCitations((prev) => prev.filter((_, i) => i !== idx))}
        />

        {/* Row 4: Confidentiality Feedback Banner */}
        {risk.hasRisk && !allowBypassWarning && (
          <div
            role="alert"
            className="flex items-start justify-between gap-2.5 p-2.5 rounded-lg bg-[var(--warn-bg)] border border-[var(--warn-border)] text-[var(--warn-text)] text-[12px]"
          >
            <div className="flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
              <span>
                {risk.primaryType === 'citizen_id' &&
                  'This looks like a citizen ID number. Remove it before posting.'}
                {risk.primaryType === 'phone' &&
                  'This looks like a phone number. Remove it before posting.'}
                {risk.primaryType === 'email' &&
                  'This looks like an email address. Remove it before posting.'}
              </span>
            </div>
            {/* If phone or email, user can choose 'Post anyway' */}
            {!risk.blocksPost && (
              <button
                type="button"
                onClick={() => setAllowBypassWarning(true)}
                className="text-[11px] font-semibold underline shrink-0 cursor-pointer hover:opacity-80"
              >
                Post anyway
              </button>
            )}
          </div>
        )}

        {/* Row 5: Footer toolbar with counter and Post pill */}
        <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
          {/* Toolbar icon buttons */}
          <div className="flex items-center gap-1">
            <button
              type="button"
              disabled={images.length >= 4}
              onClick={() => imageInputRef.current?.click()}
              aria-label="Add photo"
              title="Add photo"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer disabled:opacity-40"
            >
              <ImageIcon className="w-4 h-4" />
            </button>
            <button
              type="button"
              disabled={documents.length >= 2}
              onClick={() => docInputRef.current?.click()}
              aria-label="Attach document"
              title="Attach document"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] transition-colors cursor-pointer disabled:opacity-40"
            >
              <FileText className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => setIsCitationPaletteOpen(true)}
              aria-label="Cite Rwanda law"
              title="Cite Rwanda law"
              className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--gold)] hover:bg-[var(--hover)] transition-colors cursor-pointer"
            >
              <BookOpen className="w-4 h-4" />
            </button>
          </div>

          {/* Hidden file inputs */}
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            multiple
            onChange={handleImagePicked}
            className="hidden"
          />
          <input
            ref={docInputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            multiple
            onChange={handleDocPicked}
            className="hidden"
          />

          <div className="flex items-center gap-3">
            {/* Character counter (only shown after 800 chars) */}
            {charsCount >= 800 && (
              <span
                className={`text-[12px] tabular-nums font-medium ${
                  isOverLimit ? 'text-[var(--danger)] font-bold' : 'text-[var(--muted)]'
                }`}
              >
                {remainingChars}
              </span>
            )}

            {/* Accent Post pill */}
            <button
              type="button"
              disabled={!canPost || isSending}
              onClick={handleSendPost}
              className={`h-[36px] px-5 rounded-full text-[14px] font-medium transition-all flex items-center gap-1.5 cursor-pointer ${
                canPost && !isSending
                  ? 'bg-[var(--accent)] text-white hover:brightness-110 shadow-xs'
                  : 'bg-[var(--border)] text-[var(--muted)] cursor-not-allowed'
              }`}
            >
              {isSending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Post</span>
            </button>
          </div>
        </div>

        {/* Non-advocates statutory disclaimer */}
        {!isAdvocate && (
          <div className="text-[11px] text-[var(--muted)] pt-0.5 text-center sm:text-left">
            General legal information, not legal advice.
          </div>
        )}
      </div>

      {/* Discard confirmation dialog */}
      {showDiscardConfirm && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
        >
          <div className="w-full max-w-[320px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl space-y-3 text-center">
            <h4 className="text-[15px] font-semibold text-[var(--text)]">Discard this draft?</h4>
            <p className="text-[13px] text-[var(--muted)]">
              Your written content and attachments will be deleted.
            </p>
            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setShowDiscardConfirm(false)}
                className="px-4 py-2 rounded-lg text-[13px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Keep editing
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowDiscardConfirm(false);
                  onCollapse();
                }}
                className="px-4 py-2 rounded-lg bg-[var(--danger)] text-white text-[13px] font-medium cursor-pointer"
              >
                Discard
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Citation palette modal */}
      <CitationPalette
        isOpen={isCitationPaletteOpen}
        onClose={() => setIsCitationPaletteOpen(false)}
        onAddCitation={(cit) => setCitations((prev) => [...prev, cit])}
      />
    </div>
  );
};
