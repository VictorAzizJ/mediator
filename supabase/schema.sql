-- ============================================
-- MEDIATOR DATABASE SCHEMA
-- Supabase PostgreSQL
-- ============================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- SESSIONS TABLE
-- Stores anonymized session analytics (retained)
-- ============================================
CREATE TABLE IF NOT EXISTS sessions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_code VARCHAR(6) NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  completed_at TIMESTAMPTZ,

  -- Skill/Template info
  skill_used VARCHAR(20), -- 'DEAR MAN', 'GIVE', 'FAST', or NULL
  template_id VARCHAR(50),
  template_name VARCHAR(100),

  -- Session metrics
  rounds_completed INTEGER NOT NULL DEFAULT 0,
  total_rounds INTEGER NOT NULL DEFAULT 3,
  session_time_seconds INTEGER NOT NULL DEFAULT 0,

  -- Analytics flags
  volume_flags INTEGER NOT NULL DEFAULT 0,
  redos INTEGER NOT NULL DEFAULT 0,
  voice_rounds INTEGER NOT NULL DEFAULT 0,
  text_rounds INTEGER NOT NULL DEFAULT 0,

  -- Participant info (anonymized)
  participant_count INTEGER NOT NULL DEFAULT 1,

  -- Organization/User (optional, for B2B)
  user_email VARCHAR(255),
  org_id UUID,

  -- Privacy
  transcript_deleted BOOLEAN NOT NULL DEFAULT FALSE,
  transcript_delete_at TIMESTAMPTZ,

  -- Indexes
  CONSTRAINT sessions_session_code_idx UNIQUE (session_code)
);

-- Index for filtering
CREATE INDEX IF NOT EXISTS sessions_skill_idx ON sessions(skill_used);
CREATE INDEX IF NOT EXISTS sessions_org_idx ON sessions(org_id);
CREATE INDEX IF NOT EXISTS sessions_created_at_idx ON sessions(created_at DESC);
CREATE INDEX IF NOT EXISTS sessions_user_email_idx ON sessions(user_email);

-- ============================================
-- SESSION ROUNDS TABLE
-- Per-round analytics (retained)
-- ============================================
CREATE TABLE IF NOT EXISTS session_rounds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,

  round_number INTEGER NOT NULL,
  phase VARCHAR(20) NOT NULL, -- 'setup', 'practice', 'reflect'
  input_type VARCHAR(10) NOT NULL, -- 'voice' or 'text'
  response_length INTEGER NOT NULL DEFAULT 0, -- word count
  volume_flag BOOLEAN NOT NULL DEFAULT FALSE,
  duration_seconds INTEGER NOT NULL DEFAULT 0,
  was_redone BOOLEAN NOT NULL DEFAULT FALSE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Index for joining
CREATE INDEX IF NOT EXISTS session_rounds_session_idx ON session_rounds(session_id);

-- ============================================
-- TRANSCRIPTS TABLE
-- Temporarily stores transcripts (auto-deleted after 24h)
-- ============================================
CREATE TABLE IF NOT EXISTS transcripts (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  delete_at TIMESTAMPTZ NOT NULL -- Set to created_at + 24 hours
);

-- Index for cleanup job
CREATE INDEX IF NOT EXISTS transcripts_delete_at_idx ON transcripts(delete_at);

-- ============================================
-- ORGANIZATIONS TABLE (B2B)
-- ============================================
CREATE TABLE IF NOT EXISTS organizations (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(100) UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  settings JSONB DEFAULT '{}'::jsonb
);

-- ============================================
-- USER PROFILES TABLE
-- Stores user information linked to authentication
-- ============================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email VARCHAR(255) UNIQUE NOT NULL,
  name VARCHAR(255) NOT NULL,
  role VARCHAR(100), -- Job role/title

  -- Organization (for team accounts)
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,
  org_role VARCHAR(20) DEFAULT 'member', -- 'org_admin', 'manager', 'member'

  -- Account type and settings
  account_type VARCHAR(20) DEFAULT 'individual', -- 'individual', 'team'
  preferences JSONB DEFAULT '{}'::jsonb,

  -- Access tracking
  access_code_used UUID, -- References access_codes if applicable

  -- Stats
  sessions_completed INTEGER DEFAULT 0,
  total_practice_time_seconds INTEGER DEFAULT 0,

  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_active_at TIMESTAMPTZ,

  -- Indexes
  CONSTRAINT user_profiles_email_idx UNIQUE (email)
);

CREATE INDEX IF NOT EXISTS user_profiles_org_idx ON user_profiles(org_id);
CREATE INDEX IF NOT EXISTS user_profiles_created_idx ON user_profiles(created_at DESC);

-- ============================================
-- AUTH TOKENS TABLE
-- Stores magic link and session tokens
-- ============================================
CREATE TABLE IF NOT EXISTS auth_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  token VARCHAR(64) UNIQUE NOT NULL,
  email VARCHAR(255) NOT NULL,
  user_id UUID REFERENCES user_profiles(id) ON DELETE CASCADE,

  type VARCHAR(20) NOT NULL, -- 'magic_link', 'session'

  expires_at TIMESTAMPTZ NOT NULL,
  used BOOLEAN DEFAULT FALSE,
  used_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS auth_tokens_token_idx ON auth_tokens(token);
CREATE INDEX IF NOT EXISTS auth_tokens_email_idx ON auth_tokens(email);
CREATE INDEX IF NOT EXISTS auth_tokens_expires_idx ON auth_tokens(expires_at);

-- Cleanup function for expired tokens
CREATE OR REPLACE FUNCTION cleanup_expired_tokens()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM auth_tokens
  WHERE expires_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- ACCESS CODES TABLE
