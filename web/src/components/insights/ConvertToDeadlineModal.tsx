'use client';

import React, { useState } from 'react';
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
  const { success } = useToast();
  const [offsets, setOffsets] = useState<number[]>([24, 6, 1]);
  const [customTitle, setCustomTitle] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const toggleOffset = (val: number) => {
    setOffsets((prev) =>
      prev.includes(val) ? prev.filter((o) => o !== val) : [...prev, val]
    );
  };

  const handleSaveDeadline = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      success(
        'Deadline Added to Tracker',
        `Reminders configured for ${insight?.company_name || 'recruiter'}`
      );
      if (onSuccess) onSuccess();
      onClose();
    }, 500);
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
            defaultValue={insight.role_title ? `${insight.company_name} — ${insight.role_title} Registration` : `${insight.company_name} Placement Application`}
            onChange={(e) => setCustomTitle(e.target.value)}
          />
        </div>

        <div className="form-group">
          <label className="form-label">Deadline Target Date & Time</label>
          <input
            type="datetime-local"
            className="input-field"
            defaultValue={
              insight.registration_deadline
                ? new Date(insight.registration_deadline).toISOString().slice(0, 16)
                : new Date(Date.now() + 86400000).toISOString().slice(0, 16)
            }
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
          <Button variant="ghost" size="md" onClick={onClose}>
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
