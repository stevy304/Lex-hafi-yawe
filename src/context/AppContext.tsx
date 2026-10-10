import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
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
import { api, getStoredToken } from '../api/client';

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
  isLoading: boolean;
  isAuthLoading: boolean;
  isGuestBrowsing: boolean;
  setIsGuestBrowsing: (val: boolean) => void;
  navigateToLanding: () => void;
  setCurrentUser: (user: User | null) => Promise<void> | void;
  login: (identifier: string, password?: string) => Promise<boolean>;
  logout: () => Promise<void>;
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
  }) => Promise<boolean>;
  updateCurrentUserProfile: (updated: Partial<User>) => Promise<void>;
  toggleFollowUser: (targetUserId: string) => Promise<void>;
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
  ) => Promise<void>;
  deletePost: (postId: string) => Promise<void>;
  editPost: (postId: string, newContent: string) => Promise<void>;
  toggleLikePost: (postId: string) => Promise<void>;
  toggleRepostPost: (postId: string) => Promise<void>;
  toggleBookmarkPost: (postId: string) => Promise<void>;
  createReply: (postId: string, content: string, parentReplyId?: string) => Promise<void>;
  createQuotePost: (content: string, quotedPostId: string, legalTopic?: string) => Promise<void>;

  // Communities
  communities: Community[];
  toggleJoinCommunity: (communityId: string) => Promise<void>;
  createCommunity: (data: {
    name: string;
    kigaliName?: string;
    topic: string;
    description: string;
    rules: string[];
    officialSource?: string;
  }) => Promise<void>;

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
  }) => Promise<void>;
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
  ) => Promise<void>;
  updateAppointmentStatus: (
    appointmentId: string,
    status: 'confirmed' | 'rescheduled' | 'completed' | 'cancelled',
    notes?: string
  ) => Promise<void>;

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
  ) => Promise<void>;
  startOrGetConversationWithUser: (otherUserId: string) => Promise<string> | string;

  // Notifications
  notifications: Notification[];
  unreadNotificationsCount: number;
  unreadMessagesCount: number;
  markNotificationAsRead: (id: string) => Promise<void>;
  markAllNotificationsAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;

  // Moderation & Trust
  reports: ReportItem[];
  submitReport: (
    targetType: 'post' | 'user' | 'service' | 'reply',
    targetId: string,
    targetPreview: string,
    category: ReportItem['category'],
    details: string
  ) => Promise<void>;
  resolveReport: (reportId: string, actionTaken: boolean, moderatorNotes: string) => Promise<void>;
  verificationApplications: VerificationApplication[];
  submitVerificationApplication: (data: {
    barRollNumber: string;
    lawFirmName: string;
    yearsOfExperience: number;
    practiceAreas: string[];
  }) => Promise<void>;
  approveVerification: (appId: string, notes?: string) => Promise<void>;
  rejectVerification: (appId: string, notes?: string) => Promise<void>;
  auditLogs: AdminAuditLog[];

  // Modals
  isCreatePostModalOpen: boolean;
  setIsCreatePostModalOpen: (open: boolean) => void;
  quoteTargetPost: Post | null;
  setQuoteTargetPost: (post: Post | null) => void;
  reportTarget: { type: 'post' | 'user' | 'service'; id: string; preview: string } | null;
  setReportTarget: (target: { type: 'post' | 'user' | 'service'; id: string; preview: string } | null) => void;
  resetDemoData: () => Promise<void>;
  refreshAllData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

