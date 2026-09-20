-- Migration: 20260920000002_rls_policies.sql
-- Description: Row Level Security (RLS) policies for complete student isolation

-- Enable Row Level Security
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

-- 1. Student Profiles
CREATE POLICY "Users can manage own profile"
    ON student_profiles FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 2. Student Preferences
CREATE POLICY "Users can manage own preferences"
    ON student_preferences FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 3. Telegram Connections
CREATE POLICY "Users can manage own telegram connection"
    ON telegram_connections FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 4. Telegram Groups (Visible if user has discovery link)
CREATE POLICY "Users can view discovered groups"
    ON telegram_groups FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_monitored_groups umg
            WHERE umg.group_id = telegram_groups.id AND umg.user_id = auth.uid()
        )
    );

-- 5. User Monitored Groups
CREATE POLICY "Users can manage own monitored groups"
    ON user_monitored_groups FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 6. Telegram Messages (Readable only by students monitoring the source group)
CREATE POLICY "Users can view messages from monitored groups"
    ON telegram_messages FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM user_monitored_groups umg
            WHERE umg.group_id = telegram_messages.group_id 
              AND umg.user_id = auth.uid()
              AND umg.is_monitored = TRUE
        )
    );

-- 7. AI Insights
CREATE POLICY "Users can manage own insights"
    ON ai_insights FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 8. Deadlines
CREATE POLICY "Users can manage own deadlines"
    ON deadlines FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 9. Applications
CREATE POLICY "Users can manage own applications"
    ON applications FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 10. Reminders
CREATE POLICY "Users can manage own reminders"
    ON reminders FOR ALL
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

-- 11. Companies (Public Read)
CREATE POLICY "Authenticated users can view companies"
    ON companies FOR SELECT
    TO authenticated
    USING (true);

-- 12. Opportunities (Public Read for Authenticated Students)
CREATE POLICY "Authenticated users can view opportunities"
    ON opportunities FOR SELECT
    TO authenticated
    USING (true);
