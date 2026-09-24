'use client';

import React from 'react';
import { Users, Clock, Send, Trash2 } from 'lucide-react';
import { TelegramDiscoveredGroup } from '@/types/telegram.types';
import { Badge } from '../ui/Badge';

export interface GroupListTableProps {
  groups: TelegramDiscoveredGroup[];
  onToggleMonitor: (groupId: string, currentState: boolean) => void;
  onDeleteGroup?: (groupId: string) => void;
}

export const GroupListTable: React.FC<GroupListTableProps> = ({
  groups,
  onToggleMonitor,
  onDeleteGroup,
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '0',
        overflow: 'hidden',
        backgroundColor: '#111624',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: '#0a0d15',
                color: 'var(--text-muted)',
                fontSize: '11.5px',
                fontWeight: 600,
                letterSpacing: '0.02em',
              }}
            >
              <th style={{ padding: '14px 20px' }}>Channel / Group</th>
              <th style={{ padding: '14px 20px' }}>Type</th>
              <th style={{ padding: '14px 20px' }}>Members</th>
              <th style={{ padding: '14px 20px' }}>Last Activity</th>
              <th style={{ padding: '14px 20px', textAlign: 'center' }}>Live Monitoring</th>
              {onDeleteGroup && <th style={{ padding: '14px 20px', textAlign: 'right' }}>Action</th>}
            </tr>
          </thead>
          <tbody>
            {groups.map((g) => {
              const isMonitored = g.is_monitored ?? true;
              return (
                <tr
                  key={g.id}
                  style={{
                    borderBottom: '1px solid var(--border-subtle)',
                    transition: 'background var(--transition-fast)',
                  }}
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '34px',
                          height: '34px',
                          borderRadius: '8px',
                          backgroundColor: '#161d2f',
                          border: '1px solid var(--border-medium)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isMonitored ? 'var(--primary-light)' : 'var(--text-muted)',
                        }}
                      >
                        <Send size={15} />
                      </div>
                      <div>
                        <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{g.title}</div>
                        {g.username && (
                          <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>@{g.username}</div>
                        )}
                      </div>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px' }}>
                    <Badge variant={g.chat_type === 'CHANNEL' ? 'primary' : 'info'} style={{ fontSize: '10px' }}>
                      {g.chat_type}
                    </Badge>
                  </td>

                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={13} color="var(--text-muted)" />
                      <span suppressHydrationWarning>{g.total_members ? g.total_members.toLocaleString() : '—'}</span>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={13} />
                      <span suppressHydrationWarning>
                        {g.last_message_at
                          ? new Date(g.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now'}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'center' }}>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isMonitored}
                        onChange={() => onToggleMonitor(g.id, isMonitored)}
                      />
                      <span className="slider" />
                    </label>
                  </td>

                  {onDeleteGroup && (
                    <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                      <button
                        type="button"
                        onClick={() => onDeleteGroup(g.id)}
                        title="Remove Channel"
                        style={{
                          background: 'none',
                          border: 'none',
                          color: 'var(--text-muted)',
                          cursor: 'pointer',
                          padding: '6px',
                          borderRadius: '6px',
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          transition: 'color var(--transition-fast)',
                        }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--status-urgent)')}
                        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-muted)')}
                      >
                        <Trash2 size={15} />
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