function mapAuthUserToAppUser(authUser: any, existingUsers: User[] = []): User {
  const found = existingUsers.find(
    (u) => u.id === authUser.id || u.username === authUser.handle || (authUser.email && u.email === authUser.email)
  );
  if (found) {
    return {
      ...found,
      name: authUser.name || found.name,
      role: (authUser.role === 'advocate' ? 'advocate' : authUser.role === 'admin' ? 'admin' : found.role) as any,
      isVerified: authUser.role === 'advocate' || authUser.verifiedAdvocate || found.isVerified,
    };
  }

  return {
    id: authUser.id || `usr_${Date.now()}`,
    name: authUser.name || 'Lex User',
    username: authUser.handle || 'lexuser',
    avatar: authUser.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
    role: (authUser.role === 'advocate' ? 'advocate' : authUser.role === 'admin' ? 'admin' : 'citizen') as any,
    isVerified: authUser.role === 'advocate' || authUser.verifiedAdvocate || authUser.role === 'admin',
    verificationType: authUser.role === 'advocate' ? 'bar_member' : authUser.role === 'admin' ? 'official_institution' : undefined,
    bio: authUser.bio || 'Advocating for digital justice and legal literacy in Rwanda.',
    location: authUser.district ? `${authUser.district}, Rwanda` : 'Kigali, Rwanda',
    languages: ['en', 'rw'],
    joinedDate: new Date().toISOString(),
    followersCount: 84,
    followingCount: 65,
    postsCount: 5,
    practiceAreas: authUser.role === 'advocate' ? ['Civil Litigation', 'Land Law', 'Commercial Law'] : undefined,
    barRollNumber: authUser.role === 'advocate' ? 'RBA/2023/118' : undefined,
    firmName: authUser.role === 'advocate' ? 'Kigali Legal Associates' : undefined,
    email: authUser.email,
    phone: authUser.phone,
  };
}

