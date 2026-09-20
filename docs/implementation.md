# PlaceMint AI — Technical Implementation Blueprint

> **Engineering Assembly & Implementation Guide**  
> *Step-by-step development sequence, library integrations, state management patterns, and system contracts for coding agents.*

---

## 1. System Integration Flow & Code Layers

The PlaceMint AI codebase follows a clean, layered architecture:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        PRESENTATION LAYER (Next.js)                    │
│  - App Router Pages & Client Components                                │
│  - React Hooks for Supabase Auth, Optimistic State, and Realtime       │
│  - Custom Design System (Vanilla CSS Tokens & Micro-Animations)        │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                          SERVICE LAYER (Next.js Server)                │
│  - /api Route Handlers (Auth-protected with Supabase SSR)              │
│  - AI Ingestion Manager (`lib/ai/gemini.ts` + `lib/ai/fallback.ts`)    │
│  - Deterministic Rule Engine (`lib/business/eligibility-checker.ts`)   │
│  - AES-256 Session Cipher (`lib/crypto/session-cipher.ts`)             │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
                                    ▼
┌────────────────────────────────────────────────────────────────────────┐
│                           DATA & WORKER TIER                           │
│  - Supabase PostgreSQL (RLS Enforced, Triggers, Views)                 │
│  - Python Telethon MTProto Worker (Render Async Event Loop)            │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 2. Core Service Implementation Guidelines

### 2.1 Supabase Client Factory (`web/src/lib/supabase/`)

To support SSR, Client Components, and Administrative tasks securely, three dedicated client factories are maintained:

1. **Browser Client (`client.ts`)**:
   ```typescript
   import { createBrowserClient } from '@supabase/ssr';
   import { Database } from '@/types/database.types';

   export function createClient() {
     return createBrowserClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
     );
   }
   ```

2. **Server Client (`server.ts`)**:
   ```typescript
   import { createServerClient } from '@supabase/ssr';
   import { cookies } from 'next/headers';
   import { Database } from '@/types/database.types';

   export function createServerSupabaseClient() {
     const cookieStore = cookies();
     return createServerClient<Database>(
       process.env.NEXT_PUBLIC_SUPABASE_URL!,
       process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
       {
         cookies: {
           get(name: string) {
             return cookieStore.get(name)?.value;
           },
           set(name: string, value: string, options: any) {
             cookieStore.set({ name, value, ...options });
           },
           remove(name: string, options: any) {
             cookieStore.set({ name, value: '', ...options });
           },
         },
       }
     );
   }
   ```

3. **Admin / Service Role Client (`admin.ts`)**:
   ```typescript
   import { createClient } from '@supabase/supabase-js';
   import { Database } from '@/types/database.types';

   export const supabaseAdmin = createClient<Database>(
     process.env.NEXT_PUBLIC_SUPABASE_URL!,
     process.env.SUPABASE_SERVICE_ROLE_KEY!,
     {
       auth: {
         autoRefreshToken: false,
         persistSession: false
       }
     }
   );
   ```

---

### 2.2 Dual AI & Fallback Analysis Orchestrator (`web/src/lib/ai/extractor.ts`)

```typescript
import { parseWithGemini } from './gemini';
import { parsePlacementMessageFallback } from './fallback-rules';
import { PlacementInsight } from '@/types/insight.types';

export async function extractPlacementInsight(
  rawText: string,
  messageTimestamp: string
): Promise<PlacementInsight> {
  // Check if text is trivial chatter
  if (!rawText || rawText.trim().length < 15) {
    throw new Error('Message too short or invalid for extraction');
  }

  // 1. Attempt Gemini Structured AI Parsing if API Key is available
  if (process.env.GEMINI_API_KEY) {
    try {
      const geminiResult = await parseWithGemini(rawText, messageTimestamp);
      if (geminiResult && geminiResult.is_placement_related) {
        return {
          ...geminiResult,
          extraction_provider: 'GEMINI'
        };
      }
    } catch (err) {
      console.warn('[AI Pipeline] Gemini API extraction failed. Engaging Fallback Parser.', err);
    }
  }

  // 2. Fallback to Deterministic Smart Rule Regex Engine
  const fallbackResult = parsePlacementMessageFallback(rawText, messageTimestamp);
  return {
    ...fallbackResult,
    extraction_provider: 'RULE_FALLBACK'
  };
}
```

