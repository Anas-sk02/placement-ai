'use client';

import React from 'react';
import {
  Building2,
  ExternalLink,
  Eye,
  PlusCircle,
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
        padding: '24px',
        display: 'flex',
        flexDirection: 'column',
        gap: '18px',
      }}
    >
      {/* Top Company & Type Row */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '8px',
              backgroundColor: '#161d2f',
              border: '1px solid var(--border-medium)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'var(--primary-light)',
              flexShrink: 0,
            }}
          >
            <Building2 size={20} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 700, letterSpacing: '-0.01em' }}>
                {insight.company_name}
              </h3>
              <Badge variant="primary" style={{ fontSize: '10.5px' }}>
                {insight.opportunity_type || 'DRIVE'}
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
            {insight.urgency === 'CRITICAL' ? 'Closing Soon' : `${insight.urgency || 'ACTIVE'}`}
          </Badge>

          {eligibility && (
            <Badge
              eligibility={eligibility.status}
              style={{ fontSize: '11px', textTransform: 'none' }}
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
          gap: '12px',
          padding: '14px 16px',
          backgroundColor: '#0d111a',
          borderRadius: '8px',
          border: '1px solid var(--border-subtle)',
          fontSize: '12.5px',
        }}
      >
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>CTC / Stipend</div>
          <div style={{ fontWeight: 600, color: 'var(--status-eligible)' }}>
            {insight.salary_or_stipend || 'Competitive'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>Min CGPA</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {insight.min_cgpa ? `${insight.min_cgpa} Cutoff` : 'No Cutoff'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>Eligible Batch</div>
          <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
            {insight.batch_year || '2026'}
          </div>
        </div>

        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', marginBottom: '2px' }}>Deadline</div>
          <div style={{ fontWeight: 600, color: 'var(--status-urgent)' }} suppressHydrationWarning>
            {insight.registration_deadline
              ? new Date(insight.registration_deadline).toLocaleDateString(undefined, {
                  month: 'short',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit',
                })
              : 'As Announced'}
          </div>
        </div>
      </div>

      {/* Target Branches & Telegram Source */}
      <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <span style={{ color: 'var(--text-muted)' }}>Allowed Branches: </span>
          <span>{insight.allowed_branches?.join(', ') || 'All Branches'}</span>
        </div>
        <div style={{ color: 'var(--text-muted)', fontSize: '11.5px' }}>
          {insight.group_name || 'Campus Telegram'}
        </div>
      </div>

      {/* Action Buttons */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '10px',
          paddingTop: '12px',
          borderTop: '1px solid var(--border-subtle)',
          flexWrap: 'wrap',
        }}
      >
        <Button
          variant="ghost"
          size="sm"
          onClick={() => onViewRaw(insight)}
          leftIcon={<Eye size={13} />}
        >
          View Source
        </Button>

        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {onSaveToKanban && (
            <Button
              variant="secondary"
              size="sm"
              onClick={() => onSaveToKanban(insight)}
              leftIcon={<KanbanSquare size={13} />}
            >
              Save Application
            </Button>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={() => onTrackDeadline(insight)}
            leftIcon={<PlusCircle size={13} />}
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
                rightIcon={<ExternalLink size={13} />}
              >
                Apply Direct
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
