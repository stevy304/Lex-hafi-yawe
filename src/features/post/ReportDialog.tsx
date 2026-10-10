import React, { useState, useEffect, useRef } from 'react';
import { X, AlertCircle } from 'lucide-react';

interface ReportDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmitReport: (reason: string, details?: string) => Promise<void>;
}

const REPORT_REASONS = [
  'Legal misinformation or false statutory claim',
  'Impersonation of licensed advocate or official body',
  'Breach of client confidentiality or court gag order',
  'Harassment, hate speech, or abuse',
  'Spam or deceptive commercial solicitation',
  'Other statutory violation',
];

export const ReportDialog: React.FC<ReportDialogProps> = ({
  isOpen,
  onClose,
  onSubmitReport,
}) => {
  const [selectedReason, setSelectedReason] = useState(REPORT_REASONS[0]);
  const [details, setDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      setSelectedReason(REPORT_REASONS[0]);
      setDetails('');
      setSubmitted(false);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await onSubmitReport(selectedReason, details.trim() || undefined);
      setSubmitted(true);
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch {}
    setIsSubmitting(false);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-dialog-title"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs select-none"
    >
      <div
        ref={dialogRef}
        onClick={(e) => e.stopPropagation()}
        className="w-full max-w-[420px] bg-[var(--surface)] border border-[var(--border)] rounded-2xl p-5 shadow-2xl space-y-4"
      >
        <div className="flex items-center justify-between pb-2 border-b border-[var(--border)]">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-[var(--danger)]" />
            <h3 id="report-dialog-title" className="text-[15px] font-semibold text-[var(--text)]">
              Report post
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close report dialog"
            className="w-7 h-7 rounded-full flex items-center justify-center text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {submitted ? (
          <div className="p-6 text-center text-[14px] text-[var(--text)] space-y-1">
            <div className="font-semibold text-[var(--ok-text)]">Report submitted</div>
            <p className="text-[13px] text-[var(--muted)]">
              Thank you. Our compliance team will review this post against statutory rules.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-2">
              <label className="block text-[12px] font-medium text-[var(--muted)]">
                Why are you reporting this post?
              </label>
              {REPORT_REASONS.map((r) => (
                <label
                  key={r}
                  className="flex items-center gap-2.5 p-2 rounded-lg hover:bg-[var(--hover)] cursor-pointer text-[13px] text-[var(--text)]"
                >
                  <input
                    type="radio"
                    name="reportReason"
                    value={r}
                    checked={selectedReason === r}
                    onChange={() => setSelectedReason(r)}
                    className="accent-[var(--accent)]"
                  />
                  <span>{r}</span>
                </label>
              ))}
            </div>

            <div>
              <label className="block text-[12px] font-medium text-[var(--muted)] mb-1">
                Additional context (optional)
              </label>
              <textarea
                value={details}
                onChange={(e) => setDetails(e.target.value)}
                rows={2}
                placeholder="Specific statutes or case references violated..."
                className="w-full px-3 py-2 text-[13px] bg-[var(--bg)] border border-[var(--border)] rounded-xl text-[var(--text)] focus:outline-none focus:border-[var(--accent)] resize-none"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-1.5 text-[13px] text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-1.5 rounded-full bg-[var(--danger)] text-white text-[13px] font-medium hover:brightness-110 cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Submit report'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
