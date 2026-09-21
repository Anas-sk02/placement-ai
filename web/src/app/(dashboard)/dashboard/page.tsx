'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  TrendingUp,
  AlertCircle,
  Clock,
  ArrowRight,
  Radio,
  Plus,
  KanbanSquare,
  GraduationCap,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { InsightCard } from '@/components/insights/InsightCard';
import { SourceMessageDrawer } from '@/components/insights/SourceMessageDrawer';
import { ConvertToDeadlineModal } from '@/components/insights/ConvertToDeadlineModal';
import { PlacementInsight } from '@/types/insight.types';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';
import { useApplications } from '@/lib/hooks/useApplications';
import { useToast } from '@/components/ui/Toast';

const SAMPLE_INSIGHTS: PlacementInsight[] = [
  {
    id: 'ins-01',
    company_name: 'Goldman Sachs',
    role_title: 'Summer Analyst & Full-Time Engineer',
    opportunity_type: 'JOB',
    batch_year: '2026',
    salary_or_stipend: '₹24 - 30 LPA (Intern: ₹1.5L/mo)',
    min_cgpa: 7.5,
    allowed_branches: ['CSE', 'IT', 'ECE', 'EEE'],
    registration_deadline: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    application_url: 'https://forms.gle/gsachs2026campusdrive',
    action_required: 'Fill Google Form before 6 PM Sharp',
    urgency: 'CRITICAL',
    confidence_score: 0.98,
    extraction_provider: 'GEMINI',
    group_name: 'TPO Official Placements 2026',
    raw_message_text: `📢 *TPO Urgent Recruitment Update — Goldman Sachs 2026 Batch*

Dear Final Year Students,
Goldman Sachs has announced its 2026 Summer Analyst & Full-Time hiring drive for Engineering Graduates.

• Role: Summer Analyst / Engineering Associate
• Eligible Branches: CSE, IT, ECE, EEE (2026 Batch)
• Minimum Criteria: 7.5 CGPA and No Active Backlogs
• CTC: ₹24,00,000 - ₹30,00,000 Per Annum (Intern Stipend: ₹1.5L/mo)
• Registration Deadline: Today, 6:00 PM Sharp

🔗 Apply Form: https://forms.gle/gsachs2026campusdrive
⚠️ Late submissions will strictly not be accepted.`,
  },
  {
    id: 'ins-02',
    company_name: 'Amazon India',
    role_title: 'Software Development Engineer (SDE-1)',
    opportunity_type: 'JOB',
    batch_year: '2026',
    salary_or_stipend: '₹44.5 LPA (Base: ₹18.5L)',
    min_cgpa: 7.0,
    allowed_branches: ['CSE', 'IT', 'ECE'],
    registration_deadline: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    application_url: 'https://amazon.jobs/university-recruitment',
    action_required: 'Submit University Profile on Amazon Portal',
    urgency: 'HIGH',
    confidence_score: 0.96,
    extraction_provider: 'GEMINI',
    group_name: 'CSE & IT Placement Cell (Verified)',
    raw_message_text: `Amazon SDE-1 Drive 2026 Batch
Registration is now open on the Amazon University Jobs portal.
Branches: CSE, IT, ECE.
Eligibility: >= 7.0 CGPA, 0 active backlogs.
Deadline: Tomorrow 11:59 PM.
Portal Link: https://amazon.jobs/university-recruitment`,
  },
  {
    id: 'ins-03',
    company_name: 'Uber India',
    role_title: 'Software Engineering Intern (Summer 2026)',
    opportunity_type: 'INTERNSHIP',
    batch_year: '2026',
    salary_or_stipend: '₹1,60,000 / month',
    min_cgpa: 8.0,
    allowed_branches: ['CSE', 'IT'],
    registration_deadline: new Date(Date.now() + 52 * 3600 * 1000).toISOString(),
    application_url: 'https://uber.com/careers/internships',
    action_required: 'Register on HackerRank link sent to college email',
    urgency: 'MEDIUM',
    confidence_score: 0.94,
    extraction_provider: 'RULE_FALLBACK',
    group_name: 'Off-Campus Tech Internships & Drives 2026',
    raw_message_text: `Uber Summer Internship 2026
Stipend: ₹1.6L/month + cab allowance.
Minimum pointer: 8.0 CGPA (CSE / IT only).
Online Assessment is scheduled for Sunday. Register before Friday 6 PM.`,
  },
];

