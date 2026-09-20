# PlaceMint AI — Quality Assurance & Testing Strategy

> **Comprehensive Test Engineering Blueprint**  
> *Unit tests, integration pipelines, Telegram worker mocks, deterministic engine validation, security penetration checks, and regression test suites.*

---

## 1. Testing Pyramid & Test Architecture

PlaceMint AI implements a multi-layered testing strategy to guarantee that no critical placement deadline is ever missed due to code regressions or AI parsing errors.

```
                  ┌───────────────────────────────┐
                  │      E2E User Flow Tests      │  ~10% (Playwright)
                  │ (Connect -> Ingest -> Alert)  │
                  ├───────────────────────────────┤
                  │     API & Integration Tests   │  ~30% (Vitest / Supertest)
                  │ (Supabase RLS, Worker Webhook)│
                  ├───────────────────────────────┤
                  │       Unit Test Suites        │  ~60% (Vitest / Pytest)
                  │ (Eligibility, Regex, Offsets) │
                  └───────────────────────────────┘
```

---

## 2. Unit Testing Specifications

### 2.1 Deterministic Eligibility Engine Tests (`tests/unit/eligibility.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { evaluateEligibility } from '@/lib/business/eligibility-checker';
import { StudentProfile, OpportunityCriteria } from '@/types/student.types';

describe('Deterministic Eligibility Engine', () => {
  const sampleStudent: StudentProfile = {
    graduation_year: 2026,
    branch: 'CSE',
    cgpa: 8.2,
    active_backlogs: 0,
    history_backlogs: 0,
    skills: ['Java', 'React']
  };

  it('should return ELIGIBLE when student meets all criteria', () => {
    const criteria: OpportunityCriteria = {
      min_cgpa: 7.5,
      allowed_branches: ['CSE', 'IT'],
      batch_years: [2026],
      max_active_backlogs: 0
    };

    const result = evaluateEligibility(sampleStudent, criteria);
    expect(result.status).toBe('ELIGIBLE');
    expect(result.reasons).toHaveLength(0);
  });

  it('should return NOT_ELIGIBLE with specific reason when CGPA is below cutoff', () => {
    const criteria: OpportunityCriteria = {
      min_cgpa: 8.5,
      allowed_branches: ['CSE'],
      batch_years: [2026],
      max_active_backlogs: 0
    };

    const result = evaluateEligibility(sampleStudent, criteria);
    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.reasons[0]).toContain('CGPA 8.2 is below minimum requirement of 8.5');
  });

  it('should return NOT_ELIGIBLE when student has active backlogs exceeding cutoff', () => {
    const studentWithBacklog = { ...sampleStudent, active_backlogs: 1 };
    const criteria: OpportunityCriteria = {
      min_cgpa: 7.0,
      allowed_branches: ['CSE'],
      batch_years: [2026],
      max_active_backlogs: 0
    };

    const result = evaluateEligibility(studentWithBacklog, criteria);
    expect(result.status).toBe('NOT_ELIGIBLE');
    expect(result.reasons[0]).toContain('Active backlogs (1) exceeds maximum allowed (0)');
  });

  it('should return NEEDS_REVIEW when criteria is ambiguous or missing branch list', () => {
    const criteria: OpportunityCriteria = {
      min_cgpa: null,
      allowed_branches: [],
      batch_years: [2026],
      max_active_backlogs: 0
    };

    const result = evaluateEligibility(sampleStudent, criteria);
    expect(result.status).toBe('NEEDS_REVIEW');
  });
});
```

---

### 2.2 Fallback Regex Parser Tests (`tests/unit/fallback-parser.test.ts`)

```typescript
import { describe, it, expect } from 'vitest';
import { parsePlacementMessageFallback } from '@/lib/ai/fallback-rules';

describe('Fallback Smart Rule Parser', () => {
  it('should accurately parse standard Indian campus drive announcement', () => {
    const rawMessage = `
      *Company*: Goldman Sachs
      *Role*: Summer Analyst 2026
      *CTC*: ₹1.5L/month stipend
      *Batch*: 2026 Passouts only
      *Eligibility*: CSE, IT, ECE with CGPA >= 7.5 and no backlogs
      *Deadline*: Apply before 25th October 2026, 6:00 PM
      *Link*: https://forms.gle/sampleGS2026
    `;

    const parsed = parsePlacementMessageFallback(rawMessage);

    expect(parsed.company_name).toBe('Goldman Sachs');
    expect(parsed.opportunity_type).toBe('INTERNSHIP');
    expect(parsed.salary_or_stipend).toContain('1.5L/month');
    expect(parsed.eligibility_criteria.min_cgpa).toBe(7.5);
    expect(parsed.eligibility_criteria.allowed_branches).toEqual(expect.arrayContaining(['CSE', 'IT', 'ECE']));
    expect(parsed.application_url).toBe('https://forms.gle/sampleGS2026');
    expect(parsed.confidence_score).toBeGreaterThanOrEqual(0.70);
  });
});
```

---

## 3. Security & Row-Level Security Isolation Tests

| Test ID | Test Scenario | Expected Outcome |
| :--- | :--- | :--- |
| `SEC-001` | User A queries `ai_insights` belonging to User B | PostgreSQL returns `0` rows (RLS blocks access). |
| `SEC-002` | Worker calls `/api/worker-webhook/message-ingested` without secret | Returns `401 Unauthorized`. |
| `SEC-003` | User attempts to update another student's `student_profiles` | Query fails with `0` rows updated or RLS violation. |
| `SEC-004` | Client inspects network response for `/api/telegram/groups` | Encrypted session strings and API secrets are never present in payload. |

---

## 4. Integration & E2E Validation Flow

```mermaid
graph TD
    A[Start E2E Test Suite] --> B[1. Authenticate Mock User via Supabase]
    B --> C[2. Connect Mock Telegram Session]
    C --> D[3. Worker Ingests Synthetic Placement Message]
    D --> E[4. Verify Row in telegram_messages]
    E --> F[5. Trigger /api/insights/analyze]
    F --> G[6. Assert Structured Insight Created in ai_insights]
    G --> H[7. Create Deadline from Insight]
    H --> I[8. Verify 3 Reminder Records Scheduled (24h, 6h, 1h)]
    I --> J[9. Trigger Reminder Dispatch & Verify Notification Payload]
    J --> K[E2E Test Passed ✅]
```
