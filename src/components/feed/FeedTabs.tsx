import React from 'react';
import { Sparkles, Users, ShieldCheck, Award, MessageSquare } from 'lucide-react';
import { useTranslation } from '../../utils/i18n';
import { useApp } from '../../context/AppContext';

export type FeedFilter = 'for_you' | 'following' | 'advocates' | 'official' | 'communities';

interface FeedTabsProps {
  currentTab: FeedFilter;
  onTabChange: (tab: FeedFilter) => void;
}

export const FeedTabs: React.FC<FeedTabsProps> = ({ currentTab, onTabChange }) => {
  const { language } = useApp();
  const t = useTranslation(language);

  const tabs: { id: FeedFilter; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'for_you', label: t.tabForYou, icon: Sparkles },
    { id: 'following', label: t.tabFollowing, icon: Users },
    { id: 'advocates', label: t.tabAdvocates, icon: ShieldCheck },
    { id: 'official', label: t.tabOfficial, icon: Award },
    { id: 'communities', label: t.tabCommunities, icon: MessageSquare }
  ];

  return (
    <div className="flex border-b border-slate-200 bg-white sticky top-0 lg:top-0 z-20 overflow-x-auto no-scrollbar select-none">
      {tabs.map(tab => {
        const Icon = tab.icon;
        const isActive = currentTab === tab.id;
        return (
          <button
            key={tab.id}
            onClick={() => onTabChange(tab.id)}
            className={`flex-1 min-w-[110px] sm:min-w-0 py-3.5 px-3 flex items-center justify-center gap-2 text-xs font-bold transition relative hover:bg-slate-50 cursor-pointer ${
              isActive ? 'text-blue-700' : 'text-slate-500 hover:text-slate-800'
            }`}
          >
            <Icon className={`w-4 h-4 ${isActive ? 'text-blue-700' : 'text-slate-400'}`} />
            <span className="whitespace-nowrap">{tab.label}</span>
            {isActive && (
              <span className="absolute bottom-0 left-4 right-4 h-0.5 bg-blue-700 rounded-full" />
            )}
          </button>
        );
      })}
    </div>
  );
};
