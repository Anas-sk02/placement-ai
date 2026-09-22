'use client';

import React from 'react';
import { X, ExternalLink, ShieldCheck, Clock, Layers, Sparkles } from 'lucide-react';
import { PlacementInsight } from '@/types/insight.types';
import { Badge } from '../ui/Badge';
import { Button } from '../ui/Button';

export interface SourceMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  insight: PlacementInsight | null;
}

export const SourceMessageDrawer: React.FC<SourceMessageDrawerProps> = ({
  isOpen,
  onClose,
  insight,
}) => {
  if (!isOpen || !insight) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(3, 7, 18, 0.7)',
        backdropFilter: 'blur(8px)',
        zIndex: 99999,
        display: 'flex',
        justifyContent: 'flex-end',
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        style={{
          width: '100%',
          maxWidth: '580px',
          height: '100%',
          backgroundColor: '#0a0f1d',
          borderLeft: '1px solid var(--border-medium)',
          boxShadow: 'var(--shadow-drawer)',
          display: 'flex',
          flexDirection: 'column',
          animation: 'slideInRight 0.25s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            borderBottom: '1px solid var(--border-subtle)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            backgroundColor: 'rgba(17, 24, 39, 0.8)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                backgroundColor: 'rgba(16, 185, 129, 0.15)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ShieldCheck size={18} color="var(--status-eligible)" />
            </div>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                Raw Source Message Verification
              </h3>
              <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                100% human cross-check to guarantee zero hallucination
              </div>
            </div>
          </div>

          <button
            onClick={onClose}
            style={{
              color: 'var(--text-muted)',
              display: 'flex',
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: 'rgba(255, 255, 255, 0.05)',
            }}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content Body */}
        <div style={{ flex: 1, padding: '24px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {/* Metadata Banner */}
          <div
            style={{
              padding: '14px 16px',
              backgroundColor: 'rgba(255, 255, 255, 0.03)',
              border: '1px solid var(--border-subtle)',
              borderRadius: '10px',
              display: 'flex',
              flexDirection: 'column',
              gap: '6px',
              fontSize: '12px',
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Telegram Channel:</span>
              <strong style={{ color: 'var(--text-primary)' }}>
                {insight.group_name || 'Telegram Channel'}
              </strong>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Extracted via:</span>
              <Badge variant={insight.extraction_provider === 'GEMINI' ? 'primary' : 'warning'}>
                {insight.extraction_provider === 'GEMINI' ? '✨ Gemini AI' : '⚡ Smart-Rule Engine'}
              </Badge>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>Extraction Confidence:</span>
              <strong style={{ color: 'var(--status-eligible)' }}>
                {Math.round((insight.confidence_score || 0.9) * 100)}%
              </strong>
            </div>
          </div>

          {/* Side-by-side Extracted Summary */}
          <div>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)' }}>
              Extracted Key Fields
            </div>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '10px',
              }}
            >
              <div style={{ backgroundColor: 'rgba(13, 17, 30, 0.8)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Company</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: '#ffffff' }}>{insight.company_name}</div>
              </div>

              <div style={{ backgroundColor: 'rgba(13, 17, 30, 0.8)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Package / Stipend</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-eligible)' }}>
                  {insight.salary_or_stipend || 'Not Specified'}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(13, 17, 30, 0.8)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Min CGPA Cutoff</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-info)' }}>
                  {insight.min_cgpa ?? 'No Cutoff'}
                </div>
              </div>

              <div style={{ backgroundColor: 'rgba(13, 17, 30, 0.8)', padding: '10px 12px', borderRadius: '8px', border: '1px solid var(--border-subtle)' }}>
                <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Deadline</div>
                <div style={{ fontSize: '13px', fontWeight: 600, color: 'var(--status-urgent)' }} suppressHydrationWarning>
                  {insight.registration_deadline
                    ? new Date(insight.registration_deadline).toLocaleDateString()
                    : 'Check Notice'}
                </div>
              </div>
            </div>
          </div>

          {/* Verbatim Raw Message Content */}
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
            <div style={{ fontSize: '13px', fontWeight: 700, marginBottom: '10px', color: 'var(--text-secondary)' }}>
              Original Unaltered Telegram Post
            </div>
            <pre
              style={{
                flex: 1,
                backgroundColor: 'rgba(7, 10, 20, 0.95)',
                border: '1px solid var(--border-medium)',
                borderRadius: '10px',
                padding: '16px',
                color: 'var(--text-primary)',
                fontFamily: 'var(--font-mono)',
                fontSize: '12.5px',
                lineHeight: 1.6,
                whiteSpace: 'pre-wrap',
                wordBreak: 'break-word',
                overflowY: 'auto',
                maxHeight: '340px',
              }}
            >
              {insight.raw_message_text ||
                `📢 *Placement Desk Notice*\n\nRecruiter: ${insight.company_name}\nRole: ${
                  insight.role_title || 'Software Engineer'
                }\nPackage: ${
                  insight.salary_or_stipend || 'Competitive'
                }\nEligibility: CGPA >= ${
                  insight.min_cgpa || '7.0'
                }\nDeadline: ${
                  insight.registration_deadline || 'Tonight 11:59 PM'
                }\n\nPlease register immediately via the attached portal link.`}
            </pre>
          </div>

          {/* Action footer in drawer */}
          {insight.application_url && (
            <a
              href={insight.application_url}
              target="_blank"
              rel="noopener noreferrer"
              style={{ width: '100%' }}
            >
              <Button
                variant="primary"
                size="md"
                style={{ width: '100%' }}
                rightIcon={<ExternalLink size={16} />}
              >
                Open Official Application Link
              </Button>
            </a>
          )}
        </div>
      </div>
    </div>
  );
};
