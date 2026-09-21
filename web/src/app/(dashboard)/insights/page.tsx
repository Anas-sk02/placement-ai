'use client';

import React, { useState } from 'react';
import {
  Sparkles,
  Filter,
  Search,
  SlidersHorizontal,
  Building2,
  Briefcase,
  Layers,
  CheckCircle2,
  Plus,
  Send,
  Zap,
} from 'lucide-react';
import { InsightCard } from '@/components/insights/InsightCard';
import { SourceMessageDrawer } from '@/components/insights/SourceMessageDrawer';
import { ConvertToDeadlineModal } from '@/components/insights/ConvertToDeadlineModal';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { PlacementInsight } from '@/types/insight.types';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';
import { useApplications } from '@/lib/hooks/useApplications';
import { clusterPlacementInsights } from '@/lib/business/clustering';
import { parsePlacementMessageFallback } from '@/lib/ai/fallback-rules';
import { useToast } from '@/components/ui/Toast';

const ALL_INSIGHTS: PlacementInsight[] = [
  {
    id: 'ins-01',
    company_name: 'Goldman Sachs',
    role_title: 'Summer Analyst & Full-Time Engineer',
    opportunity_type: 'JOB',
    batch_year: '2026',
    salary_or_stipend: '₹24 - 30 LPA (Intern: ₹1.5L/mo)',
    min_cgpa: 7.5,
    allowed_branches: ['CSE', 'IT', 'ECE', 'EEE'],
    registration_deadline: new Date(Date.now() + 3.5 * 3600 * 1000).toISOString(),
    application_url: 'https://forms.gle/gsachs2026campusdrive',
    action_required: 'Fill Google Form before 6 PM Sharp',
    urgency: 'CRITICAL',
    confidence_score: 0.98,
    extraction_provider: 'GEMINI',
    group_name: 'TPO Official Placements 2026',
  },
  {
    id: 'ins-02',
    company_name: 'Amazon India',
    role_title: 'Software Development Engineer (SDE-1)',
    opportunity_type: 'JOB',
    batch_year: '2026',
    salary_or_stipend: '₹44.5 LPA (Base: ₹18.5L)',
    min_cgpa: 7.0,
    allowed_branches: ['CSE', 'IT', 'ECE'],
    registration_deadline: new Date(Date.now() + 28 * 3600 * 1000).toISOString(),
    application_url: 'https://amazon.jobs/university-recruitment',
    action_required: 'Submit University Profile on Amazon Portal',
    urgency: 'HIGH',
    confidence_score: 0.96,
    extraction_provider: 'GEMINI',
    group_name: 'CSE & IT Placement Cell (Verified)',
  },
  {
    id: 'ins-03',
    company_name: 'Uber India',
    role_title: 'Software Engineering Intern (Summer 2026)',
    opportunity_type: 'INTERNSHIP',
    batch_year: '2026',
    salary_or_stipend: '₹1,60,000 / month',
    min_cgpa: 8.0,
    allowed_branches: ['CSE', 'IT'],
    registration_deadline: new Date(Date.now() + 52 * 3600 * 1000).toISOString(),
    application_url: 'https://uber.com/careers/internships',
    action_required: 'Register on HackerRank link sent to college email',
    urgency: 'MEDIUM',
    confidence_score: 0.94,
    extraction_provider: 'RULE_FALLBACK',
    group_name: 'Off-Campus Tech Internships & Drives 2026',
  },
  {
    id: 'ins-04',
    company_name: 'Microsoft',
    role_title: 'Software Engineer - University Graduate',
    opportunity_type: 'JOB',
    batch_year: '2026',
    salary_or_stipend: '₹51 LPA CTC',
    min_cgpa: 8.0,
    allowed_branches: ['CSE', 'IT', 'ECE'],
    registration_deadline: new Date(Date.now() + 90 * 3600 * 1000).toISOString(),
    application_url: 'https://careers.microsoft.com',
    urgency: 'MEDIUM',
    confidence_score: 0.99,
    extraction_provider: 'GEMINI',
    group_name: 'TPO Official Placements 2026',
  },
  {
    id: 'ins-05',
    company_name: 'Atlassian',
    role_title: 'Associate Software Engineer',
    opportunity_type: 'JOB',
    batch_year: '2026',
    salary_or_stipend: '₹35 LPA CTC',
    min_cgpa: 7.5,
    allowed_branches: ['ALL'],
    registration_deadline: new Date(Date.now() + 120 * 3600 * 1000).toISOString(),
    application_url: 'https://atlassian.com/careers',
    urgency: 'LOW',
    confidence_score: 0.95,
    extraction_provider: 'GEMINI',
    group_name: 'Off-Campus Tech Internships & Drives 2026',
  },
  {
    id: 'ins-06',
    company_name: 'Flipkart Grid 6.0',
    role_title: 'National Robotics & Software Challenge',
    opportunity_type: 'HACKATHON',
    batch_year: '2025 & 2026',
    salary_or_stipend: 'PPI + ₹5,00,000 Prize Pool',
    min_cgpa: 0,
    allowed_branches: ['ALL'],
    registration_deadline: new Date(Date.now() + 200 * 3600 * 1000).toISOString(),
    application_url: 'https://unstop.com/competitions/flipkart-grid-60',
    urgency: 'LOW',
    confidence_score: 0.93,
    extraction_provider: 'RULE_FALLBACK',
    group_name: 'CSE & IT Placement Cell (Verified)',
  },
];

