'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { CalendarClock, Plus, Filter, CheckCircle2, Clock, AlertTriangle, Sparkles, PlusCircle, LayoutGrid, List, Calendar as CalendarIcon, Download } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { DeadlineCard } from '@/components/deadlines/DeadlineCard';
import { CalendarView } from '@/components/deadlines/CalendarView';
import { Modal } from '@/components/ui/Modal';
import { DeadlineItem } from '@/types/deadline.types';
import { useToast } from '@/components/ui/Toast';
import { generateMultiIcsFile, downloadIcsFile } from '@/lib/calendar/calendar-sync';

export default function DeadlinesPage() {
  const { success, error } = useToast();
  const [deadlines, setDeadlines] = useState<DeadlineItem[]>([]);
  const [tab, setTab] = useState<'ACTIVE' | 'COMPLETED' | 'ALL'>('ACTIVE');
  const [viewMode, setViewMode] = useState<'LIST' | 'CALENDAR'>('LIST');
  const [isAddOpen, setIsAddOpen] = useState(false);

  // Add Deadline Form State
  const [newTitle, setNewTitle] = useState('');
  const [newCompany, setNewCompany] = useState('');
  const [newDate, setNewDate] = useState('');
  const [newUrl, setNewUrl] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDeadlines = () => {
    fetch('/api/deadlines')
      .then((res) => (res.ok ? res.json() : { deadlines: [] }))
      .then((data) => setDeadlines(data.deadlines || []))
      .catch(() => setDeadlines([]));
  };

  useEffect(() => {
    fetchDeadlines();
  }, []);

  const handleComplete = async (id: string) => {
    const target = deadlines.find((d) => d.id === id);
    if (!target) return;

    const newStatus = target.status === 'COMPLETED' ? 'UPCOMING' : 'COMPLETED';
    setDeadlines((prev) =>
      prev.map((d) => (d.id === id ? { ...d, status: newStatus } : d))
    );

    try {
      await fetch(`/api/deadlines/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      success('Deadline Updated', `Marked as ${newStatus}`);
    } catch {
      // Local state already updated
    }
  };

  const handleCreateDeadline = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle || !newDate) return;

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/deadlines', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newTitle,
          company_name: newCompany || 'Placement Recruiter',
          deadline_at: new Date(newDate).toISOString(),
          action_url: newUrl || null,
        }),
      });

      if (res.ok) {
        success('Deadline Scheduled', 'Configured 24h, 6h, and 1h reminders');
        setNewTitle('');
        setNewCompany('');
        setNewDate('');
        setNewUrl('');
        setIsAddOpen(false);
        fetchDeadlines();
      } else {
        error('Failed to save deadline');
      }
    } catch {
      error('Error scheduling deadline');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleExportAllIcs = () => {
    if (deadlines.length === 0) {
      error('No deadlines available to export');
      return;
    }
    const icsContent = generateMultiIcsFile(deadlines);
    downloadIcsFile('placement-deadlines.ics', icsContent);
    success('Calendar Exported', 'Downloaded .ics file for Google / Apple / Outlook calendar sync');
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
            Interactive Calendar & Automated reminder offsets configured at 24h, 6h, and 1h intervals
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
          {/* View Mode Switcher */}
          <div
            style={{
              display: 'flex',
              backgroundColor: '#111624',
              borderRadius: '8px',
              border: '1px solid var(--border-subtle)',
              padding: '2px',
            }}
          >
            <button
              onClick={() => setViewMode('LIST')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: viewMode === 'LIST' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'LIST' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <List size={14} />
              List
            </button>
            <button
              onClick={() => setViewMode('CALENDAR')}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '6px 12px',
                borderRadius: '6px',
                fontSize: '12px',
                fontWeight: 600,
                border: 'none',
                backgroundColor: viewMode === 'CALENDAR' ? 'var(--primary)' : 'transparent',
                color: viewMode === 'CALENDAR' ? '#ffffff' : 'var(--text-secondary)',
                cursor: 'pointer',
                transition: 'all var(--transition-fast)',
              }}
            >
              <CalendarIcon size={14} />
              Calendar
            </button>
          </div>

          {/* Export All .ics */}
          {deadlines.length > 0 && (
            <Button
              variant="secondary"
              size="md"
              onClick={handleExportAllIcs}
              leftIcon={<Download size={14} />}
              title="Export all deadlines into an .ics calendar file"
            >
              Sync All (.ics)
            </Button>
          )}

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsAddOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Add Deadline
          </Button>

          {/* Filter Status Tabs (applicable to list) */}
          {viewMode === 'LIST' && (
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ACTIVE', 'COMPLETED', 'ALL'].map((t) => (
                <button
                  key={t}
                  onClick={() => setTab(t as any)}
                  style={{
                    padding: '8px 14px',
                    borderRadius: '8px',
                    fontSize: '12.5px',
                    fontWeight: 600,
                    border: `1px solid ${tab === t ? 'var(--primary)' : 'var(--border-subtle)'}`,
                    backgroundColor: tab === t ? 'rgba(99, 102, 241, 0.2)' : 'transparent',
                    color: tab === t ? '#ffffff' : 'var(--text-secondary)',
                    transition: 'all var(--transition-fast)',
                    cursor: 'pointer',
                  }}
                >
                  {t === 'ACTIVE' ? 'Active' : t === 'COMPLETED' ? 'Completed' : 'All'}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main View: Calendar or List */}
      {viewMode === 'CALENDAR' ? (
        <CalendarView
          deadlines={deadlines}
          onComplete={handleComplete}
          onAddCustom={() => setIsAddOpen(true)}
        />
      ) : (
        /* Deadlines List */
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
                <CalendarClock size={28} color="var(--primary-light)" />
              </div>

              <div>
                <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                  No Placement Deadlines Scheduled
                </h3>
                <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
                  Track deadlines with 1-click from the Placement Feed or create custom deadline reminders.
                </p>
              </div>

              <div style={{ display: 'flex', gap: '12px' }}>
                <Button
                  variant="primary"
                  size="md"
                  onClick={() => setIsAddOpen(true)}
                  leftIcon={<PlusCircle size={16} />}
                >
                  Add First Deadline
                </Button>
                <Link href="/insights">
                  <Button variant="secondary" size="md" leftIcon={<Sparkles size={16} />}>
                    Explore Notices Feed
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Add Custom Deadline Modal */}
      <Modal isOpen={isAddOpen} onClose={() => setIsAddOpen(false)} title="Schedule New Placement Deadline">
        <form onSubmit={handleCreateDeadline} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="form-group">
            <label className="form-label">Deadline Title</label>
            <input
              type="text"
              required
              placeholder="e.g. Google India SDE Application Form"
              className="input-field"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              placeholder="e.g. Google India"
              className="input-field"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Submission Cutoff Date & Time</label>
            <input
              type="datetime-local"
              required
              className="input-field"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Registration URL (Optional)</label>
            <input
              type="url"
              placeholder="https://..."
              className="input-field"
              value={newUrl}
              onChange={(e) => setNewUrl(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" size="md" type="button" onClick={() => setIsAddOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isSubmitting}
              leftIcon={<Plus size={16} />}
            >
              Set Deadline & Reminders
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
