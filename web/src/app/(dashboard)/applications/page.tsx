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
  Trash2,
  FileText,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { useApplications, ApplicationItem } from '@/lib/hooks/useApplications';
import { ApplicationStatusEnum } from '@/types/database.types';
import { useToast } from '@/components/ui/Toast';

const COLUMNS: { id: ApplicationStatusEnum; title: string; color: string }[] = [
  { id: 'SAVED', title: 'Saved Drives', color: '#94a3b8' },
  { id: 'APPLIED', title: 'Applied', color: '#38bdf8' },
  { id: 'ASSESSMENT', title: 'Online Test (OA)', color: '#f59e0b' },
  { id: 'INTERVIEW', title: 'Interviews', color: '#a855f7' },
  { id: 'SELECTED', title: 'Selected / Offer 🎉', color: '#10b981' },
  { id: 'REJECTED', title: 'Archived', color: '#64748b' },
];

export default function ApplicationsKanbanPage() {
  const { applications, updateApplicationStatus, deleteApplication, addApplication } = useApplications();
  const { success } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [activeNoteApp, setActiveNoteApp] = useState<ApplicationItem | null>(null);

  const moveNext = (appId: string, current: ApplicationStatusEnum) => {
    const order: ApplicationStatusEnum[] = ['SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED'];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) {
      const nextCol = order[idx + 1];
      updateApplicationStatus(appId, nextCol);
      if (nextCol === 'SELECTED') {
        success('Congratulations! 🎉', `Marked as Selected / Offer for this drive!`);
      } else {
        success('Application Advanced', `Moved to ${nextCol}`);
      }
    }
  };

  const handleCreateApp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompany) return;
    addApplication({
      company_name: newCompany,
      role_title: newRole || 'Software Engineer',
      notes: newNotes,
      status: 'SAVED',
    });
    setIsAddModalOpen(false);
    setNewCompany('');
    setNewRole('');
    setNewNotes('');
    success('Application Added', 'Track your interview progress on the Kanban board');
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
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Placement Application Kanban Tracker</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Lifecycle tracker synced with Supabase PostgreSQL • Confetti celebrations on Offer
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus size={16} />}
        >
          Add Application
        </Button>
      </div>

      {/* Kanban Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '16px',
          alignItems: 'start',
        }}
      >
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.id);

          return (
            <div
              key={col.id}
              style={{
                backgroundColor: 'rgba(13, 17, 30, 0.7)',
                border: '1px solid var(--border-subtle)',
                borderRadius: '12px',
                padding: '16px',
                minHeight: '450px',
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

              {/* Cards list */}
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
                      borderLeft: `3px solid ${col.color}`,
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                      <strong style={{ fontSize: '14px', color: '#ffffff' }}>
                        {app.company_name}
                      </strong>
                      <button
                        onClick={() => deleteApplication(app.id)}
                        style={{ color: 'var(--text-muted)', padding: '2px' }}
                        title="Remove from tracker"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>

                    <div style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>
                      {app.role_title}
                    </div>

                    {app.notes && (
                      <div
                        style={{
                          fontSize: '11.5px',
                          color: 'var(--text-muted)',
                          backgroundColor: 'rgba(255, 255, 255, 0.03)',
                          padding: '6px 8px',
                          borderRadius: '6px',
                        }}
                      >
                        {app.notes}
                      </div>
                    )}

                    {col.id !== 'SELECTED' && col.id !== 'REJECTED' && (
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '6px', paddingTop: '6px', borderTop: '1px solid var(--border-subtle)' }}>
                        <button
                          onClick={() => setActiveNoteApp(app)}
                          style={{ fontSize: '11px', color: 'var(--primary-light)', display: 'flex', alignItems: 'center', gap: 4 }}
                        >
                          <FileText size={12} />
                          Notes
                        </button>

                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveNext(app.id, col.id)}
                          rightIcon={<ChevronRight size={13} />}
                          style={{ fontSize: '11px', padding: '3px 8px' }}
                        >
                          Next Stage
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

      {/* Add Modal */}
      <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Track New Application">
        <form onSubmit={handleCreateApp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          <div className="form-group">
            <label className="form-label">Company Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Goldman Sachs, Google"
              className="input-field"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Title</label>
            <input
              type="text"
              placeholder="e.g. Summer Analyst / SDE-1"
              className="input-field"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Application Notes / Round Details</label>
            <textarea
              placeholder="e.g. Applied on college form, test on Sunday..."
              className="input-field"
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
            <Button variant="ghost" size="md" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save to Board
            </Button>
          </div>
        </form>
      </Modal>

      {/* Note Edit Modal */}
      {activeNoteApp && (
        <Modal isOpen={Boolean(activeNoteApp)} onClose={() => setActiveNoteApp(null)} title={`Notes: ${activeNoteApp.company_name}`}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <textarea
              className="input-field"
              rows={4}
              defaultValue={activeNoteApp.notes || ''}
              id="appNoteInput"
            />
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px' }}>
              <Button variant="ghost" size="md" onClick={() => setActiveNoteApp(null)}>
                Close
              </Button>
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  const val = (document.getElementById('appNoteInput') as HTMLTextAreaElement)?.value;
                  if (activeNoteApp) {
                    addApplication({ ...activeNoteApp, notes: val });
                  }
                  setActiveNoteApp(null);
                  success('Notes Saved', 'Updated application log');
                }}
              >
                Save Notes
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
