import {
  AuthService,
  User,
  AuthError,
  LegalVersions,
  ConsentPayload,
  OnboardingState,
  UserSettings,
  UserSession,
  AdvocateApplication,
  ReportItem,
  AuditLog,
  ExportStatus,
  DeletionResult,
} from './types';
import { isValidPhone } from './phone';

function delay(minMs = 300, maxMs = 500): Promise<void> {
  const ms = Math.floor(Math.random() * (maxMs - minMs + 1)) + minMs;
  return new Promise((resolve) => setTimeout(resolve, ms));
}

const MOCK_CITIZEN: User = {
  id: 'usr_demo_citizen',
  name: 'Demo Citizen',
  handle: 'democitizen',
  role: 'citizen',
  avatarUrl: undefined,
  onboardingCompleted: true,
  emailVerified: true,
  phoneVerified: true,
  hasPassword: true,
  email: 'demo@lex.rw',
  phone: '+250 78• ••• •01',
  district: 'Gasabo',
  language: 'en',
  bio: 'Advocating for digital justice and legal literacy in Rwanda.',
};

const MOCK_ADVOCATE: User = {
  id: 'usr_demo_advocate',
  name: 'Advocate Demo',
  handle: 'advocatedemo',
  role: 'advocate',
  avatarUrl: undefined,
  onboardingCompleted: true,
  emailVerified: true,
  phoneVerified: true,
  hasPassword: true,
  email: 'advocate@lex.rw',
  phone: '+250 78• ••• •02',
  district: 'Nyarugenge',
  language: 'en',
  verifiedAdvocate: true,
  bio: 'Licensed Advocate with the Rwanda Bar Association. Corporate & Civil litigation.',
};

const MOCK_ADMIN: User = {
  id: 'usr_demo_admin',
  name: 'Admin Clarisse',
  handle: 'admin',
  role: 'admin',
  avatarUrl: undefined,
  onboardingCompleted: true,
  emailVerified: true,
  phoneVerified: true,
  hasPassword: true,
  email: 'admin@lex.rw',
  phone: '+250 78• ••• •03',
  district: 'Gasabo',
  language: 'en',
  bio: 'Lex Hafi Yawe Platform Administrator and Compliance Lead.',
};

const RESERVED_HANDLES = new Set([
  'admin',
  'administrator',
  'support',
  'help',
  'lex',
  'lexhafiyawe',
  'official',
  'moderator',
  'mod',
  'gov',
  'government',
  'moj',
  'rwanda',
  'system',
  'root',
  'api',
  'www',
  'null',
  'undefined',
  'demo',
  'democitizen',
  'advocate',
]);

let currentUser: User | null = null;
const failedAttempts: number[] = [];
let otpGeneratedAt: number | null = null;
let lastEmailPendingVerify: { email: string; code: string; expiresAt: number; password?: string } | null = null;

// Mock persistent storage
const SESSION_STORAGE_KEY = 'lex-mock-session';
const MOCK_ONBOARDING_KEY = 'lex-mock-onboarding';
const MOCK_SESSIONS_KEY = 'lex-mock-user-sessions';
const MOCK_APPLICATIONS_KEY = 'lex-mock-advocates';
const MOCK_REPORTS_KEY = 'lex-mock-reports';
const MOCK_AUDIT_KEY = 'lex-mock-audit';
const MOCK_SETTINGS_KEY = 'lex-mock-settings';
const MOCK_BLOCKS_KEY = 'lex-mock-blocks';

function getStoredJson<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined' || !window.sessionStorage) return defaultValue;
  try {
    const raw = sessionStorage.getItem(key);
    return raw ? JSON.parse(raw) : defaultValue;
  } catch {
    return defaultValue;
  }
}

function setStoredJson(key: string, value: any) {
  if (typeof window === 'undefined' || !window.sessionStorage) return;
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Ignore
  }
}

export class MockAuthService implements AuthService {
  async me(): Promise<User | null> {
    await delay(100, 200);
    if (currentUser) return currentUser;
    currentUser = getStoredJson<User | null>(SESSION_STORAGE_KEY, null);
    return currentUser;
  }

