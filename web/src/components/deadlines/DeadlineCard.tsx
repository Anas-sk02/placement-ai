'use client';

import React from 'react';
import { Clock, CheckCircle, ExternalLink, AlertCircle, Building2, Bell } from 'lucide-react';
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
        padding: '18px 22px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: '16px',
        opacity: isDone ? 0.6 : 1,
        borderLeft: time.isUrgent
          ? '4px solid var(--status-urgent)'
          : isDone
          ? '4px solid var(--status-eligible)'
          : '4px solid var(--primary)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flex: 1 }}>
        <button
          onClick={() => onComplete(deadline.id)}
          style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            border: isDone
              ? '2px solid var(--status-eligible)'
              : '2px solid rgba(255, 255, 255, 0.2)',
            backgroundColor: isDone ? 'rgba(16, 185, 129, 0.2)' : 'transparent',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: 'var(--status-eligible)',
            transition: 'all var(--transition-fast)',
          }}
        >
          {isDone && <CheckCircle size={18} />}
        </button>

        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <h4
              style={{
                fontSize: '15px',
                fontWeight: 600,
                textDecoration: isDone ? 'line-through' : 'none',
              }}
            >
              {deadline.title}
            </h4>
            <Badge variant="primary" style={{ fontSize: '10px' }}>
              {deadline.company_name}
            </Badge>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              fontSize: '12px',
              color: 'var(--text-muted)',
              marginTop: '4px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <Clock size={13} />
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
              <Bell size={13} color="var(--primary-light)" />
              <span>Reminders: 24h, 6h, 1h active</span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Badge
          variant={time.isUrgent ? 'urgent' : isDone ? 'eligible' : 'info'}
          pulsing={time.isUrgent && !isDone}
        >
          {isDone ? 'Completed ✅' : time.text}
        </Badge>

        {deadline.action_url && (
          <a href={deadline.action_url} target="_blank" rel="noopener noreferrer">
            <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={14} />}>
              Open Portal
            </Button>
          </a>
        )}
      </div>
    </div>
  );
};
