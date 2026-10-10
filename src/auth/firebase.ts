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

export class FirebaseAuthService implements AuthService {
  async me(): Promise<User | null> {
    return null;
  }

  async loginWithPassword(i: { identifier: string; password: string }): Promise<User> {
    if (!i.identifier.includes('@')) {
      throw new AuthError('invalid_credentials', 'Email address required for Firebase authentication');
    }
    throw new AuthError('unknown', 'Firebase Auth provider not configured');
  }

  async requestOtp(_i: { phone: string }): Promise<{ retryAfter: number }> {
    throw new AuthError('unknown', 'Firebase Phone Auth not configured');
  }

  async verifyOtp(_i: { phone: string; code: string }): Promise<{ user: User; isNewUser?: boolean }> {
    throw new AuthError('otp_invalid', 'Firebase Phone Auth not configured');
  }

  async loginWithGoogleCode(_i: { code: string }): Promise<{ user: User; isNewUser?: boolean }> {
    throw new AuthError('oauth_failed', 'Firebase Google Auth not configured');
  }

  async registerEmail(_i: { email: string; password?: string; captchaToken?: string }): Promise<{ ok: boolean }> {
    throw new AuthError('unknown', 'Firebase Auth not configured');
  }

  async verifyEmailCode(_i: { code: string; email?: string }): Promise<User> {
    throw new AuthError('unknown', 'Firebase Auth not configured');
  }

  async checkHandleAvailable(_handle: string): Promise<{ available: boolean; suggestions?: string[] }> {
    return { available: true };
  }

  async getLegalVersions(): Promise<LegalVersions> {
    return { terms: 'v2026.1', privacy: 'v2026.1', minAge: 16 };
  }

  async submitConsent(_payload: ConsentPayload): Promise<void> {}

  async getOnboardingState(): Promise<OnboardingState> {
    return { step: 'profile', completed: false };
  }

  async updateOnboarding(_data: Partial<OnboardingState['data']> & { step?: OnboardingState['step'] }): Promise<OnboardingState> {
    return { step: 'profile', completed: false };
  }

  async completeOnboarding(): Promise<User> {
    throw new AuthError('unknown');
  }

  async updateUser(_data: Partial<User>): Promise<User> {
    throw new AuthError('unknown');
  }

  async getUserSettings(): Promise<UserSettings> {
    return {
      inAppLikes: true, inAppComments: true, inAppFollows: true, inAppMentions: true,
      inAppOfficialUpdates: true, inAppMessages: true, emailDigest: true, smsAlerts: false,
      whoCanMessageMe: 'everyone', showDistrictOnProfile: true,
    };
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return {
      inAppLikes: true, inAppComments: true, inAppFollows: true, inAppMentions: true,
      inAppOfficialUpdates: true, inAppMessages: true, emailDigest: true, smsAlerts: false,
      whoCanMessageMe: 'everyone', showDistrictOnProfile: true, ...settings
    };
  }

  async getSessions(): Promise<UserSession[]> {
    return [];
  }

  async revokeSession(_sessionId: string): Promise<void> {}
  async revokeOtherSessions(): Promise<void> {}
  async requestPasswordReset(_identifier: string): Promise<{ ok: boolean }> { return { ok: true }; }
  async resetPassword(_token: string, _newPassword: string): Promise<void> {}
  async changePassword(_current: string, _new: string): Promise<void> {}
  async getBlockedUsers(): Promise<Array<{ id: string; name: string; handle: string }>> { return []; }
  async blockUser(_userId: string): Promise<void> {}
  async unblockUser(_userId: string): Promise<void> {}
  async muteUser(_userId: string): Promise<void> {}
  async unmuteUser(_userId: string): Promise<void> {}
  async requestDataExport(): Promise<void> {}
  async getDataExportStatus(): Promise<ExportStatus> { return { status: 'preparing' }; }
  async requestAccountDeletion(_reauth: { password?: string; otpCode?: string }): Promise<DeletionResult> {
    return { scheduledFor: new Date(Date.now() + 30 * 86400000).toISOString() };
  }
  async cancelAccountDeletion(): Promise<void> {}
  async applyAdvocate(_data: any): Promise<AdvocateApplication> { throw new AuthError('unknown'); }
  async getAdvocateApplication(): Promise<AdvocateApplication | null> { return null; }
  async getAdminAdvocateApplications(): Promise<AdvocateApplication[]> { return []; }
  async decideAdvocateApplication(): Promise<void> {}
  async getAdminReports(): Promise<ReportItem[]> { return []; }
  async decideReport(): Promise<void> {}
  async getAdminAuditLogs(): Promise<AuditLog[]> { return []; }
  async submitSupportMessage(): Promise<{ ok: boolean }> { return { ok: true }; }
  async logout(): Promise<void> {}
}
