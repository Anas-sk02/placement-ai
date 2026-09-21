'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  CalendarClock,
  CheckCircle2,
  Clock,
  ArrowRight,
  Plus,
  KanbanSquare,
  GraduationCap,
  PlusCircle,
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

export default function DashboardPage() {
  const { profile } = useStudentProfile();
  const { applications, addApplication } = useApplications();
  const { success } = useToast();

  const [insights, setInsights] = useState<PlacementInsight[]>([]);
  const [monitoredCount, setMonitoredCount] = useState(0);
  const [urgentDeadlinesCount, setUrgentDeadlinesCount] = useState(0);
  const [urgentDeadline, setUrgentDeadline] = useState<any | null>(null);

  const [selectedRawInsight, setSelectedRawInsight] = useState<PlacementInsight | null>(null);
  const [selectedDeadlineInsight, setSelectedDeadlineInsight] = useState<PlacementInsight | null>(null);

  useEffect(() => {
    // Fetch live insights
    fetch('/api/insights')
      .then((res) => (res.ok ? res.json() : { insights: [] }))
      .then((data) => setInsights(data.insights || []))
      .catch(() => setInsights([]));

    // Fetch Telegram groups count
    fetch('/api/telegram/groups')
      .then((res) => (res.ok ? res.json() : { groups: [] }))
      .then((data) => {
        const groups = data.groups || [];
        setMonitoredCount(groups.length);
      })
      .catch(() => setMonitoredCount(0));

    // Fetch Deadlines
    fetch('/api/deadlines')
      .then((res) => (res.ok ? res.json() : { deadlines: [] }))
      .then((data) => {
        const deadlines = data.deadlines || [];
        const now = Date.now();
        const urgent = deadlines.filter((d: any) => {
          const diff = new Date(d.deadline_at).getTime() - now;
          return diff > 0 && diff <= 24 * 3600 * 1000 && d.status !== 'COMPLETED';
        });
        setUrgentDeadlinesCount(urgent.length);
        if (urgent.length > 0) {
          setUrgentDeadline(urgent[0]);
        }
      })
      .catch(() => setUrgentDeadlinesCount(0));
  }, []);

  const handleSaveToKanban = (insight: PlacementInsight) => {
    addApplication({
      company_name: insight.company_name,
      role_title: insight.role_title || 'Software Engineer',
      status: 'SAVED',
      notes: `Saved from Dashboard feed (${insight.group_name || 'TPO Desk'})`,
    });
    success('Saved to Application Tracker', `${insight.company_name} is now on your Kanban board`);
  };

  const studentName = profile.full_name ? profile.full_name.split(' ')[0] : 'Student';

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
            Welcome back, {studentName}!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Placement Intelligence Active • {profile.branch || 'CSE'} Batch of {profile.graduation_year || 2026} • CGPA: {profile.cgpa || 8.0}
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
        <Link href="/telegram" style={{ textDecoration: 'none' }}>
          <Card hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Monitored Groups</span>
              <Send size={18} color="var(--primary-light)" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>
              {monitoredCount} {monitoredCount === 1 ? 'Channel' : 'Channels'}
            </div>
            <div style={{ fontSize: '12px', color: monitoredCount > 0 ? 'var(--status-eligible)' : 'var(--text-muted)', marginTop: '4px' }}>
              {monitoredCount > 0 ? '● Ingesting in real-time' : '+ Click to add channel'}
            </div>
          </Card>
        </Link>

        <Link href="/applications" style={{ textDecoration: 'none' }}>
          <Card hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tracked Applications</span>
              <KanbanSquare size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-light)' }}>
              {applications.length} {applications.length === 1 ? 'Drive' : 'Drives'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Active on Kanban Board
            </div>
          </Card>
        </Link>

        <Link href="/deadlines" style={{ textDecoration: 'none' }}>
          <Card hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Urgent Deadlines</span>
              <Clock size={18} color={urgentDeadlinesCount > 0 ? 'var(--status-urgent)' : 'var(--text-muted)'} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: urgentDeadlinesCount > 0 ? 'var(--status-urgent)' : 'var(--text-primary)' }}>
              {urgentDeadlinesCount} Expiring
            </div>
            <div style={{ fontSize: '12px', color: urgentDeadlinesCount > 0 ? 'var(--status-urgent)' : 'var(--text-muted)', marginTop: '4px' }}>
              {urgentDeadlinesCount > 0 ? 'Expiring in < 24 hrs' : 'All caught up'}
            </div>
          </Card>
        </Link>

        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <Card hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Placement Profile</span>
              <CheckCircle2 size={18} color="var(--status-eligible)" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--status-eligible)' }}>
              {profile.cgpa || 8.0} CGPA
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {profile.branch || 'CSE'} • {profile.graduation_year || 2028} Batch
            </div>
          </Card>
        </Link>
      </div>

      {/* Urgent Top Alert Banner (Only shown if real urgent deadline exists) */}
      {urgentDeadline && (
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
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {urgentDeadline.title || `${urgentDeadline.company_name} Application Closing Soon`}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Deadline: {new Date(urgentDeadline.deadline_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Automated reminders active
              </div>
            </div>
          </div>

          {urgentDeadline.action_url && (
            <a href={urgentDeadline.action_url} target="_blank" rel="noopener noreferrer">
              <Button variant="urgent" size="sm" rightIcon={<ArrowRight size={14} />}>
                Open Registration Form
              </Button>
            </a>
          )}
        </div>
      )}

      {/* Live Extracted Placement Feed */}
      <div style={{ marginTop: '8px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '20px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary-light)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Live Extracted Placement Opportunities
            </h2>
          </div>

          <Link
            href="/insights"
            style={{
              fontSize: '13px',
              color: 'var(--primary-light)',
              fontWeight: 600,
              textDecoration: 'none',
            }}
          >
            View all notices ({insights.length}) →
          </Link>
        </div>

        {insights.length === 0 ? (
          <div
            className="glass-card"
            style={{
              padding: '48px 24px',
              textAlign: 'center',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '16px',
            }}
          >
            <div
              style={{
                width: '56px',
                height: '56px',
                borderRadius: '16px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.25)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Sparkles size={28} color="var(--primary-light)" />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                No Placement Notices Ingested Yet
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '480px', margin: '0 auto' }}>
                Connect your college Telegram channels or paste a recruitment notice to see Gemini Flash extract criteria in real-time.
              </p>
            </div>

            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <Link href="/telegram">
                <Button variant="secondary" size="md" leftIcon={<Send size={16} />}>
                  Connect Telegram Channel
                </Button>
              </Link>
              <Link href="/insights">
                <Button variant="primary" size="md" leftIcon={<PlusCircle size={16} />}>
                  Ingest First Notice with AI
                </Button>
              </Link>
            </div>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
              gap: '20px',
            }}
          >
            {insights.map((insight) => (
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
        )}
      </div>

      {/* Raw Drawer */}
      <SourceMessageDrawer
        isOpen={Boolean(selectedRawInsight)}
        onClose={() => setSelectedRawInsight(null)}
        insight={selectedRawInsight}
      />

      {/* Deadline Modal */}
      <ConvertToDeadlineModal
        isOpen={Boolean(selectedDeadlineInsight)}
        onClose={() => setSelectedDeadlineInsight(null)}
        insight={selectedDeadlineInsight}
      />
    </div>
  );
}
