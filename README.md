# PlaceMint AI — AI-Powered Placement Assistant

> **Telegram $\longrightarrow$ AI Placement Intelligence $\longrightarrow$ Deadlines $\longrightarrow$ Applications $\longrightarrow$ Reminders**  
> *Engineered with Next.js 14+ (App Router), Supabase PostgreSQL, and Python Telethon MTProto Worker.*

---

## 🌟 Master Engineering Documentation Suite

All architectural, implementation, design, database, API, and deployment documentation files have been generated:

| # | Document | File Path | Scope & Focus |
| :---: | :--- | :--- | :--- |
| **1** | **Project Overview** | [project-overview.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/project-overview.md) | High-level vision, problem statement, architecture, differentiators, and system data flow. |
| **2** | **Project Structure** | [structure.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/structure.md) | Monorepo layout, Next.js web app structure, Python worker boundaries, and shared types. |
| **3** | **Database Specification** | [database.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/database.md) | Complete Supabase PostgreSQL DDL schema, relationships, indexes, triggers, and RLS policies. |
| **4** | **UI/UX Design System** | [design.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/design.md) | Design tokens, color system, glassmorphism, responsive breakpoints, and screen wireframes. |
| **5** | **Business Rules Engine** | [business-rules.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/business-rules.md) | Deterministic student eligibility algorithms, deadline escalation matrices, and reminder offsets. |
| **6** | **AI Pipeline & Fallback** | [ai-pipeline.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/ai-pipeline.md) | Google Gemini structured JSON extraction schema, prompt templates, and regex fallback parser. |
| **7** | **Telegram Integration** | [telegram.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/telegram.md) | Python Telethon worker, session encryption, group discovery, and multi-user union listener. |
| **8** | **API Route Specifications** | [api.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/api.md) | Next.js server route handlers, auth headers, request/response models, and error handling. |
| **9** | **Security & Compliance** | [security.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/security.md) | AES-256-GCM session cipher, RLS security enforcement, secret segregation, and data privacy. |
| **10** | **Testing & QA Plan** | [testing.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/testing.md) | Unit tests, mock Telegram clients, RLS bypass attack verification, and E2E test flows. |
| **11** | **Deployment Runbook** | [deployment.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/deployment.md) | Step-by-step deployment guide for Vercel, Render, and Supabase, including `.env` setups. |
| **12** | **Implementation Blueprint**| [implementation.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/implementation.md) | Engineering assembly roadmap, helper utilities, and code creation order. |
| **13** | **Phased Roadmap & Milestones**| [phases.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/phases.md) | Sprint-by-sprint breakdown: Phase 1 (MVP) $\to$ Phase 2 (Expansion) $\to$ Phase 3 (Advanced). |
| **14** | **Future Roadmap (Phases 2 & 3)**| [future-roadmap.md](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/docs/future-roadmap.md) | Conversational RAG assistant, `pgvector` semantic matching, and preparation copilots. |

---

## 🚀 Ready-to-Run Supabase SQL Migrations

The database migration files have been generated in [supabase/migrations/](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/supabase/migrations/):
1. [`20260920000001_initial_schema.sql`](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/supabase/migrations/20260920000001_initial_schema.sql): Enums, student profiles, telegram connections, messages, insights, deadlines, reminders.
2. [`20260920000002_rls_policies.sql`](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/supabase/migrations/20260920000002_rls_policies.sql): Hardware-level Row Level Security policies for complete student isolation.
3. [`20260920000003_indexes_and_triggers.sql`](file:///c:/Users/wwa90/OneDrive/Desktop/placement-ai/supabase/migrations/20260920000003_indexes_and_triggers.sql): Composite query indexes and automated user provisioning triggers.

---

## 🛠️ Step-by-Step Execution Phases

```
Phase 1: MVP Core Pipeline
├── 1. Supabase Auth & Student Session
├── 2. Python Telethon Worker & Dynamic Group Sync
├── 3. Real-Time Message Ingestion & Supabase Storage
├── 4. Dual-Engine Extraction (Gemini 1.5/2.0 + Deterministic Fallback)
├── 5. Placement Insights Feed with Raw Message Verification Drawer
└── 6. Deadline Scheduler, Reminder Offsets (24h, 6h, 1h) & Browser Notifications

Phase 2: Placement Intelligence Expansion
├── 1. Student Profile & Deterministic Eligibility Evaluator
├── 2. Interactive Kanban Application Tracker
├── 3. Multi-Channel Duplicate Message Detection & Clustering
└── 4. Company Directory & Drive Tracking Hub

Phase 3: Advanced Intelligence
├── 1. Grounded AI Placement Chat Assistant (Conversational RAG)
├── 2. Placement Preparation Copilot & Test Syllabus Generator
├── 3. pgvector Semantic Opportunity & Skill Matcher
└── 4. Institutional Analytics & Placement Funnels
```
