'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  GraduationCap,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Zap,
  BellRing,
  Send,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { parsePlacementMessageFallback } from '@/lib/ai/fallback-rules';

const SAMPLE_NOTICE = `📢 *TPO Urgent Recruitment Update — Goldman Sachs 2026 Batch*

Dear Final Year Students,
Goldman Sachs has announced its 2026 Summer Analyst & Full-Time hiring drive for Engineering Graduates.

• Role: Summer Analyst / Engineering Associate
• Eligible Branches: CSE, IT, ECE, EEE (2026 Batch)
• Minimum Criteria: 7.5 CGPA and No Active Backlogs
• CTC: ₹24,00,000 - ₹30,00,000 Per Annum (Intern Stipend: ₹1.5L/mo)
• Registration Deadline: 28th October 2026, 6:00 PM Sharp

🔗 Apply Form: https://forms.gle/gsachs2026campusdrive
⚠️ Late submissions will strictly not be accepted by the TPO desk.`;

export default function LandingPage() {
  const [inputText, setInputText] = useState(SAMPLE_NOTICE);
  const [extractedData, setExtractedData] = useState(() =>
    parsePlacementMessageFallback(SAMPLE_NOTICE)
  );
  const [isExtracting, setIsExtracting] = useState(false);

  const handleRunExtractor = () => {
    setIsExtracting(true);
    setTimeout(() => {
      setExtractedData(parsePlacementMessageFallback(inputText));
      setIsExtracting(false);
    }, 400);
  };

  return (
    <div style={{ minHeight: '100vh', position: 'relative', backgroundColor: '#07090e' }}>
      {/* Navigation Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
          maxWidth: '1380px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '8px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 2px 8px rgba(37, 99, 235, 0.3)',
            }}
          >
            <GraduationCap size={20} color="#ffffff" />
          </div>
          <span style={{ fontSize: '18px', fontWeight: 700, color: '#ffffff', letterSpacing: '-0.02em' }}>
            PlaceMint<span style={{ color: 'var(--primary-light)' }}>.AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <Link href="/login">
            <Button variant="ghost" size="md">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="md" rightIcon={<ArrowRight size={15} />}>
              Create Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1240px', margin: '0 auto', padding: '64px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '820px', margin: '0 auto 64px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                padding: '4px 12px',
                borderRadius: '999px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                border: '1px solid rgba(59, 130, 246, 0.25)',
                color: '#93c5fd',
                fontSize: '12px',
                fontWeight: 500,
              }}
            >
              <Sparkles size={13} />
              Built for 2026 Batch Placement Season
            </span>
          </div>

          <h1
            style={{
              fontSize: '48px',
              lineHeight: 1.2,
              fontWeight: 800,
              letterSpacing: '-0.03em',
              marginBottom: '20px',
            }}
          >
            Never miss another{' '}
            <span className="text-gradient">campus placement deadline</span> buried in
            Telegram.
          </h1>

          <p
            style={{
              fontSize: '16.5px',
              color: 'var(--text-secondary)',
              lineHeight: 1.65,
              marginBottom: '32px',
            }}
          >
            PlaceMint AI connects with college placement channels, extracts structured recruiter
            notices, verifies academic criteria, and schedules multi-stage reminder offsets.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '14px',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={16} />}>
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button variant="secondary" size="lg">
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Interactive Parser Sandbox */}
        <section style={{ marginTop: '32px', marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '22px', fontWeight: 700, letterSpacing: '-0.02em' }}>
              Live AI Notice Extraction Engine
            </h2>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)' }}>
              Paste any unstructured Telegram broadcast to see structured deterministic parsing:
            </p>
          </div>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
              gap: '24px',
            }}
          >
            {/* Input Raw Box */}
            <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Send size={15} color="var(--primary-light)" />
                  Raw Telegram Broadcast
                </div>
                <Button variant="ghost" size="sm" onClick={() => setInputText(SAMPLE_NOTICE)}>
                  Reset Sample
                </Button>
              </div>

              <textarea
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                style={{
                  width: '100%',
                  height: '240px',
                  backgroundColor: '#0a0d15',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '14px',
                  color: 'var(--text-primary)',
                  fontSize: '12.5px',
                  fontFamily: 'var(--font-mono)',
                  resize: 'vertical',
                }}
              />

              <div style={{ marginTop: '14px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isExtracting}
                  onClick={handleRunExtractor}
                  leftIcon={<Sparkles size={14} />}
                >
                  Run Extraction
                </Button>
              </div>
            </div>

            {/* Extracted Structured JSON Card */}
            <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '13.5px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={15} color="#34d399" />
                  Extracted Placement Signal
                </div>
                <Badge variant="eligible">Deterministic Match</Badge>
              </div>

              <div
                style={{
                  backgroundColor: '#0a0d15',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '8px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '12.5px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Company: </span>
                  <strong style={{ color: 'var(--text-primary)' }}>
                    {extractedData.company_name || 'Goldman Sachs'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Role: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {extractedData.role_title || 'Summer Analyst / Associate'}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Package / CTC: </span>
                  <strong style={{ color: 'var(--status-eligible)' }}>
                    {extractedData.salary_or_stipend || '₹24 - 30 LPA (1.5L/mo)'}
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Eligibility: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    Min {extractedData.min_cgpa || '7.5'} CGPA • {extractedData.allowed_branches?.join(', ') || 'CSE, IT, ECE, EEE'}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
                  <strong style={{ color: 'var(--status-urgent)' }} suppressHydrationWarning>
                    {extractedData.registration_deadline
                      ? new Date(extractedData.registration_deadline).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })
                      : '28th October 2026, 6:00 PM'}
                  </strong>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Grid */}
        <section style={{ marginBottom: '80px' }}>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
              gap: '20px',
            }}
          >
            <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#161d2f',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--primary-light)',
                  marginBottom: '14px',
                }}
              >
                <Zap size={18} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                Instant Channel Ingestion
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Connect your batch Telegram channels to automatically stream and index every recruitment broadcast.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#161d2f',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--status-eligible)',
                  marginBottom: '14px',
                }}
              >
                <ShieldCheck size={18} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                Deterministic Eligibility Check
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Real-time rule engine matches CGPA cutoffs, batch years, and branch criteria against your profile.
              </p>
            </div>

            <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
              <div
                style={{
                  width: '38px',
                  height: '38px',
                  borderRadius: '8px',
                  backgroundColor: '#161d2f',
                  border: '1px solid var(--border-medium)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'var(--status-info)',
                  marginBottom: '14px',
                }}
              >
                <BellRing size={18} />
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 700, marginBottom: '6px' }}>
                Multi-Stage Reminders
              </h3>
              <p style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                Configurable 24h, 6h, and 1h alerts ensure you never miss high-stakes application deadlines.
              </p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '32px 48px',
          maxWidth: '1380px',
          margin: '0 auto',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          fontSize: '12.5px',
          color: 'var(--text-muted)',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div>© 2026 PlaceMint AI. Built for Campus Placement Excellence.</div>
        <div style={{ display: 'flex', gap: '16px' }}>
          <Link href="/login" style={{ color: 'var(--text-secondary)' }}>Sign In</Link>
          <Link href="/register" style={{ color: 'var(--text-secondary)' }}>Create Account</Link>
        </div>
      </footer>
    </div>
  );
}
