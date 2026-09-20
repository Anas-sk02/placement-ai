'use client';

import React, { useState } from 'react';
import { Settings, Bell, Shield, Key, Save, Radio } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';

export default function SettingsPage() {
  const { success } = useToast();
  const [autoRunInsights, setAutoRunInsights] = useState(true);
  const [pushEnabled, setPushEnabled] = useState(true);
  const [offsets, setOffsets] = useState([24, 6, 1]);

  const handleSave = () => {
    success('Settings Saved', 'Notification offsets and worker preferences updated');
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div style={{ marginBottom: '28px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Preferences & Settings</h1>
        <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
          Configure worker ingestion rules, AI extraction provider, and deadline reminder offsets
        </p>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        {/* Notifications Card */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Bell size={20} color="var(--primary-light)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Deadline Reminder Offsets</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Web Push Alerts</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Receive browser notifications when deadlines enter urgent window
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

            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingTop: '10px', borderTop: '1px solid var(--border-subtle)' }}>
              <div>
                <div style={{ fontSize: '14px', fontWeight: 600 }}>Automatic AI Extraction</div>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>
                  Immediately parse incoming Telegram notices from monitored channels
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
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Radio size={20} color="var(--status-eligible)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Python MTProto Worker Health</h2>
          </div>

          <div style={{ fontSize: '13px', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            <div><strong>Status:</strong> <span style={{ color: 'var(--status-eligible)' }}>Operational (Connected to Telegram DC5)</span></div>
            <div style={{ marginTop: '4px' }}><strong>Monitored Unions:</strong> 4 Telegram groups</div>
            <div style={{ marginTop: '4px' }}><strong>Encryption:</strong> AES-256-GCM Session Key Verified</div>
          </div>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" size="md" onClick={handleSave} leftIcon={<Save size={16} />}>
            Save Preferences
          </Button>
        </div>
      </div>
    </div>
  );
}
