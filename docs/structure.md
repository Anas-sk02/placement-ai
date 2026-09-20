# PlaceMint AI — Project Structure & Module Architecture

> **Monorepo Architecture Blueprint**  
> *Separation of concerns between Next.js Fullstack Web Application and Python Telethon Ingestion Worker.*

---

## 1. High-Level Repository Architecture

PlaceMint AI is organized as a clean, unified workspace comprising two main subsystems sharing a Supabase PostgreSQL database:

```
placement-ai/
├── web/                     # Next.js 14+ (App Router) Fullstack Web Application & PWA
├── worker/                  # Python 3.11+ Telethon MTProto Background Worker
├── docs/                    # Complete Architecture, API, Security & Engineering Specs
├── supabase/                # Supabase PostgreSQL Migrations, Seed Data & DDL Scripts
└── package.json             # Root Workspace Configuration / Scripts
```

---

## 2. Directory Tree

```
c:\Users\wwa90\OneDrive\Desktop\placement-ai\
├── .gitignore
├── README.md
├── package.json
│
├── docs/
│   ├── project-overview.md
│   ├── structure.md
│   ├── database.md
│   ├── design.md
│   ├── business-rules.md
│   ├── ai-pipeline.md
│   ├── telegram.md
│   ├── api.md
│   ├── security.md
│   ├── testing.md
│   ├── deployment.md
│   ├── phases.md
│   ├── implementation.md
│   └── future-roadmap.md
│
├── supabase/
│   ├── config.toml
│   ├── migrations/
│   │   ├── 20260920000001_initial_schema.sql
│   │   ├── 20260920000002_rls_policies.sql
│   │   ├── 20260920000003_indexes_and_triggers.sql
│   │   └── 20260920000004_seed_test_data.sql
│   └── seed.sql
│
├── web/
│   ├── .env.example
│   ├── .env.local
│   ├── next.config.mjs
│   ├── package.json
│   ├── tsconfig.json
│   ├── public/
│   │   ├── favicon.ico
│   │   ├── manifest.json            # PWA Manifest
│   │   ├── sw.js                    # Service Worker for push notifications & offline caching
│   │   └── icons/
│   │       ├── icon-192x192.png
│   │       └── icon-512x512.png
│   │
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx           # Root Layout with Supabase Auth Provider & Theme
│   │   │   ├── page.tsx             # Landing / Marketing Page
│   │   │   ├── (auth)/
│   │   │   │   ├── login/page.tsx
│   │   │   │   ├── register/page.tsx
│   │   │   │   └── auth-code-error/page.tsx
│   │   │   │
│   │   │   ├── (dashboard)/
│   │   │   │   ├── layout.tsx       # Authenticated App Shell (Sidebar, Header, Alerts)
│   │   │   │   ├── dashboard/page.tsx   # Main Overview Dashboard
│   │   │   │   ├── telegram/
│   │   │   │   │   ├── page.tsx     # Telegram Discovery & Monitor Management
│   │   │   │   │   └── connect/page.tsx # Telegram Auth (Phone / OTP modal)
│   │   │   │   ├── insights/
│   │   │   │   │   ├── page.tsx     # Extracted Opportunities & Insights Feed
│   │   │   │   │   └── [id]/page.tsx# Single Opportunity / Insight Detail
│   │   │   │   ├── deadlines/
│   │   │   │   │   ├── page.tsx     # Deadlines List & Calendar View
│   │   │   │   │   └── calendar/page.tsx
│   │   │   │   ├── applications/
│   │   │   │   │   └── page.tsx     # Kanban Application Tracker (Phase 2)
│   │   │   │   ├── profile/
│   │   │   │   │   └── page.tsx     # Student Placement Profile & Eligibility (Phase 2)
│   │   │   │   ├── assistant/
│   │   │   │   │   └── page.tsx     # AI Placement Chat Assistant (Phase 3)
│   │   │   │   └── settings/
│   │   │   │       └── page.tsx     # Preferences, Reminders, Worker Status, Session Sync
│   │   │   │
│   │   │   └── api/                 # Next.js Server Route Handlers
│   │   │       ├── auth/
│   │   │       │   └── callback/route.ts
│   │   │       ├── telegram/
│   │   │       │   ├── auth/route.ts          # Start Telethon Auth / Submit OTP
│   │   │       │   ├── sync-groups/route.ts   # Trigger Group Discovery
│   │   │       │   ├── toggle-monitor/route.ts# Toggle Group Monitoring ON/OFF
│   │   │       │   └── groups/route.ts        # List Discovered Groups for User
│   │   │       ├── messages/
│   │   │       │   └── route.ts               # Ingest/Query Stored Telegram Messages
│   │   │       ├── insights/
│   │   │       │   ├── analyze/route.ts       # Trigger Gemini / Fallback Rule Parser
│   │   │       │   ├── route.ts               # List / Filter Stored Insights
│   │   │       │   └── [id]/route.ts          # Get / Update Specific Insight
│   │   │       ├── deadlines/
│   │   │       │   ├── route.ts               # CRUD Deadlines
│   │   │       │   └── [id]/route.ts
│   │   │       ├── applications/
│   │   │       │   └── route.ts               # CRUD Application States
│   │   │       ├── profile/
│   │   │       │   ├── route.ts               # Student Profile CRUD
│   │   │       │   └── check-eligibility/route.ts # Run Deterministic Rule Engine
│   │   │       ├── notifications/
│   │   │       │   ├── register-token/route.ts# Register Web Push / FCM Token
│   │   │       │   └── test/route.ts
│   │   │       └── worker-webhook/
│   │   │           ├── message-ingested/route.ts # Webhook called by worker on new message
│   │   │           └── sync-session/route.ts     # Secret endpoint for session sync
│   │   │
│   │   ├── components/
│   │   │   ├── ui/                  # Design System Primitives (Buttons, Badges, Modals, Cards)
│   │   │   │   ├── Button.tsx
│   │   │   │   ├── Badge.tsx
│   │   │   │   ├── Card.tsx
│   │   │   │   ├── Modal.tsx
│   │   │   │   ├── Tabs.tsx
│   │   │   │   ├── Skeleton.tsx
│   │   │   │   └── Toast.tsx
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.tsx
│   │   │   │   ├── Navbar.tsx
│   │   │   │   └── UserDropdown.tsx
│   │   │   ├── dashboard/
│   │   │   │   ├── UrgentDeadlinesCard.tsx
│   │   │   │   ├── RecentInsightsFeed.tsx
│   │   │   │   ├── EligibilitySummaryCard.tsx
│   │   │   │   └── IngestionStatusBanner.tsx
│   │   │   ├── telegram/
│   │   │   │   ├── TelegramConnectModal.tsx
│   │   │   │   ├── GroupListTable.tsx
│   │   │   │   ├── GroupFilterTabs.tsx
│   │   │   │   └── SyncSessionButton.tsx
│   │   │   ├── insights/
│   │   │   │   ├── InsightCard.tsx
│   │   │   │   ├── SourceMessageDrawer.tsx
│   │   │   │   ├── ConvertToDeadlineModal.tsx
│   │   │   │   └── ConfidenceIndicator.tsx
│   │   │   ├── deadlines/
│   │   │   │   ├── DeadlineCard.tsx
│   │   │   │   ├── CalendarGrid.tsx
│   │   │   │   └── ReminderOffsetSelector.tsx
│   │   │   ├── applications/
│   │   │   │   ├── KanbanBoard.tsx
│   │   │   │   └── ApplicationStatusCard.tsx
│   │   │   └── notifications/
│   │   │       ├── NotificationPrompt.tsx
│   │   │       └── NotificationBell.tsx
│   │   │
│   │   ├── lib/
│   │   │   ├── supabase/
│   │   │   │   ├── client.ts        # Browser Supabase Client (Anon Key)
│   │   │   │   ├── server.ts        # Server-Side Supabase Client (SSR Cookies)
│   │   │   │   └── admin.ts         # Service Role Client (Secured Server-Only)
│   │   │   ├── ai/
│   │   │   │   ├── gemini.ts        # Google Gemini 1.5/2.0 API Client & Structured Output
│   │   │   │   ├── fallback-rules.ts# Deterministic Regex & NLP Pattern Matcher
│   │   │   │   ├── prompt-templates.ts
│   │   │   │   └── confidence.ts    # Confidence Scoring Algorithm
│   │   │   ├── business/
│   │   │   │   ├── eligibility-checker.ts # Deterministic Eligibility Rule Engine
│   │   │   │   ├── reminder-scheduler.ts  # Reminder Calculation (24h, 6h, 1h offsets)
│   │   │   │   └── deduplication.ts       # Hash & Text Similarity Engine
│   │   │   ├── crypto/
│   │   │   │   └── session-cipher.ts      # AES-256-GCM Session Encryption
│   │   │   └── utils/
│   │   │       ├── date-helpers.ts
│   │   │       └── formatting.ts
│   │   │
│   │   ├── types/
│   │   │   ├── database.types.ts    # Generated Supabase Database Types
│   │   │   ├── telegram.types.ts    # Telegram Channel, Message, Session interfaces
│   │   │   ├── insight.types.ts     # Extracted Placement Opportunity models
│   │   │   ├── deadline.types.ts    # Deadline and Reminder definitions
│   │   │   └── student.types.ts     # Profile and Eligibility interfaces
│   │   │
│   │   └── styles/
│   │       └── globals.css          # Core CSS Variables, Design Tokens & Reset
│   │
│   └── tests/
│       ├── unit/
│       │   ├── eligibility.test.ts
│       │   ├── fallback-parser.test.ts
│       │   └── reminders.test.ts
│       └── integration/
│           └── insight-flow.test.ts
│
└── worker/
    ├── requirements.txt             # Telethon, Pydantic, Requests, Cryptography, etc.
    ├── Dockerfile                   # Render / Container Deployment
    ├── config.py                    # Environment & Secret Settings
    ├── main.py                      # Worker Entrypoint & Async Event Loop
    ├── services/
    │   ├── telegram_client.py       # Telethon MTProto Client Wrapper
    │   ├── group_discovery.py       # Discovers User Channels & Groups
    │   ├── message_listener.py      # Real-time NewMessage Handler
    │   ├── history_backfill.py      # Historical Message Sync Engine
    │   └── supabase_syncer.py       # Direct Supabase PostgreSQL / REST Ingestion
    ├── utils/
    │   ├── security.py              # Encryption/Decryption of Session Strings
    │   └── logger.py                # Structured JSON Logging
    └── tests/
        └── test_discovery.py
```

