-- Migration: 20260920000003_indexes_and_triggers.sql
-- Description: Composite performance indexes and automated triggers

-- Performance Indexes
CREATE INDEX IF NOT EXISTS idx_monitored_groups_active ON user_monitored_groups (group_id) WHERE is_monitored = TRUE;
CREATE INDEX IF NOT EXISTS idx_monitored_user_lookup ON user_monitored_groups (user_id, group_id);

CREATE INDEX IF NOT EXISTS idx_telegram_messages_group_time ON telegram_messages (group_id, message_timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_telegram_messages_hash ON telegram_messages (message_hash);

CREATE INDEX IF NOT EXISTS idx_ai_insights_user_created ON ai_insights (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ai_insights_user_deadline ON ai_insights (user_id, deadline_timestamp ASC) WHERE is_dismissed = FALSE;
CREATE INDEX IF NOT EXISTS idx_ai_insights_company ON ai_insights (company_name);

CREATE INDEX IF NOT EXISTS idx_deadlines_user_status_date ON deadlines (user_id, status, deadline_at ASC);
CREATE INDEX IF NOT EXISTS idx_reminders_pending ON reminders (scheduled_for ASC) WHERE status = 'PENDING';
CREATE INDEX IF NOT EXISTS idx_applications_user_status ON applications (user_id, status);

-- Trigger Function: Auto-update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timestamp_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Attach updated_at Triggers
DROP TRIGGER IF EXISTS trigger_update_student_profiles ON student_profiles;
CREATE TRIGGER trigger_update_student_profiles
    BEFORE UPDATE ON student_profiles
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_student_preferences ON student_preferences;
CREATE TRIGGER trigger_update_student_preferences
    BEFORE UPDATE ON student_preferences
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_user_monitored_groups ON user_monitored_groups;
CREATE TRIGGER trigger_update_user_monitored_groups
    BEFORE UPDATE ON user_monitored_groups
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_ai_insights ON ai_insights;
CREATE TRIGGER trigger_update_ai_insights
    BEFORE UPDATE ON ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_deadlines ON deadlines;
CREATE TRIGGER trigger_update_deadlines
    BEFORE UPDATE ON deadlines
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

DROP TRIGGER IF EXISTS trigger_update_applications ON applications;
CREATE TRIGGER trigger_update_applications
    BEFORE UPDATE ON applications
    FOR EACH ROW EXECUTE FUNCTION update_timestamp_column();

-- Trigger Function:-- Auto-provision Profile on Signup Trigger (Safe & Bulletproof)
CREATE OR REPLACE FUNCTION public.handle_new_user_signup()
RETURNS TRIGGER 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.student_profiles (
        user_id,
        full_name,
        graduation_year,
        branch,
        college_name
    )
    VALUES (
        NEW.id,
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'full_name', ''), 'Student User'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'graduation_year', '')::INT, EXTRACT(YEAR FROM NOW())::INT),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'branch', ''), 'CSE'),
        COALESCE(NULLIF(NEW.raw_user_meta_data->>'college_name', ''), 'Engineering College')
    )
    ON CONFLICT (user_id) DO NOTHING;

    INSERT INTO public.student_preferences (user_id)
    VALUES (NEW.id)
    ON CONFLICT (user_id) DO NOTHING;

    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_signup();
