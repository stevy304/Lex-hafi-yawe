import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  Check,
  Feather,
  Plus,
  Scale,
  X,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';
import { PostComposer } from '../feed/PostComposer';
import { PageHeader } from '../common/PageHeader';
import { Card } from '../common/Card';
import { EmptyState } from '../common/EmptyState';

export const CommunitiesView: React.FC = () => {
  const {
    communities,
    toggleJoinCommunity,
    createCommunity,
    currentUser,
    posts,
    selectedCommunityId,
    openLoginModal,
  } = useApp();

  const [activeCommId, setActiveCommId] = useState<string>(
    selectedCommunityId || (communities[0]?.id || '')
  );

  const [isCreateCommOpen, setIsCreateCommOpen] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommKigaliName, setNewCommKigaliName] = useState('');
  const [newCommTopic, setNewCommTopic] = useState('Land & Property');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommRules, setNewCommRules] = useState(
    'Respectful civic discourse, Cite relevant Rwandan laws'
  );

  const activeCommunity =
    communities.find((c) => c.id === activeCommId) || communities[0];
  const isJoined = currentUser
    ? activeCommunity?.joinedBy.includes(currentUser.id)
    : false;

  const communityPosts = posts.filter(
    (p) =>
      p.communityId === activeCommId ||
      p.legalTopic === activeCommunity?.topic
  );

  const handleJoinClick = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    if (activeCommunity) {
      toggleJoinCommunity(activeCommunity.id);
    }
  };

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    createCommunity({
      name: newCommName.trim(),
      kigaliName: newCommKigaliName.trim() || undefined,
      description: newCommDesc.trim(),
      topic: newCommTopic,
      rules: newCommRules.split(',').map((r) => r.trim()),
    });

    setIsCreateCommOpen(false);
    setNewCommName('');
    setNewCommKigaliName('');
    setNewCommDesc('');
  };

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Communities"
        subtitle="Specialized legal forums organized by statutory practice area"
        actions={
          <button
            type="button"
            onClick={() => {
              if (!currentUser) {
                openLoginModal();
                return;
              }
              setIsCreateCommOpen(true);
            }}
            className="px-3 py-1.5 rounded-full bg-[var(--accent)] hover:brightness-110 text-white font-medium text-[12px] flex items-center gap-1 transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>New forum</span>
          </button>
        }
      >
        {/* Community Tabs Horizontal Pill Bar */}
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 text-[13px] font-medium">
          {communities.map((comm) => (
            <button
              key={comm.id}
              type="button"
              onClick={() => setActiveCommId(comm.id)}
              className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
                comm.id === activeCommId
                  ? 'bg-[var(--accent)] text-white'
                  : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
              }`}
            >
              {comm.name}
            </button>
          ))}
        </div>
      </PageHeader>

      <div className="p-4 space-y-4">
        {/* Active Community Banner Card */}
        {activeCommunity && (
          <Card>
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <span className="text-[11px] font-medium text-[var(--gold)] bg-[var(--bg)] border border-[var(--border)] px-2 py-0.5 rounded">
                  {activeCommunity.topic}
                </span>
                <h2 className="text-[18px] font-semibold text-[var(--text)] mt-1.5 truncate">
                  {activeCommunity.name}
                </h2>
                <p className="text-[13px] text-[var(--muted)] mt-1 leading-normal">
                  {activeCommunity.description}
                </p>
                <div className="flex items-center gap-4 mt-3 text-[12px] text-[var(--muted)]">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5" />
                    <span>{activeCommunity.membersCount} members</span>
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Scale className="w-3.5 h-3.5" />
                    <span>Rwanda jurisdiction</span>
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={handleJoinClick}
                className={`px-4 py-1.5 rounded-full text-[13px] font-medium transition-colors cursor-pointer shrink-0 ${
                  isJoined
                    ? 'border border-[var(--border)] text-[var(--text)] hover:border-[var(--danger)] hover:text-[var(--danger)]'
                    : 'bg-[var(--text)] text-[var(--bg)] hover:opacity-90'
                }`}
              >
                {isJoined ? 'Joined' : 'Join'}
              </button>
            </div>
          </Card>
        )}

        {/* Composer for joined community */}
        {isJoined && (
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-3">
            <PostComposer defaultTopic={activeCommunity?.topic} />
          </div>
        )}

        {/* Community Posts */}
        <div className="space-y-3 pt-1">
          <h3 className="text-[12px] font-semibold uppercase tracking-wider text-[var(--muted)] px-1">
            Community discussions ({communityPosts.length})
          </h3>
          {communityPosts.length === 0 ? (
            <EmptyState
              icon={<Feather className="w-6 h-6 text-[var(--muted)]" />}
              title="No posts in this forum yet"
              description="Start the conversation by posting a legal question or analysis for this practice area."
            />
          ) : (
            communityPosts.map((post) => <PostCard key={post.id} post={post} />)
          )}
        </div>
      </div>

      {/* Create Community Modal */}
      {isCreateCommOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 w-full max-w-md shadow-2xl space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[var(--text)] m-0">
                Create new legal forum
              </h3>
              <button
                type="button"
                onClick={() => setIsCreateCommOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunitySubmit} className="space-y-3">
              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">
                  Forum name (English)
                </label>
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={(e) => setNewCommName(e.target.value)}
                  placeholder="e.g. Commercial Contracts Working Group"
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] px-3 py-2 focus:outline-none focus:border-[var(--accent)]"
                />
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">
                  Forum topic / Practice area
                </label>
                <select
                  value={newCommTopic}
                  onChange={(e) => setNewCommTopic(e.target.value)}
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] px-3 py-2 focus:outline-none focus:border-[var(--accent)]"
                >
                  <option value="Land & Property">Land & Property</option>
                  <option value="Labor & Employment">Labor & Employment</option>
                  <option value="Commercial Law">Commercial Law</option>
                  <option value="Data Protection & Tech">Data Protection & Tech</option>
                  <option value="Alternative Dispute Resolution">Alternative Dispute Resolution</option>
                </select>
              </div>

              <div>
                <label className="text-[12px] font-medium text-[var(--muted)] block mb-1">
                  Description
                </label>
                <textarea
                  rows={3}
                  value={newCommDesc}
                  onChange={(e) => setNewCommDesc(e.target.value)}
                  placeholder="Purpose of this legal discussion forum..."
                  className="w-full text-[13px] bg-[var(--bg)] text-[var(--text)] border border-[var(--border)] rounded-[8px] px-3 py-2 focus:outline-none focus:border-[var(--accent)] resize-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setIsCreateCommOpen(false)}
                  className="px-4 py-2 rounded-full border border-[var(--border)] text-[var(--text)] hover:bg-[var(--hover)] text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-full bg-[var(--accent)] hover:brightness-110 text-white text-[13px] font-medium transition-colors cursor-pointer"
                >
                  Create forum
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
