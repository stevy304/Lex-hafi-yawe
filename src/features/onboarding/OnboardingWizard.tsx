import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../../auth/AuthContext';
import { useLang } from '../../i18n/useLang';
import { useTheme } from '../../hooks/useTheme';
import { authService } from '../../auth';
import { sanitizeNext } from '../../auth/safeRedirect';
import { LEGAL_TOPICS } from '../../data/topics';
import { LogoIcon } from '../../components/LogoIcon';
import { LogoHeroOutline } from '../../components/LogoHeroOutline';
import { LanguageSwitcher } from '../../components/LanguageSwitcher';
import { ThemeToggle } from '../../components/ThemeToggle';
import { FeatureChips } from '../../components/FeatureChips';
import { QrCard } from '../../components/QrCard';
import { Spinner } from '../../components/Spinner';

interface SuggestedAdvocate {
  id: string;
  name: string;
  handle: string;
  practiceArea: string;
  district: string;
}

interface SuggestedCommunity {
  id: string;
  name: string;
  membersCount: number;
}

export const OnboardingWizard: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const rawNext = searchParams.get('next');
  const { user, refresh } = useAuth();
  const { lang, setLang, t } = useLang();
  const { toggleTheme } = useTheme();

  // Sub-steps: 'interests' | 'follow' | 'done'
  const [step, setStep] = useState<'interests' | 'follow' | 'done'>('interests');
  const [selectedTopics, setSelectedTopics] = useState<string[]>([]);
  const [followedAdvocates, setFollowedAdvocates] = useState<Set<string>>(new Set());
  const [joinedCommunities, setJoinedCommunities] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(false);

  // Resume existing onboarding if already stored
  useEffect(() => {
    authService.getOnboardingState().then((state) => {
      if (state.completed) {
        navigate('/home', { replace: true });
      } else if (state.step === 'interests' || state.step === 'follow' || state.step === 'done') {
        setStep(state.step);
      }
      if (state.data?.topics) {
        setSelectedTopics(state.data.topics);
      }
    });
  }, [navigate]);

  const toggleTopic = (slug: string) => {
    setSelectedTopics((prev) =>
      prev.includes(slug) ? prev.filter((s) => s !== slug) : [...prev, slug]
    );
  };

  const handleInterestsContinue = async () => {
    setLoading(true);
    try {
      await authService.updateOnboarding({
        step: 'follow',
        topics: selectedTopics,
      });
      setStep('follow');
    } finally {
      setLoading(false);
    }
  };

  const handleFollowContinue = async () => {
    setLoading(true);
    try {
      await authService.updateOnboarding({
        step: 'done',
        followingIds: Array.from(followedAdvocates),
      });
      setStep('done');
    } finally {
      setLoading(false);
    }
  };

  const handleFinishOnboarding = async () => {
    setLoading(true);
    try {
      await authService.completeOnboarding();
      await refresh();
      const target = sanitizeNext(rawNext) ?? '/home';
      navigate(target, { replace: true });
    } finally {
      setLoading(false);
    }
  };

  // 6 suggested advocates
  const suggestedAdvocates: SuggestedAdvocate[] = [
    { id: 'adv_1', name: 'Me. Patrick Habimana', handle: 'phabimana', practiceArea: 'Land & Property', district: 'Gasabo' },
    { id: 'adv_2', name: 'Me. Claudine Mukamana', handle: 'cmukamana', practiceArea: 'Family Law', district: 'Nyarugenge' },
    { id: 'adv_3', name: 'Me. Eric Nshimiyimana', handle: 'enshimiye', practiceArea: 'Commercial Law', district: 'Kicukiro' },
    { id: 'adv_4', name: 'Me. Diane Uwera', handle: 'duwera', practiceArea: 'Labor & Employment', district: 'Musanze' },
    { id: 'adv_5', name: 'Me. Jean Bosco Mutabazi', handle: 'jmutabazi', practiceArea: 'Criminal Justice', district: 'Huye' },
    { id: 'adv_6', name: 'Me. Alice Umutoni', handle: 'aumutoni', practiceArea: 'Constitutional Rights', district: 'Rubavu' },
  ];

  // 4 suggested communities
  const suggestedCommunities: SuggestedCommunity[] = [
    { id: 'comm_1', name: 'Rwanda Land Rights & Dispute Forum', membersCount: 1420 },
    { id: 'comm_2', name: 'Kigali SME & Labor Law Circle', membersCount: 890 },
    { id: 'comm_3', name: 'Official Gazette Digest & Legal Alerts', membersCount: 2310 },
    { id: 'comm_4', name: 'MAJ Access to Justice Network', membersCount: 1650 },
  ];

  return (
    <div className="page">
      <main className="left">
        {/* Top bar */}
        <div className="top">
          <div className="brand">
            <LogoIcon size={38} ariaHidden={true} />
            <div>
              <b>Lex Hafi Yawe</b>
              <span>{t.tag}</span>
            </div>
          </div>
          <div className="ctrls">
            <LanguageSwitcher currentLang={lang} onSelectLang={setLang} />
            <ThemeToggle onToggle={toggleTheme} />
          </div>
        </div>

        {/* STEP 1: Interests */}
        {step === 'interests' && (
          <div className="mid auth auth-fade" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>
                Onboarding • Step 1
              </span>
              <button
                type="button"
                className="link"
                onClick={() => {
                  setSelectedTopics([]);
                  handleInterestsContinue();
                }}
              >
                {t.skipForNow}
              </button>
            </div>

            <h1 style={{ fontSize: 'clamp(24px, 4vh, 32px)', margin: '4px 0 0 0' }}>{t.selectThreeTopics}</h1>
            <p className="sub" style={{ margin: '0 0 10px 0' }}>
              Selected: {selectedTopics.length} / 3 required
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: '8px' }}>
              {LEGAL_TOPICS.map((topic) => {
                const isSelected = selectedTopics.includes(topic.slug);
                return (
                  <button
                    key={topic.slug}
                    type="button"
                    onClick={() => toggleTopic(topic.slug)}
                    style={{
                      padding: '10px 12px',
                      borderRadius: '12px',
                      border: `1px solid ${isSelected ? 'var(--accent)' : 'var(--border)'}`,
                      background: isSelected ? 'rgba(210,105,30,0.12)' : 'var(--surface)',
                      color: isSelected ? 'var(--accent)' : 'var(--text)',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      fontSize: '13px',
                      fontWeight: 600,
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all .15s ease',
                    }}
                  >
                    <span>{topic.icon}</span>
                    <span>{lang === 'rw' ? topic.rw : lang === 'fr' ? topic.fr : topic.en}</span>
                  </button>
                );
              })}
            </div>

            <button
              type="button"
              className="go"
              disabled={selectedTopics.length < 3 || loading}
              onClick={handleInterestsContinue}
            >
              {loading ? <Spinner /> : t.cont}
            </button>
          </div>
        )}

        {/* STEP 2: People and Communities */}
        {step === 'follow' && (
          <div className="mid auth auth-fade" style={{ maxWidth: '640px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', fontWeight: 600, color: 'var(--muted)', textTransform: 'uppercase' }}>
                Onboarding • Step 2
              </span>
              <button
                type="button"
                className="link"
                onClick={() => handleFollowContinue()}
              >
                {t.skipForNow}
              </button>
            </div>

            <h1 style={{ fontSize: 'clamp(24px, 4vh, 32px)', margin: '4px 0 0 0' }}>{t.suggestedAdvocates}</h1>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '28vh', overflowY: 'auto' }}>
              {suggestedAdvocates.map((adv) => {
                const isFollowing = followedAdvocates.has(adv.id);
                return (
                  <div
                    key={adv.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--surface)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <b style={{ fontSize: '13px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        {adv.name} <span style={{ color: 'var(--gold)' }}>✓</span>
                      </b>
                      <span style={{ fontSize: '11px', color: 'var(--muted)' }}>
                        @{adv.handle} • {adv.practiceArea} ({adv.district})
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ghost"
                      style={{
                        height: '32px',
                        fontSize: '12px',
                        padding: '0 12px',
                        background: isFollowing ? 'var(--text)' : 'transparent',
                        color: isFollowing ? 'var(--bg)' : 'var(--text)',
                      }}
                      onClick={() => {
                        setFollowedAdvocates((prev) => {
                          const next = new Set(prev);
                          if (next.has(adv.id)) next.delete(adv.id);
                          else next.add(adv.id);
                          return next;
                        });
                      }}
                    >
                      {isFollowing ? t.following : t.follow}
                    </button>
                  </div>
                );
              })}
            </div>

            <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--muted)', marginTop: '4px' }}>
              {t.suggestedCommunities}
            </span>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '20vh', overflowY: 'auto' }}>
              {suggestedCommunities.map((comm) => {
                const isJoined = joinedCommunities.has(comm.id);
                return (
                  <div
                    key={comm.id}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      padding: '8px 12px',
                      background: 'var(--surface)',
                      borderRadius: '10px',
                      border: '1px solid var(--border)',
                    }}
                  >
                    <div>
                      <b style={{ fontSize: '13px' }}>{comm.name}</b>
                      <span style={{ fontSize: '11px', color: 'var(--muted)', display: 'block' }}>
                        {comm.membersCount} members
                      </span>
                    </div>
                    <button
                      type="button"
                      className="ghost"
                      style={{
                        height: '32px',
                        fontSize: '12px',
                        padding: '0 12px',
                        background: isJoined ? 'var(--accent)' : 'transparent',
                        color: isJoined ? '#fff' : 'var(--accent)',
                      }}
                      onClick={() => {
                        setJoinedCommunities((prev) => {
                          const next = new Set(prev);
                          if (next.has(comm.id)) next.delete(comm.id);
                          else next.add(comm.id);
                          return next;
                        });
                      }}
                    >
                      {isJoined ? t.joined : t.join}
                    </button>
                  </div>
                );
              })}
            </div>

            <button
              type="button"
              className="go"
              disabled={loading}
              onClick={handleFollowContinue}
            >
              {loading ? <Spinner /> : t.cont}
            </button>
          </div>
        )}

        {/* STEP 3: Done */}
        {step === 'done' && (
          <div className="mid auth auth-fade" style={{ maxWidth: '580px', textAlign: 'center' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                borderRadius: '50%',
                background: 'rgba(201,162,75,0.15)',
                color: 'var(--gold)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '32px',
                margin: '0 auto 8px auto',
              }}
            >
              ✓
            </div>

            <h1 style={{ fontSize: 'clamp(26px, 4vh, 36px)', margin: '0 0 6px 0' }}>
              {t.allSet.replace('{name}', user?.name || 'Citizen')}
            </h1>

            <p style={{ margin: '0 0 16px 0', color: 'var(--muted)', fontSize: '14px', lineHeight: 1.5 }}>
              {t.allSetSummary}
            </p>

            <div
              style={{
                background: 'var(--surface)',
                border: '1px solid var(--border)',
                borderRadius: '12px',
                padding: '16px',
                marginBottom: '16px',
                textAlign: 'left',
                display: 'flex',
                flexDirection: 'column',
                gap: '8px',
                fontSize: '13px',
              }}
            >
              <div><b>Handle:</b> @{user?.handle}</div>
              <div><b>District:</b> {user?.district || 'Rwanda'}</div>
              <div><b>Topics followed:</b> {selectedTopics.length > 0 ? selectedTopics.length : 'All general legislation'}</div>
            </div>

            <button
              type="button"
              className="go"
              disabled={loading}
              onClick={handleFinishOnboarding}
            >
              {loading ? <Spinner /> : t.goToFeed}
            </button>
          </div>
        )}

        {/* Footer */}
        <div className="foot">
          <a href="/about">{t.about}</a>
          <a href="/help">{t.help}</a>
          <a href="/terms">{t.terms2}</a>
          <a href="/privacy">{t.privacy2}</a>
          <span>© 2026 Lex Hafi Yawe</span>
        </div>
      </main>

      <aside className="hero" aria-hidden="true">
        <LogoHeroOutline />
        <FeatureChips t={t} />
        <QrCard t={t} />
      </aside>
    </div>
  );
};
