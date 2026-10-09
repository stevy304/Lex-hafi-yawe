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
  LogIn
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';

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
    openLoginModal
  } = useApp();

  const [filter, setFilter] = useState<'all' | 'appointments' | 'official'>('all');

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center">
        <div>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <Bell className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Notifications Center
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Sign in to track real-time engagement, consultation confirmations, and official ministerial circulars.
          </p>
          <button
            onClick={openLoginModal}
            className="px-5 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition flex items-center gap-2 mx-auto cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to View Notifications</span>
          </button>
        </div>
      </div>
    );
  }

  const myNotifications = notifications.filter(n => n.recipientId === currentUser.id);

  const filtered = myNotifications.filter(n => {
    if (filter === 'appointments') return n.type === 'appointment';
    if (filter === 'official') return n.type === 'official_update';
    return true;
  });

  const handleNotificationClick = (notif: typeof notifications[0]) => {
    markNotificationAsRead(notif.id);

    if (notif.type === 'appointment') {
      setActiveView('appointments');
    } else if (notif.referenceId) {
      const targetPost = posts.find(p => p.id === notif.referenceId);
      if (targetPost) {
        setSelectedPostForThread(targetPost);
      }
    }
  };

  const getNotifIcon = (type: string) => {
    switch (type) {
      case 'like':
        return <Heart className="w-4 h-4 text-rose-500 fill-rose-500" />;
      case 'reply':
        return <MessageCircle className="w-4 h-4 text-blue-600" />;
      case 'repost':
        return <Repeat2 className="w-4 h-4 text-emerald-600" />;
      case 'appointment':
        return <Calendar className="w-4 h-4 text-blue-700" />;
      case 'official_update':
        return <Award className="w-4 h-4 text-amber-600" />;
      default:
        return <Bell className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50/50">
      {/* Header */}
      <div className="bg-white border-b border-slate-200 px-4 sm:px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-blue-700" />
            <h1 className="text-lg font-black text-slate-900">
              Notifications Center
            </h1>
          </div>

          <button
            onClick={markAllNotificationsAsRead}
            className="text-xs font-bold text-blue-700 hover:text-blue-900 flex items-center gap-1 cursor-pointer"
          >
            <CheckCheck className="w-4 h-4" />
            <span>Mark all read</span>
          </button>
        </div>

        {/* Filter Tabs */}
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'all'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilter('appointments')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'appointments'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Appointments
          </button>
          <button
            onClick={() => setFilter('official')}
            className={`px-3 py-1 rounded-lg text-xs font-semibold transition ${
              filter === 'official'
                ? 'bg-blue-700 text-white'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            Official Gazettes & Updates
          </button>
        </div>
      </div>

      {/* Notifications List */}
      <div className="divide-y divide-slate-100 bg-white">
        {filtered.length === 0 ? (
          <div className="p-12 text-center text-xs text-slate-500">
            No notifications in this category.
          </div>
        ) : (
          filtered.map(notif => {
            const sender = users.find(u => u.id === notif.senderId);

            return (
              <div
                key={notif.id}
                className={`p-4 flex items-start gap-3 transition hover:bg-slate-50 group ${
                  !notif.isRead ? 'bg-blue-50/40 border-l-4 border-blue-600' : ''
                }`}
              >
                <div className="mt-0.5 shrink-0" onClick={() => handleNotificationClick(notif)}>
                  {getNotifIcon(notif.type)}
                </div>

                {sender && (
                  <div onClick={() => handleNotificationClick(notif)} className="cursor-pointer">
                    <UserAvatar user={sender} size="sm" />
                  </div>
                )}

                <div
                  className="flex-1 min-w-0 cursor-pointer"
                  onClick={() => handleNotificationClick(notif)}
                >
                  <p className="text-xs text-slate-800 leading-snug">
                    {notif.message}
                  </p>
                  <span className="text-[10px] text-slate-400 block mt-1">
                    {new Date(notif.createdAt).toLocaleDateString()} • {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {!notif.isRead && (
                    <span className="w-2 h-2 rounded-full bg-blue-600 mr-1" />
                  )}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteNotification(notif.id);
                    }}
                    title="Delete notification"
                    className="p-1 text-slate-300 hover:text-red-600 rounded-md transition opacity-0 group-hover:opacity-100"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
