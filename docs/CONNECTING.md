# Connecting Lex Hafi Yawe to a Production Backend

This document details how to deploy the Lex Hafi Yawe frontend and connect it to a production backend.

---

## 1. Environment Variables Configuration

Create a `.env.production` file:

```bash
# Auth and API Providers
VITE_AUTH_PROVIDER=rest
VITE_API_BASE_URL=https://api.lexhafi.rw

# OAuth & CAPTCHA Configuration
VITE_GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
VITE_CAPTCHA_SITE_KEY=your-cloudflare-turnstile-key

# Security & CSRF
VITE_CSRF_COOKIE=XSRF-TOKEN
VITE_CSRF_HEADER=X-XSRF-TOKEN
VITE_FEATURE_2FA=off
```

---

## 2. CORS and Cookies

- Set `Access-Control-Allow-Origin: https://app.lexhafi.rw` (must be the exact frontend origin; never `*`).
- Set `Access-Control-Allow-Credentials: true`.
- Cookie flags for session token:
  - `HttpOnly: true`
  - `Secure: true`
  - `SameSite: Lax`
  - `Path: /`

---

## 3. Production Build & Verification

Run:
```bash
npm run build
```

This compiles client assets to `/dist` and bundles the fullstack server into `/server.js`. Start with:
```bash
npm start
```
