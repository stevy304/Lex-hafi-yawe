# Lex Hafi Yawe — Authentication & Frontend Setup

This application implements the landing, sign-in, and authentication flows for **Lex Hafi Yawe**, the Rwandan digital justice platform.

---

## Backend & Authentication Configuration

Configuration is managed via environment variables (see `.env.example`).

### 1. Switching Between Auth Providers

Set `VITE_AUTH_PROVIDER` in `.env` to one of:
- **`mock`** (Default for development & testing): Uses the fully-functional in-memory auth adapter (`src/auth/mock.ts`). Requires no backend.
  - Password test credentials:
    - Citizen: `demo@lex.rw` (or `demo`) with password `Demo#2026`
    - Advocate: `advocate@lex.rw` (or `advocate`) with password `Advocate#2026`
  - OTP test: Any valid Rwandan number (e.g. `0788123456`), code `123456`.
- **`rest`**: Connects to a standard REST API backend using the contract defined in `BACKEND_REQUIREMENTS.md`. Uses `httpOnly` session cookies and double-submit CSRF tokens.
- **`firebase`**: Connects to Firebase Authentication via `src/auth/firebase.ts`.

### 2. Pointing to a Real Backend

Set `VITE_API_BASE_URL` in `.env`:
```bash
# If running backend on the same origin (proxied under /api):
VITE_API_BASE_URL=

# If running on a dedicated backend server or port:
VITE_API_BASE_URL=https://api.lexhafi.rw
```

Ensure the backend supports CORS with `credentials: true` for the frontend origin.

### 3. Setting the Google Client ID

Set `VITE_GOOGLE_CLIENT_ID` in `.env`:
```bash
VITE_GOOGLE_CLIENT_ID=your-google-oauth-client-id.apps.googleusercontent.com
```

- When empty, the Google button displays a clear configuration warning without failing or locking the UI.
- When configured, it opens the Google Identity Services popup to retrieve an authorization code, which is then sent to the backend endpoint `POST /api/auth/google`.

---

## Acceptance Test Results

All 12 acceptance tests pass against the mock adapter:
1. **PASS** — Fresh load while logged out shows the landing page with no scrollbar at 1920x1080, 1440x900, 1366x768, 1280x720; layout, typography, and L+X monogram unchanged.
2. **PASS** — Identifier `demo@lex.rw` transitions to password step; invalid password renders `errCreds` in red under the field; valid password `Demo#2026` signs in and navigates to `/home`.
3. **PASS** — Refreshing `/home` retains the session; clicking Logout returns to `/` and visiting `/home` redirects back to `/`.
4. **PASS** — Visiting `/home` while unauthenticated redirects to `/?next=%2Fhome`; logging in returns to `/home`; open-redirect attempts (`//evil.com`, `https://evil.com`) are sanitized to `/home`.
5. **PASS** — Phone numbers `0788123456`, `788123456`, `+250788123456`, and `250788123456` all normalize to `+250788123456`; invalid number `12345` immediately shows `errPhone` without triggering network calls.
6. **PASS** — OTP code `123456` successfully signs in; wrong code displays `errCode` and clears the input; expired codes trigger `errCode`; resend button has a 30-second live countdown; pasting `123 456` strips non-digits to `123456`.
7. **PASS** — 5 incorrect password attempts within 60 seconds trigger `rate_limited` (`errRate`) and temporarily disable the sign-in button.
8. **PASS** — Google button displays `errGoogleCfg` when no client ID is provided; in mock mode or with configured client ID it authenticates cleanly without getting stuck in a loading state.
9. **PASS** — Switching languages (EN / RW / FR) immediately translates all labels, inputs, errors, and buttons; language and theme persist across reloads; light mode preserves high-contrast WCAG AA error tokens.
10. **PASS** — Keyboard navigation operates smoothly with logical tab order, Enter key submission, Esc key to go Back, automatic focus on step changes, and accessible `role="alert"` error announcements.
11. **PASS** — Network failures trigger `errNet` and re-enable form controls cleanly.
12. **PASS** — Zero credentials or session tokens are stored in web storage; no secrets in frontend code; zero `console.log` statements with sensitive data.
