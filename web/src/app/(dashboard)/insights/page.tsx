'use client';

import React, { useState, useEffect } from 'react';
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

export default function InsightsPage() {
  const { profile } = useStudentProfile();
  const { addApplication } = useApplications();
  const { success } = useToast();

  const [insights, setInsights] = useState<PlacementInsight[]>([]);
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [enableClustering, setEnableClustering] = useState(false);
  const [selectedRawInsight, setSelectedRawInsight] = useState<PlacementInsight | null>(null);
  const [selectedDeadlineInsight, setSelectedDeadlineInsight] = useState<PlacementInsight | null>(null);

  useEffect(() => {
    fetch('/api/insights')
      .then((res) => (res.ok ? res.json() : { insights: [] }))
      .then((data) => setInsights(data.insights || []))
      .catch(() => setInsights([]));
  }, []);

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
      {filtered.length === 0 ? (
        <div
          className="glass-card"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '16px',
          }}
        >
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              backgroundColor: 'rgba(99, 102, 241, 0.1)',
              border: '1px solid rgba(99, 102, 241, 0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Sparkles size={28} color="var(--primary-light)" />
          </div>

          <div>
            <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
              No Placement Notices Ingested Yet
            </h3>
            <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '460px', margin: '0 auto' }}>
              Paste a recruitment notice or connect your Telegram channels to extract eligibility, CTC, and deadlines.
            </p>
          </div>

          <Button
            variant="primary"
            size="md"
            onClick={() => setIsIngestModalOpen(true)}
            leftIcon={<Plus size={16} />}
          >
            Ingest First Notice with AI
          </Button>
        </div>
      ) : (
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
      )}

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
