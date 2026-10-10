import React from 'react';
import { FileText, Download } from 'lucide-react';
import { PostDocumentItem } from '../../types';

interface PostDocumentsProps {
  documents: PostDocumentItem[];
}

export const PostDocuments: React.FC<PostDocumentsProps> = ({ documents }) => {
  if (!documents || documents.length === 0) return null;

  return (
    <div className="mt-2.5 space-y-1.5">
      {documents.map((doc) => (
        <div
          key={doc.id || doc.url}
          className="flex items-center justify-between p-2.5 rounded-xl bg-[var(--surface)] border border-[var(--border)] text-[13px] hover:bg-[var(--hover)] transition-colors"
        >
          <div className="flex items-center gap-2.5 min-w-0 pr-2">
            <div className="w-8 h-8 rounded-lg bg-[var(--bg)] border border-[var(--border)] flex items-center justify-center shrink-0">
              <FileText className="w-4 h-4 text-[var(--accent)]" />
            </div>
            <div className="min-w-0">
              <div className="font-medium text-[var(--text)] truncate">{doc.name}</div>
              <div className="text-[11px] text-[var(--muted)]">
                {doc.size ? `${(doc.size / (1024 * 1024)).toFixed(1)} MB` : 'PDF Document'}
                {doc.pages ? ` · ${doc.pages} pages` : ''}
              </div>
            </div>
          </div>

          <a
            href={doc.url}
            download={doc.name}
            onClick={(e) => e.stopPropagation()}
            title={`Download ${doc.name}`}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--surface)] transition-colors shrink-0"
          >
            <Download className="w-4 h-4" />
          </a>
        </div>
      ))}
    </div>
  );
};
