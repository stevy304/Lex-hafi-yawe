import { AuthError, AuthErrorCode } from './types';

const env = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : (typeof process !== 'undefined' ? process.env : {}) as any;
const API_BASE_URL = (env.VITE_API_BASE_URL || '').replace(/\/$/, '');
const CSRF_COOKIE_NAME = env.VITE_CSRF_COOKIE || 'XSRF-TOKEN';
const CSRF_HEADER_NAME = env.VITE_CSRF_HEADER || 'X-XSRF-TOKEN';

let onSessionExpiredHandler: (() => void) | null = null;

export function setOnSessionExpired(handler: (() => void) | null) {
  onSessionExpiredHandler = handler;
}

function getCookie(name: string): string | null {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(?:^|;\\s*)' + name.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&') + '=([^;]*)'));
  return match ? decodeURIComponent(match[1]) : null;
}

const KNOWN_CODES: Set<string> = new Set([
  'invalid_credentials',
  'rate_limited',
  'invalid_phone',
  'otp_invalid',
  'otp_expired',
  'oauth_failed',
  'network',
  'unknown',
]);

interface RequestOptions extends RequestInit {
  timeoutMs?: number;
  skipSessionExpiredCheck?: boolean;
}

export async function apiFetch<T>(endpoint: string, options: RequestOptions = {}): Promise<T> {
  const url = `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : `/${endpoint}`}`;
  const method = (options.method || 'GET').toUpperCase();
  const timeoutMs = options.timeoutMs ?? 15000;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (method !== 'GET' && method !== 'HEAD') {
    const csrfToken = getCookie(CSRF_COOKIE_NAME);
    if (csrfToken) {
      headers[CSRF_HEADER_NAME] = csrfToken;
    }
  }

  try {
    const res = await fetch(url, {
      ...options,
      method,
      headers,
      credentials: 'include',
      signal: controller.signal,
    });

    clearTimeout(timeoutId);

    // 204 No Content
    if (res.status === 204) {
      return undefined as unknown as T;
    }

    if (!res.ok) {
      // 401 Session expired handling (for non-login/non-me requests)
      if (res.status === 401 && !options.skipSessionExpiredCheck) {
        if (onSessionExpiredHandler) {
          onSessionExpiredHandler();
        }
      }

      // 429 Rate limited
      if (res.status === 429) {
        const retryAfterHeader = res.headers.get('Retry-After');
        let retrySeconds: number | undefined;
        if (retryAfterHeader) {
          const parsed = parseInt(retryAfterHeader, 10);
          if (!isNaN(parsed)) retrySeconds = parsed;
        }

        let jsonError: any;
        try {
          jsonError = await res.json();
        } catch {
          // Ignore
        }
        const bodyRetry = jsonError?.error?.retryAfter;
        throw new AuthError('rate_limited', jsonError?.error?.message, retrySeconds ?? bodyRetry ?? 30);
      }

      let errorData: any;
      try {
        errorData = await res.json();
      } catch {
        errorData = null;
      }

      const rawCode = errorData?.error?.code || (res.status === 401 ? 'invalid_credentials' : 'unknown');
      const errorCode: AuthErrorCode = KNOWN_CODES.has(rawCode) ? (rawCode as AuthErrorCode) : 'unknown';
      const errorMessage = errorData?.error?.message;
      const retryAfter = errorData?.error?.retryAfter;

      throw new AuthError(errorCode, errorMessage, retryAfter);
    }

    const data = await res.json();
    return data as T;
  } catch (err: any) {
    clearTimeout(timeoutId);

    if (err instanceof AuthError) {
      throw err;
    }

    if (err.name === 'AbortError') {
      throw new AuthError('network', 'Request timed out');
    }

    if (err instanceof TypeError && err.message.includes('fetch')) {
      throw new AuthError('network', 'Network connection error');
    }

    throw new AuthError('network', err?.message || 'Connection failure');
  }
}
