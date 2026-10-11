import React, { useState } from 'react';
import {
  HeartHandshake,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  CheckCircle,
  Check,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalAidProvider } from '../../types';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

export const LegalAidView: React.FC = () => {
  const { legalAidProviders } = useApp();

  const [searchDistrict, setSearchDistrict] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [inquiryModalProvider, setInquiryModalProvider] = useState<LegalAidProvider | null>(null);
  const [inquiryCitizenName, setInquiryCitizenName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryDescription, setInquiryDescription] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const provinces = [
    'All',
    'Kigali City',
    'Southern Province',
    'Northern Province',
    'Western Province',
    'Eastern Province',
  ];

  const filteredProviders = legalAidProviders.filter((provider) => {
    const matchesProvince =
      selectedProvince === 'All' || provider.province === selectedProvince;
    const matchesDistrict =
      provider.district.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      provider.name.toLowerCase().includes(searchDistrict.toLowerCase()) ||
      provider.address.toLowerCase().includes(searchDistrict.toLowerCase());
    return matchesProvince && matchesDistrict;
  });

  const handleInquirySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setInquirySubmitted(true);
    setTimeout(() => {
      setInquirySubmitted(false);
      setInquiryModalProvider(null);
      setInquiryCitizenName('');
      setInquiryPhone('');
      setInquiryDescription('');
    }, 2000);
  };

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Legal Aid (MAJ)"
        subtitle="Ministry of Justice Access to Justice Bureaus across all 30 districts"
      >
        <div className="flex flex-col sm:flex-row gap-2 items-center">
          <div className="relative flex-1 w-full">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchDistrict}
              onChange={(e) => setSearchDistrict(e.target.value)}
              placeholder="Search by district (e.g. Gasabo, Huye)..."
              className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] rounded-full pl-9 pr-3 py-1.5 focus:border-[var(--accent)] focus:outline-none"
            />
          </div>

          <div className="w-full sm:w-auto">
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-full px-3 py-1.5 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {provinces.map((p) => (
                <option key={p} value={p}>
                  {p === 'All' ? 'All provinces' : p}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PageHeader>

      <div className="p-4 space-y-4">
        {/* Hotlines Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-2.5 flex items-center gap-2 text-[12px]">
            <Phone className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="truncate">
              MAJ: <strong className="text-[var(--text)]">3922</strong>
            </span>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-2.5 flex items-center gap-2 text-[12px]">
            <Phone className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="truncate">
              LAF: <strong className="text-[var(--text)]">8435</strong>
            </span>
          </div>
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[10px] p-2.5 flex items-center gap-2 text-[12px]">
            <Phone className="w-3.5 h-3.5 text-[var(--accent)] shrink-0" />
            <span className="truncate">
              Haguruka: <strong className="text-[var(--text)]">3456</strong>
            </span>
          </div>
        </div>

        {/* Legal Aid Bureaus List */}
        <div className="space-y-3">
          {filteredProviders.length === 0 ? (
            <EmptyState
              icon={<HeartHandshake className="w-6 h-6 text-[var(--muted)]" />}
              title="No legal aid offices found"
              description="No offices found matching your district or province."
            />
          ) : (
            filteredProviders.map((provider) => (
              <Card key={provider.id}>
                {/* Header */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-medium text-[var(--ok-text)] bg-[var(--ok-bg)] px-2 py-0.5 rounded">
                        {provider.type === 'maj_bureau' ? 'Government MAJ bureau' : 'Accredited legal aid NGO'}
                      </span>
                      <span className="text-[11px] text-[var(--muted)]">
                        Verified: {provider.lastVerifiedDate}
                      </span>
                    </div>
                    <h2 className="text-[15px] font-semibold text-[var(--text)] mt-1.5">
                      {provider.name}
                    </h2>
                    <p className="text-[12px] text-[var(--muted)] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span>{provider.address} ({provider.district} District, {provider.province})</span>
                    </p>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="inline-block px-2.5 py-0.5 bg-[var(--ok-bg)] text-[var(--ok-text)] text-[11px] font-medium rounded-full">
                      Free of charge
                    </span>
                  </div>
                </div>

                {/* Operating hours & Contact */}
                <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-[12px] text-[var(--muted)] bg-[var(--bg)] p-2.5 rounded-[8px] mb-3 border border-[var(--border)]">
                  <div className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    <span>{provider.operatingHours}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{provider.phone}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{provider.email}</span>
                  </div>
                </div>

                {/* Services Offered */}
                <div className="mb-3">
                  <h4 className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-1.5 m-0">
                    Services provided:
                  </h4>
                  <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-[13px] text-[var(--text)] m-0 p-0 list-none">
                    {provider.servicesOffered.map((svc, i) => (
                      <li key={i} className="flex items-start gap-1.5">
                        <CheckCircle className="w-3.5 h-3.5 text-[var(--ok-text)] shrink-0 mt-0.5" />
                        <span>{svc}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Eligibility Criteria */}
                <div className="border-t border-[var(--border)] pt-2.5 mb-3 text-[12px] text-[var(--muted)] space-y-1">
                  <div>
                    <strong>Eligibility:</strong> {provider.eligibilityCriteria.join(' • ')}
                  </div>
                  <div>
                    <strong>Required documents:</strong> {provider.requiredDocuments.join(', ')}
                  </div>
                </div>

                {/* Action buttons */}
                <div className="flex items-center justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <a
                    href={`tel:${provider.phone.replace(/[^0-9+]/g, '')}`}
                    className="px-3.5 py-1.5 border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text)] rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5"
                  >
                    <Phone className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Call office</span>
                  </a>
                  <button
                    type="button"
                    onClick={() => setInquiryModalProvider(provider)}
                    className="px-4 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium transition-colors cursor-pointer"
                  >
                    Request assistance
                  </button>
                </div>
              </Card>
            ))
          )}
        </div>
      </div>

      {/* Inquiry Form Modal */}
      {inquiryModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[var(--text)] m-0">
                Request assistance: {inquiryModalProvider.district} MAJ
              </h3>
              <button
                type="button"
                onClick={() => setInquiryModalProvider(null)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {inquirySubmitted ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-10 h-10 bg-[var(--ok-bg)] text-[var(--ok-text)] rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-[14px] font-medium text-[var(--text)]">
                  Request dispatched to district legal aid officer
                </p>
                <p className="text-[12px] text-[var(--muted)]">
                  You will receive an SMS confirmation or call within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <div>
                  <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">
                    Your full name
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryCitizenName}
                    onChange={(e) => setInquiryCitizenName(e.target.value)}
                    placeholder="e.g. Marie Mukamana"
                    className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2 focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">
                    Phone number
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={(e) => setInquiryPhone(e.target.value)}
                    placeholder="078X XXX XXX"
                    className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2 focus:border-[var(--accent)] focus:outline-none"
                  />
                </div>

                <div>
                  <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">
                    Brief explanation of your dispute
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={inquiryDescription}
                    onChange={(e) => setInquiryDescription(e.target.value)}
                    placeholder="Describe your legal matter (land boundaries, inheritance, labor wage unpaid)..."
                    className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] p-2 focus:border-[var(--accent)] focus:outline-none resize-none"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => setInquiryModalProvider(null)}
                    className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white text-[13px] font-medium transition-colors cursor-pointer"
                  >
                    Submit request
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