---

## 3. Module Boundaries & Communication Protocols

```
+-----------------------------------------------------------------------------------------+
|                                    MODULE BOUNDARIES                                    |
+-----------------------------------------------------------------------------------------+
|  1. WEB UI (Next.js Client Components)                                                  |
|     - Never accesses database directly.                                                 |
|     - Interacts strictly via Next.js Server Actions or /api route handlers.             |
|     - Uses Supabase client for real-time channel subscriptions with user RLS.           |
+-----------------------------------------------------------------------------------------+
|  2. WEB SERVER (Next.js App Router API & Server Actions)                                |
|     - Validates authentication token (Supabase Auth JWT).                               |
|     - Executes Gemini AI analysis or Smart-Rule fallback extraction.                    |
|     - Executes deterministic eligibility rules.                                         |
|     - Emits background webhook signals to Python Worker via TELEGRAM_WORKER_SECRET.     |
+-----------------------------------------------------------------------------------------+
|  3. PYTHON TELETHON WORKER (Render Dedicated Process)                                   |
|     - Maintains active MTProto connection with Telegram servers.                        |
|     - Polls/receives monitored channel list from Supabase or Web API.                   |
|     - Ingests raw messages and stores them in Supabase `telegram_messages` table.       |
|     - Never runs AI inference directly (delegates compute to Web API / Gemini).         |
+-----------------------------------------------------------------------------------------+
|  4. SUPABASE POSTGRESQL (Shared State Store)                                            |
|     - Enforces Row-Level Security (RLS) ensuring strict student isolation.              |
|     - Central truth for groups, messages, extracted insights, deadlines, and reminders. |
+-----------------------------------------------------------------------------------------+
```

