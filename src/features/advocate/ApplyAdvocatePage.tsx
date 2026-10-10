import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../auth';
import { AdvocateApplication } from '../../auth/types';
import { LEGAL_TOPICS } from '../../data/topics';
import { RWANDA_DISTRICTS } from '../../data/districts';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Spinner } from '../../components/Spinner';

export const ApplyAdvocatePage: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  const [application, setApplication] = useState<AdvocateApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form states
  const [fullName, setFullName] = useState(user?.name || '');
  const [barRollNumber, setBarRollNumber] = useState('');
  const [selectedTopics, setSelectedTopics] = useState<string[]>(['civil']);
  const [selectedDistricts, setSelectedDistricts] = useState<string[]>([user?.district || 'Gasabo']);
  const [years, setYears] = useState('3');
  const [contactInfo, setContactInfo] = useState(user?.email || '');
  const [documents, setDocuments] = useState<Array<{ name: string; url: string; size: number }>>([]);
  const [declared, setDeclared] = useState(false);

  useEffect(() => {
    authService.getAdvocateApplication().then((app) => {
      setApplication(app);
      setLoading(false);
    });
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    const newDocs: Array<{ name: string; url: string; size: number }> = [];
    for (let i = 0; i < Math.min(files.length, 2 - documents.length); i++) {
      const f = files[i];
      if (f.size > 8 * 1024 * 1024) {
        alert('File size exceeds 8MB limit');
        continue;
      }
      newDocs.push({
        name: f.name,
        url: URL.createObjectURL(f),
        size: f.size,
      });
    }

    setDocuments((prev) => [...prev, ...newDocs]);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!declared) {
      setError('You must certify the accuracy of your credentials');
      return;
    }
    if (!barRollNumber.trim()) {
      setError('Bar roll number is required');
      return;
    }

    setSubmitting(true);
    try {
      const app = await authService.applyAdvocate({
        fullName: fullName.trim(),
        barRollNumber: barRollNumber.trim(),
        practiceAreas: selectedTopics,
        districts: selectedDistricts,
        yearsOfExperience: parseInt(years, 10) || 1,
        email: contactInfo,
        documents,
      });
      setApplication(app);
    } catch {
      setError(t.errGeneric);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg)' }}>
        <Spinner />
      </div>
    );
  }

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
          <b style={{ fontSize: '15px' }}>{t.applyAsAdvocate}</b>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
          <ThemeToggle onToggle={toggleTheme} />
        </div>
      </header>

      {/* Main Form or Status Card */}
      <main style={{ maxWidth: '640px', margin: '0 auto', padding: '32px 20px' }}>
        {application ? (
          <div
            style={{
              background: 'var(--surface)',
              border: '1px solid var(--border)',
              borderRadius: '16px',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <h2 style={{ fontSize: '20px', margin: 0 }}>{t.applicationStatus}</h2>
              <span
                style={{
                  padding: '6px 14px',
                  borderRadius: '999px',
                  fontSize: '12px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  background:
                    application.status === 'approved'
                      ? 'rgba(34, 197, 94, 0.15)'
                      : application.status === 'rejected'
                      ? 'rgba(239, 68, 68, 0.15)'
                      : 'rgba(201, 162, 75, 0.15)',
                  color:
                    application.status === 'approved'
                      ? '#22c55e'
                      : application.status === 'rejected'
                      ? 'var(--danger)'
                      : 'var(--gold)',
                }}
              >
                {application.status === 'approved' ? t.approved : application.status === 'rejected' ? t.rejected : t.pending}
              </span>
            </div>

            <div style={{ fontSize: '13px', lineHeight: 1.6, color: 'var(--muted)' }}>
              <div><b>Advocate:</b> {application.fullName} ({application.barRollNumber})</div>
              <div><b>Submitted:</b> {new Date(application.submittedAt).toLocaleDateString()}</div>
              <div><b>Practice areas:</b> {application.practiceAreas.join(', ')}</div>
              <div><b>Districts:</b> {application.districts.join(', ')}</div>
            </div>

            {application.status === 'approved' && (
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(34, 197, 94, 0.1)', color: '#22c55e', fontSize: '13px', fontWeight: 600 }}>
                ✓ Official verification complete. Your account now carries the verified advocate badge across Lex Hafi Yawe.
              </div>
            )}

            {application.status === 'rejected' && (
              <div style={{ padding: '12px', borderRadius: '10px', background: 'rgba(239, 68, 68, 0.1)', color: 'var(--danger)', fontSize: '13px' }}>
                <b>Reason:</b> {application.decisionNote || 'Bar credentials could not be verified with Rwanda Bar Association registry.'}
                <div style={{ marginTop: '10px' }}>
                  <button type="button" className="ghost" onClick={() => setApplication(null)}>
                    Apply again
                  </button>
                </div>
              </div>
            )}

            <button type="button" className="go" onClick={() => navigate('/home')}>
              Return to feed
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <h1 style={{ fontSize: '26px', margin: '0 0 4px 0' }}>{t.applyAsAdvocate}</h1>
            <p className="sub" style={{ margin: '0 0 10px 0' }}>
              Licensed members of the Rwanda Bar Association (RBA) receive official verification to offer legal consultations and legal aid.
            </p>

            {error && <p role="alert" className="err">{error}</p>}

            <div className="field">
              <label htmlFor="app-name">{t.fullName}</label>
              <input id="app-name" type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="app-roll">{t.barRollNumber} (e.g. RBA/2022/418)</label>
              <input id="app-roll" type="text" value={barRollNumber} onChange={(e) => setBarRollNumber(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="app-years">{t.yearsOfPractice}</label>
              <input id="app-years" type="number" min="1" max="50" value={years} onChange={(e) => setYears(e.target.value)} required />
            </div>

            {/* Practice Areas */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                {t.practiceAreas}
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                {LEGAL_TOPICS.map((topic) => {
                  const sel = selectedTopics.includes(topic.slug);
                  return (
                    <button
                      key={topic.slug}
                      type="button"
                      onClick={() => {
                        setSelectedTopics((prev) =>
                          sel ? prev.filter((s) => s !== topic.slug) : [...prev, topic.slug]
                        );
                      }}
                      style={{
                        padding: '6px 12px',
                        borderRadius: '999px',
                        border: `1px solid ${sel ? 'var(--accent)' : 'var(--border)'}`,
                        background: sel ? 'rgba(210,105,30,0.12)' : 'var(--surface)',
                        color: sel ? 'var(--accent)' : 'var(--text)',
                        fontSize: '12px',
                        fontWeight: 600,
                        cursor: 'pointer',
                      }}
                    >
                      {topic.icon} {topic.en}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Document upload */}
            <div>
              <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', display: 'block', marginBottom: '6px' }}>
                {t.uploadDocuments} (PDF, JPG, PNG, max 8MB, up to 2 files)
              </span>
              <input
                type="file"
                accept=".pdf,image/jpeg,image/png"
                multiple
                onChange={handleFileUpload}
                style={{ fontSize: '13px' }}
              />
              {documents.length > 0 && (
                <div style={{ marginTop: '8px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  {documents.map((doc, idx) => (
                    <div key={idx} style={{ fontSize: '12px', color: 'var(--muted)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <span>📄 {doc.name} ({(doc.size / 1024).toFixed(0)} KB)</span>
                      <button
                        type="button"
                        className="link"
                        style={{ color: 'var(--danger)' }}
                        onClick={() => setDocuments((prev) => prev.filter((_, i) => i !== idx))}
                      >
                        Remove
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Declaration */}
            <label style={{ display: 'flex', alignItems: 'flex-start', gap: '10px', fontSize: '13px', cursor: 'pointer', marginTop: '6px' }}>
              <input
                type="checkbox"
                checked={declared}
                onChange={(e) => setDeclared(e.target.checked)}
                style={{ marginTop: '2px', accentColor: 'var(--accent)' }}
                required
              />
              <span>{t.declarationAccurate}</span>
            </label>

            <button
              type="submit"
              className="go"
              disabled={submitting || !declared || !barRollNumber.trim()}
            >
              {submitting ? <Spinner /> : t.submitApplication}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
