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
  Plus,
  X,
  ArrowLeft,
  LogIn,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { UserAvatar } from '../common/UserAvatar';
import { VerificationBadge } from '../common/VerificationBadge';
import { PageHeader } from '../common/PageHeader';
import { EmptyState } from '../common/EmptyState';

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
    openLoginModal,
  } = useApp();

  const [messageText, setMessageText] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isNewChatModalOpen, setIsNewChatModalOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!currentUser) {
    return (
      <div className="flex-1 flex items-center justify-center p-8 text-center bg-[var(--bg)]">
        <EmptyState
          icon={<Lock className="w-6 h-6 text-[var(--accent)]" />}
          title="Privileged legal messaging"
          description="Private communications between citizens and verified advocates are protected under attorney-client privilege. Sign in to start or view your messages."
          action={{
            label: 'Sign in to access messages',
            onClick: openLoginModal,
          }}
        />
      </div>
    );
  }

  // Filter conversations for current user
  const userConversations = conversations.filter((c) =>
    c.participantIds.includes(currentUser.id)
  );

  // Default active conversation
  const currentConvId =
    activeConversationId ||
    (userConversations.length > 0 ? userConversations[0].id : null);
  const activeConversation = userConversations.find(
    (c) => c.id === currentConvId
  );

  // Other participant in the conversation
  const otherUserId = activeConversation?.participantIds.find(
    (id) => id !== currentUser.id
  );
  const otherUser = users.find((u) => u.id === otherUserId);

  // Filter messages for active conversation
  const activeMessages = messages.filter(
    (m) => m.conversationId === currentConvId
  );

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
      sendMessage(currentConvId, `Shared document: ${file.name}`, {
        type: 'document',
        url: (reader.result as string) || '#',
        name: file.name,
      });
    };
    reader.readAsDataURL(file);

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

  const filteredConversations = userConversations.filter((conv) => {
    if (!searchTerm.trim()) return true;
    const partnerId = conv.participantIds.find((id) => id !== currentUser.id);
    const partner = users.find((u) => u.id === partnerId);
    return (
      partner?.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      partner?.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      conv.lastMessageSnippet?.toLowerCase().includes(searchTerm.toLowerCase())
    );
  });

  return (
    <div className="flex-1 w-full h-full flex bg-[var(--bg)] border-x border-[var(--border)] overflow-hidden">
      {/* Conversations List Left Column: 360px wide, split layout */}
      <div
        className={`w-full min-[960px]:w-[360px] border-r border-[var(--border)] flex flex-col shrink-0 bg-[var(--bg)] ${
          activeConversationId ? 'hidden min-[960px]:flex' : 'flex'
        }`}
      >
        <PageHeader
          title="Messages"
          actions={
            <div className="flex items-center gap-2">
              <span className="text-[11px] bg-[var(--surface)] text-[var(--gold)] border border-[var(--border)] font-medium px-2 py-0.5 rounded-full flex items-center gap-1">
                <Lock className="w-3 h-3" />
                <span>Private</span>
              </span>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(true)}
                title="New message"
                aria-label="New message"
                className="p-1.5 rounded-full bg-[var(--accent)] hover:brightness-110 text-white transition-colors cursor-pointer flex items-center justify-center"
              >
                <Plus className="w-4 h-4" />
              </button>
            </div>
          }
        >
          <div className="relative">
            <Search className="w-4 h-4 text-[var(--muted)] absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search conversations..."
              className="w-full text-[13px] bg-[var(--surface)] text-[var(--text)] placeholder:text-[var(--muted)] rounded-full pl-9 pr-3 py-1.5 focus:outline-none focus:border-[var(--accent)] border border-[var(--border)]"
            />
          </div>
        </PageHeader>

        {/* List of threads */}
        <div className="flex-1 overflow-y-auto no-scrollbar divide-y divide-[var(--border)]">
          {filteredConversations.length === 0 ? (
            <div className="p-8 text-center text-[13px] text-[var(--muted)]">
              No conversations yet. Message an advocate or client to begin.
            </div>
          ) : (
            filteredConversations.map((conv) => {
              const partnerId = conv.participantIds.find((id) => id !== currentUser.id);
              const partner = users.find((u) => u.id === partnerId);
              if (!partner) return null;

              const isSelected = conv.id === currentConvId;
              const unread = conv.unreadCountForUser[currentUser.id] || 0;

              return (
                <button
                  key={conv.id}
                  type="button"
                  onClick={() => setActiveConversationId(conv.id)}
                  className={`w-full p-3.5 flex items-start gap-3 text-left transition-colors cursor-pointer ${
                    isSelected
                      ? 'bg-[var(--surface)] border-l-4 border-[var(--accent)]'
                      : 'hover:bg-[var(--hover)]'
                  }`}
                >
                  <UserAvatar user={partner} size="md" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1 min-w-0">
                        <span className="text-[14px] font-medium text-[var(--text)] truncate">
                          {partner.name}
                        </span>
                        <VerificationBadge user={partner} size="sm" />
                      </div>
                      <span className="text-[11px] text-[var(--muted)] shrink-0">
                        Recent
                      </span>
                    </div>

                    <p className="text-[12px] text-[var(--muted)] font-medium truncate mt-0.5">
                      {partner.role === 'advocate'
                        ? `Advocate • ${partner.barRollNumber || 'RBA'}`
                        : partner.role === 'legalaid'
                        ? 'Legal Aid Officer'
                        : `@${partner.username}`}
                    </p>

                    <p className="text-[13px] text-[var(--muted)] truncate mt-1">
                      {conv.lastMessageSnippet}
                    </p>
                  </div>

                  {unread > 0 && (
                    <span className="w-5 h-5 rounded-full bg-[var(--accent)] text-white text-[10px] font-bold flex items-center justify-center shrink-0">
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
      <div
        className={`${
          activeConversationId ? 'flex' : 'hidden min-[960px]:flex'
        } flex-1 flex-col bg-[var(--bg)] min-w-0 h-full overflow-hidden`}
      >
        {activeConversation && otherUser ? (
          <>
            {/* Thread Header */}
            <header className="px-4 py-3 border-b border-[var(--border)] bg-[var(--bg)] flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2.5 min-w-0">
                <button
                  type="button"
                  onClick={() => setActiveConversationId(null)}
                  className="min-[960px]:hidden w-11 h-11 text-[var(--muted)] hover:text-[var(--text)] rounded-full hover:bg-[var(--hover)] active:scale-95 -ml-2 cursor-pointer flex items-center justify-center shrink-0"
                  title="Back to conversations"
                  aria-label="Back to conversations"
                >
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <UserAvatar
                  user={otherUser}
                  size="md"
                  onClick={() => navigateToProfile(otherUser.id)}
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5 min-w-0">
                    <button
                      type="button"
                      onClick={() => navigateToProfile(otherUser.id)}
                      className="text-[14px] font-medium text-[var(--text)] hover:underline truncate cursor-pointer text-left"
                    >
                      {otherUser.name}
                    </button>
                    <VerificationBadge user={otherUser} size="sm" />
                  </div>
                  <span className="text-[12px] text-[var(--muted)] block truncate">
                    {otherUser.professionalTitle || `@${otherUser.username}`}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {otherUser.role === 'advocate' && (
                  <button
                    type="button"
                    onClick={() => setActiveView('appointments')}
                    className="px-3 py-1.5 bg-[var(--surface)] hover:bg-[var(--hover)] border border-[var(--border)] text-[var(--text)] rounded-full text-[12px] font-medium flex items-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Calendar className="w-3.5 h-3.5 text-[var(--accent)]" />
                    <span>View schedule</span>
                  </button>
                )}
              </div>
            </header>

            {/* Privileged Notice */}
            <div className="bg-[var(--surface)] border-b border-[var(--border)] px-4 py-2 flex items-center gap-2 text-[12px] text-[var(--muted)] shrink-0">
              <ShieldCheck className="w-4 h-4 text-[var(--accent)] shrink-0" />
              <span>
                <strong>Confidential channel:</strong> Communications between registered citizens and verified advocates are privileged under the Rwanda Bar Association ethical code.
              </span>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {activeMessages.map((msg) => {
                const isMine = msg.senderId === currentUser.id;

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMine ? 'items-end' : 'items-start'}`}
                  >
                    <div
                      className={`max-w-md rounded-[12px] px-3.5 py-2.5 text-[14px] leading-relaxed ${
                        isMine
                          ? 'bg-[var(--accent)] text-white rounded-br-xs'
                          : 'bg-[var(--surface)] border border-[var(--border)] text-[var(--text)] rounded-bl-xs'
                      }`}
                    >
                      <p className="m-0">{msg.content}</p>

                      {/* Attachments */}
                      {msg.attachments && (
                        <div className="mt-2 space-y-1">
                          {msg.attachments.map((att, i) => (
                            <div
                              key={i}
                              className={`flex items-center gap-2 p-2 rounded-[8px] text-[12px] ${
                                isMine
                                  ? 'bg-black/20 text-white'
                                  : 'bg-[var(--bg)] text-[var(--text)] border border-[var(--border)]'
                              }`}
                            >
                              <FileText className="w-4 h-4 shrink-0" />
                              <span className="font-medium truncate">{att.name}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="flex items-center gap-1 text-[11px] text-[var(--muted)] mt-0.5 px-1">
                      <span>
                        {new Date(msg.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                      {isMine && <CheckCheck className="w-3.5 h-3.5 text-[var(--accent)]" />}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Message Input Bar */}
            <form
              onSubmit={handleSend}
              className="p-2.5 sm:p-3 bg-[var(--surface)] border-t border-[var(--border)] flex items-center gap-2 shrink-0 sticky bottom-[calc(var(--kb-h,0px)+var(--safe-bottom))]"
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
                aria-label="Attach confidential document"
                className="w-11 h-11 text-[var(--muted)] hover:text-[var(--text)] hover:bg-[var(--hover)] rounded-full transition-colors cursor-pointer flex items-center justify-center shrink-0"
              >
                <Paperclip className="w-5 h-5" />
              </button>

              <input
                type="text"
                inputMode="text"
                enterKeyHint="send"
                value={messageText}
                onChange={(e) => setMessageText(e.target.value)}
                placeholder="Type confidential message..."
                className="flex-1 text-[16px] sm:text-[13px] bg-[var(--bg)] text-[var(--text)] placeholder:text-[var(--muted)] border border-[var(--border)] rounded-full px-4 py-2 focus:outline-none focus:border-[var(--accent)]"
              />

              <button
                type="submit"
                disabled={!messageText.trim()}
                aria-label="Send message"
                className={`w-11 h-11 rounded-full font-medium transition-colors flex items-center justify-center shrink-0 ${
                  messageText.trim()
                    ? 'bg-[var(--accent)] hover:brightness-110 text-white cursor-pointer shadow-xs active:scale-95'
                    : 'bg-[var(--surface)] text-[var(--muted)] cursor-not-allowed border border-[var(--border)]'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-center p-8">
            <EmptyState
              icon={<Lock className="w-6 h-6 text-[var(--muted)]" />}
              title="Select a conversation"
              description="Choose a contact from the list to review or send privileged messages."
            />
          </div>
        )}
      </div>

      {/* Start New Conversation Modal */}
      {isNewChatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-[var(--surface)] border border-[var(--border)] rounded-[12px] p-5 w-full max-w-md shadow-2xl space-y-3.5">
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-semibold text-[var(--text)] m-0">Start new private conversation</h3>
              <button
                type="button"
                onClick={() => setIsNewChatModalOpen(false)}
                className="p-1 text-[var(--muted)] hover:text-[var(--text)] cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-[13px] text-[var(--muted)] m-0 leading-normal">
              Select an advocate or member to open an encrypted communication channel.
            </p>

            <div className="space-y-1.5 max-h-64 overflow-y-auto no-scrollbar pr-1 divide-y divide-[var(--border)]">
              {users
                .filter((u) => u.id !== currentUser.id)
                .map((u) => (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => handleStartNewChatWith(u.id)}
                    className="w-full p-2.5 rounded-[10px] hover:bg-[var(--hover)] flex items-center gap-3 text-left transition-colors cursor-pointer"
                  >
                    <UserAvatar user={u} size="sm" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1">
                        <span className="text-[13px] font-medium text-[var(--text)] truncate">{u.name}</span>
                        <VerificationBadge user={u} size="sm" />
                      </div>
                      <span className="text-[12px] text-[var(--muted)] block truncate">
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
