import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';

export const TermsPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '12px clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="back" onClick={() => navigate(-1)}>
            ← {t.back}
          </button>
          <LogoIcon size={32} ariaHidden={true} />
          <b style={{ fontSize: '15px' }}>{t.terms}</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
          <ThemeToggle onToggle={toggleTheme} />
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px', lineHeight: 1.6 }}>
        {/* Required Draft Banner */}
        <div style={{ background: 'rgba(210,105,30,0.15)', border: '1px solid var(--accent)', color: 'var(--accent)', padding: '12px 16px', borderRadius: '10px', fontSize: '13px', fontWeight: 600, marginBottom: '24px' }}>
          ⚠️ {t.draftBanner}
        </div>

        <h1 style={{ fontSize: '32px', margin: '0 0 16px 0' }}>{t.terms}</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
          Version 2026.1 • Effective Date: January 1, 2026
        </p>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', color: 'var(--text)' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>1. Acceptance of Terms</h2>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              By accessing or creating an account on the Lex Hafi Yawe platform, you acknowledge and agree to be bound by these Terms of Service in accordance with the laws of the Republic of Rwanda.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>2. Minimum Age Requirements</h2>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              You must be at least 16 years of age to establish an independent user account. Minor legal inquiries may be made under parental or judicial guardianship representation.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>3. Professional Legal Advice Disclaimer</h2>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Content published by community users does not constitute formal legal counsel. Formal advocate representation is formed only upon mutual agreement with a verified advocate of the Rwanda Bar Association.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>4. Community Standards & Sanctions</h2>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Harassment, falsification of judicial decrees, and unauthorized practice of law are strictly prohibited and subject to immediate suspension and referral to competent judicial authorities.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
