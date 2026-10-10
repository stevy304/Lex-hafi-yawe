import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../auth';
import { LogoIcon } from '../../components/LogoIcon';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { Spinner } from '../../components/Spinner';

export const HelpPage: React.FC = () => {
  const navigate = useNavigate();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  // Contact form
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);

  // FAQ open state
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const faqs = [
    {
      q: 'How do I create an account on Lex Hafi Yawe?',
      a: 'You can create an account using your Rwandan phone number (+250), your Google account, or an email address. Complete your profile and consent to get started.',
    },
    {
      q: 'How do I reset my password if I forgot it?',
      a: 'Visit the "Forgot password?" page from the sign-in screen, enter your email or username, and you will receive a 6-digit reset code.',
    },
    {
      q: 'How do I become a verified advocate on the platform?',
      a: 'Licensed advocates with the Rwanda Bar Association can submit an application via "/apply" with their Bar Roll Number and proof of certification for administrative review.',
    },
    {
      q: 'How do I access free legal aid in my district?',
      a: 'Citizens can dial 3922 toll-free to reach the nearest Maison d\'Accès à la Justice (MAJ) bureau located in all 30 districts of Rwanda.',
    },
    {
      q: 'How do I report inappropriate advice or misinformation?',
      a: 'Every post and profile features a Report option. Reports are reviewed promptly by compliance administrators in accordance with Rwandan law.',
    },
  ];

  const handleSupportSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    try {
      await authService.submitSupportMessage({ name, email, message });
      setSentSuccess(true);
      setName('');
      setEmail('');
      setMessage('');
    } finally {
      setSending(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)', color: 'var(--text)' }}>
      <header style={{ borderBottom: '1px solid var(--border)', background: 'var(--surface)', padding: '12px clamp(16px, 4vw, 40px)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button type="button" className="back" onClick={() => navigate(-1)}>
            ← {t.back}
          </button>
          <LogoIcon size={32} ariaHidden={true} />
          <b style={{ fontSize: '15px' }}>{t.help}</b>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
          <ThemeToggle onToggle={toggleTheme} />
        </div>
      </header>

      <main style={{ maxWidth: '720px', margin: '0 auto', padding: '40px 20px', lineHeight: 1.6 }}>
        <h1 style={{ fontSize: '32px', margin: '0 0 8px 0' }}>{t.help}</h1>
        <p style={{ fontSize: '15px', color: 'var(--muted)', marginBottom: '32px' }}>
          Frequently asked questions, MAJ legal aid assistance, and direct technical support.
        </p>

        {/* Free Legal Aid Banner */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--accent)', borderRadius: '14px', padding: '20px', marginBottom: '32px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px' }}>📞</span>
            <b style={{ fontSize: '18px', color: 'var(--accent)' }}>Free Legal Aid · Dial 3922</b>
          </div>
          <p style={{ margin: 0, fontSize: '13px', color: 'var(--muted)' }}>
            MAJ officers provide toll-free legal advice, conciliation, and court representation for indigent citizens across Rwanda.
          </p>
        </div>

        {/* FAQ Accordions */}
        <h2 style={{ fontSize: '20px', marginBottom: '16px' }}>Frequently Asked Questions</h2>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '40px' }}>
          {faqs.map((faq, i) => {
            const isOpen = openFaq === i;
            return (
              <div key={i} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', overflow: 'hidden' }}>
                <button
                  type="button"
                  onClick={() => setOpenFaq(isOpen ? null : i)}
                  style={{
                    width: '100%',
                    padding: '14px 18px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    border: 0,
                    background: 'transparent',
                    color: 'var(--text)',
                    fontSize: '14px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                >
                  <span>{faq.q}</span>
                  <span>{isOpen ? '▲' : '▼'}</span>
                </button>
                {isOpen && (
                  <div style={{ padding: '0 18px 16px 18px', fontSize: '13px', color: 'var(--muted)', lineHeight: 1.5 }}>
                    {faq.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Support Contact Form */}
        <h2 style={{ fontSize: '20px', marginBottom: '12px' }}>{t.contactSupport}</h2>
        {sentSuccess ? (
          <div style={{ padding: '16px', background: 'rgba(34,197,94,0.1)', color: '#22c55e', borderRadius: '12px', fontSize: '14px' }}>
            ✓ {t.messageSent}
          </div>
        ) : (
          <form onSubmit={handleSupportSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="field">
              <label htmlFor="sup-name">{t.fullName}</label>
              <input id="sup-name" type="text" value={name} onChange={(e) => setName(e.target.value)} required />
            </div>

            <div className="field">
              <label htmlFor="sup-email">{t.label}</label>
              <input id="sup-email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
            </div>

            <div className="field" style={{ height: '110px' }}>
              <label htmlFor="sup-msg">Message</label>
              <textarea
                id="sup-msg"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                required
                style={{
                  position: 'absolute',
                  inset: 0,
                  width: '100%',
                  height: '100%',
                  padding: '24px 15px 6px',
                  border: 0,
                  background: 'transparent',
                  color: 'var(--text)',
                  fontSize: '15px',
                  resize: 'none',
                }}
              />
            </div>

            <button type="submit" className="go" disabled={sending}>
              {sending ? <Spinner /> : t.sendMessage}
            </button>
          </form>
        )}
      </main>
    </div>
  );
};
