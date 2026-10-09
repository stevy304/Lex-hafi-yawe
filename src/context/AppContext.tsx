import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  User,
  UserRole,
  Post,
  Reply,
  Community,
  LegalService,
  LegalAidProvider,
  LawDocument,
  LegalNewsItem,
  Appointment,
  Notification,
  Conversation,
  Message,
  ReportItem,
  VerificationApplication,
  AdminAuditLog,
  Language,
  PostAttachment
} from '../types';
import {
  INITIAL_USERS,
  INITIAL_POSTS,
  INITIAL_REPLIES,
  INITIAL_COMMUNITIES,
  INITIAL_LEGAL_SERVICES,
  INITIAL_LEGAL_AID_PROVIDERS,
  INITIAL_LAWS,
  INITIAL_LEGAL_NEWS,
  INITIAL_APPOINTMENTS,
  INITIAL_NOTIFICATIONS,
  INITIAL_CONVERSATIONS,
  INITIAL_MESSAGES,
  INITIAL_REPORTS,
  INITIAL_VERIFICATIONS,
  INITIAL_AUDIT_LOGS
} from '../data/initialData';

export type AppView =
  | 'feed'
  | 'explore'
  | 'notifications'
  | 'messages'
  | 'bookmarks'
  | 'communities'
  | 'services'
  | 'legalaid'
  | 'laws'
  | 'news'
  | 'appointments'
  | 'profile'
  | 'admin'
  | 'settings';

interface AppContextType {
  // Authentication & Users
  currentUser: User | null;
  users: User[];
  isAuthenticated: boolean;
  setCurrentUser: (user: User | null) => void;
  login: (identifier: string, password?: string) => boolean;
  logout: () => void;
  register: (data: {
    name: string;
    username: string;
    email: string;
    role: UserRole;
    password?: string;
    practiceAreas?: string[];
    barRollNumber?: string;
    firmName?: string;
    location?: string;
  }) => void;
  updateCurrentUserProfile: (updated: Partial<User>) => void;
  toggleFollowUser: (targetUserId: string) => void;
  muteUser: (targetUserId: string) => void;
  blockUser: (targetUserId: string) => void;

  // Auth Modal controls
  isAuthModalOpen: boolean;
  authModalMode: 'login' | 'register';
  openLoginModal: () => void;
  openRegisterModal: () => void;
  closeAuthModal: () => void;

  // View & Routing
  activeView: AppView;
  setActiveView: (view: AppView) => void;
  selectedProfileUserId: string | null;
  navigateToProfile: (userId: string) => void;
  selectedPostForThread: Post | null;
  setSelectedPostForThread: (post: Post | null) => void;
  selectedCommunityId: string | null;
  setSelectedCommunityId: (id: string | null) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;

  // Language
  language: Language;
  setLanguage: (lang: Language) => void;

  // Posts & Interactions
  posts: Post[];
  replies: Reply[];
  createPost: (
    content: string,
    legalTopic?: string,
    tags?: string[],
    attachments?: PostAttachment[],
    audience?: 'public' | 'followers',
    communityId?: string
  ) => void;
  deletePost: (postId: string) => void;
  editPost: (postId: string, newContent: string) => void;
  toggleLikePost: (postId: string) => void;
  toggleRepostPost: (postId: string) => void;
  toggleBookmarkPost: (postId: string) => void;
  createReply: (postId: string, content: string, parentReplyId?: string) => void;
  createQuotePost: (content: string, quotedPostId: string, legalTopic?: string) => void;

  // Communities
  communities: Community[];
  toggleJoinCommunity: (communityId: string) => void;
  createCommunity: (data: {
    name: string;
    kigaliName?: string;
    topic: string;
    description: string;
    rules: string[];
    officialSource?: string;
  }) => void;

  // Legal Services & Appointments
  legalServices: LegalService[];
  publishLegalService: (data: {
    title: string;
    description: string;
    practiceArea: string;
    feeRWF: number;
    formats: ('in_person' | 'video' | 'phone')[];
    turnaroundTime: string;
    locationProvince: 'Kigali City' | 'Northern Province' | 'Southern Province' | 'Eastern Province' | 'Western Province' | 'Nationwide';
    requirements: string[];
  }) => void;
  appointments: Appointment[];
  bookAppointment: (
    serviceId: string,
    advocateId: string,
    date: string,
    timeSlot: string,
    format: 'in_person' | 'video' | 'phone',
    feeRWF: number,
    clientNotes: string,
    serviceTitle: string
  ) => void;
  updateAppointmentStatus: (
    appointmentId: string,
    status: 'confirmed' | 'rescheduled' | 'completed' | 'cancelled',
    notes?: string
  ) => void;

