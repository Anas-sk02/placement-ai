# PlaceMint AI — AI Ingestion Pipeline & Fallback Parser Specification

> **Dual Extraction Engine Architecture**  
> *Gemini 1.5/2.0 Structured Output Parser paired with High-Speed Deterministic Regex Fallback Engine.*

---

## 1. Dual-Engine Architecture Overview

To ensure 100% operational uptime and zero critical missed deadlines, PlaceMint AI deploys a **dual-tier parsing strategy**:

```
                         Incoming Raw Message
                                  │
                    ┌─────────────┴─────────────┐
                    ▼                           ▼
          [ Is GEMINI_API_KEY           [ Gemini Missing, Rate-Limited,
            Configured & Healthy? ]       or Parse Failure? ]
                    │                           │
                    │ YES                       │ FALLBACK
                    ▼                           ▼
        ┌───────────────────────┐   ┌───────────────────────┐
        │  Gemini 1.5/2.0 Flash │   │  Smart Deterministic  │
        │  Structured Schema    │   │  Regex & NLP Engine   │
        └───────────┬───────────┘   └───────────┬───────────┘
                    │                           │
                    └─────────────┬─────────────┘
                                  ▼
                     [ Validation & Normalization ]
                                  │
                                  ▼
                     [ Structured Placement JSON ]
```

---

## 2. Gemini API Extraction Engine

### 2.1 Model & Configuration
- **Model**: `gemini-1.5-flash` or `gemini-2.0-flash`
- **Output Format**: `application/json` with strict JSON schema enforcement
- **Temperature**: `0.1` (ensuring near-zero stochastic hallucination and deterministic attribute extraction)

### 2.2 Structured JSON Extraction Schema

```json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "title": "PlacementOpportunityExtraction",
  "type": "object",
  "properties": {
    "is_placement_related": {
      "type": "boolean",
      "description": "True if the message contains a hiring, job, internship, drive, test, or workshop announcement."
    },
    "company_name": {
      "type": "string",
      "description": "Name of the hiring organization or company (e.g., 'Goldman Sachs', 'TCS', 'Infosys')."
    },
    "role_title": {
      "type": "string",
      "description": "Title of the position (e.g., 'Associate Software Engineer', 'Summer Intern 2026')."
    },
    "opportunity_type": {
      "type": "string",
      "enum": ["JOB", "INTERNSHIP", "ASSESSMENT", "CODING_TEST", "CAMPUS_DRIVE", "HACKATHON", "WORKSHOP_TRAINING", "OTHER"]
    },
    "salary_or_stipend": {
      "type": "string",
      "description": "Compensation details mentioned (e.g., '14 LPA', '₹50,000/month stipend', '7 - 9 LPA')."
    },
    "batch_year": {
      "type": "string",
      "description": "Eligible passing out batch (e.g., '2025', '2026', '2026 & 2027')."
    },
    "eligibility_criteria": {
      "type": "object",
      "properties": {
        "min_cgpa": { "type": "number", "description": "Minimum CGPA cut-off if specified (e.g., 7.0, 7.5)." },
        "min_percentage": { "type": "number", "description": "Minimum percentage cut-off if specified." },
        "allowed_branches": {
          "type": "array",
          "items": { "type": "string" },
          "description": "List of eligible engineering branches: ['CSE', 'IT', 'ECE', 'EEE', 'MECH', 'CIVIL', 'ALL']."
        },
        "max_active_backlogs": { "type": "integer", "description": "Maximum allowed active backlogs (default 0 if stated 'no live backlogs')." },
        "raw_text": { "type": "string", "description": "Exact text describing eligibility." }
      },
      "required": ["allowed_branches", "raw_text"]
    },
    "deadline_timestamp": {
      "type": "string",
      "description": "ISO 8601 UTC timestamp of the registration deadline (e.g., '2026-10-25T18:00:00Z'). Null if not stated."
    },
    "event_timestamp": {
      "type": "string",
      "description": "ISO 8601 UTC timestamp of the exam, interview, or drive date."
    },
    "application_url": {
      "type": "string",
      "description": "Direct application form, Google Form, Superset link, or portal URL."
    },
    "action_required": {
      "type": "string",
      "description": "Concise instruction for student (e.g., 'Fill Google form and upload resume before 5 PM today')."
    },
    "urgency": {
      "type": "string",
      "enum": ["LOW", "MEDIUM", "HIGH", "CRITICAL"]
    },
    "confidence_score": {
      "type": "number",
      "description": "Confidence score between 0.00 and 1.00 based on message clarity."
    }
  },
  "required": ["is_placement_related", "company_name", "opportunity_type", "urgency", "confidence_score"]
}
```

