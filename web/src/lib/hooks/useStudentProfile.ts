'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentProfile } from '@/types/student.types';

const DEFAULT_PROFILE: StudentProfile = {
  user_id: 'guest',
  full_name: 'Demo Student',
  college_name: 'Indian Institute of Technology',
  degree: 'B.Tech',
  branch: 'CSE',
  graduation_year: 2026,
  cgpa: 8.42,
  percentage: 86.5,
  active_backlogs: 0,
  history_backlogs: 0,
  skills: ['Java', 'TypeScript', 'Next.js', 'PostgreSQL', 'Docker'],
};

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>(DEFAULT_PROFILE);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await fetch('/api/profile');
      if (res.ok) {
        const data = await res.json();
        if (data.profile) {
          setProfile(data.profile);
        }
      }
    } catch {
      // Fallback to default state
    } finally {
      setLoading(false);
    }
  }, []);

  const saveProfile = async (updated: Partial<StudentProfile>) => {
    const newProfile = { ...profile, ...updated };
    setProfile(newProfile as StudentProfile);

    try {
      const res = await fetch('/api/profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newProfile),
      });
      return res.ok;
    } catch {
      return false;
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  return { profile, loading, saveProfile, refresh: fetchProfile };
}
