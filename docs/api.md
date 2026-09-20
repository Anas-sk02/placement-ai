# PlaceMint AI — REST API & Route Handler Specifications

> **API Architecture & Contract Reference**  
> *Next.js Server Route Handlers, authentication headers, request payloads, response models, and HTTP error standards.*

---

## 1. Authentication & Security Headers

Every request to PlaceMint AI API endpoints must be authenticated according to its role:

| Role | Auth Header | Description |
| :--- | :--- | :--- |
| **Student (Web/PWA)** | `Authorization: Bearer <supabase_jwt_token>` | Supabase Auth JWT token containing `sub` (User UUID). Verified via `supabase.auth.getUser()`. |
| **Telegram Worker** | `X-Worker-Secret: <TELEGRAM_WORKER_SECRET>` | Shared high-entropy secret between Next.js server and Python Render worker. |
| **Server Admin** | `Authorization: Bearer <SUPABASE_SERVICE_ROLE_KEY>` | Used only for server-side elevated background operations. Never exposed to browser. |

---

## 2. API Endpoints Catalog

```
/api
├── /telegram
│   ├── POST /api/telegram/auth/send-code       # Step 1: Initiate Phone OTP
│   ├── POST /api/telegram/auth/verify-code     # Step 2: Complete OTP & Save Session
│   ├── POST /api/telegram/sync-groups          # Trigger group discovery
│   ├── GET  /api/telegram/groups               # List discovered groups for user
│   └── POST /api/telegram/toggle-monitor       # Toggle monitoring ON/OFF for group
│
├── /messages
│   └── GET  /api/messages                      # Query ingested messages with filters
│
├── /insights
│   ├── POST /api/insights/analyze              # Run Gemini/Fallback on recent messages
│   ├── GET  /api/insights                      # List extracted opportunities & insights
│   ├── GET  /api/insights/[id]                 # Fetch single insight details
│   └── PATCH /api/insights/[id]                # Update bookmark / dismiss state
│
├── /deadlines
│   ├── GET  /api/deadlines                     # List tracked deadlines (with urgency)
│   ├── POST /api/deadlines                     # Create deadline from insight
│   ├── PATCH /api/deadlines/[id]               # Update status (COMPLETED/DISMISSED)
│   └── DELETE /api/deadlines/[id]              # Remove deadline
│
├── /applications (Phase 2)
│   ├── GET  /api/applications                  # List Kanban applications
│   ├── POST /api/applications                  # Add new application entry
│   └── PATCH /api/applications/[id]            # Move status (APPLIED, INTERVIEW, etc.)
│
├── /profile (Phase 2)
│   ├── GET  /api/profile                       # Fetch student placement profile
│   ├── PUT  /api/profile                       # Upsert profile details
│   └── POST /api/profile/check-eligibility     # Run deterministic eligibility engine
│
└── /worker-webhook
    ├── POST /api/worker-webhook/message-ingested # Worker notifies web of new message
    └── GET  /api/worker-webhook/active-monitored-groups # Worker fetches union of chats
```

---

## 3. Detailed Endpoint Contracts

### 3.1 Telegram Management

#### `POST /api/telegram/auth/send-code`
- **Auth**: User JWT
- **Request Body**:
  ```json
  {
    "phone_number": "+919876543210"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "phone_code_hash": "a1b2c3d4e5f6...",
    "message": "OTP code dispatched to Telegram account."
  }
  ```

#### `POST /api/telegram/toggle-monitor`
- **Auth**: User JWT
- **Request Body**:
  ```json
  {
    "group_id": "8f3b2c1a-5d4e-4f3a-8b1c-2d3e4f5a6b7c",
    "is_monitored": true
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "success": true,
    "group_id": "8f3b2c1a-5d4e-4f3a-8b1c-2d3e4f5a6b7c",
    "is_monitored": true,
    "updated_at": "2026-09-20T12:00:00Z"
  }
  ```

---

### 3.2 AI Insights & Opportunities

#### `POST /api/insights/analyze`
- **Auth**: User JWT
- **Request Body**:
  ```json
  {
    "group_id": "8f3b2c1a-5d4e-4f3a-8b1c-2d3e4f5a6b7c",
    "message_limit": 25,
    "force_provider": "GEMINI"
  }
  ```
- **Response `200 OK`**:
  ```json
  {
    "processed_count": 25,
    "extracted_insights_count": 3,
    "insights": [
      {
        "id": "e4f5a6b7-c8d9-4e0f-1a2b-3c4d5e6f7a8b",
        "company_name": "Goldman Sachs",
        "role_title": "Summer Analyst 2026",
        "opportunity_type": "INTERNSHIP",
        "salary_or_stipend": "₹1,50,000 / month",
        "batch_year": "2026",
        "eligibility_criteria": {
          "min_cgpa": 7.5,
          "allowed_branches": ["CSE", "IT", "ECE"],
          "max_active_backlogs": 0,
          "raw_text": "Min 7.5 CGPA, no active backlogs, CSE/IT/ECE only"
        },
        "deadline_timestamp": "2026-10-25T18:00:00Z",
        "application_url": "https://forms.gle/sampleGoldmanForm",
        "action_required": "Register before 6 PM on Oct 25",
        "urgency": "URGENT",
        "confidence_score": 0.95,
        "extraction_provider": "GEMINI",
        "source_message": {
          "id": "11223344-5566-7788-99aa-bbccddeeff00",
          "message_text": "Goldman Sachs is hiring 2026 batch for Summer Analyst role...",
          "timestamp": "2026-09-20T10:30:00Z"
        }
      }
    ]
  }
  ```

---

### 3.3 Deadlines & Reminders

#### `POST /api/deadlines`
- **Auth**: User JWT
- **Request Body**:
  ```json
  {
    "insight_id": "e4f5a6b7-c8d9-4e0f-1a2b-3c4d5e6f7a8b",
    "title": "Goldman Sachs Summer Analyst Registration",
    "company_name": "Goldman Sachs",
    "deadline_at": "2026-10-25T18:00:00Z",
    "action_url": "https://forms.gle/sampleGoldmanForm",
    "reminder_offsets": [24, 6, 1]
  }
  ```
- **Response `201 Created`**:
  ```json
  {
    "id": "778899aa-bbcc-ddeeff-0011-223344556677",
    "title": "Goldman Sachs Summer Analyst Registration",
    "status": "UPCOMING",
    "deadline_at": "2026-10-25T18:00:00Z",
    "reminders_scheduled": [
      { "offset_hours": 24, "scheduled_for": "2026-10-24T18:00:00Z", "status": "PENDING" },
      { "offset_hours": 6,  "scheduled_for": "2026-10-25T12:00:00Z", "status": "PENDING" },
      { "offset_hours": 1,  "scheduled_for": "2026-10-25T17:00:00Z", "status": "PENDING" }
    ]
  }
  ```

---

### 3.4 Worker Webhook & Monitored Union

#### `GET /api/worker-webhook/active-monitored-groups`
- **Auth**: `X-Worker-Secret: <TELEGRAM_WORKER_SECRET>`
- **Response `200 OK`**:
  ```json
  {
    "monitored_telegram_ids": [
      -1001234567890,
      -1009876543210,
      -1005544332211
    ],
    "count": 3
  }
  ```
