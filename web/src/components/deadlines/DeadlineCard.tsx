'use client';

import React from 'react';
import { Clock, CheckCircle, ExternalLink, Bell } from 'lucide-react';
import { DeadlineItem } from '@/types/deadline.types';
import { formatTimeRemaining } from '@/lib/business/reminder-scheduler';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface DeadlineCardProps {
  deadline: DeadlineItem;
  onComplete: (id: string) => void;
}

export const DeadlineCard: React.FC<DeadlineCardProps> = ({ deadline, onComplete }) => {
  const time = formatTimeRemaining(deadline.deadline_at);
  const isDone = deadline.status === 'COMPLETED';

  return (
    <div
      className="glass-card"
      style={{
        padding: '20px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        opacity: isDone ? 0.55 : 1,
        backgroundColor: '#111624',
        borderRadius: '10px',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <button
          onClick={() => onComplete(deadline.id)}
          style={{
            width: '24px',
            height: '24px',
            borderRadius: '6px',
            border: isDone
              ? '1px solid var(--status-eligible)'
              : '1px solid var(--border-medium)',
            backgroundColor: isDone ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.03)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--status-eligible)',
            transition: 'all var(--transition-fast)',
            cursor: 'pointer',
            flexShrink: 0,
          }}
          title={isDone ? 'Mark as active' : 'Mark as complete'}
        >
          {isDone && <CheckCircle size={15} />}
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <h4
              style={{
                fontSize: '14.5px',
                fontWeight: 600,
                textDecoration: isDone ? 'line-through' : 'none',
                color: 'var(--text-primary)',
              }}
            >
              {deadline.title}
            </h4>
            <span
              style={{
                fontSize: '11px',
                fontWeight: 500,
                padding: '1px 6px',
                borderRadius: '4px',
                backgroundColor: 'rgba(59, 130, 246, 0.1)',
                color: 'var(--primary-light)',
                border: '1px solid rgba(59, 130, 246, 0.2)',
              }}
            >
              {deadline.company_name}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={12} />
              <span suppressHydrationWarning>
                {new Date(deadline.deadline_at).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Bell size={12} color="var(--primary-light)" />
              <span>Reminders: 24h, 6h, 1h active</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <Badge
          variant={time.isUrgent ? 'urgent' : isDone ? 'eligible' : 'info'}
          pulsing={time.isUrgent && !isDone}
        >
          {isDone ? 'Completed' : time.text}
        </Badge>

        {deadline.action_url && (
          <a href={deadline.action_url} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={13} />}>
              Open Form
            </Button>
          </a>
        )}
      </div>
    </div>
  );
};
