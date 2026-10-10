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
import { apiFetch } from './api';

export class RestAuthService implements AuthService {
  async me(): Promise<User | null> {
    try {
      const data = await apiFetch<{ user: User }>('/api/auth/me', {
        method: 'GET',
        skipSessionExpiredCheck: true,
      });
      return data?.user ?? null;
    } catch (err: any) {
      if (err instanceof AuthError && (err.code === 'invalid_credentials' || err.code === 'unknown')) {
        return null;
      }
      return null;
    }
  }

  async loginWithPassword(i: { identifier: string; password: string }): Promise<User> {
    const data = await apiFetch<{ user: User }>('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify(i),
      skipSessionExpiredCheck: true,
    });
    return data.user;
  }

  async requestOtp(i: { phone: string }): Promise<{ retryAfter: number }> {
    const data = await apiFetch<{ retryAfter: number }>('/api/auth/otp/request', {
      method: 'POST',
      body: JSON.stringify(i),
      skipSessionExpiredCheck: true,
    });
    return { retryAfter: data?.retryAfter ?? 30 };
  }

  async verifyOtp(i: { phone: string; code: string }): Promise<{ user: User; isNewUser?: boolean }> {
    const data = await apiFetch<{ user: User; isNewUser?: boolean }>('/api/auth/otp/verify', {
      method: 'POST',
      body: JSON.stringify(i),
      skipSessionExpiredCheck: true,
    });
    return data;
  }

  async loginWithGoogleCode(i: { code: string }): Promise<{ user: User; isNewUser?: boolean }> {
    const data = await apiFetch<{ user: User; isNewUser?: boolean }>('/api/auth/google', {
      method: 'POST',
      body: JSON.stringify(i),
      skipSessionExpiredCheck: true,
    });
    return data;
  }

  async registerEmail(i: { email: string; password?: string; captchaToken?: string }): Promise<{ ok: boolean }> {
    return await apiFetch<{ ok: boolean }>('/api/auth/register', {
      method: 'POST',
      body: JSON.stringify({ method: 'email', ...i }),
      skipSessionExpiredCheck: true,
    });
  }

  async verifyEmailCode(i: { code: string; email?: string }): Promise<User> {
    const data = await apiFetch<{ user: User }>('/api/auth/email/verify/confirm', {
      method: 'POST',
      body: JSON.stringify(i),
      skipSessionExpiredCheck: true,
    });
    return data.user;
  }

  async checkHandleAvailable(handle: string): Promise<{ available: boolean; suggestions?: string[] }> {
    return await apiFetch<{ available: boolean; suggestions?: string[] }>(`/api/auth/handle-available?handle=${encodeURIComponent(handle)}`);
  }

  async getLegalVersions(): Promise<LegalVersions> {
    return await apiFetch<LegalVersions>('/api/legal/versions');
  }

  async submitConsent(payload: ConsentPayload): Promise<void> {
    await apiFetch<void>('/api/consents', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  }

  async getOnboardingState(): Promise<OnboardingState> {
    return await apiFetch<OnboardingState>('/api/onboarding');
  }

  async updateOnboarding(data: Partial<OnboardingState['data']> & { step?: OnboardingState['step'] }): Promise<OnboardingState> {
    return await apiFetch<OnboardingState>('/api/onboarding', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  }

  async completeOnboarding(): Promise<User> {
    const res = await apiFetch<{ user: User }>('/api/onboarding/complete', {
      method: 'POST',
    });
    return res.user;
  }

  async updateUser(data: Partial<User>): Promise<User> {
    const res = await apiFetch<{ user: User }>('/api/users/me', {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    return res.user;
  }

  async getUserSettings(): Promise<UserSettings> {
    return await apiFetch<UserSettings>('/api/users/me/settings');
  }

  async updateUserSettings(settings: Partial<UserSettings>): Promise<UserSettings> {
    return await apiFetch<UserSettings>('/api/users/me/settings', {
      method: 'PATCH',
      body: JSON.stringify(settings),
    });
  }

  async getSessions(): Promise<UserSession[]> {
    return await apiFetch<UserSession[]>('/api/auth/sessions');
  }

  async revokeSession(sessionId: string): Promise<void> {
    await apiFetch<void>(`/api/auth/sessions/${sessionId}`, {
      method: 'DELETE',
    });
  }

  async revokeOtherSessions(): Promise<void> {
    await apiFetch<void>('/api/auth/sessions/revoke-others', {
      method: 'POST',
    });
  }

  async requestPasswordReset(identifier: string): Promise<{ ok: boolean }> {
    return await apiFetch<{ ok: boolean }>('/api/auth/password/forgot', {
      method: 'POST',
      body: JSON.stringify({ identifier }),
    });
  }

  async resetPassword(token: string, newPassword: string): Promise<void> {
    await apiFetch<void>('/api/auth/password/reset', {
      method: 'POST',
      body: JSON.stringify({ token, newPassword }),
    });
  }

  async changePassword(currentPassword: string, newPassword: string): Promise<void> {
    await apiFetch<void>('/api/auth/password/change', {
      method: 'POST',
      body: JSON.stringify({ currentPassword, newPassword }),
    });
  }

  async getBlockedUsers(): Promise<Array<{ id: string; name: string; handle: string }>> {
    return await apiFetch<Array<{ id: string; name: string; handle: string }>>('/api/blocks');
  }

  async blockUser(userId: string): Promise<void> {
    await apiFetch<void>(`/api/users/${userId}/block`, { method: 'POST' });
  }

  async unblockUser(userId: string): Promise<void> {
    await apiFetch<void>(`/api/users/${userId}/block`, { method: 'DELETE' });
  }

  async muteUser(userId: string): Promise<void> {
    await apiFetch<void>(`/api/users/${userId}/mute`, { method: 'POST' });
  }

  async unmuteUser(userId: string): Promise<void> {
    await apiFetch<void>(`/api/users/${userId}/mute`, { method: 'DELETE' });
  }

  async requestDataExport(): Promise<void> {
    await apiFetch<void>('/api/users/me/export', { method: 'POST' });
  }

  async getDataExportStatus(): Promise<ExportStatus> {
    return await apiFetch<ExportStatus>('/api/users/me/export/status');
  }

  async requestAccountDeletion(reauth: { password?: string; otpCode?: string }): Promise<DeletionResult> {
    return await apiFetch<DeletionResult>('/api/users/me', {
      method: 'DELETE',
      body: JSON.stringify({ reauth }),
    });
  }

  async cancelAccountDeletion(): Promise<void> {
    await apiFetch<void>('/api/users/me/deletion/cancel', { method: 'POST' });
  }

  async applyAdvocate(data: Omit<AdvocateApplication, 'id' | 'userId' | 'status' | 'submittedAt'>): Promise<AdvocateApplication> {
    return await apiFetch<AdvocateApplication>('/api/advocates/apply', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async getAdvocateApplication(): Promise<AdvocateApplication | null> {
    return await apiFetch<AdvocateApplication | null>('/api/advocates/application');
  }

  async getAdminAdvocateApplications(filter?: string): Promise<AdvocateApplication[]> {
    return await apiFetch<AdvocateApplication[]>(`/api/admin/advocate-applications${filter ? `?status=${filter}` : ''}`);
  }

  async decideAdvocateApplication(id: string, decision: 'approved' | 'rejected', note?: string): Promise<void> {
    await apiFetch<void>(`/api/admin/advocate-applications/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ decision, note }),
    });
  }

  async getAdminReports(): Promise<ReportItem[]> {
    return await apiFetch<ReportItem[]>('/api/admin/reports');
  }

  async decideReport(id: string, action: 'dismiss' | 'hide' | 'suspend', note?: string): Promise<void> {
    await apiFetch<void>(`/api/admin/reports/${id}/decision`, {
      method: 'POST',
      body: JSON.stringify({ action, note }),
    });
  }

  async getAdminAuditLogs(): Promise<AuditLog[]> {
    return await apiFetch<AuditLog[]>('/api/admin/audit');
  }

  async submitSupportMessage(data: { name: string; email: string; message: string; captchaToken?: string }): Promise<{ ok: boolean }> {
    return await apiFetch<{ ok: boolean }>('/api/support', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }

  async logout(): Promise<void> {
    try {
      await apiFetch<void>('/api/auth/logout', {
        method: 'POST',
        skipSessionExpiredCheck: true,
      });
    } catch {
      // Always succeed locally
    }
  }
}
