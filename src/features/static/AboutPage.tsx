import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';

export const AboutPage: React.FC = () => {
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
          <b style={{ fontSize: '15px' }}>Lex Hafi Yawe</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
          <ThemeToggle onToggle={toggleTheme} />
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px', lineHeight: 1.6 }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 16px 0' }}>{t.about} Lex Hafi Yawe</h1>

        <p style={{ fontSize: '16px', color: 'var(--muted)', marginBottom: '24px' }}>
          {lang === 'rw'
            ? 'Lex Hafi Yawe ni urubuga rwa mbere rwa digitale rugamije kwegereza ubutabera abaturarwanda bose, guhuza abavoka b\'umwuga n\'abaturage, no gutangaza amategeko n\'amabwiriza ya Leta.'
            : lang === 'fr'
            ? 'Lex Hafi Yawe est la plateforme rwandaise de justice numérique qui rapproche les citoyens des professionnels du droit assermentés, diffuse les lois officielles et facilite l\'accès à l\'aide juridique.'
            : 'Lex Hafi Yawe is Rwanda\'s digital justice network connecting citizens with certified advocates, legal aid committees, and authenticated Rwandan legislation.'}
        </p>

        <section style={{ marginBottom: '24px' }}>
          <h2 style={{ fontSize: '20px', margin: '0 0 8px 0' }}>Our Core Pillars</h2>
          <ul style={{ paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <li><b>Verified Advocates:</b> Only lawyers certified by the Rwanda Bar Association receive official verification.</li>
            <li><b>Free Legal Aid:</b> Instant direct dial connection to MAJ (Maison d\'Accès à la Justice) officers across all 30 districts via 3922.</li>
            <li><b>Official Gazette Legislation:</b> Digital access to laws, presidential orders, and ministerial regulations in Kinyarwanda, English, and French.</li>
          </ul>
        </section>

        <section style={{ borderTop: '1px solid var(--border)', paddingTop: '20px' }}>
          <p style={{ fontSize: '13px', color: 'var(--muted)' }}>
            © 2026 Lex Hafi Yawe. Kigali, Republic of Rwanda.
          </p>
        </section>
      </main>
    </div>
  );
};
