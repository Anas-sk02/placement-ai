# PlaceMint AI — Deployment & Infrastructure Runbook

> **Production Deployment Blueprint**  
> *Vercel Web deployment, Render Python Telethon Worker containerization, Supabase PostgreSQL configuration, and environment variable setup.*

---

## 1. Multi-Tier Deployment Topology

```
                                  DNS: placemint.ai
                                         │
                   ┌─────────────────────┴─────────────────────┐
                   ▼                                           ▼
      ┌─────────────────────────┐                 ┌─────────────────────────┐
      │   VERCEL (Production)   │                 │   RENDER (Background)   │
      │   - Next.js 14 Web App  │                 │   - Python Telethon App │
      │   - Edge & Node APIs    │                 │   - Persistent MTProto  │
      │   - PWA Service Worker  │                 │   - Auto-Restart Daemon │
      └────────────┬────────────┘                 └────────────┬────────────┘
                   │                                           │
                   │               SUPABASE CLOUD              │
                   └─────────────────────┬─────────────────────┘
                                         ▼
                         ┌───────────────────────────────┐
                         │      Supabase PostgreSQL      │
                         │   - Auth / RLS Policies       │
                         │   - Realtime Broadcast        │
                         │   - Storage (Resumes)         │
                         └───────────────────────────────┘
```

---

## 2. Environment Variables Specification

### 2.1 Web Application (Vercel)

```bash
# ----------------------------------------------------
# Supabase Configuration
# ----------------------------------------------------
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...

# ----------------------------------------------------
# Telegram MTProto & Worker Synchronization
# ----------------------------------------------------
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=0123456789abcdef0123456789abcdef
TELEGRAM_SESSION_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef # 64-char hex
TELEGRAM_WORKER_SECRET=super_secret_worker_token_abc123xyz
TELEGRAM_WORKER_URL=https://placemint-worker.onrender.com

# ----------------------------------------------------
# AI Provider (Optional - Smart Fallback Active if Omitted)
# ----------------------------------------------------
GEMINI_API_KEY=AIzaSy...

# ----------------------------------------------------
# Push Notifications (Optional Firebase)
# ----------------------------------------------------
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BD...
VAPID_PRIVATE_KEY=...
FIREBASE_SERVICE_ACCOUNT_KEY=... # Optional
```

### 2.2 Telegram Worker (Render)

```bash
# ----------------------------------------------------
# Render Python Worker Environment
# ----------------------------------------------------
PYTHON_VERSION=3.11.8
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
TELEGRAM_API_ID=12345678
TELEGRAM_API_HASH=0123456789abcdef0123456789abcdef
TELEGRAM_SESSION_ENCRYPTION_KEY=0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef
TELEGRAM_WORKER_SECRET=super_secret_worker_token_abc123xyz
WEB_APP_URL=https://placemint.ai
PORT=8000
```

---

## 3. Step-by-Step Deployment Guide

### 3.1 Supabase Project Provisioning
1. Create a new Supabase project at [database.new](https://database.new).
2. Open the **SQL Editor** in your Supabase dashboard.
3. Execute the migration scripts in order:
   - `supabase/migrations/20260920000001_initial_schema.sql` (Creates types and tables)
   - `supabase/migrations/20260920000002_rls_policies.sql` (Applies security policies)
   - `supabase/migrations/20260920000003_indexes_and_triggers.sql` (Creates indexes and signup triggers)
4. Under **Authentication $\to$ Providers**, ensure Email/Password and OTP sign-in are enabled.

### 3.2 Next.js Web Deployment (Vercel)
1. Import the repository into Vercel.
2. Set Root Directory to `web`.
3. Add all Vercel environment variables specified above.
4. Deploy! Vercel will automatically build the static assets, Next.js server route handlers, and PWA manifest.

### 3.3 Python Telethon Worker Deployment (Render)
1. Create a new **Web Service** or **Background Worker** on Render.
2. Set Root Directory to `worker`.
3. Build Command: `pip install -r requirements.txt`.
4. Start Command: `python main.py`.
5. Add all Render environment variables listed in Section 2.2.
6. Verify worker logs display: `[INFO] Telethon Worker started. MTProto listener active.`

---

## 4. Operational Troubleshooting & Runbook

| Symptom | Root Cause | Resolution |
| :--- | :--- | :--- |
| **Only a few groups discovered** | User has archived chats or Telegram API returned paginated dialogs. | Ensure `GetDialogsRequest` pagination loop continues until `dialogs` is exhausted. |
| **Worker session invalid / GramJS error** | Render container redeployed or session string mismatch. | Click **"Sync Worker Session"** in Settings. The worker will reload the decrypted string from Supabase. |
| **No browser notifications popping up** | Notification permission blocked or PWA not installed on iOS. | On iOS, student must click "Add to Home Screen" first, open PWA, then grant notification permission. |
| **Weak AI analysis or timeouts** | Gemini quota exceeded or network spike. | PlaceMint AI automatically routes parsing through the deterministic **Regex Fallback Engine**. Verify `extraction_provider = 'RULE_FALLBACK'`. |
| **PostgreSQL RLS query returns empty array** | Student JWT token expired or mismatch between `auth.uid()` and `user_id`. | Refresh session via `supabase.auth.refreshSession()`. |
