import React, { useState } from 'react';
import { X, FileText, BookOpen, Edit2 } from 'lucide-react';
import { PostCitation, PostDocumentItem } from '../../types';

export interface ImageAttachment {
  url: string;
  alt: string;
}

interface AttachmentTrayProps {
  images: ImageAttachment[];
  onRemoveImage: (index: number) => void;
  onUpdateImageAlt: (index: number, alt: string) => void;
  documents: PostDocumentItem[];
  onRemoveDocument: (index: number) => void;
  citations: PostCitation[];
  onRemoveCitation: (index: number) => void;
}

export const AttachmentTray: React.FC<AttachmentTrayProps> = ({
  images,
  onRemoveImage,
  onUpdateImageAlt,
  documents,
  onRemoveDocument,
  citations,
  onRemoveCitation,
}) => {
  const [editingAltIndex, setEditingAltIndex] = useState<number | null>(null);
  const [altText, setAltText] = useState('');

  const handleStartEditAlt = (idx: number) => {
    setEditingAltIndex(idx);
    setAltText(images[idx]?.alt || '');
  };

  const handleSaveAlt = () => {
    if (editingAltIndex !== null) {
      onUpdateImageAlt(editingAltIndex, altText.trim());
      setEditingAltIndex(null);
    }
  };

  const hasAttachments = images.length > 0 || documents.length > 0 || citations.length > 0;
  if (!hasAttachments) return null;

  return (
    <div className="space-y-2.5 pt-2">
      {/* Images preview grid */}
      {images.length > 0 && (
        <div className={`grid gap-2 ${images.length === 1 ? 'grid-cols-1' : 'grid-cols-2'}`}>
          {images.map((img, idx) => (
            <div key={idx} className="relative group rounded-xl overflow-hidden bg-[var(--surface)] border border-[var(--border)] max-h-48">
              <img
                src={img.url}
                alt={img.alt || 'Attachment preview'}
                className="w-full h-full object-cover max-h-48"
              />
              <button
                type="button"
                onClick={() => onRemoveImage(idx)}
                aria-label="Remove image"
                className="absolute top-2 right-2 w-7 h-7 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center transition-opacity cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => handleStartEditAlt(idx)}
                className="absolute bottom-2 left-2 px-2 py-1 rounded bg-black/70 hover:bg-black text-white text-[11px] font-medium flex items-center gap-1 cursor-pointer"
              >
                <Edit2 className="w-3 h-3" />
                <span>{img.alt ? 'Edit alt' : 'Add description'}</span>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Alt text modal / inline prompt */}
      {editingAltIndex !== null && (
        <div className="p-3 bg-[var(--surface)] border border-[var(--border)] rounded-xl space-y-2">
          <label className="text-[12px] font-medium text-[var(--muted)]">Image description (alt text)</label>
          <input
            type="text"
            value={altText}
            onChange={(e) => setAltText(e.target.value)}
            placeholder="Describe this image for screen readers"
            className="w-full px-3 py-1.5 text-[13px] bg-[var(--bg)] border border-[var(--border)] rounded-lg text-[var(--text)] focus:outline-none focus:border-[var(--accent)]"
          />
          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setEditingAltIndex(null)}
              className="px-3 py-1 text-[12px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSaveAlt}
              className="px-3 py-1 bg-[var(--accent)] text-white text-[12px] font-medium rounded-lg cursor-pointer"
            >
              Save description
            </button>
          </div>
        </div>
      )}

      {/* Documents preview chips */}
      {documents.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {documents.map((doc, idx) => (
            <div
              key={doc.id || idx}
              className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-[var(--surface)] border border-[var(--border)] text-[12px]"
            >
              <FileText className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span className="font-medium text-[var(--text)] truncate max-w-[180px]">{doc.name}</span>
              <span className="text-[var(--muted)] text-[11px]">
                {(doc.size / (1024 * 1024)).toFixed(1)} MB
              </span>
              <button
                type="button"
                onClick={() => onRemoveDocument(idx)}
                aria-label={`Remove document ${doc.name}`}
                className="text-[var(--muted)] hover:text-[var(--danger)] cursor-pointer ml-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Citation cards in composer */}
      {citations.length > 0 && (
        <div className="space-y-1.5">
          {citations.map((c, idx) => (
            <div
              key={idx}
              className="flex items-center justify-between p-2 rounded-r-lg bg-[var(--surface)] border border-[var(--border)] border-l-[3px] border-l-[var(--gold)] text-[12px]"
            >
              <div className="flex items-center gap-2">
                <BookOpen className="w-3.5 h-3.5 text-[var(--gold)] shrink-0" />
                <span className="font-medium text-[var(--text)]">
                  {c.number || c.title}
                  {c.article ? `, ${c.article}` : ''}
                </span>
              </div>
              <button
                type="button"
                onClick={() => onRemoveCitation(idx)}
                aria-label="Remove law citation"
                className="text-[var(--muted)] hover:text-[var(--danger)] cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
