import React, { useState } from 'react';
import {
  HeartHandshake,
  Search,
  Phone,
  Mail,
  MapPin,
  Clock,
  ShieldCheck,
  CheckCircle,
  FileText,
  AlertCircle,
  Check
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalAidProvider } from '../../types';

export const LegalAidView: React.FC = () => {
  const { legalAidProviders } = useApp();

  const [searchDistrict, setSearchDistrict] = useState('');
  const [selectedProvince, setSelectedProvince] = useState('All');
  const [inquiryModalProvider, setInquiryModalProvider] = useState<LegalAidProvider | null>(null);
  const [inquiryCitizenName, setInquiryCitizenName] = useState('');
  const [inquiryPhone, setInquiryPhone] = useState('');
  const [inquiryDescription, setInquiryDescription] = useState('');
  const [inquirySubmitted, setInquirySubmitted] = useState(false);

  const provinces = ['All', 'Kigali City', 'Southern Province', 'Northern Province', 'Western Province', 'Eastern Province'];

  const filteredProviders = legalAidProviders.filter(provider => {
    const matchesProvince = selectedProvince === 'All' || provider.province === selectedProvince;
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
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-emerald-900 to-teal-900 text-white px-4 sm:px-6 py-6">
        <div className="flex items-center gap-2 mb-2">
          <span className="p-2 bg-emerald-600 rounded-xl inline-flex text-white">
            <HeartHandshake className="w-5 h-5" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-emerald-300">
            Rwanda Free Legal Aid & Access to Justice (MAJ)
          </span>
        </div>
        <h1 className="text-xl sm:text-2xl font-black tracking-tight">
          Legal Aid & Pro Bono Directory
        </h1>
        <p className="text-xs text-emerald-100 max-w-2xl mt-1 leading-relaxed">
          The Ministry of Justice (MINIJUST) operates Access to Justice Bureaus (MAJ) across all 30 districts of Rwanda to provide 100% free legal counseling, local Abunzi mediation, and court assistance to vulnerable and indigent citizens.
        </p>

        {/* Emergency Hotlines Strip */}
        <div className="flex flex-wrap gap-3 mt-4 pt-4 border-t border-emerald-800/80 text-xs">
          <div className="bg-emerald-800/60 border border-emerald-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span>MINIJUST MAJ Hotline: <strong className="text-white">3922 (Toll-Free)</strong></span>
          </div>
          <div className="bg-emerald-800/60 border border-emerald-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span>Legal Aid Forum Hotline: <strong className="text-white">8435 (Toll-Free)</strong></span>
          </div>
          <div className="bg-emerald-800/60 border border-emerald-700/60 rounded-xl px-3 py-1.5 flex items-center gap-2">
            <Phone className="w-3.5 h-3.5 text-emerald-300" />
            <span>Haguruka Women & Children: <strong className="text-white">3456 (Toll-Free)</strong></span>
          </div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-3 flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchDistrict}
            onChange={e => setSearchDistrict(e.target.value)}
            placeholder="Search by District (e.g. Gasabo, Huye)..."
            className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <span className="text-xs text-slate-500 font-medium whitespace-nowrap">Province:</span>
          <select
            value={selectedProvince}
            onChange={e => setSelectedProvince(e.target.value)}
            className="text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-emerald-600"
          >
            {provinces.map(p => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Legal Aid Bureaus List */}
      <div className="p-4 sm:p-6 space-y-4 max-w-4xl">
        {filteredProviders.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-500">
              No legal aid offices found matching your district or province.
            </p>
          </div>
        ) : (
          filteredProviders.map(provider => (
            <div
              key={provider.id}
              className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-emerald-300 transition shadow-xs"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-3">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded">
                      {provider.type === 'maj_bureau' ? 'Government MAJ Bureau' : 'Accredited Legal Aid NGO'}
                    </span>
                    <span className="text-2xs text-slate-400">
                      Verified: {provider.lastVerifiedDate}
                    </span>
                  </div>
                  <h2 className="text-sm font-bold text-slate-900 mt-1">
                    {provider.name}
                  </h2>
                  <p className="text-2xs text-slate-500 flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    <span>{provider.address} ({provider.district} District, {provider.province})</span>
                  </p>
                </div>

                <div className="text-left sm:text-right">
                  <span className="inline-block px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
                    100% Free of Charge
                  </span>
                </div>
              </div>

              {/* Operating hours & Contact */}
              <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-2xs text-slate-600 bg-slate-50 p-2.5 rounded-xl mb-3">
                <div className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider.operatingHours}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Phone className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider.phone}</span>
                </div>
                <div className="flex items-center gap-1">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span>{provider.email}</span>
                </div>
              </div>

              {/* Services Offered */}
              <div className="mb-3">
                <h4 className="text-2xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                  Services Provided:
                </h4>
                <ul className="grid grid-cols-1 sm:grid-cols-2 gap-1 text-xs text-slate-700">
                  {provider.servicesOffered.map((svc, i) => (
                    <li key={i} className="flex items-start gap-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                      <span>{svc}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Eligibility Criteria */}
              <div className="border-t border-slate-100 pt-2.5 mb-3 text-2xs text-slate-600 space-y-1">
                <div>
                  <strong>Eligibility:</strong> {provider.eligibilityCriteria.join(' • ')}
                </div>
                <div>
                  <strong>Required Documents:</strong> {provider.requiredDocuments.join(', ')}
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
                <a
                  href={`tel:${provider.phone.replace(/[^0-9+]/g, '')}`}
                  className="px-3.5 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1.5"
                >
                  <Phone className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Call Office</span>
                </a>
                <button
                  onClick={() => setInquiryModalProvider(provider)}
                  className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold transition shadow-xs cursor-pointer"
                >
                  Request Legal Assistance
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Inquiry Form Modal */}
      {inquiryModalProvider && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <h3 className="text-sm font-bold text-slate-900">
              Submit Free Assistance Request to {inquiryModalProvider.district} MAJ
            </h3>

            {inquirySubmitted ? (
              <div className="text-center py-6 space-y-2">
                <div className="w-10 h-10 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                  <Check className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-900">
                  Request Dispatched to District Access to Justice Officer!
                </p>
                <p className="text-2xs text-slate-500">
                  You will receive an SMS confirmation or call within 24 hours.
                </p>
              </div>
            ) : (
              <form onSubmit={handleInquirySubmit} className="space-y-3">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Your Full Name
                  </label>
                  <input
                    type="text"
                    required
                    value={inquiryCitizenName}
                    onChange={e => setInquiryCitizenName(e.target.value)}
                    placeholder="e.g. Marie Mukamana"
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Phone Number (for SMS & Callback)
                  </label>
                  <input
                    type="tel"
                    required
                    value={inquiryPhone}
                    onChange={e => setInquiryPhone(e.target.value)}
                    placeholder="+250 78..."
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    Summary of Legal Issue (Confidential)
                  </label>
                  <textarea
                    required
                    value={inquiryDescription}
                    onChange={e => setInquiryDescription(e.target.value)}
                    placeholder="Describe your land, succession, labor, or family conflict..."
                    rows={3}
                    className="w-full text-xs border border-slate-200 rounded-xl p-2 focus:ring-1 focus:ring-emerald-600 focus:outline-none"
                  />
                </div>
                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setInquiryModalProvider(null)}
                    className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-bold bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl shadow-xs"
                  >
                    Submit Assistance Request
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
