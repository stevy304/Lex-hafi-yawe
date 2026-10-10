import React, { useState, useEffect, useRef } from 'react';
import {
  Search,
  BookOpen,
  User,
  Users,
  Feather,
  HeartHandshake,
  ShieldCheck,
  Award,
  ArrowRight,
  X,
  Scale,
  Calendar,
  Sparkles
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { OFFICIAL_LAWS } from '../../data/officialReferences';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface CommandItem {
  id: string;
  title: string;
  subtitle: string;
  category: 'Actions' | 'Legislation' | 'Counsel & Authorities' | 'Communities';
  icon: React.ComponentType<{ className?: string }>;
  onSelect: () => void;
  badge?: string;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({ isOpen, onClose }) => {
  const {
    users,
    communities,
    setActiveView,
    navigateToProfile,
    setIsCreatePostModalOpen,
    setSelectedCommunityId,
    openLoginModal,
    currentUser
  } = useApp();

  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);

  // Focus input on open
  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  // Build searchable items
  const items: CommandItem[] = [];

  // Actions
  items.push({
    id: 'action-create-post',
    title: 'Share Legal Post or Inquiry',
    subtitle: 'Publish analysis, statutory rights inquiry, or commentary',
    category: 'Actions',
    icon: Feather,
    onSelect: () => {
      onClose();
      if (!currentUser) openLoginModal();
      else setIsCreatePostModalOpen(true);
    }
  });

  items.push({
    id: 'action-laws',
    title: 'Browse Rwandan Legislation & Gazette',
    subtitle: 'Search codified labor acts, property law, company statute',
    category: 'Actions',
    icon: BookOpen,
    onSelect: () => {
      onClose();
      setActiveView('laws');
    }
  });

  items.push({
    id: 'action-legalaid',
    title: 'Access Free Legal Aid (MAJ Bureaus)',
    subtitle: 'Connect with Ministry of Justice district legal officers or call 3922',
    category: 'Actions',
    icon: HeartHandshake,
    onSelect: () => {
      onClose();
      setActiveView('legalaid');
    }
  });

  items.push({
    id: 'action-services',
    title: 'Book Advocate Consultation',
    subtitle: 'Find licensed Rwanda Bar counsel for representation and advice',
    category: 'Actions',
    icon: Calendar,
    onSelect: () => {
      onClose();
      setActiveView('services');
    }
  });

  // Official Rwandan Laws
  for (const law of OFFICIAL_LAWS) {
    items.push({
      id: `law-${law.id}`,
      title: law.title,
      subtitle: `${law.lawNumber} • ${law.category} • ${law.summaryEn.substring(0, 75)}...`,
      category: 'Legislation',
      icon: Scale,
      badge: law.category,
      onSelect: () => {
        onClose();
        setActiveView('laws');
      }
    });
  }

  // Verified Legal Advocates & Authorities
  for (const u of users) {
    items.push({
      id: `user-${u.id}`,
      title: u.name,
      subtitle: `@${u.username} • ${u.professionalTitle || (u.role === 'advocate' ? 'Licensed Advocate' : 'Citizen Member')}`,
      category: 'Counsel & Authorities',
      icon: u.isVerified ? ShieldCheck : User,
      badge: u.isVerified ? 'Verified' : undefined,
      onSelect: () => {
        onClose();
        navigateToProfile(u.id);
      }
    });
  }

  // Communities
  for (const c of communities) {
    items.push({
      id: `comm-${c.id}`,
      title: c.name,
      subtitle: `${c.topic} • ${c.membersCount} members • ${c.description.substring(0, 60)}...`,
      category: 'Communities',
      icon: Users,
      onSelect: () => {
        onClose();
        setSelectedCommunityId(c.id);
        setActiveView('communities');
      }
    });
  }

  // Filter items based on query
  const filteredItems = items.filter(item => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      item.title.toLowerCase().includes(q) ||
      item.subtitle.toLowerCase().includes(q) ||
      item.category.toLowerCase().includes(q)
    );
  }).slice(0, 20); // Cap at top 20 matches

  // Keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < filteredItems.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : filteredItems.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (filteredItems[selectedIndex]) {
        filteredItems[selectedIndex].onSelect();
      }
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-start justify-center pt-12 sm:pt-20 px-3 sm:px-4 select-none"
      onClick={onClose}
    >
      <div
        className="w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[80vh] animate-in fade-in zoom-in-95 duration-150"
        onClick={e => e.stopPropagation()}
      >
        {/* Command Input Bar */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center gap-3 bg-slate-50/50">
          <Search className="w-5 h-5 text-slate-400 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={e => {
              setQuery(e.target.value);
              setSelectedIndex(0);
            }}
            onKeyDown={handleKeyDown}
            placeholder="Search Rwandan laws, verified counsel, communities, or actions..."
            className="flex-1 text-sm text-slate-900 placeholder:text-slate-400 bg-transparent focus:outline-none font-medium"
          />
          <span className="text-2xs font-bold text-slate-400 bg-slate-200/80 px-2 py-0.5 rounded-md border border-slate-300">
            ESC
          </span>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-700 rounded-lg transition"
            aria-label="Close command palette"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Results List */}
        <div className="overflow-y-auto flex-1 p-2 space-y-1">
          {filteredItems.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">
              <Scale className="w-8 h-8 text-slate-300 mx-auto mb-2" />
              <p className="font-bold text-slate-700">No matching legal records found</p>
              <p className="text-2xs text-slate-400 mt-1">
                Try searching for "Labor Law", "Land", "Clarisse", or "Abunzi".
              </p>
            </div>
          ) : (
            filteredItems.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={() => item.onSelect()}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`p-3 rounded-xl transition flex items-center justify-between cursor-pointer ${
                    isSelected ? 'bg-[#FAF0E8] text-[#1E293B]' : 'hover:bg-slate-50 text-slate-800'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${
                        isSelected
                          ? 'bg-[#D36B2E] text-white shadow-xs'
                          : 'bg-[#F4EEE9] text-[#45525A]'
                      }`}
                    >
                      <Icon className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold truncate">
                          {item.title}
                        </span>
                        {item.badge && (
                          <span className="text-[10px] font-semibold text-[#D36B2E] bg-[#FAF0E8] px-1.5 py-0.2 rounded border border-[#F3D7C4]">
                            {item.badge}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate leading-tight mt-0.5">
                        {item.subtitle}
                      </p>
                    </div>
                  </div>

                  <ArrowRight
                    className={`w-4 h-4 shrink-0 transition-transform ${
                      isSelected ? 'text-[#D36B2E] translate-x-0.5' : 'text-slate-300'
                    }`}
                  />
                </div>
              );
            })
          )}
        </div>

        {/* Footer shortcuts hint */}
        <div className="px-4 py-2.5 bg-slate-50 border-t border-slate-200 text-2xs text-slate-500 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
            <span>ESC Close</span>
          </div>
          <span className="font-semibold text-slate-600">Lex Hafi Yawe Quick Navigation</span>
        </div>
      </div>
    </div>
  );
};
