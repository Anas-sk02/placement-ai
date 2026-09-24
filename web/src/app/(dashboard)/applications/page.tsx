'use client';

import React, { useState } from 'react';
import {
  KanbanSquare,
  Plus,
  ChevronRight,
  Trash2,
  FileText,
  GripVertical,
  CheckCircle2,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useApplications, ApplicationItem } from '@/lib/hooks/useApplications';
import { ApplicationStatusEnum } from '@/types/database.types';
import { useToast } from '@/components/ui/Toast';

const COLUMNS: { id: ApplicationStatusEnum; title: string; color: string; bgBadge: string }[] = [
  { id: 'SAVED', title: 'Saved Drives', color: '#94a3b8', bgBadge: 'rgba(148, 163, 184, 0.1)' },
  { id: 'APPLIED', title: 'Applied', color: '#60a5fa', bgBadge: 'rgba(96, 165, 250, 0.1)' },
  { id: 'ASSESSMENT', title: 'Online Test (OA)', color: '#fbbf24', bgBadge: 'rgba(251, 191, 36, 0.1)' },
  { id: 'INTERVIEW', title: 'Interviews', color: '#c084fc', bgBadge: 'rgba(192, 132, 252, 0.1)' },
  { id: 'SELECTED', title: 'Offer Received', color: '#34d399', bgBadge: 'rgba(52, 211, 153, 0.1)' },
  { id: 'REJECTED', title: 'Archived', color: '#64748b', bgBadge: 'rgba(100, 116, 139, 0.1)' },
];

