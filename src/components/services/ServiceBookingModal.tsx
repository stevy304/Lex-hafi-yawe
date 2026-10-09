import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, Video, Phone, ShieldCheck, Check } from 'lucide-react';
import { LegalService } from '../../types';
import { useApp } from '../../context/AppContext';

interface ServiceBookingModalProps {
  service: LegalService;
  onClose: () => void;
}

export const ServiceBookingModal: React.FC<ServiceBookingModalProps> = ({
  service,
  onClose
}) => {
  const { bookAppointment, users, currentUser, openLoginModal } = useApp();

  const provider = users.find(u => u.id === service.providerId);

  const [date, setDate] = useState('2026-10-15');
  const [timeSlot, setTimeSlot] = useState('10:00 AM - 11:00 AM');
  const [format, setFormat] = useState<'in_person' | 'video' | 'phone'>('in_person');
  const [clientNotes, setClientNotes] = useState('');
  const [isSuccess, setIsSuccess] = useState(false);

  const slots = [
    '09:00 AM - 10:00 AM',
    '10:00 AM - 11:00 AM',
    '02:00 PM - 03:00 PM',
    '04:00 PM - 05:00 PM'
  ];

  const handleBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      openLoginModal();
      return;
    }
    bookAppointment(
      service.id,
      service.providerId,
      date,
      timeSlot,
      format,
      service.feeRWF,
      clientNotes.trim() || 'General consultation request.',
      service.title
    );
    setIsSuccess(true);
    setTimeout(() => {
      setIsSuccess(false);
      onClose();
    }, 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/60 backdrop-blur-xs">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Top Header */}
        <div className="px-4 py-3 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div>
            <h2 className="text-sm font-bold text-slate-900">
              Book Legal Consultation
            </h2>
            <span className="text-2xs text-slate-500">
              Privileged Client-Advocate Appointment
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-8 text-center space-y-3">
            <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
              <Check className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-slate-900">
              Consultation Booked Successfully!
            </h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              Your appointment with {provider?.name} has been confirmed. A private communication channel has been opened in Messages.
            </p>
          </div>
        ) : (
          <form onSubmit={handleBooking} className="p-4 space-y-3.5">
            {/* Service & Advocate summary */}
            <div className="bg-blue-50/70 border border-blue-200/80 rounded-xl p-3">
              <p className="text-xs font-bold text-slate-900">{service.title}</p>
              <div className="flex items-center justify-between text-2xs text-blue-900 mt-1">
                <span>Advocate: {provider?.name} ({provider?.barRollNumber})</span>
                <span className="font-extrabold text-blue-700 text-xs">
                  {service.feeRWF.toLocaleString()} RWF
                </span>
              </div>
            </div>

            {/* Date Selection */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Preferred Consultation Date
              </label>
              <input
                type="date"
                value={date}
                onChange={e => setDate(e.target.value)}
                min="2026-10-10"
                className="w-full text-xs border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Select Time Slot (Kigali Time, CAT)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {slots.map(slot => (
                  <button
                    key={slot}
                    type="button"
                    onClick={() => setTimeSlot(slot)}
                    className={`py-2 px-2.5 rounded-xl text-xs font-medium border text-center transition ${
                      timeSlot === slot
                        ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                        : 'border-slate-200 hover:bg-slate-50 text-slate-700'
                    }`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            </div>

            {/* Consultation Format */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Consultation Format
              </label>
              <div className="grid grid-cols-3 gap-2">
                <button
                  type="button"
                  onClick={() => setFormat('in_person')}
                  className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition ${
                    format === 'in_person'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <MapPin className="w-4 h-4 text-blue-600" />
                  <span>In-Person</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('video')}
                  className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition ${
                    format === 'video'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Video className="w-4 h-4 text-blue-600" />
                  <span>Video Call</span>
                </button>
                <button
                  type="button"
                  onClick={() => setFormat('phone')}
                  className={`p-2 rounded-xl border text-xs flex flex-col items-center gap-1 transition ${
                    format === 'phone'
                      ? 'border-blue-600 bg-blue-50 text-blue-900 font-bold'
                      : 'border-slate-200 text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <Phone className="w-4 h-4 text-blue-600" />
                  <span>Phone</span>
                </button>
              </div>
            </div>

            {/* Client Case Overview Notes */}
            <div>
              <label className="text-xs font-bold text-slate-800 block mb-1">
                Confidential Case Overview / Instructions
              </label>
              <textarea
                value={clientNotes}
                onChange={e => setClientNotes(e.target.value)}
                placeholder="Briefly state your legal issue or documents you wish to have reviewed..."
                rows={2}
                className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            {/* Confidentiality Notice */}
            <div className="flex items-center gap-2 text-2xs text-slate-500 bg-slate-50 p-2 rounded-lg">
              <ShieldCheck className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Protected under Rwanda Bar Association Advocate-Client privilege rules.
              </span>
            </div>

            {/* Bottom Actions */}
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={onClose}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
              >
                Cancel
              </button>
              {currentUser ? (
                <button
                  type="submit"
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Confirm & Schedule
                </button>
              ) : (
                <button
                  type="button"
                  onClick={openLoginModal}
                  className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition cursor-pointer"
                >
                  Sign In to Schedule
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
