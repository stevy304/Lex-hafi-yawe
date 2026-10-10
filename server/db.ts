import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
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
  Story,
  MediaAsset,
  FeedPaginationResult
} from '../src/types/index.js';
import {
  OFFICIAL_LAWS,
  OFFICIAL_LEGAL_AID_PROVIDERS,
  FOUNDATIONAL_COMMUNITIES
} from '../src/data/officialReferences.js';

export interface UserCredentials {
  userId: string;
  passwordHash: string;
  salt: string;
  resetToken?: string;
  resetTokenExpires?: number;
}

export interface UserSession {
  token: string;
  userId: string;
  createdAt: string;
  expiresAt: string;
}

export interface DatabaseSchema {
  users: User[];
  credentials: UserCredentials[];
  sessions: UserSession[];
  posts: Post[];
  replies: Reply[];
  communities: Community[];
  legalServices: LegalService[];
  appointments: Appointment[];
  legalAidProviders: LegalAidProvider[];
  laws: LawDocument[];
  legalNews: LegalNewsItem[];
  conversations: Conversation[];
  messages: Message[];
  notifications: Notification[];
  reports: ReportItem[];
  verificationApplications: VerificationApplication[];
  auditLogs: AdminAuditLog[];
  stories?: Story[];
  mediaAssets?: MediaAsset[];
}