export default function ApplicationsKanbanPage() {
  const { applications, updateApplicationStatus, deleteApplication, addApplication } = useApplications();
  const { success } = useToast();

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newCompany, setNewCompany] = useState('');
  const [newRole, setNewRole] = useState('');
  const [newNotes, setNewNotes] = useState('');

  const [activeNoteApp, setActiveNoteApp] = useState<ApplicationItem | null>(null);

  // Drag and Drop States
  const [draggedAppId, setDraggedAppId] = useState<string | null>(null);
  const [dragOverCol, setDragOverCol] = useState<ApplicationStatusEnum | null>(null);

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedAppId(id);
    e.dataTransfer.setData('text/plain', id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, colId: ApplicationStatusEnum) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (dragOverCol !== colId) {
      setDragOverCol(colId);
    }
  };

  const handleDragLeave = (e: React.DragEvent) => {
    // Only reset if leaving the column element itself
    if (!e.currentTarget.contains(e.relatedTarget as Node)) {
      setDragOverCol(null);
    }
  };

  const handleDrop = (e: React.DragEvent, targetCol: ApplicationStatusEnum) => {
    e.preventDefault();
    setDragOverCol(null);

    const appId = draggedAppId || e.dataTransfer.getData('text/plain');
    if (!appId) return;

    const currentApp = applications.find((a) => a.id === appId);
    if (!currentApp || currentApp.status === targetCol) {
      setDraggedAppId(null);
      return;
    }

    updateApplicationStatus(appId, targetCol);

    if (targetCol === 'SELECTED') {
      success('Offer Celebrations! 🎉', `Congratulations! Marked ${currentApp.company_name} as Offer Received!`);
    } else {
      const targetColInfo = COLUMNS.find((c) => c.id === targetCol);
      success('Pipeline Updated', `Moved ${currentApp.company_name} to ${targetColInfo?.title || targetCol}`);
    }

    setDraggedAppId(null);
  };

  const moveNext = (appId: string, current: ApplicationStatusEnum) => {
    const order: ApplicationStatusEnum[] = ['SAVED', 'APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED'];
    const idx = order.indexOf(current);
    if (idx >= 0 && idx < order.length - 1) {
      const nextCol = order[idx + 1];
      updateApplicationStatus(appId, nextCol);
      if (nextCol === 'SELECTED') {
        success('Offer Celebrations! 🎉', `Marked as Selected / Offer Received!`);
      } else {
        success('Application Moved', `Advanced to ${nextCol}`);
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
    success('Application Added', 'Track your drive lifecycle on the pipeline');
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Application Pipeline
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Drag & drop cards across stages to track campus and off-campus recruitment in real time
          </p>
        </div>

        <Button
          variant="primary"
          size="md"
          onClick={() => setIsAddModalOpen(true)}
          leftIcon={<Plus size={15} />}
        >
          Track Application
        </Button>
      </div>

      {/* Kanban Columns */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
          gap: '18px',
          alignItems: 'start',
        }}
      >
        {COLUMNS.map((col) => {
          const colApps = applications.filter((a) => a.status === col.id);
          const isOver = dragOverCol === col.id;

          return (
            <div
              key={col.id}
              onDragOver={(e) => handleDragOver(e, col.id)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, col.id)}
              style={{
                backgroundColor: isOver ? 'rgba(59, 130, 246, 0.08)' : '#0c0f17',
                border: `1px solid ${isOver ? 'var(--primary)' : 'var(--border-subtle)'}`,
                boxShadow: isOver ? '0 0 12px rgba(59, 130, 246, 0.25)' : 'none',
                borderRadius: '10px',
                padding: '16px',
                minHeight: '480px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
                transition: 'all var(--transition-fast)',
              }}
            >
              {/* Column Header */}
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingBottom: '12px',
                  borderBottom: '1px solid var(--border-subtle)',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span
                    style={{
                      width: '8px',
                      height: '8px',
                      borderRadius: '50%',
                      backgroundColor: col.color,
                    }}
                  />
                  <span style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)' }}>
                    {col.title}
                  </span>
                </div>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    padding: '1px 7px',
                    borderRadius: '999px',
                    backgroundColor: col.bgBadge,
                    color: col.color,
                  }}
                >
                  {colApps.length}
                </span>
              </div>

              {/* Cards list */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', minHeight: '100px' }}>
                {colApps.length === 0 ? (
                  <div
                    style={{
                      textAlign: 'center',
                      padding: '36px 12px',
                      color: 'var(--text-muted)',
                      fontSize: '12px',
                      border: `1px dashed ${isOver ? 'var(--primary)' : 'var(--border-subtle)'}`,
                      backgroundColor: isOver ? 'rgba(59, 130, 246, 0.05)' : 'transparent',
                      borderRadius: '8px',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    {isOver ? 'Drop card here' : 'No drives in this stage'}
                  </div>
                ) : (
                  colApps.map((app) => {
                    const isBeingDragged = draggedAppId === app.id;

                    return (
                      <div
                        key={app.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app.id)}
                        onDragEnd={() => {
                          setDraggedAppId(null);
                          setDragOverCol(null);
                        }}
                        className="glass-card"
                        style={{
                          padding: '16px',
                          borderRadius: '8px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '8px',
                          backgroundColor: '#111624',
                          cursor: 'grab',
                          opacity: isBeingDragged ? 0.4 : 1,
                          border: isBeingDragged
                            ? '1px dashed var(--primary)'
                            : '1px solid var(--border-subtle)',
                          transition: 'opacity 0.2s, transform 0.15s, border-color 0.2s',
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <GripVertical size={13} style={{ color: 'var(--text-subtle)', flexShrink: 0, cursor: 'grab' }} />
                            <strong style={{ fontSize: '13.5px', color: 'var(--text-primary)', fontWeight: 600 }}>
                              {app.company_name}
                            </strong>
                          </div>

                          <button
                            onClick={() => deleteApplication(app.id)}
                            style={{
                              color: 'var(--text-muted)',
                              padding: '3px',
                              background: 'transparent',
                              border: 'none',
                              cursor: 'pointer',
                            }}
                            title="Remove from pipeline"
                            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-urgent)')}
                            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                          >
                            <Trash2 size={13} />
                          </button>
                        </div>

                        <div style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '19px' }}>
                          {app.role_title}
                        </div>

                        {app.notes && (
                          <div
                            style={{
                              fontSize: '11.5px',
                              color: 'var(--text-muted)',
                              backgroundColor: '#090c13',
                              border: '1px solid var(--border-subtle)',
                              padding: '6px 8px',
                              borderRadius: '6px',
                              lineHeight: 1.4,
                              marginLeft: '19px',
                            }}
                          >
                            {app.notes}
                          </div>
                        )}

                        {col.id !== 'SELECTED' && col.id !== 'REJECTED' && (
                          <div
                            style={{
                              display: 'flex',
                              justifyContent: 'space-between',
                              alignItems: 'center',
                              marginTop: '4px',
                              paddingTop: '8px',
                              borderTop: '1px solid var(--border-subtle)',
                            }}
                          >
                            <button
                              onClick={() => setActiveNoteApp(app)}
                              style={{
                                fontSize: '11.5px',
                                color: 'var(--primary-light)',
                                display: 'flex',
                                alignItems: 'center',
                                gap: 4,
                                background: 'transparent',
                                border: 'none',
                                cursor: 'pointer',
                              }}
                            >
                              <FileText size={12} />
                              Notes
                            </button>

                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => moveNext(app.id, col.id)}
                              style={{
                                fontSize: '11px',
                                padding: '3px 8px',
                                display: 'flex',
                                alignItems: 'center',
                                gap: '3px',
                              }}
                            >
                              <span>Advance</span>
                              <ChevronRight size={12} />
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
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
              placeholder="e.g. Goldman Sachs, Microsoft, Google"
              className="input-field"
              value={newCompany}
              onChange={(e) => setNewCompany(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Role Title</label>
            <input
              type="text"
              placeholder="e.g. Software Engineer / Summer Analyst"
              className="input-field"
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Application Notes / Round Details</label>
            <textarea
              placeholder="e.g. Online Assessment scheduled for Sunday..."
              className="input-field"
              rows={3}
              value={newNotes}
              onChange={(e) => setNewNotes(e.target.value)}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
            <Button variant="ghost" size="md" type="button" onClick={() => setIsAddModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" size="md" type="submit">
              Save to Pipeline
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
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '8px' }}>
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
                  success('Notes Saved', 'Updated application details');
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
