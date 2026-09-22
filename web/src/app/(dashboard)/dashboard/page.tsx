'use client';

import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Link from 'next/link';
import {
  Send,
  Sparkles,
  CheckCircle2,
  Clock,
  ArrowRight,
  KanbanSquare,
  GraduationCap,
  PlusCircle,
  Search,
  X,
  RotateCcw,
  RefreshCw,
  Loader2,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { InsightCard } from '@/components/insights/InsightCard';
import { SourceMessageDrawer } from '@/components/insights/SourceMessageDrawer';
import { ConvertToDeadlineModal } from '@/components/insights/ConvertToDeadlineModal';
import { PlacementInsight } from '@/types/insight.types';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';
import { useApplications } from '@/lib/hooks/useApplications';
import { useToast } from '@/components/ui/Toast';

const PAGE_SIZE = 10;

export default function DashboardPage() {
  const { profile } = useStudentProfile();
  const { applications, addApplication } = useApplications();
  const { success } = useToast();

  const [insights, setInsights] = useState<PlacementInsight[]>([]);
  const [monitoredCount, setMonitoredCount] = useState(0);
  const [urgentDeadlinesCount, setUrgentDeadlinesCount] = useState(0);
  const [urgentDeadline, setUrgentDeadline] = useState<any | null>(null);
  const [isSyncing, setIsSyncing] = useState(false);

  // Filter States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<string>('ALL');
  const [selectedChannel, setSelectedChannel] = useState<string>('ALL');
  const [selectedBatch, setSelectedBatch] = useState<string>('ALL');
  const [onlyEligible, setOnlyEligible] = useState(false);

  // Pagination / Infinite Scroll State
  const [visibleCount, setVisibleCount] = useState<number>(PAGE_SIZE);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const observerTarget = useRef<HTMLDivElement | null>(null);

  // Modals & Drawers
  const [selectedRawInsight, setSelectedRawInsight] = useState<PlacementInsight | null>(null);
  const [selectedDeadlineInsight, setSelectedDeadlineInsight] = useState<PlacementInsight | null>(null);

  const fetchInsights = useCallback(() => {
    fetch('/api/insights')
      .then((res) => (res.ok ? res.json() : { insights: [] }))
      .then((data) => setInsights(data.insights || []))
      .catch(() => setInsights([]));
  }, []);

  const fetchDeadlines = useCallback(() => {
    fetch('/api/deadlines')
      .then((res) => (res.ok ? res.json() : { deadlines: [] }))
      .then((data) => {
        const deadlines = data.deadlines || [];
        const now = Date.now();
        const urgent = deadlines.filter((d: any) => {
          const diff = new Date(d.deadline_at).getTime() - now;
          return diff > 0 && diff <= 24 * 3600 * 1000 && d.status !== 'COMPLETED';
        });
        setUrgentDeadlinesCount(urgent.length);
        if (urgent.length > 0) {
          setUrgentDeadline(urgent[0]);
        } else {
          setUrgentDeadline(null);
        }
      })
      .catch(() => setUrgentDeadlinesCount(0));
  }, []);

  const fetchGroups = useCallback(() => {
    fetch('/api/telegram/groups')
      .then((res) => (res.ok ? res.json() : { groups: [] }))
      .then((data) => {
        const groups = data.groups || [];
        setMonitoredCount(groups.length);
      })
      .catch(() => setMonitoredCount(0));
  }, []);

  useEffect(() => {
    fetchInsights();
    fetchGroups();
    fetchDeadlines();
  }, [fetchInsights, fetchGroups, fetchDeadlines]);

  const handleSyncRecent = async () => {
    setIsSyncing(true);
    try {
      const res = await fetch('/api/telegram/sync', { method: 'POST' });
      const data = await res.json();
      fetchInsights();
      fetchDeadlines();
      fetchGroups();
      success(
        'Channels & Notices Synced',
        `Fetched ${data.messages_fetched || 0} messages and extracted ${data.insights_extracted || 0} notices across your channels.`
      );
    } catch {
      fetchInsights();
      fetchDeadlines();
      fetchGroups();
      success('Sync Complete', 'Feed updated with the latest notices');
    } finally {
      setIsSyncing(false);
    }
  };

  // Extract unique channel names for custom channel dropdown
  const uniqueChannels = useMemo(() => {
    const set = new Set<string>();
    insights.forEach((i) => {
      if (i.group_name) set.add(i.group_name);
    });
    return Array.from(set).sort();
  }, [insights]);

  // Channel dropdown options
  const channelOptions = useMemo(() => {
    const opts = [
      {
        value: 'ALL',
        label: `All Channels (${uniqueChannels.length || monitoredCount})`,
        count: insights.length,
        icon: <Send size={13} />,
      },
    ];
    uniqueChannels.forEach((ch) => {
      opts.push({
        value: ch,
        label: ch,
        count: insights.filter((i) => i.group_name === ch).length,
        icon: <Send size={13} />,
      });
    });
    return opts;
  }, [insights, uniqueChannels, monitoredCount]);

  // Batch dropdown options
  const batchOptions = useMemo(() => {
    return [
      { value: 'ALL', label: 'All Batches', icon: <GraduationCap size={13} /> },
      {
        value: '2026',
        label: '2026 Batch',
        count: insights.filter((i) => i.batch_year?.includes('2026')).length,
        icon: <GraduationCap size={13} />,
      },
      {
        value: '2025',
        label: '2025 Batch',
        count: insights.filter((i) => i.batch_year?.includes('2025')).length,
        icon: <GraduationCap size={13} />,
      },
      {
        value: '2024',
        label: '2024 Batch',
        count: insights.filter((i) => i.batch_year?.includes('2024')).length,
        icon: <GraduationCap size={13} />,
      },
      {
        value: '2027',
        label: '2027 Batch',
        count: insights.filter((i) => i.batch_year?.includes('2027')).length,
        icon: <GraduationCap size={13} />,
      },
    ];
  }, [insights]);

  // Filter logic
  const filteredInsights = useMemo(() => {
    return insights.filter((ins) => {
      // 1. Search query (Company, role, branches, eligibility, channel)
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchCompany = ins.company_name?.toLowerCase().includes(q);
        const matchRole = ins.role_title?.toLowerCase().includes(q);
        const matchBranches = ins.allowed_branches?.some((b) => b.toLowerCase().includes(q));
        const matchEligibility = ins.eligibility_raw?.toLowerCase().includes(q);
        const matchChannel = ins.group_name?.toLowerCase().includes(q);
        if (!matchCompany && !matchRole && !matchBranches && !matchEligibility && !matchChannel) {
          return false;
        }
      }

      // 2. Type Filter
      if (selectedType !== 'ALL') {
        if (ins.opportunity_type !== selectedType) return false;
      }

      // 3. Channel Filter
      if (selectedChannel !== 'ALL') {
        if (ins.group_name !== selectedChannel) return false;
      }

      // 4. Batch Year Filter
      if (selectedBatch !== 'ALL') {
        if (ins.batch_year && !ins.batch_year.includes(selectedBatch)) return false;
      }

      // 5. Eligibility criteria (Student CGPA >= cut-off)
      if (onlyEligible) {
        if (ins.min_cgpa && profile.cgpa && profile.cgpa < ins.min_cgpa) {
          return false;
        }
      }

      return true;
    });
  }, [insights, searchQuery, selectedType, selectedChannel, selectedBatch, onlyEligible, profile.cgpa]);

  // Reset pagination whenever filters change
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [searchQuery, selectedType, selectedChannel, selectedBatch, onlyEligible]);

  // Infinite Scroll Observer
  const loadMore = useCallback(() => {
    if (visibleCount >= filteredInsights.length || isLoadingMore) return;
    setIsLoadingMore(true);
    setTimeout(() => {
      setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredInsights.length));
      setIsLoadingMore(false);
    }, 200);
  }, [visibleCount, filteredInsights.length, isLoadingMore]);

  useEffect(() => {
    const currentTarget = observerTarget.current;
    if (!currentTarget) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      { threshold: 0.1, rootMargin: '120px' }
    );

    observer.observe(currentTarget);
    return () => {
      if (currentTarget) observer.unobserve(currentTarget);
    };
  }, [loadMore]);

  const visibleInsights = useMemo(() => {
    return filteredInsights.slice(0, visibleCount);
  }, [filteredInsights, visibleCount]);

  const hasActiveFilters =
    Boolean(searchQuery) ||
    selectedType !== 'ALL' ||
    selectedChannel !== 'ALL' ||
    selectedBatch !== 'ALL' ||
    onlyEligible;

  const handleResetFilters = () => {
    setSearchQuery('');
    setSelectedType('ALL');
    setSelectedChannel('ALL');
    setSelectedBatch('ALL');
    setOnlyEligible(false);
  };

  const handleSaveToKanban = (insight: PlacementInsight) => {
    addApplication({
      company_name: insight.company_name,
      role_title: insight.role_title || 'Software Engineer',
      status: 'SAVED',
      notes: `Saved from Dashboard feed (${insight.group_name || 'Placement Feed'})`,
    });
    success('Saved to Application Tracker', `${insight.company_name} is now on your Kanban board`);
  };

  const studentName = profile.full_name ? profile.full_name.split(' ')[0] : 'Student';

  return (
    <div className="page-container">
      {/* Welcome Banner */}
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
          <h1 style={{ fontSize: '26px', fontWeight: 800, letterSpacing: '-0.5px' }}>
            Welcome back, {studentName}!
          </h1>
          <p style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Placement Intelligence Active • {profile.branch || 'CSE'} Batch of {profile.graduation_year || 2026} • CGPA: {profile.cgpa || 8.0}
          </p>
        </div>

        <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
          <Button
            variant="secondary"
            size="md"
            isLoading={isSyncing}
            onClick={handleSyncRecent}
            leftIcon={<RefreshCw size={16} />}
          >
            Sync Recent Posts
          </Button>
          <Link href="/applications">
            <Button variant="secondary" size="md" leftIcon={<KanbanSquare size={16} />}>
              Kanban Board ({applications.length})
            </Button>
          </Link>
          <Link href="/companies">
            <Button variant="primary" size="md" leftIcon={<GraduationCap size={16} />}>
              Company Directory
            </Button>
          </Link>
        </div>
      </div>

      {/* 4 Metric Cards */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '32px',
        }}
      >
        <Link href="/telegram" style={{ textDecoration: 'none' }}>
          <Card hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Monitored Groups</span>
              <Send size={18} color="var(--primary-light)" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px' }}>
              {monitoredCount} {monitoredCount === 1 ? 'Channel' : 'Channels'}
            </div>
            <div style={{ fontSize: '12px', color: monitoredCount > 0 ? 'var(--status-eligible)' : 'var(--text-muted)', marginTop: '4px' }}>
              {monitoredCount > 0 ? '● Ingesting in real-time' : '+ Click to add channel'}
            </div>
          </Card>
        </Link>

        <Link href="/applications" style={{ textDecoration: 'none' }}>
          <Card hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tracked Applications</span>
              <KanbanSquare size={18} color="#a855f7" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-light)' }}>
              {applications.length} {applications.length === 1 ? 'Drive' : 'Drives'}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              Active on Kanban Board
            </div>
          </Card>
        </Link>

        <Link href="/deadlines" style={{ textDecoration: 'none' }}>
          <Card hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Urgent Deadlines</span>
              <Clock size={18} color={urgentDeadlinesCount > 0 ? 'var(--status-urgent)' : 'var(--text-muted)'} />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: urgentDeadlinesCount > 0 ? 'var(--status-urgent)' : 'var(--text-primary)' }}>
              {urgentDeadlinesCount} Expiring
            </div>
            <div style={{ fontSize: '12px', color: urgentDeadlinesCount > 0 ? 'var(--status-urgent)' : 'var(--text-muted)', marginTop: '4px' }}>
              {urgentDeadlinesCount > 0 ? 'Expiring in < 24 hrs' : 'All caught up'}
            </div>
          </Card>
        </Link>

        <Link href="/profile" style={{ textDecoration: 'none' }}>
          <Card hoverable={true}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Placement Profile</span>
              <CheckCircle2 size={18} color="var(--status-eligible)" />
            </div>
            <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--status-eligible)' }}>
              {profile.cgpa || 8.0} CGPA
            </div>
            <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
              {profile.branch || 'CSE'} • {profile.graduation_year || 2026} Batch
            </div>
          </Card>
        </Link>
      </div>

      {/* Urgent Alert Banner */}
      {urgentDeadline && (
        <div
          className="glass-card"
          style={{
            padding: '18px 24px',
            marginBottom: '32px',
            backgroundColor: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            flexWrap: 'wrap',
            gap: '16px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
            <div
              className="pulse-urgent"
              style={{
                width: '38px',
                height: '38px',
                borderRadius: '50%',
                backgroundColor: 'var(--status-urgent-bg)',
                border: '1px solid var(--status-urgent-border)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Clock size={20} color="var(--status-urgent)" />
            </div>
            <div>
              <div style={{ fontSize: '14.5px', fontWeight: 700, color: 'var(--text-primary)' }}>
                {urgentDeadline.title || `${urgentDeadline.company_name} Application Closing Soon`}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
                Deadline: {new Date(urgentDeadline.deadline_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • Automated reminders active
              </div>
            </div>
          </div>

          {urgentDeadline.action_url && (
            <a href={urgentDeadline.action_url} target="_blank" rel="noopener noreferrer">
              <Button variant="danger" size="sm" rightIcon={<ArrowRight size={14} />}>
                Open Registration Form
              </Button>
            </a>
          )}
        </div>
      )}

      {/* Live Extracted Placement Feed */}
      <div style={{ marginTop: '8px' }}>
        {/* Section Header */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '16px',
            flexWrap: 'wrap',
            gap: '12px',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles size={18} color="var(--primary-light)" />
            <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
              Live Extracted Placement Opportunities
            </h2>
            <Badge variant="primary">
              {filteredInsights.length} Available
            </Badge>
          </div>

          <Link
            href="/insights"
            style={{
              fontSize: '13px',
              color: 'var(--primary-light)',
              fontWeight: 600,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            All Notices Hub →
          </Link>
        </div>

        {/* Dashboard Filter Toolbar */}
        <div
          className="glass-card"
          style={{
            padding: '16px 20px',
            marginBottom: '24px',
            display: 'flex',
            flexDirection: 'column',
            gap: '14px',
            overflow: 'visible',
            position: 'relative',
            zIndex: 40,
          }}
        >
          {/* Row 1: Search & Custom Dropdowns & Eligible Toggle */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              flexWrap: 'wrap',
            }}
          >
            {/* Search Input */}
            <div
              style={{
                position: 'relative',
                flex: '1 1 240px',
                minWidth: '220px',
              }}
            >
              <Search
                size={16}
                style={{
                  position: 'absolute',
                  left: '12px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  color: 'var(--text-muted)',
                }}
              />
              <input
                type="text"
                placeholder="Search company, role, branch, skill..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 34px 9px 36px',
                  borderRadius: '8px',
                  backgroundColor: 'rgba(255, 255, 255, 0.04)',
                  border: '1px solid var(--border-medium)',
                  color: 'var(--text-primary)',
                  fontSize: '13px',
                  outline: 'none',
                }}
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  style={{
                    position: 'absolute',
                    right: '10px',
                    top: '50%',
                    transform: 'translateY(-50%)',
                    background: 'none',
                    border: 'none',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    display: 'flex',
                  }}
                >
                  <X size={14} />
                </button>
              )}
            </div>

            {/* Custom Channel Dropdown */}
            <CustomSelect
              options={channelOptions}
              value={selectedChannel}
              onChange={(val) => setSelectedChannel(val)}
              placeholder="Select Channel"
              icon={<Send size={13} />}
              minWidth={200}
            />

            {/* Custom Batch Dropdown */}
            <CustomSelect
              options={batchOptions}
              value={selectedBatch}
              onChange={(val) => setSelectedBatch(val)}
              placeholder="Select Batch"
              icon={<GraduationCap size={13} />}
              minWidth={150}
            />

            {/* Eligible for me Toggle */}
            <button
              onClick={() => setOnlyEligible(!onlyEligible)}
              style={{
                padding: '8px 14px',
                borderRadius: '8px',
                fontSize: '13px',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                backgroundColor: onlyEligible ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.04)',
                border: `1px solid ${onlyEligible ? 'rgba(16, 185, 129, 0.4)' : 'var(--border-medium)'}`,
                color: onlyEligible ? 'var(--status-eligible)' : 'var(--text-secondary)',
              }}
            >
              <CheckCircle2 size={15} />
              Eligible for Me ({profile.cgpa || 8.0} CGPA)
            </button>

            {/* Reset Button */}
            {hasActiveFilters && (
              <button
                onClick={handleResetFilters}
                style={{
                  padding: '8px 12px',
                  borderRadius: '8px',
                  fontSize: '12.5px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  background: 'none',
                  border: '1px solid var(--border-subtle)',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  marginLeft: 'auto',
                }}
              >
                <RotateCcw size={13} />
                Reset
              </button>
            )}
          </div>

          {/* Row 2: Type Category Pills */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              overflowX: 'auto',
              paddingTop: '2px',
            }}
          >
            {[
              { id: 'ALL', label: 'All Types', count: insights.length },
              { id: 'JOB', label: 'Full-Time Jobs', count: insights.filter((i) => i.opportunity_type === 'JOB').length },
              { id: 'INTERNSHIP', label: 'Internships', count: insights.filter((i) => i.opportunity_type === 'INTERNSHIP').length },
              { id: 'HACKATHON', label: 'Hackathons / Contests', count: insights.filter((i) => i.opportunity_type === 'HACKATHON').length },
            ].map((t) => {
              const active = selectedType === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setSelectedType(t.id)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: '20px',
                    fontSize: '12px',
                    fontWeight: 600,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    transition: 'all 0.15s ease',
                    backgroundColor: active ? 'var(--primary)' : 'rgba(255, 255, 255, 0.04)',
                    color: active ? '#ffffff' : 'var(--text-secondary)',
                    border: `1px solid ${active ? 'var(--primary)' : 'var(--border-subtle)'}`,
                  }}
                >
                  <span>{t.label}</span>
                  <span
                    style={{
                      fontSize: '11px',
                      padding: '1px 6px',
                      borderRadius: '10px',
                      backgroundColor: active ? 'rgba(255, 255, 255, 0.25)' : 'rgba(255, 255, 255, 0.08)',
                      color: active ? '#ffffff' : 'var(--text-muted)',
                    }}
                  >
                    {t.count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Opportunities Grid / Empty State */}
        {filteredInsights.length === 0 ? (
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
              <Search size={26} color="var(--primary-light)" />
            </div>

            <div>
              <h3 style={{ fontSize: '18px', fontWeight: 700, marginBottom: '6px' }}>
                No Matching Opportunities Found
              </h3>
              <p style={{ fontSize: '13.5px', color: 'var(--text-muted)', maxWidth: '440px', margin: '0 auto' }}>
                {hasActiveFilters
                  ? 'Try clearing some of your search queries or filters to view all notices.'
                  : 'Connect your college Telegram channels to start ingesting placement drives in real-time.'}
              </p>
            </div>

            {hasActiveFilters ? (
              <Button variant="secondary" size="md" onClick={handleResetFilters} leftIcon={<RotateCcw size={15} />}>
                Clear All Filters
              </Button>
            ) : (
              <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap', justifyContent: 'center' }}>
                <Link href="/telegram">
                  <Button variant="secondary" size="md" leftIcon={<Send size={16} />}>
                    Connect Telegram Channel
                  </Button>
                </Link>
                <Link href="/insights">
                  <Button variant="primary" size="md" leftIcon={<PlusCircle size={16} />}>
                    Ingest First Notice with AI
                  </Button>
                </Link>
              </div>
            )}
          </div>
        ) : (
          <>
            {/* Render 10 at a time for optimal performance */}
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))',
                gap: '20px',
              }}
            >
              {visibleInsights.map((insight) => (
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

            {/* Bottom Progressive Loading & Sentinel */}
            <div
              ref={observerTarget}
              style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                padding: '32px 16px 16px',
                gap: '12px',
              }}
            >
              {visibleCount < filteredInsights.length ? (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}>
                  {isLoadingMore ? (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--primary-light)', fontSize: '13px' }}>
                      <Loader2 size={18} className="spin" />
                      <span>Loading next 10 opportunities...</span>
                    </div>
                  ) : (
                    <Button
                      variant="secondary"
                      size="md"
                      onClick={loadMore}
                      leftIcon={<Sparkles size={15} />}
                    >
                      Load More (Showing {visibleCount} of {filteredInsights.length})
                    </Button>
                  )}
                  <span style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>
                    Scroll down to load automatically
                  </span>
                </div>
              ) : (
                <div
                  style={{
                    padding: '12px 24px',
                    borderRadius: '20px',
                    backgroundColor: 'rgba(255, 255, 255, 0.03)',
                    border: '1px solid var(--border-subtle)',
                    fontSize: '12.5px',
                    color: 'var(--text-muted)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                  }}
                >
                  <CheckCircle2 size={14} color="var(--status-eligible)" />
                  <span>You have viewed all {filteredInsights.length} placement notices</span>
                </div>
              )}
            </div>
          </>
        )}
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
        onSuccess={() => {
          fetchDeadlines();
        }}
      />
    </div>
  );
}
