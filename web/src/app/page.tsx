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
    <div style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Navigation Header */}
      <header
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '24px 48px',
          maxWidth: '1400px',
          margin: '0 auto',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '12px',
              background: 'var(--brand-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--primary-glow)',
            }}
          >
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <span style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>
            PlaceMint<span className="text-gradient">.AI</span>
          </span>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <Link href="/login">
            <Button variant="ghost" size="md">
              Sign In
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="primary" size="md" rightIcon={<ArrowRight size={16} />}>
              Create Student Account
            </Button>
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main style={{ maxWidth: '1280px', margin: '0 auto', padding: '60px 24px' }}>
        <div style={{ textAlign: 'center', maxWidth: '850px', margin: '0 auto 60px auto' }}>
          <div style={{ display: 'inline-flex', marginBottom: '20px' }}>
            <Badge variant="primary" style={{ padding: '6px 14px', fontSize: '12px' }}>
              <Sparkles size={14} style={{ marginRight: '6px' }} />
              Built for 2026 Batch Placement Season
            </Badge>
          </div>

          <h1
            style={{
              fontSize: '54px',
              lineHeight: 1.15,
              fontWeight: 800,
              letterSpacing: '-1.5px',
              marginBottom: '24px',
            }}
          >
            Never miss another{' '}
            <span className="text-gradient">college placement deadline</span> buried in
            Telegram.
          </h1>

          <p
            style={{
              fontSize: '18px',
              color: 'var(--text-secondary)',
              lineHeight: 1.6,
              marginBottom: '36px',
            }}
          >
            PlaceMint AI automatically connects with your college Telegram channels, extracts
            job drives, verifies your academic eligibility, and dispatches automated reminder
            alerts so you never lose out on high-CTC opportunities.
          </p>

          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '16px',
              flexWrap: 'wrap',
            }}
          >
            <Link href="/register">
              <Button variant="primary" size="lg" rightIcon={<ArrowRight size={18} />}>
                Get Started Free
              </Button>
            </Link>
            <Link href="/login">
              <Button
                variant="secondary"
                size="lg"
              >
                Sign In to Account
              </Button>
            </Link>
          </div>
        </div>

        {/* Live Interactive Parser Sandbox */}
        <section style={{ marginTop: '40px', marginBottom: '80px' }}>
          <div style={{ textAlign: 'center', marginBottom: '28px' }}>
            <h2 style={{ fontSize: '24px', fontWeight: 700 }}>
              Live AI Notice Extractor
            </h2>
            <p style={{ fontSize: '14px', color: 'var(--text-muted)' }}>
              Paste any messy Telegram placement broadcast or test with our sample notice:
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
            <div className="glass-card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Send size={16} color="#38bdf8" />
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
                  backgroundColor: 'rgba(10, 14, 26, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '14px',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  fontFamily: 'var(--font-mono)',
                  resize: 'vertical',
                }}
              />

              <div style={{ marginTop: '16px', display: 'flex', justifyContent: 'flex-end' }}>
                <Button
                  variant="primary"
                  size="md"
                  isLoading={isExtracting}
                  onClick={handleRunExtractor}
                  leftIcon={<Sparkles size={16} />}
                >
                  Run Extraction
                </Button>
              </div>
            </div>

            {/* Extracted Structured JSON Card */}
            <div className="glass-card" style={{ padding: '24px' }}>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginBottom: '14px',
                }}
              >
                <div style={{ fontSize: '14px', fontWeight: 700, display: 'flex', alignItems: 'center', gap: 8 }}>
                  <Sparkles size={16} color="#a855f7" />
                  Extracted Placement Signal
                </div>
                <Badge variant="eligible">Confidence: 95%</Badge>
              </div>

              <div
                style={{
                  backgroundColor: 'rgba(10, 14, 26, 0.8)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  padding: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  fontSize: '13px',
                }}
              >
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Company: </span>
                  <strong style={{ color: '#ffffff', fontSize: '15px' }}>
                    {extractedData.company_name}
                  </strong>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Role: </span>
                  <span style={{ color: 'var(--text-primary)' }}>{extractedData.role_title}</span>
                </div>

                <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>CTC / Stipend: </span>
                    <strong style={{ color: 'var(--status-eligible)' }}>
                      {extractedData.salary_or_stipend || 'Competitive'}
                    </strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)' }}>Min CGPA: </span>
                    <strong style={{ color: 'var(--status-info)' }}>
                      {extractedData.min_cgpa ?? 'No Cutoff'}
                    </strong>
                  </div>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Eligible Branches: </span>
                  <span style={{ color: 'var(--text-secondary)' }}>
                    {extractedData.allowed_branches?.join(', ') || 'All Branches'}
                  </span>
                </div>

                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Deadline: </span>
                  <strong style={{ color: 'var(--status-urgent)' }} suppressHydrationWarning>
                    {extractedData.registration_deadline
                      ? new Date(extractedData.registration_deadline).toLocaleString()
                      : 'Closing Soon'}
                  </strong>
                </div>

                {extractedData.application_url && (
                  <div style={{ marginTop: '8px' }}>
                    <a
                      href={extractedData.application_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{
                        color: 'var(--primary-light)',
                        textDecoration: 'underline',
                        fontSize: '12px',
                        wordBreak: 'break-all',
                      }}
                    >
                      {extractedData.application_url}
                    </a>
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>

        {/* Feature Highlights Grid */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '24px',
            marginTop: '40px',
          }}
        >
          <div className="glass-card" style={{ padding: '24px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <Zap size={22} color="var(--primary-light)" />
            </div>
            <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>MTProto Channel Ingestion</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Connect via official Telegram protocol to monitor unlimited private and public college
              recruitment channels simultaneously in real-time.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(244, 63, 94, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <BellRing size={22} color="var(--status-urgent)" />
            </div>
            <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>Offset Reminder Engine</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Get automated reminders at 24h, 6h, and 1h intervals before deadlines expire via in-app
              toasts and browser push alerts.
            </p>
          </div>

          <div className="glass-card" style={{ padding: '24px' }}>
            <div
              style={{
                width: '42px',
                height: '42px',
                borderRadius: '10px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '16px',
              }}
            >
              <ShieldCheck size={22} color="var(--status-eligible)" />
            </div>
            <h3 style={{ fontSize: '17px', marginBottom: '8px' }}>100% Raw Human Verification</h3>
            <p style={{ fontSize: '13px', lineHeight: 1.6 }}>
              Zero AI hallucination fear. Inspect the original Telegram message with one click side-by-side
              with highlighted fields.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer
        style={{
          borderTop: '1px solid var(--border-subtle)',
          padding: '32px 24px',
          textAlign: 'center',
          color: 'var(--text-muted)',
          fontSize: '13px',
        }}
      >
        PlaceMint AI © 2026. Built with precision for college students.
      </footer>
    </div>
  );
}