  async loginWithPassword(i: { identifier: string; password: string }): Promise<User> {
    await delay();
    const now = Date.now();

    while (failedAttempts.length > 0 && now - failedAttempts[0] > 60000) {
      failedAttempts.shift();
    }

    if (failedAttempts.length >= 5) {
      const elapsed = Math.floor((now - failedAttempts[0]) / 1000);
      throw new AuthError('rate_limited', undefined, Math.max(1, 30 - elapsed));
    }

    const id = i.identifier.trim().toLowerCase();
    const pw = i.password;

    if ((id === 'demo@lex.rw' || id === 'demo') && pw === 'Demo#2026') {
      currentUser = { ...MOCK_CITIZEN };
      failedAttempts.length = 0;
      setStoredJson(SESSION_STORAGE_KEY, currentUser);
      return currentUser;
    }

    if ((id === 'advocate@lex.rw' || id === 'advocate') && pw === 'Advocate#2026') {
      currentUser = { ...MOCK_ADVOCATE };
      failedAttempts.length = 0;
      setStoredJson(SESSION_STORAGE_KEY, currentUser);
      return currentUser;
    }

    if ((id === 'admin@lex.rw' || id === 'admin') && pw === 'Admin#2026') {
      currentUser = { ...MOCK_ADMIN };
      failedAttempts.length = 0;
      setStoredJson(SESSION_STORAGE_KEY, currentUser);
      return currentUser;
    }

    // Check if user was registered in session
    const registered = getStoredJson<User | null>('lex-mock-registered-user', null);
    if (registered && (registered.email?.toLowerCase() === id || registered.handle?.toLowerCase() === id) && pw === 'Demo#2026') {
      currentUser = registered;
      failedAttempts.length = 0;
      setStoredJson(SESSION_STORAGE_KEY, currentUser);
      return currentUser;
    }

    failedAttempts.push(now);
    if (failedAttempts.length >= 5) {
      throw new AuthError('rate_limited', undefined, 30);
    }

    throw new AuthError('invalid_credentials');
  }

  async requestOtp(i: { phone: string }): Promise<{ retryAfter: number }> {
    await delay();
    if (!isValidPhone(i.phone)) {
      throw new AuthError('invalid_phone');
    }
    otpGeneratedAt = Date.now();
    return { retryAfter: 30 };
  }

  async verifyOtp(i: { phone: string; code: string }): Promise<{ user: User; isNewUser?: boolean }> {
    await delay();
    const cleanCode = i.code.replace(/\D/g, '');

    if (!otpGeneratedAt || Date.now() - otpGeneratedAt > 3 * 60 * 1000) {
      throw new AuthError('otp_expired');
    }

    if (cleanCode !== '123456') {
      throw new AuthError('otp_invalid');
    }

    // Check if known existing phone
    if (i.phone === '+250788000001') {
      currentUser = { ...MOCK_CITIZEN, phone: '+250 78• ••• •01' };
      setStoredJson(SESSION_STORAGE_KEY, currentUser);
      otpGeneratedAt = null;
      return { user: currentUser, isNewUser: false };
    }

    // New phone user
    const suffix = i.phone.replace(/\D/g, '').slice(-4);
    currentUser = {
      id: `usr_phone_${suffix}`,
      name: `Citizen ${suffix}`,
      handle: `user_${suffix}`,
      role: 'citizen',
      onboardingCompleted: false,
      emailVerified: false,
      phoneVerified: true,
      hasPassword: false,
      phone: i.phone,
      language: 'en',
      isNewUser: true,
    };

    setStoredJson(SESSION_STORAGE_KEY, currentUser);
    otpGeneratedAt = null;
    return { user: currentUser, isNewUser: true };
  }

  async loginWithGoogleCode(_i: { code: string }): Promise<{ user: User; isNewUser?: boolean }> {
    await delay();
    currentUser = {
      id: 'usr_google_demo',
      name: 'Google User',
      handle: 'google_user',
      role: 'citizen',
      onboardingCompleted: false,
      emailVerified: true,
      phoneVerified: false,
      hasPassword: false,
      email: 'googleuser@gmail.com',
      language: 'en',
      isNewUser: true,
    };
    setStoredJson(SESSION_STORAGE_KEY, currentUser);
    return { user: currentUser, isNewUser: true };
  }

