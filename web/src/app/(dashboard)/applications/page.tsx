'use client';

import React, { useState } from 'react';
import {
  KanbanSquare,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Plus,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useToast } from '@/components/ui/Toast';

type KanbanColumnId = 'SAVED' | 'APPLIED' | 'ASSESSMENT' | 'INTERVIEW' | 'SELECTED' | 'REJECTED';

interface AppCard {
  id: string;
  company: string;
  role: string;
  ctc: string;
  deadline?: string;
  column: KanbanColumnId;
}

const INITIAL_APPS: AppCard[] = [
  { id: 'app-01', company: 'Goldman Sachs', role: 'Summer Analyst', ctc: '₹24 - 30 LPA', column: 'APPLIED' },
  { id: 'app-02', company: 'Amazon', role: 'SDE-1', ctc: '₹44.5 LPA', column: 'SAVED' },
  { id: 'app-03', company: 'Uber', role: 'SWE Intern', ctc: '₹1.6L/mo', column: 'ASSESSMENT' },
  { id: 'app-04', company: 'Microsoft', role: 'University Graduate', ctc: '₹51 LPA', column: 'INTERVIEW' },
  { id: 'app-05', company: 'Atlassian', role: 'Assoc. Engineer', ctc: '₹35 LPA', column: 'SELECTED' },
];

const COLUMNS: { id: KanbanColumnId; title: string; color: string }[] = [
  { id: 'SAVED', title: 'Saved Notices', color: '#94a3b8' },
  { id: 'APPLIED', title: 'Applied', color: '#38bdf8' },
  { id: 'ASSESSMENT', title: 'Online Assessment', color: '#f59e0b' },
  { id: 'INTERVIEW', title: 'Interviews', color: '#a855f7' },
  { id: 'SELECTED', title: 'Selected / Offer 🎉', color: '#10b981' },
  { id: 'REJECTED', title: 'Archived', color: '#64748b' },
];

export default function ApplicationsKanbanPage() {
  const { success } = useToast();
  const [apps, setApps] = useState<AppCard[]>(INITIAL_APPS);

  const moveNext = (appId: string, current: KanbanColumnId) => {
    const order: KanbanColumnId[] = ['SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED'];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) {
      const nextCol = order[idx + 1];
      setApps((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, column: nextCol } : a))
      );
      success('Status Advanced', `Moved to ${nextCol}`);
    }
  };

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
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Placement Application Kanban</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Track your recruitment lifecycle from initial Telegram notice to final selection
          </p>
        </div>
      </div>

      {/* Kanban Board Horizontal Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {COLUMNS.map((col) => {
          const colApps = apps.filter((a) => a.column === col.id);

          return (
            <div
              key={col.id}
              style={{
                backgroundColor: 'rgba(13, 17, 30, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                minHeight: '400px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '10px',
                  borderBottom: `2px solid ${col.color}`,
                }}
              >
                <div style={{ fontSize: '13px', fontWeight: 700, color: col.color }}>
                  {col.title}
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 700,
                    padding: '2px 8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                  }}
                >
                  {colApps.length}
                </span>
              </div>

              {/* Cards in this column */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {colApps.map((app) => (
                  <div
                    key={app.id}
                    className="glass-card"
                    style={{
                      padding: '14px',
                      borderRadius: '10px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '14px', color: '#ffffff' }}>{app.company}</strong>
                      <Badge variant="primary" style={{ fontSize: '9.5px' }}>
                        {app.ctc}
                      </Badge>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{app.role}</div>

                    {col.id !== 'SELECTED' && col.id !== 'REJECTED' && (
                      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveNext(app.id, col.id)}
                          rightIcon={<ChevronRight size={14} />}
                          style={{ fontSize: '11px', padding: '4px 8px' }}
                        >
                          Advance
                        </Button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
