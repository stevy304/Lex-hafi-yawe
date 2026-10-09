import React from 'react';
import { useApp } from '../../context/AppContext';
import { LeftSidebar } from './LeftSidebar';
import { RightSidebar } from './RightSidebar';
import { MobileNav } from './MobileNav';

// Views
import { FeedView } from '../feed/FeedView';
import { ExploreView } from '../explore/ExploreView';
import { NotificationsView } from '../notifications/NotificationsView';
import { MessagesView } from '../messages/MessagesView';
import { BookmarksView } from '../bookmarks/BookmarksView';
import { CommunitiesView } from '../communities/CommunitiesView';
import { LegalServicesView } from '../services/LegalServicesView';
import { LegalAidView } from '../legalaid/LegalAidView';
import { LawsView } from '../laws/LawsView';
import { LegalNewsView } from '../news/LegalNewsView';
import { AppointmentsView } from '../appointments/AppointmentsView';
import { ProfileView } from '../profile/ProfileView';
import { AdminDashboard } from '../admin/AdminDashboard';
import { SettingsView } from '../settings/SettingsView';

// Modals
import { PostDetailModal } from '../feed/PostDetailModal';
import { CreatePostModal } from '../modals/CreatePostModal';
import { QuotePostModal } from '../feed/QuotePostModal';
import { ReportModal } from '../modals/ReportModal';
import { AuthModal } from '../auth/AuthModal';

export const AppLayout: React.FC = () => {
  const { activeView } = useApp();

  const renderActiveView = () => {
    switch (activeView) {
      case 'feed':
        return <FeedView />;
      case 'explore':
        return <ExploreView />;
      case 'notifications':
        return <NotificationsView />;
      case 'messages':
        return <MessagesView />;
      case 'bookmarks':
        return <BookmarksView />;
      case 'communities':
        return <CommunitiesView />;
      case 'services':
        return <LegalServicesView />;
      case 'legalaid':
        return <LegalAidView />;
      case 'laws':
        return <LawsView />;
      case 'news':
        return <LegalNewsView />;
      case 'appointments':
        return <AppointmentsView />;
      case 'profile':
        return <ProfileView />;
      case 'admin':
        return <AdminDashboard />;
      case 'settings':
        return <SettingsView />;
      default:
        return <FeedView />;
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F7FA] text-[#172033] flex justify-center">
      <div className="w-full max-w-[1400px] flex">
        {/* Left Desktop Column */}
        <div className="hidden lg:block shrink-0">
          <LeftSidebar />
        </div>

        {/* Center Primary Workspace */}
        <main className="flex-1 min-w-0 border-r border-slate-200/90 bg-white min-h-screen pb-16 lg:pb-0">
          {/* Mobile Top Header */}
          <MobileNav />

          {/* Active Primary View */}
          {renderActiveView()}
        </main>

        {/* Right Desktop Discovery Column (Hidden in Messages to maximize chat width) */}
        {activeView !== 'messages' && (
          <div className="hidden lg:block shrink-0">
            <RightSidebar />
          </div>
        )}
      </div>

      {/* Global Interactive Modals */}
      <PostDetailModal />
      <CreatePostModal />
      <QuotePostModal />
      <ReportModal />
      <AuthModal />
    </div>
  );
};