  async registerEmail(i: { email: string; password?: string; captchaToken?: string }): Promise<{ ok: boolean }> {
    await delay();
    const email = i.email.trim().toLowerCase();

    // Store pending verification
    lastEmailPendingVerify = {
      email,
      code: '123456',
      expiresAt: Date.now() + 10 * 60 * 1000,
      password: i.password,
    };

    // If taken@lex.rw, anti-enumeration returns identical success
    return { ok: true };
  }

  async verifyEmailCode(i: { code: string; email?: string }): Promise<User> {
    await delay();
    const cleanCode = i.code.replace(/\D/g, '');

    if (cleanCode !== '123456') {
      throw new AuthError('otp_invalid');
    }

    if (lastEmailPendingVerify && Date.now() > lastEmailPendingVerify.expiresAt) {
      throw new AuthError('otp_expired');
    }

    const email = i.email || lastEmailPendingVerify?.email || 'citizen@lex.rw';
    const usernamePart = email.split('@')[0].replace(/[^a-z0-9_]/g, '').slice(0, 15) || 'citizen';

    currentUser = {
      id: `usr_email_${Date.now()}`,
      name: usernamePart.charAt(0).toUpperCase() + usernamePart.slice(1),
      handle: usernamePart,
      role: 'citizen',
      onboardingCompleted: false,
      emailVerified: true,
      phoneVerified: false,
      hasPassword: !!lastEmailPendingVerify?.password,
      email,
      language: 'en',
      isNewUser: true,
    };

    setStoredJson(SESSION_STORAGE_KEY, currentUser);
    setStoredJson('lex-mock-registered-user', currentUser);
    return currentUser;
  }

  async checkHandleAvailable(handle: string): Promise<{ available: boolean; suggestions?: string[] }> {
    await delay(200, 300);
    const h = handle.trim().toLowerCase();

    if (RESERVED_HANDLES.has(h)) {
      return {
        available: false,
        suggestions: [`${h}_rw`, `${h}2026`, `${h}_kigali`],
      };
    }

    return { available: true };
  }

  async getLegalVersions(): Promise<LegalVersions> {
    return {
      terms: 'v2026.1',
      privacy: 'v2026.1',
      minAge: 16,
    };
  }

  async submitConsent(payload: ConsentPayload): Promise<void> {
    await delay();
    if (!payload.ageConfirmed) {
      throw new AuthError('age_not_confirmed');
    }
    setStoredJson('lex-mock-consent', { ...payload, consentedAt: new Date().toISOString() });
  }

  async getOnboardingState(): Promise<OnboardingState> {
    return getStoredJson<OnboardingState>(MOCK_ONBOARDING_KEY, {
      step: 'profile',
      completed: currentUser?.onboardingCompleted ?? false,
      data: {
        name: currentUser?.name,
        handle: currentUser?.handle,
        district: currentUser?.district,
      },
    });
  }

  async updateOnboarding(data: Partial<OnboardingState['data']> & { step?: OnboardingState['step'] }): Promise<OnboardingState> {
    await delay();
    const current = await this.getOnboardingState();
    const updated: OnboardingState = {
      step: data.step ?? current.step,
      completed: current.completed,
      data: { ...current.data, ...data },
    };
    setStoredJson(MOCK_ONBOARDING_KEY, updated);

    if (currentUser) {
      if (data.name) currentUser.name = data.name;
      if (data.handle) currentUser.handle = data.handle;
      if (data.district) currentUser.district = data.district;
      if (data.avatarUrl) currentUser.avatarUrl = data.avatarUrl;
      setStoredJson(SESSION_STORAGE_KEY, currentUser);
    }

    return updated;
  }

  async completeOnboarding(): Promise<User> {
    await delay();
    if (!currentUser) throw new AuthError('unknown');
    currentUser.onboardingCompleted = true;
    setStoredJson(SESSION_STORAGE_KEY, currentUser);

    const onb = await this.getOnboardingState();
    onb.completed = true;
    onb.step = 'done';
    setStoredJson(MOCK_ONBOARDING_KEY, onb);

    return currentUser;
  }

