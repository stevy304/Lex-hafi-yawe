import React, { useState } from 'react';
import {
  Briefcase,
  Search,
  Star,
  Clock,
  Calendar,
  MessageSquare,
  FileCheck,
  MapPin,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { LegalService } from '../../types';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { ServiceBookingModal } from './ServiceBookingModal';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

export const LegalServicesView: React.FC = () => {
  const {
    legalServices,
    users,
    currentUser,
    navigateToProfile,
    startOrGetConversationWithUser,
    openLoginModal,
    setActiveView,
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
    'Criminal Defense',
  ];

  const provinces = [
    'All',
    'Kigali City',
    'Northern Province',
    'Southern Province',
    'Eastern Province',
    'Nationwide',
  ];

  const filteredServices = legalServices.filter((s) => {
    const matchesArea =
      selectedPracticeArea === 'All' || s.practiceArea === selectedPracticeArea;
    const matchesProvince =
      selectedProvince === 'All' ||
      s.locationProvince === selectedProvince ||
      s.locationProvince === 'Nationwide';
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
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Legal Services"
        subtitle="Book verified advocates licensed by the Rwanda Bar Association"
      >
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search services..."
              className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] rounded-full pl-9 pr-3 py-1.5 focus:outline-none focus:border-[var(--accent)]"
            />
          </div>

          <div>
            <select
              value={selectedPracticeArea}
              onChange={(e) => setSelectedPracticeArea(e.target.value)}
              className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-full px-3 py-1.5 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {practiceAreas.map((area) => (
                <option key={area} value={area}>
                  {area === 'All' ? 'All practice areas' : area}
                </option>
              ))}
            </select>
          </div>

          <div>
            <select
              value={selectedProvince}
              onChange={(e) => setSelectedProvince(e.target.value)}
              className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] border border-[var(--border)] rounded-full px-3 py-1.5 focus:outline-none focus:border-[var(--accent)] cursor-pointer"
            >
              {provinces.map((prov) => (
                <option key={prov} value={prov}>
                  {prov === 'All' ? 'All provinces' : prov}
                </option>
              ))}
            </select>
          </div>
        </div>
      </PageHeader>

      <div className="p-4 space-y-3">
        {filteredServices.length === 0 ? (
          <EmptyState
            icon={<Briefcase className="w-6 h-6 text-[var(--muted)]" />}
            title="No services found"
            description="No legal services matching your filter criteria. Try clearing search filters."
          />
        ) : (
          filteredServices.map((service) => {
            const provider = users.find((u) => u.id === service.providerId);
            if (!provider) return null;

            return (
              <Card key={service.id}>
                {/* Header row with provider & fee */}
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3 mb-3">
                  <div className="flex items-start gap-3 min-w-0 flex-1">
                    <UserAvatar
                      user={provider}
                      size="lg"
                      onClick={() => navigateToProfile(provider.id)}
                    />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        <button
                          type="button"
                          onClick={() => navigateToProfile(provider.id)}
                          className="text-[14px] font-medium text-[var(--text)] hover:underline text-left truncate cursor-pointer"
                        >
                          {provider.name}
                        </button>
                        <VerificationBadge user={provider} size="sm" />
                      </div>
                      <p className="text-[12px] text-[var(--muted)] truncate m-0">
                        {provider.firmName} • {provider.barRollNumber}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5 text-[11px] text-[var(--muted)]">
                        {service.reviewsCount && service.reviewsCount > 0 ? (
                          <>
                            <span className="flex items-center gap-0.5 text-[var(--gold)] font-medium">
                              <Star className="w-3 h-3 fill-current" />
                              <span>{service.rating}</span>
                            </span>
                            <span>({service.reviewsCount} reviews)</span>
                            <span>•</span>
                          </>
                        ) : null}
                        <span className="flex items-center gap-0.5">
                          <MapPin className="w-3 h-3" />
                          <span>{service.locationProvince}</span>
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="text-left sm:text-right shrink-0">
                    <span className="text-[16px] font-semibold text-[var(--accent)] block">
                      {service.feeRWF.toLocaleString()} RWF
                    </span>
                    <span className="text-[11px] text-[var(--muted)] block">
                      {service.feeType === 'fixed' ? 'Fixed fee' : 'Custom quote'}
                    </span>
                  </div>
                </div>

                {/* Service Title & Practice Area */}
                <div className="mb-2">
                  <span className="text-[11px] font-medium text-[var(--gold)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded">
                    {service.practiceArea}
                  </span>
                  <h2 className="text-[15px] font-medium text-[var(--text)] mt-1.5 m-0">
                    {service.title}
                  </h2>
                </div>

                {/* Description */}
                <p className="text-[13px] text-[var(--muted)] leading-relaxed mb-3">
                  {service.description}
                </p>

                {/* Required Documents / Formats */}
                <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[8px] p-2.5 mb-3.5 space-y-1 text-[12px] text-[var(--muted)]">
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    <span>Estimated turnaround: <strong>{service.turnaroundTime}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <FileCheck className="w-3.5 h-3.5" />
                    <span>Required: {service.requirements.join(', ')}</span>
                  </div>
                </div>

                {/* Actions Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                  <div className="flex items-center gap-1.5 text-[11px] text-[var(--muted)]">
                    <span>Formats:</span>
                    {service.formats.map((fmt) => (
                      <span
                        key={fmt}
                        className="capitalize bg-[var(--bg)] border border-[var(--border)] text-[var(--text)] font-medium px-2 py-0.5 rounded"
                      >
                        {fmt.replace('_', ' ')}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleMessageProvider(provider.id)}
                      className="px-3.5 py-1.5 border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text)] rounded-full text-[12px] font-medium transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Ask question</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        if (!currentUser) openLoginModal();
                        else setBookingService(service);
                      }}
                      className="px-4 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                    >
                      <Calendar className="w-3.5 h-3.5" />
                      <span>Book consultation</span>
                    </button>
                  </div>
                </div>
              </Card>
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
