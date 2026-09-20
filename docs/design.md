# PlaceMint AI — UI/UX Design System & Screen Specifications

> **Design Architecture**  
> *Design tokens, curated color systems, glassmorphism, typography, responsive layouts, and interactive component specifications.*

---

## 1. Design Philosophy & Aesthetic Guidelines

PlaceMint AI is built to deliver a **high-trust, high-clarity command center** for ambitious college students. The interface combines dark-mode elegance with high-contrast functional typography and subtle micro-animations.

### Core Visual Principles
1. **Zero Clutter, Maximum Signal**: Students are under cognitive overload during placement season. Key metadata (Company, CTC, Deadline, Eligibility) must be scannable in under 3 seconds.
2. **Glassmorphism & Depth**: Modern semi-transparent frosted glass cards with subtle multi-layer borders and glow states for active opportunities.
3. **Traceability & Verification**: Every extracted data point can be expanded to reveal the original raw Telegram message with one click.
4. **Action-Driven Feedback**: Smooth transitions, pulsating urgent deadline chips, and instant toast notifications.

---

## 2. Design System Tokens (Vanilla CSS)

```css
:root {
  /* Brand Palette - Deep Indigo / Emerald / Electric Violet */
  --bg-primary: #0b0f19;
  --bg-secondary: #111827;
  --bg-surface: rgba(17, 24, 39, 0.75);
  --bg-surface-hover: rgba(31, 41, 55, 0.85);
  --bg-glass: rgba(255, 255, 255, 0.03);
  --bg-glass-active: rgba(255, 255, 255, 0.08);

  /* Borders & Dividers */
  --border-subtle: rgba(255, 255, 255, 0.08);
  --border-focus: rgba(99, 102, 241, 0.5);
  --border-highlight: rgba(16, 185, 129, 0.4);

  /* Primary Accent & Gradients */
  --primary: #6366f1;           /* Indigo-500 */
  --primary-hover: #4f46e5;
  --primary-gradient: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  --accent-glow: 0 0 25px rgba(99, 102, 241, 0.25);

  /* Semantic Status Colors */
  --status-urgent: #ef4444;     /* Red-500 */
  --status-urgent-bg: rgba(239, 68, 68, 0.12);
  --status-urgent-glow: 0 0 15px rgba(239, 68, 68, 0.35);

  --status-eligible: #10b981;   /* Emerald-500 */
  --status-eligible-bg: rgba(16, 185, 129, 0.12);

  --status-warning: #f59e0b;    /* Amber-500 */
  --status-warning-bg: rgba(245, 158, 11, 0.12);

  --status-info: #38bdf8;       /* Sky-400 */
  --status-info-bg: rgba(56, 189, 248, 0.12);

  /* Typography Colors */
  --text-primary: #f8fafc;
  --text-secondary: #94a3b8;
  --text-muted: #64748b;
  --text-inverse: #0f172a;

  /* Typography System */
  --font-sans: 'Plus Jakarta Sans', 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --font-mono: 'JetBrains Mono', 'Fira Code', monospace;

  /* Elevation & Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-card: 0 10px 30px -10px rgba(0, 0, 0, 0.5), 0 0 1px 1px rgba(255, 255, 255, 0.05);
  --shadow-modal: 0 25px 50px -12px rgba(0, 0, 0, 0.75);

  /* Radii */
  --radius-sm: 6px;
  --radius-md: 10px;
  --radius-lg: 16px;
  --radius-full: 9999px;

  /* Animation Durations */
  --transition-fast: 150ms cubic-bezier(0.4, 0, 0.2, 1);
  --transition-normal: 250ms cubic-bezier(0.4, 0, 0.2, 1);
}
```

---

## 3. Screen Hierarchy & Navigation Architecture

```
[Student Enters App]
  ├── Public Landing (`/`) 
  │     ├── Hero Showcase
  │     ├── Interactive Live Demo
  │     └── Login / Sign Up Call to Action
  │
  ├── Authenticated App Shell (`/app`)
        ├── 1. Overview Dashboard (`/dashboard`)
        │     ├── Top Urgent Deadlines Carousel (< 24h)
        │     ├── New Opportunities Feed (Last 48h)
        │     ├── Quick Metric Counter (Active Drives, Monitored Groups, Applications)
        │     └── Ingestion & Worker Health Indicator
        │
        ├── 2. Telegram Group Hub (`/telegram`)
        │     ├── Connection & Session Status Banner
        │     ├── Sync All Groups Action
        │     ├── Monitored Groups Data Table (Sort by Last Active, Members)
        │     └── Live Ingestion Stream Drawer
        │
        ├── 3. Placement Insights & Explorer (`/insights`)
        │     ├── Filter Bar (Category, CTC, Min CGPA, Urgent Only)
        │     ├── Opportunity Cards (with Confidence Badges)
        │     ├── Side Drawer: Raw Telegram Message Inspector
        │     └── Modal: "Convert to Tracked Deadline / Application"
        │
        ├── 4. Deadlines & Calendar (`/deadlines`)
        │     ├── Tab 1: Timeline List (Urgent, Upcoming, Completed, Overdue)
        │     ├── Tab 2: Interactive Monthly Calendar Grid
        │     └── Reminder Configuration (24h, 6h, 1h offset toggles)
        │
        ├── 5. Application Tracker Kanban (`/applications` - Phase 2)
        │     ├── Columns: Saved | Applied | Assessment | Interview | Selected | Rejected
        │     └── Drag-and-Drop / Instant Status Update Modal
        │
        ├── 6. Placement Profile & Eligibility (`/profile` - Phase 2)
        │     ├── Academic Credentials (CGPA, Branch, Year, Backlogs)
        │     └── Live Eligibility Simulator
        │
        ├── 7. AI Placement Assistant (`/assistant` - Phase 3)
        │     └── Conversational RAG grounded in stored notices
        │
        └── 8. Settings & Notifications (`/settings`)
              ├── PWA / Browser Notification Permissions
              ├── Worker Session Re-sync
              └── AI Provider Config & Fallback Defaults
```

