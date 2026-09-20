-- Migration: 20260920000001_initial_schema.sql
-- Description: Core types and relational tables for PlaceMint AI

-- Custom Enums
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

CREATE TYPE urgency_level_enum AS ENUM (
    'LOW',
    'MEDIUM',
    'HIGH',
    'CRITICAL'
);

CREATE TYPE deadline_status_enum AS ENUM (
    'UPCOMING',
    'URGENT',
    'COMPLETED',
    'OVERDUE',
    'DISMISSED'
);

CREATE TYPE reminder_status_enum AS ENUM (
    'PENDING',
    'SENT',
    'FAILED',
    'CANCELLED'
);

CREATE TYPE application_status_enum AS ENUM (
    'SAVED',
    'APPLIED',
    'ASSESSMENT',
    'INTERVIEW',
    'SELECTED',
    'REJECTED',
    'WITHDRAWN'
);

CREATE TYPE eligibility_status_enum AS ENUM (
    'ELIGIBLE',
    'NOT_ELIGIBLE',
    'NEEDS_REVIEW'
);

CREATE TYPE telegram_chat_type_enum AS ENUM (
    'CHANNEL',
    'SUPERGROUP',
    'GROUP'
);

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
