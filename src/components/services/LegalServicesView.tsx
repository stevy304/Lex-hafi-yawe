import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Filter,
  MapPin,
  Star,
  Clock,
  ShieldCheck,
  Calendar,
  MessageSquare,
  FileCheck
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalService } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { ServiceBookingModal } from './ServiceBookingModal';

export const LegalServicesView: React.FC = () => {
  const {
    legalServices,
    users,
    currentUser,
    navigateToProfile,
    startOrGetConversationWithUser,
    openLoginModal,
    setActiveView
  } = useApp();

  const [selectedPracticeArea, setSelectedPracticeArea] = useState<string>('All');
  const [selectedProvince, setSelectedProvince] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [bookingService, setBookingService] = useState<LegalService | null>(null);

  const practiceAreas = [
    'All',
    'Land & Property Conveyancing',
    'Commercial Law',
    'Labor Disputes',
    'Criminal Defense'
  ];

  const provinces = [
    'All',
    'Kigali City',
    'Northern Province',
    'Southern Province',
    'Eastern Province',
    'Nationwide'
  ];

  const filteredServices = legalServices.filter(s => {
    const matchesArea = selectedPracticeArea === 'All' || s.practiceArea === selectedPracticeArea;
    const matchesProvince = selectedProvince === 'All' || s.locationProvince === selectedProvince || s.locationProvince === 'Nationwide';
    const matchesSearch =
      s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesArea && matchesProvince && matchesSearch;
  });

  const handleMessageProvider = async (providerId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    await startOrGetConversationWithUser(providerId);
    setActiveView('messages');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center gap-2 mb-1">
          <Briefcase className="w-5 h-5 text-blue-700" />
          <h1 className="text-lg font-black text-slate-900">
            Legal Services Marketplace
          </h1>
        </div>
        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed">
          Book verified advocates licensed by the Rwanda Bar Association. All services feature transparent pricing in Rwandan Francs (RWF) and protected advocate-client confidentiality.
        </p>

        {/* Filters Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 mt-4">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder="Search legal services or issues..."
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
            />
          </div>

          <div>
            <select
              value={selectedPracticeArea}
              onChange={e => setSelectedPracticeArea(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {practiceAreas.map(area => (
                <option key={area} value={area}>
                  {area === 'All' ? 'All Practice Areas' : area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedProvince}
              onChange={e => setSelectedProvince(e.target.value)}
              className="w-full text-xs bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-slate-700 focus:outline-none focus:ring-1 focus:ring-blue-600"
            >
              {provinces.map(prov => (
                <option key={prov} value={prov}>
                  {prov === 'All' ? 'All Regions / Provinces' : prov}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Services Grid */}
      <div className="p-4 sm:p-6 space-y-4 max-w-4xl">
        {legalServices.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <Briefcase className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                Legal Practice Marketplace
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                No private advocate retainers have been listed yet. Licensed members of the Rwanda Bar Association can publish their practice areas, fixed consultation fees, and advisory offerings.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('legalaid')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Find Free Legal Aid (MAJ)
              </button>
              {currentUser?.role === 'advocate' ? (
                <button
                  type="button"
                  onClick={() => navigateToProfile(currentUser.id)}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
                >
                  Publish Service from Profile
                </button>
              ) : (
                <button
                  type="button"
                  onClick={() => setActiveView('laws')}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Consult Statutory Laws
                </button>
              )}
            </div>
          </div>
        ) : filteredServices.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-slate-200 p-6">
            <p className="text-xs text-slate-500">
              No legal services matching your filter criteria. Try clearing search filters.
            </p>
          </div>
        ) : (
          filteredServices.map(service => {
            const provider = users.find(u => u.id === service.providerId);
            if (!provider) return null;

            return (
              <div
                key={service.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 hover:border-blue-300 hover:shadow-sm transition"
              >
                {/* Header row with provider & fee */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3">
                    <UserAvatar
                      user={provider}
                      size="lg"
                      onClick={() => navigateToProfile(provider.id)}
                    />
                    <div>
                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => navigateToProfile(provider.id)}
                          className="text-xs font-bold text-slate-900 hover:underline text-left"
                        >
                          {provider.name}
                        </button>
                        <VerificationBadge user={provider} size="sm" />
                      </div>
                      <p className="text-[11px] text-slate-500">
                        {provider.firmName} • {provider.barRollNumber}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-2xs text-slate-500">
                        {service.reviewsCount && service.reviewsCount > 0 ? (
                          <>
                            <span className="flex items-center gap-0.5 text-amber-600 font-bold">
                              <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                              <span>{service.rating}</span>
                            </span>
                            <span>({service.reviewsCount} verified clients)</span>
                            <span>•</span>
                          </>
                        ) : (
                          <>
                            <span className="text-2xs text-blue-700 font-semibold bg-blue-50 px-1.5 py-0.5 rounded">
                              Bar Verified Counsel
                            </span>
                            <span>•</span>
                          </>
                        )}
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{service.locationProvince}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right bg-slate-50 sm:bg-transparent p-2.5 sm:p-0 rounded-xl">
                    <span className="text-base font-black text-blue-700 block">
                      {service.feeRWF.toLocaleString()} RWF
                    </span>
                    <span className="text-[10px] text-slate-500 block">
                      {service.feeType === 'fixed' ? 'Fixed Fee per Consultation' : 'Custom Quote'}
                    </span>
                  </div>
                </div>

                {/* Service Title & Practice Area */}
                <div className="mb-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {service.practiceArea}
                  </span>
                  <h2 className="text-sm font-bold text-slate-900 mt-1.5">
                    {service.title}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-xs text-slate-700 leading-relaxed mb-3">
                  {service.description}
                </p>

                {/* Required Documents / Formats */}
                <div className="bg-slate-50/70 border border-slate-100 rounded-xl p-2.5 mb-3.5 space-y-1 text-2xs text-slate-600">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>Estimated turnaround: <strong>{service.turnaroundTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Required: {service.requirements.join(', ')}</span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-2xs text-slate-500">
                    <span>Available formats:</span>
                    {service.formats.map(fmt => (
                      <span
                        key={fmt}
                        className="capitalize bg-slate-100 text-slate-700 font-medium px-2 py-0.5 rounded-md"
                      >
                        {fmt.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleMessageProvider(provider.id)}
                      className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold transition flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask Question</span>
                    </button>
                    <button
                      onClick={() => {
                        if (!currentUser) openLoginModal();
                        else setBookingService(service);
                      }}
                      className="px-4 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book Consultation</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Booking Modal */}
      {bookingService && (
        <ServiceBookingModal
          service={bookingService}
          onClose={() => setBookingService(null)}
        />
      )}
    </div>
  );
};
