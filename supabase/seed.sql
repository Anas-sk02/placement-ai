-- Seed Data for PlaceMint AI
-- Includes sample companies, discovered telegram groups, messages, and insights

-- 1. Sample Companies
INSERT INTO companies (name, domain, logo_url, career_portal_url) VALUES
('Google India', 'google.com', 'https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg', 'https://careers.google.com'),
('Goldman Sachs', 'goldmansachs.com', 'https://upload.wikimedia.org/wikipedia/commons/6/61/Goldman_Sachs.svg', 'https://www.goldmansachs.com/careers'),
('Amazon India', 'amazon.jobs', 'https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg', 'https://amazon.jobs'),
('Microsoft', 'microsoft.com', 'https://upload.wikimedia.org/wikipedia/commons/9/96/Microsoft_logo_%282012%29.svg', 'https://careers.microsoft.com'),
('Uber', 'uber.com', 'https://upload.wikimedia.org/wikipedia/commons/c/cc/Uber_logo_2018.png', 'https://uber.com/careers'),
('Atlassian', 'atlassian.com', 'https://upload.wikimedia.org/wikipedia/commons/0/01/Atlassian-Logo.png', 'https://atlassian.com/careers')
ON CONFLICT (name) DO NOTHING;

-- 2. Sample Discovered Telegram Groups
INSERT INTO telegram_groups (telegram_id, title, username, chat_type, total_members, last_message_at) VALUES
(-1001829472910, 'TPO Official Placements 2026', 'tpo_placements_2026', 'CHANNEL', 2450, NOW() - INTERVAL '15 minutes'),
(-1001948271048, 'CSE & IT Placement Cell (Verified)', 'cse_placement_cell', 'SUPERGROUP', 820, NOW() - INTERVAL '45 minutes'),
(-1001739281940, 'Off-Campus Tech Internships & Drives 2026', 'offcampus_drives_26', 'CHANNEL', 15400, NOW() - INTERVAL '2 hours'),
(-1001628192039, 'ECE & Core Engineering Placement Desk', 'ece_core_desk', 'SUPERGROUP', 410, NOW() - INTERVAL '6 hours')
ON CONFLICT (telegram_id) DO NOTHING;
