import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  MessageSquare,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    currentUser,
    users,
    startOrGetConversationWithUser,
    setActiveView,
    openLoginModal,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [activeCallModal, setActiveCallModal] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text flex items-center justify-center">
        <EmptyState
          icon={<Calendar className="w-6 h-6 text-[var(--accent)]" />}
          title="Legal consultations and appointments"
          description="Sign in to view your scheduled advocate appointments, join video consultation rooms, or review past legal briefs."
          action={{
            label: 'Sign in to view schedule',
            onClick: openLoginModal,
          }}
        />
      </div>
    );
  }

  const myAppointments = appointments.filter(
    (apt) => apt.clientId === currentUser.id || apt.advocateId === currentUser.id
  );

  const filteredAppointments = myAppointments.filter((apt) => {
    if (filter === 'upcoming') return apt.status === 'confirmed' || apt.status === 'pending';
    if (filter === 'completed') return apt.status === 'completed' || apt.status === 'cancelled';
    return true;
  });

  const isAdvocate = currentUser.role === 'advocate';

  const handleMessage = async (otherUserId: string) => {
    await startOrGetConversationWithUser(otherUserId);
    setActiveView('messages');
  };

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Appointments"
        subtitle="Manage scheduled legal consultations and client advisory meetings"
      >
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            All ({myAppointments.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('upcoming')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'upcoming'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Upcoming
          </button>
          <button
            type="button"
            onClick={() => setFilter('completed')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'completed'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Completed
          </button>
        </div>
      </PageHeader>

      <div className="p-4 space-y-3">
        {filteredAppointments.length === 0 ? (
          <EmptyState
            icon={<Calendar className="w-6 h-6 text-[var(--muted)]" />}
            title="No scheduled consultations"
            description="When you schedule an appointment with a verified advocate, meeting credentials and details will appear here."
            action={{
              label: 'Browse marketplace',
              onClick: () => setActiveView('services'),
            }}
          />
        ) : (
          filteredAppointments.map((apt) => {
            const client = users.find((u) => u.id === apt.clientId);
            const advocate = users.find((u) => u.id === apt.advocateId);
            const partner = isAdvocate ? client : advocate;

            return (
              <Card key={apt.id}>
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2 mb-2">
                  <div>
                    <span
                      className={`text-[11px] font-medium uppercase tracking-wider px-2 py-0.5 rounded ${
                        apt.status === 'confirmed'
                          ? 'bg-[var(--ok-bg)] text-[var(--ok-text)]'
                          : apt.status === 'completed'
                          ? 'bg-[var(--surface)] text-[var(--gold)] border border-[var(--border)]'
                          : apt.status === 'cancelled'
                          ? 'bg-[var(--danger)]/15 text-[var(--danger)]'
                          : 'bg-[var(--surface)] text-[var(--muted)] border border-[var(--border)]'
                      }`}
                    >
                      ● {apt.status}
                    </span>
                    <h3 className="text-[15px] font-semibold text-[var(--text)] mt-1.5 m-0">
                      {apt.serviceTitle}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-[15px] font-semibold text-[var(--accent)] block">
                      {apt.feeRWF.toLocaleString()} RWF
                    </span>
                    <span className="text-[11px] text-[var(--muted)] block">
                      Consultation honorarium
                    </span>
                  </div>
                </div>

                {/* Partner info */}
                {partner && (
                  <div className="flex items-center gap-2.5 bg-[var(--bg)] p-2.5 rounded-[10px] border border-[var(--border)] my-2">
                    <UserAvatar user={partner} size="sm" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] font-medium text-[var(--text)] truncate">{partner.name}</span>
                        <VerificationBadge user={partner} size="sm" />
                      </div>
                      <span className="text-[11px] text-[var(--muted)] block truncate">
                        {isAdvocate ? 'Client' : `Advocate • ${partner.barRollNumber || 'RBA'}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Time, Format & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[12px] text-[var(--muted)] bg-[var(--bg)] p-2.5 rounded-[10px] border border-[var(--border)] mb-2">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Date: <strong className="text-[var(--text)]">{apt.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>Time: <strong className="text-[var(--text)]">{apt.timeSlot}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {apt.format === 'in_person' ? (
                      <MapPin className="w-3.5 h-3.5 text-[var(--accent)]" />
                    ) : apt.format === 'video' ? (
                      <Video className="w-3.5 h-3.5 text-[var(--accent)]" />
                    ) : (
                      <Phone className="w-3.5 h-3.5 text-[var(--accent)]" />
                    )}
                    <span className="capitalize">
                      Format: <strong className="text-[var(--text)]">{apt.format.replace('_', ' ')}</strong>
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {apt.clientNotes && (
                  <div className="text-[12px] text-[var(--muted)] border-l-2 border-[var(--accent)] pl-2 py-0.5 my-2">
                    <strong>Client instructions:</strong> {apt.clientNotes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-[var(--border)]">
                  <button
                    type="button"
                    onClick={() => handleMessage(isAdvocate ? apt.clientId : apt.advocateId)}
                    className="px-3.5 py-1.5 border border-[var(--border)] hover:bg-[var(--hover)] text-[var(--text)] rounded-full text-[12px] font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message {isAdvocate ? 'client' : 'advocate'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {apt.format === 'video' && apt.status === 'confirmed' && (
                      <button
                        type="button"
                        onClick={() => setActiveCallModal(apt.id)}
                        className="px-3.5 py-1.5 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium flex items-center gap-1.5 cursor-pointer"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join consultation room</span>
                      </button>
                    )}

                    {apt.status === 'confirmed' && (
                      <>
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(apt.id, 'cancelled', 'Cancelled by user request.')}
                          className="px-3.5 py-1.5 text-[12px] text-[var(--danger)] hover:bg-[var(--hover)] rounded-full font-medium cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          type="button"
                          onClick={() => updateAppointmentStatus(apt.id, 'completed', 'Consultation finished.')}
                          className="px-3.5 py-1.5 bg-[var(--ok-bg)] text-[var(--ok-text)] hover:opacity-90 rounded-full text-[12px] font-medium cursor-pointer"
                        >
                          Mark completed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>

      {/* Video Call Modal Simulation */}
      {activeCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-6 w-full max-w-lg text-[var(--text)] text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-[var(--accent)]/20 text-[var(--accent)] flex items-center justify-center mx-auto animate-pulse">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-[18px] font-semibold m-0">
              Lex Hafi Yawe consultation room
            </h3>
            <p className="text-[13px] text-[var(--muted)] m-0 leading-normal">
              Encrypted connection established with client and advocate. Privileged attorney-client session in progress.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                type="button"
                onClick={() => setActiveCallModal(null)}
                className="px-6 py-2 bg-[var(--danger)] hover:opacity-90 text-white rounded-full text-[13px] font-medium cursor-pointer"
              >
                End call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
