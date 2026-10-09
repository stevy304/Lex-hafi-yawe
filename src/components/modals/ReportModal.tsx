import React, { useState } from 'react';
import { X, ShieldAlert, Flag, Check } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { ReportItem } from '../../types';

export const ReportModal: React.FC = () => {
  const { reportTarget, setReportTarget, submitReport } = useApp();

  const [category, setCategory] = useState<ReportItem['category']>('fraud_impersonation');
  const [details, setDetails] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  if (!reportTarget) return null;

  const categories: { id: ReportItem['category']; label: string; desc: string }[] = [
    {
      id: 'fraud_impersonation',
      label: 'Fraud or Impersonation',
      desc: 'Claiming false identity or false affiliation with Rwanda Bar Association or government.'
    },
    {
      id: 'unauthorized_legal_practice',
      label: 'Unauthorized Legal Practice',
      desc: 'Providing unauthorized representation or misleading claims of bar certification.'
    },
    {
      id: 'confidentiality_breach',
      label: 'Breach of Confidentiality / Citizen Data',
      desc: 'Publicly publishing private case files, national ID numbers, or ongoing closed trial documents.'
    },
    {
      id: 'misleading_legal_advice',
      label: 'Misleading Legal Information',
      desc: 'Factually erroneous or deceptive legal advice that could harm citizens legally.'
    },
    {
      id: 'harassment',
      label: 'Harassment or Abuse',
      desc: 'Targeted hostility, threats, or abusive language towards individuals.'
    },
    {
      id: 'spam',
      label: 'Spam or Commercial Deception',
      desc: 'Unsolicited repetitive advertising or deceptive solicitations.'
    }
  ];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    submitReport(
      reportTarget.type,
      reportTarget.id,
      reportTarget.preview,
      category,
      details.trim() || 'No additional details provided.'
    );
    setIsSubmitted(true);
    setTimeout(() => {
      setIsSubmitted(false);
      setReportTarget(null);
    }, 1800);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-2 text-red-600">
            <Flag className="w-4 h-4" />
            <h2 className="text-sm font-bold text-slate-900">
              Report Content for Legal Compliance
            </h2>
          </div>
          <button
            onClick={() => setReportTarget(null)}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSubmitted ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-bold text-slate-900">
              Report Submitted to Compliance Queue
            </h3>
            <p className="text-xs text-slate-600">
              Our legal moderators and platform administrators will review this against the Rwandan legal practice ethical guidelines.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-4 space-y-3.5">
            <div className="bg-slate-50 border border-slate-200 p-2.5 rounded-xl text-xs text-slate-700">
              <span className="font-semibold text-slate-900 block mb-0.5">Target Preview:</span>
              <p className="italic text-slate-600 line-clamp-2">
                "{reportTarget.preview}"
              </p>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1.5">
                Select Compliance Violation Category:
              </label>
              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {categories.map(cat => (
                  <label
                    key={cat.id}
                    className={`flex items-start gap-2.5 p-2 rounded-xl border text-xs cursor-pointer transition ${
                      category === cat.id
                        ? 'border-blue-600 bg-blue-50/50 text-blue-950'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    <input
                      type="radio"
                      name="report_cat"
                      checked={category === cat.id}
                      onChange={() => setCategory(cat.id)}
                      className="mt-0.5 text-blue-600 focus:ring-blue-500"
                    />
                    <div>
                      <p className="font-bold">{cat.label}</p>
                      <p className="text-[11px] text-slate-500 leading-tight">
                        {cat.desc}
                      </p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Additional Context / Evidence (Optional):
              </label>
              <textarea
                value={details}
                onChange={e => setDetails(e.target.value)}
                placeholder="Explain the legal or factual reason for reporting this..."
                rows={2}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setReportTarget(null)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs transition cursor-pointer"
              >
                Submit Report
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
