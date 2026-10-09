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
  Feather
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalNewsItem } from '../../types';

export const LegalNewsView: React.FC = () => {
  const { legalNews, setIsCreatePostModalOpen, currentUser, openLoginModal } = useApp();
  const [activeArticle, setActiveArticle] = useState<LegalNewsItem | null>(null);

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
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

      {/* News Articles Grid */}
      <div className="p-4 sm:p-6 space-y-4 max-w-4xl">
        {legalNews.map(item => (
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

            <h2 className="text-sm font-bold text-slate-900 hover:text-blue-700 transition cursor-pointer"
                onClick={() => setActiveArticle(item)}>
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
        ))}
      </div>

      {/* Article Modal */}
      {activeArticle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <span className="text-2xs font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                {activeArticle.category}
              </span>
              <button
                onClick={() => setActiveArticle(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 overflow-y-auto space-y-4">
              <h2 className="text-base font-extrabold text-slate-900 leading-snug">
                {activeArticle.title}
              </h2>
              {activeArticle.titleRw && (
                <p className="text-xs text-slate-500 italic">
                  {activeArticle.titleRw}
                </p>
              )}

              <div className="flex items-center gap-2 text-2xs text-slate-400 border-b border-slate-100 pb-3">
                <span>Published by {activeArticle.publisherName}</span>
                <span>•</span>
                <span>{new Date(activeArticle.publishedAt).toLocaleDateString()}</span>
              </div>

              <p className="text-xs text-slate-800 leading-relaxed whitespace-pre-line">
                {activeArticle.fullBody}
              </p>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (!currentUser) {
                    openLoginModal();
                  } else {
                    setActiveArticle(null);
                    setIsCreatePostModalOpen(true);
                  }
                }}
                className="px-3.5 py-1.5 border border-slate-300 hover:bg-white text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Feather className="w-3.5 h-3.5 text-blue-700" />
                <span>Discuss on Feed</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveArticle(null)}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
