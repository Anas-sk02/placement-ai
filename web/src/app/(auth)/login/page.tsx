'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Lock, Mail, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        setErrorMsg(error.message);
      } else if (data.session) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setErrorMsg('Unable to sign in. Please verify your email and password.');
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'An unexpected error occurred during sign in.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
        backgroundColor: '#07090e',
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '420px',
          padding: '36px',
          backgroundColor: '#111624',
          borderRadius: '12px',
        }}
      >
        {/* Brand Header */}
        <div style={{ textAlign: 'center', marginBottom: '28px' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: 'var(--brand-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: '0 2px 10px rgba(37, 99, 235, 0.3)',
            }}
          >
            <GraduationCap size={22} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '20px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Welcome Back
          </h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Sign in to access your placement command center
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--status-urgent-bg)',
              border: '1px solid var(--status-urgent-border)',
              borderRadius: '6px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '8px',
              color: '#f87171',
              fontSize: '12.5px',
              marginBottom: '16px',
            }}
          >
            <AlertCircle size={15} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 12, top: 12 }}
              />
              <input
                type="email"
                required
                placeholder="student@college.edu"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <label className="form-label">Password</label>
            </div>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 12, top: 12 }}
              />
              <input
                type="password"
                required
                placeholder="••••••••••••"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            style={{ width: '100%', marginTop: '6px' }}
            rightIcon={<ArrowRight size={15} />}
          >
            Sign In
          </Button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '22px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
          }}
        >
          Don&apos;t have an account?{' '}
          <Link href="/register" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
            Create Student Account
          </Link>
        </div>
      </div>
    </div>
  );
}
