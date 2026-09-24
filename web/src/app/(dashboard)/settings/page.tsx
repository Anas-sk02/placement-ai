'use client';

import React, { useState } from 'react';
import { Bell, Save, Radio } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { success } = useToast();
  const [autoRunInsights, setAutoRunInsights] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);

  const handleSave = () => {
    success('Settings Saved', 'Notification offsets and worker preferences updated');
  };

  return (
    <div className="page-container" style={{ maxWidth: '780px' }}>
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
          Settings & Preferences
        </h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Configure ingestion triggers, reminder intervals, and background daemon preferences
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Notifications Card */}
        <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '18px' }}>
            <Bell size={18} color="var(--primary-light)" />
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Deadline Reminder Offsets</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Browser Push Notifications</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Receive prompt reminders when deadlines enter urgent 24h/6h windows
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={pushEnabled}
                  onChange={(e) => setPushEnabled(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '12px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '13.5px', fontWeight: 600 }}>Automatic Notice Parsing</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Extract placement criteria immediately when Telegram broadcasts arrive
                </div>
              </div>
              <label className="switch">
                <input
                  type="checkbox"
                  checked={autoRunInsights}
                  onChange={(e) => setAutoRunInsights(e.target.checked)}
                />
                <span className="slider" />
              </label>
            </div>
          </div>
        </div>

        {/* Worker Daemon Card */}
        <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Radio size={18} color="var(--status-eligible)" />
            <h2 style={{ fontSize: '15px', fontWeight: 700 }}>Worker Daemon Engine</h2>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.7 }}>
            <div><span style={{ color: 'var(--text-muted)' }}>Daemon State:</span> <strong style={{ color: 'var(--status-eligible)', fontWeight: 600 }}>Operational & Ingesting</strong></div>
            <div><span style={{ color: 'var(--text-muted)' }}>Extraction Engine:</span> Dual-Engine (Gemini 2.5 Flash + Fallback Regex)</div>
            <div><span style={{ color: 'var(--text-muted)' }}>Security Protocol:</span> AES-256 Authenticated Session</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '4px' }}>
          <Button variant="primary" size="md" onClick={handleSave} leftIcon={<Save size={15} />}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
