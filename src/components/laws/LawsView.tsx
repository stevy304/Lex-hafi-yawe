import React, { useState } from 'react';
import {
  BookOpen,
  Search,
  FileText,
  Calendar,
  Building,
  CheckCircle2,
  X,
  Feather,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LawDocument } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

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
    'Data Protection & Tech',
  ];

  const filteredLaws = laws.filter((law) => {
    const matchesCategory =
      selectedCategory === 'All' || law.category === selectedCategory;
    const matchesSearch =
      law.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.lawNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      law.summaryEn.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Laws & Codes"
        subtitle="Rwandan statutory legislation and Official Gazette library"
      >
        <div className="flex flex-col sm:flex-row items-center gap-2">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by law number, keyword, or title..."
              className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] rounded-full pl-9 pr-3 py-1.5 focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-full px-3 py-1.5 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {categories.map((c) => (
                <option key={c} value={c}>
                  {c === 'All' ? 'All categories' : c}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PageHeader>

      {/* Laws List */}
      <div className="p-4 space-y-3">
        {filteredLaws.length === 0 ? (
          <EmptyState
            icon={<BookOpen className="w-6 h-6 text-[var(--muted)]" />}
            title="No laws found"
            description="No statutory documents found matching your search criteria."
          />
        ) : (
          filteredLaws.map((law) => (
            <Card key={law.id}>
              <div className="flex items-start justify-between gap-3 mb-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-medium text-[var(--gold)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded">
                      {law.category}
                    </span>
                    <span className="text-[12px] text-[var(--muted)] font-medium">
                      {law.officialGazetteNumber}
                    </span>
                  </div>
                  <h2 className="text-[15px] font-semibold text-[var(--text)] mt-1.5">
                    {law.title}
                  </h2>
                  {law.titleKinyarwanda && (
                    <p className="text-[12px] text-[var(--muted)] italic mt-0.5">
                      {law.titleKinyarwanda}
                    </p>
                  )}
                </div>

                <span className="inline-flex items-center gap-1 text-[11px] font-medium text-[var(--ok-text)] bg-[var(--ok-bg)] px-2 py-0.5 rounded-full shrink-0">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>In force</span>
                </span>
              </div>

              {/* Summary */}
              <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-3">
                {law.summaryEn}
              </p>

              {/* Key Articles Pill Preview */}
              <div className="bg-[var(--bg)] rounded-[10px] p-3 mb-3 border border-[var(--border)]">
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] block mb-1.5">
                  Key practical articles:
                </span>
                <div className="space-y-1.5">
                  {law.keyArticles.map((art, idx) => (
                    <div key={idx} className="text-[12px] text-[var(--text)] flex items-start gap-1.5">
                      <strong className="text-[var(--gold)] font-medium shrink-0">
                        {art.articleNumber}:
                      </strong>
                      <span className="text-[var(--muted)]">
                        {art.heading} — {art.description}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Metadata & Actions */}
              <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                <div className="flex items-center gap-3 text-[12px] text-[var(--muted)]">
                  <div className="flex items-center gap-1">
                    <Building className="w-3.5 h-3.5" />
                    <span>{law.sourceInstitution}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    <span>Effective: {law.effectiveDate}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setActiveLawModal(law)}
                    className="px-3.5 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium transition-colors cursor-pointer flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>Read summary</span>
                  </button>
                </div>
              </div>
            </Card>
          ))
        )}
      </div>

      {/* Law Detail Modal */}
      {activeLawModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-2xl bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
            <div className="px-5 py-4 border-b border-[var(--border)] flex items-center justify-between bg-[var(--bg)]">
              <div>
                <span className="text-[11px] font-medium text-[var(--gold)] bg-[var(--surface)] border border-[var(--border)] px-2 py-0.5 rounded">
                  {activeLawModal.category}
                </span>
                <h2 className="text-[16px] font-semibold text-[var(--text)] mt-1.5 m-0">
                  {activeLawModal.lawNumber}
                </h2>
              </div>
              <button
                type="button"
                onClick={() => setActiveLawModal(null)}
                className="p-1.5 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-4 text-[13px] no-scrollbar">
              <div>
                <h3 className="font-semibold text-[16px] text-[var(--text)] m-0">
                  {activeLawModal.title}
                </h3>
                {activeLawModal.titleKinyarwanda && (
                  <p className="text-[12px] text-[var(--muted)] italic mt-0.5">
                    {activeLawModal.titleKinyarwanda}
                  </p>
                )}
                <p className="text-[12px] text-[var(--muted)] mt-1">
                  {activeLawModal.officialGazetteNumber} • Promulgated {activeLawModal.effectiveDate}
                </p>
              </div>

              <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[10px] p-3.5">
                <h4 className="font-semibold text-[var(--gold)] uppercase tracking-wide text-[11px] mb-1 m-0">
                  Plain-language summary (English):
                </h4>
                <p className="text-[13px] text-[var(--text)] leading-relaxed m-0">
                  {activeLawModal.summaryEn}
                </p>
              </div>

              {activeLawModal.summaryRw && (
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[10px] p-3.5">
                  <h4 className="font-semibold text-[var(--gold)] uppercase tracking-wide text-[11px] mb-1 m-0">
                    Incamake mu Kinyarwanda:
                  </h4>
                  <p className="text-[13px] text-[var(--text)] leading-relaxed m-0">
                    {activeLawModal.summaryRw}
                  </p>
                </div>
              )}

              <div>
                <h4 className="font-semibold text-[var(--text)] uppercase tracking-wide text-[11px] mb-2 m-0">
                  Statutory articles breakdown:
                </h4>
                <div className="space-y-2">
                  {activeLawModal.keyArticles.map((art, idx) => (
                    <div key={idx} className="border border-[var(--border)] rounded-[8px] p-3 bg-[var(--bg)]">
                      <p className="font-medium text-[13px] text-[var(--text)] mb-0.5 m-0">
                        {art.articleNumber}: {art.heading}
                      </p>
                      <p className="text-[12px] text-[var(--muted)] leading-relaxed m-0">
                        {art.description}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="p-4 border-t border-[var(--border)] bg-[var(--bg)] flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  setActiveLawModal(null);
                  setIsCreatePostModalOpen(true);
                }}
                className="px-3 py-1.5 border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text)] rounded-full text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
              >
                <Feather className="w-3.5 h-3.5" />
                <span>Discuss law on feed</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveLawModal(null)}
                className="px-4 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium cursor-pointer"
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
