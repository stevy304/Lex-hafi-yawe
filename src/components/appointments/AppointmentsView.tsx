import React, { useState } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  Video,
  Phone,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  UserCheck,
  LogIn,
  RotateCcw
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';

export const AppointmentsView: React.FC = () => {
  const {
    appointments,
    updateAppointmentStatus,
    currentUser,
    users,
    startOrGetConversationWithUser,
    setActiveView,
    openLoginModal
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'upcoming' | 'completed'>('all');
  const [activeCallModal, setActiveCallModal] = useState<string | null>(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center">
        <div>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <Calendar className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Legal Consultations & Appointments
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Sign in to view your scheduled advocate appointments, join video consultation rooms, or review past legal briefs.
          </p>
          <button
            onClick={openLoginModal}
            className="px-5 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition flex items-center gap-2 mx-auto cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to View Schedule</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter appointments involving currentUser
  const myAppointments = appointments.filter(
    apt => apt.clientId === currentUser.id || apt.advocateId === currentUser.id
  );

  const filteredAppointments = myAppointments.filter(apt => {
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
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-blue-700" />
            <h1 className="text-lg font-black text-slate-900">
              Legal Consultations & Appointments
            </h1>
          </div>

          <div className="flex gap-1.5 text-xs font-semibold">
            <button
              onClick={() => setFilter('all')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'all'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              All ({myAppointments.length})
            </button>
            <button
              onClick={() => setFilter('upcoming')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'upcoming'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Upcoming
            </button>
            <button
              onClick={() => setFilter('completed')}
              className={`px-3 py-1 rounded-lg transition ${
                filter === 'completed'
                  ? 'bg-blue-700 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              Completed
            </button>
          </div>
        </div>

        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mt-1">
          Manage your scheduled client-advocate advisory meetings, format arrangements, and privileged consultations in Rwanda.
        </p>
      </div>

      {/* Appointments Stream */}
      <div className="p-4 sm:p-6 space-y-4 max-w-4xl">
        {filteredAppointments.length === 0 ? (
          <div className="bg-white rounded-3xl border border-slate-200/90 p-8 text-center space-y-4 shadow-xs">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center mx-auto">
              <Calendar className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900">
                No Scheduled Consultations
              </h3>
              <p className="text-xs text-slate-600 max-w-md mx-auto mt-1 leading-relaxed">
                You do not have any pending or completed legal advisory meetings. When you schedule an appointment with a verified advocate, meeting credentials and details will appear here.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setActiveView('services')}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Find an Advocate in Marketplace
              </button>
              <button
                type="button"
                onClick={() => setActiveView('legalaid')}
                className="px-4 py-2 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl transition shadow-xs cursor-pointer"
              >
                Access Free MAJ Assistance
              </button>
            </div>
          </div>
        ) : (
          filteredAppointments.map(apt => {
            const client = users.find(u => u.id === apt.clientId);
            const advocate = users.find(u => u.id === apt.advocateId);
            const partner = isAdvocate ? client : advocate;

            return (
              <div
                key={apt.id}
                className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                  <div>
                    <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                      apt.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : apt.status === 'completed'
                        ? 'bg-blue-100 text-blue-800'
                        : apt.status === 'cancelled'
                        ? 'bg-red-100 text-red-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}>
                      ● {apt.status.toUpperCase()}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">
                      {apt.serviceTitle}
                    </h3>
                  </div>

                  <div className="text-left sm:text-right">
                    <span className="text-sm font-black text-blue-700">
                      {apt.feeRWF.toLocaleString()} RWF
                    </span>
                    <span className="text-[10px] text-slate-400 block">
                      Consultation Honorarium
                    </span>
                  </div>
                </div>

                {/* Partner info */}
                {partner && (
                  <div className="flex items-center gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                    <UserAvatar user={partner} size="sm" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900">{partner.name}</span>
                        <VerificationBadge user={partner} size="sm" />
                      </div>
                      <span className="text-2xs text-slate-500">
                        {isAdvocate ? 'Client' : `Advocate • ${partner.barRollNumber || 'RBA'}`}
                      </span>
                    </div>
                  </div>
                )}

                {/* Time, Format & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-2xs text-slate-600 bg-slate-50/70 p-2.5 rounded-xl">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-blue-600" />
                    <span>Date: <strong>{apt.date}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-blue-600" />
                    <span>Time: <strong>{apt.timeSlot}</strong></span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {apt.format === 'in_person' ? (
                      <MapPin className="w-3.5 h-3.5 text-blue-600" />
                    ) : apt.format === 'video' ? (
                      <Video className="w-3.5 h-3.5 text-blue-600" />
                    ) : (
                      <Phone className="w-3.5 h-3.5 text-blue-600" />
                    )}
                    <span className="capitalize">
                      Format: <strong>{apt.format.replace('_', ' ')}</strong>
                    </span>
                  </div>
                </div>

                {/* Notes */}
                {apt.clientNotes && (
                  <div className="text-2xs text-slate-700 border-l-2 border-blue-600 pl-2 py-0.5">
                    <strong>Client Instructions:</strong> {apt.clientNotes}
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    onClick={() => handleMessage(isAdvocate ? apt.clientId : apt.advocateId)}
                    className="px-3 py-1.5 border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-xl text-xs font-semibold flex items-center gap-1.5"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Message {isAdvocate ? 'Client' : 'Advocate'}</span>
                  </button>

                  <div className="flex items-center gap-2">
                    {apt.format === 'video' && apt.status === 'confirmed' && (
                      <button
                        onClick={() => setActiveCallModal(apt.id)}
                        className="px-3.5 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <Video className="w-3.5 h-3.5" />
                        <span>Join Secure Room</span>
                      </button>
                    )}

                    {apt.status === 'confirmed' && (
                      <>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'cancelled', 'Cancelled by user request.')}
                          className="px-3 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-bold cursor-pointer"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => updateAppointmentStatus(apt.id, 'completed', 'Consultation finished.')}
                          className="px-3 py-1.5 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer"
                        >
                          Mark Completed
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Video Call Modal Simulation */}
      {activeCallModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm">
          <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 w-full max-w-lg text-white text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-blue-600 flex items-center justify-center mx-auto text-white animate-pulse">
              <Video className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold">
              Lex Hafi Yawe Encrypted Video Consultation
            </h3>
            <p className="text-xs text-slate-400">
              Encrypted peer connection established with client & advocate. Privileged attorney-client session in progress.
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={() => setActiveCallModal(null)}
                className="px-6 py-2 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-bold"
              >
                End Call
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
