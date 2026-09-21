'use client';

import React, { useState } from 'react';
import { Send, Plus, RefreshCw, ShieldCheck, Radio, Search } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GroupListTable } from '@/components/telegram/GroupListTable';
import { TelegramConnectModal } from '@/components/telegram/TelegramConnectModal';
import { TelegramDiscoveredGroup } from '@/types/telegram.types';
import { useToast } from '@/components/ui/Toast';

const INITIAL_GROUPS: TelegramDiscoveredGroup[] = [
  {
    id: 'grp-01',
    telegram_id: -1001829472910,
    title: 'TPO Official Placements 2026',
    username: 'tpo_placements_2026',
    chat_type: 'CHANNEL',
    total_members: 2450,
    last_message_at: new Date(Date.now() - 15 * 60000).toISOString(),
    last_discovered_at: new Date().toISOString(),
    is_monitored: true,
  },
  {
    id: 'grp-02',
    telegram_id: -1001948271048,
    title: 'CSE & IT Placement Cell (Verified)',
    username: 'cse_placement_cell',
    chat_type: 'SUPERGROUP',
    total_members: 820,
    last_message_at: new Date(Date.now() - 45 * 60000).toISOString(),
    last_discovered_at: new Date().toISOString(),
    is_monitored: true,
  },
  {
    id: 'grp-03',
    telegram_id: -1001739281940,
    title: 'Off-Campus Tech Internships & Drives 2026',
    username: 'offcampus_drives_26',
    chat_type: 'CHANNEL',
    total_members: 15400,
    last_message_at: new Date(Date.now() - 120 * 60000).toISOString(),
    last_discovered_at: new Date().toISOString(),
    is_monitored: true,
  },
  {
    id: 'grp-04',
    telegram_id: -1001628192039,
    title: 'ECE & Core Engineering Placement Desk',
    username: 'ece_core_desk',
    chat_type: 'SUPERGROUP',
    total_members: 410,
    last_message_at: new Date(Date.now() - 360 * 60000).toISOString(),
    last_discovered_at: new Date().toISOString(),
    is_monitored: true,
  },
];

export default function TelegramManagementPage() {
  const { success, info } = useToast();
  const [groups, setGroups] = useState<TelegramDiscoveredGroup[]>(INITIAL_GROUPS);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const handleToggleMonitor = (groupId: string, currentState: boolean) => {
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, is_monitored: !currentState } : g
      )
    );
    if (!currentState) {
      success('Monitoring Enabled', 'Real-time message ingestion activated for this group');
    } else {
      info('Monitoring Paused', 'Ingestion temporarily paused');
    }
  };

  const handleSyncGroups = () => {
    setIsSyncing(true);
    setTimeout(() => {
      setIsSyncing(false);
      success('Channel Sync Complete', 'Discovered channels are up to date');
    }, 1200);
  };

  const filteredGroups = groups.filter((g) =>
    g.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (g.username && g.username.toLowerCase().includes(searchQuery.toLowerCase()))
  );

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
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Telegram Channel Hub</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Manage MTProto connections and configure which college channels ingest notices
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <Button
            variant="secondary"
            size="md"
            isLoading={isSyncing}
            onClick={handleSyncGroups}
            leftIcon={<RefreshCw size={16} />}
          >
            Sync All Channels
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsConnectOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Connect Telegram Account
          </Button>
        </div>
      </div>

      {/* Connection Status Card */}
      <div
        className="glass-card"
        style={{
          padding: '20px 24px',
          marginBottom: '28px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '44px',
              height: '44px',
              borderRadius: '12px',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '1px solid rgba(16, 185, 129, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} color="var(--status-eligible)" />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                MTProto Session Connected (+91 98765 43210)
              </h3>
              <Badge variant="eligible">Encrypted AES-256</Badge>
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              Worker Daemon: Render dedicated Python process • Last ping: 4 seconds ago
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={14} className="pulse-urgent" color="var(--status-eligible)" />
          <span style={{ fontSize: '12.5px', color: 'var(--status-eligible)', fontWeight: 600 }}>
            Live Stream Active
          </span>
        </div>
      </div>

      {/* Filter and Table */}
      <div style={{ marginBottom: '16px', maxWidth: '340px', position: 'relative' }}>
        <Search
          size={16}
          color="var(--text-muted)"
          style={{ position: 'absolute', left: 14, top: 12 }}
        />
        <input
          type="text"
          placeholder="Filter discovered groups..."
          className="input-field"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{ paddingLeft: '38px' }}
        />
      </div>

      <GroupListTable groups={filteredGroups} onToggleMonitor={handleToggleMonitor} />

      {/* Telegram Auth Modal */}
      <TelegramConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onConnected={handleSyncGroups}
        onAddCustomGroup={(newGroup) => {
          setGroups((prev) => [newGroup, ...prev]);
        }}
      />
    </div>
  );
}