  // Legal Aid & Laws & News
  legalAidProviders: LegalAidProvider[];
  laws: LawDocument[];
  legalNews: LegalNewsItem[];

  // Messaging
  conversations: Conversation[];
  messages: Message[];
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
  sendMessage: (
    conversationId: string,
    content: string,
    attachment?: { type: 'document' | 'image' | 'appointment_slip'; url: string; name: string }
  ) => void;
  startOrGetConversationWithUser: (otherUserId: string) => string;

  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  markNotificationAsRead: (id: string) => void;
  markAllNotificationsAsRead: () => void;
  deleteNotification: (id: string) => void;

  // Moderation & Trust
  reports: ReportItem[];
  submitReport: (
    targetType: 'post' | 'user' | 'service' | 'reply',
    targetId: string,
    targetPreview: string,
    category: ReportItem['category'],
    details: string
  ) => void;
  resolveReport: (reportId: string, actionTaken: boolean, moderatorNotes: string) => void;
  verificationApplications: VerificationApplication[];
  submitVerificationApplication: (data: {
    barRollNumber: string;
    lawFirmName: string;
    yearsOfExperience: number;
    practiceAreas: string[];
  }) => void;
  approveVerification: (appId: string, notes?: string) => void;
  rejectVerification: (appId: string, notes?: string) => void;
  auditLogs: AdminAuditLog[];

