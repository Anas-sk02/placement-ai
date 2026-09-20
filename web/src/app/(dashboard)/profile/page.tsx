'use client';

import React, { useState } from 'react';
import {
  UserCheck,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Sparkles,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { StudentProfile } from '@/types/student.types';
import { evaluateEligibility } from '@/lib/business/eligibility-checker';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { success } = useToast();
  const [profile, setProfile] = useState<StudentProfile>({
    user_id: 'user-anas-01',
    full_name: 'Anas Shaikh',
    college_name: 'Indian Institute of Technology / Engineering College',
    degree: 'B.Tech',
    branch: 'CSE',
    graduation_year: 2026,
    cgpa: 8.42,
    percentage: 86.5,
    active_backlogs: 0,
    history_backlogs: 0,
    skills: ['Java', 'Spring Boot', 'TypeScript', 'Next.js', 'PostgreSQL', 'Docker'],
  });

  // Simulator Criteria State
  const [testCgpaCutoff, setTestCgpaCutoff] = useState('7.5');
  const [testBranch, setTestBranch] = useState('CSE, IT, ECE');
  const [testBatch, setTestBatch] = useState('2026');
  const [testMaxBacklogs, setTestMaxBacklogs] = useState('0');

  const simResult = evaluateEligibility(profile, {
    min_cgpa: parseFloat(testCgpaCutoff) || 0,
    allowed_branches: testBranch.split(',').map((s) => s.trim()),
    batch_years: [parseInt(testBatch, 10)],
    max_active_backlogs: parseInt(testMaxBacklogs, 10),
  });

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    success('Profile Saved', 'Deterministic eligibility engine updated');
  };

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
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Student Placement Profile</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Academic credentials used for instant 100% deterministic eligibility evaluation
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
        }}
      >
        {/* Profile Edit Form */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '17px', fontWeight: 700, marginBottom: '20px' }}>
            Academic Credentials
          </h2>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={profile.full_name}
                onChange={(e) => setProfile({ ...profile, full_name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Graduation Batch</label>
                <select
                  className="input-field"
                  value={profile.graduation_year}
                  onChange={(e) =>
                    setProfile({ ...profile, graduation_year: parseInt(e.target.value, 10) })
                  }
                >
                  <option value="2025">2025</option>
                  <option value="2026">2026</option>
                  <option value="2027">2027</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Branch</label>
                <input
                  type="text"
                  className="input-field"
                  value={profile.branch || 'CSE'}
                  onChange={(e) => setProfile({ ...profile, branch: e.target.value })}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Current CGPA (Scale 10.0)</label>
                <input
                  type="number"
                  step="0.01"
                  className="input-field"
                  value={profile.cgpa || 8.42}
                  onChange={(e) =>
                    setProfile({ ...profile, cgpa: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Active Backlogs</label>
                <input
                  type="number"
                  className="input-field"
                  value={profile.active_backlogs ?? 0}
                  onChange={(e) =>
                    setProfile({ ...profile, active_backlogs: parseInt(e.target.value, 10) })
                  }
                />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <Button variant="primary" size="md" type="submit" leftIcon={<Save size={16} />}>
                Save Profile
              </Button>
            </div>
          </form>
        </div>

        {/* Live Simulator Card */}
        <div className="glass-card" style={{ padding: '28px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Sparkles size={20} color="var(--primary-light)" />
            <h2 style={{ fontSize: '17px', fontWeight: 700 }}>
              Live Deterministic Eligibility Simulator
            </h2>
          </div>
          <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '20px' }}>
            Test how different company cutoffs evaluate against your current profile in real time:
          </p>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company CGPA Cutoff</label>
              <input
                type="number"
                step="0.1"
                className="input-field"
                value={testCgpaCutoff}
                onChange={(e) => setTestCgpaCutoff(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Eligible Branches (comma separated)</label>
              <input
                type="text"
                className="input-field"
                value={testBranch}
                onChange={(e) => setTestBranch(e.target.value)}
              />
            </div>

            {/* Evaluation Result */}
            <div
              style={{
                marginTop: '12px',
                padding: '16px',
                borderRadius: '10px',
                backgroundColor:
                  simResult.status === 'ELIGIBLE'
                    ? 'var(--status-eligible-bg)'
                    : 'var(--status-urgent-bg)',
                border: `1px solid ${
                  simResult.status === 'ELIGIBLE'
                    ? 'var(--status-eligible-border)'
                    : 'var(--status-urgent-border)'
                }`,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
                {simResult.status === 'ELIGIBLE' ? (
                  <CheckCircle2 size={18} color="var(--status-eligible)" />
                ) : (
                  <XCircle size={18} color="var(--status-urgent)" />
                )}
                <strong
                  style={{
                    fontSize: '15px',
                    color:
                      simResult.status === 'ELIGIBLE'
                        ? 'var(--status-eligible)'
                        : 'var(--status-urgent)',
                  }}
                >
                  {simResult.status === 'ELIGIBLE' ? '100% Eligible for this Drive' : 'Not Eligible'}
                </strong>
              </div>

              <ul style={{ fontSize: '12px', color: 'var(--text-secondary)', paddingLeft: '20px' }}>
                {simResult.reasons.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