  async updateUser(data: Partial<User>): Promise<User> {
    await delay();
    if (!currentUser) throw new AuthError('unknown');
    currentUser = { ...currentUser, ...data };
    setStoredJson(SESSION_STORAGE_KEY, currentUser);
    return currentUser;
  }

  async getUserSettings(): Promise<UserSettings> {
    return getStoredJson<UserSettings>(MOCK_SETTINGS_KEY, {
      inAppLikes: true,
      inAppComments: true,
      inAppFollows: true,
      inAppMentions: true,
      inAppOfficialUpdates: true,
      inAppMessages: true,
      emailDigest: true,
      smsAlerts: false,
      whoCanMessageMe: 'everyone',
      showDistrictOnProfile: true,
    });
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    await delay();
    const current = await this.getUserSettings();
    const updated = { ...current, ...settings };
    setStoredJson(MOCK_SETTINGS_KEY, updated);
    return updated;
  }

  async getSessions(): Promise<UserSession[]> {
    return getStoredJson<UserSession[]>(MOCK_SESSIONS_KEY, [
      { id: 'sess_1', device: 'Current Browser (Chrome)', browser: 'Chrome 134 on Linux', ipMasked: '197.243.•••.••• (Kigali)', lastActive: 'Just now', isCurrent: true },
      { id: 'sess_2', device: 'Mobile App (Android)', browser: 'Lex Hafi Yawe Android 1.2', ipMasked: '105.178.•••.••• (Huye)', lastActive: '2 hours ago', isCurrent: false },
      { id: 'sess_3', device: 'Work Laptop (macOS)', browser: 'Safari 18.2 on macOS', ipMasked: '197.243.•••.••• (Kigali)', lastActive: 'Yesterday', isCurrent: false },
    ]);
  }

  async revokeSession(sessionId: string): Promise<void> {
    await delay();
    const sessions = (await this.getSessions()).filter((s) => s.id !== sessionId);
    setStoredJson(MOCK_SESSIONS_KEY, sessions);
  }

  async revokeOtherSessions(): Promise<void> {
    await delay();
    const sessions = (await this.getSessions()).filter((s) => s.isCurrent);
    setStoredJson(MOCK_SESSIONS_KEY, sessions);
  }

  async requestPasswordReset(_identifier: string): Promise<{ ok: boolean }> {
    await delay();
    return { ok: true };
  }

  async resetPassword(_token: string, newPassword: string): Promise<void> {
    await delay();
    if (newPassword.length < 10) throw new AuthError('weak_password');
    if (currentUser) {
      currentUser.hasPassword = true;
      setStoredJson(SESSION_STORAGE_KEY, currentUser);
    }
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await delay();
    if (currentPassword !== 'Demo#2026' && currentPassword !== 'Advocate#2026' && currentPassword !== 'Admin#2026') {
      throw new AuthError('invalid_credentials', 'Current password is incorrect');
    }
    if (newPassword.length < 10) throw new AuthError('weak_password');
    if (currentUser) {
      currentUser.hasPassword = true;
      setStoredJson(SESSION_STORAGE_KEY, currentUser);
    }
  }

  async getBlockedUsers(): Promise<Array<{ id: string; name: string; handle: string }>> {
    return getStoredJson(MOCK_BLOCKS_KEY, [
      { id: 'usr_spammer_1', name: 'Commercial Spammer', handle: 'spambot99' }
    ]);
  }

  async blockUser(userId: string): Promise<void> {
    await delay();
    const blocks = await this.getBlockedUsers();
    if (!blocks.some(b => b.id === userId)) {
      blocks.push({ id: userId, name: `User ${userId}`, handle: `user_${userId}` });
      setStoredJson(MOCK_BLOCKS_KEY, blocks);
    }
  }

  async unblockUser(userId: string): Promise<void> {
    await delay();
    const blocks = (await this.getBlockedUsers()).filter(b => b.id !== userId);
    setStoredJson(MOCK_BLOCKS_KEY, blocks);
  }

