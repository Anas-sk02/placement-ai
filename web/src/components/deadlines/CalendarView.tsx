'use client';

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, Clock, ExternalLink, Plus } from 'lucide-react';
import { DeadlineItem } from '@/types/deadline.types';
import { generateGoogleCalendarUrl, generateIcsFile, downloadIcsFile } from '@/lib/calendar/calendar-sync';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { Modal } from '../ui/Modal';

export interface CalendarViewProps {
  deadlines: DeadlineItem[];
  onComplete: (id: string) => void;
  onAddCustom?: () => void;
}

const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December'
];
const DAYS_OF_WEEK = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

export const CalendarView: React.FC<CalendarViewProps> = ({
  deadlines,
  onComplete,
  onAddCustom,
}) => {
  const [currentDate, setCurrentDate] = useState(() => new Date());
  const [selectedDeadline, setSelectedDeadline] = useState<DeadlineItem | null>(null);

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  // First day of month (0-6)
  const firstDayIndex = new Date(year, month, 1).getDay();
  // Total days in month
  const totalDays = new Date(year, month + 1, 0).getDate();
  // Total days in previous month
  const prevMonthTotalDays = new Date(year, month, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Group deadlines by day of the current visible month
  const deadlinesByDay = React.useMemo(() => {
    const map = new Map<number, DeadlineItem[]>();
    deadlines.forEach((d) => {
      const date = new Date(d.deadline_at);
      if (date.getFullYear() === year && date.getMonth() === month) {
        const dayNum = date.getDate();
        const existing = map.get(dayNum) || [];
        existing.push(d);
        map.set(dayNum, existing);
      }
    });
    return map;
  }, [deadlines, year, month]);

  const today = new Date();
  const isCurrentMonthToday = today.getFullYear() === year && today.getMonth() === month;

  // Build grid cells (42 cells: 6 rows x 7 days)
  const cells: { type: 'prev' | 'current' | 'next'; day: number }[] = [];

  // Previous month trailing days
  for (let i = firstDayIndex - 1; i >= 0; i--) {
    cells.push({ type: 'prev', day: prevMonthTotalDays - i });
  }

  // Current month days
  for (let d = 1; d <= totalDays; d++) {
    cells.push({ type: 'current', day: d });
  }

  // Next month leading days to fill up to 35 or 42 cells
  const remainingCells = (7 - (cells.length % 7)) % 7;
  for (let d = 1; d <= remainingCells; d++) {
    cells.push({ type: 'next', day: d });
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      {/* Calendar Header Controls */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>
            {MONTHS[month]} {year}
          </h2>
          <Button variant="ghost" size="sm" onClick={handleToday} style={{ fontSize: '12px', padding: '4px 10px' }}>
            Today
          </Button>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <button
            onClick={handlePrevMonth}
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: '#111624',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
            }}
            title="Previous Month"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            onClick={handleNextMonth}
            style={{
              padding: '6px',
              borderRadius: '6px',
              backgroundColor: '#111624',
              border: '1px solid var(--border-subtle)',
              color: 'var(--text-secondary)',
              cursor: 'pointer',
              display: 'flex',
            }}
            title="Next Month"
          >
            <ChevronRight size={16} />
          </button>
        </div>
      </div>

      {/* Calendar Grid Container */}
      <div
        className="glass-card"
        style={{
          padding: '0',
          overflow: 'hidden',
          backgroundColor: '#111624',
          borderRadius: '10px',
        }}
      >
        {/* Days of Week Header */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            backgroundColor: '#0a0d15',
            borderBottom: '1px solid var(--border-subtle)',
            textAlign: 'center',
          }}
        >
          {DAYS_OF_WEEK.map((day, idx) => (
            <div
              key={day}
              style={{
                padding: '10px 4px',
                fontSize: '11.5px',
                fontWeight: 600,
                color: idx === 0 || idx === 6 ? 'var(--text-muted)' : 'var(--text-secondary)',
                letterSpacing: '0.02em',
              }}
            >
              {day}
            </div>
          ))}
        </div>

        {/* Days Matrix */}
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(7, 1fr)',
            minHeight: '480px',
          }}
        >
          {cells.map((cell, idx) => {
            const isToday = isCurrentMonthToday && cell.type === 'current' && cell.day === today.getDate();
            const dayDeadlines = cell.type === 'current' ? deadlinesByDay.get(cell.day) || [] : [];

            return (
              <div
                key={idx}
                style={{
                  borderRight: (idx + 1) % 7 !== 0 ? '1px solid var(--border-subtle)' : 'none',
                  borderBottom: idx < cells.length - 7 ? '1px solid var(--border-subtle)' : 'none',
                  padding: '8px',
                  minHeight: '90px',
                  backgroundColor: cell.type !== 'current' ? 'rgba(0, 0, 0, 0.25)' : 'transparent',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '4px',
                  transition: 'background var(--transition-fast)',
                }}
              >
                {/* Day Number Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span
                    style={{
                      fontSize: '12px',
                      fontWeight: isToday ? 700 : 500,
                      width: '22px',
                      height: '22px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      backgroundColor: isToday ? 'var(--primary)' : 'transparent',
                      color: isToday
                        ? '#ffffff'
                        : cell.type === 'current'
                        ? 'var(--text-primary)'
                        : 'var(--text-subtle)',
                    }}
                  >
                    {cell.day}
                  </span>

                  {dayDeadlines.length > 0 && (
                    <span
                      style={{
                        fontSize: '9.5px',
                        fontWeight: 600,
                        padding: '1px 5px',
                        borderRadius: '999px',
                        backgroundColor: 'rgba(239, 68, 68, 0.15)',
                        color: '#f87171',
                      }}
                    >
                      {dayDeadlines.length}
                    </span>
                  )}
                </div>

                {/* Deadlines list in cell */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', marginTop: '2px' }}>
                  {dayDeadlines.map((dl) => {
                    const isCompleted = dl.status === 'COMPLETED';
                    return (
                      <div
                        key={dl.id}
                        onClick={() => setSelectedDeadline(dl)}
                        style={{
                          fontSize: '10.5px',
                          padding: '3px 6px',
                          borderRadius: '4px',
                          backgroundColor: isCompleted
                            ? 'rgba(16, 185, 129, 0.12)'
                            : 'rgba(59, 130, 246, 0.15)',
                          border: `1px solid ${
                            isCompleted ? 'rgba(16, 185, 129, 0.3)' : 'rgba(59, 130, 246, 0.3)'
                          }`,
                          color: isCompleted ? '#34d399' : '#93c5fd',
                          cursor: 'pointer',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          fontWeight: 500,
                        }}
                        title={`${dl.company_name} - ${dl.title}`}
                      >
                        {dl.company_name}: {dl.title}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Deadline Quick View Modal */}
      {selectedDeadline && (
        <Modal
          isOpen={Boolean(selectedDeadline)}
          onClose={() => setSelectedDeadline(null)}
          title={`Placement Deadline: ${selectedDeadline.company_name}`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div>
              <h3 style={{ fontSize: '15px', fontWeight: 600, color: 'var(--text-primary)' }}>
                {selectedDeadline.title}
              </h3>
              <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Recruiter: <strong>{selectedDeadline.company_name}</strong>
              </div>
            </div>

            <div
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                backgroundColor: '#0d111a',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px',
                fontSize: '12.5px',
              }}
            >
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Closing Time: </span>
                <strong style={{ color: 'var(--status-urgent)' }}>
                  {new Date(selectedDeadline.deadline_at).toLocaleString()}
                </strong>
              </div>
              <div>
                <span style={{ color: 'var(--text-muted)' }}>Status: </span>
                <Badge variant={selectedDeadline.status === 'COMPLETED' ? 'eligible' : 'urgent'}>
                  {selectedDeadline.status}
                </Badge>
              </div>
            </div>

            {/* Direct Sync Buttons */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <a
                href={generateGoogleCalendarUrl(selectedDeadline)}
                target="_blank"
                rel="noopener noreferrer"
                style={{ textDecoration: 'none' }}
              >
                <Button variant="primary" size="md" style={{ width: '100%' }} leftIcon={<CalendarIcon size={14} />}>
                  Add to Google Calendar
                </Button>
              </a>

              <Button
                variant="secondary"
                size="md"
                style={{ width: '100%' }}
                onClick={() => {
                  const ics = generateIcsFile(selectedDeadline);
                  downloadIcsFile(`${selectedDeadline.company_name}-deadline.ics`, ics);
                }}
                leftIcon={<CalendarIcon size={14} />}
              >
                Download .ics for Apple / Outlook Calendar
              </Button>
            </div>

            {/* Footer Action Links */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '8px', borderTop: '1px solid var(--border-subtle)' }}>
              <button
                onClick={() => {
                  onComplete(selectedDeadline.id);
                  setSelectedDeadline(null);
                }}
                style={{
                  background: 'none',
                  border: 'none',
                  fontSize: '12px',
                  color: 'var(--primary-light)',
                  cursor: 'pointer',
                  fontWeight: 500,
                }}
              >
                {selectedDeadline.status === 'COMPLETED' ? 'Mark as Active' : 'Mark as Completed ✅'}
              </button>

              {selectedDeadline.action_url && (
                <a href={selectedDeadline.action_url} target="_blank" rel="noopener noreferrer">
                  <Button variant="secondary" size="sm" rightIcon={<ExternalLink size={13} />}>
                    Open Form
                  </Button>
                </a>
              )}
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
