# Backend Requirements: Lex Hafi Yawe Authentication API

This specification defines the authentication and session management contract required by the Lex Hafi Yawe frontend.

---

## 1. Endpoints Specification

Base path: `/api` (or configured via `VITE_API_BASE_URL`).

### `GET /api/auth/me`
- **Purpose**: Verify session status and return current user.
- **Request**: No body. Requires session cookie or bearer token.
- **Responses**:
  - `200 OK`: `{ "user": { "id": "string", "name": "string", "handle": "string", "role": "citizen" | "advocate" | "admin", "avatarUrl"?: "string" } }`
  - `401 Unauthorized`: Logged out (standard expected response when unauthenticated).

### `POST /api/auth/login`
- **Purpose**: Authenticate using username/email and password.
- **Request**: `{ "identifier": "string", "password": "string" }`
- **Responses**:
  - `200 OK`: Sets httpOnly session cookie. Body: `{ "user": User }`
  - `401 Unauthorized`: `{ "error": { "code": "invalid_credentials", "message": "Incorrect email, username, or password." } }`
  - `429 Too Many Requests`: `{ "error": { "code": "rate_limited", "retryAfter": 30 } }` with `Retry-After: 30` header.

### `POST /api/auth/otp/request`
- **Purpose**: Initiate phone verification via 6-digit SMS OTP.
- **Request**: `{ "phone": "+250788123456" }` (E.164 format).
- **Responses**:
  - `202 Accepted`: `{ "retryAfter": 30 }`
  - `400 Bad Request`: `{ "error": { "code": "invalid_phone" } }`
  - `429 Too Many Requests`: `{ "error": { "code": "rate_limited", "retryAfter": 30 } }`

### `POST /api/auth/otp/verify`
- **Purpose**: Validate 6-digit code sent to the phone.
- **Request**: `{ "phone": "+250788123456", "code": "123456" }`
- **Responses**:
  - `200 OK`: Sets httpOnly session cookie. Body: `{ "user": User }`
  - `400 Bad Request`: `{ "error": { "code": "otp_invalid" | "otp_expired" } }`
  - `429 Too Many Requests`: `{ "error": { "code": "rate_limited", "retryAfter": 30 } }`

### `POST /api/auth/google`
- **Purpose**: Exchange Google authorization code for a session.
- **Request**: `{ "code": "4/0A..." }`
- **Responses**:
  - `200 OK`: Sets httpOnly session cookie. Body: `{ "user": User }`
  - `401 Unauthorized`: `{ "error": { "code": "oauth_failed" } }`

### `POST /api/auth/logout`
- **Purpose**: Invalidate current session and clear session cookie.
- **Request**: No body.
- **Responses**:
  - `204 No Content`: Clears session cookie (`Max-Age=0`).

---

## 2. Session Management & Cookies
- **Type**: httpOnly, Secure, `SameSite=Lax`.
- **Session Rotation**: Always rotate session IDs upon successful authentication (prevents session fixation).
- **Expiry**: Absolute timeout (e.g. 14 days) and idle timeout (e.g. 24 hours).
- **CORS**: Allow exact frontend origin with `Access-Control-Allow-Credentials: true`. Never return `Access-Control-Allow-Origin: *` with credentials.

---

## 3. CSRF Protection
- **Mechanism**: Double-submit cookie pattern.
- **Behavior**: On initial load or response, issue an `XSRF-TOKEN` cookie (readable by client-side JavaScript, non-httpOnly, `SameSite=Lax`, `Secure`).
- **Validation**: Require header `X-XSRF-TOKEN` on all state-changing requests (`POST`, `PUT`, `PATCH`, `DELETE`).

---

## 4. Password Security & Rate Limiting
- **Hashing**: Use argon2id or bcrypt (cost factor >= 12).
- **Consistent Responses**: Return identical 401 `invalid_credentials` for nonexistent users and incorrect passwords.
- **Brute Force Protection**: Rate limit by IP and identifier (e.g. 5 failed attempts per 15 minutes triggers 429 with `Retry-After`).

---

## 5. Phone OTP Rules
- **Code**: 6 digits, cryptographically secure random number.
- **Storage**: Store hashed with salt, 5-minute time-to-live, single-use only.
- **Limits**: Max 5 verification attempts per code; max 3 requests per phone number per 15 minutes; 30-second resend cooldown.
- **Delivery**: Dispatch via licensed Rwandan SMS provider / telecom gateway.

---

## 6. Google OAuth
- **Server Exchange**: Exchange client auth `code` with Google OAuth token endpoint using server-side client secret.
- **Token Verification**: Verify ID token `aud` matches `GOOGLE_CLIENT_ID` and `email_verified` is true.
- **Account Linking**: Match existing accounts by verified email; otherwise create a new citizen account.

---

## 7. Data Sanitation & Audit Logging
- **User DTO**: Always return only `{ id, name, handle, role, avatarUrl? }`. Never expose password hashes, salts, or reset tokens.
- **Audit Logs**: Log structured events (e.g., `AUTH_LOGIN_SUCCESS`, `AUTH_LOGIN_FAILED`, `AUTH_RATE_LIMITED`) with IP and timestamp. Never log plain passwords or OTP codes.
