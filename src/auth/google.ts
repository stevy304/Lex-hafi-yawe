import { AuthError } from './types';

let scriptLoadingPromise: Promise<void> | null = null;

function loadGsiScript(): Promise<void> {
  if (typeof window === 'undefined') {
    return Promise.reject(new AuthError('network', 'Window is not defined'));
  }
  if ((window as any).google?.accounts?.oauth2) {
    return Promise.resolve();
  }
  if (scriptLoadingPromise) {
    return scriptLoadingPromise;
  }

  scriptLoadingPromise = new Promise<void>((resolve, reject) => {
    const script = document.createElement('script');
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => resolve();
    script.onerror = () => {
      scriptLoadingPromise = null;
      reject(new AuthError('network', 'Failed to load Google Identity Services'));
    };
    document.head.appendChild(script);
  });

  return scriptLoadingPromise;
}

export async function requestGoogleAuthCode(clientId: string): Promise<string> {
  if (!clientId || clientId.trim() === '') {
    throw new AuthError('oauth_failed', 'Google client ID not configured');
  }

  await loadGsiScript();

  return new Promise<string>((resolve, reject) => {
    let resolved = false;

    try {
      const google = (window as any).google;
      if (!google?.accounts?.oauth2) {
        throw new AuthError('oauth_failed', 'Google Identity Services not initialized');
      }

      const client = google.accounts.oauth2.initCodeClient({
        client_id: clientId,
        scope: 'openid email profile',
        ux_mode: 'popup',
        callback: (response: { code?: string; error?: string }) => {
          resolved = true;
          if (response.code) {
            resolve(response.code);
          } else {
            reject(new AuthError('oauth_failed', response.error || 'Google auth code request failed'));
          }
        },
        error_callback: (error: any) => {
          resolved = true;
          reject(new AuthError('oauth_failed', error?.message || 'Google OAuth failed'));
        },
      });

      client.requestCode();

      // Fallback check in case the popup is closed without triggering error_callback
      const checkPopupClosed = setInterval(() => {
        if (resolved) {
          clearInterval(checkPopupClosed);
        }
      }, 500);

      setTimeout(() => {
        if (!resolved) {
          clearInterval(checkPopupClosed);
          // Don't auto-fail if user is just taking their time, but clear polling
        }
      }, 60000);
    } catch (err: any) {
      resolved = true;
      if (err instanceof AuthError) {
        reject(err);
      } else {
        reject(new AuthError('oauth_failed', err?.message || 'Failed to start Google sign-in'));
      }
    }
  });
}
