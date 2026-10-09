export type UserRole = 'citizen' | 'advocate' | 'institution' | 'legalaid' | 'admin';

export type Language = 'en' | 'rw' | 'fr';

export interface User {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  avatarColor?: string;
  coverGradient?: string;
  coverImage?: string;
  role: UserRole;
  isVerified: boolean;
  verificationType?: 'bar_member' | 'official_institution' | 'legal_aid_bureau';
  barRollNumber?: string;
  professionalTitle?: string;
  institutionName?: string;
  bio: string;
  location: string;
  languages: string[];
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  followingIds?: string[];
  mutedUserIds?: string[];
  blockedUserIds?: string[];
  postsCount: number;
  practiceAreas?: string[];
  consultationFee?: number; // RWF
  consultationFormats?: ('in_person' | 'video' | 'phone')[];
  firmName?: string;
  officeAddress?: string;
  email?: string;
  phone?: string;
  password?: string;
}

export interface PostAttachment {
  type: 'image' | 'document' | 'law_reference';
  url: string;
  name: string;
  fileSize?: string;
  mimeType?: string;
  previewUrl?: string;
}

export interface Post {
  id: string;
  authorId: string;
  content: string;
  createdAt: string;
  updatedAt?: string;
  legalTopic?: string;
  tags: string[];
  audience: 'public' | 'followers';
  attachments?: PostAttachment[];
  likesCount: number;
  repliesCount: number;
  repostsCount: number;
  quotesCount: number;
  likedBy: string[]; // user IDs
  repostedBy: string[]; // user IDs
  bookmarkedBy: string[]; // user IDs
  isOfficialAnnouncement?: boolean;
  communityId?: string;
  quotedPostId?: string;
  quotedPost?: Post;
  parentId?: string; // If this post is a reply
}

export interface Reply {
  id: string;
  postId: string;
  authorId: string;
  content: string;
  createdAt: string;
  likesCount: number;
  likedBy: string[];
  parentReplyId?: string;
}

export interface Community {
  id: string;
  name: string;
  kigaliName?: string;
  slug: string;
  description: string;
  bannerImage?: string;
  bannerGradient?: string;
  icon: string;
  membersCount: number;
  joinedBy: string[];
  topic: string;
  rules: string[];
  officialSource?: string;
  moderatorId: string;
}

export interface LegalService {
  id: string;
  providerId: string;
  title: string;
  description: string;
  practiceArea: string;
  formats: ('in_person' | 'video' | 'phone')[];
  feeRWF: number;
  isFeeDisclosed: boolean;
  feeType: 'fixed' | 'hourly' | 'contingency_or_custom';
  turnaroundTime: string;
  locationProvince: 'Kigali City' | 'Northern Province' | 'Southern Province' | 'Eastern Province' | 'Western Province' | 'Nationwide';
  languages: string[];
  requirements: string[];
  rating: number;
  reviewsCount: number;
}

export interface Appointment {
  id: string;
  serviceId?: string;
  advocateId: string;
  clientId: string;
  serviceTitle: string;
  date: string;
  timeSlot: string;
  format: 'in_person' | 'video' | 'phone';
  feeRWF: number;
  status: 'pending' | 'confirmed' | 'rescheduled' | 'completed' | 'cancelled';
  clientNotes: string;
  advocateNotes?: string;
  locationDetails?: string;
  createdAt: string;
}

export interface LegalAidProvider {
  id: string;
  name: string;
  type: 'maj_bureau' | 'ngo_clinic' | 'university_clinic' | 'bar_pro_bono';
  district: string;
  province: string;
  address: string;
  phone: string;
  email: string;
  servicesOffered: string[];
  eligibilityCriteria: string[];
  requiredDocuments: string[];
  operatingHours: string;
  isFreeOfCharge: boolean;
  officialSource: string;
  lastVerifiedDate: string;
}

export interface LawDocument {
  id: string;
  title: string;
  titleKinyarwanda?: string;
  lawNumber: string; // e.g. Law N° 66/2018
  officialGazetteNumber: string; // e.g. Special of 30/08/2018
  effectiveDate: string;
  category: 'Labor' | 'Land & Property' | 'Commercial & Companies' | 'Criminal' | 'Family & Succession' | 'Data Protection & Tech' | 'Taxation';
  sourceInstitution: string;
  summaryEn: string;
  summaryRw: string;
  keyArticles: {
    articleNumber: string;
    heading: string;
    description: string;
  }[];
  pdfUrl?: string;
  isCurrent: boolean;
  amendmentNotes?: string;
}

export interface LegalNewsItem {
  id: string;
  title: string;
  titleRw?: string;
  publisherId: string;
  publisherName: string;
  publisherAvatar?: string;
  publishedAt: string;
  category: 'Ministry Communiqué' | 'Judiciary Circular' | 'Regulatory Update' | 'Public Legal Education' | 'Bar Association';
  summary: string;
  fullBody: string;
  officialSourceUrl?: string;
  isOfficialGazetteAlert: boolean;
  readTimeMinutes: number;
}

export interface Notification {
  id: string;
  recipientId: string;
  senderId: string;
  type: 'like' | 'reply' | 'repost' | 'quote' | 'follow' | 'message' | 'appointment' | 'official_update' | 'verification_update';
  referenceId?: string; // Post ID or appointment ID
  message: string;
  messageRw?: string;
  createdAt: string;
  isRead: boolean;
}

export interface Message {
  id: string;
  conversationId: string;
  senderId: string;
  content: string;
  createdAt: string;
  isRead: boolean;
  attachments?: {
    type: 'document' | 'image' | 'appointment_slip';
    url: string;
    name: string;
    size?: string;
  }[];
}

export interface Conversation {
  id: string;
  participantIds: string[];
  lastMessageSnippet: string;
  lastMessageAt: string;
  unreadCountForUser: Record<string, number>;
  isPrivilegedLegalNoticeAcknowledged: boolean;
}

export interface ReportItem {
  id: string;
  reporterId: string;
  targetType: 'post' | 'user' | 'service' | 'reply';
  targetId: string;
  targetPreview: string;
  category: 'fraud_impersonation' | 'unauthorized_legal_practice' | 'confidentiality_breach' | 'misleading_legal_advice' | 'harassment' | 'spam';
  details: string;
  createdAt: string;
  status: 'pending' | 'resolved_dismissed' | 'resolved_action_taken';
  moderatorNotes?: string;
}

export interface VerificationApplication {
  id: string;
  userId: string;
  fullName: string;
  barRollNumber: string;
  lawFirmName: string;
  yearsOfExperience: number;
  practiceAreas: string[];
  diplomaDocumentUrl: string;
  barCertificateUrl: string;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  reviewedAt?: string;
  moderatorNotes?: string;
}

export interface AdminAuditLog {
  id: string;
  adminId: string;
  action: string;
  target: string;
  timestamp: string;
  details: string;
}