  async muteUser(_userId: string): Promise<void> {
    await delay();
  }

  async unmuteUser(_userId: string): Promise<void> {
    await delay();
  }

  async requestDataExport(): Promise<void> {
    await delay();
    setStoredJson('lex-mock-export', { status: 'preparing', requestedAt: Date.now() });
  }

  async getDataExportStatus(): Promise<ExportStatus> {
    const raw = getStoredJson<any>('lex-mock-export', null);
    if (!raw) return { status: 'preparing' };
    if (Date.now() - raw.requestedAt > 5000) {
      return {
        status: 'ready',
        downloadUrl: '/data/lex-hafi-yawe-data-export.zip',
        expiresAt: new Date(Date.now() + 24 * 3600 * 1000).toISOString(),
      };
    }
    return { status: 'preparing' };
  }

  async requestAccountDeletion(_reauth: { password?: string; otpCode?: string }): Promise<DeletionResult> {
    await delay();
    const scheduled = new Date(Date.now() + 30 * 24 * 3600 * 1000).toISOString();
    setStoredJson('lex-mock-deletion', { scheduledFor: scheduled });
    return { scheduledFor: scheduled };
  }

  async cancelAccountDeletion(): Promise<void> {
    await delay();
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem('lex-mock-deletion');
    }
  }

  async applyAdvocate(data: Omit<AdvocateApplication, 'id' | 'userId' | 'status' | 'submittedAt'>): Promise<AdvocateApplication> {
    await delay();
    if (!currentUser) throw new AuthError('unknown');
    const app: AdvocateApplication = {
      ...data,
      id: `app_${Date.now()}`,
      userId: currentUser.id,
      status: 'pending',
      submittedAt: new Date().toISOString(),
    };
    const all = getStoredJson<AdvocateApplication[]>(MOCK_APPLICATIONS_KEY, []);
    all.unshift(app);
    setStoredJson(MOCK_APPLICATIONS_KEY, all);
    return app;
  }

  async getAdvocateApplication(): Promise<AdvocateApplication | null> {
    if (!currentUser) return null;
    const all = getStoredJson<AdvocateApplication[]>(MOCK_APPLICATIONS_KEY, []);
    return all.find((a) => a.userId === currentUser?.id) || null;
  }

  async getAdminAdvocateApplications(filter?: string): Promise<AdvocateApplication[]> {
    const all = getStoredJson<AdvocateApplication[]>(MOCK_APPLICATIONS_KEY, [
      {
        id: 'app_seed_1',
        userId: 'usr_applicant_1',
        fullName: 'Me. Patrick Habimana',
        barRollNumber: 'RBA/2022/418',
        practiceAreas: ['land', 'commercial', 'civil'],
        districts: ['Gasabo', 'Kicukiro', 'Rwamagana'],
        yearsOfExperience: 6,
        email: 'p.habimana@lawrwanda.com',
        phone: '+250788112233',
        documents: [{ name: 'bar_certificate_rba.pdf', url: '#', size: 1240000 }],
        status: 'pending',
        submittedAt: new Date(Date.now() - 36 * 3600 * 1000).toISOString(),
      },
      {
        id: 'app_seed_2',
        userId: 'usr_applicant_2',
        fullName: 'Me. Claudine Mukamana',
        barRollNumber: 'RBA/2019/189',
        practiceAreas: ['family', 'criminal', 'labor'],
        districts: ['Huye', 'Nyanza'],
        yearsOfExperience: 9,
        email: 'claudine.m@barreau.rw',
        phone: '+250788445566',
        documents: [{ name: 'rba_diploma_license.pdf', url: '#', size: 980000 }],
        status: 'approved',
        submittedAt: new Date(Date.now() - 120 * 3600 * 1000).toISOString(),
        decidedAt: new Date(Date.now() - 72 * 3600 * 1000).toISOString(),
        decidedBy: 'Admin Clarisse',
      },
    ]);
    if (filter && filter !== 'all') {
      return all.filter((a) => a.status === filter);
    }
    return all;
  }

  async decideAdvocateApplication(id: string, decision: 'approved' | 'rejected', note?: string): Promise<void> {
    await delay();
    const all = await this.getAdminAdvocateApplications();
    const app = all.find((a) => a.id === id);
    if (app) {
      app.status = decision;
      app.decisionNote = note;
      app.decidedAt = new Date().toISOString();
      app.decidedBy = currentUser?.name || 'Admin';
      setStoredJson(MOCK_APPLICATIONS_KEY, all);

      // If deciding for current user or linked
      if (currentUser && app.userId === currentUser.id) {
        if (decision === 'approved') {
          currentUser.role = 'advocate';
          currentUser.verifiedAdvocate = true;
          setStoredJson(SESSION_STORAGE_KEY, currentUser);
        }
      }

      // Add audit log
      const logs = await this.getAdminAuditLogs();
      logs.unshift({
        id: `audit_${Date.now()}`,
        adminId: currentUser?.id || 'admin',
        adminName: currentUser?.name || 'Admin',
        action: `ADVOCATE_APPLICATION_${decision.toUpperCase()}`,
        targetId: id,
        details: `Decided application for ${app.fullName}: ${decision}. Note: ${note || 'None'}`,
        timestamp: new Date().toISOString(),
      });
      setStoredJson(MOCK_AUDIT_KEY, logs);
    }
  }

  async getAdminReports(): Promise<ReportItem[]> {
    return getStoredJson<ReportItem[]>(MOCK_REPORTS_KEY, [
      {
        id: 'rep_1',
        targetId: 'post_101',
        targetType: 'post',
        snippet: 'Misleading advice regarding land restitution decree in Musanze district...',
        reason: 'Legal misinformation / false official claim',
        reportCount: 4,
        reporterCount: 4,
        status: 'pending',
        createdAt: new Date(Date.now() - 5 * 3600 * 1000).toISOString(),
      },
      {
        id: 'rep_2',
        targetId: 'usr_bad_actor',
        targetType: 'user',
        snippet: '@fake_advocate: Solicits upfront fees for bogus court expedited bail...',
        reason: 'Impersonation of licensed advocate',
        reportCount: 7,
        reporterCount: 7,
        status: 'pending',
        createdAt: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
      },
    ]);
  }

  async decideReport(id: string, action: 'dismiss' | 'hide' | 'suspend', note?: string): Promise<void> {
    await delay();
    const reports = await this.getAdminReports();
    const rep = reports.find((r) => r.id === id);
    if (rep) {
      rep.status = action === 'dismiss' ? 'dismissed' : 'actioned';
      if (action === 'hide') rep.actionTaken = 'hidden';
      if (action === 'suspend') rep.actionTaken = 'suspended';
      rep.note = note;
      setStoredJson(MOCK_REPORTS_KEY, reports);

      const logs = await this.getAdminAuditLogs();
      logs.unshift({
        id: `audit_${Date.now()}`,
        adminId: currentUser?.id || 'admin',
        adminName: currentUser?.name || 'Admin',
        action: `REPORT_${action.toUpperCase()}`,
        targetId: id,
        details: `Action: ${action}. Reason: ${rep.reason}`,
        timestamp: new Date().toISOString(),
      });
      setStoredJson(MOCK_AUDIT_KEY, logs);
    }
  }

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    return getStoredJson<AuditLog[]>(MOCK_AUDIT_KEY, [
      {
        id: 'audit_init',
        adminId: 'admin_clarisse',
        adminName: 'Admin Clarisse',
        action: 'SYSTEM_BOOT',
        targetId: 'system',
        details: 'Audit log initialized for Lex Hafi Yawe Rwanda portal.',
        timestamp: new Date(Date.now() - 48 * 3600 * 1000).toISOString(),
      },
    ]);
  }

  async submitSupportMessage(_data: { name: string; email: string; message: string; captchaToken?: string }): Promise<{ ok: boolean }> {
    await delay();
    return { ok: true };
  }

  async logout(): Promise<void> {
    await delay(100, 200);
    currentUser = null;
    if (typeof window !== 'undefined' && window.sessionStorage) {
      sessionStorage.removeItem(SESSION_STORAGE_KEY);
      sessionStorage.removeItem('lex-mock-onboarding');
    }
  }
}
