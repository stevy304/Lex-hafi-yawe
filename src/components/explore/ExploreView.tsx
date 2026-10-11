import React, { useState } from 'react';
import {
  Search,
  BookOpen,
  Briefcase,
  HeartHandshake,
  Users,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

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
    setActiveView,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<
    'all' | 'posts' | 'people' | 'laws' | 'aid' | 'services'
  >('all');

  const query = searchQuery.trim().toLowerCase();

  // Search Results
  const matchingPosts = posts.filter(
    (p) =>
      p.content.toLowerCase().includes(query) ||
      p.tags.some((t) => t.toLowerCase().includes(query))
  );

  const matchingUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(query) ||
      u.username.toLowerCase().includes(query) ||
      u.bio.toLowerCase().includes(query) ||
      u.practiceAreas?.some((pa) => pa.toLowerCase().includes(query))
  );

  const matchingLaws = laws.filter(
    (l) =>
      l.title.toLowerCase().includes(query) ||
      l.lawNumber.toLowerCase().includes(query) ||
      l.summaryEn.toLowerCase().includes(query)
  );

  const matchingAid = legalAidProviders.filter(
    (a) =>
      a.name.toLowerCase().includes(query) ||
      a.district.toLowerCase().includes(query) ||
      a.servicesOffered.some((s) => s.toLowerCase().includes(query))
  );

  const matchingServices = legalServices.filter(
    (s) =>
      s.title.toLowerCase().includes(query) ||
      s.practiceArea.toLowerCase().includes(query) ||
      s.description.toLowerCase().includes(query)
  );

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      {/* Search Header */}
      <PageHeader
        title="Explore"
        subtitle="Search statutory laws, verified advocates, legal aid, or discussions"
      >
        <div className="relative">
          <Search className="w-4 h-4 text-[var(--muted)] absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search posts, advocates, laws, legal aid, or topics..."
            className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] rounded-full pl-10 pr-4 py-2 focus:outline-none focus:border-[var(--accent)]"
          />
        </div>

        {/* Categories Tabs */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-2 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setActiveCategory('all')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            All results
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('posts')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === 'posts'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Posts ({matchingPosts.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('people')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === 'people'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Advocates & people ({matchingUsers.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('laws')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === 'laws'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Legislation ({matchingLaws.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveCategory('services')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              activeCategory === 'services'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Legal services ({matchingServices.length})
          </button>
        </div>
      </PageHeader>

      {/* Results Container */}
      <div className="p-4 space-y-4">
        {/* People Results */}
        {(activeCategory === 'all' || activeCategory === 'people') && matchingUsers.length > 0 && (
          <Card>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[var(--accent)]" />
              <span>Advocates and accounts</span>
            </h3>
            <div className="divide-y divide-[var(--border)]">
              {matchingUsers.map((u) => (
                <div key={u.id} className="py-2.5 flex items-center justify-between gap-3">
                  <div
                    onClick={() => navigateToProfile(u.id)}
                    className="flex items-center gap-2.5 cursor-pointer min-w-0 flex-1"
                  >
                    <UserAvatar user={u} size="md" />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-[14px] font-medium text-[var(--text)] truncate">
                          {u.name}
                        </span>
                        <VerificationBadge user={u} size="sm" />
                      </div>
                      <span className="text-[12px] text-[var(--muted)] block truncate">
                        {u.professionalTitle || `@${u.username}`}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateToProfile(u.id)}
                    className="px-3 py-1 bg-[var(--surface)] hover:bg-[var(--hover)] text-[var(--text)] border border-[var(--border)] text-[12px] font-medium rounded-full transition-colors cursor-pointer shrink-0"
                  >
                    View
                  </button>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Laws Results */}
        {(activeCategory === 'all' || activeCategory === 'laws') && matchingLaws.length > 0 && (
          <Card>
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] mb-3 flex items-center gap-1.5">
              <BookOpen className="w-4 h-4 text-[var(--accent)]" />
              <span>Statutory laws and codes</span>
            </h3>
            <div className="space-y-2">
              {matchingLaws.map((l) => (
                <div
                  key={l.id}
                  onClick={() => setActiveView('laws')}
                  className="p-3 rounded-[10px] border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)] transition-colors cursor-pointer"
                >
                  <span className="text-[11px] font-medium text-[var(--gold)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
                    {l.lawNumber}
                  </span>
                  <h4 className="text-[14px] font-medium text-[var(--text)] mt-1.5">{l.title}</h4>
                  <p className="text-[12px] text-[var(--muted)] line-clamp-2 mt-0.5">{l.summaryEn}</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Legal Services Marketplace Results */}
        {(activeCategory === 'all' || activeCategory === 'services') && matchingServices.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                <Briefcase className="w-4 h-4 text-[var(--accent)]" />
                <span>Advocate services ({matchingServices.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveView('services')}
                className="text-[12px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
              >
                View all in marketplace
              </button>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {matchingServices.map((svc) => (
                <div
                  key={svc.id}
                  onClick={() => setActiveView('services')}
                  className="p-3 rounded-[10px] border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)] transition-colors cursor-pointer"
                >
                  <span className="text-[11px] font-medium text-[var(--gold)] bg-[var(--surface)] px-2 py-0.5 rounded border border-[var(--border)]">
                    {svc.practiceArea}
                  </span>
                  <h4 className="text-[13px] font-medium text-[var(--text)] mt-1.5 truncate">{svc.title}</h4>
                  <p className="text-[12px] text-[var(--muted)] line-clamp-2 mt-0.5">{svc.description}</p>
                  <p className="text-[13px] font-semibold text-[var(--accent)] mt-2">{svc.feeRWF.toLocaleString()} RWF</p>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Legal Aid Bureaus Results */}
        {(activeCategory === 'all' || activeCategory === 'aid') && matchingAid.length > 0 && (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] flex items-center gap-1.5">
                <HeartHandshake className="w-4 h-4 text-[var(--ok-text)]" />
                <span>Free legal aid bureaus (MAJ) ({matchingAid.length})</span>
              </h3>
              <button
                type="button"
                onClick={() => setActiveView('legalaid')}
                className="text-[12px] font-medium text-[var(--accent)] hover:underline cursor-pointer"
              >
                View directory
              </button>
            </div>
            <div className="space-y-2">
              {matchingAid.map((aid) => (
                <div
                  key={aid.id}
                  onClick={() => setActiveView('legalaid')}
                  className="p-3 rounded-[10px] border border-[var(--border)] hover:border-[var(--accent)] bg-[var(--bg)] transition-colors cursor-pointer flex items-center justify-between gap-3"
                >
                  <div className="min-w-0">
                    <h4 className="text-[14px] font-medium text-[var(--text)] truncate">{aid.name}</h4>
                    <p className="text-[12px] text-[var(--muted)] truncate">{aid.district} District • {aid.province}</p>
                  </div>
                  <span className="text-[11px] font-medium text-[var(--ok-text)] bg-[var(--ok-bg)] px-2 py-0.5 rounded shrink-0">
                    Free / MAJ
                  </span>
                </div>
              ))}
            </div>
          </Card>
        )}

        {/* Posts Stream Results */}
        {(activeCategory === 'all' || activeCategory === 'posts') && (
          <div className="space-y-3">
            <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] px-1">
              Posts and discussions ({matchingPosts.length})
            </h3>
            {matchingPosts.length === 0 ? (
              <EmptyState
                title={query ? `No posts match "${query}"` : 'No posts match these filters'}
                description={
                  query
                    ? 'Try searching by law name, practice area, or district.'
                    : 'Be the first to share an analysis or question regarding Rwandan statutory law.'
                }
              />
            ) : (
              matchingPosts.map((p) => <PostCard key={p.id} post={p} />)
            )}
          </div>
        )}
      </div>
    </div>
  );
};
