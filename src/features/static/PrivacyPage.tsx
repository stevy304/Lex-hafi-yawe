import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';

export const PrivacyPage: React.FC = () => {
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
          <b style={{ fontSize: '15px' }}>{t.privacy}</b>
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

        <h1 style={{ fontSize: '32px', margin: '0 0 16px 0' }}>{t.privacy}</h1>
        <p style={{ fontSize: '13px', color: 'var(--muted)', marginBottom: '24px' }}>
          Version 2026.1 • Law N° 058/2021 relating to the protection of personal data and privacy in Rwanda
        </p>

        <section style={{ display: 'flex', flexDirection: 'column', gap: '20px', fontSize: '14px', color: 'var(--text)' }}>
          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>1. Data Collection & Processing</h2>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              We collect identity information (name, email, phone number, district) strictly for account authentication and connecting you with localized legal assistance.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>2. Data Rights & Subject Access</h2>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Under Rwandan data protection legislation, you retain the full right to export your complete personal data archive and request account deletion with a 30-day grace period.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>3. Advocate Confidentiality & Privilege</h2>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Communications between verified advocates and prospective clients are stored in private encrypted channels protected under professional secrecy regulations.
            </p>
          </div>

          <div>
            <h2 style={{ fontSize: '18px', margin: '0 0 8px 0' }}>4. Data Retention</h2>
            <p style={{ margin: 0, color: 'var(--muted)' }}>
              Inactive accounts and soft-deleted data are permanently removed following the expiration of the statutory 30-day grace retention window.
            </p>
          </div>
        </section>
      </main>
    </div>
  );
};
