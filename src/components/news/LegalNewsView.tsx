import React, { useState } from 'react';
import {
  Newspaper,
  ArrowRight,
  X,
  Plus,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalNewsItem } from '../../types';
import { api } from '../../api/client';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

export const LegalNewsView: React.FC = () => {
  const { legalNews, currentUser, refreshAllData } = useApp();
  const [activeArticle, setActiveArticle] = useState<LegalNewsItem | null>(null);

  // Publish Modal State
  const [isPublishModalOpen, setIsPublishModalOpen] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newTitleRw, setNewTitleRw] = useState('');
  const [newCategory, setNewCategory] = useState<LegalNewsItem['category']>('Ministry Communiqué');
  const [newSummary, setNewSummary] = useState('');
  const [newFullBody, setNewFullBody] = useState('');
  const [newSourceUrl, setNewSourceUrl] = useState('');
  const [isGazetteAlert, setIsGazetteAlert] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [publishError, setPublishError] = useState('');

  const canPublish = currentUser?.role === 'institution' || currentUser?.role === 'admin';

  const handlePublishSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newSummary.trim() || !newFullBody.trim()) {
      setPublishError('Please complete title, summary, and full body');
      return;
    }

    setIsSubmitting(true);
    setPublishError('');

    try {
      await api.publishLegalNews({
        title: newTitle.trim(),
        titleRw: newTitleRw.trim() || undefined,
        category: newCategory,
        summary: newSummary.trim(),
        fullBody: newFullBody.trim(),
        isOfficialGazetteAlert: isGazetteAlert,
        officialSourceUrl: newSourceUrl.trim() || undefined,
      });

      await refreshAllData();
      setIsPublishModalOpen(false);
      setNewTitle('');
      setNewTitleRw('');
      setNewSummary('');
      setNewFullBody('');
      setNewSourceUrl('');
    } catch (err: any) {
      setPublishError(err.message || 'Failed to publish legal news circular');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Gazette & News"
        subtitle="Verified regulatory developments and Official Gazette circulars"
        actions={
          canPublish ? (
            <button
              type="button"
              onClick={() => setIsPublishModalOpen(true)}
              className="px-3 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Publish circular</span>
            </button>
          ) : undefined
        }
      />

      <div className="p-4 space-y-3">
        {legalNews.length === 0 ? (
          <EmptyState
            icon={<Newspaper className="w-6 h-6 text-[var(--muted)]" />}
            title="No official circulars yet"
            description="Verified government ministries, regulatory agencies, and the Rwanda Bar Association publish official regulatory updates directly to this feed."
          />
        ) : (
          legalNews.map((item) => (
            <Card key={item.id}>
              <div className="flex items-center gap-2 mb-2">
                <span
                  className={`text-[11px] font-medium px-2 py-0.5 rounded ${
                    item.isOfficialGazetteAlert
                      ? 'bg-[var(--warn-bg)] text-[var(--warn-text)] border border-[var(--warn-border)]'
                      : 'bg-[var(--surface)] text-[var(--gold)] border border-[var(--border)]'
                  }`}
                >
                  {item.category}
                </span>
                <span className="text-[12px] text-[var(--muted)]">
                  {new Date(item.publishedAt).toLocaleDateString('en-GB', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="text-[var(--border)]">•</span>
                <span className="text-[12px] text-[var(--muted)]">
                  {item.readTimeMinutes} min read
                </span>
              </div>

              <h2
                className="text-[15px] font-semibold text-[var(--text)] hover:text-[var(--accent)] transition-colors cursor-pointer m-0"
                onClick={() => setActiveArticle(item)}
              >
                {item.title}
              </h2>

              {item.titleRw && (
                <p className="text-[12px] text-[var(--muted)] italic mt-0.5 m-0">
                  {item.titleRw}
                </p>
              )}

              <p className="text-[13px] text-[var(--muted)] leading-relaxed my-2.5">
                {item.summary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] flex items-center justify-center font-bold text-[10px]">
                    LX
                  </span>
                  <span className="text-[12px] font-medium text-[var(--text)]">
                    {item.publisherName}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => setActiveArticle(item)}
                  className="text-[12px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>Read circular</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Article Detail Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]">
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--surface)] text-[var(--gold)] border border-[var(--border)]">
                  {activeArticle.category}
                </span>
                {activeArticle.isOfficialGazetteAlert && (
                  <span className="text-[11px] font-medium px-2 py-0.5 rounded bg-[var(--warn-bg)] text-[var(--warn-text)] border border-[var(--warn-border)]">
                    Official Gazette notice
                  </span>
                )}
              </div>
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4 text-[13px] no-scrollbar">
              <div>
                <h1 className="text-[18px] font-semibold text-[var(--text)] leading-snug m-0">
                  {activeArticle.title}
                </h1>
                {activeArticle.titleRw && (
                  <p className="text-[12px] text-[var(--muted)] italic mt-1 m-0">
                    {activeArticle.titleRw}
                  </p>
                )}
                <div className="flex items-center gap-2 text-[12px] text-[var(--muted)] mt-2">
                  <span>{activeArticle.publisherName}</span>
                  <span>•</span>
                  <span>
                    {new Date(activeArticle.publishedAt).toLocaleDateString('en-GB', {
                      day: 'numeric',
                      month: 'long',
                      year: 'numeric',
                    })}
                  </span>
                </div>
              </div>

              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[10px] p-4 text-[13px] text-[var(--text)] leading-relaxed space-y-3">
                <p className="font-medium text-[var(--gold)] m-0">
                  Official circular summary:
                </p>
                <p className="m-0 text-[var(--muted)]">{activeArticle.summary}</p>
                <div className="pt-2 border-t border-[var(--border)] whitespace-pre-line text-[var(--text)]">
                  {activeArticle.fullBody}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)] flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-4 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Publish Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[var(--text)] m-0">Publish official legal circular</h3>
              <button
                type="button"
                onClick={() => setIsPublishModalOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {publishError && (
              <p className="text-[12px] text-[var(--danger)] m-0">{publishError}</p>
            )}

            <form onSubmit={handlePublishSubmit} className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Title (English)</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Official Ministerial Announcement..."
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2 focus:border-[var(--accent)] focus:outline-none"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Summary</label>
                <textarea
                  rows={2}
                  required
                  value={newSummary}
                  onChange={(e) => setNewSummary(e.target.value)}
                  placeholder="Brief 2-3 sentence overview..."
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2 focus:border-[var(--accent)] focus:outline-none resize-none"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">Full bulletin text</label>
                <textarea
                  rows={4}
                  required
                  value={newFullBody}
                  onChange={(e) => setNewFullBody(e.target.value)}
                  placeholder="Official communique details..."
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2 focus:border-[var(--accent)] focus:outline-none resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white text-[13px] font-medium transition-colors cursor-pointer"
                >
                  {isSubmitting ? 'Publishing...' : 'Publish'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