const DATA_DIR = path.resolve(process.cwd(), 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

function hashPassword(password: string, salt: string): string {
  return crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
}

function generateInitialData(): DatabaseSchema {
  const adminSalt = crypto.randomBytes(16).toString('hex');
  const adminUser: User = {
    id: 'admin_lex_hafi',
    name: 'Clarisse Uwamahoro',
    username: 'clarisse_admin',
    email: 'admin@lexhafi.rw',
    role: 'admin',
    isVerified: true,
    verificationType: 'official_institution',
    professionalTitle: 'Platform Administrator & Compliance Lead',
    bio: 'Platform administration, credentials verification, and community trust lead for Lex Hafi Yawe.',
    location: 'Kigali, Rwanda',
    languages: ['Kinyarwanda', 'English', 'French'],
    joinedDate: 'Jan 2026',
    followersCount: 0,
    followingCount: 0,
    followingIds: [],
    mutedUserIds: [],
    blockedUserIds: [],
    postsCount: 0
  };

  const credentials: UserCredentials[] = [
    {
      userId: adminUser.id,
      salt: adminSalt,
      passwordHash: hashPassword('AdminPassword123!', adminSalt)
    }
  ];

  return {
    users: [adminUser],
    credentials,
    sessions: [],
    posts: [],
    replies: [],
    communities: JSON.parse(JSON.stringify(FOUNDATIONAL_COMMUNITIES)),
    legalServices: [],
    appointments: [],
    legalAidProviders: JSON.parse(JSON.stringify(OFFICIAL_LEGAL_AID_PROVIDERS)),
    laws: JSON.parse(JSON.stringify(OFFICIAL_LAWS)),
    legalNews: [],
    conversations: [],
    messages: [],
    notifications: [],
    reports: [],
    verificationApplications: [],
    auditLogs: [],
    stories: [],
    mediaAssets: []
  };
}

class Database {
  private data: DatabaseSchema;

  constructor() {
    if (!fs.existsSync(DATA_DIR)) {
      fs.mkdirSync(DATA_DIR, { recursive: true });
    }

    if (fs.existsSync(DB_FILE)) {
      try {
        const raw = fs.readFileSync(DB_FILE, 'utf-8');
        this.data = JSON.parse(raw);
        this.sanitizeDatabase();
      } catch (err) {
        console.error('Error reading existing database.json, generating initial database:', err);
        this.data = generateInitialData();
        this.persist();
      }
    } else {
      this.data = generateInitialData();
      this.persist();
    }
  }

  // Purge any residual mock/demo records from legacy runs
  private sanitizeDatabase() {
    const demoUserIds = new Set([
      'user_aline_advocate',
      'user_emmanuel_advocate',
      'user_minijust',
      'user_rba',
      'user_maj_gasabo',
      'user_eric_citizen'
    ]);

    // Keep only real registered users or admin
    this.data.users = this.data.users.filter(u => !demoUserIds.has(u.id));
    this.data.credentials = this.data.credentials.filter(c => !demoUserIds.has(c.userId));

    // Ensure admin user exists
    if (!this.data.users.some(u => u.role === 'admin')) {
      const adminSalt = crypto.randomBytes(16).toString('hex');
      const adminUser: User = {
        id: 'admin_lex_hafi',
        name: 'Clarisse Uwamahoro',
        username: 'clarisse_admin',
        email: 'admin@lexhafi.rw',
        role: 'admin',
        isVerified: true,
        verificationType: 'official_institution',
        professionalTitle: 'Platform Administrator & Compliance Lead',
        bio: 'Platform administration, credentials verification, and community trust lead for Lex Hafi Yawe.',
        location: 'Kigali, Rwanda',
        languages: ['Kinyarwanda', 'English', 'French'],
        joinedDate: 'Jan 2026',
        followersCount: 0,
        followingCount: 0,
        followingIds: [],
        mutedUserIds: [],
        blockedUserIds: [],
        postsCount: 0
      };
      this.data.users.unshift(adminUser);
      this.data.credentials.unshift({
        userId: adminUser.id,
        salt: adminSalt,
        passwordHash: hashPassword('AdminPassword123!', adminSalt)
      });
    }

    // Purge fake posts
    this.data.posts = this.data.posts.filter(p => !p.id.startsWith('post_1_') && !p.id.startsWith('post_2_') && !p.id.startsWith('post_3_') && !p.id.startsWith('post_4_') && !p.id.startsWith('post_5_') && !demoUserIds.has(p.authorId));

    // Purge fake replies
    this.data.replies = this.data.replies.filter(r => !r.id.startsWith('reply_') && !demoUserIds.has(r.authorId));

    // Purge fake legal services, fake news, fake appointments, fake conversations
    this.data.legalServices = this.data.legalServices.filter(s => !demoUserIds.has(s.providerId) && this.data.users.some(u => u.id === s.providerId));
    this.data.legalNews = this.data.legalNews.filter(n => !demoUserIds.has(n.publisherId) && this.data.users.some(u => u.id === n.publisherId));
    this.data.appointments = this.data.appointments.filter(a => 
      !demoUserIds.has(a.advocateId) && 
      !demoUserIds.has(a.clientId) &&
      this.data.users.some(u => u.id === a.advocateId) &&
      this.data.users.some(u => u.id === a.clientId)
    );
    this.data.conversations = this.data.conversations.filter(c => 
      !c.participantIds.some(id => demoUserIds.has(id)) &&
      c.participantIds.every(id => this.data.users.some(u => u.id === id))
    );
    const validConvIds = new Set(this.data.conversations.map(c => c.id));
    this.data.messages = this.data.messages.filter(m => 
      validConvIds.has(m.conversationId) && 
      !demoUserIds.has(m.senderId) && 
      this.data.users.some(u => u.id === m.senderId)
    );
    this.data.notifications = this.data.notifications.filter(n => 
      !demoUserIds.has(n.recipientId) && 
      this.data.users.some(u => u.id === n.recipientId)
    );

    // Purge fake reports and unlinked verifications
    this.data.reports = (this.data.reports || []).filter(r => 
      !demoUserIds.has(r.reporterId) && 
      this.data.users.some(u => u.id === r.reporterId) &&
      !r.id.startsWith('rep_1')
    );
    this.data.verificationApplications = (this.data.verificationApplications || []).filter(v => 
      this.data.users.some(u => u.id === v.userId) &&
      !v.id.startsWith('verif_app_1')
    );
    this.data.auditLogs = (this.data.auditLogs || []).filter(a => 
      this.data.users.some(u => u.id === a.adminId) &&
      !a.id.startsWith('audit_')
    );

    // Keep active unexpired stories (24h retention)
    const now = Date.now();
    this.data.stories = (this.data.stories || []).filter(s => 
      !demoUserIds.has(s.authorId) &&
      new Date(s.expiresAt).getTime() > now
    );
    this.data.mediaAssets = (this.data.mediaAssets || []).filter(m => !demoUserIds.has(m.ownerId));

    // Keep authentic official laws & providers
    this.data.laws = JSON.parse(JSON.stringify(OFFICIAL_LAWS));
    this.data.legalAidProviders = JSON.parse(JSON.stringify(OFFICIAL_LEGAL_AID_PROVIDERS));

    if (!this.data.communities || this.data.communities.length === 0) {
      this.data.communities = JSON.parse(JSON.stringify(FOUNDATIONAL_COMMUNITIES));
    } else {
      this.data.communities.forEach(c => {
        c.joinedBy = c.joinedBy.filter(id => !demoUserIds.has(id));
        c.membersCount = c.joinedBy.length;
      });
    }

    // Reconcile user statistics with real records
    this.data.users.forEach(u => {
      u.followingIds = (u.followingIds || []).filter(id => this.data.users.some(other => other.id === id));
      u.followingCount = u.followingIds.length;
      u.followersCount = this.data.users.filter(other => other.followingIds?.includes(u.id)).length;
      u.postsCount = this.data.posts.filter(p => p.authorId === u.id).length;
    });

    this.persist();
  }

  private persist() {
    try {
      const tempPath = `${DB_FILE}.${Date.now()}.tmp`;
      fs.writeFileSync(tempPath, JSON.stringify(this.data, null, 2), 'utf-8');
      fs.renameSync(tempPath, DB_FILE);
    } catch (err) {
      console.error('Failed to persist database to disk:', err);
    }
  }

  // --- Auth & Sessions ---

  public createSession(userId: string): string {
    const token = crypto.randomBytes(32).toString('hex');
    const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
    this.data.sessions.push({
      token,
      userId,
      createdAt: new Date().toISOString(),
      expiresAt
    });
    this.persist();
    return token;
  }

  public getSession(token: string): UserSession | null {
    const session = this.data.sessions.find(s => s.token === token);
    if (!session) return null;
    if (new Date(session.expiresAt).getTime() < Date.now()) {
      this.revokeSession(token);
      return null;
    }
    return session;
  }

  public revokeSession(token: string): void {
    this.data.sessions = this.data.sessions.filter(s => s.token !== token);
    this.persist();
  }

  public findUserByIdentifier(identifier: string): User | null {
    const clean = identifier.trim().toLowerCase().replace(/^@/, '');
    return this.data.users.find(u =>
      u.id.toLowerCase() === clean ||
      u.username.toLowerCase() === clean ||
      (u.email && u.email.toLowerCase() === clean)
    ) || null;
  }

  public authenticate(identifier: string, password: string): User | null {
    const user = this.findUserByIdentifier(identifier);
    if (!user) return null;

    const cred = this.data.credentials.find(c => c.userId === user.id);
    if (!cred) return null;

    const testHash = hashPassword(password, cred.salt);
    if (testHash === cred.passwordHash) {
      return user;
    }
    return null;
  }

  public registerUser(userData: {
    name: string;
    username: string;
    email: string;
    password: string;
    role: User['role'];
    practiceAreas?: string[];
    barRollNumber?: string;
    firmName?: string;
    location?: string;
  }): { user: User; token: string } {
    const cleanUsername = userData.username.toLowerCase().replace(/[^a-z0-9_]/g, '');
    const id = `user_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`;
    const salt = crypto.randomBytes(16).toString('hex');
    const passwordHash = hashPassword(userData.password, salt);

    const isAdvocate = userData.role === 'advocate';
    const isInstitution = userData.role === 'institution';

    const newUser: User = {
      id,
      name: userData.name.trim(),
      username: cleanUsername,
      email: userData.email.trim(),
      role: userData.role,
      isVerified: false, // Verification must be reviewed and approved
      verificationType: undefined,
      barRollNumber: isAdvocate ? userData.barRollNumber : undefined,
      firmName: isAdvocate ? (userData.firmName || 'Independent Chambers') : undefined,
      professionalTitle: isAdvocate
        ? 'Legal Counsel (Verification Pending)'
        : userData.role === 'legalaid'
        ? 'Legal Aid Officer'
        : isInstitution
        ? 'Institutional Entity'
        : 'Registered Citizen Member',
      bio: isAdvocate
        ? `Advocate practicing in Rwanda. Areas of practice: ${userData.practiceAreas?.join(', ') || 'Civil & Commercial Law'}.`
        : 'Member of Lex Hafi Yawe Rwanda digital justice platform.',
      location: userData.location || 'Kigali, Rwanda',
      languages: ['Kinyarwanda', 'English'],
      joinedDate: new Date().toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      followersCount: 0,
      followingCount: 2,
      followingIds: ['user_minijust', 'user_rba'],
      mutedUserIds: [],
      blockedUserIds: [],
      postsCount: 0,
      practiceAreas: isAdvocate ? (userData.practiceAreas || ['Commercial Law', 'Land & Property']) : undefined,
      consultationFee: isAdvocate ? 25000 : undefined,
      consultationFormats: isAdvocate ? ['in_person', 'video', 'phone'] : undefined
    };

    this.data.users.unshift(newUser);
    this.data.credentials.push({
      userId: id,
      salt,
      passwordHash
    });

    // If advocate, automatically register a pending verification application for review
    if (isAdvocate && userData.barRollNumber) {
      this.data.verificationApplications.unshift({
        id: `verif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
        userId: id,
        fullName: userData.name.trim(),
        barRollNumber: userData.barRollNumber,
        lawFirmName: userData.firmName || 'Chambers',
        yearsOfExperience: 3,
        practiceAreas: userData.practiceAreas || ['Commercial Law'],
        diplomaDocumentUrl: '#uploaded-diploma-certificate',
        barCertificateUrl: '#uploaded-rba-roll-cert',
        status: 'pending',
        submittedAt: new Date().toISOString()
      });
    }

    const token = this.createSession(id);
    this.persist();
    return { user: newUser, token };
  }

  public requestPasswordReset(identifier: string): { success: boolean; token?: string; email?: string } {
    const user = this.findUserByIdentifier(identifier);
    if (!user) return { success: false };

    const resetToken = crypto.randomBytes(16).toString('hex');
    const expires = Date.now() + 60 * 60 * 1000; // 1 hour

    let cred = this.data.credentials.find(c => c.userId === user.id);
    if (!cred) {
      const salt = crypto.randomBytes(16).toString('hex');
      cred = { userId: user.id, salt, passwordHash: hashPassword('Password123!', salt) };
      this.data.credentials.push(cred);
    }

    cred.resetToken = resetToken;
    cred.resetTokenExpires = expires;
    this.persist();

    return { success: true, token: resetToken, email: user.email };
  }

  public resetPassword(resetToken: string, newPassword: string): boolean {
    const cred = this.data.credentials.find(
      c => c.resetToken === resetToken && c.resetTokenExpires && c.resetTokenExpires > Date.now()
    );
    if (!cred) return false;

    cred.salt = crypto.randomBytes(16).toString('hex');
    cred.passwordHash = hashPassword(newPassword, cred.salt);
    cred.resetToken = undefined;
    cred.resetTokenExpires = undefined;

    // Revoke existing sessions for security
    this.data.sessions = this.data.sessions.filter(s => s.userId !== cred.userId);

    this.persist();
    return true;
  }

  // --- Users ---

  public getUsers(): User[] {
    return this.data.users;
  }

  public getUserById(id: string): User | null {
    return this.data.users.find(u => u.id === id) || null;
  }

  public updateUserProfile(userId: string, updates: Partial<User>): User | null {
    const index = this.data.users.findIndex(u => u.id === userId);
    if (index === -1) return null;

    // Disallow self-escalating role or verification directly
    const safeUpdates = { ...updates };
    delete safeUpdates.id;
    delete safeUpdates.role;
    delete safeUpdates.isVerified;
    delete safeUpdates.verificationType;

    this.data.users[index] = { ...this.data.users[index], ...safeUpdates };
    this.persist();
    return this.data.users[index];
  }

  public toggleFollow(currentUserId: string, targetUserId: string): { isFollowing: boolean; currentUser: User; targetUser: User } {
    const currentUser = this.getUserById(currentUserId);
    const targetUser = this.getUserById(targetUserId);
    if (!currentUser || !targetUser) throw new Error('User not found');
    if (currentUserId === targetUserId) throw new Error('Cannot follow self');

    const followingIds = currentUser.followingIds || [];
    const isFollowing = followingIds.includes(targetUserId);

    if (isFollowing) {
      currentUser.followingIds = followingIds.filter(id => id !== targetUserId);
      currentUser.followingCount = Math.max(0, currentUser.followingCount - 1);
      targetUser.followersCount = Math.max(0, targetUser.followersCount - 1);
    } else {
      currentUser.followingIds = [...followingIds, targetUserId];
      currentUser.followingCount += 1;
      targetUser.followersCount += 1;

      // Add notification
      this.createNotification({
        recipientId: targetUserId,
        senderId: currentUserId,
        type: 'follow',
        message: `${currentUser.name} followed your profile.`,
        messageRw: `${currentUser.name} yatangiye kugukurikira.`
      });
    }

    this.persist();
    return { isFollowing: !isFollowing, currentUser, targetUser };
  }

  // --- Posts ---

  public getPosts(filters?: { topic?: string; tag?: string; authorId?: string; communityId?: string; query?: string }): Post[] {
    let list = [...this.data.posts];

    if (filters?.communityId) {
      list = list.filter(p => p.communityId === filters.communityId);
    }
    if (filters?.authorId) {
      list = list.filter(p => p.authorId === filters.authorId);
    }
    if (filters?.topic && filters.topic !== 'all') {
      list = list.filter(p => p.legalTopic === filters.topic);
    }
    if (filters?.tag) {
      list = list.filter(p => p.tags.includes(filters.tag!));
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(p =>
        p.content.toLowerCase().includes(q) ||
        (p.legalTopic && p.legalTopic.toLowerCase().includes(q)) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Sort descending by date
    list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

    return list.map(p => ({
      ...p,
      quotedPost: p.quotedPostId ? this.getPostById(p.quotedPostId) || undefined : undefined,
      previewReplies: this.getReplies(p.id).slice(-2)
    }));
  }

  public getPostsPaginated(filters?: {
    topic?: string;
    tag?: string;
    authorId?: string;
    communityId?: string;
    query?: string;
    tab?: string;
    currentUserId?: string;
    cursor?: string;
    limit?: number;
  }): FeedPaginationResult {
    let list = [...this.data.posts];

    if (filters?.communityId) {
      list = list.filter(p => p.communityId === filters.communityId);
    }
    if (filters?.authorId) {
      list = list.filter(p => p.authorId === filters.authorId);
    }
    if (filters?.topic && filters.topic !== 'all') {
      list = list.filter(p => p.legalTopic === filters.topic);
    }
    if (filters?.tag) {
      list = list.filter(p => p.tags.includes(filters.tag!));
    }
    if (filters?.query) {
      const q = filters.query.toLowerCase();
      list = list.filter(p =>
        p.content.toLowerCase().includes(q) ||
        (p.legalTopic && p.legalTopic.toLowerCase().includes(q)) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    if (filters?.tab === 'following' && filters.currentUserId) {
      const user = this.getUserById(filters.currentUserId);
      const followingIds = user?.followingIds || [];
      list = list.filter(p => followingIds.includes(p.authorId) || p.authorId === filters.currentUserId);
    } else if (filters?.tab === 'advocates' || filters?.tab === 'professionals') {
      list = list.filter(p => {
        const author = this.getUserById(p.authorId);
        return author?.role === 'advocate' || author?.verificationType === 'bar_member' || author?.isVerified;
      });
    } else if (filters?.tab === 'official') {
      list = list.filter(p => {
        const author = this.getUserById(p.authorId);
        return p.isOfficialAnnouncement || author?.role === 'institution' || author?.verificationType === 'official_institution';
      });
    } else if (filters?.tab === 'communities') {
      list = list.filter(p => Boolean(p.communityId));
    }

    list.sort((a, b) => {
      const diff = new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      if (diff !== 0) return diff;
      return b.id.localeCompare(a.id);
    });

    const totalCount = list.length;
    const limit = filters?.limit ? Math.min(Math.max(filters.limit, 1), 50) : 15;

    let startIndex = 0;
    if (filters?.cursor) {
      try {
        const decoded = Buffer.from(filters.cursor, 'base64').toString('utf-8');
        const [cursorDate, cursorId] = decoded.split('|');
        const foundIndex = list.findIndex(p => {
          if (p.createdAt === cursorDate && p.id === cursorId) return true;
          return p.createdAt < cursorDate;
        });
        if (foundIndex !== -1) {
          startIndex = list[foundIndex].id === cursorId ? foundIndex + 1 : foundIndex;
        }
      } catch {
        startIndex = 0;
      }
    }

    const pageItems = list.slice(startIndex, startIndex + limit);
    const enriched = pageItems.map(p => ({
      ...p,
      quotedPost: p.quotedPostId ? this.getPostById(p.quotedPostId) || undefined : undefined,
      previewReplies: this.getReplies(p.id).slice(-2)
    }));

    const nextItem = list[startIndex + limit];
    let nextCursor: string | null = null;
    let hasMore = false;

    if (nextItem) {
      hasMore = true;
      nextCursor = Buffer.from(`${nextItem.createdAt}|${nextItem.id}`).toString('base64');
    }

    return {
      posts: enriched,
      nextCursor,
      hasMore,
      totalCount
    };
  }

  public getPostById(id: string): Post | null {
    const post = this.data.posts.find(p => p.id === id);
    if (!post) return null;
    return {
      ...post,
      quotedPost: post.quotedPostId ? this.data.posts.find(p => p.id === post.quotedPostId) || undefined : undefined,
      previewReplies: this.getReplies(post.id).slice(-2)
    };
  }

  public createPost(postData: {
    authorId: string;
    content: string;
    legalTopic?: string;
    tags?: string[];
    attachments?: Post['attachments'];
    audience?: 'public' | 'followers';
    communityId?: string;
    quotedPostId?: string;
    citations?: Post['citations'];
    documents?: Post['documents'];
    media?: Post['media'];
    lang?: Post['lang'];
  }): Post {
    const author = this.getUserById(postData.authorId);
    if (!author) throw new Error('Author not found');

    let quotedPost: Post | undefined;
    if (postData.quotedPostId) {
      quotedPost = this.getPostById(postData.quotedPostId) || undefined;
    }

    const newPost: Post = {
      id: `post_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      authorId: postData.authorId,
      content: postData.content,
      createdAt: new Date().toISOString(),
      legalTopic: postData.legalTopic || undefined,
      tags: postData.tags?.length ? postData.tags : ['LegalDiscussion', 'RwandaLaw'],
      audience: postData.audience || 'public',
      attachments: postData.attachments?.length ? postData.attachments : undefined,
      citations: postData.citations,
      documents: postData.documents,
      media: postData.media,
      lang: postData.lang || 'en',
      likesCount: 0,
      repliesCount: 0,
      repostsCount: 0,
      quotesCount: 0,
      likedBy: [],
      repostedBy: [],
      bookmarkedBy: [],
      communityId: postData.communityId,
      quotedPostId: postData.quotedPostId,
      quotedPost,
      isOfficialAnnouncement: author.role === 'institution'
    };

    this.data.posts.unshift(newPost);
    author.postsCount += 1;

    if (quotedPost && quotedPost.authorId !== postData.authorId) {
      quotedPost.quotesCount += 1;
      this.createNotification({
        recipientId: quotedPost.authorId,
        senderId: postData.authorId,
        type: 'quote',
        referenceId: newPost.id,
        message: `${author.name} quoted your legal post.`,
        messageRw: `${author.name} yasubiyemo ubutumwa bwawe abutangaho igitekerezo.`
      });
    }

    this.persist();
    return newPost;
  }

  public updatePost(postId: string, userId: string, content: string): Post | null {
    const post = this.getPostById(postId);
    if (!post) return null;
    const user = this.getUserById(userId);
    if (post.authorId !== userId && user?.role !== 'admin') {
      throw new Error('Not authorized to edit this post');
    }

    post.content = content;
    post.updatedAt = new Date().toISOString();
    this.persist();
    return post;
  }

  public deletePost(postId: string, userId: string): boolean {
    const post = this.getPostById(postId);
    if (!post) return false;
    const user = this.getUserById(userId);
    if (post.authorId !== userId && user?.role !== 'admin') {
      throw new Error('Not authorized to delete this post');
    }

    this.data.posts = this.data.posts.filter(p => p.id !== postId);
    const author = this.getUserById(post.authorId);
    if (author) {
      author.postsCount = Math.max(0, author.postsCount - 1);
    }
    this.persist();
    return true;
  }

  public toggleLike(postId: string, userId: string): { post: Post; liked: boolean } {
    const post = this.getPostById(postId);
    const user = this.getUserById(userId);
    if (!post || !user) throw new Error('Post or user not found');

    const hasLiked = post.likedBy.includes(userId);
    if (hasLiked) {
      post.likedBy = post.likedBy.filter(id => id !== userId);
      post.likesCount = Math.max(0, post.likesCount - 1);
    } else {
      post.likedBy.push(userId);
      post.likesCount += 1;

      if (post.authorId !== userId) {
        this.createNotification({
          recipientId: post.authorId,
          senderId: userId,
          type: 'like',
          referenceId: post.id,
          message: `${user.name} reacted to your post on "${post.legalTopic || 'Rwanda Law'}".`,
          messageRw: `${user.name} yakunze ubutumwa bwawe.`
        });
      }
    }

    this.persist();
    return { post, liked: !hasLiked };
  }

  public toggleRepost(postId: string, userId: string): { post: Post; reposted: boolean } {
    const post = this.getPostById(postId);
    const user = this.getUserById(userId);
    if (!post || !user) throw new Error('Post or user not found');

    const hasReposted = post.repostedBy.includes(userId);
    if (hasReposted) {
      post.repostedBy = post.repostedBy.filter(id => id !== userId);
      post.repostsCount = Math.max(0, post.repostsCount - 1);
    } else {
      post.repostedBy.push(userId);
      post.repostsCount += 1;

      if (post.authorId !== userId) {
        this.createNotification({
          recipientId: post.authorId,
          senderId: userId,
          type: 'repost',
          referenceId: post.id,
          message: `${user.name} reposted your legal post.`,
          messageRw: `${user.name} yongeye gutangaza ubutumwa bwawe.`
        });
      }
    }

    this.persist();
    return { post, reposted: !hasReposted };
  }

  public toggleBookmark(postId: string, userId: string): { post: Post; bookmarked: boolean } {
    const post = this.getPostById(postId);
    if (!post) throw new Error('Post not found');

    const hasBookmarked = post.bookmarkedBy.includes(userId);
    if (hasBookmarked) {
      post.bookmarkedBy = post.bookmarkedBy.filter(id => id !== userId);
    } else {
      post.bookmarkedBy.push(userId);
    }

    this.persist();
    return { post, bookmarked: !hasBookmarked };
  }

  // --- Replies ---

  public getReplies(postId: string): Reply[] {
    return this.data.replies.filter(r => r.postId === postId);
  }

  public createReply(postId: string, authorId: string, content: string, parentReplyId?: string): Reply {
    const post = this.getPostById(postId);
    const author = this.getUserById(authorId);
    if (!post || !author) throw new Error('Post or author not found');

    const newReply: Reply = {
      id: `reply_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      postId,
      authorId,
      content,
      createdAt: new Date().toISOString(),
      likesCount: 0,
      likedBy: [],
      parentReplyId
    };

    this.data.replies.push(newReply);
    post.repliesCount += 1;

    if (post.authorId !== authorId) {
      this.createNotification({
        recipientId: post.authorId,
        senderId: authorId,
        type: 'reply',
        referenceId: postId,
        message: `${author.name} replied to your legal post.`,
        messageRw: `${author.name} yatanze igitekerezo ku butumwa bwawe.`
      });
    }

    this.persist();
    return newReply;
  }

  public toggleReplyLike(replyId: string, userId: string): { reply: Reply; liked: boolean } {
    const reply = this.data.replies.find(r => r.id === replyId);
    if (!reply) throw new Error('Reply not found');

    const hasLiked = reply.likedBy.includes(userId);
    if (hasLiked) {
      reply.likedBy = reply.likedBy.filter(id => id !== userId);
      reply.likesCount = Math.max(0, reply.likesCount - 1);
    } else {
      reply.likedBy.push(userId);
      reply.likesCount += 1;
    }

    this.persist();
    return { reply, liked: !hasLiked };
  }

  // --- Communities ---

  public getCommunities(): Community[] {
    return this.data.communities;
  }

  public getCommunityById(id: string): Community | null {
    return this.data.communities.find(c => c.id === id) || null;
  }

  public createCommunity(userId: string, data: {
    name: string;
    kigaliName?: string;
    topic: string;
    description: string;
    rules: string[];
    officialSource?: string;
  }): Community {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const newCommunity: Community = {
      id: `comm_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      name: data.name,
      kigaliName: data.kigaliName,
      slug: data.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      description: data.description,
      bannerGradient: 'from-[#0F172A] via-[#1E293B] to-[#334155]',
      icon: 'Scale',
      membersCount: 1,
      joinedBy: [userId],
      topic: data.topic,
      rules: data.rules,
      officialSource: data.officialSource || 'Lex Hafi Yawe Community',
      moderatorId: userId
    };

    this.data.communities.unshift(newCommunity);
    this.persist();
    return newCommunity;
  }

  public toggleJoinCommunity(communityId: string, userId: string): { community: Community; joined: boolean } {
    const comm = this.getCommunityById(communityId);
    if (!comm) throw new Error('Community not found');

    const isJoined = comm.joinedBy.includes(userId);
    if (isJoined) {
      comm.joinedBy = comm.joinedBy.filter(id => id !== userId);
      comm.membersCount = Math.max(1, comm.membersCount - 1);
    } else {
      comm.joinedBy.push(userId);
      comm.membersCount += 1;
    }

    this.persist();
    return { community: comm, joined: !isJoined };
  }

  // --- Legal Services ---

  public getLegalServices(): LegalService[] {
    return this.data.legalServices;
  }

  public createLegalService(providerId: string, data: {
    title: string;
    description: string;
    practiceArea: string;
    feeRWF: number;
    formats: ('in_person' | 'video' | 'phone')[];
    turnaroundTime: string;
    locationProvince: LegalService['locationProvince'];
    requirements: string[];
  }): LegalService {
    const provider = this.getUserById(providerId);
    if (!provider) throw new Error('Provider not found');

    const newService: LegalService = {
      id: `serv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      providerId,
      title: data.title,
      description: data.description,
      practiceArea: data.practiceArea,
      feeRWF: data.feeRWF,
      isFeeDisclosed: true,
      feeType: 'fixed',
      formats: data.formats,
      turnaroundTime: data.turnaroundTime,
      locationProvince: data.locationProvince,
      languages: provider.languages || ['Kinyarwanda', 'English'],
      requirements: data.requirements,
      rating: 5.0,
      reviewsCount: 1
    };

    this.data.legalServices.unshift(newService);
    this.persist();
    return newService;
  }

  // --- Appointments ---

  public getAppointments(userId: string): Appointment[] {
    return this.data.appointments.filter(a => a.clientId === userId || a.advocateId === userId);
  }

  public createAppointment(clientId: string, data: {
    serviceId?: string;
    advocateId: string;
    serviceTitle: string;
    date: string;
    timeSlot: string;
    format: 'in_person' | 'video' | 'phone';
    feeRWF: number;
    clientNotes: string;
  }): Appointment {
    const client = this.getUserById(clientId);
    const advocate = this.getUserById(data.advocateId);
    if (!client || !advocate) throw new Error('Client or Advocate not found');

    const newAppointment: Appointment = {
      id: `apt_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      serviceId: data.serviceId,
      advocateId: data.advocateId,
      clientId,
      serviceTitle: data.serviceTitle,
      date: data.date,
      timeSlot: data.timeSlot,
      format: data.format,
      feeRWF: data.feeRWF,
      status: 'confirmed',
      clientNotes: data.clientNotes,
      createdAt: new Date().toISOString(),
      locationDetails: data.format === 'in_person' ? 'Chambers / Kigali Office' : 'Secure Lex Hafi Video Call'
    };

    this.data.appointments.unshift(newAppointment);

    // Notify advocate
    this.createNotification({
      recipientId: data.advocateId,
      senderId: clientId,
      type: 'appointment',
      referenceId: newAppointment.id,
      message: `${client.name} booked a consultation: "${data.serviceTitle}" for ${data.date} at ${data.timeSlot}.`,
      messageRw: `${client.name} yasabye inama: "${data.serviceTitle}" kuwa ${data.date} saa ${data.timeSlot}.`
    });

    // Start / update messaging conversation with appointment receipt
    const conv = this.getOrCreateConversation(clientId, data.advocateId);
    this.sendMessage(conv.id, clientId, `Hello Me. ${advocate.name.replace(/^Me\.\s*/, '')}! I have booked a legal consultation: "${data.serviceTitle}" scheduled for ${data.date} (${data.timeSlot}). Note: "${data.clientNotes || 'Case consultation request'}"`);

    this.persist();
    return newAppointment;
  }

  public updateAppointmentStatus(appointmentId: string, userId: string, status: Appointment['status'], notes?: string): Appointment {
    const apt = this.data.appointments.find(a => a.id === appointmentId);
    if (!apt) throw new Error('Appointment not found');
    if (apt.advocateId !== userId && apt.clientId !== userId) {
      throw new Error('Not authorized to update this appointment');
    }

    apt.status = status;
    if (notes) apt.advocateNotes = notes;

    const targetUserId = userId === apt.advocateId ? apt.clientId : apt.advocateId;
    this.createNotification({
      recipientId: targetUserId,
      senderId: userId,
      type: 'appointment',
      referenceId: apt.id,
      message: `Appointment status updated to "${status.toUpperCase()}" for ${apt.serviceTitle}.`,
      messageRw: `Imiterere ya gahunda yahinduwe kuri "${status.toUpperCase()}".`
    });

    this.persist();
    return apt;
  }

  // --- Legal Aid Providers & Laws ---

  public getLegalAidProviders(): LegalAidProvider[] {
    return this.data.legalAidProviders;
  }

  public getLaws(category?: string, query?: string): LawDocument[] {
    let list = [...this.data.laws];
    if (category && category !== 'All') {
      list = list.filter(l => l.category === category);
    }
    if (query) {
      const q = query.toLowerCase();
      list = list.filter(l =>
        l.title.toLowerCase().includes(q) ||
        (l.titleKinyarwanda && l.titleKinyarwanda.toLowerCase().includes(q)) ||
        l.lawNumber.toLowerCase().includes(q) ||
        l.summaryEn.toLowerCase().includes(q)
      );
    }
    return list;
  }

  // --- Legal News ---

  public getLegalNews(): LegalNewsItem[] {
    return this.data.legalNews;
  }

  public createLegalNews(publisherId: string, data: {
    title: string;
    titleRw?: string;
    category: LegalNewsItem['category'];
    summary: string;
    fullBody: string;
    isOfficialGazetteAlert: boolean;
    readTimeMinutes?: number;
    officialSourceUrl?: string;
  }): LegalNewsItem {
    const publisher = this.getUserById(publisherId);
    if (!publisher) throw new Error('Publisher not found');
    if (publisher.role !== 'institution' && publisher.role !== 'admin') {
      throw new Error('Only authorized institutional publishers and administrators can publish official legal circulars');
    }

    const newItem: LegalNewsItem = {
      id: `news_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      title: data.title,
      titleRw: data.titleRw,
      publisherId,
      publisherName: publisher.name,
      publisherAvatar: publisher.avatar,
      publishedAt: new Date().toISOString(),
      category: data.category,
      summary: data.summary,
      fullBody: data.fullBody,
      officialSourceUrl: data.officialSourceUrl,
      isOfficialGazetteAlert: data.isOfficialGazetteAlert,
      readTimeMinutes: data.readTimeMinutes || 3
    };

    this.data.legalNews.unshift(newItem);
    this.persist();
    return newItem;
  }

  // --- Messaging & Conversations ---

  public getConversations(userId: string): Conversation[] {
    return this.data.conversations
      .filter(c => c.participantIds.includes(userId))
      .sort((a, b) => new Date(b.lastMessageAt).getTime() - new Date(a.lastMessageAt).getTime());
  }

  public getConversationById(id: string, userId: string): Conversation | null {
    const conv = this.data.conversations.find(c => c.id === id);
    if (!conv) return null;
    if (!conv.participantIds.includes(userId)) throw new Error('Unauthorized to access this conversation');
    return conv;
  }

  public getOrCreateConversation(userId1: string, userId2: string): Conversation {
    const existing = this.data.conversations.find(
      c => c.participantIds.includes(userId1) && c.participantIds.includes(userId2)
    );
    if (existing) return existing;

    const newConv: Conversation = {
      id: `conv_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      participantIds: [userId1, userId2],
      lastMessageSnippet: 'Privileged legal conversation initiated.',
      lastMessageAt: new Date().toISOString(),
      unreadCountForUser: {
        [userId1]: 0,
        [userId2]: 0
      },
      isPrivilegedLegalNoticeAcknowledged: true
    };

    this.data.conversations.unshift(newConv);
    this.persist();
    return newConv;
  }

  public getMessages(conversationId: string, userId: string): Message[] {
    const conv = this.data.conversations.find(c => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');
    if (!conv.participantIds.includes(userId)) throw new Error('Unauthorized');

    // Mark unread for user as 0
    if (conv.unreadCountForUser[userId]) {
      conv.unreadCountForUser[userId] = 0;
      this.persist();
    }

    return this.data.messages.filter(m => m.conversationId === conversationId);
  }

  public sendMessage(conversationId: string, senderId: string, content: string, attachments?: Message['attachments']): Message {
    const conv = this.data.conversations.find(c => c.id === conversationId);
    if (!conv) throw new Error('Conversation not found');
    if (!conv.participantIds.includes(senderId)) throw new Error('Unauthorized');

    const newMsg: Message = {
      id: `msg_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      conversationId,
      senderId,
      content,
      createdAt: new Date().toISOString(),
      isRead: false,
      attachments
    };

    this.data.messages.push(newMsg);

    conv.lastMessageSnippet = content.slice(0, 60);
    conv.lastMessageAt = new Date().toISOString();

    const otherParticipant = conv.participantIds.find(id => id !== senderId);
    if (otherParticipant) {
      conv.unreadCountForUser[otherParticipant] = (conv.unreadCountForUser[otherParticipant] || 0) + 1;
    }

    this.persist();
    return newMsg;
  }

  // --- Notifications ---

  public getNotifications(userId: string): Notification[] {
    return this.data.notifications
      .filter(n => n.recipientId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createNotification(data: {
    recipientId: string;
    senderId: string;
    type: Notification['type'];
    message: string;
    messageRw?: string;
    referenceId?: string;
  }): Notification {
    const newNotif: Notification = {
      id: `notif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      recipientId: data.recipientId,
      senderId: data.senderId,
      type: data.type,
      message: data.message,
      messageRw: data.messageRw,
      referenceId: data.referenceId,
      createdAt: new Date().toISOString(),
      isRead: false
    };

    this.data.notifications.unshift(newNotif);
    this.persist();
    return newNotif;
  }

  public markNotificationAsRead(id: string, userId: string): boolean {
    const notif = this.data.notifications.find(n => n.id === id && n.recipientId === userId);
    if (!notif) return false;
    notif.isRead = true;
    this.persist();
    return true;
  }

  public markAllNotificationsAsRead(userId: string): void {
    this.data.notifications.forEach(n => {
      if (n.recipientId === userId) n.isRead = true;
    });
    this.persist();
  }

  public deleteNotification(id: string, userId: string): boolean {
    const before = this.data.notifications.length;
    this.data.notifications = this.data.notifications.filter(n => !(n.id === id && n.recipientId === userId));
    const deleted = this.data.notifications.length < before;
    if (deleted) this.persist();
    return deleted;
  }

  // --- Verifications & Moderation ---

  public getVerifications(userId?: string): VerificationApplication[] {
    if (userId) {
      const user = this.getUserById(userId);
      if (user?.role === 'admin') return this.data.verificationApplications;
      return this.data.verificationApplications.filter(v => v.userId === userId);
    }
    return this.data.verificationApplications;
  }

  public submitVerification(userId: string, data: {
    barRollNumber: string;
    lawFirmName: string;
    yearsOfExperience: number;
    practiceAreas: string[];
    diplomaDocumentUrl?: string;
    barCertificateUrl?: string;
  }): VerificationApplication {
    const user = this.getUserById(userId);
    if (!user) throw new Error('User not found');

    const app: VerificationApplication = {
      id: `verif_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      userId,
      fullName: user.name,
      barRollNumber: data.barRollNumber,
      lawFirmName: data.lawFirmName,
      yearsOfExperience: data.yearsOfExperience,
      practiceAreas: data.practiceAreas,
      diplomaDocumentUrl: data.diplomaDocumentUrl || '#verified-law-diploma',
      barCertificateUrl: data.barCertificateUrl || '#verified-rba-roll',
      status: 'pending',
      submittedAt: new Date().toISOString()
    };

    this.data.verificationApplications.unshift(app);
    this.persist();
    return app;
  }

  public reviewVerification(appId: string, adminId: string, decision: 'approved' | 'rejected', notes?: string): VerificationApplication {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Admin role required');

    const app = this.data.verificationApplications.find(v => v.id === appId);
    if (!app) throw new Error('Verification application not found');

    app.status = decision;
    app.reviewedAt = new Date().toISOString();
    app.moderatorNotes = notes;

    const applicant = this.getUserById(app.userId);
    if (applicant) {
      if (decision === 'approved') {
        applicant.isVerified = true;
        applicant.role = 'advocate';
        applicant.verificationType = 'bar_member';
        applicant.barRollNumber = app.barRollNumber;
        applicant.firmName = app.lawFirmName;
        applicant.professionalTitle = 'Advocate (Rwanda Bar Association)';
      }

      this.createNotification({
        recipientId: app.userId,
        senderId: adminId,
        type: 'verification_update',
        referenceId: app.id,
        message: decision === 'approved'
          ? `Congratulations! Your Rwanda Bar credentials (${app.barRollNumber}) have been verified by platform administrators.`
          : `Your verification application was reviewed: ${notes || 'Additional documentation requested.'}`
      });
    }

    this.addAuditLog(adminId, `VERIFICATION_${decision.toUpperCase()}`, `Advocate ID ${app.userId} (${app.barRollNumber})`, notes || 'Administrative roll review completed.');

    this.persist();
    return app;
  }

  public getReports(adminId: string): ReportItem[] {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Admin role required');
    return this.data.reports;
  }

  public submitReport(reporterId: string, data: {
    targetType: ReportItem['targetType'];
    targetId: string;
    targetPreview: string;
    category: ReportItem['category'];
    details: string;
  }): ReportItem {
    const report: ReportItem = {
      id: `report_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      reporterId,
      targetType: data.targetType,
      targetId: data.targetId,
      targetPreview: data.targetPreview,
      category: data.category,
      details: data.details,
      createdAt: new Date().toISOString(),
      status: 'pending'
    };

    this.data.reports.unshift(report);
    this.persist();
    return report;
  }

  public resolveReport(reportId: string, adminId: string, actionTaken: boolean, notes: string): ReportItem {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Admin role required');

    const report = this.data.reports.find(r => r.id === reportId);
    if (!report) throw new Error('Report not found');

    report.status = actionTaken ? 'resolved_action_taken' : 'resolved_dismissed';
    report.moderatorNotes = notes;

    this.addAuditLog(adminId, 'REPORT_RESOLUTION', `Report ${reportId} (${report.category})`, `Action taken: ${actionTaken}. Notes: ${notes}`);

    this.persist();
    return report;
  }

  // --- Audit Logs ---

  public getAuditLogs(adminId: string): AdminAuditLog[] {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Admin role required');
    return this.data.auditLogs;
  }

  public addAuditLog(adminId: string, action: string, target: string, details: string): AdminAuditLog {
    const log: AdminAuditLog = {
      id: `audit_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      adminId,
      action,
      target,
      timestamp: new Date().toISOString(),
      details
    };

    this.data.auditLogs.unshift(log);
    this.persist();
    return log;
  }

  // --- Admin Stats ---

  public getAdminStats(adminId: string) {
    const admin = this.getUserById(adminId);
    if (!admin || admin.role !== 'admin') throw new Error('Admin role required');

    return {
      totalUsers: this.data.users.length,
      verifiedAdvocates: this.data.users.filter(u => u.role === 'advocate' && u.isVerified).length,
      pendingVerifications: this.data.verificationApplications.filter(v => v.status === 'pending').length,
      totalPosts: this.data.posts.length,
      pendingReports: this.data.reports.filter(r => r.status === 'pending').length,
      totalAppointments: this.data.appointments.length,
      totalCommunities: this.data.communities.length
    };
  }

  // --- Stories & Legal Bulletins ---

  public getStories(currentUserId?: string): Story[] {
    const now = Date.now();
    // Enforce 24-hour server-side expiration policy
    this.data.stories = (this.data.stories || []).filter(s => new Date(s.expiresAt).getTime() > now);
    return [...this.data.stories].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  public createStory(authorId: string, data: {
    mediaType: 'image' | 'video';
    mediaUrl: string;
    previewUrl?: string;
    caption?: string;
    duration?: number;
    storyType?: Story['storyType'];
    isOfficialGazetteAlert?: boolean;
  }): Story {
    const user = this.getUserById(authorId);
    if (!user) throw new Error('User not found');

    let resolvedType: Story['storyType'] = 'community_story';
    // Only authorized institutions or admins can post official bulletins
    if (user.role === 'institution' || user.role === 'admin' || user.verificationType === 'official_institution') {
      resolvedType = 'official_bulletin';
    } else if (user.role === 'advocate' || user.verificationType === 'bar_member') {
      resolvedType = 'advocate_story';
    }

    const newStory: Story = {
      id: `story_${Date.now()}_${crypto.randomBytes(3).toString('hex')}`,
      authorId,
      mediaType: data.mediaType,
      mediaUrl: data.mediaUrl,
      previewUrl: data.previewUrl,
      caption: data.caption,
      createdAt: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      duration: Math.min(data.duration || (data.mediaType === 'video' ? 15 : 6), 15),
      viewsCount: 0,
      viewedBy: [],
      storyType: resolvedType,
      isOfficialGazetteAlert: !!data.isOfficialGazetteAlert
    };

    if (!this.data.stories) this.data.stories = [];
    this.data.stories.unshift(newStory);
    this.persist();
    return newStory;
  }

  public recordStoryView(storyId: string, viewerId: string): { viewsCount: number } {
    if (!this.data.stories) return { viewsCount: 0 };
    const story = this.data.stories.find(s => s.id === storyId);
    if (!story) return { viewsCount: 0 };

    if (!story.viewedBy.includes(viewerId)) {
      story.viewedBy.push(viewerId);
      story.viewsCount = story.viewedBy.length;
      this.persist();
    }
    return { viewsCount: story.viewsCount };
  }

  public deleteStory(storyId: string, userId: string): boolean {
    if (!this.data.stories) return false;
    const storyIndex = this.data.stories.findIndex(s => s.id === storyId);
    if (storyIndex === -1) return false;

    const story = this.data.stories[storyIndex];
    const user = this.getUserById(userId);
    if (story.authorId !== userId && user?.role !== 'admin') {
      throw new Error('Permission denied to delete this story');
    }

    this.data.stories.splice(storyIndex, 1);
    this.persist();
    return true;
  }

  // --- Media Assets ---

  public saveMediaAsset(asset: MediaAsset): MediaAsset {
    if (!this.data.mediaAssets) this.data.mediaAssets = [];
    this.data.mediaAssets.push(asset);
    this.persist();
    return asset;
  }

  public getMediaAsset(id: string): MediaAsset | null {
    if (!this.data.mediaAssets) return null;
    return this.data.mediaAssets.find(m => m.id === id) || null;
  }

  // --- Reset/Seed ---

  public resetToInitial(): void {
    this.data = generateInitialData();
    this.persist();
  }
}

export const db = new Database();
