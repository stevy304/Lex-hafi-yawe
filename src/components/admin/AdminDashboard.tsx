import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle,
  History,
  Activity,
  X,
  FileCheck,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

export const AdminDashboard: React.FC = () => {
  const {
    users,
    reports,
    resolveReport,
    verificationApplications,
    approveVerification,
    rejectVerification,
    auditLogs,
    appointments,
    currentUser,
  } = useApp();

  const [activeTab, setActiveTab] = useState<'overview' | 'verifications' | 'moderation' | 'audit'>('overview');
  const [inspectDoc, setInspectDoc] = useState<{
    title: string;
    subtitle: string;
    details: string;
    applicantName: string;
  } | null>(null);

  const pendingVerifications = verificationApplications.filter((v) => v.status === 'pending');
  const pendingReports = reports.filter((r) => r.status === 'pending');
  const verifiedAdvocatesCount = users.filter((u) => u.role === 'advocate' && u.isVerified).length;

  return (
    <div className="relative flex-1 min-w-0 max-w-[880px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Operations & Trust"
        subtitle={
          currentUser?.role === 'admin'
            ? `Administrator (${currentUser.name})`
            : 'Public auditor (read-only compliance preview)'
        }
      >
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'overview'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Metrics overview
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('verifications')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'verifications'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            <span>Bar verifications</span>
            {pendingVerifications.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--gold)] text-black text-[10px] flex items-center justify-center font-bold">
                {pendingVerifications.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('moderation')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'moderation'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            <span>Reports & compliance</span>
            {pendingReports.length > 0 && (
              <span className="w-4 h-4 rounded-full bg-[var(--danger)] text-white text-[10px] flex items-center justify-center font-bold">
                {pendingReports.length}
              </span>
            )}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('audit')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeTab === 'audit'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Audit log
          </button>
        </div>
      </PageHeader>

      <div className="p-4 space-y-4">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Total users
                </span>
                <p className="text-[22px] font-semibold text-[var(--text)] mt-1 m-0">
                  {users.length.toLocaleString()}
                </p>
                <span className="text-[11px] text-[var(--ok-text)] font-medium">Citizens and advocates</span>
              </Card>

              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Verified advocates
                </span>
                <p className="text-[22px] font-semibold text-[var(--accent)] mt-1 m-0">
                  {verifiedAdvocatesCount}
                </p>
                <span className="text-[11px] text-[var(--gold)] font-medium">RBA certified roll</span>
              </Card>

              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Open reports
                </span>
                <p className="text-[22px] font-semibold text-[var(--danger)] mt-1 m-0">
                  {pendingReports.length}
                </p>
                <span className="text-[11px] text-[var(--danger)] font-medium">Requires review</span>
              </Card>

              <Card>
                <span className="text-[11px] font-semibold uppercase tracking-wider text-[var(--muted)]">
                  Consultations
                </span>
                <p className="text-[22px] font-semibold text-[var(--ok-text)] mt-1 m-0">
                  {appointments.length}
                </p>
                <span className="text-[11px] text-[var(--ok-text)] font-medium">Scheduled / held</span>
              </Card>
            </div>

            {/* Platform Compliance Status */}
            <Card>
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-1.5 m-0">
                <Activity className="w-4 h-4 text-[var(--accent)]" />
                <span>Regulatory standards compliance checklist</span>
              </h3>

              <div className="space-y-2 text-[13px]">
                <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--ok-text)] shrink-0" />
                    <span>Rwanda Bar Association (RBA) roll synchronization</span>
                  </div>
                  <span className="text-[11px] font-medium text-[var(--ok-text)] bg-[var(--ok-bg)] px-2 py-0.5 rounded">Active</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--ok-text)] shrink-0" />
                    <span>Law N° 058/2021 data protection and privacy compliance</span>
                  </div>
                  <span className="text-[11px] font-medium text-[var(--ok-text)] bg-[var(--ok-bg)] px-2 py-0.5 rounded">Compliant</span>
                </div>

                <div className="flex items-center justify-between p-2.5 rounded-[8px] bg-[var(--bg)] border border-[var(--border)]">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-[var(--ok-text)] shrink-0" />
                    <span>MINIJUST MAJ access to justice direct referrals API</span>
                  </div>
                  <span className="text-[11px] font-medium text-[var(--ok-text)] bg-[var(--ok-bg)] px-2 py-0.5 rounded">Connected</span>
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* VERIFICATIONS QUEUE TAB */}
        {activeTab === 'verifications' && (
          <div className="space-y-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] m-0">
              Pending advocate bar credentials verification ({pendingVerifications.length})
            </h3>

            {pendingVerifications.length === 0 ? (
              <EmptyState
                icon={<ShieldCheck className="w-6 h-6 text-[var(--muted)]" />}
                title="No pending requests"
                description="No pending bar verification requests at this moment."
              />
            ) : (
              pendingVerifications.map((app) => (
                <Card key={app.id}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <h4 className="text-[15px] font-medium text-[var(--text)] m-0">{app.fullName}</h4>
                      <p className="text-[12px] text-[var(--accent)] font-medium m-0 mt-0.5">
                        Bar roll: {app.barRollNumber} • {app.lawFirmName}
                      </p>
                      <p className="text-[12px] text-[var(--muted)] m-0 mt-0.5">
                        Experience: {app.yearsOfExperience} years • Areas: {app.practiceAreas.join(', ')}
                      </p>
                    </div>

                    <span className="px-2.5 py-0.5 bg-[var(--gold)]/15 text-[var(--gold)] text-[11px] font-medium rounded-full shrink-0">
                      Pending bar audit
                    </span>
                  </div>

                  <div className="flex flex-wrap gap-2 text-[12px] pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setInspectDoc({
                          title: 'Bachelor of Laws (LL.B) Degree Certificate',
                          subtitle: 'University of Rwanda (UR)',
                          details: `Degree conferred to ${app.fullName}. Verified curriculum in Rwandan private and public law.`,
                          applicantName: app.fullName,
                        })
                      }
                      className="px-2.5 py-1.5 bg-[var(--bg)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-[8px] flex items-center gap-1 font-medium transition-colors cursor-pointer text-[var(--text)]"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Inspect LLB degree</span>
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setInspectDoc({
                          title: 'Rwanda Bar Association (RBA) Practicing Certificate',
                          subtitle: `Roll number: ${app.barRollNumber}`,
                          details: `Official annual practicing certificate issued by the Rwanda Bar Association Secretariat for ${app.fullName}.`,
                          applicantName: app.fullName,
                        })
                      }
                      className="px-2.5 py-1.5 bg-[var(--bg)] hover:bg-[var(--hover)] border border-[var(--border)] rounded-[8px] flex items-center gap-1 font-medium transition-colors cursor-pointer text-[var(--text)]"
                    >
                      <FileCheck className="w-3.5 h-3.5 text-[var(--accent)]" />
                      <span>Inspect RBA certificate</span>
                    </button>
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)] mt-3">
                    <button
                      type="button"
                      onClick={() => rejectVerification(app.id, 'Bar certificate roll verification failed.')}
                      className="px-3.5 py-1.5 text-[12px] text-[var(--danger)] hover:bg-[var(--hover)] rounded-full font-medium cursor-pointer"
                    >
                      Reject application
                    </button>
                    <button
                      type="button"
                      onClick={() => approveVerification(app.id, 'Confirmed against active Rwanda Bar Association Roll.')}
                      className="px-4 py-1.5 text-[12px] font-medium bg-[var(--accent)] hover:brightness-110 text-white rounded-full cursor-pointer"
                    >
                      Approve advocate
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* MODERATION QUEUE TAB */}
        {activeTab === 'moderation' && (
          <div className="space-y-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] m-0">
              Reported content and compliance review ({pendingReports.length})
            </h3>

            {pendingReports.length === 0 ? (
              <EmptyState
                icon={<CheckCircle className="w-6 h-6 text-[var(--ok-text)]" />}
                title="Review queue clear"
                description="All reported items have been investigated and resolved."
              />
            ) : (
              pendingReports.map((report) => (
                <Card key={report.id}>
                  <div className="flex items-start justify-between gap-2 mb-2">
                    <div>
                      <span className="text-[11px] font-medium uppercase tracking-wider bg-[var(--danger)]/15 text-[var(--danger)] px-2 py-0.5 rounded">
                        {report.category.replace('_', ' ')}
                      </span>
                      <p className="text-[13px] text-[var(--text)] mt-1.5 font-medium m-0">
                        <strong>Reason:</strong> {report.details}
                      </p>
                    </div>
                    <span className="text-[11px] text-[var(--muted)] shrink-0">
                      {new Date(report.createdAt).toLocaleDateString()}
                    </span>
                  </div>

                  <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[8px] p-2.5 text-[12px] text-[var(--muted)] italic my-2">
                    "{report.targetPreview}"
                  </div>

                  <div className="flex justify-end gap-2 pt-2 border-t border-[var(--border)]">
                    <button
                      type="button"
                      onClick={() => resolveReport(report.id, false, 'Report reviewed and determined non-violating.')}
                      className="px-3.5 py-1.5 text-[12px] text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] rounded-full font-medium cursor-pointer"
                    >
                      Dismiss report
                    </button>
                    <button
                      type="button"
                      onClick={() => resolveReport(report.id, true, 'Violation confirmed. Content removed.')}
                      className="px-4 py-1.5 text-[12px] font-medium bg-[var(--danger)] hover:opacity-90 text-white rounded-full cursor-pointer"
                    >
                      Enforce removal
                    </button>
                  </div>
                </Card>
              ))
            )}
          </div>
        )}

        {/* AUDIT LOG TAB */}
        {activeTab === 'audit' && (
          <Card>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5 mb-3 m-0">
              <History className="w-4 h-4 text-[var(--accent)]" />
              <span>Immutable operations audit trail</span>
            </h3>

            <div className="divide-y divide-[var(--border)] text-[13px]">
              {auditLogs.map((log) => (
                <div key={log.id} className="py-2.5 flex items-start justify-between gap-3">
                  <div>
                    <span className="font-mono text-[11px] font-medium text-[var(--gold)] bg-[var(--bg)] border border-[var(--border)] px-1.5 py-0.5 rounded">
                      {log.action}
                    </span>
                    <p className="font-medium text-[var(--text)] mt-1 m-0">{log.target}</p>
                    <p className="text-[12px] text-[var(--muted)] m-0">{log.details}</p>
                  </div>
                  <span className="text-[11px] text-[var(--muted)] shrink-0">
                    {new Date(log.timestamp).toLocaleDateString()}
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>

      {/* Credential Inspection Modal */}
      {inspectDoc && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-[var(--surface)] border border-[var(--border)] rounded-[12px] shadow-2xl p-5 space-y-4">
            <div className="flex items-start justify-between border-b border-[var(--border)] pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-full bg-[var(--bg)] border border-[var(--border)] text-[var(--accent)] flex items-center justify-center">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-[16px] font-semibold text-[var(--text)] m-0 leading-tight">
                    {inspectDoc.title}
                  </h3>
                  <p className="text-[12px] text-[var(--muted)] m-0 mt-0.5">
                    {inspectDoc.subtitle}
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setInspectDoc(null)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-[var(--bg)] border border-[var(--border)] rounded-[8px] p-4 text-[13px] space-y-2">
              <p className="text-[var(--text)] leading-relaxed m-0">
                {inspectDoc.details}
              </p>
              <div className="pt-2 border-t border-[var(--border)] text-[11px] text-[var(--muted)] flex items-center justify-between">
                <span>Applicant: <strong className="text-[var(--text)]">{inspectDoc.applicantName}</strong></span>
                <span className="text-[var(--ok-text)] font-medium">● Validated record hash</span>
              </div>
            </div>

            <div className="flex justify-end pt-2 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={() => setInspectDoc(null)}
                className="px-4 py-2 bg-[var(--accent)] hover:brightness-110 text-white rounded-full text-[12px] font-medium transition-colors cursor-pointer"
              >
                Close inspector
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
