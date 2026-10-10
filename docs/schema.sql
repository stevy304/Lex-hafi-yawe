-- Lex Hafi Yawe Database Schema (PostgreSQL 15+)
-- Law N° 058/2021 relating to the protection of personal data and privacy compliant

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users & Core Profiles
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  handle VARCHAR(30) UNIQUE NOT NULL,
  email VARCHAR(255) UNIQUE,
  phone VARCHAR(30) UNIQUE,
  password_hash VARCHAR(255),
  role VARCHAR(20) NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'advocate', 'admin')),
  onboarding_completed BOOLEAN NOT NULL DEFAULT FALSE,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  phone_verified BOOLEAN NOT NULL DEFAULT FALSE,
  has_password BOOLEAN NOT NULL DEFAULT FALSE,
  verified_advocate BOOLEAN NOT NULL DEFAULT FALSE,
  avatar_url TEXT,
  bio VARCHAR(160),
  district VARCHAR(50) DEFAULT 'Gasabo',
  language VARCHAR(5) NOT NULL DEFAULT 'en' CHECK (language IN ('en', 'rw', 'fr')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Onboarding State
CREATE TABLE IF NOT EXISTS onboarding_state (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  step VARCHAR(20) NOT NULL DEFAULT 'profile' CHECK (step IN ('profile', 'consent', 'interests', 'follow', 'done')),
  completed BOOLEAN NOT NULL DEFAULT FALSE,
  data JSONB DEFAULT '{}'::jsonb,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Legal Versions & Consents
CREATE TABLE IF NOT EXISTS legal_versions (
  version VARCHAR(30) PRIMARY KEY,
  terms_text TEXT NOT NULL,
  privacy_text TEXT NOT NULL,
  min_age INT NOT NULL DEFAULT 16,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  effective_date TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS consents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  terms_version VARCHAR(30) NOT NULL,
  privacy_version VARCHAR(30) NOT NULL,
  age_confirmed BOOLEAN NOT NULL DEFAULT TRUE,
  marketing_updates BOOLEAN NOT NULL DEFAULT FALSE,
  marketing_digest BOOLEAN NOT NULL DEFAULT FALSE,
  ip_hash VARCHAR(64) NOT NULL,
  user_agent_hash VARCHAR(64),
  consented_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Email Verifications
CREATE TABLE IF NOT EXISTS email_verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) NOT NULL,
  code_hash VARCHAR(255) NOT NULL,
  attempts INT NOT NULL DEFAULT 0,
  expires_at TIMESTAMPTZ NOT NULL,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Sessions
CREATE TABLE IF NOT EXISTS auth_sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  device VARCHAR(100),
  browser VARCHAR(100),
  ip_masked VARCHAR(60),
  user_agent TEXT,
  last_active TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  revoked_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. User Settings
CREATE TABLE IF NOT EXISTS user_settings (
  user_id UUID PRIMARY KEY REFERENCES users(id) ON DELETE CASCADE,
  in_app_likes BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_comments BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_follows BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_mentions BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_official_updates BOOLEAN NOT NULL DEFAULT TRUE,
  in_app_messages BOOLEAN NOT NULL DEFAULT TRUE,
  email_digest BOOLEAN NOT NULL DEFAULT TRUE,
  sms_alerts BOOLEAN NOT NULL DEFAULT FALSE,
  who_can_message_me VARCHAR(20) NOT NULL DEFAULT 'everyone' CHECK (who_can_message_me IN ('everyone', 'following', 'nobody')),
  show_district_on_profile BOOLEAN NOT NULL DEFAULT TRUE
);

-- 7. Moderation Blocks & Mutes
CREATE TABLE IF NOT EXISTS blocks (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  blocked_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, blocked_user_id)
);

CREATE TABLE IF NOT EXISTS mutes (
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  muted_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  PRIMARY KEY (user_id, muted_user_id)
);

-- 8. Data Export Jobs
CREATE TABLE IF NOT EXISTS export_jobs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  status VARCHAR(20) NOT NULL DEFAULT 'preparing' CHECK (status IN ('preparing', 'ready', 'failed')),
  download_url TEXT,
  expires_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 9. Deletion Requests (30-day grace)
CREATE TABLE IF NOT EXISTS deletion_requests (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  scheduled_for TIMESTAMPTZ NOT NULL,
  cancelled_at TIMESTAMPTZ,
  purged_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 10. Advocate Applications & Documents
CREATE TABLE IF NOT EXISTS advocate_applications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  full_name VARCHAR(100) NOT NULL,
  bar_roll_number VARCHAR(50) NOT NULL,
  practice_areas TEXT[] NOT NULL,
  districts TEXT[] NOT NULL,
  years_of_experience INT NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(30),
  documents JSONB NOT NULL DEFAULT '[]'::jsonb,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  decision_note TEXT,
  decided_at TIMESTAMPTZ,
  decided_by UUID REFERENCES users(id),
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 11. Reports & Community Trust
CREATE TABLE IF NOT EXISTS reports (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  target_id VARCHAR(100) NOT NULL,
  target_type VARCHAR(20) NOT NULL CHECK (target_type IN ('post', 'user', 'comment')),
  snippet TEXT NOT NULL,
  reason VARCHAR(255) NOT NULL,
  report_count INT NOT NULL DEFAULT 1,
  reporter_count INT NOT NULL DEFAULT 1,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dismissed', 'actioned')),
  action_taken VARCHAR(30),
  note TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 12. Admin Audit Log (Append-only)
CREATE TABLE IF NOT EXISTS admin_audit_log (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  admin_id UUID NOT NULL REFERENCES users(id),
  admin_name VARCHAR(100) NOT NULL,
  action VARCHAR(100) NOT NULL,
  target_id VARCHAR(100) NOT NULL,
  details TEXT,
  timestamp TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 13. Support Contact Messages
CREATE TABLE IF NOT EXISTS support_messages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  captcha_verified BOOLEAN NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
