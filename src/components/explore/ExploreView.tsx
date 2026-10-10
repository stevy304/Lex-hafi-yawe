import React, { useState } from 'react';
import {
  Search,
  TrendingUp,
  ShieldCheck,
  BookOpen,
  Briefcase,
  HeartHandshake,
  Users
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';

export const ExploreView: React.FC = () => {
  const {
    searchQuery,
    setSearchQuery,
    posts,
    users,
    laws,
    legalAidProviders,
    legalServices,
    navigateToProfile,
    setActiveView
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<'all' | 'posts' | 'people' | 'laws' | 'aid' | 'services'>('all');

  const query = searchQuery.trim().toLowerCase();

  // Search Results
  const matchingPosts = posts.filter(
    p => p.content.toLowerCase().includes(query) || p.tags.some(t => t.toLowerCase().includes(query))
  );

  const matchingUsers = users.filter(
    u => u.name.toLowerCase().includes(query) ||
         u.username.toLowerCase().includes(query) ||
         u.bio.toLowerCase().includes(query) ||
         u.practiceAreas?.some(pa => pa.toLowerCase().includes(query))
  );

  const matchingLaws = laws.filter(
    l => l.title.toLowerCase().includes(query) ||
         l.lawNumber.toLowerCase().includes(query) ||
         l.summaryEn.toLowerCase().includes(query)
  );

  const matchingAid = legalAidProviders.filter(
    a => a.name.toLowerCase().includes(query) ||
         a.district.toLowerCase().includes(query) ||
         a.servicesOffered.some(s => s.toLowerCase().includes(query))
  );

  const matchingServices = legalServices.filter(
    s => s.title.toLowerCase().includes(query) ||
         s.practiceArea.toLowerCase().includes(query) ||
         s.description.toLowerCase().includes(query)
  );

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Search Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4 sticky top-0 z-20">
        <div className="relative mb-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Search posts, advocates, laws, legal aid, or topics..."
            className="w-full text-xs bg-slate-100 border border-slate-200 rounded-xl pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:bg-white"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar text-xs font-semibold">
          <button
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeCategory === 'all'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All Results
          </button>
          <button
            onClick={() => setActiveCategory('posts')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeCategory === 'posts'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Posts ({matchingPosts.length})
          </button>
          <button
            onClick={() => setActiveCategory('people')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeCategory === 'people'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Advocates & People ({matchingUsers.length})
          </button>
          <button
            onClick={() => setActiveCategory('laws')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeCategory === 'laws'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Legislation ({matchingLaws.length})
          </button>
          <button
            onClick={() => setActiveCategory('services')}
            className={`px-3 py-1.5 rounded-lg transition whitespace-nowrap ${
              activeCategory === 'services'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Legal Services ({matchingServices.length})
          </button>
        </div>
      </div>

      {/* Results Container */}
      <div className="p-4 sm:p-6 space-y-6 max-w-4xl">
        {/* People Results */}
        {(activeCategory === 'all' || activeCategory === 'people') && matchingUsers.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-blue-600" />
              <span>Advocates & Accounts</span>
            </h3>
            <div className="divide-y divide-slate-100">
              {matchingUsers.map(u => (
                <div key={u.id} className="py-2.5 flex items-center justify-between">
                  <div
                    onClick={() => navigateToProfile(u.id)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0"
                  >
                    <UserAvatar user={u} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {u.name}
                        </span>
                        <VerificationBadge user={u} size="sm" />
                      </div>
                      <span className="text-2xs text-slate-500 block">
                        {u.professionalTitle || `@${u.username}`}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => navigateToProfile(u.id)}
                    className="px-3 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-lg transition"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Laws Results */}
        {(activeCategory === 'all' || activeCategory === 'laws') && matchingLaws.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-blue-600" />
              <span>Statutory Laws & Codes</span>
            </h3>
            <div className="space-y-2">
              {matchingLaws.map(l => (
                <div
                  key={l.id}
                  onClick={() => setActiveView('laws')}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 transition cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {l.lawNumber}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{l.title}</h4>
                  <p className="text-2xs text-slate-600 line-clamp-2 mt-0.5">{l.summaryEn}</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Services Marketplace Results */}
        {(activeCategory === 'all' || activeCategory === 'services') && matchingServices.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-blue-600" />
                <span>Advocate Services & Practice Areas ({matchingServices.length})</span>
              </h3>
              <button
                onClick={() => setActiveView('services')}
                className="text-xs font-bold text-blue-700 hover:underline"
              >
                View all in Marketplace
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {matchingServices.map(svc => (
                <div
                  key={svc.id}
                  onClick={() => setActiveView('services')}
                  className="p-3 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/30 transition cursor-pointer"
                >
                  <span className="text-[10px] font-bold text-blue-800 bg-blue-50 px-2 py-0.5 rounded">
                    {svc.practiceArea}
                  </span>
                  <h4 className="text-xs font-bold text-slate-900 mt-1">{svc.title}</h4>
                  <p className="text-2xs text-slate-500 line-clamp-2 mt-0.5">{svc.description}</p>
                  <p className="text-xs font-extrabold text-blue-700 mt-2">{svc.feeRWF.toLocaleString()} RWF</p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Legal Aid Bureaus Results */}
        {(activeCategory === 'all' || activeCategory === 'aid') && matchingAid.length > 0 && (
          <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-xs">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-emerald-600" />
                <span>Free Legal Aid Bureaus (MAJ) ({matchingAid.length})</span>
              </h3>
              <button
                onClick={() => setActiveView('legalaid')}
                className="text-xs font-bold text-emerald-700 hover:underline"
              >
                View Directory
              </button>
            </div>
            <div className="space-y-2">
              {matchingAid.map(aid => (
                <div
                  key={aid.id}
                  onClick={() => setActiveView('legalaid')}
                  className="p-3 rounded-xl border border-slate-100 hover:border-emerald-300 hover:bg-emerald-50/30 transition cursor-pointer flex items-center justify-between"
                >
                  <div>
                    <h4 className="text-xs font-bold text-slate-900">{aid.name}</h4>
                    <p className="text-2xs text-slate-500">{aid.district} District • {aid.province}</p>
                  </div>
                  <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded">
                    Free / MAJ
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Posts Stream Results */}
        {(activeCategory === 'all' || activeCategory === 'posts') && (
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Posts & Discussions ({matchingPosts.length})
            </h3>
            {matchingPosts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 text-xs text-slate-500 space-y-2">
                <p className="font-medium text-slate-700">
                  {query
                    ? `No legal discussions found matching "${query}".`
                    : 'No public discussions published yet on the platform.'}
                </p>
                <p className="text-2xs text-slate-400 max-w-sm mx-auto">
                  {query
                    ? 'Try searching by law name (e.g. "Labor Law"), practice area (e.g. "Commercial"), or district.'
                    : 'Be the first to share an analysis or question regarding Rwandan statutory law.'}
                </p>
              </div>
            ) : (
              matchingPosts.map(p => <PostCard key={p.id} post={p} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
};
