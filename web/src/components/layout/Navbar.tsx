'use client';

import React from 'react';
import { Bell, Plus, Sparkles } from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  return (
    <header
      style={{
        height: '60px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: '#07090e',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 40px',
      }}
    >
      {/* Left Brand Badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            fontSize: '13px',
            color: 'var(--text-secondary)',
          }}
        >
          <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Command Center</span>
          <span style={{ color: 'var(--text-muted)' }}>/</span>
          <span style={{ color: 'var(--text-muted)' }}>Live Campus Ingestion</span>
        </div>
      </div>

      {/* Right Utility Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
        {/* Worker Daemon Health Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '5px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(16, 185, 129, 0.08)',
            border: '1px solid rgba(16, 185, 129, 0.2)',
            fontSize: '12px',
            fontWeight: 500,
            color: 'var(--status-eligible)',
          }}
        >
          <span
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-eligible)',
              boxShadow: '0 0 8px rgba(16, 185, 129, 0.6)',
            }}
          />
          <span>Telegram Engine Active</span>
        </div>

        {/* Quick Action Button */}
        <Link href="/applications">
          <button
            className="btn btn-secondary btn-sm"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: '12.5px',
              padding: '6px 12px',
            }}
          >
            <Plus size={14} color="var(--primary-light)" />
            <span>Track Application</span>
          </button>
        </Link>

        {/* Urgent Deadlines Notification Bell */}
        <Link
          href="/deadlines"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '34px',
            height: '34px',
            borderRadius: '8px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
            transition: 'all var(--transition-fast)',
          }}
          title="Upcoming Deadlines"
        >
          <Bell size={15} />
          <span
            style={{
              position: 'absolute',
              top: '6px',
              right: '6px',
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-urgent)',
            }}
          />
        </Link>
      </div>
    </header>
  );
};