---

## 4. Key Screen Wireframe & Interaction Specs

### 4.1 Overview Dashboard (`/dashboard`)

```
+----------------------------------------------------------------------------------------------------+
|  [Logo] PlaceMint AI       [Search Insights...]       (Worker: Active 🟢)   [🔔 (2)]  [👤 Profile] |
+----------------------------------------------------------------------------------------------------+
|  Good morning, Anas! You have 2 urgent placement deadlines today.                                  |
|                                                                                                    |
|  +-- 🔥 URGENT DEADLINES (NEXT 24 HOURS) --------------------------------------------------------+ |
|  |  [ Goldman Sachs - Summer Analyst ]    Deadline: Today 6:00 PM  (3h left)   [ Apply Link ↗ ]  | |
|  |  CTC: ₹1.5L/mo | Min CGPA: 7.5 | 2026 Batch | Status: ELIGIBLE ✅           [ Mark Done ✅ ]  | |
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                    |
|  +-- 📊 SNAPSHOT METRICS -------------------------------------------------------------------------+ |
|  | [ 14 Monitored Groups ]  |  [ 38 Discovered Drives ]  |  [ 4 Active Applications ]  | [ 92% Match ]|
|  +-----------------------------------------------------------------------------------------------+ |
|                                                                                                    |
|  +-- ⚡ RECENT PLACEMENT INSIGHTS ------------------------------------+  +-- 🎯 ELIGIBILITY FEED -+ |
|  | [ Amazon - SDE-1 ] (Telegram: 'CSE Placements 2026')   [AI: 95%]   |  | Adobe (Off-Campus)     | |
|  | Roles: Backend, Distributed Systems | Deadline: Oct 25, 11:59 PM   |  | Eligible ✅ (CGPA > 8) | |
|  | [ View Raw Message ]  [ Add to Deadlines ]  [ Save to Kanban ]     |  | Microsoft (Intern)     | |
|  |--------------------------------------------------------------------|  | Needs Review ⚠️ (ECE)  | |
|  | [ Uber - SWE Intern ] (Telegram: 'OffCampus Opportunities')        |  +------------------------+ |
|  | Stipend: ₹1.6L/mo | Coding Test: Sunday 10 AM                      |                             |
|  +--------------------------------------------------------------------+                             |
+----------------------------------------------------------------------------------------------------+
```

### 4.2 Placement Insight Card Component Specs

Each insight card renders structured data extracted from Telegram with high visual polish:

```
+------------------------------------------------------------------------------------+
| [Company Icon]  Google India                                     [JOB]  [AI: 98%]  |
| Software Engineer (University Graduate - 2026 Batch)                               |
|                                                                                    |
| 💰 CTC: ₹28 - 34 LPA               🎓 Min CGPA: 7.0 / No Active Backlogs           |
| 📍 Location: Bengaluru / Hyderabad 📅 Reg. Deadline: Oct 28, 2026 - 11:59 PM       |
|                                                                                    |
| 🏷️ Eligibility: B.Tech / M.Tech (CSE, IT, ECE, EE) - 2026 Graduating Batch          |
| 📢 Source: "TPO Official 2026" (Ingested 12 mins ago)                              |
|                                                                                    |
| [ 👁️ View Original Message ]   [ ➕ Add to Calendar ]   [ 🚀 Open Application Form ↗ ]|
+------------------------------------------------------------------------------------+
```

### 4.3 Raw Source Message Modal Drawer

When a student clicks `View Original Message`, a side-drawer slides in from the right:
- **Title**: Raw Telegram Message Verification
- **Group Name & Timestamp**: "TPO Official 2026" • 2026-09-20 11:42 AM
- **Message Content**: Exact markdown-rendered text as posted by the placement coordinator.
- **AI Extraction Diff**: Side-by-side comparison highlighting where the AI pulled the company, CGPA, and deadline.
- **Verification Guarantee**: Eliminates AI hallucination anxiety by allowing 100% human cross-checking.

---

## 5. Responsive Behavior & Breakpoint Strategy

| Device | Breakpoint | Layout Strategy |
| :--- | :--- | :--- |
| **Mobile (PWA)** | `< 640px` | Single column vertical stack, bottom navigation bar (`Home`, `Insights`, `Deadlines`, `Groups`), full-screen modal drawers. |
| **Tablet** | `640px - 1024px` | Collapsible sidebar, 2-column card grid, scrollable Kanban board with horizontal touch-swipe. |
| **Desktop** | `> 1024px` | Fixed 260px sleek sidebar, multi-column dashboard with live split-view for raw message inspector and full calendar grid. |

---

## 6. Micro-Interactions & UI Delight

- **Pulsing Deadline Indicator**: Deadlines within `< 6 hours` display a glowing red radial pulse animation.
- **Instant Optimistic UI**: Toggling group monitoring updates the switch immediately with an animated checkmark before server confirmation.
- **Haptic Feedback**: On supported PWA mobile devices, saving an opportunity or completing a deadline triggers subtle haptic feedback.
- **Skeleton Loaders**: Zero content layout shifts; shimmer skeletons render during AI extraction and group synchronizations.
