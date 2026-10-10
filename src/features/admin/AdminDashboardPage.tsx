import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../auth';
import { AdvocateApplication, ReportItem, AuditLog } from '../../auth/types';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Spinner } from '../../components/Spinner';

type AdminTab = 'advocates' | 'reports' | 'audit';

export const AdminDashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  const [tab, setTab] = useState<AdminTab>('advocates');
  const [applications, setApplications] = useState<AdvocateApplication[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);

  // Advocate filter
  const [filter, setFilter] = useState('all');
  const [selectedApp, setSelectedApp] = useState<AdvocateApplication | null>(null);
  const [rejectNote, setRejectNote] = useState('');
  const [confirmDialog, setConfirmDialog] = useState<{
    type: 'approve_app' | 'reject_app' | 'hide_report' | 'suspend_report' | 'dismiss_report';
    id: string;
    title: string;
  } | null>(null);

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [apps, reps, logs] = await Promise.all([
        authService.getAdminAdvocateApplications(filter),
        authService.getAdminReports(),
        authService.getAdminAuditLogs(),
      ]);
      setApplications(apps);
      setReports(reps);
      setAuditLogs(logs);
    } finally {
      setLoading(false);
    }
  };

  const handleConfirmAction = async () => {
    if (!confirmDialog) return;

    if (confirmDialog.type === 'approve_app') {
      await authService.decideAdvocateApplication(confirmDialog.id, 'approved');
    } else if (confirmDialog.type === 'reject_app') {
      await authService.decideAdvocateApplication(confirmDialog.id, 'rejected', rejectNote || 'Credentials did not match RBA registry');
    } else if (confirmDialog.type === 'hide_report') {
      await authService.decideReport(confirmDialog.id, 'hide');
    } else if (confirmDialog.type === 'suspend_report') {
      await authService.decideReport(confirmDialog.id, 'suspend');
    } else if (confirmDialog.type === 'dismiss_report') {
      await authService.decideReport(confirmDialog.id, 'dismiss');
    }

    setConfirmDialog(null);
    setSelectedApp(null);
    setRejectNote('');
    await loadData();
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Header */}
      <header
        style={{
          borderBottom: '1px solid var(--border)',
          background: 'var(--surface)',
          padding: '12px clamp(16px, 4vw, 40px)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="back" onClick={() => navigate('/home')}>
            ← {t.back}
          </button>
          <LogoIcon size={32} ariaHidden={true} />
          <div>
            <b style={{ fontSize: '15px', display: 'block' }}>Lex Hafi Yawe • Admin Center</b>
            <span style={{ fontSize: '11px', color: 'var(--gold)', fontWeight: 600 }}>Administrator: {user?.name}</span>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
          <ThemeToggle onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Tabs */}
      <main style={{ maxWidth: '1040px', margin: '0 auto', padding: '24px 20px' }}>
        <div style={{ display: 'flex', gap: '10px', marginBottom: '20px', borderBottom: '1px solid var(--border)', paddingBottom: '12px' }}>
          <button
            type="button"
            className="ghost"
            style={{ borderColor: tab === 'advocates' ? 'var(--accent)' : 'var(--border)', color: tab === 'advocates' ? 'var(--accent)' : 'var(--text)' }}
            onClick={() => setTab('advocates')}
          >
            Advocate Verification Queue ({applications.filter((a) => a.status === 'pending').length} pending)
          </button>
          <button
            type="button"
            className="ghost"
            style={{ borderColor: tab === 'reports' ? 'var(--accent)' : 'var(--border)', color: tab === 'reports' ? 'var(--accent)' : 'var(--text)' }}
            onClick={() => setTab('reports')}
          >
            {t.reports} ({reports.filter((r) => r.status === 'pending').length} pending)
          </button>
          <button
            type="button"
            className="ghost"
            style={{ borderColor: tab === 'audit' ? 'var(--accent)' : 'var(--border)', color: tab === 'audit' ? 'var(--accent)' : 'var(--text)' }}
            onClick={() => setTab('audit')}
          >
            {t.auditLogs}
          </button>
        </div>

        {loading ? (
          <div style={{ display: 'flex', justifyContent: 'center', padding: '40px' }}>
            <Spinner />
          </div>
        ) : (
          <>
            {/* ADVOCATES TAB */}
            {tab === 'advocates' && (
              <div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
                  <h2 style={{ fontSize: '18px', margin: 0 }}>Advocate Applications</h2>
                  <div style={{ display: 'flex', gap: '6px' }}>
                    {['all', 'pending', 'approved', 'rejected'].map((f) => (
                      <button
                        key={f}
                        type="button"
                        className="ghost"
                        style={{ height: '30px', fontSize: '12px', padding: '0 10px', background: filter === f ? 'var(--text)' : 'transparent', color: filter === f ? 'var(--bg)' : 'var(--text)' }}
                        onClick={() => setFilter(f)}
                      >
                        {f.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {applications.map((app) => (
                    <div
                      key={app.id}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        flexWrap: 'wrap',
                        gap: '12px',
                      }}
                    >
                      <div>
                        <b style={{ fontSize: '15px' }}>{app.fullName}</b>
                        <span style={{ fontSize: '12px', color: 'var(--muted)', display: 'block' }}>
                          Roll: {app.barRollNumber} • {app.yearsOfExperience} yrs practice • Districts: {app.districts.join(', ')}
                        </span>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Submitted: {new Date(app.submittedAt).toLocaleString()}
                        </span>
                      </div>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span
                          style={{
                            padding: '4px 10px',
                            borderRadius: '999px',
                            fontSize: '11px',
                            fontWeight: 700,
                            textTransform: 'uppercase',
                            background:
                              app.status === 'approved'
                                ? 'rgba(34, 197, 94, 0.15)'
                                : app.status === 'rejected'
                                ? 'rgba(239, 68, 68, 0.15)'
                                : 'rgba(201, 162, 75, 0.15)',
                            color:
                              app.status === 'approved'
                                ? '#22c55e'
                                : app.status === 'rejected'
                                ? 'var(--danger)'
                                : 'var(--gold)',
                          }}
                        >
                          {app.status}
                        </span>

                        {app.status === 'pending' && (
                          <button
                            type="button"
                            className="go"
                            style={{ height: '32px', fontSize: '12px', padding: '0 14px' }}
                            onClick={() => setSelectedApp(app)}
                          >
                            Review
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* REPORTS TAB */}
            {tab === 'reports' && (
              <div>
                <h2 style={{ fontSize: '18px', margin: '0 0 14px 0' }}>Moderation & Community Reports</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                  {reports.map((rep) => (
                    <div
                      key={rep.id}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '12px',
                        padding: '16px',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: '8px',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <b style={{ fontSize: '14px', color: 'var(--danger)' }}>Reason: {rep.reason}</b>
                        <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                          Reports: {rep.reportCount} | Status: {rep.status}
                        </span>
                      </div>
                      <p style={{ margin: 0, fontSize: '13px', background: 'var(--bg)', padding: '10px', borderRadius: '8px', fontStyle: 'italic' }}>
                        "{rep.snippet}"
                      </p>
                      {rep.status === 'pending' && (
                        <div style={{ display: 'flex', gap: '8px', marginTop: '6px' }}>
                          <button
                            type="button"
                            className="ghost"
                            style={{ height: '30px', fontSize: '11px' }}
                            onClick={() => setConfirmDialog({ type: 'dismiss_report', id: rep.id, title: 'Dismiss this report?' })}
                          >
                            {t.dismiss}
                          </button>
                          <button
                            type="button"
                            className="ghost"
                            style={{ height: '30px', fontSize: '11px', color: 'var(--danger)', borderColor: 'var(--danger)' }}
                            onClick={() => setConfirmDialog({ type: 'hide_report', id: rep.id, title: 'Hide this post immediately?' })}
                          >
                            {t.hidePost}
                          </button>
                          <button
                            type="button"
                            className="go"
                            style={{ height: '30px', fontSize: '11px', background: 'var(--danger)' }}
                            onClick={() => setConfirmDialog({ type: 'suspend_report', id: rep.id, title: 'Suspend user account?' })}
                          >
                            {t.suspendUser}
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AUDIT LOG TAB */}
            {tab === 'audit' && (
              <div>
                <h2 style={{ fontSize: '18px', margin: '0 0 14px 0' }}>Immutable Administrator Audit Logs</h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {auditLogs.map((log) => (
                    <div
                      key={log.id}
                      style={{
                        background: 'var(--surface)',
                        border: '1px solid var(--border)',
                        borderRadius: '10px',
                        padding: '12px',
                        fontSize: '12px',
                        display: 'flex',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <b>{log.action}</b> by <span>{log.adminName}</span>
                        <div style={{ color: 'var(--muted)', marginTop: '2px' }}>{log.details}</div>
                      </div>
                      <span style={{ color: 'var(--muted)', flexShrink: 0 }}>
                        {new Date(log.timestamp).toLocaleString()}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Review Advocate Drawer / Modal */}
      {selectedApp && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1000 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '520px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>Review Advocate Credentials</h3>
            <div style={{ fontSize: '13px', lineHeight: 1.6, marginBottom: '14px' }}>
              <div><b>Full Name:</b> {selectedApp.fullName}</div>
              <div><b>Roll Number:</b> {selectedApp.barRollNumber}</div>
              <div><b>Practice:</b> {selectedApp.practiceAreas.join(', ')}</div>
              <div><b>Districts:</b> {selectedApp.districts.join(', ')}</div>
              <div><b>Experience:</b> {selectedApp.yearsOfExperience} years</div>
              {selectedApp.documents.length > 0 && (
                <div style={{ marginTop: '8px' }}>
                  <b>Documents:</b>
                  {selectedApp.documents.map((d, i) => (
                    <div key={i}>
                      <a href={d.url} target="_blank" rel="noreferrer" className="link">
                        📄 {d.name} (View signed document)
                      </a>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="field" style={{ marginBottom: '14px' }}>
              <label htmlFor="rej-note">Rejection Reason (if rejecting)</label>
              <input id="rej-note" type="text" placeholder="Required if rejecting" value={rejectNote} onChange={(e) => setRejectNote(e.target.value)} />
            </div>

            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setSelectedApp(null)}>
                Cancel
              </button>
              <button
                type="button"
                className="ghost"
                style={{ flex: 1, color: 'var(--danger)', borderColor: 'var(--danger)' }}
                onClick={() => setConfirmDialog({ type: 'reject_app', id: selectedApp.id, title: `Reject application for ${selectedApp.fullName}?` })}
              >
                Reject
              </button>
              <button
                type="button"
                className="go"
                style={{ flex: 1, background: '#22c55e' }}
                onClick={() => setConfirmDialog({ type: 'approve_app', id: selectedApp.id, title: `Approve and verify ${selectedApp.fullName}?` })}
              >
                Approve
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmation Dialog */}
      {confirmDialog && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px', zIndex: 1100 }}>
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '420px', width: '100%' }}>
            <h3 style={{ margin: '0 0 10px 0' }}>{confirmDialog.title}</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 16px 0' }}>
              This administrative action will be recorded in the audit log.
            </p>
            <div style={{ display: 'flex', gap: '10px' }}>
              <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setConfirmDialog(null)}>
                Cancel
              </button>
              <button type="button" className="go" style={{ flex: 1 }} onClick={handleConfirmAction}>
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