---

### 2.3 Deterministic Student Eligibility Engine (`web/src/lib/business/eligibility-checker.ts`)

```typescript
import { StudentProfile, OpportunityCriteria, EligibilityResult } from '@/types/student.types';

export function evaluateEligibility(
  student: StudentProfile,
  criteria: OpportunityCriteria
): EligibilityResult {
  const reasons: string[] = [];

  // Check 1: Graduation Batch Year
  if (criteria.batch_years && criteria.batch_years.length > 0) {
    if (!criteria.batch_years.includes(student.graduation_year)) {
      reasons.push(`Graduation batch (${student.graduation_year}) does not match required: ${criteria.batch_years.join(', ')}`);
    }
  }

  // Check 2: Minimum CGPA Cutoff
  if (criteria.min_cgpa != null && criteria.min_cgpa > 0) {
    if (student.cgpa == null || student.cgpa < criteria.min_cgpa) {
      reasons.push(`CGPA ${student.cgpa ?? 'N/A'} is below minimum requirement of ${criteria.min_cgpa}`);
    }
  }

  // Check 3: Allowed Engineering Branches
  if (criteria.allowed_branches && criteria.allowed_branches.length > 0) {
    const normalizedBranch = (student.branch || '').toUpperCase().trim();
    const isAll = criteria.allowed_branches.some(b => b.toUpperCase() === 'ALL' || b.toUpperCase() === 'OPEN FOR ALL');
    
    if (!isAll) {
      const hasBranchMatch = criteria.allowed_branches.some(b => b.toUpperCase() === normalizedBranch);
      if (!hasBranchMatch) {
        reasons.push(`Branch '${student.branch}' is not in eligible list: [${criteria.allowed_branches.join(', ')}]`);
      }
    }
  }

  // Check 4: Active Backlogs
  if (criteria.max_active_backlogs != null) {
    if ((student.active_backlogs || 0) > criteria.max_active_backlogs) {
      reasons.push(`Active backlogs (${student.active_backlogs}) exceeds maximum allowed (${criteria.max_active_backlogs})`);
    }
  }

  // Evaluation Decision
  if (reasons.length > 0) {
    return {
      status: 'NOT_ELIGIBLE',
      reasons,
      confidence: 1.0
    };
  }

  if (!criteria.min_cgpa && (!criteria.allowed_branches || criteria.allowed_branches.length === 0)) {
    return {
      status: 'NEEDS_REVIEW',
      reasons: ['Eligibility criteria was ambiguous in the source notice. Please verify.'],
      confidence: 0.6
    };
  }

  return {
    status: 'ELIGIBLE',
    reasons: [],
    confidence: 1.0
  };
}
```

---

## 3. Step-by-Step Code Assembly Order

When initiating development, coding agents and developers should follow this exact sequence:

1. **Step 1 — Database Migrations**: Execute PostgreSQL DDL scripts in Supabase SQL editor (`supabase/migrations/`).
2. **Step 2 — Web Application Scaffold**: Configure Next.js App Router, Tailwind/Vanilla CSS theme, and Supabase SSR clients.
3. **Step 3 — Supabase Authentication Flow**: Implement login, signup, user session state, and automatic profile creation trigger.
4. **Step 4 — Telethon Worker Service**: Deploy Python worker container with session encryption and MTProto listener.
5. **Step 5 — Telegram Auth & Group Discovery**: Build Next.js UI for phone OTP login and interactive group monitor toggle.
6. **Step 6 — Ingestion & AI Pipeline**: Connect worker webhook to message table and build Gemini/Fallback dual parser.
7. **Step 7 — Placement Insights Feed**: Build high-polish insight cards with raw message drawer verification.
8. **Step 8 — Deadlines & Reminders**: Implement deadline calendar, 24h/6h/1h offset calculations, and PWA browser notifications.
9. **Step 9 — Verification & Tests**: Run automated Vitest test suites across eligibility, parser, and RLS rules.
