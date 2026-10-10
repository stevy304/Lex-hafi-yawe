import React, { useState } from 'react';
import {
  Users,
  ShieldAlert,
  Check,
  Feather,
  BookOpen,
  ArrowRight,
  Plus,
  Scale,
  X
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { PostCard } from '../feed/PostCard';
import { PostComposer } from '../feed/PostComposer';
import { Community } from '../../types';

export const CommunitiesView: React.FC = () => {
  const {
    communities,
    toggleJoinCommunity,
    createCommunity,
    currentUser,
    posts,
    selectedCommunityId,
    setSelectedCommunityId,
    openLoginModal
  } = useApp();

  const [activeCommId, setActiveCommId] = useState<string>(
    selectedCommunityId || (communities[0]?.id || '')
  );

  const [isCreateCommOpen, setIsCreateCommOpen] = useState(false);
  const [newCommName, setNewCommName] = useState('');
  const [newCommKigaliName, setNewCommKigaliName] = useState('');
  const [newCommTopic, setNewCommTopic] = useState('Land & Property');
  const [newCommDesc, setNewCommDesc] = useState('');
  const [newCommRules, setNewCommRules] = useState('Respectful civic discourse, Cite relevant Rwandan laws');

  const activeCommunity = communities.find(c => c.id === activeCommId) || communities[0];
  const isJoined = currentUser ? activeCommunity?.joinedBy.includes(currentUser.id) : false;

  const communityPosts = posts.filter(
    p => p.communityId === activeCommId || p.legalTopic === activeCommunity?.topic
  );

  const handleJoinClick = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    toggleJoinCommunity(activeCommunity.id);
  };

  const handleCreateCommunitySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCommName.trim()) return;

    createCommunity({
      name: newCommName.trim(),
      kigaliName: newCommKigaliName.trim() || undefined,
      topic: newCommTopic,
      description: newCommDesc.trim() || 'A dedicated forum for legal practitioners and citizens in Rwanda.',
      rules: newCommRules.split(',').map(r => r.trim()).filter(Boolean),
      officialSource: 'Lex Hafi Yawe Legal Forum'
    });

    setIsCreateCommOpen(false);
    setNewCommName('');
    setNewCommKigaliName('');
    setNewCommDesc('');
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Communities Header Navigation */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between gap-2 mb-1">
          <div className="flex items-center gap-2">
            <Users className="w-5 h-5 text-blue-700" />
            <h1 className="text-lg font-black text-slate-900">
              Legal Discussion Communities
            </h1>
          </div>

          <button
            onClick={() => {
              if (!currentUser) openLoginModal();
              else setIsCreateCommOpen(true);
            }}
            className="px-3 py-1.5 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Create Forum</span>
          </button>
        </div>

        <p className="text-xs text-slate-600 max-w-2xl leading-relaxed mb-4">
          Peer knowledge hubs structured around Rwandan legal domains. Discuss statutory interpretations, share court experiences, and stay updated on regulatory reforms.
        </p>

        {/* Communities Carousel */}
        <div className="flex gap-2 overflow-x-auto no-scrollbar pb-1">
          {communities.map(comm => (
            <button
              key={comm.id}
              onClick={() => {
                setActiveCommId(comm.id);
                setSelectedCommunityId(comm.id);
              }}
              className={`px-3 py-2 rounded-xl text-xs font-bold transition whitespace-nowrap border cursor-pointer ${
                activeCommId === comm.id
                  ? 'border-blue-700 bg-blue-50 text-blue-900 shadow-xs'
                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
              }`}
            >
              <span>{comm.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Active Community Banner & Rules (Pure CSS gradients, no external images) */}
      {activeCommunity && (
        <div className="p-4 sm:p-6 max-w-4xl space-y-4">
          <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <div
              className={`h-28 sm:h-36 bg-gradient-to-r ${
                activeCommunity.bannerGradient || 'from-[#064E3B] via-[#047857] to-[#022C22]'
              } relative p-4 sm:p-5 flex flex-col justify-end text-white`}
            >
              <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-300">
                {activeCommunity.topic}
              </span>
              <h2 className="text-base sm:text-lg font-black">
                {activeCommunity.name}
              </h2>
              {activeCommunity.kigaliName && (
                <p className="text-2xs text-slate-200 italic">
                  {activeCommunity.kigaliName}
                </p>
              )}
            </div>

            <div className="p-4 sm:p-5">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
                <div className="flex items-center gap-4 text-xs text-slate-600">
                  <span><strong>{activeCommunity.membersCount.toLocaleString()}</strong> Members</span>
                  <span>•</span>
                  <span>Source: <strong>{activeCommunity.officialSource}</strong></span>
                </div>

                <button
                  onClick={handleJoinClick}
                  className={`px-4 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 self-start cursor-pointer ${
                    isJoined
                      ? 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                      : 'bg-blue-700 hover:bg-blue-800 text-white shadow-xs'
                  }`}
                >
                  {isJoined ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      <span>Joined Community</span>
                    </>
                  ) : (
                    <span>Join Community</span>
                  )}
                </button>
              </div>

              <p className="text-xs text-slate-700 leading-relaxed my-3">
                {activeCommunity.description}
              </p>

              {/* Rules & Moderation Notice */}
              <div className="bg-slate-50 border border-slate-200 rounded-xl p-3 text-2xs text-slate-600 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-slate-800 uppercase tracking-wide">
                  <ShieldAlert className="w-3.5 h-3.5 text-blue-700" />
                  <span>Community Guidelines:</span>
                </div>
                <ul className="list-disc pl-4 space-y-0.5">
                  {activeCommunity.rules.map((rule, idx) => (
                    <li key={idx}>{rule}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Post Composer for Community */}
          <div className="border border-slate-200 rounded-2xl overflow-hidden shadow-xs">
            <PostComposer
              communityId={activeCommunity.id}
              defaultTopic={activeCommunity.topic}
            />
          </div>

          {/* Discussion Stream */}
          <div className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 px-1">
              Community Discussions ({communityPosts.length})
            </h3>
            {communityPosts.length === 0 ? (
              <div className="p-8 text-center bg-white rounded-2xl border border-slate-200/90 space-y-2 shadow-xs">
                <p className="text-xs font-bold text-slate-800">
                  No discussions opened in this forum yet.
                </p>
                <p className="text-2xs text-slate-500 max-w-sm mx-auto leading-relaxed">
                  Be the first to share an analysis or question regarding {activeCommunity.topic}. Use the composer above to start the discussion under community guidelines.
                </p>
              </div>
            ) : (
              communityPosts.map(p => <PostCard key={p.id} post={p} />)
            )}
          </div>
        </div>
      )}

      {/* Create Community Modal */}
      {isCreateCommOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Create New Legal Forum</h3>
              <button
                onClick={() => setIsCreateCommOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCommunitySubmit} className="space-y-3">
              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Forum Name (English)</label>
                <input
                  type="text"
                  required
                  value={newCommName}
                  onChange={e => setNewCommName(e.target.value)}
                  placeholder="e.g. Rwanda Tax Law & Revenue Compliance"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Forum Name (Ikinyarwanda, optional)</label>
                <input
                  type="text"
                  value={newCommKigaliName}
                  onChange={e => setNewCommKigaliName(e.target.value)}
                  placeholder="e.g. Amategeko y'Umusoro mu Rwanda"
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Legal Topic Domain</label>
                <select
                  value={newCommTopic}
                  onChange={e => setNewCommTopic(e.target.value)}
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="Land & Property">Land & Property</option>
                  <option value="Labor & Employment">Labor & Employment</option>
                  <option value="Commercial & Companies">Commercial & Companies</option>
                  <option value="Taxation & Regulatory">Taxation & Regulatory</option>
                  <option value="Criminal & Constitutional">Criminal & Constitutional</option>
                  <option value="Family & Succession">Family & Succession</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  value={newCommDesc}
                  onChange={e => setNewCommDesc(e.target.value)}
                  rows={2}
                  placeholder="Describe the legal focus and objectives of this forum..."
                  className="w-full text-xs border border-slate-200 rounded-xl p-2.5 focus:ring-1 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsCreateCommOpen(false)}
                  className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 text-xs font-bold bg-blue-700 text-white rounded-xl hover:bg-blue-800"
                >
                  Create Community
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
