import React, { useState } from 'react';
import {
  Newspaper,
  Calendar,
  Clock,
  Award,
  BookOpen,
  ArrowRight,
  ExternalLink,
  X,
  Feather,
  Plus,
  ShieldCheck,
  Building2,
  CheckCircle2,
  AlertCircle,
  Loader2
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalNewsItem } from '../../types';
import { api } from '../../api/client';

export const LegalNewsView: React.FC = () => {
  const { legalNews, currentUser, openLoginModal, refreshAllData } = useApp();
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
        officialSourceUrl: newSourceUrl.trim() || undefined
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
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Newspaper className="w-5 h-5 text-blue-700" />
              <h1 className="text-lg font-black text-slate-900">
                Legal News & Official Gazettes
              </h1>
            </div>
            <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
              Verified regulatory developments, judicial circulars, and institutional announcements from the Ministry of Justice, Supreme Court, and Rwanda Bar Association.
            </p>
          </div>

          {canPublish && (
            <button
              onClick={() => setIsPublishModalOpen(true)}
              className="px-3.5 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs self-start sm:self-auto shrink-0"
            >
              <Plus className="w-4 h-4" />
              <span>Publish Legal Circular</span>
            </button>
          )}
        </div>
      </div>

      {/* News Articles Grid */}
      <div className="p-4 sm:p-6 space-y-4 max-w-4xl">
        {legalNews.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <Newspaper className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Official Gazettes & Judicial Communiqués
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                No official circulars have been published in the repository yet. Verified government ministries, regulatory agencies, and the Rwanda Bar Association publish official regulatory updates directly to this feed.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => {}}
                className="px-3.5 py-1.5 bg-slate-50 text-slate-700 text-2xs font-semibold rounded-xl border border-slate-200"
              >
                Official Gazette Special Editions
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="px-3.5 py-1.5 bg-slate-50 text-slate-700 text-2xs font-semibold rounded-xl border border-slate-200"
              >
                Supreme Court Practice Directions
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="px-3.5 py-1.5 bg-slate-50 text-slate-700 text-2xs font-semibold rounded-xl border border-slate-200"
              >
                Rwanda Bar Association Bulletins
              </button>
            </div>

            {canPublish && (
              <div className="pt-2">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(true)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer inline-flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publish Official Circular</span>
                </button>
              </div>
            )}
          </div>
        ) : (
          legalNews.map(item => (
            <article
              key={item.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-blue-300 transition shadow-xs"
            >
              <div className="flex items-center gap-2 mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  item.isOfficialGazetteAlert
                    ? 'bg-amber-100 text-amber-900 border border-amber-200'
                    : 'bg-blue-50 text-blue-800 border border-blue-200'
                }`}>
                  {item.category}
                </span>
                <span className="text-2xs text-slate-400">
                  {new Date(item.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-2xs text-slate-400">
                  {item.readTimeMinutes} min read
                </span>
              </div>

              <h2
                className="text-sm font-bold text-slate-900 hover:text-blue-700 transition cursor-pointer"
                onClick={() => setActiveArticle(item)}
              >
                {item.title}
              </h2>

              {item.titleRw && (
                <p className="text-2xs text-slate-500 italic mt-0.5">
                  {item.titleRw}
                </p>
              )}

              <p className="text-xs text-slate-700 leading-relaxed my-2.5">
                {item.summary}
              </p>

              <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center font-bold text-[10px]">
                    LX
                  </span>
                  <span className="text-2xs font-semibold text-slate-700">
                    {item.publisherName}
                  </span>
                </div>

                <button
                  onClick={() => setActiveArticle(item)}
                  className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
                >
                  <span>Read Full Circular</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>
            </article>
          ))
        )}
      </div>

      {/* Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-100 text-blue-800">
                  {activeArticle.category}
                </span>
                {activeArticle.isOfficialGazetteAlert && (
                  <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-amber-100 text-amber-900">
                    Official Gazette Notice
                  </span>
                )}
              </div>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 sm:p-6 overflow-y-auto space-y-4">
              <div>
                <h1 className="text-base sm:text-lg font-black text-slate-900 leading-snug">
                  {activeArticle.title}
                </h1>
                {activeArticle.titleRw && (
                  <p className="text-xs text-slate-500 italic mt-1">
                    {activeArticle.titleRw}
                  </p>
                )}
                <div className="flex items-center gap-3 text-2xs text-slate-500 mt-2">
                  <span>Published by <strong>{activeArticle.publisherName}</strong></span>
                  <span>•</span>
                  <span>{new Date(activeArticle.publishedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric' })}</span>
                </div>
              </div>

              <div className="p-3.5 bg-blue-50/70 border border-blue-100 rounded-xl text-xs text-blue-950 leading-relaxed font-medium">
                {activeArticle.summary}
              </div>

              <div className="text-xs text-slate-800 leading-relaxed space-y-3 whitespace-pre-line">
                {activeArticle.fullBody}
              </div>

              {activeArticle.officialSourceUrl && (
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                  <span className="text-2xs text-slate-500">Official Institutional Repository</span>
                  <a
                    href={activeArticle.officialSourceUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-blue-700 hover:underline flex items-center gap-1"
                  >
                    <span>Download PDF / View Gazette</span>
                    <ExternalLink className="w-3.5 h-3.5" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Publish Circular Modal */}
      {isPublishModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/65 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-gradient-to-r from-[#102744] to-[#1D4ED8] text-white">
              <div className="flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-300" />
                <h3 className="text-sm font-bold">Publish Official Legal Notice</h3>
              </div>
              <button
                onClick={() => setIsPublishModalOpen(false)}
                className="text-white/70 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handlePublishSubmit} className="p-5 overflow-y-auto space-y-3">
              {publishError && (
                <div className="p-2.5 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5 text-red-600" />
                  <span>{publishError}</span>
                </div>
              )}

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Notice Category
                </label>
                <select
                  value={newCategory}
                  onChange={e => setNewCategory(e.target.value as any)}
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                >
                  <option value="Ministry Communiqué">Ministry Communiqué</option>
                  <option value="Judiciary Circular">Judiciary Circular</option>
                  <option value="Regulatory Update">Regulatory Update</option>
                  <option value="Bar Association">Bar Association Announcement</option>
                  <option value="Public Legal Education">Public Legal Education</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Title (English / Official)
                </label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  placeholder="e.g. Directive on Electronic Notarization Standards 2026"
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Title in Ikinyarwanda (Optional)
                </label>
                <input
                  type="text"
                  value={newTitleRw}
                  onChange={e => setNewTitleRw(e.target.value)}
                  placeholder="e.g. Amabwiriza agenga ihererekanyabubasha..."
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Executive Summary
                </label>
                <textarea
                  required
                  rows={2}
                  value={newSummary}
                  onChange={e => setNewSummary(e.target.value)}
                  placeholder="Concise 1-2 sentence overview for the legal community."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white resize-none"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Full Circular Text & Legal Provisions
                </label>
                <textarea
                  required
                  rows={4}
                  value={newFullBody}
                  onChange={e => setNewFullBody(e.target.value)}
                  placeholder="Detailed provisions, statutory citations, and operational guidelines..."
                  className="w-full text-xs border border-slate-300 rounded-xl p-2.5 bg-slate-50 focus:bg-white"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-slate-800 block mb-1">
                  Official Gazette / Portal PDF URL
                </label>
                <input
                  type="text"
                  value={newSourceUrl}
                  onChange={e => setNewSourceUrl(e.target.value)}
                  placeholder="https://minijust.gov.rw/gazette/..."
                  className="w-full text-xs border border-slate-300 rounded-xl px-3 py-2 bg-slate-50 focus:bg-white"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="gazette-alert"
                  checked={isGazetteAlert}
                  onChange={e => setIsGazetteAlert(e.target.checked)}
                  className="w-3.5 h-3.5 rounded text-blue-700"
                />
                <label htmlFor="gazette-alert" className="text-xs text-slate-700 font-medium">
                  Flag as Urgent Official Gazette Alert
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsPublishModalOpen(false)}
                  className="px-3.5 py-2 text-xs font-semibold text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 disabled:bg-blue-400 text-white rounded-xl text-xs font-bold flex items-center gap-1.5"
                >
                  {isSubmitting ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <span>Publish to Lex Hafi Platform</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
