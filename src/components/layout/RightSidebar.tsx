import React from 'react';
import { Search, TrendingUp, ShieldCheck, HeartHandshake, ExternalLink, Calendar } from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { useTranslation } from '../../utils/i18n';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';

export const RightSidebar: React.FC = () => {
  const {
    users,
    currentUser,
    toggleFollowUser,
    navigateToProfile,
    setActiveView,
    searchQuery,
    setSearchQuery,
    openLoginModal,
    language
  } = useApp();

  const t = useTranslation(language);

  // Suggested advocates that are not the current user
  const suggestedAdvocates = users
    .filter(u => u.role === 'advocate' && u.id !== currentUser?.id)
    .slice(0, 3);

  // Trending topics
  const trendingTopics = [
    { tag: 'LandLawRevision2025', count: '1.4k posts', category: 'Property Conveyancing' },
    { tag: 'AbunziMediation', count: '890 posts', category: 'Alternative Dispute Resolution' },
    { tag: 'LaborRightsRwanda', count: '740 posts', category: 'Employment Contracts' },
    { tag: 'IECMSEfiling', count: '620 posts', category: 'Judiciary E-Court' },
    { tag: 'DataProtectionRwanda', count: '450 posts', category: 'Law N° 058/2021' }
  ];

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setActiveView('explore');
    }
  };

  return (
    <aside className="w-80 xl:w-96 h-screen sticky top-0 hidden lg:flex flex-col gap-4 border-l border-slate-200/90 bg-white/50 backdrop-blur-xs px-4 py-4 overflow-y-auto select-none shrink-0">
      {/* Search Bar */}
      <form onSubmit={handleSearchSubmit} className="relative">
        <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="w-full pl-10 pr-4 py-2 text-xs bg-slate-100 hover:bg-slate-200/80 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:outline-none rounded-full transition border border-transparent focus:border-blue-600"
        />
      </form>

      {/* Free Legal Aid Callout (Access to Justice / MAJ) */}
      <div className="bg-gradient-to-br from-emerald-50 to-teal-50/70 border border-emerald-200/70 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="p-1.5 bg-emerald-600 text-white rounded-lg inline-flex">
            <HeartHandshake className="w-4 h-4" />
          </span>
          <span className="text-xs font-extrabold text-emerald-950 uppercase tracking-wider">
            {t.freeLegalAidBannerTitle}
          </span>
        </div>
        <p className="text-xs text-emerald-800 leading-relaxed mb-3">
          {t.freeLegalAidBannerDesc}
        </p>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setActiveView('legalaid')}
            className="flex-1 text-center py-1.5 px-3 bg-emerald-700 hover:bg-emerald-800 text-white rounded-lg text-xs font-bold transition shadow-xs cursor-pointer"
          >
            {t.btnFindMaj}
          </button>
          <a
            href="tel:3922"
            className="py-1.5 px-3 bg-white hover:bg-emerald-100/60 border border-emerald-300 text-emerald-900 rounded-lg text-xs font-bold transition inline-flex items-center gap-1 cursor-pointer"
            title="Free Legal Assistance Hotline"
          >
            <span>Dial 3922</span>
          </a>
        </div>
      </div>

      {/* Trending Rwandan Legal Topics */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <TrendingUp className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {t.trendingTopics}
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-medium">Rwanda</span>
        </div>

        <div className="space-y-2.5">
          {trendingTopics.map(item => (
            <button
              key={item.tag}
              onClick={() => {
                setSearchQuery(item.tag);
                setActiveView('explore');
              }}
              className="w-full text-left group hover:bg-white p-1.5 -mx-1.5 rounded-lg transition"
            >
              <div className="flex items-center justify-between">
                <span className="text-[11px] text-slate-500 font-medium">
                  {item.category}
                </span>
                <span className="text-[10px] text-slate-400">
                  {item.count}
                </span>
              </div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-blue-700 transition">
                #{item.tag}
              </p>
            </button>
          ))}
        </div>
      </div>

      {/* Suggested Verified Advocates */}
      <div className="bg-slate-50 border border-slate-200/80 rounded-2xl p-3.5 shadow-xs">
        <div className="flex items-center justify-between mb-2.5">
          <div className="flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-blue-600" />
            <h3 className="text-xs font-bold text-slate-900 uppercase tracking-wide">
              {t.suggestedAdvocates}
            </h3>
          </div>
          <button
            onClick={() => setActiveView('services')}
            className="text-[11px] text-blue-600 hover:text-blue-800 font-semibold"
          >
            View all
          </button>
        </div>

        <div className="space-y-3">
          {suggestedAdvocates.map(advocate => (
            <div key={advocate.id} className="flex items-start justify-between gap-2">
              <button
                onClick={() => navigateToProfile(advocate.id)}
                className="flex items-start gap-2 text-left group min-w-0"
              >
                <UserAvatar user={advocate} size="sm" />
                <div className="min-w-0">
                  <div className="flex items-center gap-1">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-blue-700 truncate block">
                      {advocate.name}
                    </span>
                    <VerificationBadge user={advocate} size="sm" />
                  </div>
                  <span className="text-[11px] text-slate-500 block truncate">
                    {advocate.firmName || advocate.professionalTitle}
                  </span>
                  <span className="text-[10px] text-blue-600 font-semibold block">
                    {advocate.barRollNumber}
                  </span>
                </div>
              </button>

              <button
                onClick={() => {
                  if (!currentUser) openLoginModal();
                  else toggleFollowUser(advocate.id);
                }}
                className={`px-3 py-1 text-2xs font-bold rounded-full transition shrink-0 cursor-pointer ${
                  currentUser?.followingIds?.includes(advocate.id)
                    ? 'bg-slate-200 text-slate-800 hover:bg-slate-300'
                    : 'bg-[#102744] hover:bg-slate-800 text-white'
                }`}
              >
                {currentUser?.followingIds?.includes(advocate.id) ? 'Following' : t.btnFollow}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Info */}
      <div className="text-[11px] text-slate-400 px-1 space-y-1 pt-1">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          <button onClick={() => setActiveView('laws')} className="hover:underline">Legislation</button>
          <button onClick={() => setActiveView('legalaid')} className="hover:underline">Legal Aid</button>
          <button onClick={() => setActiveView('admin')} className="hover:underline">Platform Ops</button>
          <span className="text-slate-300">•</span>
          <span>Kigali, Rwanda</span>
        </div>
        <p className="text-[10px] text-slate-400">
          © 2026 Lex Hafi Yawe. Built for Digital Justice in Rwanda.
        </p>
      </div>
    </aside>
  );
};
