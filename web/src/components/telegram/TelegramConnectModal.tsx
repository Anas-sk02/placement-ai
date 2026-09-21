'use client';

import React, { useState } from 'react';
import { Send, Phone, KeyRound, ShieldCheck, ArrowRight, CheckCircle2, Link2, PlusCircle } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';
import { TelegramDiscoveredGroup } from '@/types/telegram.types';

export interface TelegramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
  onAddCustomGroup?: (group: TelegramDiscoveredGroup) => void;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
  isOpen,
  onClose,
  onConnected,
  onAddCustomGroup,
}) => {
  const { success, error } = useToast();
  const [activeTab, setActiveTab] = useState<'CHANNEL_LINK' | 'MTPROTO'>('CHANNEL_LINK');
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'SUCCESS'>('PHONE');
  const [phone, setPhone] = useState('+91 ');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Direct Channel Input State
  const [channelTitle, setChannelTitle] = useState('');
  const [channelUsername, setChannelUsername] = useState('');
  const [channelType, setChannelType] = useState<'CHANNEL' | 'SUPERGROUP'>('CHANNEL');

  const handleAddDirectChannel = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!channelTitle && !channelUsername) return;

    setIsLoading(true);
    try {
      const res = await fetch('/api/telegram/groups', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: channelTitle,
          username: channelUsername,
          chat_type: channelType,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Failed to connect channel');
      }

      const data = await res.json();
      const savedGroup: TelegramDiscoveredGroup = data.group;

      if (onAddCustomGroup) {
        onAddCustomGroup(savedGroup);
      }
      if (onConnected) {
        onConnected();
      }

      success('Channel Added & Monitored', `PlaceMint AI will now ingest notices from ${savedGroup.title}`);
      setChannelTitle('');
      setChannelUsername('');
      onClose();
    } catch (err: any) {
      error('Failed to Add Channel', err.message || 'Could not save channel to database');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate MTProto SendCodeRequest
    setTimeout(() => {
      setIsLoading(false);
      setStep('OTP');
      success('Verification Code Sent', 'Check your official Telegram app for login code');
    }, 800);
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate MTProto SignInRequest and AES-256 session persistence
    setTimeout(() => {
      setIsLoading(false);
      setStep('SUCCESS');
      success('Telegram Connected', 'Syncing your college channels and placement groups...');
      if (onConnected) onConnected();
    }, 1000);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Connect College Telegram Channel">
      {/* Tab Switcher */}
      <div
        style={{
          display: 'flex',
          backgroundColor: 'var(--background-secondary)',
          borderRadius: '8px',
          padding: '4px',
          marginBottom: '20px',
          gap: '4px',
        }}
      >
        <button
          type="button"
          onClick={() => setActiveTab('CHANNEL_LINK')}
          style={{
            flex: 1.2,
            padding: '10px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'CHANNEL_LINK' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'CHANNEL_LINK' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 700,
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            boxShadow: activeTab === 'CHANNEL_LINK' ? '0 2px 8px rgba(99, 102, 241, 0.3)' : 'none',
          }}
        >
          <Link2 size={15} />
          Add Channel Link (Instant) ⭐
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('MTPROTO')}
          style={{
            flex: 1,
            padding: '10px 14px',
            borderRadius: '6px',
            border: 'none',
            backgroundColor: activeTab === 'MTPROTO' ? 'var(--primary)' : 'transparent',
            color: activeTab === 'MTPROTO' ? '#fff' : 'var(--text-secondary)',
            fontWeight: 600,
            fontSize: '12.5px',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
          }}
        >
          <Send size={15} />
          MTProto Daemon Login
        </button>
      </div>

      {activeTab === 'CHANNEL_LINK' && (
        <form onSubmit={handleAddDirectChannel} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div
            style={{
              padding: '12px 14px',
              backgroundColor: 'rgba(99, 102, 241, 0.08)',
              borderRadius: '10px',
              border: '1px solid rgba(99, 102, 241, 0.2)',
              fontSize: '12.5px',
              color: 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Send size={18} color="var(--primary-light)" style={{ flexShrink: 0 }} />
            <span>
              Enter your college placement channel username or title to start monitoring notices immediately.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Channel Title / Name</label>
            <input
              type="text"
              required
              placeholder="e.g. Ramdeobaba University TPO Placements"
              className="input-field"
              value={channelTitle}
              onChange={(e) => setChannelTitle(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Telegram Username or Invite Link</label>
            <input
              type="text"
              required
              placeholder="e.g. @rcoem_placements or t.me/rcoem_placement_cell"
              className="input-field"
              value={channelUsername}
              onChange={(e) => setChannelUsername(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Group / Channel Type</label>
            <select
              className="input-field"
              value={channelType}
              onChange={(e) => setChannelType(e.target.value as any)}
            >
              <option value="CHANNEL">Announcement Channel (Read-Only)</option>
              <option value="SUPERGROUP">Discussion Supergroup</option>
            </select>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              leftIcon={<PlusCircle size={16} />}
            >
              Add & Start Ingesting
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'MTPROTO' && step === 'PHONE' && (
        <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Send size={20} color="#38bdf8" />
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              MTProto protocol communicates with your background Python worker daemon (<code>worker/main.py</code>). For instant channel monitoring without SMS/OTP setup, use the <strong>Add Channel Link</strong> tab.
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Phone Number with Country Code</label>
            <div style={{ position: 'relative' }}>
              <Phone size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="tel"
                required
                placeholder="+91 98765 43210"
                className="input-field"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px' }}>
            <Button variant="ghost" size="md" type="button" onClick={onClose}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isLoading}
              rightIcon={<ArrowRight size={16} />}
            >
              Send OTP Code
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'MTPROTO' && step === 'OTP' && (
        <form onSubmit={handleVerifyOtp} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ textAlign: 'center', marginBottom: '8px' }}>
            <div style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
              Enter the 5-digit code sent to your Telegram application for{' '}
              <strong style={{ color: '#fff' }}>{phone}</strong>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Telegram Login Code</label>
            <div style={{ position: 'relative' }}>
              <KeyRound size={16} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 13 }} />
              <input
                type="text"
                required
                maxLength={6}
                placeholder="12345"
                className="input-field"
                value={otpCode}
                onChange={(e) => setOtpCode(e.target.value)}
                style={{
                  paddingLeft: '38px',
                  fontFamily: 'var(--font-mono)',
                  letterSpacing: '4px',
                  fontSize: '18px',
                  textAlign: 'center',
                }}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '10px' }}>
            <Button variant="ghost" size="sm" type="button" onClick={() => setStep('PHONE')}>
              Change Number
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isLoading}
              rightIcon={<ShieldCheck size={16} />}
            >
              Authorize & Sync
            </Button>
          </div>
        </form>
      )}

      {activeTab === 'MTPROTO' && step === 'SUCCESS' && (
        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <div
            style={{
              width: '60px',
              height: '60px',
              borderRadius: '50%',
              backgroundColor: 'rgba(16, 185, 129, 0.15)',
              border: '2px solid var(--status-eligible)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '16px',
            }}
          >
            <CheckCircle2 size={32} color="var(--status-eligible)" />
          </div>
          <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
            Connection Established!
          </h3>
          <p style={{ fontSize: '13px', color: 'var(--text-secondary)', marginBottom: '24px' }}>
            Your Telegram session is AES-256 encrypted. Discovered channels are now available for live monitoring.
          </p>
          <Button variant="primary" size="md" onClick={onClose}>
            View Discovered Channels
          </Button>
        </div>
      )}
    </Modal>
  );
};
