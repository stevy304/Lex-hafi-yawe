import React, { useState } from 'react';
import {
  Shield,
  Users,
  ShieldCheck,
  Flag,
  FileCheck,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  History,
  Activity,
  Award,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    posts,
    reports,
    resolveReport,
    verificationApplications,
    approveVerification,
    rejectVerification,
    auditLogs,
    communities,
    appointments,
    currentUser
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'moderation' | 'audit'>('overview');
  const [inspectDoc, setInspectDoc] = useState<{ title: string; subtitle: string; details: string; applicantName: string } | null>(null);

  const pendingVerifications = verificationApplications.filter(v => v.status === 'pending');
  const pendingReports = reports.filter(r => r.status === 'pending');
  const verifiedAdvocatesCount = users.filter(u => u.role === 'advocate' && u.isVerified).length;

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Top Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-900 text-white rounded-xl">
              <Shield className="w-5 h-5 text-amber-400" />
            </div>
            <div>
              <h1 className="text-lg font-black text-slate-900">
                Platform Operations & Trust Management
              </h1>
              <p className="text-2xs text-slate-500 font-semibold">
                Access Level: {currentUser?.role === 'admin' ? `Administrator (${currentUser.name})` : 'Public Auditor (Read-Only Compliance Preview)'}
              </p>
            </div>
          </div>

          <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2.5 py-1 rounded-full border border-emerald-200">
            Active System Integrity Monitor
          </span>
        </div>

        {/* Navigation Tabs */}
        <div className="flex gap-2 mt-4 text-xs font-bold">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'overview'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Metrics Overview
          </button>
          <button
            onClick={() => setActiveTab('verifications')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'verifications'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Bar Verifications</span>
            {pendingVerifications.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-amber-400 text-slate-950 text-[10px] flex items-center justify-center font-black">
                {pendingVerifications.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('moderation')}
            className={`px-3.5 py-1.5 rounded-xl transition flex items-center gap-1.5 ${
              activeTab === 'moderation'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            <span>Reports & Compliance</span>
            {pendingReports.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-red-600 text-white text-[10px] flex items-center justify-center font-bold">
                {pendingReports.length}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab('audit')}
            className={`px-3.5 py-1.5 rounded-xl transition ${
              activeTab === 'audit'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Audit Log
          </button>
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4 sm:p-6 max-w-4xl space-y-6">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                  Total Users
                </span>
                <p className="text-xl font-black text-slate-900 mt-1">
                  {users.length.toLocaleString()}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Citizens & Advocates</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                  Verified Advocates
                </span>
                <p className="text-xl font-black text-blue-700 mt-1">
                  {verifiedAdvocatesCount}
                </p>
                <span className="text-[10px] text-blue-600 font-semibold">RBA Certified Roll</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                  Open Reports
                </span>
                <p className="text-xl font-black text-red-600 mt-1">
                  {pendingReports.length}
                </p>
                <span className="text-[10px] text-red-500 font-semibold">Requires review</span>
              </div>

              <div className="bg-white border border-slate-200 rounded-2xl p-4 shadow-xs">
                <span className="text-2xs font-bold uppercase tracking-wider text-slate-500">
                  Consultations
                </span>
                <p className="text-xl font-black text-emerald-700 mt-1">
                  {appointments.length}
                </p>
                <span className="text-[10px] text-emerald-600 font-semibold">Scheduled / Held</span>
              </div>
            </div>

            {/* Platform Compliance Status */}
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-xs">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-800 mb-3 flex items-center gap-1.5">
                <Activity className="w-4 h-4 text-blue-600" />
                <span>Regulatory Standards Compliance Checklist</span>
              </h3>

              <div className="space-y-2 text-xs">
                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Rwanda Bar Association (RBA) Roll Synchronization</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Active</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>Law N° 058/2021 Data Protection & Privacy Compliance</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Compliant</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 border border-slate-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
                    <span>MINIJUST MAJ Access to Justice Direct Referrals API</span>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">Connected</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VERIFICATIONS QUEUE TAB */}
        {activeTab === 'verifications' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Pending Advocate Bar Credentials Verification ({pendingVerifications.length})
            </h3>

            {pendingVerifications.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                No pending bar verification requests at this moment.
              </div>
            ) : (
              pendingVerifications.map(app => (
                <div
                  key={app.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <h4 className="text-sm font-bold text-slate-900">{app.fullName}</h4>
                      <p className="text-xs text-blue-700 font-semibold">
                        Bar Roll: {app.barRollNumber} • {app.lawFirmName}
                      </p>
                      <p className="text-2xs text-slate-500">
                        Experience: {app.yearsOfExperience} years • Areas: {app.practiceAreas.join(', ')}
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[10px] font-bold rounded-full">
                      Pending Bar Roll Audit
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-2xs text-slate-600">
                    <button
                      type="button"
                      onClick={() => setInspectDoc({
                        title: 'Bachelor of Laws (LL.B) Degree Certificate',
                        subtitle: 'National University of Rwanda / University of Rwanda (UR)',
                        details: `Degree conferred to ${app.fullName}. Verified curriculum in Rwandan Private & Public Law, Civil Procedure, and Commercial Arbitration.`,
                        applicantName: app.fullName
                      })}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Inspect LLB Degree</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setInspectDoc({
                        title: 'Rwanda Bar Association (RBA) Practicing Certificate',
                        subtitle: `Roll Number: ${app.barRollNumber}`,
                        details: `Official annual practicing certificate issued by the Rwanda Bar Association Secretariat. Roll Registration: ${app.barRollNumber} for ${app.fullName} at ${app.lawFirmName}.`,
                        applicantName: app.fullName
                      })}
                      className="px-2.5 py-1.5 bg-slate-100 hover:bg-blue-50 hover:text-blue-700 rounded-lg flex items-center gap-1 font-semibold transition cursor-pointer"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-blue-600" />
                      <span>Inspect RBA Bar Certificate</span>
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => rejectVerification(app.id, 'Bar certificate roll verification failed.')}
                      className="px-3.5 py-1.5 text-xs text-red-600 hover:bg-red-50 rounded-xl font-bold"
                    >
                      Reject Application
                    </button>
                    <button
                      onClick={() => approveVerification(app.id, 'Confirmed against active Rwanda Bar Association Roll.')}
                      className="px-4 py-1.5 text-xs font-bold bg-blue-700 hover:bg-blue-800 text-white rounded-xl shadow-xs"
                    >
                      Approve & Grant Advocate Status
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* MODERATION QUEUE TAB */}
        {activeTab === 'moderation' && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Reported Content & Compliance Review Queue ({pendingReports.length})
            </h3>

            {pendingReports.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200 text-xs text-slate-500">
                All reported items have been investigated and resolved!
              </div>
            ) : (
              pendingReports.map(report => (
                <div
                  key={report.id}
                  className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <span className="text-[10px] font-bold uppercase tracking-wider bg-red-100 text-red-800 px-2 py-0.5 rounded">
                        {report.category.replace('_', ' ')}
                      </span>
                      <p className="text-xs text-slate-800 mt-1.5 font-medium">
                        <strong>Reason:</strong> {report.details}
                      </p>
                    </div>
                    <span className="text-2xs text-slate-400">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-2xs text-slate-700 italic">
                    "{report.targetPreview}"
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => resolveReport(report.id, false, 'Report reviewed and determined non-violating.')}
                      className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl font-semibold"
                    >
                      Dismiss Report
                    </button>
                    <button
                      onClick={() => resolveReport(report.id, true, 'Violation confirmed. Content removed and user warned.')}
                      className="px-4 py-1.5 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-xs"
                    >
                      Enforce Removal & Warning
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
              <History className="w-4 h-4 text-blue-600" />
              <span>Immutable System Operations Audit Trail</span>
            </h3>

            <div className="divide-y divide-slate-100 text-xs">
              {auditLogs.map(log => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-2xs font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <p className="font-semibold text-slate-900 mt-0.5">{log.target}</p>
                    <p className="text-2xs text-slate-500">{log.details}</p>
                  </div>
                  <span className="text-2xs text-slate-400 shrink-0">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Credential Inspection Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-950/70 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900 leading-tight">
                    {inspectDoc.title}
                  </h3>
                  <p className="text-2xs text-slate-500 font-semibold mt-0.5">
                    {inspectDoc.subtitle}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectDoc(null)}
                className="p-1 text-slate-400 hover:text-slate-800 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 text-xs space-y-2">
              <p className="text-slate-800 leading-relaxed">
                {inspectDoc.details}
              </p>
              <div className="pt-2 border-t border-slate-200 text-2xs text-slate-500 flex items-center justify-between">
                <span>Applicant: <strong>{inspectDoc.applicantName}</strong></span>
                <span className="text-emerald-700 font-bold">● Validated Record Hash</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setInspectDoc(null)}
                className="px-4 py-2 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition shadow-xs"
              >
                Close Inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