export default function DashboardPage() {
  const { profile } = useStudentProfile();
  const { applications, addApplication } = useApplications();
  const { success } = useToast();

  const [selectedRawInsight, setSelectedRawInsight] = useState<PlacementInsight | null>(null);
  const [selectedDeadlineInsight, setSelectedDeadlineInsight] = useState<PlacementInsight | null>(null);

  const handleSaveToKanban = (insight: PlacementInsight) => {
    addApplication({
      company_name: insight.company_name,
      role_title: insight.role_title || 'Software Engineer',
      status: 'SAVED',
      notes: `Saved from Dashboard feed (${insight.group_name || 'TPO Desk'})`,
    });
    success('Saved to Application Tracker', `${insight.company_name} is now on your Kanban board`);
  };

  return (
    <div className="page-container">
      {/* Welcome Banner */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Welcome back, {profile.full_name.split(' ')[0]}!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Placement Intelligence Active • {profile.branch} Batch of {profile.graduation_year} • CGPA: {profile.cgpa}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Link href="/applications">
            <Button variant="secondary" size="md" leftIcon={<KanbanSquare size={16} />}>
              Kanban Board ({applications.length})
            </Button>
          </Link>
          <Link href="/companies">
            <Button variant="primary" size="md" leftIcon={<GraduationCap size={16} />}>
              Company Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '32px',
        }}
      >
        <Card hoverable={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Monitored Groups</span>
            <Send size={18} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>4 Channels</div>
          <div style={{ fontSize: '12px', color: 'var(--status-eligible)', marginTop: '4px' }}>
            ● Ingesting in real-time
          </div>
        </Card>

        <Card hoverable={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tracked Applications</span>
            <KanbanSquare size={18} color="#a855f7" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-light)' }}>
            {applications.length} Drives
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active on Kanban Board
          </div>
        </Card>

        <Card hoverable={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Urgent Deadlines</span>
            <Clock size={18} color="var(--status-urgent)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--status-urgent)' }}>
            2 Expiring
          </div>
          <div style={{ fontSize: '12px', color: 'var(--status-urgent)', marginTop: '4px' }}>
            Next in 3.5 hours
          </div>
        </Card>

        <Card hoverable={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Eligibility Match</span>
            <CheckCircle2 size={18} color="var(--status-eligible)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--status-eligible)' }}>
            92% Qualified
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Matched with {profile.cgpa} CGPA ({profile.branch})
          </div>
        </Card>
      </div>

      {/* Urgent Top Alert Banner */}
      <div
        className="glass-card"
        style={{
          padding: '18px 24px',
          marginBottom: '32px',
          backgroundColor: 'rgba(244, 63, 94, 0.08)',
          border: '1px solid rgba(244, 63, 94, 0.3)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            className="pulse-urgent"
            style={{
              width: '38px',
              height: '38px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-urgent-bg)',
              border: '1px solid var(--status-urgent-border)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Clock size={20} color="var(--status-urgent)" />
          </div>
          <div>
            <div style={{ fontSize: '15px', fontWeight: 700, color: '#ffffff' }}>
              Goldman Sachs Campus Drive Closes at 6:00 PM Today
            </div>
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              CTC: ₹24 - 30 LPA • Eligibility: Eligible ✅ • Registration form requires resume submission.
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <a
            href="https://forms.gle/gsachs2026campusdrive"
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button variant="danger" size="md" rightIcon={<ArrowRight size={16} />}>
              Open Registration Form
            </Button>
          </a>
        </div>
      </div>

      {/* Main Placement Insights Feed */}
      <div>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Sparkles size={20} color="var(--primary-light)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Live Extracted Placement Opportunities
            </h2>
          </div>
          <Link href="/insights" style={{ fontSize: '13px', color: 'var(--primary-light)', fontWeight: 600 }}>
            View all 38 drives →
          </Link>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
            gap: '20px',
          }}
        >
          {SAMPLE_INSIGHTS.map((insight) => (
            <InsightCard
              key={insight.id}
              insight={insight}
              studentProfile={profile}
              onViewRaw={(ins) => setSelectedRawInsight(ins)}
              onTrackDeadline={(ins) => setSelectedDeadlineInsight(ins)}
              onSaveToKanban={handleSaveToKanban}
            />
          ))}
        </div>
      </div>

      {/* Raw Verification Side-Drawer */}
      <SourceMessageDrawer
        isOpen={Boolean(selectedRawInsight)}
        onClose={() => setSelectedRawInsight(null)}
        insight={selectedRawInsight}
      />

      {/* Add to Deadlines Modal */}
      <ConvertToDeadlineModal
        isOpen={Boolean(selectedDeadlineInsight)}
        onClose={() => setSelectedDeadlineInsight(null)}
        insight={selectedDeadlineInsight}
      />
    </div>
  );
}
