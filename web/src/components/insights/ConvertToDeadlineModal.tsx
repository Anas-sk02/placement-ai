'use client';

import React, { useState, useEffect } from 'react';
import { CalendarClock, Bell, Check, ArrowRight } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { PlacementInsight } from '@/types/insight.types';
import { useToast } from '../ui/Toast';

export interface ConvertToDeadlineModalProps {
  isOpen: boolean;
  onClose: () => void;
  insight: PlacementInsight | null;
  onSuccess?: () => void;
}

export const ConvertToDeadlineModal: React.FC<ConvertToDeadlineModalProps> = ({
  isOpen,
  onClose,
  insight,
  onSuccess,
}) => {
  const { success, error } = useToast();
  const [offsets, setOffsets] = useState<number[]>([24, 6, 1]);
  const [customTitle, setCustomTitle] = useState('');
  const [customDate, setCustomDate] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (insight) {
      setCustomTitle(
        insight.role_title
          ? `${insight.company_name} — ${insight.role_title}`
          : `${insight.company_name} Application Deadline`
      );

      const defaultDeadline = insight.registration_deadline
        ? new Date(insight.registration_deadline).toISOString().slice(0, 16)
        : new Date(Date.now() + 86400000).toISOString().slice(0, 16);
      setCustomDate(defaultDeadline);
    }
  }, [insight]);

  const toggleOffset = (val: number) => {
    setOffsets((prev) =>
      prev.includes(val) ? prev.filter((o) => o !== val) : [...prev, val]
    );
  };

  const handleSaveDeadline = async () => {
    if (!insight) return;
    if (!customTitle.trim()) {
      error('Please provide a title for the deadline');
      return;
    }
    if (!customDate) {
      error('Please select a deadline target date and time');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: customTitle.trim(),
          company_name: insight.company_name,
          deadline_at: new Date(customDate).toISOString(),
          action_url: insight.application_url || null,
          insight_id: insight.id || null,
          offsets,
        }),
      });

      if (res.ok) {
        success(
          'Deadline Added to Tracker',
          `Automated reminders scheduled for ${insight.company_name}`
        );
        if (onSuccess) onSuccess();
        onClose();
      } else {
        const data = await res.json();
        error(data.error || 'Failed to schedule deadline');
      }
    } catch {
      error('Error scheduling deadline');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen || !insight) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Track Deadline: ${insight.company_name}`}
    >
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        <div className="form-group">
          <label className="form-label">Deadline Title</label>
          <input
            type="text"
            className="input-field"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            placeholder="e.g. Google — Software Engineer Application"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Deadline Target Date & Time</label>
          <input
            type="datetime-local"
            className="input-field"
            value={customDate}
            onChange={(e) => setCustomDate(e.target.value)}
          />
        </div>

        {/* Reminder Offsets */}
        <div>
          <label className="form-label" style={{ marginBottom: '8px', display: 'block' }}>
            Trigger Automated Reminders Before Deadline
          </label>
          <div style={{ display: 'flex', gap: '10px' }}>
            {[
              { label: '24 Hours Before', value: 24 },
              { label: '6 Hours Before', value: 6 },
              { label: '1 Hour Before', value: 1 },
            ].map((opt) => {
              const selected = offsets.includes(opt.value);
              return (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => toggleOffset(opt.value)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    borderRadius: '8px',
                    border: `1px solid ${selected ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    backgroundColor: selected ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.02)',
                    color: selected ? '#ffffff' : 'var(--text-secondary)',
                    fontSize: '12px',
                    fontWeight: 600,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                >
                  {selected && <Check size={14} color="var(--primary-light)" />}
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
          <Button variant="ghost" size="md" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            size="md"
            isLoading={isSubmitting}
            onClick={handleSaveDeadline}
            rightIcon={<ArrowRight size={16} />}
          >
            Schedule & Track
          </Button>
        </div>
      </div>
    </Modal>
  );
};
