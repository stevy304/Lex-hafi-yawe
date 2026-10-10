import React, { useState } from 'react';
import {
  Home,
  Search,
  Bell,
  Mail,
  Plus,
  Scale,
  Menu,
  X,
  Bookmark,
  Users,
  Briefcase,
  HeartHandshake,
  BookOpen,
  Newspaper,
  Calendar,
  Shield,
  LogIn,
  LogOut,
  UserPlus
} from 'lucide-react';
import { useApp, AppView } from '../../context/AppContext';
import { useTranslation } from '../../utils/i18n';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { LanguageSelector } from '../common/LanguageSelector';

interface MobileNavProps {
  onOpenCommandPalette?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenCommandPalette }) => {
  const {
    activeView,
    setActiveView,
    currentUser,
    unreadNotificationsCount,
    unreadMessagesCount,
    setIsCreatePostModalOpen,
    navigateToProfile,
    openLoginModal,
    openRegisterModal,
    navigateToLanding,
    logout,
    language
  } = useApp();

  const t = useTranslation(language);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navTo = (view: AppView, requiresAuth?: boolean) => {
    if (requiresAuth && !currentUser) {
      openLoginModal();
      setIsDrawerOpen(false);
      return;
    }
    setActiveView(view);
    setIsDrawerOpen(false);
  };

  const handlePostClick = () => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    setIsCreatePostModalOpen(true);
  };

  return (
    <>
      {/* Mobile Top App Bar */}
      <header className="lg:hidden sticky top-0 z-40 bg-[#F6F4EF]/95 backdrop-blur-md border-b border-[#E3DDD4] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <button
            onClick={() => setIsDrawerOpen(true)}
            className="p-1.5 text-[#45525A] hover:bg-[#EAE5DC] rounded-lg transition cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="w-5 h-5" />
          </button>
          <div
            onClick={() => setActiveView('feed')}
            className="flex items-center gap-2 cursor-pointer"
          >
            <div className="w-8 h-8 rounded-xl bg-[#45525A] flex items-center justify-center text-white border border-[#344047] shadow-xs">
              <Scale className="w-4.5 h-4.5 text-[#D36B2E]" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-tight text-[#1E293B] block leading-none">
                Lex Hafi Yawe
              </span>
              <span className="text-[9px] font-bold text-[#576574] uppercase tracking-wider block mt-0.5">
                Digital Justice
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-1.5">
          {onOpenCommandPalette && (
            <button
              type="button"
              onClick={onOpenCommandPalette}
              className="p-1.5 text-[#576574] hover:text-[#1E293B] hover:bg-[#EAE5DC] rounded-lg transition cursor-pointer"
              aria-label="Search Legal Database"
              title="Search Lex Hafi Yawe"
            >
              <Search className="w-5 h-5 text-[#45525A]" />
            </button>
          )}

          <button
            type="button"
            onClick={() => {
              if (!currentUser) openLoginModal();
              else setActiveView('notifications');
            }}
            className="p-1.5 text-[#576574] hover:text-[#1E293B] hover:bg-[#EAE5DC] rounded-lg transition relative cursor-pointer"
            aria-label="Notifications"
            title="Notifications"
          >
            <Bell className="w-5 h-5 text-[#45525A]" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1 right-1 min-w-[15px] h-[15px] px-0.5 bg-[#D36B2E] text-white text-[9px] font-extrabold rounded-full flex items-center justify-center">
                {unreadNotificationsCount}
              </span>
            )}
          </button>
        </div>
      </header>

      {/* Mobile Bottom Navigation Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#FAF8F5]/95 backdrop-blur-md border-t border-[#E3DDD4] px-3 py-1.5 flex items-center justify-around">
        <button
          onClick={() => setActiveView('feed')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-semibold ${
            activeView === 'feed' ? 'text-[#D36B2E]' : 'text-[#576574]'
          }`}
        >
          <Home className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.navHome}</span>
        </button>

        <button
          onClick={() => setActiveView('explore')}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-semibold ${
            activeView === 'explore' ? 'text-[#D36B2E]' : 'text-[#576574]'
          }`}
        >
          <Search className="w-5 h-5" />
          <span className="text-[10px] mt-0.5">{t.navExplore}</span>
        </button>

        {/* Center Floating Post Button */}
        <button
          onClick={handlePostClick}
          className="w-11 h-11 rounded-full bg-[#D36B2E] text-white flex items-center justify-center shadow-lg shadow-[#D36B2E]/30 -mt-4 active:scale-95 transition cursor-pointer"
          aria-label="Create Post"
        >
          <Plus className="w-6 h-6" />
        </button>

        <button
          onClick={() => {
            if (!currentUser) openLoginModal();
            else setActiveView('notifications');
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-semibold relative ${
            activeView === 'notifications' ? 'text-[#D36B2E]' : 'text-[#576574]'
          }`}
        >
          <Bell className="w-5 h-5" />
          {unreadNotificationsCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-[#D36B2E] rounded-full" />
          )}
          <span className="text-[10px] mt-0.5">{t.navNotifications}</span>
        </button>

        <button
          onClick={() => {
            if (!currentUser) openLoginModal();
            else setActiveView('messages');
          }}
          className={`flex flex-col items-center py-1 px-2.5 rounded-lg text-xs font-semibold relative ${
            activeView === 'messages' ? 'text-[#D36B2E]' : 'text-[#576574]'
          }`}
        >
          <Mail className="w-5 h-5" />
          {unreadMessagesCount > 0 && (
            <span className="absolute top-0 right-2 w-2 h-2 bg-[#D36B2E] rounded-full" />
          )}
          <span className="text-[10px] mt-0.5">{t.navMessages}</span>
        </button>
      </nav>

      {/* Slide Drawer */}
      {isDrawerOpen && (
        <div className="fixed inset-0 z-50 flex">
          <div
            className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs"
            onClick={() => setIsDrawerOpen(false)}
          />
          <div className="relative w-4/5 max-w-sm bg-white h-full shadow-2xl flex flex-col justify-between p-4 z-10 overflow-y-auto">
            <div>
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                {currentUser ? (
                  <div className="flex items-center gap-2">
                    <UserAvatar user={currentUser} size="md" />
                    <div>
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900">{currentUser.name}</span>
                        <VerificationBadge user={currentUser} size="sm" />
                      </div>
                      <span className="text-2xs text-slate-500 block">@{currentUser.username}</span>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        openLoginModal();
                        setIsDrawerOpen(false);
                      }}
                      className="px-3 py-1.5 bg-[#D36B2E] hover:bg-[#B8551E] text-white rounded-xl text-xs font-bold cursor-pointer"
                    >
                      Sign In
                    </button>
                    <button
                      onClick={() => {
                        openRegisterModal();
                        setIsDrawerOpen(false);
                      }}
                      className="px-3 py-1.5 bg-slate-100 text-slate-800 rounded-xl text-xs font-bold"
                    >
                      Register
                    </button>
                    <button
                      onClick={() => {
                        navigateToLanding();
                        setIsDrawerOpen(false);
                      }}
                      className="px-2.5 py-1.5 text-slate-500 hover:text-[#D36B2E] text-xs font-semibold"
                    >
                      Welcome Page
                    </button>
                  </div>
                )}
                <button
                  onClick={() => setIsDrawerOpen(false)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Multilingual Selector inside Mobile Drawer */}
              <div className="pb-2.5 mb-2 border-b border-slate-100 px-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Language / Ururimi / Langue
                </span>
                <LanguageSelector compact />
              </div>

              <div className="space-y-1">
                <button
                  onClick={() => navTo('feed')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <Home className="w-4 h-4 text-slate-500" />
                  <span>{t.navHome}</span>
                </button>
                <button
                  onClick={() => navTo('communities')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <Users className="w-4 h-4 text-slate-500" />
                  <span>{t.navCommunities}</span>
                </button>
                <button
                  onClick={() => navTo('services')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <Briefcase className="w-4 h-4 text-slate-500" />
                  <span>{t.navServices}</span>
                </button>
                <button
                  onClick={() => navTo('legalaid')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <HeartHandshake className="w-4 h-4 text-emerald-600" />
                  <span>{t.navLegalAid}</span>
                </button>
                <button
                  onClick={() => navTo('laws')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <BookOpen className="w-4 h-4 text-slate-500" />
                  <span>{t.navLaws}</span>
                </button>
                <button
                  onClick={() => navTo('news')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <Newspaper className="w-4 h-4 text-slate-500" />
                  <span>{t.navNews}</span>
                </button>
                <button
                  onClick={() => navTo('appointments', true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <Calendar className="w-4 h-4 text-slate-500" />
                  <span>{t.navAppointments}</span>
                </button>
                <button
                  onClick={() => navTo('bookmarks', true)}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <Bookmark className="w-4 h-4 text-slate-500" />
                  <span>{t.navBookmarks}</span>
                </button>
                <button
                  onClick={() => navTo('admin')}
                  className="w-full flex items-center gap-3 px-3 py-2 text-sm font-semibold text-slate-800 rounded-lg hover:bg-slate-100"
                >
                  <Shield className="w-4 h-4 text-slate-500" />
                  <span>{t.navAdmin}</span>
                </button>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 text-xs">
              {currentUser && (
                <button
                  onClick={() => {
                    logout();
                    setIsDrawerOpen(false);
                  }}
                  className="w-full mb-3 py-2 px-3 bg-red-50 hover:bg-red-100 text-red-700 font-bold rounded-xl flex items-center justify-center gap-2"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Log Out ({currentUser.name})</span>
                </button>
              )}
              <p className="font-semibold text-slate-800 mb-0.5">Lex Hafi Yawe Rwanda</p>
              <p className="text-slate-500 text-2xs">Legal Support, Closer to Everyone</p>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
