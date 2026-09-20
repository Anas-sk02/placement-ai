# PlaceMint AI — Phased Implementation Roadmap & Milestone Matrix

> **Sprint & Milestone Engineering Blueprint**  
> *Phase 1 (MVP Core Pipeline) $\to$ Phase 2 (Placement Intelligence Expansion) $\to$ Phase 3 (Advanced Placement Intelligence).*

---

## 1. Master Phase Overview

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                                 PHASE 1: MVP CORE PIPELINE                             │
│  - Supabase Auth & Secure Student Session                                              │
│  - Telegram MTProto Connection & Dynamic Group Discovery                               │
│  - Multi-User Union Group Monitoring & Python Telethon Ingestion Worker                │
│  - Supabase PostgreSQL Storage (`telegram_messages`, `telegram_groups`)               │
│  - Gemini 1.5/2.0 AI Extraction + Deterministic Regex Fallback Parser                  │
│  - Structured Insights Feed & Raw Message Source Verification Drawer                   │
│  - Deadline Scheduler & Reminder Offset Engine (24h, 6h, 1h)                           │
│  - In-App & Browser Web Push Notification System                                       │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 2: PLACEMENT INTELLIGENCE EXPANSION                       │
│  - Comprehensive Student Placement Profile (CGPA, Branch, Year, Skills, Backlogs)      │
│  - Deterministic Rule-Based Eligibility Checker (Eligible / Not Eligible / Review)     │
│  - Full Placement Opportunity Directory & Category Filters (Job, Internship, Hackathon)│
│  - Interactive Kanban Application Tracker (Saved $\to$ Applied $\to$ Interview $\to$ Offer)  │
│  - Exact & Sliding Window Duplicate Message Deduplication Engine                       │
│  - Company Directory & Drive Tracking Hub                                              │
└───────────────────────────────────────────┬────────────────────────────────────────────┘
                                            │
                                            ▼
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                        PHASE 3: ADVANCED PLACEMENT INTELLIGENCE                        │
│  - Grounded AI Placement Chat Assistant (Conversational Q&A over student's notices)   │
│  - AI Preparation & Topic Suggestions for upcoming company tests / drives             │
│  - Placement Analytics Dashboard (Offer conversion rates, branch trends, CTC breakdown)│
│  - `pgvector` Semantic Similarity & Skill-to-Drive Matching Assistant                  │
└────────────────────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Phase 1 — MVP Core Pipeline (Detailed Sprints)

### Sprint 1.1: Foundation, Auth & Database Setup
- [ ] Initialize Next.js 14+ App Router project with Vanilla CSS design tokens.
- [ ] Apply Supabase PostgreSQL migrations (`001_initial_schema.sql`, `002_rls_policies.sql`, `003_indexes_and_triggers.sql`).
- [ ] Implement Supabase Auth (Sign Up, Sign In, Session Recovery, RLS validation).
- [ ] Build core UI shell: Sidebar, Navbar, Responsive Shell, Toast provider.

### Sprint 1.2: Telegram Connection & Discovery
- [ ] Set up Python Telethon background worker on Render with `requirements.txt`.
- [ ] Implement Phone Number + OTP verification modal in Next.js web app.
- [ ] Implement AES-256-GCM session encryption and persistence in `telegram_connections`.
- [ ] Implement dynamic group discovery (`GetDialogsRequest`) and populate `telegram_groups`.
- [ ] Build Group Selection UI: search, sorting by recent activity, and per-group `is_monitored` toggle.

### Sprint 1.3: Real-Time Ingestion & Storage
- [ ] Implement Telethon `events.NewMessage` listener on union of monitored channels.
- [ ] Ingest incoming messages with SHA-256 hash deduplication into `telegram_messages`.
- [ ] Set up Webhook between Render worker and Next.js server (`/api/worker-webhook/message-ingested`).

### Sprint 1.4: Dual-Engine Extraction (Gemini + Fallback)
- [ ] Implement Google Gemini 1.5/2.0 API parser with strict JSON schema.
- [ ] Implement deterministic Regex & NLP Fallback parser (`parsePlacementMessageFallback`).
- [ ] Build Extraction Manager: tries Gemini first, falls back immediately on quota/error.
- [ ] Store structured opportunities in `ai_insights`.

### Sprint 1.5: Insights, Deadlines & Notifications
- [ ] Build Placement Insights Feed with urgency badges, CTC highlights, and confidence indicators.
- [ ] Build Raw Source Message Drawer for 100% human verification.
- [ ] Implement "Convert Insight to Deadline" modal with reminder offsets (24h, 6h, 1h).
- [ ] Implement Browser Web Notifications & PWA service worker background alerts.

### Phase 1 Acceptance Criteria:
1. Student signs in, connects Telegram, and sees list of their real Telegram channels.
2. Toggling monitor ON for a group begins ingesting live messages into Supabase.
3. Running analysis produces structured insight JSON with Company, Role, CGPA, and Deadline.
4. Student can convert insight into a tracked deadline, and reminders are properly scheduled.
5. In-app or browser notification triggers at configured deadline offsets.

---

## 3. Phase 2 — Placement Intelligence Expansion

### Sprint 2.1: Student Profile & Deterministic Eligibility Engine
- [ ] Create Student Profile UI: Graduation Year, Branch, CGPA, Backlogs, 10th/12th marks, Skills.
- [ ] Implement deterministic `evaluateEligibility(student, criteria)` rule engine.
- [ ] Display real-time eligibility tags (`ELIGIBLE` ✅, `NOT_ELIGIBLE` ❌, `NEEDS_REVIEW` ⚠️) on all insight cards with exact reasons.

### Sprint 2.2: Kanban Application Tracker
- [ ] Build interactive 6-column Kanban board: `Saved`, `Applied`, `Assessment`, `Interview`, `Selected`, `Rejected`.
- [ ] Support drag-and-drop status changes and notes logging.
- [ ] Automatically sync deadline completion when moving application to `Applied` or `Selected`.

### Sprint 2.3: Duplicate Clustering & Company Directory
- [ ] Implement multi-channel duplicate clustering (grouping identical drives across 5+ groups).
- [ ] Build Company Directory page with historical placement drives and package stats.

### Phase 2 Acceptance Criteria:
1. Eligibility tags dynamically match student credentials with 100% deterministic accuracy.
2. Dragging an application to `Interview` or `Selected` updates PostgreSQL immediately with zero layout shift.
3. Duplicate forwarded announcements across channels are unified under a single parent opportunity.

---

## 4. Phase 3 — Advanced Intelligence

### Sprint 3.1: Grounded AI Placement Chat Assistant
- [ ] Build `/assistant` chat interface with streaming responses.
- [ ] Implement RAG retriever: queries user's stored opportunities, deadlines, and profile before prompting Gemini.
- [ ] Ground answers strictly in stored notices to eliminate hallucination.

### Sprint 3.2: Analytics & Preparation Assistant
- [ ] Generate personalized preparation roadmaps based on company interview patterns.
- [ ] Build Placement Analytics Dashboard: Application success funnel, top hiring branches, average CTC.
- [ ] Optional: PostgreSQL `pgvector` embeddings for semantic opportunity matching.

---

## 5. Regression Test Checkpoints

Before deploying each new phase, run the following regression checklist:
- [ ] **Auth Check**: New user signup provisions profile and preference defaults.
- [ ] **Telegram Sync**: Group discovery succeeds without exceeding rate limits.
- [ ] **Ingestion Integrity**: Telethon worker receives messages and writes to `telegram_messages`.
- [ ] **Fallback Invariant**: System continues extracting insights even with `GEMINI_API_KEY=""`.
- [ ] **RLS Isolation**: Cross-user SQL queries return 0 rows.
- [ ] **Reminder Engine**: Pending reminders dispatch on schedule without duplicate alerts.
