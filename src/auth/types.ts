export type Role = 'citizen' | 'advocate' | 'admin';

export interface User {
  id: string;
  name: string;
  handle: string;
  role: Role;
  avatarUrl?: string;
  onboardingCompleted: boolean;
  emailVerified: boolean;
  phoneVerified: boolean;
  hasPassword: boolean;
  email?: string;
  phone?: string; // masked by server
  district?: string;
  language: 'en' | 'rw' | 'fr';
  bio?: string;
  verifiedAdvocate?: boolean;
  isNewUser?: boolean;
  tourSeen?: boolean;
}

export type AuthErrorCode =
  | 'invalid_credentials'
  | 'rate_limited'
  | 'invalid_phone'
  | 'otp_invalid'
  | 'otp_expired'
  | 'oauth_failed'
  | 'network'
  | 'unknown'
  | 'email_unverified'
  | 'mfa_required'
  | 'weak_password'
  | 'handle_reserved'
  | 'consent_required'
  | 'age_not_confirmed'
  | 'captcha_failed'
  | 'reauth_required'
  | 'last_sign_in_method';

export class AuthError extends Error {
  constructor(
    public code: AuthErrorCode,
    message?: string,
    public retryAfter?: number
  ) {
    super(message ?? code);
    this.name = 'AuthError';
  }
}

export interface LegalVersions {
  terms: string;
  privacy: string;
  minAge: number;
}

export interface ConsentPayload {
  termsVersion: string;
  privacyVersion: string;
  ageConfirmed: boolean;
  marketing?: {
    updates?: boolean;
    digest?: boolean;
  };
}

export interface OnboardingState {
  step: 'profile' | 'consent' | 'interests' | 'follow' | 'done';
  completed: boolean;
  data?: {
    name?: string;
    handle?: string;
    district?: string;
    accountType?: 'citizen' | 'advocate' | 'institution';
    avatarUrl?: string;
    topics?: string[];
    followingIds?: string[];
  };
}

export interface UserSession {
  id: string;
  device: string;
  browser: string;
  ipMasked: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface UserSettings {
  inAppLikes: boolean;
  inAppComments: boolean;
  inAppFollows: boolean;
  inAppMentions: boolean;
  inAppOfficialUpdates: boolean;
  inAppMessages: boolean;
  emailDigest: boolean;
  smsAlerts: boolean;
  whoCanMessageMe: 'everyone' | 'following' | 'nobody';
  showDistrictOnProfile: boolean;
}

export interface AdvocateApplication {
  id: string;
  userId: string;
  fullName: string;
  barRollNumber: string;
  practiceAreas: string[];
  districts: string[];
  yearsOfExperience: number;
  email?: string;
  phone?: string;
  documents: Array<{ name: string; url: string; size: number }>;
  status: 'pending' | 'approved' | 'rejected';
  submittedAt: string;
  decisionNote?: string;
  decidedAt?: string;
  decidedBy?: string;
}

export interface ReportItem {
  id: string;
  targetId: string;
  targetType: 'post' | 'user';
  snippet: string;
  reason: string;
  reportCount: number;
  reporterCount: number;
  status: 'pending' | 'dismissed' | 'actioned';
  actionTaken?: 'hidden' | 'suspended';
  note?: string;
  createdAt: string;
}

export interface AuditLog {
  id: string;
  adminId: string;
  adminName: string;
  action: string;
  targetId: string;
  details?: string;
  timestamp: string;
}

export interface ExportStatus {
  status: 'preparing' | 'ready' | 'failed';
  downloadUrl?: string;
  expiresAt?: string;
}

export interface DeletionResult {
  scheduledFor: string;
}

export interface AuthService {
  me(): Promise<User | null>;
  loginWithPassword(i: { identifier: string; password: string }): Promise<User>;
  requestOtp(i: { phone: string }): Promise<{ retryAfter: number }>;
  verifyOtp(i: { phone: string; code: string }): Promise<{ user: User; isNewUser?: boolean }>;
  loginWithGoogleCode(i: { code: string }): Promise<{ user: User; isNewUser?: boolean }>;
  registerEmail(i: { email: string; password?: string; captchaToken?: string }): Promise<{ ok: boolean }>;
  verifyEmailCode(i: { code: string; email?: string }): Promise<User>;
  checkHandleAvailable(handle: string): Promise<{ available: boolean; suggestions?: string[] }>;
  getLegalVersions(): Promise<LegalVersions>;
  submitConsent(payload: ConsentPayload): Promise<void>;
  getOnboardingState(): Promise<OnboardingState>;
  updateOnboarding(data: Partial<OnboardingState['data']> & { step?: OnboardingState['step'] }): Promise<OnboardingState>;
  completeOnboarding(): Promise<User>;
  updateUser(data: Partial<User>): Promise<User>;
  getUserSettings(): Promise<UserSettings>;
  updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings>;
  getSessions(): Promise<UserSession[]>;
  revokeSession(sessionId: string): Promise<void>;
  revokeOtherSessions(): Promise<void>;
  requestPasswordReset(identifier: string): Promise<{ ok: boolean }>;
  resetPassword(token: string, newPassword: string): Promise<void>;
  changePassword(currentPassword: string, newPassword: string): Promise<void>;
  getBlockedUsers(): Promise<Array<{ id: string; name: string; handle: string }>>;
  blockUser(userId: string): Promise<void>;
  unblockUser(userId: string): Promise<void>;
  muteUser(userId: string): Promise<void>;
  unmuteUser(userId: string): Promise<void>;
  requestDataExport(): Promise<void>;
  getDataExportStatus(): Promise<ExportStatus>;
  requestAccountDeletion(reauth: { password?: string; otpCode?: string }): Promise<DeletionResult>;
  cancelAccountDeletion(): Promise<void>;
  applyAdvocate(data: Omit<AdvocateApplication, 'id' | 'userId' | 'status' | 'submittedAt'>): Promise<AdvocateApplication>;
  getAdvocateApplication(): Promise<AdvocateApplication | null>;
  getAdminAdvocateApplications(filter?: string): Promise<AdvocateApplication[]>;
  decideAdvocateApplication(id: string, decision: 'approved' | 'rejected', note?: string): Promise<void>;
  getAdminReports(): Promise<ReportItem[]>;
  decideReport(id: string, action: 'dismiss' | 'hide' | 'suspend', note?: string): Promise<void>;
  getAdminAuditLogs(): Promise<AuditLog[]>;
  submitSupportMessage(data: { name: string; email: string; message: string; captchaToken?: string }): Promise<{ ok: boolean }>;
  logout(): Promise<void>;
}
