'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Lock, Mail, User, AlertCircle, PlayCircle } from 'lucide-react';
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
        setErrorMsg(error.message);
        return;
      }

      if (data.user) {
        // Upsert student profile row
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
          // Profile trigger handles it if direct insert is blocked by RLS
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
      }}
    >
      <div
        className="glass-card"
        style={{
          width: '100%',
          maxWidth: '500px',
          padding: '36px',
        }}
      >
        <div style={{ textAlign: 'center', marginBottom: '24px' }}>
          <div
            style={{
              width: '46px',
              height: '46px',
              borderRadius: '14px',
              background: 'var(--brand-gradient)',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '12px',
              boxShadow: 'var(--primary-glow)',
            }}
          >
            <GraduationCap size={26} color="#ffffff" />
          </div>
          <h1 style={{ fontSize: '22px', fontWeight: 800 }}>Student Registration</h1>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
            Set up your placement profile for eligibility automation
          </p>
        </div>

        {errorMsg && (
          <div
            style={{
              backgroundColor: 'var(--status-urgent-bg)',
              border: '1px solid var(--status-urgent-border)',
              borderRadius: '8px',
              padding: '12px 14px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              color: 'var(--status-urgent)',
              fontSize: '13px',
              marginBottom: '18px',
            }}
          >
            <AlertCircle size={16} style={{ marginTop: '2px', flexShrink: 0 }} />
            <span>{errorMsg}</span>
          </div>
        )}

        <form onSubmit={handleRegister}>
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <div style={{ position: 'relative' }}>
              <User
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 14, top: 13 }}
              />
              <input
                type="text"
                required
                placeholder="e.g. Rahul Sharma"
                className="input-field"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">College Email Address</label>
            <div style={{ position: 'relative' }}>
              <Mail
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 14, top: 13 }}
              />
              <input
                type="email"
                required
                placeholder="student@college.edu"
                className="input-field"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ paddingLeft: '38px' }}
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
                size={16}
                color="var(--text-muted)"
                style={{ position: 'absolute', left: 14, top: 13 }}
              />
              <input
                type="password"
                required
                minLength={6}
                placeholder="Create secure password (min 6 chars)"
                className="input-field"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{ paddingLeft: '38px' }}
              />
            </div>
          </div>

          <Button
            type="submit"
            variant="primary"
            size="lg"
            isLoading={loading}
            style={{ width: '100%', marginTop: '10px' }}
            rightIcon={<ArrowRight size={16} />}
          >
            Create My Placement Account
          </Button>
        </form>

        <div
          style={{
            textAlign: 'center',
            marginTop: '20px',
            fontSize: '13px',
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