### 2.3 System Prompt Blueprint

```text
You are an expert collegiate placement intelligence parser specialized in extracting structured placement drive information from Indian college Telegram announcements.

Rules:
1. Extract factual information directly from the provided text.
2. DO NOT invent dates, links, or CTC figures. If a field is not present in the message, set it to null.
3. Convert relative dates (e.g., "by tomorrow 6 PM", "this Friday 11:59 PM") into absolute ISO 8601 UTC timestamps using the message arrival timestamp as the reference baseline.
4. Normalize company names (e.g., "GS" -> "Goldman Sachs", "AMZ" -> "Amazon", "JPMC" -> "JPMorgan Chase").
5. Return ONLY valid JSON adhering to the specified schema.
```

---

## 3. Fallback Smart Rule Engine (TypeScript & Regex)

When the Gemini API is inaccessible, rate-limited, or disabled, the deterministic fallback engine executes sequentially:

### 3.1 Regular Expression Patterns

```typescript
export const PLACEMENT_REGEX_RULES = {
  // 1. Company Patterns: Matches common announcement prefixes
  company: /(?:Company|Hiring Org|Drive for|Recruitment by|Company Name|Org):\s*([A-Za-z0-9\s&.,'-]+?)(?=\n|$|<br>)/i,

  // 2. Package / CTC Patterns (e.g., "12 LPA", "₹ 8.5 LPA", "Stipend: 45k/pm")
  ctc: /(?:CTC|Package|Salary|Stipend|Pay):\s*([₹$A-Za-z0-9\s.,\/-]+?(?:LPA|lpa|k|pm|per month|Per Annum))/i,

  // 3. CGPA Cutoffs (e.g., "CGPA >= 7.5", "Minimum 7.0 CGPA", "Cutoff: 6.5")
  cgpa: /(?:CGPA|GPA|Pointer)\s*(?:>=|:|is|cutoff|minimum)?\s*([0-9](?:\.[0-9]{1,2})?)/i,

  // 4. Batch Year (e.g., "2026 Batch", "2025/2026 Passouts")
  batch: /(?:Batch|Passing Out|Passouts|Year of Passing|YOP):\s*([2][0][2-3][0-9](?:\s*[-/&,]\s*[2][0][2-3][0-9])?)/i,

  // 5. Eligible Branches (CSE, IT, ECE, MECH, etc.)
  branches: /\b(CSE|IT|CS|ECE|EEE|MECH|CIVIL|AIDS|AIML|AI&DS|MCA|B\.Tech|BE|M\.Tech)\b/gi,

  // 6. Application Links (Google Forms, Microsoft Forms, Superset, Career Portals)
  applicationUrls: /(https?:\/\/(?:forms\.gle|docs\.google\.com\/forms|forms\.office\.com|app\.joinsuperset\.com|[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6})\/[^\s]+)/gi,

  // 7. Deadline Indicators
  deadline: /(?:Last Date|Deadline|Apply before|Register by|Registration Closes|Closes on):\s*([A-Za-z0-9\s,:-]+?(?:AM|PM|am|pm|hrs|hours|\d{4}))/i,
};
```

---

## 4. Confidence Scoring & Evidence Grounding

Every extracted insight carries a `confidence_score` computed as follows:

$$\text{Confidence Score} = \sum_{k} w_k \cdot \mathbb{I}(\text{field}_k \text{ is present and verified})$$

| Field ($k$) | Weight ($w_k$) | Verification Requirement |
| :--- | :--- | :--- |
| `company_name` | $0.30$ | Must match known company directory or structured heading |
| `deadline_timestamp` | $0.25$ | Successfully parsed into valid future ISO 8601 date |
| `application_url` | $0.20$ | Valid HTTP/HTTPS link extracted and reachable |
| `eligibility_criteria` | $0.15$ | At least one explicit branch or CGPA cutoff identified |
| `salary_or_stipend` | $0.10$ | Valid currency/LPA pattern matched |

- **High Confidence ($\ge 0.85$)**: Displays solid green badge; eligible for 1-click auto-deadline scheduling.
- **Medium Confidence ($0.60 - 0.84$)**: Displays amber badge; prompts student review.
- **Low Confidence ($< 0.60$)**: Flags `NEEDS_MANUAL_VERIFICATION`.