-- Manages pilot/demo access codes
-- ============================================
CREATE TABLE IF NOT EXISTS access_codes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  code VARCHAR(32) UNIQUE NOT NULL,

  type VARCHAR(20) NOT NULL, -- 'pilot', 'demo', 'enterprise'

  -- Organization association (optional)
  org_id UUID REFERENCES organizations(id) ON DELETE SET NULL,

  -- Usage limits
  max_uses INTEGER, -- NULL = unlimited
  uses_count INTEGER DEFAULT 0,

  -- Validity period
  expires_at TIMESTAMPTZ,
  is_active BOOLEAN DEFAULT TRUE,

  -- Metadata
  description TEXT,
  created_by UUID REFERENCES user_profiles(id),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS access_codes_code_idx ON access_codes(code);
CREATE INDEX IF NOT EXISTS access_codes_org_idx ON access_codes(org_id);
CREATE INDEX IF NOT EXISTS access_codes_active_idx ON access_codes(is_active) WHERE is_active = TRUE;

-- ============================================
-- ROW LEVEL SECURITY (RLS)
-- ============================================

-- Enable RLS on all tables
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_rounds ENABLE ROW LEVEL SECURITY;
ALTER TABLE transcripts ENABLE ROW LEVEL SECURITY;
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE auth_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE access_codes ENABLE ROW LEVEL SECURITY;

-- Sessions: Allow read for authenticated users in same org, or public read for demo
CREATE POLICY "Sessions are viewable by authenticated users" ON sessions
  FOR SELECT USING (true); -- Adjust for production: auth.uid() check

CREATE POLICY "Sessions are insertable" ON sessions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Sessions are updatable" ON sessions
  FOR UPDATE USING (true);

-- Session rounds: Same as sessions
CREATE POLICY "Session rounds are viewable" ON session_rounds
  FOR SELECT USING (true);

CREATE POLICY "Session rounds are insertable" ON session_rounds
  FOR INSERT WITH CHECK (true);

-- Transcripts: Restricted access
CREATE POLICY "Transcripts are viewable by owner" ON transcripts
  FOR SELECT USING (true); -- Adjust for production

CREATE POLICY "Transcripts are insertable" ON transcripts
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Transcripts are deletable" ON transcripts
  FOR DELETE USING (true);

-- User profiles: Allow service role full access (for auth)
CREATE POLICY "User profiles are viewable" ON user_profiles
  FOR SELECT USING (true);

CREATE POLICY "User profiles are insertable" ON user_profiles
  FOR INSERT WITH CHECK (true);

CREATE POLICY "User profiles are updatable" ON user_profiles
  FOR UPDATE USING (true);

-- Auth tokens: Service role only (handled via service_role key)
CREATE POLICY "Auth tokens service access" ON auth_tokens
  FOR ALL USING (true);

-- Access codes: Service role only
CREATE POLICY "Access codes service access" ON access_codes
  FOR ALL USING (true);

-- ============================================
-- CLEANUP FUNCTION
-- Deletes transcripts older than their delete_at time
-- ============================================
CREATE OR REPLACE FUNCTION cleanup_expired_transcripts()
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  DELETE FROM transcripts
  WHERE delete_at < NOW();

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  -- Update sessions to mark transcripts as deleted
  UPDATE sessions
  SET transcript_deleted = TRUE
  WHERE id IN (
    SELECT DISTINCT session_id FROM transcripts WHERE delete_at < NOW()
  );

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- SCHEDULED CLEANUP (Supabase pg_cron)
-- Run every hour to clean up expired transcripts
-- ============================================
-- Note: Enable pg_cron extension in Supabase dashboard first
-- Then run:
-- SELECT cron.schedule('cleanup-transcripts', '0 * * * *', 'SELECT cleanup_expired_transcripts()');

-- ============================================
-- VIEWS FOR ADMIN DASHBOARD
-- ============================================

-- Daily session stats
CREATE OR REPLACE VIEW daily_session_stats AS
SELECT
  DATE(created_at) as date,
  COUNT(*) as session_count,
  AVG(session_time_seconds) as avg_duration,
  SUM(rounds_completed) as total_rounds,
  SUM(volume_flags) as total_volume_flags,
  SUM(voice_rounds) as total_voice,
  SUM(text_rounds) as total_text
FROM sessions
WHERE completed_at IS NOT NULL
GROUP BY DATE(created_at)
ORDER BY date DESC;

-- Skill usage breakdown
CREATE OR REPLACE VIEW skill_usage_stats AS
SELECT
  COALESCE(skill_used, 'Free-form') as skill,
  COUNT(*) as session_count,
  AVG(session_time_seconds) as avg_duration,
  AVG(volume_flags) as avg_volume_flags
FROM sessions
WHERE completed_at IS NOT NULL
GROUP BY skill_used
ORDER BY session_count DESC;

-- ============================================
-- SAMPLE DATA (for development/demo)
-- Comment out for production
-- ============================================

-- Uncomment to insert sample data:
/*
INSERT INTO sessions (session_code, skill_used, template_id, template_name, rounds_completed, total_rounds, session_time_seconds, volume_flags, voice_rounds, text_rounds, participant_count, completed_at)
VALUES
  ('DEMO01', 'DEAR MAN', 'dear-man-tech-nontech', 'Technical to Non-Technical Team Meeting', 3, 3, 540, 0, 2, 1, 1, NOW()),
  ('DEMO02', 'GIVE', 'give-client-repair', 'Client Relationship Repair', 3, 3, 480, 1, 3, 0, 1, NOW() - INTERVAL '1 day'),
  ('DEMO03', 'FAST', 'fast-boundary', 'Boundary Setting', 3, 3, 360, 0, 1, 2, 1, NOW() - INTERVAL '2 days');
*/
