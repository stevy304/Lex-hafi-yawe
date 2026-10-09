import React, { useState } from 'react';
import {
  Home,
  Search,
  Bell,
  Mail,
  Bookmark,
  Users,
  Briefcase,
  HeartHandshake,
  BookOpen,
  Newspaper,
  Calendar,
  User as UserIcon,
  Shield,
  Feather,
  ChevronDown,
  Scale,
  Check,
  RefreshCw,
  LogOut,
  LogIn,
  UserPlus
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';
import { useTranslation } from '../../utils/i18n';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { LanguageSelector } from '../common/LanguageSelector';

export const LeftSidebar: React.FC = () => {
  const {
    activeView,
    setActiveView,
    currentUser,
    users,
    setCurrentUser,
    navigateToProfile,
    unreadNotificationsCount,
    unreadMessagesCount,
    language,
    setIsCreatePostModalOpen,
    openLoginModal,
    openRegisterModal,
    logout,
    resetDemoData
  } = useApp();

  const t = useTranslation(language);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);

  interface NavItem {
    id: AppView;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    requiresAuth?: boolean;
  }

  const navItems: NavItem[] = [
    { id: 'feed', label: t.navHome, icon: Home },
    { id: 'explore', label: t.navExplore, icon: Search },
    { id: 'notifications', label: t.navNotifications, icon: Bell, badge: unreadNotificationsCount, requiresAuth: true },
    { id: 'messages', label: t.navMessages, icon: Mail, badge: unreadMessagesCount, requiresAuth: true },
    { id: 'bookmarks', label: t.navBookmarks, icon: Bookmark, requiresAuth: true },
    { id: 'communities', label: t.navCommunities, icon: Users },
    { id: 'services', label: t.navServices, icon: Briefcase },
    { id: 'legalaid', label: t.navLegalAid, icon: HeartHandshake },
    { id: 'laws', label: t.navLaws, icon: BookOpen },
    { id: 'news', label: t.navNews, icon: Newspaper },
    { id: 'appointments', label: t.navAppointments, icon: Calendar, requiresAuth: true },
    { id: 'profile', label: t.navProfile, icon: UserIcon, requiresAuth: true },
    { id: 'admin', label: t.navAdmin, icon: Shield }
  ];

  const handleNavClick = (viewId: AppView, requiresAuth?: boolean) => {
    if (requiresAuth && !currentUser) {
      openLoginModal();
      return;
    }

    if (viewId === 'profile' && currentUser) {
      navigateToProfile(currentUser.id);
    } else {
      setActiveView(viewId);
    }
  };

  const handleCreatePost = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    setIsCreatePostModalOpen(true);
  };

  return (
    <aside className="w-64 xl:w-72 h-screen sticky top-0 flex flex-col justify-between border-r border-slate-200/90 bg-white px-3 py-4 select-none shrink-0 z-30">
      {/* Top Header & Brand */}
      <div className="flex flex-col gap-3">
        <div className="flex items-center justify-between px-2">
          <button
            onClick={() => setActiveView('feed')}
            className="flex items-center gap-2.5 text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#102744] to-[#1D4ED8] flex items-center justify-center text-white shadow-md shadow-blue-900/10 group-hover:scale-105 transition-transform">
              <Scale className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <span className="font-extrabold text-lg tracking-tight text-[#102744] block leading-none">
                Lex Hafi Yawe
              </span>
              <span className="text-[10px] font-medium tracking-wide text-slate-500 uppercase mt-0.5 block">
                Rwanda Digital Justice
              </span>
            </div>
          </button>
        </div>

        {/* Multilingual Switcher */}
        <div className="px-2 pt-1">
          <LanguageSelector compact />
        </div>

        {/* Navigation Links */}
        <nav className="flex flex-col gap-0.5 mt-2 overflow-y-auto max-h-[calc(100vh-330px)] pr-1">
          {navItems.map(item => {
            const Icon = item.icon;
            const isActive =
              activeView === item.id ||
              (item.id === 'profile' && activeView === 'profile');

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id, item.requiresAuth)}
                className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all group ${
                  isActive
                    ? 'bg-blue-50 text-blue-800 font-bold'
                    : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon
                    className={`w-5 h-5 transition-transform group-hover:scale-110 ${
                      isActive ? 'text-blue-700' : 'text-slate-500'
                    }`}
                  />
                  <span>{item.label}</span>
                </div>
                {item.badge && item.badge > 0 ? (
                  <span className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 text-xs font-bold text-white bg-blue-600 rounded-full shadow-xs">
                    {item.badge}
                  </span>
                ) : null}
              </button>
            );
          })}
        </nav>

        {/* Action Button: Create Post */}
        <div className="px-2 mt-1">
          <button
            onClick={handleCreatePost}
            className="w-full py-2.5 px-4 bg-[#1D4ED8] hover:bg-[#1e40af] active:bg-[#1e3a8a] text-white rounded-xl font-bold shadow-md shadow-blue-700/20 flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <Feather className="w-4 h-4" />
            <span>{t.btnCreatePost}</span>
          </button>
        </div>
      </div>

      {/* Bottom User Area / Auth Menu */}
      <div className="relative pt-2 border-t border-slate-100">
        {currentUser ? (
          <>
            <div className="flex items-center justify-between gap-1">
              <button
                onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                className="flex-1 p-2 rounded-xl hover:bg-slate-100 transition flex items-center justify-between text-left group cursor-pointer min-w-0"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <UserAvatar user={currentUser} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1">
                      <span className="text-xs font-bold text-slate-900 truncate">
                        {currentUser.name}
                      </span>
                      <VerificationBadge user={currentUser} size="sm" />
                    </div>
                    <span className="text-2xs text-slate-500 block truncate">
                      @{currentUser.username}
                    </span>
                    <span className="text-[10px] font-semibold text-blue-700 uppercase tracking-wider block">
                      {currentUser.role}
                    </span>
                  </div>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400 group-hover:text-slate-700 transition shrink-0 ml-1" />
              </button>

              <button
                type="button"
                onClick={() => logout()}
                title="Log Out of Session"
                className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition cursor-pointer shrink-0"
                aria-label="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>

            {/* User Dropdown Menu */}
            {isUserMenuOpen && (
              <div className="absolute bottom-full left-0 mb-2 w-72 bg-white rounded-2xl shadow-xl border border-slate-200 p-2.5 z-50">
                <div className="pb-2 mb-2 border-b border-slate-100 px-1">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-bold text-slate-800">
                      {currentUser.name}
                    </span>
                    <button
                      onClick={() => {
                        logout();
                        setIsUserMenuOpen(false);
                      }}
                      className="text-2xs text-red-600 hover:text-red-800 font-bold flex items-center gap-1"
                    >
                      <LogOut className="w-3 h-3" />
                      <span>Log Out</span>
                    </button>
                  </div>
                  <span className="text-[10px] text-slate-400 block truncate">
                    {currentUser.email || `@${currentUser.username}`}
                  </span>
                </div>

                <div className="mb-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block px-1 mb-1">
                    Quick Persona Switch
                  </span>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {users.map(u => (
                      <button
                        key={u.id}
                        onClick={() => {
                          setCurrentUser(u);
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between p-1.5 rounded-lg text-left text-xs transition ${
                          u.id === currentUser.id
                            ? 'bg-blue-50 text-blue-900 font-bold'
                            : 'hover:bg-slate-50 text-slate-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 min-w-0">
                          <UserAvatar user={u} size="xs" />
                          <div className="truncate">
                            <span className="truncate block font-semibold leading-tight">{u.name}</span>
                            <span className="text-[10px] text-slate-400 block capitalize">
                              {u.role === 'advocate' ? 'Advocate (RBA)' : u.role}
                            </span>
                          </div>
                        </div>
                        {u.id === currentUser.id && (
                          <Check className="w-3.5 h-3.5 text-blue-600 shrink-0 ml-1" />
                        )}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="pt-1 border-t border-slate-100 flex items-center justify-between px-1">
                  <button
                    onClick={() => {
                      resetDemoData();
                      setIsUserMenuOpen(false);
                    }}
                    className="text-[10px] text-slate-500 hover:text-slate-800 flex items-center gap-1"
                  >
                    <RefreshCw className="w-3 h-3" />
                    <span>Reset Data</span>
                  </button>
                  <button
                    onClick={() => {
                      navigateToProfile(currentUser.id);
                      setIsUserMenuOpen(false);
                    }}
                    className="text-[10px] text-blue-700 font-bold hover:underline"
                  >
                    View Profile
                  </button>
                </div>
              </div>
            )}
          </>
        ) : (
          /* Logged out state */
          <div className="p-2 space-y-2">
            <button
              onClick={openLoginModal}
              className="w-full py-2 px-3 bg-blue-700 hover:bg-blue-800 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>Sign In</span>
            </button>
            <button
              onClick={openRegisterModal}
              className="w-full py-2 px-3 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Create Account</span>
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