  // Modals
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;
  quoteTargetPost: Post | null;
  setQuoteTargetPost: (post: Post | null) => void;
  reportTarget: { type: 'post' | 'user' | 'service'; id: string; preview: string } | null;
  setReportTarget: (target: { type: 'post' | 'user' | 'service'; id: string; preview: string } | null) => void;
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'lex_hafi_yawe_v2_';

function loadFromStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    return item ? JSON.parse(item) : defaultValue;
  } catch (e) {
    console.warn('Failed to load from storage for', key, e);
    return defaultValue;
  }
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.warn('Failed to save to storage for', key, e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Users and Auth State
  const [users, setUsers] = useState<User[]>(() => loadFromStorage('users', INITIAL_USERS));
  const [currentUser, setCurrentUserState] = useState<User | null>(() => {
    const savedUserId = loadFromStorage<string | null>('current_user_id', 'user_aline_advocate');
    if (savedUserId === 'logged_out' || savedUserId === null) {
      return null;
    }
    const initialUserList = loadFromStorage('users', INITIAL_USERS);
    const found = initialUserList.find(u => u.id === savedUserId);
    return found || initialUserList[0] || null;
  });

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [activeView, setActiveView] = useState<AppView>('feed');
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [selectedPostForThread, setSelectedPostForThread] = useState<Post | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguageState] = useState<Language>(() => loadFromStorage('language', 'en'));

  const [posts, setPosts] = useState<Post[]>(() => loadFromStorage('posts', INITIAL_POSTS));
  const [replies, setReplies] = useState<Reply[]>(() => loadFromStorage('replies', INITIAL_REPLIES));
  const [communities, setCommunities] = useState<Community[]>(() => loadFromStorage('communities', INITIAL_COMMUNITIES));
  const [legalServices, setLegalServices] = useState<LegalService[]>(() => loadFromStorage('services', INITIAL_LEGAL_SERVICES));
  const [appointments, setAppointments] = useState<Appointment[]>(() => loadFromStorage('appointments', INITIAL_APPOINTMENTS));
  const [legalAidProviders] = useState<LegalAidProvider[]>(() => loadFromStorage('legalaid', INITIAL_LEGAL_AID_PROVIDERS));
  const [laws] = useState<LawDocument[]>(() => loadFromStorage('laws', INITIAL_LAWS));
  const [legalNews] = useState<LegalNewsItem[]>(() => loadFromStorage('news', INITIAL_LEGAL_NEWS));

  const [conversations, setConversations] = useState<Conversation[]>(() => loadFromStorage('conversations', INITIAL_CONVERSATIONS));
  const [messages, setMessages] = useState<Message[]>(() => loadFromStorage('messages', INITIAL_MESSAGES));
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>(() => loadFromStorage('notifications', INITIAL_NOTIFICATIONS));
  const [reports, setReports] = useState<ReportItem[]>(() => loadFromStorage('reports', INITIAL_REPORTS));
  const [verificationApplications, setVerificationApplications] = useState<VerificationApplication[]>(() => loadFromStorage('verifications', INITIAL_VERIFICATIONS));
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>(() => loadFromStorage('audit_logs', INITIAL_AUDIT_LOGS));

  // Modals state
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [quoteTargetPost, setQuoteTargetPost] = useState<Post | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'user' | 'service'; id: string; preview: string } | null>(null);

  // Sync to storage
  useEffect(() => { saveToStorage('users', users); }, [users]);
  useEffect(() => {
    saveToStorage('current_user_id', currentUser ? currentUser.id : 'logged_out');
    saveToStorage('current_user', currentUser);
  }, [currentUser]);
  useEffect(() => { saveToStorage('posts', posts); }, [posts]);
  useEffect(() => { saveToStorage('replies', replies); }, [replies]);
  useEffect(() => { saveToStorage('communities', communities); }, [communities]);
  useEffect(() => { saveToStorage('services', legalServices); }, [legalServices]);
  useEffect(() => { saveToStorage('appointments', appointments); }, [appointments]);
  useEffect(() => { saveToStorage('conversations', conversations); }, [conversations]);
  useEffect(() => { saveToStorage('messages', messages); }, [messages]);
  useEffect(() => { saveToStorage('notifications', notifications); }, [notifications]);
  useEffect(() => { saveToStorage('reports', reports); }, [reports]);
  useEffect(() => { saveToStorage('verifications', verificationApplications); }, [verificationApplications]);
  useEffect(() => { saveToStorage('audit_logs', auditLogs); }, [auditLogs]);
  useEffect(() => { saveToStorage('language', language); }, [language]);

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
  };

  const openLoginModal = () => {
    setAuthModalMode('login');
    setIsAuthModalOpen(true);
  };

  const openRegisterModal = () => {
    setAuthModalMode('register');
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  // Login handler
  const login = (identifier: string, password?: string): boolean => {
    const cleanId = identifier.trim().toLowerCase().replace(/^@/, '');
    if (!cleanId) return false;

    // 1. Exact match
    let user = users.find(
      u =>
        u.username.toLowerCase() === cleanId ||
        u.email?.toLowerCase() === cleanId ||
        u.name.toLowerCase() === cleanId
    );

    // 2. Substring match
    if (!user) {
      user = users.find(
        u =>
          u.username.toLowerCase().includes(cleanId) ||
          u.name.toLowerCase().includes(cleanId) ||
          (u.email && u.email.toLowerCase().includes(cleanId))
      );
    }

    // 3. Fallback provision user if valid email or handle provided
    if (!user && (cleanId.includes('@') || cleanId.length >= 3)) {
      const isAdvocateEmail = cleanId.includes('advocate') || cleanId.includes('lex') || cleanId.includes('law') || cleanId.includes('esq');
      const generatedName = cleanId.split('@')[0].replace(/[._-]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
      const newUser: User = {
        id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
        name: isAdvocateEmail ? `Me. ${generatedName}` : generatedName,
        username: cleanId.replace(/[^a-z0-9_]/g, '').slice(0, 20) || `user_${Date.now().toString().slice(-4)}`,
        email: cleanId.includes('@') ? cleanId : `${cleanId}@lexhafi.rw`,
        role: isAdvocateEmail ? 'advocate' : 'citizen',
        password: password || 'password123',
        isVerified: false,
        bio: isAdvocateEmail ? 'Practicing advocate and legal advisor in Rwanda.' : 'Registered citizen member on Lex Hafi Yawe Rwanda.',
        location: 'Kigali, Rwanda',
        languages: ['Kinyarwanda', 'English'],
        joinedDate: 'Oct 2026',
        followersCount: 0,
        followingCount: 2,
        followingIds: ['user_minijust', 'user_aline_advocate'],
        mutedUserIds: [],
        blockedUserIds: [],
        postsCount: 0,
        practiceAreas: isAdvocateEmail ? ['Commercial Law', 'General Civil Practice'] : undefined,
        consultationFee: isAdvocateEmail ? 25000 : undefined,
        consultationFormats: isAdvocateEmail ? ['in_person', 'video'] : undefined
      };
      setUsers(prev => [newUser, ...prev]);
      setCurrentUserState(newUser);
      setIsAuthModalOpen(false);
      return true;
    }

    if (user) {
      setCurrentUserState(user);
      setIsAuthModalOpen(false);
      return true;
    }
    return false;
  };

  // Logout handler
  const logout = () => {
    setCurrentUserState(null);
    saveToStorage('current_user_id', 'logged_out');
    saveToStorage('current_user', null);
  };

  // Register handler
  const register = (data: {
    name: string;
    username: string;
    email: string;
    role: UserRole;
    password?: string;
    practiceAreas?: string[];
    barRollNumber?: string;
    firmName?: string;
    location?: string;
  }) => {
    const cleanUsername = data.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const newUser: User = {
      id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      name: data.name.trim(),
      username: cleanUsername,
      email: data.email.trim(),
      role: data.role,
      password: data.password || 'password123',
      isVerified: data.role === 'institution' ? false : data.role === 'advocate' ? false : false,
      verificationType: undefined,
      barRollNumber: data.barRollNumber,
      firmName: data.firmName,
      professionalTitle: data.role === 'advocate' ? 'Advocate' : data.role === 'legalaid' ? 'Legal Aid Officer' : 'Citizen',
      bio: data.role === 'advocate'
        ? `Legal counsel in Rwanda. Practice areas: ${data.practiceAreas?.join(', ') || 'Civil & Commercial'}.`
        : 'Member of Lex Hafi Yawe legal community.',
      location: data.location || 'Kigali, Rwanda',
      languages: ['Kinyarwanda', 'English'],
      joinedDate: 'Oct 2026',
      followersCount: 0,
      followingCount: 2,
      followingIds: ['user_minijust', 'user_aline_advocate'],
      mutedUserIds: [],
      blockedUserIds: [],
      postsCount: 0,
      practiceAreas: data.practiceAreas || [],
      consultationFee: data.role === 'advocate' ? 20000 : undefined,
      consultationFormats: data.role === 'advocate' ? ['in_person', 'video'] : undefined
    };

    setUsers(prev => [newUser, ...prev]);
    setCurrentUserState(newUser);
    setIsAuthModalOpen(false);
  };

  const setCurrentUser = (user: User | null) => {
    setCurrentUserState(user);
  };

  const updateCurrentUserProfile = (updated: Partial<User>) => {
    if (!currentUser) return;
    const updatedUser = { ...currentUser, ...updated };
    setCurrentUserState(updatedUser);
    setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
  };

  // Follow / Unfollow
  const toggleFollowUser = (targetUserId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    if (targetUserId === currentUser.id) return;

    const currentFollowing = currentUser.followingIds || [];
    const isFollowing = currentFollowing.includes(targetUserId);

    const newFollowing = isFollowing
      ? currentFollowing.filter(id => id !== targetUserId)
      : [...currentFollowing, targetUserId];

    // Update current user
    const updatedCurrent = {
      ...currentUser,
      followingIds: newFollowing,
      followingCount: Math.max(0, newFollowing.length)
    };
    setCurrentUserState(updatedCurrent);

    // Update users array
    setUsers(prev =>
      prev.map(u => {
        if (u.id === currentUser.id) {
          return updatedCurrent;
        }
        if (u.id === targetUserId) {
          const newFollowers = Math.max(0, u.followersCount + (isFollowing ? -1 : 1));
          return { ...u, followersCount: newFollowers };
        }
        return u;
      })
    );

    // If following, trigger notification
    if (!isFollowing) {
      const newNotif: Notification = {
        id: `notif_${Date.now()}`,
        recipientId: targetUserId,
        senderId: currentUser.id,
        type: 'follow',
        message: `${currentUser.name} followed your profile.`,
        messageRw: `${currentUser.name} yatangiye kugukurikira.`,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications(n => [newNotif, ...n]);
    }
  };

  // Mute User
  const muteUser = (targetUserId: string) => {
    if (!currentUser) return;
    const currentMuted = currentUser.mutedUserIds || [];
    const isMuted = currentMuted.includes(targetUserId);
    const newMuted = isMuted
      ? currentMuted.filter(id => id !== targetUserId)
      : [...currentMuted, targetUserId];

    updateCurrentUserProfile({ mutedUserIds: newMuted });
  };

  // Block User
  const blockUser = (targetUserId: string) => {
    if (!currentUser) return;
    const currentBlocked = currentUser.blockedUserIds || [];
    const isBlocked = currentBlocked.includes(targetUserId);
    const newBlocked = isBlocked
      ? currentBlocked.filter(id => id !== targetUserId)
      : [...currentBlocked, targetUserId];

    updateCurrentUserProfile({ blockedUserIds: newBlocked });
  };

  const navigateToProfile = (userId: string) => {
    setSelectedProfileUserId(userId);
    setActiveView('profile');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Posts handling
  const createPost = (
    content: string,
    legalTopic?: string,
    tags: string[] = [],
    attachments: PostAttachment[] = [],
    audience: 'public' | 'followers' = 'public',
    communityId?: string
  ) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const newPost: Post = {
      id: `post_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      legalTopic: legalTopic || undefined,
      tags: tags.length ? tags : ['LegalDiscussion', 'RwandaLaw'],
      audience,
      attachments: attachments.length ? attachments : undefined,
      likesCount: 0,
      repliesCount: 0,
      repostsCount: 0,
      quotesCount: 0,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      communityId,
      isOfficialAnnouncement: currentUser.role === 'institution'
    };

    setPosts(prev => [newPost, ...prev]);
    updateCurrentUserProfile({ postsCount: currentUser.postsCount + 1 });
  };

  const deletePost = (postId: string) => {
    setPosts(prev => prev.filter(p => p.id !== postId));
    if (selectedPostForThread?.id === postId) {
      setSelectedPostForThread(null);
    }
  };

  const editPost = (postId: string, newContent: string) => {
    setPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, content: newContent, updatedAt: new Date().toISOString() }
          : p
      )
    );
  };

  const toggleLikePost = (postId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const hasLiked = post.likedBy.includes(currentUser.id);
        const newLikedBy = hasLiked
          ? post.likedBy.filter(id => id !== currentUser.id)
          : [...post.likedBy, currentUser.id];
        const newLikesCount = Math.max(0, post.likesCount + (hasLiked ? -1 : 1));

        if (!hasLiked && post.authorId !== currentUser.id) {
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            recipientId: post.authorId,
            senderId: currentUser.id,
            type: 'like',
            referenceId: post.id,
            message: `${currentUser.name} reacted to your post on "${post.legalTopic || 'Rwanda Law'}".`,
            messageRw: `${currentUser.name} yakunze ubutumwa bwawe ku ngingo "${post.legalTopic || 'Amategeko'}".`,
            createdAt: new Date().toISOString(),
            isRead: false
          };
          setNotifications(n => [newNotif, ...n]);
        }

        return {
          ...post,
          likedBy: newLikedBy,
          likesCount: newLikesCount
        };
      })
    );
  };

  const toggleRepostPost = (postId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const hasReposted = post.repostedBy.includes(currentUser.id);
        const newRepostedBy = hasReposted
          ? post.repostedBy.filter(id => id !== currentUser.id)
          : [...post.repostedBy, currentUser.id];
        const newCount = Math.max(0, post.repostsCount + (hasReposted ? -1 : 1));

        if (!hasReposted && post.authorId !== currentUser.id) {
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            recipientId: post.authorId,
            senderId: currentUser.id,
            type: 'repost',
            referenceId: post.id,
            message: `${currentUser.name} reposted your legal post.`,
            messageRw: `${currentUser.name} yongeye gutangaza ubutumwa bwawe.`,
            createdAt: new Date().toISOString(),
            isRead: false
          };
          setNotifications(n => [newNotif, ...n]);
        }

        return {
          ...post,
          repostedBy: newRepostedBy,
          repostsCount: newCount
        };
      })
    );
  };

  const toggleBookmarkPost = (postId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    setPosts(prev =>
      prev.map(post => {
        if (post.id !== postId) return post;
        const hasBookmarked = post.bookmarkedBy.includes(currentUser.id);
        const newBookmarkedBy = hasBookmarked
          ? post.bookmarkedBy.filter(id => id !== currentUser.id)
          : [...post.bookmarkedBy, currentUser.id];

        return {
          ...post,
          bookmarkedBy: newBookmarkedBy
        };
      })
    );
  };

  const createReply = (postId: string, content: string, parentReplyId?: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const newReply: Reply = {
      id: `reply_${Date.now()}`,
      postId,
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedBy: [],
      parentReplyId
    };

    setReplies(prev => [...prev, newReply]);
    setPosts(prev =>
      prev.map(p =>
        p.id === postId ? { ...p, repliesCount: p.repliesCount + 1 } : p
      )
    );

    const targetPost = posts.find(p => p.id === postId);
    if (targetPost && targetPost.authorId !== currentUser.id) {
      const newNotif: Notification = {
        id: `notif_${Date.now()}`,
        recipientId: targetPost.authorId,
        senderId: currentUser.id,
        type: 'reply',
        referenceId: postId,
        message: `${currentUser.name} replied to your legal post.`,
        messageRw: `${currentUser.name} yatanze igitekerezo ku butumwa bwawe.`,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications(n => [newNotif, ...n]);
    }
  };

  const createQuotePost = (content: string, quotedPostId: string, legalTopic?: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const quotedPost = posts.find(p => p.id === quotedPostId);
    if (!quotedPost) return;

    const newPost: Post = {
      id: `post_quote_${Date.now()}`,
      authorId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      legalTopic: legalTopic || quotedPost.legalTopic,
      tags: [...quotedPost.tags, 'LegalPerspective'],
      audience: 'public',
      likesCount: 0,
      repliesCount: 0,
      repostsCount: 0,
      quotesCount: 0,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      quotedPostId,
      quotedPost
    };

    setPosts(prev => [newPost, ...prev]);
    setPosts(prev =>
      prev.map(p =>
        p.id === quotedPostId ? { ...p, quotesCount: p.quotesCount + 1 } : p
      )
    );

    if (quotedPost.authorId !== currentUser.id) {
      const newNotif: Notification = {
        id: `notif_${Date.now()}`,
        recipientId: quotedPost.authorId,
        senderId: currentUser.id,
        type: 'quote',
        referenceId: newPost.id,
        message: `${currentUser.name} quoted your legal post.`,
        messageRw: `${currentUser.name} yasubiyemo ubutumwa bwawe abutangaho igitekerezo.`,
        createdAt: new Date().toISOString(),
        isRead: false
      };
      setNotifications(n => [newNotif, ...n]);
    }
  };

  // Communities
  const toggleJoinCommunity = (communityId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    setCommunities(prev =>
      prev.map(c => {
        if (c.id !== communityId) return c;
        const isJoined = c.joinedBy.includes(currentUser.id);
        const newJoinedBy = isJoined
          ? c.joinedBy.filter(id => id !== currentUser.id)
          : [...c.joinedBy, currentUser.id];
        return {
          ...c,
          joinedBy: newJoinedBy,
          membersCount: Math.max(1, c.membersCount + (isJoined ? -1 : 1))
        };
      })
    );
  };

  const createCommunity = (data: {
    name: string;
    kigaliName?: string;
    topic: string;
    description: string;
    rules: string[];
    officialSource?: string;
  }) => {
    if (!currentUser) return;
    const newComm: Community = {
      id: `comm_${Date.now()}`,
      name: data.name,
      kigaliName: data.kigaliName,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: data.description,
      bannerGradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
      icon: 'Scale',
      membersCount: 1,
      joinedBy: [currentUser.id],
      topic: data.topic,
      rules: data.rules,
      officialSource: data.officialSource || 'Lex Hafi Yawe Community',
      moderatorId: currentUser.id
    };

    setCommunities(prev => [newComm, ...prev]);
    setSelectedCommunityId(newComm.id);
  };

  // Legal Services
  const publishLegalService = (data: {
    title: string;
    description: string;
    practiceArea: string;
    feeRWF: number;
    formats: ('in_person' | 'video' | 'phone')[];
    turnaroundTime: string;
    locationProvince: 'Kigali City' | 'Northern Province' | 'Southern Province' | 'Eastern Province' | 'Western Province' | 'Nationwide';
    requirements: string[];
  }) => {
    if (!currentUser) return;

    const newService: LegalService = {
      id: `serv_${Date.now()}`,
      providerId: currentUser.id,
      title: data.title,
      description: data.description,
      practiceArea: data.practiceArea,
      feeRWF: data.feeRWF,
      isFeeDisclosed: true,
      feeType: 'fixed',
      formats: data.formats,
      turnaroundTime: data.turnaroundTime,
      locationProvince: data.locationProvince,
      languages: currentUser.languages || ['Kinyarwanda', 'English'],
      requirements: data.requirements,
      rating: 5.0,
      reviewsCount: 1
    };

    setLegalServices(prev => [newService, ...prev]);
  };

  // Appointments
  const bookAppointment = (
    serviceId: string,
    advocateId: string,
    date: string,
    timeSlot: string,
    format: 'in_person' | 'video' | 'phone',
    feeRWF: number,
    clientNotes: string,
    serviceTitle: string
  ) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}`,
      serviceId,
      advocateId,
      clientId: currentUser.id,
      serviceTitle,
      date,
      timeSlot,
      format,
      feeRWF,
      status: 'confirmed',
      clientNotes,
      createdAt: new Date().toISOString(),
      locationDetails: format === 'in_person' ? 'Chambers / Kigali Office' : 'Secure Lex Hafi Video Call'
    };

    setAppointments(prev => [newAppointment, ...prev]);

    const newNotif: Notification = {
      id: `notif_${Date.now()}`,
      recipientId: advocateId,
      senderId: currentUser.id,
      type: 'appointment',
      referenceId: newAppointment.id,
      message: `${currentUser.name} booked a consultation: "${serviceTitle}" for ${date} at ${timeSlot}.`,
      messageRw: `${currentUser.name} yasabye inama: "${serviceTitle}" kuwa ${date} saa ${timeSlot}.`,
      createdAt: new Date().toISOString(),
      isRead: false
    };
    setNotifications(n => [newNotif, ...n]);

    const convId = startOrGetConversationWithUser(advocateId);
    sendMessage(
      convId,
      `Hello! I have booked a legal consultation: "${serviceTitle}" scheduled for ${date} (${timeSlot}). Instructions: "${clientNotes}"`
    );
  };

  const updateAppointmentStatus = (
    appointmentId: string,
    status: 'confirmed' | 'rescheduled' | 'completed' | 'cancelled',
    notes?: string
  ) => {
    setAppointments(prev =>
      prev.map(apt => {
        if (apt.id !== appointmentId) return apt;
        const updated = {
          ...apt,
          status,
          ...(notes ? { advocateNotes: notes } : {})
        };

        if (currentUser) {
          const targetUserId = currentUser.id === apt.advocateId ? apt.clientId : apt.advocateId;
          const newNotif: Notification = {
            id: `notif_${Date.now()}`,
            recipientId: targetUserId,
            senderId: currentUser.id,
            type: 'appointment',
            referenceId: apt.id,
            message: `Appointment status updated to "${status.toUpperCase()}" for ${apt.serviceTitle}.`,
            messageRw: `Imiterere ya gahunda yahinduwe kuri "${status.toUpperCase()}".`,
            createdAt: new Date().toISOString(),
            isRead: false
          };
          setNotifications(n => [newNotif, ...n]);
        }

        return updated;
      })
    );
  };

  // Messaging
  const startOrGetConversationWithUser = (otherUserId: string): string => {
    if (!currentUser) {
      openLoginModal();
      return '';
    }

    const existing = conversations.find(
      c => c.participantIds.includes(currentUser.id) && c.participantIds.includes(otherUserId)
    );
    if (existing) {
      setActiveConversationId(existing.id);
      return existing.id;
    }

    const newConvId = `conv_${Date.now()}`;
    const newConv: Conversation = {
      id: newConvId,
      participantIds: [currentUser.id, otherUserId],
      lastMessageSnippet: 'Privileged legal conversation initiated.',
      lastMessageAt: new Date().toISOString(),
      unreadCountForUser: {
        [otherUserId]: 0,
        [currentUser.id]: 0
      },
      isPrivilegedLegalNoticeAcknowledged: true
    };

    setConversations(prev => [newConv, ...prev]);
    setActiveConversationId(newConvId);
    return newConvId;
  };

  const sendMessage = (
    conversationId: string,
    content: string,
    attachment?: { type: 'document' | 'image' | 'appointment_slip'; url: string; name: string }
  ) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }

    const newMsg: Message = {
      id: `msg_${Date.now()}`,
      conversationId,
      senderId: currentUser.id,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
      attachments: attachment ? [attachment] : undefined
    };

    setMessages(prev => [...prev, newMsg]);

    setConversations(prev =>
      prev.map(c => {
        if (c.id !== conversationId) return c;
        const otherParticipant = c.participantIds.find(id => id !== currentUser.id);
        const currentUnread = otherParticipant ? (c.unreadCountForUser[otherParticipant] || 0) + 1 : 0;
        return {
          ...c,
          lastMessageSnippet: content.slice(0, 60),
          lastMessageAt: new Date().toISOString(),
          unreadCountForUser: {
            ...c.unreadCountForUser,
            ...(otherParticipant ? { [otherParticipant]: currentUnread } : {})
          }
        };
      })
    );
  };

  // Notifications
  const markNotificationAsRead = (id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, isRead: true } : n))
    );
  };

  const markAllNotificationsAsRead = () => {
    if (!currentUser) return;
    setNotifications(prev =>
      prev.map(n => (n.recipientId === currentUser.id ? { ...n, isRead: true } : n))
    );
  };

  const deleteNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  // Moderation & Trust
  const submitReport = (
    targetType: 'post' | 'user' | 'service' | 'reply',
    targetId: string,
    targetPreview: string,
    category: ReportItem['category'],
    details: string
  ) => {
    const reporterId = currentUser ? currentUser.id : 'guest_reporter';
    const newReport: ReportItem = {
      id: `rep_${Date.now()}`,
      reporterId,
      targetType,
      targetId,
      targetPreview,
      category,
      details,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };
    setReports(prev => [newReport, ...prev]);
  };

  const resolveReport = (reportId: string, actionTaken: boolean, moderatorNotes: string) => {
    setReports(prev =>
      prev.map(r =>
        r.id === reportId
          ? {
              ...r,
              status: actionTaken ? 'resolved_action_taken' : 'resolved_dismissed',
              moderatorNotes
            }
          : r
      )
    );

    const audit: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      action: actionTaken ? 'REPORT_ACTION_ENFORCED' : 'REPORT_DISMISSED',
      target: `Report #${reportId}`,
      timestamp: new Date().toISOString(),
      details: moderatorNotes
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  // Apply for Bar Verification
  const submitVerificationApplication = (data: {
    barRollNumber: string;
    lawFirmName: string;
    yearsOfExperience: number;
    practiceAreas: string[];
  }) => {
    if (!currentUser) return;

    const newApp: VerificationApplication = {
      id: `verif_app_${Date.now()}`,
      userId: currentUser.id,
      fullName: currentUser.name,
      barRollNumber: data.barRollNumber,
      lawFirmName: data.lawFirmName,
      yearsOfExperience: data.yearsOfExperience,
      practiceAreas: data.practiceAreas,
      diplomaDocumentUrl: 'Verified_Degree_Certificate.pdf',
      barCertificateUrl: 'Rwanda_Bar_Practicing_Certificate.pdf',
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    setVerificationApplications(prev => [newApp, ...prev]);
  };

  const approveVerification = (appId: string, notes?: string) => {
    const app = verificationApplications.find(a => a.id === appId);
    if (!app) return;

    setVerificationApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? { ...a, status: 'approved', reviewedAt: new Date().toISOString(), moderatorNotes: notes }
          : a
      )
    );

    setUsers(prev =>
      prev.map(u =>
        u.id === app.userId
          ? {
              ...u,
              role: 'advocate',
              isVerified: true,
              verificationType: 'bar_member',
              barRollNumber: app.barRollNumber,
              firmName: app.lawFirmName,
              practiceAreas: app.practiceAreas
            }
          : u
      )
    );

    const audit: AdminAuditLog = {
      id: `audit_${Date.now()}`,
      adminId: currentUser?.id || 'admin',
      action: 'BAR_VERIFICATION_APPROVED',
      target: `${app.fullName} (${app.barRollNumber})`,
      timestamp: new Date().toISOString(),
      details: notes || 'Verified with Rwanda Bar Association Registry.'
    };
    setAuditLogs(prev => [audit, ...prev]);
  };

  const rejectVerification = (appId: string, notes?: string) => {
    setVerificationApplications(prev =>
      prev.map(a =>
        a.id === appId
          ? { ...a, status: 'rejected', reviewedAt: new Date().toISOString(), moderatorNotes: notes }
          : a
      )
    );
  };

  const resetDemoData = () => {
    localStorage.clear();
    setUsers(INITIAL_USERS);
    setCurrentUserState(INITIAL_USERS[0]);
    setPosts(INITIAL_POSTS);
    setReplies(INITIAL_REPLIES);
    setCommunities(INITIAL_COMMUNITIES);
    setLegalServices(INITIAL_LEGAL_SERVICES);
    setAppointments(INITIAL_APPOINTMENTS);
    setConversations(INITIAL_CONVERSATIONS);
    setMessages(INITIAL_MESSAGES);
    setNotifications(INITIAL_NOTIFICATIONS);
    setReports(INITIAL_REPORTS);
    setVerificationApplications(INITIAL_VERIFICATIONS);
    setAuditLogs(INITIAL_AUDIT_LOGS);
    setActiveView('feed');
  };

  const unreadNotificationsCount = currentUser
    ? notifications.filter(n => n.recipientId === currentUser.id && !n.isRead).length
    : 0;

  const unreadMessagesCount = currentUser
    ? conversations.reduce((acc, c) => acc + (c.unreadCountForUser[currentUser.id] || 0), 0)
    : 0;

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: !!currentUser,
        setCurrentUser,
        login,
        logout,
        register,
        updateCurrentUserProfile,
        toggleFollowUser,
        muteUser,
        blockUser,
        isAuthModalOpen,
        authModalMode,
        openLoginModal,
        openRegisterModal,
        closeAuthModal,
        activeView,
        setActiveView,
        selectedProfileUserId,
        navigateToProfile,
        selectedPostForThread,
        setSelectedPostForThread,
        selectedCommunityId,
        setSelectedCommunityId,
        searchQuery,
        setSearchQuery,
        language,
        setLanguage,
        posts,
        replies,
        createPost,
        deletePost,
        editPost,
        toggleLikePost,
        toggleRepostPost,
        toggleBookmarkPost,
        createReply,
        createQuotePost,
        communities,
        toggleJoinCommunity,
        createCommunity,
        legalServices,
        publishLegalService,
        appointments,
        bookAppointment,
        updateAppointmentStatus,
        legalAidProviders,
        laws,
        legalNews,
        conversations,
        messages,
        activeConversationId,
        setActiveConversationId,
        sendMessage,
        startOrGetConversationWithUser,
        notifications,
        unreadNotificationsCount,
        unreadMessagesCount,
        markNotificationAsRead,
        markAllNotificationsAsRead,
        deleteNotification,
        reports,
        submitReport,
        resolveReport,
        verificationApplications,
        submitVerificationApplication,
        approveVerification,
        rejectVerification,
        auditLogs,
        isCreatePostModalOpen,
        setIsCreatePostModalOpen,
        quoteTargetPost,
        setQuoteTargetPost,
        reportTarget,
        setReportTarget,
        resetDemoData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
