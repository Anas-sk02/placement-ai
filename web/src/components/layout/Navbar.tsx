'use client';

import React from 'react';
import { Search, Bell, Radio, Activity } from 'lucide-react';
import Link from 'next/link';

export const Navbar: React.FC = () => {
  return (
    <header
      style={{
        height: '64px',
        borderBottom: '1px solid var(--border-subtle)',
        backgroundColor: 'rgba(7, 9, 19, 0.8)',
        backdropFilter: 'blur(12px)',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 32px',
      }}
    >
      {/* Global Search */}
      <div style={{ position: 'relative', width: '380px' }}>
        <Search
          size={16}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: 14, top: 12 }}
        />
        <input
          type="text"
          placeholder="Search companies, roles, CTC, eligibility..."
          className="input-field"
          style={{
            paddingLeft: '38px',
            paddingTop: '8px',
            paddingBottom: '8px',
            fontSize: '13px',
            borderRadius: '999px',
            backgroundColor: 'rgba(255, 255, 255, 0.04)',
          }}
        />
      </div>

      {/* Right Utility Bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        {/* Worker Daemon Health Status */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            padding: '6px 12px',
            borderRadius: '999px',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            border: '1px solid rgba(16, 185, 129, 0.25)',
            fontSize: '12px',
            fontWeight: 600,
            color: 'var(--status-eligible)',
          }}
        >
          <Radio size={14} className="pulse-urgent" color="var(--status-eligible)" />
          <span>Telegram Ingestion: Active</span>
        </div>

        {/* Urgent Deadlines Notification Bell */}
        <Link
          href="/deadlines"
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            backgroundColor: 'rgba(255, 255, 255, 0.05)',
            border: '1px solid var(--border-subtle)',
            color: 'var(--text-secondary)',
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '-3px',
              right: '-3px',
              width: '18px',
              height: '18px',
              borderRadius: '50%',
              backgroundColor: 'var(--status-urgent)',
              color: '#ffffff',
              fontSize: '10px',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: 'var(--status-urgent-glow)',
            }}
          >
            2
          </span>
        </Link>
      </div>
    </header>
  );
};
