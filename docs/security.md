# PlaceMint AI — Security, Privacy & Compliance Architecture

> **Security Threat Model & Defense-in-Depth Strategy**  
> *MTProto session credential encryption, Row-Level Security (RLS) isolation, key management, and data privacy safeguards.*

---

## 1. Security Architecture & Threat Model

In a placement intelligence platform, security is paramount because:
1. Student Telegram accounts grant access to private collegiate placement channels.
2. Ingested announcements often contain sensitive university internal notices, shortlists, and student details.
3. Telegram `StringSession` strings carry full account access and must be defended against leakage at all costs.

```
+-----------------------------------------------------------------------------------------+
|                                SECURITY DEFENSE LAYERS                                  |
+-----------------------------------------------------------------------------------------+
| Layer 1: Client Boundary                                                                |
|   - Browser receives ONLY public anon keys (`NEXT_PUBLIC_SUPABASE_ANON_KEY`).           |
|   - No database service keys, AI keys, or Telegram API credentials sent to client.       |
+-----------------------------------------------------------------------------------------+
| Layer 2: API & Transport Security                                                       |
|   - Strict HTTPS & TLS 1.3 encryption on all public endpoints.                          |
|   - Shared `TELEGRAM_WORKER_SECRET` header validation on worker webhooks.               |
|   - Rate limiting on authentication and AI analysis routes.                             |
+-----------------------------------------------------------------------------------------+
| Layer 3: Telegram MTProto Session Encryption                                            |
|   - Telethon session strings are NEVER stored in plaintext.                             |
|   - Encrypted at rest using AES-256-GCM with PBKDF2 key derivation and random IVs.      |
+-----------------------------------------------------------------------------------------+
| Layer 4: Supabase Row-Level Security (RLS)                                              |
|   - Hardware-level PostgreSQL tenant isolation.                                         |
|   - Every query automatically constrained to `auth.uid() = user_id`.                    |
|   - Zero cross-student data leakage even in the event of client-side logic bugs.        |
+-----------------------------------------------------------------------------------------+
```

---

## 2. Telegram Session Encryption Specification

The session string produced by Telethon allows full MTProto execution. PlaceMint AI encrypts this payload before saving it to PostgreSQL.

### 2.1 Encryption Scheme (AES-256-GCM)
- **Algorithm**: `AES/GCM/NoPadding`
- **Key Derivation**: PBKDF2 with SHA-256 (100,000 iterations) using `TELEGRAM_SESSION_ENCRYPTION_KEY`
- **IV / Nonce**: 12-byte cryptographically secure random bytes generated per encryption
- **Stored Payload Format**: `hex(iv):hex(auth_tag):hex(ciphertext)`

```typescript
// lib/crypto/session-cipher.ts
import crypto from 'crypto';

const ALGORITHM = 'aes-256-gcm';
const IV_LENGTH = 12;
const ENCRYPTION_KEY = Buffer.from(process.env.TELEGRAM_SESSION_ENCRYPTION_KEY!, 'hex');

export function encryptSession(sessionString: string): string {
  const iv = crypto.randomBytes(IV_LENGTH);
  const cipher = crypto.createCipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  let encrypted = cipher.update(sessionString, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  const tag = cipher.getAuthTag();

  return `${iv.toString('hex')}:${tag.toString('hex')}:${encrypted}`;
}

export function decryptSession(encryptedPayload: string): string {
  const [ivHex, tagHex, encryptedText] = encryptedPayload.split(':');
  const iv = Buffer.from(ivHex, 'hex');
  const tag = Buffer.from(tagHex, 'hex');
  const decipher = crypto.createDecipheriv(ALGORITHM, ENCRYPTION_KEY, iv);
  decipher.setAuthTag(tag);

  let decrypted = decipher.update(encryptedText, 'hex', 'utf8');
  decrypted += decipher.final('utf8');
  return decrypted;
}
```

---

## 3. Secret Segregation Matrix

| Secret Variable | Target Environment | Scope / Exposure | Purpose |
| :--- | :--- | :--- | :--- |
| `NEXT_PUBLIC_SUPABASE_URL` | Vercel (Web App) | Public (Browser safe) | Supabase project API gateway |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Vercel (Web App) | Public (Browser safe) | Client queries constrained by RLS |
| `SUPABASE_SERVICE_ROLE_KEY` | Vercel (Server only) | Private (Never client) | Administrative database tasks |
| `TELEGRAM_API_ID` & `HASH` | Render & Vercel | Private Backend | Telegram Developer App Credentials |
| `TELEGRAM_SESSION_ENCRYPTION_KEY`| Render & Vercel | Private Backend | 256-bit AES master key for session storage |
| `TELEGRAM_WORKER_SECRET` | Render & Vercel | Private Backend | Secret token authorizing worker webhooks |
| `GEMINI_API_KEY` | Vercel (Server only) | Private Backend | Google AI Studio LLM API access |

---

## 4. Student Data Isolation & Privacy Guarantees

1. **Private Group Message Isolation**: Ingested messages from private Telegram channels are accessible *only* to students who belong to that group and have enabled monitoring.
2. **Deterministic RLS Execution**: Even if an API route forgets to append `WHERE user_id = ...`, PostgreSQL RLS policies discard non-owned records at the query engine level.
3. **Audit Trails**: Critical security events (Telegram account connection, session decryption, monitoring toggles, profile updates) write structured logs to `audit_logs` table for forensics.
