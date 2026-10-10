import React from 'react';
import {
  Sparkles,
  Users,
  ShieldCheck,
  Award,
  MessageSquare,
  CheckCircle2,
  Filter,
  Layers,
  X
} from 'lucide-react';
import { FeedFilter } from './FeedTabs';
import { useTranslation } from '../../utils/i18n';
import { useApp } from '../../context/AppContext';

export const LEGAL_TOPIC_FILTERS = [
  'All Topics',
  'Land & Property',
  'Labor & Employment',
  'Commercial & Companies',
  'Criminal & Constitutional',
  'Family & Succession',
  'Alternative Dispute Resolution (Abunzi)',
  'Data Protection & Tech',
  'Taxation & Regulatory'
];

interface FeedHeaderProps {
  currentTab: FeedFilter;
  onTabChange: (tab: FeedFilter) => void;
  selectedTopic?: string;
  onSelectTopic?: (topic: string) => void;
  verifiedOnly?: boolean;
  onToggleVerifiedOnly?: () => void;
  mediaOnly?: boolean;
  onToggleMediaOnly?: () => void;
}

export const FeedHeader: React.FC<FeedHeaderProps> = ({
  currentTab,
  onTabChange,
  selectedTopic = 'All Topics',
  onSelectTopic,
  verifiedOnly = false,
  onToggleVerifiedOnly,
  mediaOnly = false,
  onToggleMediaOnly
}) => {
  const { language } = useApp();
  const t = useTranslation(language);

  const tabs: {
    id: FeedFilter;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    description: string;
  }[] = [
    {
      id: 'for_you',
      label: t.tabForYou,
      icon: Sparkles,
      description: 'Curated timeline of relevant legal matters and citizen queries'
    },
    {
      id: 'following',
      label: t.tabFollowing,
      icon: Users,
      description: 'Stream from advocates and institutions you follow'
    },
    {
      id: 'advocates',
      label: t.tabAdvocates,
      icon: ShieldCheck,
      description: 'Verified insights and legal commentary by Rwanda Bar Association advocates'
    },
    {
      id: 'official',
      label: t.tabOfficial,
      icon: Award,
      description: 'Institutional gazettes, judicial bulletins, and legislative notices'
    },
    {
      id: 'communities',
      label: t.tabCommunities,
      icon: MessageSquare,
      description: 'Case discussions, mediation insights, and community forums'
    }
  ];

  const hasActiveFilters =
    (selectedTopic && selectedTopic !== 'All Topics') || verifiedOnly || mediaOnly;

  const handleClearFilters = () => {
    if (onSelectTopic) onSelectTopic('All Topics');
    if (verifiedOnly && onToggleVerifiedOnly) onToggleVerifiedOnly();
    if (mediaOnly && onToggleMediaOnly) onToggleMediaOnly();
  };

  return (
    <div className="sticky top-[53px] lg:top-0 z-20 bg-[#F6F4EF] border-b border-[#E3DDD4] select-none">
      {/* 1. PRIMARY SUB-FEED NAVIGATION TABS (At the very top of the feed) */}
      <nav
        aria-label="Feed Streams"
        className="flex overflow-x-auto no-scrollbar select-none px-2 sm:px-4 bg-[#F6F4EF] border-b border-[#EAE5DC]"
      >
        {tabs.map(tab => {
          const Icon = tab.icon;
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex-1 min-w-[110px] sm:min-w-0 py-3 px-3 flex items-center justify-center gap-2 text-xs font-bold transition relative hover:bg-[#EDE8DE]/70 rounded-t-lg cursor-pointer ${
                isActive ? 'text-[#D36B2E]' : 'text-[#576574] hover:text-[#1E293B]'
              }`}
              title={tab.description}
            >
              <Icon
                className={`w-4 h-4 shrink-0 transition-transform ${
                  isActive ? 'text-[#D36B2E] scale-105' : 'text-[#8796A0]'
                }`}
              />
              <span className="whitespace-nowrap">{tab.label}</span>
              {isActive && (
                <span className="absolute bottom-0 left-3 right-3 h-0.75 bg-[#D36B2E] rounded-full shadow-xs" />
              )}
            </button>
          );
        })}
      </nav>

      {/* 2. SCOPE FILTER CHIPS ROW (Directly under the tabs, horizontally scrollable) */}
      <div className="px-3 sm:px-4 py-2 flex items-center gap-1.5 overflow-x-auto no-scrollbar bg-white/90">
        <div className="flex items-center gap-1 text-[11px] font-bold text-[#576574] uppercase tracking-wider shrink-0 mr-1">
          <Filter className="w-3 h-3 text-[#D36B2E] shrink-0" />
          <span>Scope:</span>
        </div>

        {/* Legal Topics Chips */}
        {LEGAL_TOPIC_FILTERS.map(topic => {
          const isSelected = selectedTopic === topic;
          return (
            <button
              key={topic}
              type="button"
              onClick={() => onSelectTopic && onSelectTopic(topic)}
              className={`px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition cursor-pointer ${
                isSelected
                  ? 'bg-[#45525A] text-[#FAF8F5] shadow-2xs font-bold'
                  : 'bg-[#F6F4EF] hover:bg-[#EAE5DC] text-[#45525A] border border-[#DDD6CB]'
              }`}
            >
              {topic}
            </button>
          );
        })}

        {/* Precision Refinement Filters: Verified Only & With Media */}
        <div className="flex items-center gap-1.5 shrink-0 pl-1 border-l border-[#EAE5DC]">
          {onToggleVerifiedOnly && (
            <button
              type="button"
              onClick={onToggleVerifiedOnly}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition flex items-center gap-1.5 cursor-pointer border ${
                verifiedOnly
                  ? 'bg-[#EBF2F7] border-[#45525A] text-[#45525A]'
                  : 'bg-[#F6F4EF] border-[#DDD6CB] text-[#576574] hover:text-[#1E293B]'
              }`}
              title="Filter posts to verified legal counsel and official bodies"
            >
              <CheckCircle2
                className={`w-3.5 h-3.5 shrink-0 ${verifiedOnly ? 'text-[#D36B2E]' : 'text-[#8796A0]'}`}
              />
              <span>Verified Only</span>
            </button>
          )}

          {onToggleMediaOnly && (
            <button
              type="button"
              onClick={onToggleMediaOnly}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap shrink-0 transition flex items-center gap-1.5 cursor-pointer border ${
                mediaOnly
                  ? 'bg-[#EBF2F7] border-[#45525A] text-[#45525A]'
                  : 'bg-[#F6F4EF] border-[#DDD6CB] text-[#576574] hover:text-[#1E293B]'
              }`}
              title="Filter to posts containing documents, video, or images"
            >
              <Layers
                className={`w-3.5 h-3.5 shrink-0 ${mediaOnly ? 'text-[#D36B2E]' : 'text-[#8796A0]'}`}
              />
              <span>With Media</span>
            </button>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={handleClearFilters}
              className="px-2 py-1 text-2xs font-bold text-[#D36B2E] hover:text-[#B8551E] hover:underline cursor-pointer flex items-center gap-0.5 whitespace-nowrap shrink-0"
              title="Clear all active filters"
            >
              <X className="w-3 h-3 shrink-0" />
              <span>Reset</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
