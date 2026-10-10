import React, { useState, useEffect, useRef } from 'react';
import { Search, BookOpen, X, Check } from 'lucide-react';
import { PostCitation } from '../../types';
import { OFFICIAL_LAWS } from '../../data/officialReferences';

interface CitationPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onAddCitation: (citation: PostCitation) => void;
}

export const CitationPalette: React.FC<CitationPaletteProps> = ({
  isOpen,
  onClose,
  onAddCitation,
}) => {
  const [query, setQuery] = useState('');
  const [laws, setLaws] = useState(OFFICIAL_LAWS);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [selectedLaw, setSelectedLaw] = useState<(typeof OFFICIAL_LAWS)[0] | null>(null);
  const [articleLabel, setArticleLabel] = useState('');

  const inputRef = useRef<HTMLInputElement>(null);
  const articleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedLaw(null);
      setArticleLabel('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    const handler = setTimeout(async () => {
      const q = query.trim().toLowerCase();
      if (!q) {
        setLaws(OFFICIAL_LAWS);
        return;
      }
      try {
        // Try calling search suggest if server is reachable
        const res = await fetch(`/api/search/suggest?q=${encodeURIComponent(q)}&type=laws`);
        if (res.ok) {
          const data = await res.json();
          if (Array.isArray(data.laws) && data.laws.length > 0) {
            setLaws(data.laws);
            return;
          }
        }
      } catch {}

      // Fallback: local filter
      const filtered = OFFICIAL_LAWS.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.lawNumber.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.officialGazetteNumber.toLowerCase().includes(q)
      );
      setLaws(filtered);
      setSelectedIndex(0);
    }, 250);

    return () => clearTimeout(handler);
  }, [query]);

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      e.preventDefault();
      onClose();
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev + 1) % Math.max(1, laws.length));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex((prev) => (prev - 1 + laws.length) % Math.max(1, laws.length));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (!selectedLaw && laws[selectedIndex]) {
        setSelectedLaw(laws[selectedIndex]);
        setTimeout(() => articleInputRef.current?.focus(), 50);
      } else if (selectedLaw) {
        handleConfirmCitation();
      }
    }
  };

  const handleConfirmCitation = () => {
    if (!selectedLaw) return;
    onAddCitation({
      lawId: selectedLaw.id,
      title: selectedLaw.title,
      number: selectedLaw.lawNumber,
      article: articleLabel.trim() || undefined,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="cite-law-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
      onClick={onClose}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        onKeyDown={handleKeyDown}
        className="w-full max-w-[500px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <BookOpen className="w-4 h-4 text-[var(--gold)]" />
            <h3 id="cite-law-title" className="text-[15px] font-semibold text-[var(--text)]">
              {selectedLaw ? 'Specify article or section' : 'Cite Rwanda law or gazette'}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close cite law palette"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {!selectedLaw ? (
          <>
            <div className="relative">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-[var(--muted)]" />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by law number, title, or topic..."
                className="w-full pl-9 pr-3 py-2 text-[14px] bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="max-h-[300px] overflow-y-auto space-y-1.5 pr-1 no-scrollbar">
              {laws.length === 0 ? (
                <div className="p-4 text-center text-[13px] text-[var(--muted)]">
                  No laws match your search
                </div>
              ) : (
                laws.map((law, idx) => (
                  <button
                    key={law.id}
                    type="button"
                    onClick={() => {
                      setSelectedLaw(law);
                      setTimeout(() => articleInputRef.current?.focus(), 50);
                    }}
                    className={`w-full text-left p-3 rounded-xl border transition-colors cursor-pointer ${
                      idx === selectedIndex
                        ? 'bg-[var(--hover)] border-[var(--accent)]'
                        : 'border-[var(--border)] hover:bg-[var(--hover)]'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-semibold text-[13px] text-[var(--gold)]">
                        {law.lawNumber}
                      </span>
                      <span className="text-[11px] text-[var(--muted)]">
                        {law.officialGazetteNumber}
                      </span>
                    </div>
                    <div className="text-[13px] text-[var(--text)] line-clamp-2 leading-snug">
                      {law.title}
                    </div>
                  </button>
                ))
              )}
            </div>
          </>
        ) : (
          <div className="space-y-4">
            <div className="p-3 bg-[var(--bg)] border border-[var(--border)] rounded-xl">
              <div className="text-[12px] font-semibold text-[var(--gold)]">{selectedLaw.lawNumber}</div>
              <div className="text-[13px] text-[var(--text)] font-medium mt-0.5">{selectedLaw.title}</div>
            </div>

            <div>
              <label className="block text-[13px] font-medium text-[var(--text)] mb-1">
                Article or section label (optional)
              </label>
              <input
                ref={articleInputRef}
                type="text"
                value={articleLabel}
                onChange={(e) => setArticleLabel(e.target.value)}
                placeholder="e.g. Article 14, Section 2"
                className="w-full px-3 py-2 text-[14px] bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setSelectedLaw(null)}
                className="px-4 py-2 text-[13px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Back to laws
              </button>
              <button
                type="button"
                onClick={handleConfirmCitation}
                className="flex items-center gap-1.5 px-5 py-2 bg-[var(--accent)] text-white text-[13px] font-medium rounded-full cursor-pointer hover:brightness-110"
              >
                <Check className="w-4 h-4" />
                <span>Add citation</span>
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
