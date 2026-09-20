'use client';

import React, { useState } from 'react';
import { Send, Phone, KeyRound, ShieldCheck, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Modal } from '../ui/Modal';
import { Button } from '../ui/Button';
import { useToast } from '../ui/Toast';

export interface TelegramConnectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConnected?: () => void;
}

export const TelegramConnectModal: React.FC<TelegramConnectModalProps> = ({
  isOpen,
  onClose,
  onConnected,
}) => {
  const { success, error } = useToast();
  const [step, setStep] = useState<'PHONE' | 'OTP' | 'SUCCESS'>('PHONE');
  const [phone, setPhone] = useState('+91 ');
  const [otpCode, setOtpCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

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
    <Modal isOpen={isOpen} onClose={onClose} title="Connect Official Telegram Account">
      {step === 'PHONE' && (
        <form onSubmit={handleSendCode} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px', backgroundColor: 'rgba(56, 189, 248, 0.08)', borderRadius: '10px', border: '1px solid rgba(56, 189, 248, 0.2)' }}>
            <Send size={20} color="#38bdf8" />
            <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)' }}>
              We use official MTProto client protocol to discover and monitor the college channels you already have access to.
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

      {step === 'OTP' && (
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

      {step === 'SUCCESS' && (
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
