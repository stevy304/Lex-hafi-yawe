import React, { useState } from 'react';
import {
  Bell,
  Heart,
  MessageCircle,
  Repeat2,
  Calendar,
  Award,
  CheckCheck,
  UserPlus,
  Trash2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { PageHeader } from '../common/PageHeader';
import { EmptyState } from '../common/EmptyState';

export const NotificationsView: React.FC = () => {
  const {
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
    currentUser,
    users,
    setSelectedPostForThread,
    posts,
    setActiveView,
    openLoginModal,
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'appointments' | 'official'>('all');

  if (!currentUser) {
    return (
      <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text flex items-center justify-center">
        <EmptyState
          icon={<Bell className="w-6 h-6 text-[var(--accent)]" />}
          title="Notifications center"
          description="Sign in to track real-time engagement, consultation confirmations, and official ministerial circulars."
          action={{
            label: 'Sign in to view notifications',
            onClick: openLoginModal,
          }}
        />
      </div>
    );
  }

  const myNotifications = notifications.filter((n) => n.recipientId === currentUser.id);

  const filtered = myNotifications.filter((n) => {
    if (filter === 'appointments') return n.type === 'appointment';
    if (filter === 'official') return n.type === 'official_update';
    return true;
  });

  const unreadCount = myNotifications.filter((n) => !n.isRead).length;

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-[var(--like)]" />;
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-[var(--accent)]" />;
      case 'repost':
        return <Repeat2 className="w-4 h-4 text-[var(--ok-text)]" />;
      case 'follow':
        return <UserPlus className="w-4 h-4 text-[var(--accent)]" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-[var(--accent)]" />;
      case 'official_update':
        return <Award className="w-4 h-4 text-[var(--gold)]" />;
      default:
        return <Bell className="w-4 h-4 text-[var(--accent)]" />;
    }
  };

  const handleNotificationClick = (notif: (typeof notifications)[0]) => {
    markNotificationAsRead(notif.id);

    if (notif.referenceId) {
      const post = posts.find((p) => p.id === notif.referenceId);
      if (post) {
        setSelectedPostForThread(post);
        setActiveView('feed');
      }
    } else if (notif.type === 'appointment') {
      setActiveView('appointments');
    }
  };

  return (
    <div className="relative flex-1 min-w-0 max-w-[680px] w-full border-x border-[var(--border)] bg-[var(--bg)] h-screen overflow-y-auto no-scrollbar outline-none select-text">
      <PageHeader
        title="Notifications"
        actions={
          unreadCount > 0 ? (
            <button
              type="button"
              onClick={markAllNotificationsAsRead}
              className="text-[12px] font-medium text-[var(--accent)] hover:underline flex items-center gap-1 cursor-pointer"
            >
              <CheckCheck className="w-3.5 h-3.5" />
              <span>Mark all read</span>
            </button>
          ) : undefined
        }
      >
        <div className="flex gap-1.5 overflow-x-auto no-scrollbar pt-1 text-[13px] font-medium">
          <button
            type="button"
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'all'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            All ({myNotifications.length})
          </button>
          <button
            type="button"
            onClick={() => setFilter('appointments')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'appointments'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Consultations
          </button>
          <button
            type="button"
            onClick={() => setFilter('official')}
            className={`px-3 py-1 rounded-full transition-colors whitespace-nowrap cursor-pointer ${
              filter === 'official'
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--surface)] text-[var(--muted)] hover:text-[var(--text)] border border-[var(--border)]'
            }`}
          >
            Official alerts
          </button>
        </div>
      </PageHeader>

      <div className="divide-y divide-[var(--border)]">
        {filtered.length === 0 ? (
          <EmptyState
            icon={<Bell className="w-6 h-6 text-[var(--muted)]" />}
            title="No notifications yet"
            description="When people interact with your legal analysis or schedule consultations, you'll see them here."
          />
        ) : (
          filtered.map((notif) => {
            const sender = users.find((u) => u.id === notif.senderId);

            return (
              <div
                key={notif.id}
                onClick={() => handleNotificationClick(notif)}
                className={`p-4 flex items-start gap-3 transition-colors cursor-pointer ${
                  !notif.isRead
                    ? 'bg-[var(--surface)] border-l-4 border-[var(--accent)]'
                    : 'hover:bg-[var(--hover)]'
                }`}
              >
                <div className="mt-1 shrink-0 p-1.5 rounded-full bg-[var(--surface)] border border-[var(--border)] flex items-center justify-center">
                  {getNotificationIcon(notif.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    {sender && <UserAvatar user={sender} size="xs" />}
                    <span className="text-[14px] font-medium text-[var(--text)] truncate">
                      {sender ? sender.name : 'Lex Hafi Yawe'}
                    </span>
                    <span className="text-[11px] text-[var(--muted)] ml-auto shrink-0">
                      {new Date(notif.createdAt).toLocaleDateString([], {
                        month: 'short',
                        day: 'numeric',
                      })}
                    </span>
                  </div>

                  <p className="text-[13px] text-[var(--text)] leading-snug">
                    {notif.message}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-1">
                    <span className="text-[11px] text-[var(--muted)]">
                      {notif.type === 'official_update'
                        ? 'Official Gazette bulletin'
                        : 'Tap to view'}
                    </span>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteNotification(notif.id);
                      }}
                      className="text-[var(--muted)] hover:text-[var(--danger)] p-1 rounded transition-colors cursor-pointer"
                      title="Dismiss notification"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
