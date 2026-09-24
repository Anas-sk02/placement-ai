'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Lock, Mail, User, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { createClient } from '@/lib/supabase/client';

export default function RegisterPage() {
  const router = useRouter();
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [graduationYear, setGraduationYear] = useState('2026');
  const [branch, setBranch] = useState('CSE');
  const [collegeName, setCollegeName] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setErrorMsg(null);

    try {
      const supabase = createClient();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: fullName,
            graduation_year: parseInt(graduationYear, 10),
            branch,
            college_name: collegeName || 'Engineering College',
          },
        },
      });

      if (error) {
        if (error.message.toLowerCase().includes('rate limit')) {
          setErrorMsg('Email rate limit reached. Turn off "Confirm email" in Supabase Auth to enable instant onboarding.');
        } else {
          setErrorMsg(error.message);
        }
        return;
      }

      if (data.user) {
        try {
          await (supabase.from('student_profiles') as any).upsert({
            user_id: data.user.id,
            full_name: fullName,
            college_name: collegeName || 'Engineering College',
            degree: 'B.Tech',
            branch: branch,
            graduation_year: parseInt(graduationYear, 10),
            cgpa: 8.0,
            percentage: 80.0,
            active_backlogs: 0,
            history_backlogs: 0,
            skills: ['Java', 'Python', 'Web Development'],
          }, { onConflict: 'user_id' });
        } catch {
          // Fallback handled by DB defaults
        }

        router.push('/dashboard');
        router.refresh();
      } else {
        router.push('/dashboard');
        router.refresh();
      }
    } catch (err: any) {
      setErrorMsg(err.message || 'Registration failed. Please try again.');
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
          maxWidth: '480px',
          padding: '36px',
          backgroundColor: '#111624',
          borderRadius: '12px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
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
            Create Student Account
          </h1>
          <p style={{ fontSize: '12.5px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Set up your placement profile for deterministic eligibility matching
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

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 12, top: 12 }}
              />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: '34px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College Email Address</label>
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

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
            <div className="form-group">
              <label className="form-label">Graduation Batch</label>
              <select
                className="input-field"
                value={graduationYear}
                onChange={(e) => setGraduationYear(e.target.value)}
              >
                <option value="2025">2025 Batch</option>
                <option value="2026">2026 Batch</option>
                <option value="2027">2027 Batch</option>
                <option value="2028">2028 Batch</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Branch</label>
              <select
                className="input-field"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
              >
                <option value="CSE">CSE</option>
                <option value="IT">IT</option>
                <option value="ECE">ECE</option>
                <option value="EEE">EEE</option>
                <option value="MECH">MECH</option>
                <option value="CIVIL">CIVIL</option>
                <option value="AIDS">AI / Data Science</option>
              </select>
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College / Institute Name (Optional)</label>
            <input
              type="text"
              placeholder="e.g. National Institute of Technology"
              className="input-field"
              value={collegeName}
              onChange={(e) => setCollegeName(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Password</label>
            <div style={{ position: 'relative' }}>
              <Lock
                size={15}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 12, top: 12 }}
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Create password (min 6 characters)"
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
            Create Account
          </Button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '12.5px',
            color: 'var(--text-muted)',
          }}
        >
          Already registered?{' '}
          <Link href="/login" style={{ color: 'var(--primary-light)', fontWeight: 600 }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}
