'use client';

import React, { useState } from 'react';
import { CalendarClock, Plus, Filter, CheckCircle2, Clock, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DeadlineCard } from '@/components/deadlines/DeadlineCard';
import { DeadlineItem } from '@/types/deadline.types';
import { useToast } from '@/components/ui/Toast';

const SAMPLE_DEADLINES: DeadlineItem[] = [
  {
    id: 'dd-01',
    user_id: 'user-anas-01',
    company_name: 'Goldman Sachs',
    title: 'Goldman Sachs — Summer Analyst & Full-Time Application Form',
    deadline_at: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    status: 'URGENT',
    action_url: 'https://forms.gle/gsachs2026campusdrive',
  },
  {
    id: 'dd-02',
    user_id: 'user-anas-01',
    company_name: 'Amazon India',
    title: 'Amazon India — SDE-1 University Portal Registration',
    deadline_at: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    status: 'UPCOMING',
    action_url: 'https://amazon.jobs/university-recruitment',
  },
  {
    id: 'dd-03',
    user_id: 'user-anas-01',
    company_name: 'Uber India',
    title: 'Uber — HackerRank Online Coding Assessment',
    deadline_at: new Date(Date.now() + 52 * 3600 * 1000).toISOString(),
    status: 'UPCOMING',
    action_url: 'https://uber.com/careers',
  },
  {
    id: 'dd-04',
    user_id: 'user-anas-01',
    company_name: 'Microsoft',
    title: 'Microsoft — Career Portal Application Submission',
    deadline_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
    status: 'COMPLETED',
    action_url: 'https://careers.microsoft.com',
  },
];

export default function DeadlinesPage() {
  const { success } = useToast();
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>(SAMPLE_DEADLINES);
  const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');

  const handleComplete = (id: string) => {
    setDeadlines((prev) =>
      prev.map((d) =>
        d.id === id
          ? { ...d, status: d.status === 'COMPLETED' ? 'UPCOMING' : 'COMPLETED' }
          : d
      )
    );
    success('Deadline Updated', 'Status successfully synchronized');
  };

  const filtered = deadlines.filter((d) => {
    if (tab === 'ACTIVE') return d.status !== 'COMPLETED';
    if (tab === 'COMPLETED') return d.status === 'COMPLETED';
    return true;
  });

  return (
    <div className="page-container">
      {/* Header */}
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
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Placement Deadline Engine</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Automated reminder offsets configured at 24h, 6h, and 1h intervals
          </p>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          {['ACTIVE', 'COMPLETED', 'ALL'].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t as any)}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                border: `1px solid ${tab === t ? 'var(--primary)' : 'var(--border-subtle)'}`,
                backgroundColor: tab === t ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                color: tab === t ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {t === 'ACTIVE' ? 'Active Deadlines' : t === 'COMPLETED' ? 'Completed' : 'All'}
            </button>
          ))}
        </div>
      </div>

      {/* Deadlines List */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {filtered.map((deadline) => (
          <DeadlineCard
            key={deadline.id}
            deadline={deadline}
            onComplete={handleComplete}
          />
        ))}

        {filtered.length === 0 && (
          <div
            className="glass-card"
            style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text-muted)' }}
          >
            <CheckCircle2 size={36} color="var(--status-eligible)" style={{ margin: '0 auto 12px auto' }} />
            <div style={{ fontSize: '16px', fontWeight: 600, color: 'var(--text-primary)' }}>
              No active deadlines pending!
            </div>
            <div style={{ fontSize: '13px', marginTop: 4 }}>
              Convert notices from the Placement Feed to track new deadlines.
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
