'use client';

import React from 'react';
import {
  Briefcase,
  Building2,
  Calendar,
  Clock,
  ExternalLink,
  Eye,
  PlusCircle,
  Sparkles,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  KanbanSquare,
} from 'lucide-react';
import { PlacementInsight } from '@/types/insight.types';
import { StudentProfile } from '@/types/student.types';
import { evaluateEligibility } from '@/lib/business/eligibility-checker';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface InsightCardProps {
  insight: PlacementInsight;
  studentProfile?: StudentProfile;
  onViewRaw: (insight: PlacementInsight) => void;
  onTrackDeadline: (insight: PlacementInsight) => void;
  onSaveToKanban?: (insight: PlacementInsight) => void;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  insight,
  studentProfile,
  onViewRaw,
  onTrackDeadline,
  onSaveToKanban,
}) => {
  // Compute real-time eligibility if student profile is available
  const eligibility = studentProfile
    ? evaluateEligibility(studentProfile, {
        min_cgpa: insight.min_cgpa,
        batch_years: insight.batch_year ? [2026] : undefined,
        allowed_branches: insight.allowed_branches,
        max_active_backlogs: insight.max_active_backlogs,
      })
    : null;

  return (
    <div
      className="glass-card"
      style={{
        padding: '22px',
        display: 'flex',
        flexDirection: 'column',
        gap: '16px',
      }}
    >
      {/* Top Company & Type Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(99, 102, 241, 0.15)',
              border: '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-light)',
            }}
          >
            <Building2 size={22} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{insight.company_name}</h3>
              <Badge variant="primary" style={{ fontSize: '10px' }}>
                {insight.opportunity_type}
              </Badge>
            </div>
            <div style={{ fontSize: '13px', color: 'var(--text-secondary)', marginTop: '2px' }}>
              {insight.role_title || 'Software Engineering Role'}
            </div>
          </div>
        </div>

        {/* Urgency or Eligibility Indicator */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '6px' }}>
          <Badge urgency={insight.urgency} pulsing={insight.urgency === 'CRITICAL'}>
            {insight.urgency === 'CRITICAL' ? '🔥 Closing Soon' : `${insight.urgency} Urgency`}
          </Badge>

          {eligibility && (
            <Badge
              eligibility={eligibility.status}
              style={{ fontSize: '10.5px', textTransform: 'none' }}
              title={eligibility.reasons.join('\n')}
            >
              {eligibility.status === 'ELIGIBLE' && <CheckCircle2 size={12} style={{ marginRight: 4 }} />}
              {eligibility.status === 'NOT_ELIGIBLE' && <XCircle size={12} style={{ marginRight: 4 }} />}
              {eligibility.status === 'NEEDS_REVIEW' && <AlertTriangle size={12} style={{ marginRight: 4 }} />}
              {eligibility.status === 'ELIGIBLE' ? 'Eligible' : eligibility.status === 'NOT_ELIGIBLE' ? 'Not Eligible' : 'Review Criteria'}
            </Badge>
          )}
        </div>
      </div>

      {/* Structured Metrics Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))',
          gap: '10px',
          padding: '12px 14px',
          backgroundColor: 'rgba(10, 14, 26, 0.6)',
          borderRadius: '10px',
          border: '1px solid var(--border-subtle)',
          fontSize: '12.5px',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>CTC / Stipend</div>
          <div style={{ fontWeight: 700, color: 'var(--status-eligible)' }}>
            {insight.salary_or_stipend || 'Competitive'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Min CGPA</div>
          <div style={{ fontWeight: 700, color: 'var(--status-info)' }}>
            {insight.min_cgpa ? `${insight.min_cgpa} Cutoff` : 'No Cutoff'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Eligible Batch</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {insight.batch_year || '2026'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Deadline</div>
          <div style={{ fontWeight: 700, color: 'var(--status-urgent)' }} suppressHydrationWarning>
            {insight.registration_deadline
              ? new Date(insight.registration_deadline).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'Tonight 11:59 PM'}
          </div>
        </div>
      </div>

      {/* Target Branches & Telegram Source */}
      <div style={{ fontSize: '12px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Branches: </span>
          <span>{insight.allowed_branches?.join(', ') || 'All Engineering Branches'}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>
          Source: {insight.group_name || 'TPO Official'}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '8px',
          paddingTop: '8px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewRaw(insight)}
          leftIcon={<Eye size={14} />}
        >
          View Source
        </Button>

        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {onSaveToKanban && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSaveToKanban(insight)}
              leftIcon={<KanbanSquare size={13} />}
            >
              Save to Tracker
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onTrackDeadline(insight)}
            leftIcon={<PlusCircle size={14} />}
          >
            Track Deadline
          </Button>

          {insight.application_url && (
            <a
              href={insight.application_url}
              target="_blank"
              rel="noopener noreferrer"
            >
              <Button
                variant="primary"
                size="sm"
                rightIcon={<ExternalLink size={14} />}
              >
                Apply Link
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
