'use client';

import { useState, useEffect, useCallback } from 'react';
import { StudentProfile } from '@/types/student.types';

const EMPTY_PROFILE: StudentProfile = {
  user_id: '',
  full_name: '',
  college_name: '',
  degree: 'B.Tech',
  branch: 'CSE',
  graduation_year: 2026,
  cgpa: 0,
  percentage: 0,
  active_backlogs: 0,
  history_backlogs: 0,
  skills: [],
};

export function useStudentProfile() {
  const [profile, setProfile] = useState<StudentProfile>(EMPTY_PROFILE);
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