export default function InsightsPage() {
  const { profile } = useStudentProfile();
  const { addApplication } = useApplications();
  const { success } = useToast();

  const [insights, setInsights] = useState<PlacementInsight[]>(ALL_INSIGHTS);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [enableClustering, setEnableClustering] = useState(false);
  const [selectedRawInsight, setSelectedRawInsight] = useState<PlacementInsight | null>(null);
  const [selectedDeadlineInsight, setSelectedDeadlineInsight] = useState<PlacementInsight | null>(null);

  // Notice Ingestion State
  const [isIngestModalOpen, setIsIngestModalOpen] = useState(false);
  const [rawNoticeInput, setRawNoticeInput] = useState('');
  const [rawChannelInput, setRawChannelInput] = useState('College Official Placement Desk');
  const [isAnalyzingNotice, setIsAnalyzingNotice] = useState(false);

  const handleAnalyzeNotice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rawNoticeInput.trim()) return;

    setIsAnalyzingNotice(true);
    try {
      const res = await fetch('/api/insights/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          raw_text: rawNoticeInput,
          group_name: rawChannelInput || 'Custom Ingested Notice',
        }),
      });

      let extracted: PlacementInsight;
      if (res.ok) {
        const data = await res.json();
        extracted = data.insight;
      } else {
        const fallback = parsePlacementMessageFallback(rawNoticeInput);
        extracted = {
          id: `ins-custom-${Date.now()}`,
          company_name: fallback.company_name,
          role_title: fallback.role_title,
          opportunity_type: fallback.opportunity_type,
          batch_year: fallback.batch_year || `${profile.graduation_year}`,
          salary_or_stipend: fallback.salary_or_stipend,
          min_cgpa: fallback.min_cgpa ?? 7.0,
          allowed_branches: fallback.allowed_branches || ['ALL'],
          registration_deadline: fallback.registration_deadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
          application_url: fallback.application_url,
          action_required: fallback.action_required,
          urgency: fallback.urgency,
          confidence_score: 0.95,
          extraction_provider: 'RULE_FALLBACK',
          group_name: rawChannelInput || 'Direct Ingestion Desk',
          raw_message_text: rawNoticeInput,
        };
      }

      setInsights((prev) => [extracted, ...prev]);
      success('Notice Ingested & Analyzed', `Identified drive for ${extracted.company_name}`);
      setRawNoticeInput('');
      setIsIngestModalOpen(false);
    } catch {
      const fallback = parsePlacementMessageFallback(rawNoticeInput);
      const extracted: PlacementInsight = {
        id: `ins-custom-${Date.now()}`,
        company_name: fallback.company_name,
        role_title: fallback.role_title,
        opportunity_type: fallback.opportunity_type,
        batch_year: fallback.batch_year || `${profile.graduation_year}`,
        salary_or_stipend: fallback.salary_or_stipend,
        min_cgpa: fallback.min_cgpa ?? 7.0,
        allowed_branches: fallback.allowed_branches || ['ALL'],
        registration_deadline: fallback.registration_deadline || new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
        application_url: fallback.application_url,
        action_required: fallback.action_required,
        urgency: fallback.urgency,
        confidence_score: 0.9,
        extraction_provider: 'RULE_FALLBACK',
        group_name: rawChannelInput || 'Direct Ingestion Desk',
        raw_message_text: rawNoticeInput,
      };
      setInsights((prev) => [extracted, ...prev]);
      success('Notice Parsed Locally', `Extracted ${extracted.company_name} notice`);
      setRawNoticeInput('');
      setIsIngestModalOpen(false);
    } finally {
      setIsAnalyzingNotice(false);
    }
  };

  const displayList = enableClustering ? clusterPlacementInsights(insights) : insights;

  const filtered = displayList.filter((item) => {
    const matchesType = selectedType === 'ALL' || item.opportunity_type === selectedType;
    const matchesSearch =
      item.company_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (item.role_title && item.role_title.toLowerCase().includes(searchQuery.toLowerCase())) ||
      (item.salary_or_stipend && item.salary_or_stipend.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const handleSaveToKanban = (insight: PlacementInsight) => {
    addApplication({
      company_name: insight.company_name,
      role_title: insight.role_title || 'Software Engineer',
      status: 'SAVED',
      notes: `Extracted from Telegram (${insight.group_name || 'TPO Desk'})`,
    });
    success('Saved to Application Tracker', `${insight.company_name} is now on your Kanban board`);
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
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Placement Opportunities Directory</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Structured recruitment notices with real-time eligibility evaluation for {profile.full_name} ({profile.branch}, {profile.cgpa} CGPA)
          </p>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          {/* Deduplication / Clustering Toggle */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-secondary)', fontWeight: 500 }}>
              Unified Clustering:
            </span>
            <label className="switch">
              <input
                type="checkbox"
                checked={enableClustering}
                onChange={(e) => setEnableClustering(e.target.checked)}
              />
              <span className="slider" />
            </label>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsIngestModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Ingest & Analyze Notice
          </Button>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '24px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        {/* Category Pills */}
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {['ALL', 'JOB', 'INTERNSHIP', 'HACKATHON', 'CAMPUS_DRIVE'].map((type) => (
            <button
              key={type}
              onClick={() => setSelectedType(type)}
              style={{
                padding: '8px 16px',
                borderRadius: '999px',
                fontSize: '12.5px',
                fontWeight: 600,
                border: `1px solid ${selectedType === type ? 'var(--primary)' : 'var(--border-subtle)'}`,
                backgroundColor: selectedType === type ? 'rgba(99, 102, 241, 0.2)' : 'rgba(255, 255, 255, 0.03)',
                color: selectedType === type ? '#ffffff' : 'var(--text-secondary)',
                transition: 'all var(--transition-fast)',
              }}
            >
              {type === 'ALL' ? 'All Opportunities' : type}
            </button>
          ))}
        </div>

        {/* Search */}
        <div style={{ position: 'relative', width: '300px' }}>
          <Search size={15} color="var(--text-muted)" style={{ position: 'absolute', left: 14, top: 12 }} />
          <input
            type="text"
            placeholder="Search company or role..."
            className="input-field"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ paddingLeft: '38px', borderRadius: '999px', paddingTop: '8px', paddingBottom: '8px' }}
          />
        </div>
      </div>

      {/* Grid of Insight Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '20px',
        }}
      >
        {filtered.map((insight) => (
          <InsightCard
            key={insight.id}
            insight={insight}
            studentProfile={profile}
            onViewRaw={(ins) => setSelectedRawInsight(ins)}
            onTrackDeadline={(ins) => setSelectedDeadlineInsight(ins)}
            onSaveToKanban={handleSaveToKanban}
          />
        ))}
      </div>

      {/* Raw Drawer */}
      <SourceMessageDrawer
        isOpen={Boolean(selectedRawInsight)}
        onClose={() => setSelectedRawInsight(null)}
        insight={selectedRawInsight}
      />

      {/* Deadline Modal */}
      <ConvertToDeadlineModal
        isOpen={Boolean(selectedDeadlineInsight)}
        onClose={() => setSelectedDeadlineInsight(null)}
        insight={selectedDeadlineInsight}
      />

      {/* Ingest & Analyze Notice Modal */}
      <Modal
        isOpen={isIngestModalOpen}
        onClose={() => setIsIngestModalOpen(false)}
        title="Ingest & Analyze College Notice with AI"
      >
        <form onSubmit={handleAnalyzeNotice} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
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
            <Zap size={18} color="var(--primary-light)" style={{ flexShrink: 0 }} />
            <span>
              Paste any raw placement notice. Gemini Flash will extract the company, batch, eligibility criteria, and deadlines.
            </span>
          </div>

          <div className="form-group">
            <label className="form-label">Source Channel / Placement Desk Name</label>
            <input
              type="text"
              placeholder="e.g. Ramdeobaba University TPO Desk"
              className="input-field"
              value={rawChannelInput}
              onChange={(e) => setRawChannelInput(e.target.value)}
            />
          </div>

          <div className="form-group">
            <label className="form-label">Raw Placement Notice Text</label>
            <textarea
              required
              rows={6}
              placeholder={`📢 Urgent Recruitment Notice — Microsoft 2028 Batch
Role: Software Engineering Intern
Eligible: B.Tech CSE, IT with CGPA >= 7.5
Stipend: ₹1.25L/month
Deadline: 28th September 2026, 6:00 PM
Apply: https://careers.microsoft.com/students`}
              className="input-field"
              value={rawNoticeInput}
              onChange={(e) => setRawNoticeInput(e.target.value)}
              style={{ fontFamily: 'inherit', resize: 'vertical' }}
            />
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '6px' }}>
            <Button variant="ghost" size="md" type="button" onClick={() => setIsIngestModalOpen(false)}>
              Cancel
            </Button>
            <Button
              variant="primary"
              size="md"
              type="submit"
              isLoading={isAnalyzingNotice}
              leftIcon={<Sparkles size={16} />}
            >
              Extract & Add to Feed
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
