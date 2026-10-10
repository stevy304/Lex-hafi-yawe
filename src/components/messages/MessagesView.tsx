import React, { useState, useRef } from 'react';
import {
  Send,
  FileText,
  Paperclip,
  ShieldCheck,
  Search,
  CheckCheck,
  Calendar,
  Lock,
  Phone,
  Video,
  Info,
  LogIn,
  Plus,
  X,
  ArrowLeft
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';

export const MessagesView: React.FC = () => {
  const {
    conversations,
    messages,
    activeConversationId,
    setActiveConversationId,
    sendMessage,
    startOrGetConversationWithUser,
    currentUser,
    users,
    navigateToProfile,
    setActiveView,
    openLoginModal
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center p-8 text-center">
        <div>
          <div className="w-12 h-12 rounded-full bg-blue-100 text-blue-700 flex items-center justify-center mx-auto mb-3">
            <Lock className="w-6 h-6" />
          </div>
          <h2 className="text-base font-bold text-slate-900 mb-1">
            Privileged Legal Messaging
          </h2>
          <p className="text-xs text-slate-500 max-w-sm mb-4">
            Private communications between citizens and verified advocates are protected under attorney-client privilege. Sign in to start or view your messages.
          </p>
          <button
            onClick={openLoginModal}
            className="px-5 py-2.5 bg-blue-700 text-white font-bold text-xs rounded-xl hover:bg-blue-800 transition flex items-center gap-2 mx-auto cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>Sign In to Access Messages</span>
          </button>
        </div>
      </div>
    );
  }

  // Filter conversations for current user
  const userConversations = conversations.filter(c => c.participantIds.includes(currentUser.id));

  // Default active conversation
  const currentConvId = activeConversationId || (userConversations.length > 0 ? userConversations[0].id : null);
  const activeConversation = userConversations.find(c => c.id === currentConvId);

  // Other participant in the conversation
  const otherUserId = activeConversation?.participantIds.find(id => id !== currentUser.id);
  const otherUser = users.find(u => u.id === otherUserId);

  // Filter messages for active conversation
  const activeMessages = messages.filter(m => m.conversationId === currentConvId);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!messageText.trim() || !currentConvId) return;

    sendMessage(currentConvId, messageText.trim());
    setMessageText('');
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentConvId) return;

    const reader = new FileReader();
    reader.onload = () => {
      sendMessage(
        currentConvId,
        `Shared document: ${file.name}`,
        {
          type: 'document',
          url: (reader.result as string) || '#',
          name: file.name
        }
      );
    };
    reader.readAsDataURL(file);

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleStartNewChatWith = async (targetUserId: string) => {
    const convId = await startOrGetConversationWithUser(targetUserId);
    if (convId) {
      setActiveConversationId(convId);
    }
    setIsNewChatModalOpen(false);
  };

  return (
    <div className="h-[calc(100vh-60px)] lg:h-screen flex bg-white overflow-hidden">
      {/* Conversations List Left Column */}
      <div className={`w-full sm:w-80 md:w-96 border-r border-slate-200 flex-col shrink-0 ${activeConversationId ? 'hidden sm:flex' : 'flex'}`}>
        <div className="p-3.5 border-b border-slate-200">
          <div className="flex items-center justify-between mb-2">
            <h1 className="text-sm font-extrabold text-slate-900">
              Private Messages
            </h1>
            <div className="flex items-center gap-1.5">
              <span className="text-2xs bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Privileged</span>
              </span>
              <button
                onClick={() => setIsNewChatModalOpen(true)}
                title="Start new conversation"
                className="p-1 text-blue-700 hover:bg-blue-50 rounded-lg transition"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full text-xs bg-slate-100 rounded-xl pl-9 pr-3 py-1.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white border border-transparent focus:border-blue-600"
            />
          </div>
        </div>

        {/* List of threads */}
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {userConversations.length === 0 ? (
            <div className="p-8 text-center text-xs text-slate-400">
              No conversations yet. Message an advocate or client to begin.
            </div>
          ) : (
            userConversations.map(conv => {
              const partnerId = conv.participantIds.find(id => id !== currentUser.id);
              const partner = users.find(u => u.id === partnerId);
              if (!partner) return null;

              const isSelected = conv.id === currentConvId;
              const unread = conv.unreadCountForUser[currentUser.id] || 0;

              return (
                <button
                  key={conv.id}
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full p-3 flex items-start gap-3 text-left transition cursor-pointer ${
                    isSelected ? 'bg-blue-50/70 border-l-4 border-blue-700' : 'hover:bg-slate-50'
                  }`}
                >
                  <UserAvatar user={partner} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-xs font-bold text-slate-900 truncate">
                          {partner.name}
                        </span>
                        <VerificationBadge user={partner} size="sm" />
                      </div>
                      <span className="text-[10px] text-slate-400 shrink-0">
                        Recent
                      </span>
                    </div>

                    <p className="text-2xs text-slate-500 font-medium truncate mt-0.5">
                      {partner.role === 'advocate'
                        ? `Advocate • ${partner.barRollNumber || 'RBA'}`
                        : partner.role === 'legalaid'
                        ? 'Legal Aid Officer'
                        : `@${partner.username}`}
                    </p>

                    <p className="text-xs text-slate-600 truncate mt-1">
                      {conv.lastMessageSnippet}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-blue-600 text-white text-[10px] font-bold flex items-center justify-center shrink-0">
                      {unread}
                    </span>
                  )}
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Active Conversation Right Column */}
      <div className={`${activeConversationId ? 'flex' : 'hidden sm:flex'} flex-1 flex-col bg-slate-50/50`}>
        {activeConversation && otherUser ? (
          <>
            {/* Thread Header */}
            <div className="p-3.5 bg-white border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="sm:hidden p-1.5 text-slate-600 hover:text-slate-900 rounded-lg hover:bg-slate-100 -ml-1 cursor-pointer"
                  title="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <UserAvatar
                  user={otherUser}
                  size="md"
                  onClick={() => navigateToProfile(otherUser.id)}
                />
                <div>
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => navigateToProfile(otherUser.id)}
                      className="text-xs font-extrabold text-slate-900 hover:underline"
                    >
                      {otherUser.name}
                    </button>
                    <VerificationBadge user={otherUser} size="sm" />
                  </div>
                  <span className="text-2xs text-slate-500 block">
                    {otherUser.professionalTitle || `@${otherUser.username}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {otherUser.role === 'advocate' && (
                  <button
                    onClick={() => setActiveView('appointments')}
                    className="px-3 py-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition"
                  >
                    <Calendar className="w-3.5 h-3.5" />
                    <span>View Schedule</span>
                  </button>
                )}
              </div>
            </div>

            {/* Privileged Notice */}
            <div className="bg-blue-50/80 border-b border-blue-100 px-4 py-2 flex items-center gap-2 text-2xs text-blue-900">
              <ShieldCheck className="w-4 h-4 text-blue-700 shrink-0" />
              <span>
                <strong>Confidential Channel:</strong> Communications between registered citizens and verified advocates are privileged under the Rwanda Bar Association ethical code.
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMessages.map(msg => {
                const isMine = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-2xl px-3.5 py-2.5 text-xs shadow-2xs leading-relaxed ${
                        isMine
                          ? 'bg-blue-700 text-white rounded-br-xs'
                          : 'bg-white border border-slate-200 text-slate-900 rounded-bl-xs'
                      }`}
                    >
                      <p>{msg.content}</p>

                      {/* Attachments */}
                      {msg.attachments && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded-xl text-2xs ${
                                isMine ? 'bg-blue-800 text-blue-50' : 'bg-slate-100 text-slate-800'
                              }`}
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="font-semibold truncate">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[10px] text-slate-400 mt-0.5 px-1">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                      {isMine && <CheckCheck className="w-3.5 h-3.5 text-blue-500" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-3 bg-white border-t border-slate-200 flex items-center gap-2"
            >
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileChange}
                className="hidden"
                accept=".pdf,.doc,.docx,.png,.jpg,.jpeg,.txt"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                title="Attach confidential document"
                className="p-2 text-slate-500 hover:text-blue-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              >
                <Paperclip className="w-4 h-4" />
              </button>

              <input
                type="text"
                value={messageText}
                onChange={e => setMessageText(e.target.value)}
                placeholder="Type confidential message..."
                className="flex-1 text-xs bg-slate-100 border border-slate-200 rounded-xl px-3 py-2.5 focus:outline-none focus:ring-1 focus:ring-blue-600 focus:bg-white"
              />

              <button
                type="submit"
                disabled={!messageText.trim()}
                className={`p-2.5 rounded-xl font-bold transition ${
                  messageText.trim()
                    ? 'bg-blue-700 hover:bg-blue-800 text-white cursor-pointer shadow-xs'
                    : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-2">
                <Lock className="w-6 h-6" />
              </div>
              <h3 className="text-sm font-bold text-slate-800">
                Select a Conversation
              </h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Choose a contact from the left panel to review or send privileged messages.
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Start New Conversation Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs">
          <div className="bg-white rounded-2xl p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-slate-900">Start New Private Conversation</h3>
              <button
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500">
              Select an advocate or member to open an encrypted communication channel.
            </p>

            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {users
                .filter(u => u.id !== currentUser.id)
                .map(u => (
                  <button
                    key={u.id}
                    onClick={() => handleStartNewChatWith(u.id)}
                    className="w-full p-2 rounded-xl border border-slate-100 hover:border-blue-300 hover:bg-blue-50/50 flex items-center gap-3 text-left transition cursor-pointer"
                  >
                    <UserAvatar user={u} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{u.name}</span>
                        <VerificationBadge user={u} size="sm" />
                      </div>
                      <span className="text-2xs text-slate-500 block truncate">
                        {u.role === 'advocate' ? `Advocate • ${u.barRollNumber}` : `@${u.username}`}
                      </span>
                    </div>
                  </button>
                ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
