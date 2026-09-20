-- ==============================================================================
-- PlaceMint AI — Complete Database Schema & DDL Script
-- Paste this entire script into your Supabase SQL Editor and click 'Run'.
-- ==============================================================================

-- 1. Create Custom Enumerated Types
DO $$ BEGIN
    CREATE TYPE opportunity_type_enum AS ENUM (
        'JOB',
        'INTERNSHIP',
        'ASSESSMENT',
        'CODING_TEST',
        'CAMPUS_DRIVE',
        'HACKATHON',
        'WORKSHOP_TRAINING',
        'OTHER'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE urgency_level_enum AS ENUM (
        'LOW',
        'MEDIUM',
        'HIGH',
        'CRITICAL'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE deadline_status_enum AS ENUM (
        'UPCOMING',
        'URGENT',
        'COMPLETED',
        'OVERDUE',
        'DISMISSED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE reminder_status_enum AS ENUM (
        'PENDING',
        'SENT',
        'FAILED',
        'CANCELLED'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE application_status_enum AS ENUM (
        'SAVED',
        'APPLIED',
        'ASSESSMENT',
        'INTERVIEW',
        'SELECTED',
        'REJECTED',
        'WITHDRAWN'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE eligibility_status_enum AS ENUM (
        'ELIGIBLE',
        'NOT_ELIGIBLE',
        'NEEDS_REVIEW'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE telegram_chat_type_enum AS ENUM (
        'CHANNEL',
        'SUPERGROUP',
        'GROUP'
    );
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- 2. Tables

-- Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    full_name TEXT NOT NULL,
    college_name TEXT,
    degree TEXT,
    branch TEXT,
    graduation_year INT NOT NULL,
    cgpa NUMERIC(4,2) CHECK (cgpa >= 0.0 AND cgpa <= 10.0),
    percentage NUMERIC(5,2),
    active_backlogs INT DEFAULT 0 CHECK (active_backlogs >= 0),
    history_backlogs INT DEFAULT 0 CHECK (history_backlogs >= 0),
    tenth_percentage NUMERIC(5,2),
    twelfth_percentage NUMERIC(5,2),
    skills TEXT[] DEFAULT '{}',
    resume_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Student Preferences
CREATE TABLE IF NOT EXISTS student_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    auto_run_insights BOOLEAN DEFAULT TRUE,
    auto_create_deadlines BOOLEAN DEFAULT FALSE,
    message_analysis_count INT DEFAULT 25 CHECK (message_analysis_count BETWEEN 5 AND 100),
    reminder_offsets_hours INT[] DEFAULT '{24, 6, 1}',
    push_notifications_enabled BOOLEAN DEFAULT TRUE,
    fcm_token TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Telegram Connections
CREATE TABLE IF NOT EXISTS telegram_connections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    telegram_user_id BIGINT NOT NULL,
    phone_number TEXT NOT NULL,
    username TEXT,
    first_name TEXT,
    encrypted_session_string TEXT NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    last_synced_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_telegram UNIQUE (user_id, telegram_user_id)
);

-- Discovered Telegram Groups
CREATE TABLE IF NOT EXISTS telegram_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    telegram_id BIGINT NOT NULL UNIQUE,
    title TEXT NOT NULL,
    username TEXT,
    chat_type telegram_chat_type_enum NOT NULL DEFAULT 'CHANNEL',
    total_members INT,
    last_message_at TIMESTAMPTZ,
    last_discovered_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Monitored Groups
CREATE TABLE IF NOT EXISTS user_monitored_groups (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES telegram_groups(id) ON DELETE CASCADE,
    is_monitored BOOLEAN DEFAULT TRUE,
    auto_analyze BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_user_group_monitoring UNIQUE (user_id, group_id)
);

-- Telegram Messages
CREATE TABLE IF NOT EXISTS telegram_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    group_id UUID NOT NULL REFERENCES telegram_groups(id) ON DELETE CASCADE,
    telegram_message_id BIGINT NOT NULL,
    sender_id BIGINT,
    sender_name TEXT,
    message_text TEXT NOT NULL,
    media_url TEXT,
    message_timestamp TIMESTAMPTZ NOT NULL,
    message_hash CHAR(64) NOT NULL,
    has_links BOOLEAN DEFAULT FALSE,
    raw_payload JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_group_message UNIQUE (group_id, telegram_message_id)
);

-- AI Insights
CREATE TABLE IF NOT EXISTS ai_insights (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    group_id UUID NOT NULL REFERENCES telegram_groups(id) ON DELETE CASCADE,
    source_message_id UUID REFERENCES telegram_messages(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    role_title TEXT,
    opportunity_type opportunity_type_enum NOT NULL DEFAULT 'JOB',
    eligibility_raw TEXT,
    eligibility_criteria JSONB,
    salary_or_stipend TEXT,
    batch_year TEXT,
    deadline_timestamp TIMESTAMPTZ,
    event_timestamp TIMESTAMPTZ,
    application_url TEXT,
    action_required TEXT,
    urgency urgency_level_enum DEFAULT 'MEDIUM',
    confidence_score NUMERIC(3,2) CHECK (confidence_score BETWEEN 0.0 AND 1.0),
    extraction_provider TEXT DEFAULT 'GEMINI',
    is_dismissed BOOLEAN DEFAULT FALSE,
    is_bookmarked BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Companies
CREATE TABLE IF NOT EXISTS companies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    domain TEXT,
    logo_url TEXT,
    career_portal_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Opportunities
CREATE TABLE IF NOT EXISTS opportunities (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID REFERENCES companies(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    role TEXT NOT NULL,
    opportunity_type opportunity_type_enum NOT NULL,
    batch_year TEXT,
    eligibility_json JSONB,
    ctc_or_stipend TEXT,
    registration_deadline TIMESTAMPTZ,
    assessment_date TIMESTAMPTZ,
    apply_url TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Applications
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    opportunity_id UUID REFERENCES opportunities(id) ON DELETE SET NULL,
    insight_id UUID REFERENCES ai_insights(id) ON DELETE SET NULL,
    company_name TEXT NOT NULL,
    role_title TEXT NOT NULL,
    status application_status_enum NOT NULL DEFAULT 'SAVED',
    applied_at TIMESTAMPTZ,
    assessment_date TIMESTAMPTZ,
    interview_date TIMESTAMPTZ,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Deadlines
CREATE TABLE IF NOT EXISTS deadlines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    insight_id UUID REFERENCES ai_insights(id) ON DELETE SET NULL,
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    company_name TEXT NOT NULL,
    deadline_at TIMESTAMPTZ NOT NULL,
    status deadline_status_enum NOT NULL DEFAULT 'UPCOMING',
    action_url TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Reminders
CREATE TABLE IF NOT EXISTS reminders (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    deadline_id UUID NOT NULL REFERENCES deadlines(id) ON DELETE CASCADE,
    scheduled_for TIMESTAMPTZ NOT NULL,
    offset_hours INT NOT NULL,
    status reminder_status_enum NOT NULL DEFAULT 'PENDING',
    sent_at TIMESTAMPTZ,
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Row Level Security (RLS)
ALTER TABLE student_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE student_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_monitored_groups ENABLE ROW LEVEL SECURITY;
ALTER TABLE telegram_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE opportunities ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE deadlines ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any to prevent conflicts
DROP POLICY IF EXISTS "Users can manage own profile" ON student_profiles;
CREATE POLICY "Users can manage own profile" ON student_profiles FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own preferences" ON student_preferences;
CREATE POLICY "Users can manage own preferences" ON student_preferences FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own telegram connection" ON telegram_connections;
CREATE POLICY "Users can manage own telegram connection" ON telegram_connections FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view discovered groups" ON telegram_groups;
CREATE POLICY "Users can view discovered groups" ON telegram_groups FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_monitored_groups umg WHERE umg.group_id = telegram_groups.id AND umg.user_id = auth.uid())
);

DROP POLICY IF EXISTS "Users can manage own monitored groups" ON user_monitored_groups;
CREATE POLICY "Users can manage own monitored groups" ON user_monitored_groups FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can view messages from monitored groups" ON telegram_messages;
CREATE POLICY "Users can view messages from monitored groups" ON telegram_messages FOR SELECT USING (
    EXISTS (SELECT 1 FROM user_monitored_groups umg WHERE umg.group_id = telegram_messages.group_id AND umg.user_id = auth.uid() AND umg.is_monitored = TRUE)
);

DROP POLICY IF EXISTS "Users can manage own insights" ON ai_insights;
CREATE POLICY "Users can manage own insights" ON ai_insights FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own deadlines" ON deadlines;
CREATE POLICY "Users can manage own deadlines" ON deadlines FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own applications" ON applications;
CREATE POLICY "Users can manage own applications" ON applications FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can manage own reminders" ON reminders;
CREATE POLICY "Users can manage own reminders" ON reminders FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Authenticated users can view companies" ON companies;
CREATE POLICY "Authenticated users can view companies" ON companies FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated users can view opportunities" ON opportunities;
CREATE POLICY "Authenticated users can view opportunities" ON opportunities FOR SELECT TO authenticated USING (true);

-- 4. Triggers & Automated Handlers
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_update_student_profiles ON student_profiles;
CREATE TRIGGER trigger_update_student_profiles BEFORE UPDATE ON student_profiles FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_student_preferences ON student_preferences;
CREATE TRIGGER trigger_update_student_preferences BEFORE UPDATE ON student_preferences FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_user_monitored_groups ON user_monitored_groups;
CREATE TRIGGER trigger_update_user_monitored_groups BEFORE UPDATE ON user_monitored_groups FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_ai_insights ON ai_insights;
CREATE TRIGGER trigger_update_ai_insights BEFORE UPDATE ON ai_insights FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_deadlines ON deadlines;
CREATE TRIGGER trigger_update_deadlines BEFORE UPDATE ON deadlines FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_applications ON applications;
CREATE TRIGGER trigger_update_applications BEFORE UPDATE ON applications FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Auto-provision Profile on Signup Trigger
CREATE OR REPLACE FUNCTION handle_new_user_signup()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO student_profiles (user_id, full_name, graduation_year)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', 'Student User'),
        EXTRACT(YEAR FROM NOW())::INT
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO student_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION handle_new_user_signup();

-- 5. Seed Initial Companies & Groups
INSERT INTO companies (name, domain, logo_url, career_portal_url) VALUES
('Google India', 'google.com', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'https://careers.google.com'),
('Goldman Sachs', 'goldmansachs.com', 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg', 'https://www.goldmansachs.com/careers'),
('Amazon India', 'amazon.jobs', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', 'https://amazon.jobs'),
('Microsoft', 'microsoft.com', 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', 'https://careers.microsoft.com'),
('Uber', 'uber.com', 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png', 'https://uber.com/careers')
ON CONFLICT (name) DO NOTHING;

INSERT INTO telegram_groups (telegram_id, title, username, chat_type, total_members, last_message_at) VALUES
(-1001829472910, 'TPO Official Placements 2026', 'tpo_placements_2026', 'CHANNEL', 2450, NOW() - INTERVAL '15 minutes'),
(-1001948271048, 'CSE & IT Placement Cell (Verified)', 'cse_placement_cell', 'SUPERGROUP', 820, NOW() - INTERVAL '45 minutes'),
(-1001739281940, 'Off-Campus Tech Internships & Drives 2026', 'offcampus_drives_26', 'CHANNEL', 15400, NOW() - INTERVAL '2 hours'),
(-1001628192039, 'ECE & Core Engineering Placement Desk', 'ece_core_desk', 'SUPERGROUP', 410, NOW() - INTERVAL '6 hours')
ON CONFLICT (telegram_id) DO NOTHING;
