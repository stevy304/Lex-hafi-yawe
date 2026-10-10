import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../auth';
import { RWANDA_DISTRICTS } from '../../data/districts';
import { UserSession, UserSettings, ExportStatus } from '../../auth/types';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Spinner } from '../../components/Spinner';

type SettingsTab = 'profile' | 'security' | 'notifications' | 'privacy' | 'appearance' | 'data';

export const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, updateUser, logout } = useAuth();
  const { lang, setLang, t } = useLang();
  const { theme, setTheme, toggleTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<SettingsTab>('profile');
  const [toastMessage, setToastMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  // Profile form
  const [name, setName] = useState(user?.name || '');
  const [handle, setHandle] = useState(user?.handle || '');
  const [bio, setBio] = useState(user?.bio || '');
  const [district, setDistrict] = useState(user?.district || 'Gasabo');

  // Security form
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [sessions, setSessions] = useState<UserSession[]>([]);
  const [twoStepEnabled, setTwoStepEnabled] = useState(false);

  // Notifications form
  const [settings, setSettings] = useState<UserSettings>({
    inAppLikes: true, inAppComments: true, inAppFollows: true, inAppMentions: true,
    inAppOfficialUpdates: true, inAppMessages: true, emailDigest: true, smsAlerts: false,
    whoCanMessageMe: 'everyone', showDistrictOnProfile: true,
  });

  // Privacy & Blocks
  const [blockedUsers, setBlockedUsers] = useState<Array<{ id: string; name: string; handle: string }>>([]);

  // Data rights
  const [exportStatus, setExportStatus] = useState<ExportStatus>({ status: 'preparing' });
  const [deletionScheduled, setDeletionScheduled] = useState<string | null>(null);
  const [confirmHandleText, setConfirmHandleText] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  useEffect(() => {
    authService.getSessions().then(setSessions);
    authService.getUserSettings().then(setSettings);
    authService.getBlockedUsers().then(setBlockedUsers);
    authService.getDataExportStatus().then(setExportStatus);
  }, []);

  const handleSaveProfile = async () => {
    setLoading(true);
    try {
      await updateUser({ name, handle, bio, district });
      showToast(t.changesSaved);
    } catch {
      showToast(t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPw !== confirmPw) {
      showToast(t.passwordsDoNotMatch);
      return;
    }
    setLoading(true);
    try {
      await authService.changePassword(currentPw, newPw);
      setCurrentPw('');
      setNewPw('');
      setConfirmPw('');
      showToast(t.changesSaved);
    } catch (err: any) {
      showToast(err?.message || t.errGeneric);
    } finally {
      setLoading(false);
    }
  };

  const handleRevokeSession = async (id: string) => {
    await authService.revokeSession(id);
    setSessions((prev) => prev.filter((s) => s.id !== id));
    showToast('Session revoked');
  };

  const handleRevokeOthers = async () => {
    await authService.revokeOtherSessions();
    setSessions((prev) => prev.filter((s) => s.isCurrent));
    showToast('Logged out from other devices');
  };

  const handleToggleSetting = async (key: keyof UserSettings, val: any) => {
    const updated = { ...settings, [key]: val };
    setSettings(updated);
    await authService.updateUserSettings(updated);
    showToast(t.changesSaved);
  };

  const handleUnblock = async (userId: string) => {
    await authService.unblockUser(userId);
    setBlockedUsers((prev) => prev.filter((b) => b.id !== userId));
    showToast('User unblocked');
  };

  const handleRequestExport = async () => {
    await authService.requestDataExport();
    setExportStatus({ status: 'preparing' });
    showToast('Export requested. Preparing your data archive.');
    setTimeout(async () => {
      const res = await authService.getDataExportStatus();
      setExportStatus(res);
    }, 5500);
  };

  const handleDeleteAccount = async () => {
    if (confirmHandleText.trim() !== user?.handle) {
      showToast('Handle does not match');
      return;
    }
    setLoading(true);
    try {
      const res = await authService.requestAccountDeletion({ password: 'Demo#2026' });
      setDeletionScheduled(res.scheduledFor);
      setShowDeleteModal(false);
      showToast('Account deletion scheduled (30-day grace period)');
    } finally {
      setLoading(false);
    }
  };

  const handleCancelDeletion = async () => {
    await authService.cancelAccountDeletion();
    setDeletionScheduled(null);
    showToast('Account deletion cancelled');
  };

  const tabs: Array<{ id: SettingsTab; label: string; icon: string }> = [
    { id: 'profile', label: t.profile, icon: '👤' },
    { id: 'security', label: t.security, icon: '🔒' },
    { id: 'notifications', label: t.notifications, icon: '🔔' },
    { id: 'privacy', label: t.privacySection, icon: '🛡️' },
    { id: 'appearance', label: t.languageAppearance, icon: '🎨' },
    { id: 'data', label: t.yourData, icon: '💾' },
  ];

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      {/* Toast */}
      {toastMessage && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'var(--surface)',
            color: 'var(--text)',
            border: '1px solid var(--accent)',
            padding: '12px 20px',
            borderRadius: '12px',
            boxShadow: '0 8px 24px rgba(0,0,0,0.3)',
            zIndex: 1000,
            fontSize: '13px',
            fontWeight: 600,
          }}
          role="status"
        >
          ✓ {toastMessage}
        </div>
      )}

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
          <b style={{ fontSize: '16px' }}>{t.settings}</b>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
          <ThemeToggle onToggle={toggleTheme} />
        </div>
      </header>

      {/* Content layout with left sub-nav */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 20px', display: 'grid', gridTemplateColumns: 'minmax(180px, 240px) 1fr', gap: '24px' }}>
        {/* Left Sub-Nav */}
        <nav style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
          {tabs.map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '10px 14px',
                borderRadius: '10px',
                border: 0,
                background: activeTab === tab.id ? 'rgba(210,105,30,0.12)' : 'transparent',
                color: activeTab === tab.id ? 'var(--accent)' : 'var(--text)',
                fontWeight: activeTab === tab.id ? 700 : 500,
                fontSize: '14px',
                cursor: 'pointer',
                textAlign: 'left',
              }}
            >
              <span>{tab.icon}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </nav>

        {/* Tab Detail Pane */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px' }}>
          {/* PROFILE TAB */}
          {activeTab === 'profile' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{t.profile}</h2>
              <div className="field">
                <label htmlFor="set-name">{t.fullName}</label>
                <input id="set-name" type="text" value={name} onChange={(e) => setName(e.target.value)} />
              </div>

              <div>
                <div className="field">
                  <label htmlFor="set-handle">{t.handle}</label>
                  <input id="set-handle" type="text" value={handle} onChange={(e) => setHandle(e.target.value)} />
                </div>
                <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block', marginTop: '4px' }}>
                  Note: Changing your handle releases your previous handle.
                </span>
              </div>

              <div className="field">
                <label htmlFor="set-bio">Bio (max 160 chars)</label>
                <input id="set-bio" type="text" maxLength={160} value={bio} onChange={(e) => setBio(e.target.value)} />
              </div>

              <div className="field">
                <label htmlFor="set-district">{t.district}</label>
                <select
                  id="set-district"
                  value={district}
                  onChange={(e) => setDistrict(e.target.value)}
                  style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', padding: '24px 15px 6px', border: 0, background: 'transparent', color: 'var(--text)', fontSize: '16px' }}
                >
                  {RWANDA_DISTRICTS.map((d) => (
                    <option key={d} value={d} style={{ background: 'var(--surface)', color: 'var(--text)' }}>
                      {d} District
                    </option>
                  ))}
                </select>
              </div>

              <button type="button" className="go" disabled={loading} onClick={handleSaveProfile}>
                {loading ? <Spinner /> : t.saveChanges}
              </button>
            </div>
          )}

          {/* SECURITY TAB */}
          {activeTab === 'security' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{t.security}</h2>

              {/* Change password */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <b style={{ fontSize: '14px' }}>{t.changePassword}</b>
                <div className="field">
                  <label htmlFor="sec-cur">{t.currentPassword}</label>
                  <input id="sec-cur" type="password" value={currentPw} onChange={(e) => setCurrentPw(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="sec-new">{t.newPassword}</label>
                  <input id="sec-new" type="password" value={newPw} onChange={(e) => setNewPw(e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="sec-conf">{t.confirmPassword}</label>
                  <input id="sec-conf" type="password" value={confirmPw} onChange={(e) => setConfirmPw(e.target.value)} />
                </div>
                <button type="button" className="ghost" disabled={!currentPw || !newPw || loading} onClick={handleChangePassword}>
                  {t.changePassword}
                </button>
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />

              {/* Active Sessions */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <b style={{ fontSize: '14px' }}>{t.activeSessions}</b>
                  <button type="button" className="link" onClick={handleRevokeOthers}>
                    {t.revokeOthers}
                  </button>
                </div>

                {sessions.map((sess) => (
                  <div
                    key={sess.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '10px 14px',
                      background: 'var(--bg)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <div style={{ fontSize: '13px', fontWeight: 600 }}>
                        {sess.device} {sess.isCurrent && <span style={{ color: 'var(--accent)', fontSize: '11px' }}>({t.thisDevice})</span>}
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        {sess.browser} • {sess.ipMasked} • {sess.lastActive}
                      </div>
                    </div>
                    {!sess.isCurrent && (
                      <button type="button" className="ghost" style={{ height: '30px', fontSize: '11px', padding: '0 10px' }} onClick={() => handleRevokeSession(sess.id)}>
                        {t.revoke}
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* NOTIFICATIONS TAB */}
          {activeTab === 'notifications' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{t.notifications}</h2>
              {[
                { key: 'inAppOfficialUpdates', label: 'Official gazette legislation & alerts' },
                { key: 'inAppMessages', label: 'Direct messages from advocates' },
                { key: 'inAppComments', label: 'Replies and legal discussion comments' },
                { key: 'emailDigest', label: 'Monthly legal awareness email digest' },
                { key: 'smsAlerts', label: 'SMS emergency judicial alerts' },
              ].map((item) => (
                <label key={item.key} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px', cursor: 'pointer' }}>
                  <span>{item.label}</span>
                  <input
                    type="checkbox"
                    checked={(settings as any)[item.key]}
                    onChange={(e) => handleToggleSetting(item.key as any, e.target.checked)}
                    style={{ accentColor: 'var(--accent)', transform: 'scale(1.2)' }}
                  />
                </label>
              ))}
            </div>
          )}

          {/* PRIVACY TAB */}
          {activeTab === 'privacy' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{t.privacySection}</h2>

              <label style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '14px' }}>
                <span>Show my district on my public profile</span>
                <input
                  type="checkbox"
                  checked={settings.showDistrictOnProfile}
                  onChange={(e) => handleToggleSetting('showDistrictOnProfile', e.target.checked)}
                  style={{ accentColor: 'var(--accent)', transform: 'scale(1.2)' }}
                />
              </label>

              <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />

              <div>
                <b style={{ fontSize: '14px', display: 'block', marginBottom: '8px' }}>Blocked users</b>
                {blockedUsers.length === 0 ? (
                  <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>No blocked users.</p>
                ) : (
                  blockedUsers.map((b) => (
                    <div key={b.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: 'var(--bg)', borderRadius: '8px', marginBottom: '6px' }}>
                      <span style={{ fontSize: '13px' }}>{b.name} (@{b.handle})</span>
                      <button type="button" className="ghost" style={{ height: '28px', fontSize: '11px', padding: '0 8px' }} onClick={() => handleUnblock(b.id)}>
                        Unblock
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          )}

          {/* APPEARANCE TAB */}
          {activeTab === 'appearance' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{t.languageAppearance}</h2>

              <div>
                <b style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Theme</b>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="ghost" style={{ borderColor: theme === 'dark' ? 'var(--accent)' : 'var(--border)' }} onClick={() => setTheme('dark')}>
                    Dark theme
                  </button>
                  <button type="button" className="ghost" style={{ borderColor: theme === 'light' ? 'var(--accent)' : 'var(--border)' }} onClick={() => setTheme('light')}>
                    Light theme
                  </button>
                </div>
              </div>

              <div>
                <b style={{ fontSize: '13px', display: 'block', marginBottom: '8px' }}>Language</b>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button type="button" className="ghost" style={{ borderColor: lang === 'en' ? 'var(--accent)' : 'var(--border)' }} onClick={() => setLang('en')}>
                    English
                  </button>
                  <button type="button" className="ghost" style={{ borderColor: lang === 'rw' ? 'var(--accent)' : 'var(--border)' }} onClick={() => setLang('rw')}>
                    Kinyarwanda
                  </button>
                  <button type="button" className="ghost" style={{ borderColor: lang === 'fr' ? 'var(--accent)' : 'var(--border)' }} onClick={() => setLang('fr')}>
                    Français
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* YOUR DATA TAB */}
          {activeTab === 'data' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
              <h2 style={{ fontSize: '18px', margin: 0 }}>{t.yourData}</h2>

              <div>
                <b style={{ fontSize: '14px', display: 'block' }}>{t.downloadData}</b>
                <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 10px 0' }}>
                  Export all your posts, appointments, legal queries, and account activity as an encrypted archive.
                </p>
                {exportStatus.status === 'ready' ? (
                  <a
                    href={exportStatus.downloadUrl || '#'}
                    className="go"
                    download
                    style={{ display: 'inline-flex', alignItems: 'center', justifyContent: 'center', textDecoration: 'none', padding: '0 20px', height: '42px', fontSize: '14px' }}
                  >
                    Download archive (.zip)
                  </a>
                ) : (
                  <button type="button" className="ghost" onClick={handleRequestExport}>
                    {t.downloadData}
                  </button>
                )}
              </div>

              <hr style={{ border: 0, borderTop: '1px solid var(--border)' }} />

              <div style={{ border: '1px solid rgba(239, 68, 68, 0.3)', padding: '16px', borderRadius: '12px', background: 'rgba(239, 68, 68, 0.05)' }}>
                <b style={{ fontSize: '14px', color: 'var(--danger)', display: 'block' }}>{t.deleteAccount}</b>
                {deletionScheduled ? (
                  <div style={{ marginTop: '8px' }}>
                    <p style={{ margin: '0 0 8px 0', fontSize: '13px' }}>
                      Account scheduled for deletion on {new Date(deletionScheduled).toLocaleDateString()}.
                    </p>
                    <button type="button" className="go" onClick={handleCancelDeletion}>
                      {t.cancelDeletion}
                    </button>
                  </div>
                ) : (
                  <>
                    <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '4px 0 12px 0' }}>
                      Deleting your account soft-deletes records with a 30-day grace period. After 30 days, your personal information is permanently purged.
                    </p>
                    <button
                      type="button"
                      className="ghost"
                      style={{ color: 'var(--danger)', borderColor: 'var(--danger)' }}
                      onClick={() => setShowDeleteModal(true)}
                    >
                      {t.deleteAccount}
                    </button>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.7)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '20px',
            zIndex: 1000,
          }}
        >
          <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '24px', maxWidth: '440px', width: '100%' }}>
            <h3 style={{ margin: '0 0 8px 0', color: 'var(--danger)' }}>Confirm Account Deletion</h3>
            <p style={{ fontSize: '13px', color: 'var(--muted)', margin: '0 0 14px 0' }}>
              Type your handle <b>@{user?.handle}</b> to confirm deletion:
            </p>
            <div className="field">
              <label htmlFor="del-handle">Handle confirmation</label>
              <input id="del-handle" type="text" value={confirmHandleText} onChange={(e) => setConfirmHandleText(e.target.value)} />
            </div>
            <div style={{ display: 'flex', gap: '10px', marginTop: '16px' }}>
              <button type="button" className="ghost" style={{ flex: 1 }} onClick={() => setShowDeleteModal(false)}>
                Cancel
              </button>
              <button
                type="button"
                className="go"
                style={{ flex: 1, background: 'var(--danger)' }}
                disabled={confirmHandleText.trim() !== user?.handle || loading}
                onClick={handleDeleteAccount}
              >
                {loading ? <Spinner /> : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