---

## 4. Technology Stack Matrix

| Layer | Primary Technology | Rationale |
| :--- | :--- | :--- |
| **Frontend UI** | Next.js 14+ (App Router) + Vanilla CSS System | High performance, server-side rendering, seamless PWA support, fine-grained visual control. |
| **Backend API** | Next.js Server Route Handlers (Node.js / Edge) | Unified TypeScript codebase, native integration with Supabase SSR clients. |
| **Database & Auth** | Supabase PostgreSQL + Supabase Auth | Native RLS isolation, robust relational integrity, triggers, Realtime events. |
| **Telegram Ingestion** | Python 3.11 + Telethon (MTProto API) | Full Telegram MTProto client capabilities, async group discovery, real-time message handlers. |
| **Primary AI Engine** | Google Gemini 1.5 / 2.0 Flash (`@google/genai`) | Large context window, fast structured JSON schema output, high multilingual accuracy. |
| **Fallback Engine** | TypeScript Deterministic Regex & Rule Parser | Guaranteed availability when AI quota is exceeded or network is offline. |
| **Notifications** | Web Notifications API + Service Worker (PWA) | Lightweight, cross-platform desktop and mobile alerts. |
| **Hosting** | Vercel (Web App) + Render (Python Worker) | Optimized edge delivery for Next.js and persistent runtime for Telethon daemon. |
