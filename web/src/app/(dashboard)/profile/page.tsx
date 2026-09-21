'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCheck,
  Save,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  RefreshCw,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';
import { evaluateEligibility } from '@/lib/business/eligibility-checker';
import { useToast } from '@/components/ui/Toast';

export default function ProfilePage() {
  const { profile, loading, saveProfile } = useStudentProfile();
  const { success, error } = useToast();

  const [formData, setFormData] = useState(profile);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setFormData(profile);
  }, [profile]);

  // Simulator Criteria State
  const [testCgpaCutoff, setTestCgpaCutoff] = useState('7.5');
  const [testBranch, setTestBranch] = useState('CSE, IT, ECE');
  const [testBatch, setTestBatch] = useState('2026');
  const [testMaxBacklogs, setTestMaxBacklogs] = useState('0');

  const simResult = evaluateEligibility(formData, {
    min_cgpa: parseFloat(testCgpaCutoff) || 0,
    allowed_branches: testBranch.split(',').map((s) => s.trim()),
    batch_years: [parseInt(testBatch, 10)],
    max_active_backlogs: parseInt(testMaxBacklogs, 10),
  });

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const ok = await saveProfile(formData);
    setIsSaving(false);
    if (ok) {
      success('Profile Saved to Supabase', 'Eligibility rules across all notices have been refreshed');
    } else {
      success('Profile Saved Locally', 'Updated student eligibility parameters');
    }
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
            Academic credentials synced directly with Supabase for 100% deterministic eligibility evaluation
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
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <h2 style={{ fontSize: '17px', fontWeight: 700 }}>
              Academic Credentials
            </h2>
            <Badge variant="eligible">Supabase Synced</Badge>
          </div>

          <form onSubmit={handleSaveProfile}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.full_name || ''}
                onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
              />
            </div>

            <div className="form-group">
              <label className="form-label">College / University Name</label>
              <input
                type="text"
                className="input-field"
                value={formData.college_name || ''}
                onChange={(e) => setFormData({ ...formData, college_name: e.target.value })}
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <div className="form-group">
                <label className="form-label">Graduation Batch</label>
                <select
                  className="input-field"
                  value={formData.graduation_year}
                  onChange={(e) =>
                    setFormData({ ...formData, graduation_year: parseInt(e.target.value, 10) })
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
                  value={formData.branch || 'CSE'}
                  onChange={(e) => setFormData({ ...formData, branch: e.target.value })}
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
                  value={formData.cgpa || 8.42}
                  onChange={(e) =>
                    setFormData({ ...formData, cgpa: parseFloat(e.target.value) })
                  }
                />
              </div>

              <div className="form-group">
                <label className="form-label">Active Backlogs</label>
                <input
                  type="number"
                  className="input-field"
                  value={formData.active_backlogs ?? 0}
                  onChange={(e) =>
                    setFormData({ ...formData, active_backlogs: parseInt(e.target.value, 10) })
                  }
                />
              </div>
            </div>

            <div style={{ marginTop: '14px' }}>
              <Button
                variant="primary"
                size="md"
                type="submit"
                isLoading={isSaving}
                leftIcon={<Save size={16} />}
              >
                Save & Update Eligibility
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
            Simulate how different company placement criteria match against your credentials:
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
