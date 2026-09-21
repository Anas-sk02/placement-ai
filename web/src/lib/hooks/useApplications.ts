'use client';

import { useState, useEffect, useCallback } from 'react';
import confetti from 'canvas-confetti';
import { ApplicationStatusEnum } from '@/types/database.types';

export interface ApplicationItem {
  id: string;
  user_id?: string;
  company_name: string;
  role_title: string;
  status: ApplicationStatusEnum;
  applied_at?: string | null;
  assessment_date?: string | null;
  interview_date?: string | null;
  notes?: string | null;
  opportunity_id?: string | null;
  insight_id?: string | null;
  created_at?: string;
}

const DEFAULT_APPS: ApplicationItem[] = [
  { id: 'app-01', company_name: 'Goldman Sachs', role_title: 'Summer Analyst', status: 'APPLIED', notes: 'Applied via official Google Form link' },
  { id: 'app-02', company_name: 'Amazon India', role_title: 'Software Development Engineer (SDE-1)', status: 'SAVED', notes: 'Need to update resume' },
  { id: 'app-03', company_name: 'Uber', role_title: 'SWE Intern (Summer 2026)', status: 'ASSESSMENT', notes: 'HackerRank test on Sunday 10 AM' },
  { id: 'app-04', company_name: 'Microsoft', role_title: 'University Graduate 2026', status: 'INTERVIEW', notes: 'Technical Round 1 scheduled' },
  { id: 'app-05', company_name: 'Atlassian', role_title: 'Associate Software Engineer', status: 'SELECTED', notes: 'Offer letter received! ₹35 LPA CTC' },
];

export function useApplications() {
  const [applications, setApplications] = useState<ApplicationItem[]>(DEFAULT_APPS);
  const [loading, setLoading] = useState(true);

  const fetchApplications = useCallback(async () => {
    try {
      const res = await fetch('/api/applications');
      if (res.ok) {
        const data = await res.json();
        if (data.applications && data.applications.length > 0) {
          setApplications(data.applications);
        }
      }
    } catch {
      // Keep defaults
    } finally {
      setLoading(false);
    }
  }, []);

  const addApplication = async (app: { company_name: string; role_title: string; status?: ApplicationStatusEnum; notes?: string }) => {
    const tempId = `app-${Math.random().toString(36).substring(2, 9)}`;
    const newApp: ApplicationItem = {
      id: tempId,
      company_name: app.company_name,
      role_title: app.role_title,
      status: app.status || 'SAVED',
      notes: app.notes,
    };

    setApplications((prev) => [newApp, ...prev]);

    try {
      await fetch('/api/applications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newApp),
      });
    } catch {
      // Ignore in mock/offline
    }
  };

  const updateApplicationStatus = async (id: string, status: ApplicationStatusEnum) => {
    // If selected, celebrate with confetti!
    if (status === 'SELECTED') {
      try {
        confetti({
          particleCount: 120,
          spread: 80,
          origin: { y: 0.6 },
          colors: ['#6366f1', '#10b981', '#f59e0b', '#ec4899'],
        });
      } catch {
        // Confetti fallback
      }
    }

    setApplications((prev) =>
      prev.map((a) => (a.id === id ? { ...a, status } : a))
    );

    try {
      await fetch(`/api/applications/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
    } catch {
      // Optimistic state remains
    }
  };

  const deleteApplication = async (id: string) => {
    setApplications((prev) => prev.filter((a) => a.id !== id));
    try {
      await fetch(`/api/applications/${id}`, { method: 'DELETE' });
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    fetchApplications();
  }, [fetchApplications]);

  return {
    applications,
    loading,
    addApplication,
    updateApplicationStatus,
    deleteApplication,
    refresh: fetchApplications,
  };
}
