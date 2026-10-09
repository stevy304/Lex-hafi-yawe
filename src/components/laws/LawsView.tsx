import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Calendar,
  Building,
  CheckCircle2,
  ExternalLink,
  Download,
  X,
  Share2,
  Feather
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LawDocument } from '../../types';

export const LawsView: React.FC = () => {
  const { laws, setIsCreatePostModalOpen } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [activeLawModal, setActiveLawModal] = useState<LawDocument | null>(null);

  const categories = [
    'All',
    'Labor',
    'Land & Property',
    'Commercial & Companies',
    'Data Protection & Tech'
  ];

  const filteredLaws = laws.filter(law => {
    const matchesCategory = selectedCategory === 'All' || law.category === selectedCategory;
    const matchesSearch =
      law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.lawNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.summaryEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Banner */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-blue-700" />
          <h1 className="text-lg font-black text-slate-900">
            Rwandan Legislation & Official Gazette Library
          </h1>
        </div>
        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
          Access verified Rwandan statutory laws, codes, and ministerial orders published in the Official Gazette of the Republic of Rwanda. Clear plain-language explanations in English and Ikinyarwanda.
        </p>

        {/* Search & Category Filter */}
        <div className="flex flex-col sm:flex-row items-center gap-2.5 mt-4">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search by law number (e.g. 66/2018), keyword, or title..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-blue-600 focus:outline-none focus:bg-white"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={e => setSelectedCategory(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {categories.map(c => (
                <option key={c} value={c}>{c === 'All' ? 'All Legal Categories' : c}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Laws List */}
      <div className="p-4 sm:p-6 space-y-4 max-w-4xl">
        {filteredLaws.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-500">
              No statutory documents found matching your search.
            </p>
          </div>
        ) : (
          filteredLaws.map(law => (
            <div
              key={law.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-blue-300 transition shadow-xs"
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 border border-blue-200 px-2 py-0.5 rounded">
                      {law.category}
                    </span>
                    <span className="text-2xs text-slate-500 font-semibold">
                      {law.officialGazetteNumber}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 mt-1">
                    {law.title}
                  </h2>
                  {law.titleKinyarwanda && (
                    <p className="text-2xs text-slate-500 italic mt-0.5">
                      {law.titleKinyarwanda}
                    </p>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-1 rounded-full shrink-0">
                  <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                  <span>In Force</span>
                </span>
              </div>

              {/* Summary */}
              <p className="text-xs text-slate-700 leading-relaxed mb-3">
                {law.summaryEn}
              </p>

              {/* Key Articles Pill Preview */}
              <div className="bg-slate-50 rounded-xl p-3 mb-3 border border-slate-100">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block mb-1.5">
                  Key Practical Articles:
                </span>
                <div className="space-y-1.5">
                  {law.keyArticles.map((art, idx) => (
                    <div key={idx} className="text-2xs text-slate-700 flex items-start gap-1.5">
                      <strong className="text-blue-900 font-bold shrink-0">{art.articleNumber}:</strong>
                      <span>{art.heading} — {art.description}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                <div className="flex items-center gap-3 text-2xs text-slate-500">
                  <div className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5 text-slate-400" />
                    <span>{law.sourceInstitution}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Effective: {law.effectiveDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveLawModal(law)}
                    className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Read Full Law & Summary</span>
                  </button>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Law Detail Modal */}
      {activeLawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-100 px-2 py-0.5 rounded">
                  {activeLawModal.category}
                </span>
                <h2 className="text-sm font-extrabold text-slate-900 mt-1">
                  {activeLawModal.lawNumber}
                </h2>
              </div>
              <button
                onClick={() => setActiveLawModal(null)}
                className="p-1.5 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-xs">
              <div>
                <h3 className="font-extrabold text-sm text-slate-900">
                  {activeLawModal.title}
                </h3>
                {activeLawModal.titleKinyarwanda && (
                  <p className="text-slate-500 italic mt-0.5">
                    {activeLawModal.titleKinyarwanda}
                  </p>
                )}
                <p className="text-slate-400 text-2xs mt-1">
                  {activeLawModal.officialGazetteNumber} • Promulgated {activeLawModal.effectiveDate}
                </p>
              </div>

              <div className="bg-blue-50/70 border border-blue-100 rounded-xl p-3.5">
                <h4 className="font-bold text-blue-900 uppercase tracking-wide text-2xs mb-1">
                  Plain-Language Summary (English):
                </h4>
                <p className="text-slate-800 leading-relaxed">
                  {activeLawModal.summaryEn}
                </p>
              </div>

              {activeLawModal.summaryRw && (
                <div className="bg-emerald-50/70 border border-emerald-100 rounded-xl p-3.5">
                  <h4 className="font-bold text-emerald-900 uppercase tracking-wide text-2xs mb-1">
                    Incamake mu Kinyarwanda:
                  </h4>
                  <p className="text-slate-800 leading-relaxed">
                    {activeLawModal.summaryRw}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-bold text-slate-900 uppercase tracking-wide text-2xs mb-2">
                  Statutory Articles Breakdown:
                </h4>
                <div className="space-y-2">
                  {activeLawModal.keyArticles.map((art, idx) => (
                    <div key={idx} className="border border-slate-200 rounded-xl p-3 bg-slate-50">
                      <p className="font-bold text-slate-900 mb-0.5">{art.articleNumber}: {art.heading}</p>
                      <p className="text-slate-700 leading-relaxed">{art.description}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-slate-200 bg-slate-50 flex items-center justify-between">
              <button
                onClick={() => {
                  setActiveLawModal(null);
                  setIsCreatePostModalOpen(true);
                }}
                className="px-3 py-1.5 border border-slate-300 hover:bg-white text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>Discuss Law on Feed</span>
              </button>

              <button
                onClick={() => setActiveLawModal(null)}
                className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold"
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