export interface AppProviderProps {
  children: React.ReactNode;
  initialAuthUser?: any;
  onLogout?: () => void;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children, initialAuthUser, onLogout }) => {
  // Global loading states
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthLoading, setIsAuthLoading] = useState(false);

  // Users and Auth State
  const [currentUser, setCurrentUserState] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isGuestBrowsing, setIsGuestBrowsing] = useState<boolean>(() => {
    try {
      return localStorage.getItem('lex_hafi_guest_mode') === 'true';
    } catch {
      return false;
    }
  });

  const setGuestBrowsingState = (val: boolean) => {
    setIsGuestBrowsing(val);
    try {
      if (val) {
        localStorage.setItem('lex_hafi_guest_mode', 'true');
      } else {
        localStorage.removeItem('lex_hafi_guest_mode');
      }
    } catch {}
  };

  const navigateToLanding = () => {
    setGuestBrowsingState(false);
    if (onLogout) {
      onLogout();
    }
  };

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'register'>('login');

  const [activeView, setActiveView] = useState<AppView>('feed');
  const [selectedProfileUserId, setSelectedProfileUserId] = useState<string | null>(null);
  const [selectedPostForThread, setSelectedPostForThread] = useState<Post | null>(null);
  const [selectedCommunityId, setSelectedCommunityId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [language, setLanguageState] = useState<Language>(() => {
    try {
      return (localStorage.getItem('lex_hafi_lang') as Language) || 'en';
    } catch {
      return 'en';
    }
  });

  const setLanguage = (lang: Language) => {
    setLanguageState(lang);
    try {
      localStorage.setItem('lex_hafi_lang', lang);
    } catch {}
  };

  // Data Collections
  const [posts, setPosts] = useState<Post[]>([]);
  const [replies, setReplies] = useState<Reply[]>([]);
  const [communities, setCommunities] = useState<Community[]>([]);
  const [legalServices, setLegalServices] = useState<LegalService[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [legalAidProviders, setLegalAidProviders] = useState<LegalAidProvider[]>([]);
  const [laws, setLaws] = useState<LawDocument[]>([]);
  const [legalNews, setLegalNews] = useState<LegalNewsItem[]>([]);

  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [reports, setReports] = useState<ReportItem[]>([]);
  const [verificationApplications, setVerificationApplications] = useState<VerificationApplication[]>([]);
  const [auditLogs, setAuditLogs] = useState<AdminAuditLog[]>([]);

  // Modals state
  const [isCreatePostModalOpen, setIsCreatePostModalOpen] = useState(false);
  const [quoteTargetPost, setQuoteTargetPost] = useState<Post | null>(null);
  const [reportTarget, setReportTarget] = useState<{ type: 'post' | 'user' | 'service'; id: string; preview: string } | null>(null);

  // Fetch Public Data
  const loadPublicData = useCallback(async () => {
    try {
      const [u, p, c, s, aid, l, n] = await Promise.all([
        api.getUsers(),
        api.getPosts(),
        api.getCommunities(),
        api.getLegalServices(),
        api.getLegalAidProviders(),
        api.getLaws(),
        api.getLegalNews()
      ]);

      setUsers(u);
      setPosts(p);
      setCommunities(c);
      setLegalServices(s);
      setLegalAidProviders(aid);
      setLaws(l);
      setLegalNews(n);
    } catch (err) {
      console.error('Failed to load initial public data from backend:', err);
    }
  }, []);

  // Fetch User-Specific Authenticated Data
  const loadUserData = useCallback(async (user: User) => {
    try {
      const [apts, convs, notifs] = await Promise.all([
        api.getAppointments(),
        api.getConversations(),
        api.getNotifications()
      ]);

      setAppointments(apts);
      setConversations(convs);
      setNotifications(notifs);

      if (convs.length > 0 && !activeConversationId) {
        setActiveConversationId(convs[0].id);
        const msgs = await api.getMessages(convs[0].id);
        setMessages(msgs);
      }

      // Verifications (all for admin, own for advocate)
      try {
        const verifs = await api.getVerifications();
        setVerificationApplications(verifs);
      } catch {}

      // Admin only collections
      if (user.role === 'admin') {
        try {
          const [reps, logs] = await Promise.all([
            api.getReports(),
            api.getAuditLogs()
          ]);
          setReports(reps);
          setAuditLogs(logs);
        } catch {}
      }
    } catch (err) {
      console.error('Failed to load authenticated user data:', err);
    }
  }, [activeConversationId]);

  // Initial Auth Check & Boot
  useEffect(() => {
    let isMounted = true;

    async function init() {
      setIsLoading(true);
      await loadPublicData();

      if (initialAuthUser) {
        const mapped = mapAuthUserToAppUser(initialAuthUser);
        if (isMounted) {
          setCurrentUserState(mapped);
          await loadUserData(mapped);
        }
      } else {
        const existingToken = getStoredToken();
        if (existingToken) {
          try {
            const res = await api.getCurrentUser();
            if (isMounted && res.user) {
              setCurrentUserState(res.user);
              await loadUserData(res.user);
            }
          } catch {
            // Token expired or invalid
            if (isMounted) {
              setCurrentUserState(null);
            }
          }
        } else {
          if (isMounted) {
            setCurrentUserState(null);
          }
        }
      }

      if (isMounted) setIsLoading(false);
    }

    init();

    return () => {
      isMounted = false;
    };
  }, [loadPublicData, loadUserData, initialAuthUser]);

  // Load messages when activeConversationId changes
  useEffect(() => {
    if (!activeConversationId || !currentUser) return;
    let isMounted = true;
    api.getMessages(activeConversationId)
      .then(msgs => {
        if (isMounted) setMessages(msgs);
      })
      .catch(err => {
        console.warn('Failed to load messages for conversation:', err);
      });
    return () => {
      isMounted = false;
    };
  }, [activeConversationId, currentUser]);

  const refreshAllData = async () => {
    setIsLoading(true);
    await loadPublicData();
    if (currentUser) {
      await loadUserData(currentUser);
    }
    setIsLoading(false);
  };

  // Auth Modals
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
  const login = async (identifier: string, password: string = 'Password123!'): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      const res = await api.login(identifier, password);
      localStorage.removeItem('lex_hafi_logged_out');
      setGuestBrowsingState(false);
      setCurrentUserState(res.user);
      setIsAuthModalOpen(false);
      await loadUserData(res.user);
      await loadPublicData(); // refresh user list & counts
      return true;
    } catch (err) {
      console.error('Login error:', err);
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    localStorage.setItem('lex_hafi_logged_out', 'true');
    setGuestBrowsingState(false);
    setCurrentUserState(null);
    setAppointments([]);
    setConversations([]);
    setMessages([]);
    setNotifications([]);
    setReports([]);
    setVerificationApplications([]);
    setAuditLogs([]);
    setActiveView('feed');
    if (onLogout) {
      onLogout();
    }
  };

  // Register handler
  const register = async (data: {
    name: string;
    username: string;
    email: string;
    role: UserRole;
    password?: string;
    practiceAreas?: string[];
    barRollNumber?: string;
    firmName?: string;
    location?: string;
  }): Promise<boolean> => {
    setIsAuthLoading(true);
    try {
      const res = await api.register({
        name: data.name,
        username: data.username,
        email: data.email,
        role: data.role,
        password: data.password || 'Password123!',
        practiceAreas: data.practiceAreas,
        barRollNumber: data.barRollNumber,
        firmName: data.firmName,
        location: data.location
      });
      localStorage.removeItem('lex_hafi_logged_out');
      setGuestBrowsingState(false);
      setCurrentUserState(res.user);
      setIsAuthModalOpen(false);
      await loadUserData(res.user);
      await loadPublicData();
      return true;
    } catch (err) {
      console.error('Registration failed:', err);
      return false;
    } finally {
      setIsAuthLoading(false);
    }
  };

  // Switch persona with genuine server session token
  const setCurrentUser = async (user: User | null) => {
    if (!user) {
      await logout();
      return;
    }
    setIsAuthLoading(true);
    try {
      const res = await api.switchUser(user.id);
      localStorage.removeItem('lex_hafi_logged_out');
      setCurrentUserState(res.user);
      await loadUserData(res.user);
      await loadPublicData();
    } catch (err) {
      console.error('Failed to switch user session:', err);
    } finally {
      setIsAuthLoading(false);
    }
  };

  const updateCurrentUserProfile = async (updated: Partial<User>) => {
    if (!currentUser) return;
    try {
      const updatedUser = await api.updateProfile(updated);
      setCurrentUserState(updatedUser);
      setUsers(prev => prev.map(u => (u.id === currentUser.id ? updatedUser : u)));
    } catch (err) {
      console.error('Failed to update profile:', err);
    }
  };

  // Follow / Unfollow
  const toggleFollowUser = async (targetUserId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const result = await api.toggleFollow(targetUserId);
      setCurrentUserState(result.currentUser);
      setUsers(prev =>
        prev.map(u => {
          if (u.id === currentUser.id) return result.currentUser;
          if (u.id === targetUserId) return result.targetUser;
          return u;
        })
      );
    } catch (err) {
      console.error('Failed to toggle follow:', err);
    }
  };

  // Mute / Block User
  const muteUser = (targetUserId: string) => {
    if (!currentUser) return;
    const currentMuted = currentUser.mutedUserIds || [];
    const isMuted = currentMuted.includes(targetUserId);
    const newMuted = isMuted
      ? currentMuted.filter(id => id !== targetUserId)
      : [...currentMuted, targetUserId];
    updateCurrentUserProfile({ mutedUserIds: newMuted });
  };

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
  const createPost = async (
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

    try {
      const confirmedPost = await api.createPost({
        content,
        legalTopic,
        tags,
        attachments,
        audience,
        communityId
      });
      setPosts(prev => [confirmedPost, ...prev]);
      setCurrentUserState(prev => prev ? { ...prev, postsCount: prev.postsCount + 1 } : null);
      setUsers(prev => prev.map(u => u.id === currentUser.id ? { ...u, postsCount: u.postsCount + 1 } : u));
    } catch (err) {
      console.error('Failed to create post:', err);
    }
  };

  const deletePost = async (postId: string) => {
    if (!currentUser) return;
    try {
      await api.deletePost(postId);
      setPosts(prev => prev.filter(p => p.id !== postId));
      if (selectedPostForThread?.id === postId) {
        setSelectedPostForThread(null);
      }
    } catch (err) {
      console.error('Failed to delete post:', err);
    }
  };

  const editPost = async (postId: string, newContent: string) => {
    if (!currentUser) return;
    try {
      const updated = await api.updatePost(postId, newContent);
      setPosts(prev => prev.map(p => (p.id === postId ? updated : p)));
    } catch (err) {
      console.error('Failed to edit post:', err);
    }
  };

  const toggleLikePost = async (postId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const result = await api.toggleLikePost(postId);
      setPosts(prev => prev.map(p => (p.id === postId ? result.post : p)));
    } catch (err) {
      console.error('Failed to toggle like on post:', err);
    }
  };

  const toggleRepostPost = async (postId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const result = await api.toggleRepostPost(postId);
      setPosts(prev => prev.map(p => (p.id === postId ? result.post : p)));
    } catch (err) {
      console.error('Failed to toggle repost on post:', err);
    }
  };

  const toggleBookmarkPost = async (postId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const result = await api.toggleBookmarkPost(postId);
      setPosts(prev => prev.map(p => (p.id === postId ? result.post : p)));
    } catch (err) {
      console.error('Failed to toggle bookmark on post:', err);
    }
  };

  const createReply = async (postId: string, content: string, parentReplyId?: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const newReply = await api.createReply(postId, content, parentReplyId);
      setReplies(prev => [...prev, newReply]);
      setPosts(prev =>
        prev.map(p => (p.id === postId ? { ...p, repliesCount: p.repliesCount + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to create reply:', err);
    }
  };

  const createQuotePost = async (content: string, quotedPostId: string, legalTopic?: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const confirmedPost = await api.createPost({
        content,
        quotedPostId,
        legalTopic,
        tags: ['LegalPerspective']
      });
      setPosts(prev => [confirmedPost, ...prev]);
      setPosts(prev =>
        prev.map(p => (p.id === quotedPostId ? { ...p, quotesCount: p.quotesCount + 1 } : p))
      );
    } catch (err) {
      console.error('Failed to create quote post:', err);
    }
  };

  // Communities
  const toggleJoinCommunity = async (communityId: string) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const result = await api.toggleJoinCommunity(communityId);
      setCommunities(prev => prev.map(c => (c.id === communityId ? result.community : c)));
    } catch (err) {
      console.error('Failed to join community:', err);
    }
  };

  const createCommunity = async (data: {
    name: string;
    kigaliName?: string;
    topic: string;
    description: string;
    rules: string[];
    officialSource?: string;
  }) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const newComm = await api.createCommunity(data);
      setCommunities(prev => [newComm, ...prev]);
      setSelectedCommunityId(newComm.id);
    } catch (err) {
      console.error('Failed to create community:', err);
    }
  };

  // Legal Services
  const publishLegalService = async (data: {
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
    try {
      const newService = await api.publishLegalService(data);
      setLegalServices(prev => [newService, ...prev]);
    } catch (err) {
      console.error('Failed to publish legal service:', err);
    }
  };

  // Appointments
  const bookAppointment = async (
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
    try {
      const newApt = await api.bookAppointment({
        serviceId,
        advocateId,
        serviceTitle,
        date,
        timeSlot,
        format,
        feeRWF,
        clientNotes
      });
      setAppointments(prev => [newApt, ...prev]);
      const convs = await api.getConversations();
      setConversations(convs);
    } catch (err) {
      console.error('Failed to book appointment:', err);
    }
  };

  const updateAppointmentStatus = async (
    appointmentId: string,
    status: 'confirmed' | 'rescheduled' | 'completed' | 'cancelled',
    notes?: string
  ) => {
    if (!currentUser) return;
    try {
      const updated = await api.updateAppointmentStatus(appointmentId, status, notes);
      setAppointments(prev => prev.map(a => (a.id === appointmentId ? updated : a)));
    } catch (err) {
      console.error('Failed to update appointment status:', err);
    }
  };

  // Messaging
  const startOrGetConversationWithUser = async (otherUserId: string): Promise<string> => {
    if (!currentUser) {
      openLoginModal();
      return '';
    }
    try {
      const conv = await api.startConversation(otherUserId);
      setConversations(prev => {
        const exists = prev.some(c => c.id === conv.id);
        return exists ? prev : [conv, ...prev];
      });
      setActiveConversationId(conv.id);
      return conv.id;
    } catch (err) {
      console.error('Failed to get/start conversation:', err);
      return '';
    }
  };

  const sendMessage = async (
    conversationId: string,
    content: string,
    attachment?: { type: 'document' | 'image' | 'appointment_slip'; url: string; name: string }
  ) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const newMsg = await api.sendMessage(conversationId, content, attachment ? [attachment] : undefined);
      setMessages(prev => [...prev, newMsg]);
      const updatedConvs = await api.getConversations();
      setConversations(updatedConvs);
    } catch (err) {
      console.error('Failed to send message:', err);
    }
  };

  // Notifications
  const markNotificationAsRead = async (id: string) => {
    try {
      await api.markNotificationAsRead(id);
      setNotifications(prev => prev.map(n => (n.id === id ? { ...n, isRead: true } : n)));
    } catch (err) {
      console.error('Failed to mark notification read:', err);
    }
  };

  const markAllNotificationsAsRead = async () => {
    if (!currentUser) return;
    try {
      await api.markAllNotificationsAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      console.error('Failed to mark all notifications read:', err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      await api.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n.id !== id));
    } catch (err) {
      console.error('Failed to delete notification:', err);
    }
  };

  // Moderation & Trust
  const submitReport = async (
    targetType: 'post' | 'user' | 'service' | 'reply',
    targetId: string,
    targetPreview: string,
    category: ReportItem['category'],
    details: string
  ) => {
    if (!currentUser) {
      openLoginModal();
      return;
    }
    try {
      const rep = await api.submitReport({ targetType, targetId, targetPreview, category, details });
      setReports(prev => [rep, ...prev]);
    } catch (err) {
      console.error('Failed to submit report:', err);
    }
  };

  const resolveReport = async (reportId: string, actionTaken: boolean, moderatorNotes: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const resolved = await api.resolveReport(reportId, actionTaken, moderatorNotes);
      setReports(prev => prev.map(r => (r.id === reportId ? resolved : r)));
    } catch (err) {
      console.error('Failed to resolve report:', err);
    }
  };

  const submitVerificationApplication = async (data: {
    barRollNumber: string;
    lawFirmName: string;
    yearsOfExperience: number;
    practiceAreas: string[];
  }) => {
    if (!currentUser) return;
    try {
      const newApp = await api.submitVerification(data);
      setVerificationApplications(prev => [newApp, ...prev]);
    } catch (err) {
      console.error('Failed to submit verification:', err);
    }
  };

  const approveVerification = async (appId: string, notes?: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const updated = await api.reviewVerification(appId, 'approved', notes);
      setVerificationApplications(prev => prev.map(v => (v.id === appId ? updated : v)));
      await loadPublicData(); // refresh user verification status in list
    } catch (err) {
      console.error('Failed to approve verification:', err);
    }
  };

  const rejectVerification = async (appId: string, notes?: string) => {
    if (!currentUser || currentUser.role !== 'admin') return;
    try {
      const updated = await api.reviewVerification(appId, 'rejected', notes);
      setVerificationApplications(prev => prev.map(v => (v.id === appId ? updated : v)));
    } catch (err) {
      console.error('Failed to reject verification:', err);
    }
  };

  const resetDemoData = async () => {
    try {
      await api.resetDatabase();
      await refreshAllData();
    } catch (err) {
      console.error('Failed to reset database:', err);
    }
  };

  const unreadNotificationsCount = notifications.filter(n => !n.isRead).length;
  const unreadMessagesCount = conversations.reduce((acc, c) => {
    if (!currentUser) return acc;
    return acc + (c.unreadCountForUser[currentUser.id] || 0);
  }, 0);

  return (
    <AppContext.Provider
      value={{
        currentUser,
        users,
        isAuthenticated: !!currentUser,
        isLoading,
        isAuthLoading,
        isGuestBrowsing,
        setIsGuestBrowsing: setGuestBrowsingState,
        navigateToLanding,
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
        resetDemoData,
        refreshAllData
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
