'use client';

import React, { useState, useEffect } from 'react';
import { Send, Plus, RefreshCw, ShieldCheck, Radio, Search, PlusCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { GroupListTable } from '@/components/telegram/GroupListTable';
import { TelegramConnectModal } from '@/components/telegram/TelegramConnectModal';
import { TelegramDiscoveredGroup } from '@/types/telegram.types';
import { useToast } from '@/components/ui/Toast';

export default function TelegramManagementPage() {
  const { success, info } = useToast();
  const [groups, setGroups] = useState<TelegramDiscoveredGroup[]>([]);
  const [isConnectOpen, setIsConnectOpen] = useState(false);
  const [isSyncing, setIsSyncing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const fetchGroups = () => {
    fetch('/api/telegram/groups')
      .then((res) => (res.ok ? res.json() : { groups: [] }))
      .then((data) => setGroups(data.groups || []))
      .catch(() => setGroups([]));
  };

  useEffect(() => {
    fetchGroups();
  }, []);

  const handleToggleMonitor = async (groupId: string, currentState: boolean) => {
    const nextState = !currentState;
    setGroups((prev) =>
      prev.map((g) =>
        g.id === groupId ? { ...g, is_monitored: nextState } : g
      )
    );

    try {
      await fetch('/api/telegram/toggle-monitor', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ groupId, isMonitored: nextState }),
      });
      if (nextState) {
        success('Monitoring Enabled', 'Real-time notice ingestion activated');
      } else {
        info('Monitoring Paused', 'Ingestion temporarily paused');
      }
    } catch {
      // rollback on error
      fetchGroups();
    }
  };

  const handleDeleteGroup = async (groupId: string) => {
    setGroups((prev) => prev.filter((g) => g.id !== groupId));
    try {
      const res = await fetch(`/api/telegram/groups?id=${groupId}`, {
        method: 'DELETE',
      });
      if (res.ok) {
        success('Channel Removed', 'Removed channel from your workspace');
      }
    } catch {
      fetchGroups();
    }
  };

  const handleSyncGroups = () => {
    setIsSyncing(true);
    fetch('/api/telegram/groups')
      .then((res) => (res.ok ? res.json() : { groups: [] }))
      .then((data) => {
        if (data.groups) setGroups(data.groups);
      })
      .finally(() => {
        setIsSyncing(false);
        success('Channel Sync Complete', 'Channel list refreshed from database');
      });
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
            Connect and monitor your college placement channels & groups
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
            Sync Channels
          </Button>
          <Button
            variant="primary"
            size="md"
            onClick={() => setIsConnectOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Connect / Add Channel
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
              backgroundColor: groups.length > 0 ? 'rgba(16, 185, 129, 0.15)' : 'rgba(99, 102, 241, 0.15)',
              border: groups.length > 0 ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid rgba(99, 102, 241, 0.3)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <ShieldCheck size={22} color={groups.length > 0 ? 'var(--status-eligible)' : 'var(--primary-light)'} />
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h3 style={{ fontSize: '15px', fontWeight: 700 }}>
                {groups.length > 0 ? `${groups.length} Channels Monitored` : 'No Channels Connected Yet'}
              </h3>
              {groups.length > 0 && <Badge variant="eligible">Active Monitoring</Badge>}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginTop: '2px' }}>
              {groups.length > 0
                ? 'Ingestion Pipeline: Real-time Telegram Listener active'
                : 'Add your college channel username or invite link to start automatic notice extraction'}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Radio size={14} color={groups.length > 0 ? 'var(--status-eligible)' : 'var(--text-muted)'} />
          <span style={{ fontSize: '12.5px', color: groups.length > 0 ? 'var(--status-eligible)' : 'var(--text-muted)', fontWeight: 600 }}>
            {groups.length > 0 ? 'Live Stream Active' : 'Idle'}
          </span>
        </div>
      </div>

      {groups.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Send size={26} color="var(--primary-light)" />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              No College Channels Connected
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
              Add your college TPO announcement channels or discussion groups to automatically ingest placement updates.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsConnectOpen(true)}
            leftIcon={<PlusCircle size={16} />}
          >
            Add Your First Channel
          </Button>
        </div>
      ) : (
        <>
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

          <GroupListTable
            groups={filteredGroups}
            onToggleMonitor={handleToggleMonitor}
            onDeleteGroup={handleDeleteGroup}
          />
        </>
      )}

      {/* Telegram Auth Modal */}
      <TelegramConnectModal
        isOpen={isConnectOpen}
        onClose={() => setIsConnectOpen(false)}
        onConnected={fetchGroups}
        onAddCustomGroup={() => {
          fetchGroups();
        }}
      />
    </div>
  );
}
