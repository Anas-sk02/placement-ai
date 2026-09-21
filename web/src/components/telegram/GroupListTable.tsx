'use client';

import React from 'react';
import { Radio, Users, Clock, Send, Check } from 'lucide-react';
import { TelegramDiscoveredGroup } from '@/types/telegram.types';
import { Badge } from '../ui/Badge';

export interface GroupListTableProps {
  groups: TelegramDiscoveredGroup[];
  onToggleMonitor: (groupId: string, currentState: boolean) => void;
}

export const GroupListTable: React.FC<GroupListTableProps> = ({
  groups,
  onToggleMonitor,
}) => {
  return (
    <div
      className="glass-card"
      style={{
        padding: '0',
        overflow: 'hidden',
      }}
    >
      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13.5px' }}>
          <thead>
            <tr
              style={{
                borderBottom: '1px solid var(--border-subtle)',
                backgroundColor: 'rgba(255, 255, 255, 0.02)',
                color: 'var(--text-muted)',
                fontSize: '12px',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              <th style={{ padding: '16px 20px' }}>Channel / Group</th>
              <th style={{ padding: '16px 20px' }}>Type</th>
              <th style={{ padding: '16px 20px' }}>Members</th>
              <th style={{ padding: '16px 20px' }}>Last Activity</th>
              <th style={{ padding: '16px 20px', textAlign: 'right' }}>Active Monitoring</th>
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
                  className="hover:bg-white/[0.02]"
                >
                  <td style={{ padding: '16px 20px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '10px',
                          backgroundColor: isMonitored ? 'rgba(99, 102, 241, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          color: isMonitored ? 'var(--primary-light)' : 'var(--text-muted)',
                        }}
                      >
                        <Send size={18} />
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
                    <Badge variant={g.chat_type === 'CHANNEL' ? 'primary' : 'info'}>
                      {g.chat_type}
                    </Badge>
                  </td>

                  <td style={{ padding: '16px 20px', color: 'var(--text-secondary)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Users size={14} color="var(--text-muted)" />
                      <span suppressHydrationWarning>{g.total_members ? g.total_members.toLocaleString() : '—'}</span>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px', color: 'var(--text-muted)', fontSize: '12px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Clock size={14} />
                      <span suppressHydrationWarning>
                        {g.last_message_at
                          ? new Date(g.last_message_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                          : 'Just now'}
                      </span>
                    </div>
                  </td>

                  <td style={{ padding: '16px 20px', textAlign: 'right' }}>
                    <label className="switch">
                      <input
                        type="checkbox"
                        checked={isMonitored}
                        onChange={() => onToggleMonitor(g.id, isMonitored)}
                      />
                      <span className="slider" />
                    </label>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
