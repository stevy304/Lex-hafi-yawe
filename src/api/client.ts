import {
  User,
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
  UserRole,
  Story,
  MediaAsset,
  FeedPaginationResult
} from '../types';

const TOKEN_KEY = 'lex_hafi_auth_token';

export function getStoredToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setStoredToken(token: string | null) {
  try {
    if (token) {
      localStorage.setItem(TOKEN_KEY, token);
    } else {
      localStorage.removeItem(TOKEN_KEY);
    }
  } catch (e) {
    console.warn('Failed to update auth token in storage', e);
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = getStoredToken();
  const headers = new Headers(options.headers || {});

  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }

  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(`/api${endpoint}`, {
    ...options,
    headers
  });

  if (!response.ok) {
    let errorMessage = `Request failed (${response.status})`;
    try {
      const data = await response.json();
      if (data && data.error) {
        errorMessage = data.error;
      }
    } catch {
      // response wasn't JSON
    }
    throw new Error(errorMessage);
  }

  return response.json();
}

export const api = {
  // --- Auth ---
  login: async (identifier: string, password: string) => {
    const data = await request<{ user: User; token: string }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ identifier, password })
    });
    setStoredToken(data.token);
    return data;
  },

  switchUser: async (userId: string) => {
    const data = await request<{ user: User; token: string }>('/auth/switch-user', {
      method: 'POST',
      body: JSON.stringify({ userId })
    });
    setStoredToken(data.token);
    return data;
  },

  register: async (userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: UserRole;
    practiceAreas?: string[];
    barRollNumber?: string;
    firmName?: string;
    location?: string;
  }) => {
    const data = await request<{ user: User; token: string }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
    setStoredToken(data.token);
    return data;
  },

  getCurrentUser: async () => {
    return request<{ user: User }>('/auth/me');
  },

  logout: async () => {
    try {
      await request<{ success: boolean }>('/auth/logout', { method: 'POST' });
    } catch {
      // ignore
    } finally {
      setStoredToken(null);
    }
  },

  requestPasswordReset: async (identifier: string) => {
    return request<{ success: boolean; message: string; resetToken?: string; email?: string }>(
      '/auth/forgot-password',
      {
        method: 'POST',
        body: JSON.stringify({ identifier })
      }
    );
  },

  resetPassword: async (resetToken: string, newPassword: string) => {
    return request<{ success: boolean; message: string }>('/auth/reset-password', {
      method: 'POST',
      body: JSON.stringify({ resetToken, newPassword })
    });
  },

  // --- Users ---
  getUsers: async (query?: string) => {
    const q = query ? `?q=${encodeURIComponent(query)}` : '';
    return request<User[]>(`/users${q}`);
  },

  getUserById: async (id: string) => {
    return request<User>(`/users/${id}`);
  },

  updateProfile: async (updates: Partial<User>) => {
    return request<User>('/users/profile', {
      method: 'PATCH',
      body: JSON.stringify(updates)
    });
  },

  toggleFollow: async (targetUserId: string) => {
    return request<{ isFollowing: boolean; currentUser: User; targetUser: User }>(
      `/users/${targetUserId}/follow`,
      { method: 'POST' }
    );
  },

  // --- Posts ---
  getPosts: async (filters?: { topic?: string; tag?: string; authorId?: string; communityId?: string; q?: string }) => {
    const params = new URLSearchParams();
    if (filters?.topic && filters.topic !== 'all') params.set('topic', filters.topic);
    if (filters?.tag) params.set('tag', filters.tag);
    if (filters?.authorId) params.set('authorId', filters.authorId);
    if (filters?.communityId) params.set('communityId', filters.communityId);
    if (filters?.q) params.set('q', filters.q);

    const query = params.toString() ? `?${params.toString()}` : '';
    return request<Post[]>(`/posts${query}`);
  },

  getPostsPaginated: async (filters?: {
    topic?: string;
    tag?: string;
    authorId?: string;
    communityId?: string;
    q?: string;
    tab?: string;
    cursor?: string;
    limit?: number;
  }): Promise<FeedPaginationResult> => {
    const params = new URLSearchParams();
    params.set('format', 'paginated');
    if (filters?.topic && filters.topic !== 'all') params.set('topic', filters.topic);
    if (filters?.tag) params.set('tag', filters.tag);
    if (filters?.authorId) params.set('authorId', filters.authorId);
    if (filters?.communityId) params.set('communityId', filters.communityId);
    if (filters?.q) params.set('q', filters.q);
    if (filters?.tab) params.set('tab', filters.tab);
    if (filters?.cursor) params.set('cursor', filters.cursor);
    if (filters?.limit) params.set('limit', filters.limit.toString());

    return request<FeedPaginationResult>(`/posts?${params.toString()}`);
  },

  uploadMedia: (
    file: File,
    options?: {
      duration?: number;
      width?: number;
      height?: number;
      aspectRatio?: string;
      posterUrl?: string;
      onProgress?: (percent: number, loaded: number, total: number) => void;
    }
  ): Promise<{ url: string; mediaAsset: MediaAsset; name: string; size: number; mimeType: string }> => {
    return new Promise((resolve, reject) => {
      const token = getStoredToken();
      const xhr = new XMLHttpRequest();
      const formData = new FormData();

      formData.append('file', file);
      if (options?.duration) formData.append('duration', options.duration.toString());
      if (options?.width) formData.append('width', options.width.toString());
      if (options?.height) formData.append('height', options.height.toString());
      if (options?.aspectRatio) formData.append('aspectRatio', options.aspectRatio);
      if (options?.posterUrl) formData.append('posterUrl', options.posterUrl);

      xhr.open('POST', '/api/media/upload', true);
      if (token) {
        xhr.setRequestHeader('Authorization', `Bearer ${token}`);
      }

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable && options?.onProgress) {
          const percent = Math.round((event.loaded / event.total) * 100);
          options.onProgress(percent, event.loaded, event.total);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const data = JSON.parse(xhr.responseText);
            resolve(data);
          } catch (e) {
            reject(new Error('Invalid JSON response from server'));
          }
        } else {
          try {
            const err = JSON.parse(xhr.responseText);
            reject(new Error(err.error || `Upload failed with status ${xhr.status}`));
          } catch {
            reject(new Error(`Upload failed with status ${xhr.status}`));
          }
        }
      };

      xhr.onerror = () => {
        reject(new Error('Network error during media upload'));
      };

      xhr.send(formData);
    });
  },

  // --- Stories ---
  getStories: async (): Promise<Story[]> => {
    return request<Story[]>('/stories');
  },

  createStory: async (storyData: {
    mediaType: 'image' | 'video';
    mediaUrl: string;
    previewUrl?: string;
    caption?: string;
    duration?: number;
    storyType?: Story['storyType'];
    isOfficialGazetteAlert?: boolean;
  }): Promise<Story> => {
    return request<Story>('/stories', {
      method: 'POST',
      body: JSON.stringify(storyData)
    });
  },

  recordStoryView: async (id: string): Promise<{ viewsCount: number }> => {
    return request<{ viewsCount: number }>(`/stories/${id}/view`, {
      method: 'POST'
    });
  },

  deleteStory: async (id: string): Promise<{ success: boolean }> => {
    return request<{ success: boolean }>(`/stories/${id}`, {
      method: 'DELETE'
    });
  },

  getPostById: async (id: string) => {
    return request<Post>(`/posts/${id}`);
  },

  createPost: async (postData: {
    content: string;
    legalTopic?: string;
    tags?: string[];
    attachments?: Post['attachments'];
    audience?: 'public' | 'followers';
    communityId?: string;
    quotedPostId?: string;
  }) => {
    return request<Post>('/posts', {
      method: 'POST',
      body: JSON.stringify(postData)
    });
  },

  updatePost: async (id: string, content: string) => {
    return request<Post>(`/posts/${id}`, {
      method: 'PATCH',
      body: JSON.stringify({ content })
    });
  },

  deletePost: async (id: string) => {
    return request<{ success: boolean }>(`/posts/${id}`, {
      method: 'DELETE'
    });
  },

  toggleLikePost: async (id: string) => {
    return request<{ post: Post; liked: boolean }>(`/posts/${id}/like`, {
      method: 'POST'
    });
  },

  toggleRepostPost: async (id: string) => {
    return request<{ post: Post; reposted: boolean }>(`/posts/${id}/repost`, {
      method: 'POST'
    });
  },

  toggleBookmarkPost: async (id: string) => {
    return request<{ post: Post; bookmarked: boolean }>(`/posts/${id}/bookmark`, {
      method: 'POST'
    });
  },

  // --- Replies ---
  getReplies: async (postId: string) => {
    return request<Reply[]>(`/posts/${postId}/replies`);
  },

  createReply: async (postId: string, content: string, parentReplyId?: string) => {
    return request<Reply>(`/posts/${postId}/replies`, {
      method: 'POST',
      body: JSON.stringify({ content, parentReplyId })
    });
  },

  toggleReplyLike: async (replyId: string) => {
    return request<{ reply: Reply; liked: boolean }>(`/replies/${replyId}/like`, {
      method: 'POST'
    });
  },

  // --- Communities ---
  getCommunities: async () => {
    return request<Community[]>('/communities');
  },

  createCommunity: async (data: {
    name: string;
    kigaliName?: string;
    topic: string;
    description: string;
    rules: string[];
    officialSource?: string;
  }) => {
    return request<Community>('/communities', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  toggleJoinCommunity: async (id: string) => {
    return request<{ community: Community; joined: boolean }>(`/communities/${id}/join`, {
      method: 'POST'
    });
  },

  // --- Services ---
  getLegalServices: async () => {
    return request<LegalService[]>('/services');
  },

  publishLegalService: async (data: {
    title: string;
    description: string;
    practiceArea: string;
    feeRWF: number;
    formats: ('in_person' | 'video' | 'phone')[];
    turnaroundTime: string;
    locationProvince: LegalService['locationProvince'];
    requirements: string[];
  }) => {
    return request<LegalService>('/services', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // --- Appointments ---
  getAppointments: async () => {
    return request<Appointment[]>('/appointments');
  },

  bookAppointment: async (data: {
    serviceId?: string;
    advocateId: string;
    serviceTitle: string;
    date: string;
    timeSlot: string;
    format: 'in_person' | 'video' | 'phone';
    feeRWF: number;
    clientNotes: string;
  }) => {
    return request<Appointment>('/appointments', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  updateAppointmentStatus: async (
    id: string,
    status: Appointment['status'],
    notes?: string
  ) => {
    return request<Appointment>(`/appointments/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, notes })
    });
  },

  // --- Legal Aid & Laws & News ---
  getLegalAidProviders: async () => {
    return request<LegalAidProvider[]>('/legalaid');
  },

  getLaws: async (category?: string, query?: string) => {
    const params = new URLSearchParams();
    if (category && category !== 'All') params.set('category', category);
    if (query) params.set('q', query);
    const qStr = params.toString() ? `?${params.toString()}` : '';
    return request<LawDocument[]>(`/laws${qStr}`);
  },

  getLegalNews: async () => {
    return request<LegalNewsItem[]>('/news');
  },

  publishLegalNews: async (data: {
    title: string;
    titleRw?: string;
    category: LegalNewsItem['category'];
    summary: string;
    fullBody: string;
    isOfficialGazetteAlert: boolean;
    readTimeMinutes?: number;
    officialSourceUrl?: string;
  }) => {
    return request<LegalNewsItem>('/news', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  // --- Messaging ---
  getConversations: async () => {
    return request<Conversation[]>('/conversations');
  },

  startConversation: async (recipientId: string) => {
    return request<Conversation>('/conversations', {
      method: 'POST',
      body: JSON.stringify({ recipientId })
    });
  },

  getMessages: async (conversationId: string) => {
    return request<Message[]>(`/conversations/${conversationId}/messages`);
  },

  sendMessage: async (
    conversationId: string,
    content: string,
    attachments?: Message['attachments']
  ) => {
    return request<Message>(`/conversations/${conversationId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content, attachments })
    });
  },

  // --- Notifications ---
  getNotifications: async () => {
    return request<Notification[]>('/notifications');
  },

  markNotificationAsRead: async (id: string) => {
    return request<{ success: boolean }>(`/notifications/${id}/read`, {
      method: 'PATCH'
    });
  },

  markAllNotificationsAsRead: async () => {
    return request<{ success: boolean }>('/notifications/read-all', {
      method: 'PATCH'
    });
  },

  deleteNotification: async (id: string) => {
    return request<{ success: boolean }>(`/notifications/${id}`, {
      method: 'DELETE'
    });
  },

  // --- Verifications & Moderation ---
  getVerifications: async () => {
    return request<VerificationApplication[]>('/verifications');
  },

  submitVerification: async (data: {
    barRollNumber: string;
    lawFirmName: string;
    yearsOfExperience: number;
    practiceAreas: string[];
    diplomaDocumentUrl?: string;
    barCertificateUrl?: string;
  }) => {
    return request<VerificationApplication>('/verifications', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  reviewVerification: async (id: string, decision: 'approved' | 'rejected', notes?: string) => {
    return request<VerificationApplication>(`/verifications/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify({ decision, notes })
    });
  },

  getReports: async () => {
    return request<ReportItem[]>('/reports');
  },

  submitReport: async (data: {
    targetType: ReportItem['targetType'];
    targetId: string;
    targetPreview: string;
    category: ReportItem['category'];
    details: string;
  }) => {
    return request<ReportItem>('/reports', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  },

  resolveReport: async (id: string, actionTaken: boolean, notes: string) => {
    return request<ReportItem>(`/reports/${id}/resolve`, {
      method: 'PATCH',
      body: JSON.stringify({ actionTaken, notes })
    });
  },

  // --- Admin ---
  getAuditLogs: async () => {
    return request<AdminAuditLog[]>('/admin/audit-logs');
  },

  getAdminStats: async () => {
    return request<{
      totalUsers: number;
      verifiedAdvocates: number;
      pendingVerifications: number;
      totalPosts: number;
      pendingReports: number;
      totalAppointments: number;
      totalCommunities: number;
    }>('/admin/stats');
  },

  resetDatabase: async () => {
    return request<{ success: boolean; message: string }>('/dev/reset', {
      method: 'POST'
    });
  }
};
