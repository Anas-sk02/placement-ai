'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Award,
  Target,
  Clock,
  BookOpen,
  ChevronRight,
  ExternalLink,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { useStudentProfile } from '@/lib/hooks/useStudentProfile';
import { useApplications } from '@/lib/hooks/useApplications';

interface PrepGuide {
  company: string;
  role: string;
  ctc: string;
  rounds: string[];
  focusTopics: string[];
  recommendedPractice: string[];
}

const PREP_GUIDES: PrepGuide[] = [
  {
    company: 'Goldman Sachs',
    role: 'Summer Analyst / Engineering Associate',
    ctc: '₹24 - 30 LPA',
    rounds: [
      'Round 1: HackerRank Online Assessment (2 Coding + Math/Probability MCQs)',
      'Round 2: Technical Interview (DSA + Data Structures & Time Complexities)',
      'Round 3: System Architecture & OOP Design',
      'Round 4: Behavioral & Culture Fit',
    ],
    focusTopics: [
      'Dynamic Programming (Substrings, Knapsack, Grid DP)',
      'Trees & Binary Search Trees (Lowest Common Ancestor, Traversals)',
      'Math, Combinatorics & Puzzles',
      'Operating Systems Concurrency & Threads',
    ],
    recommendedPractice: [
      'LeetCode: Trapping Rain Water, Median of Two Sorted Arrays',
      'GeeksforGeeks: Goldman Sachs Interview Archive',
      'OOP Design: Parking Lot, Elevator System',
    ],
  },
  {
    company: 'Amazon India',
    role: 'Software Development Engineer (SDE-1)',
    ctc: '₹44.5 LPA',
    rounds: [
      'Round 1: Online Assessment (2 Coding questions + Amazon Leadership Principles survey)',
      'Round 2: Problem Solving & Data Structures',
      'Round 3: Advanced Algorithms & Low Level Design',
      'Round 4: Bar Raiser & Behavioral Leadership Principles',
    ],
    focusTopics: [
      'Graphs (BFS/DFS, Topological Sort, Shortest Paths)',
      'Heaps & Priority Queues (Top K elements, Stream median)',
      'Amazon 16 Leadership Principles (Customer Obsession, Ownership)',
      'Database Indexing & Normalization',
    ],
    recommendedPractice: [
      'LeetCode Amazon Top 50 tagged questions',
      'System Design: Design an LRU Cache',
      'STAR Method for leadership principle behavioral answers',
    ],
  },
  {
    company: 'Uber',
    role: 'SWE Intern (Summer 2026)',
    ctc: '₹1.6L/mo Stipend',
    rounds: [
      'Round 1: HackerRank Assessment (70 mins, 3 questions)',
      'Round 2: Data Structures & Algorithms (Greedy, Sliding Window)',
      'Round 3: System Design Fundamentals & Concurrency',
      'Round 4: Hiring Manager & Values Fit',
    ],
    focusTopics: [
      'Sliding Window & Two Pointers',
      'Concurrency & Multi-threaded safe queues',
      'Microservices architecture basics',
      'Low Latency System Design',
    ],
    recommendedPractice: [
      'LeetCode: Sliding Window Maximum, Task Scheduler',
      'System Design: Design Rate Limiter, Location Tracking Service',
    ],
  },
  {
    company: 'Microsoft',
    role: 'University Graduate (SWE)',
    ctc: '₹51 LPA CTC',
    rounds: [
      'Round 1: Codility Online Assessment',
      'Round 2: Technical Interview (Trees, Recursion, Dynamic Programming)',
      'Round 3: Object Oriented Design & Code Quality',
      'Round 4: Leadership & Engineering Mindset',
    ],
    focusTopics: [
      'Tree Traversals & Graph Algorithms',
      'Clean Code & SOLID Principles',
      'Memory Management & Garbage Collection',
      'Asynchronous Programming (Promises, Async/Await, WebSockets)',
    ],
    recommendedPractice: [
      'LeetCode: Course Schedule, Word Break, Serialize Binary Tree',
      'Design: Design File System, Design TinyURL',
    ],
  },
];

export default function AnalyticsPage() {
  const { profile } = useStudentProfile();
  const { applications } = useApplications();
  const [selectedPrepGuide, setSelectedPrepGuide] = useState<PrepGuide | null>(null);

  const totalDrives = applications.length;
  const appliedCount = applications.filter((a) => ['APPLIED', 'ASSESSMENT', 'INTERVIEW', 'SELECTED'].includes(a.status)).length;
  const oaCount = applications.filter((a) => ['ASSESSMENT', 'INTERVIEW', 'SELECTED'].includes(a.status)).length;
  const interviewCount = applications.filter((a) => ['INTERVIEW', 'SELECTED'].includes(a.status)).length;
  const offerCount = applications.filter((a) => a.status === 'SELECTED').length;

  const getPct = (cnt: number) => (totalDrives > 0 ? Math.round((cnt / totalDrives) * 100) : 0);

  return (
    <div className="page-container">
      {/* Header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '32px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 700, letterSpacing: '-0.02em' }}>
            Placement Analytics & Preparation
          </h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Recruitment funnel conversion rates, benchmark compensation tiers, and company roadmaps
          </p>
        </div>
      </div>

      {/* 4 Metric Highlights */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '18px',
          marginBottom: '32px',
        }}
      >
        <Card hoverable={false} style={{ backgroundColor: '#111624' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Tracked Pipeline</span>
            <TrendingUp size={16} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)' }}>
            {totalDrives} Drives
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            In pipeline
          </div>
        </Card>

        <Card hoverable={false} style={{ backgroundColor: '#111624' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Offers Secured</span>
            <Award size={16} color="var(--status-eligible)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', color: 'var(--status-eligible)' }}>
            {offerCount} {offerCount === 1 ? 'Offer' : 'Offers'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {offerCount > 0 ? 'Selected' : 'In evaluation'}
          </div>
        </Card>

        <Card hoverable={false} style={{ backgroundColor: '#111624' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Academic Standing</span>
            <Target size={16} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', color: 'var(--text-primary)' }}>
            {profile.cgpa || 8.0} CGPA
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {profile.branch || 'CSE'} Batch of {profile.graduation_year || 2026}
          </div>
        </Card>

        <Card hoverable={false} style={{ backgroundColor: '#111624' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Interview Conversion</span>
            <Clock size={16} color="var(--status-info)" />
          </div>
          <div style={{ fontSize: '24px', fontWeight: 700, marginTop: '8px', color: 'var(--status-info)' }}>
            {getPct(interviewCount)}% Rate
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '2px' }}>
            {interviewCount} In Interviews
          </div>
        </Card>
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(360px, 1fr))',
          gap: '24px',
          marginBottom: '32px',
        }}
      >
        {/* Application Funnel Card */}
        <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <BarChart3 size={18} color="var(--primary-light)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Conversion Funnel</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { label: 'Tracked on Kanban', count: totalDrives, pct: 100, color: 'var(--primary-light)' },
              { label: 'Applied on Form / Portal', count: appliedCount, pct: getPct(appliedCount), color: '#60a5fa' },
              { label: 'Online Assessments (OA)', count: oaCount, pct: getPct(oaCount), color: '#fbbf24' },
              { label: 'Technical Interviews', count: interviewCount, pct: getPct(interviewCount), color: '#c084fc' },
              { label: 'Offers Received', count: offerCount, pct: getPct(offerCount), color: '#34d399' },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '6px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{f.label}</span>
                  <strong style={{ color: f.color }}>{f.count} ({totalDrives > 0 ? f.pct : 0}%)</strong>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '6px',
                    borderRadius: '999px',
                    backgroundColor: '#0a0d15',
                    border: '1px solid var(--border-subtle)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${totalDrives > 0 ? Math.max(4, f.pct) : 0}%`,
                      height: '100%',
                      backgroundColor: f.color,
                      borderRadius: '999px',
                      transition: 'width 0.4s ease-out',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compensation Tiers Breakdown */}
        <div className="glass-card" style={{ padding: '24px', backgroundColor: '#111624' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '20px' }}>
            <Award size={18} color="var(--primary-light)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Package Tier Distribution</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: '#0d111a',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '13.5px', color: '#60a5fa' }}>Super Dream (&gt; ₹30 LPA)</strong>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Microsoft, Amazon, Uber, Atlassian</div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Tier 1</div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: '#0d111a',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '13.5px', color: '#34d399' }}>Dream Tier (₹15 - 30 LPA)</strong>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Goldman Sachs, Oracle, Cisco, Qualcomm</div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Tier 2</div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '8px',
                backgroundColor: '#0d111a',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '13.5px', color: '#cbd5e1' }}>Standard Core (&lt; ₹15 LPA)</strong>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>TCS Digital, Infosys SP, Cognizant, Wipro</div>
              </div>
              <div style={{ fontSize: '16px', fontWeight: 700, color: 'var(--text-primary)' }}>Tier 3</div>
            </div>
          </div>
        </div>
      </div>

      {/* Recruiter Prep Guides */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '18px' }}>
          <BookOpen size={18} color="var(--primary-light)" />
          <h2 style={{ fontSize: '17px', fontWeight: 700 }}>Company Specific Interview Preparation</h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
            gap: '18px',
          }}
        >
          {PREP_GUIDES.map((g) => (
            <Card
              key={g.company}
              hoverable={true}
              onClick={() => setSelectedPrepGuide(g)}
              style={{ display: 'flex', flexDirection: 'column', gap: '12px', backgroundColor: '#111624' }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700 }}>{g.company}</h3>
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: 600,
                    color: 'var(--status-eligible)',
                  }}
                >
                  {g.ctc}
                </span>
              </div>

              <div style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>{g.role}</div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '4px' }}>
                {g.focusTopics.slice(0, 2).map((t, idx) => (
                  <span
                    key={idx}
                    style={{
                      fontSize: '11px',
                      padding: '2px 7px',
                      borderRadius: '4px',
                      backgroundColor: '#0a0d15',
                      border: '1px solid var(--border-subtle)',
                      color: 'var(--text-secondary)',
                    }}
                  >
                    {t.split('(')[0].trim()}
                  </span>
                ))}
              </div>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  marginTop: '6px',
                  paddingTop: '8px',
                  borderTop: '1px solid var(--border-subtle)',
                  fontSize: '12px',
                  color: 'var(--primary-light)',
                  fontWeight: 500,
                }}
              >
                <span>View Full Roadmap</span>
                <ChevronRight size={13} />
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Roadmap Detail Modal */}
      {selectedPrepGuide && (
        <Modal
          isOpen={Boolean(selectedPrepGuide)}
          onClose={() => setSelectedPrepGuide(null)}
          title={`${selectedPrepGuide.company} — Placement Preparation Roadmap`}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div
              style={{
                padding: '12px 14px',
                borderRadius: '6px',
                backgroundColor: '#0d111a',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Role</div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{selectedPrepGuide.role}</div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: '11.5px', color: 'var(--text-muted)' }}>Package Tier</div>
                <div style={{ fontWeight: 600, color: 'var(--status-eligible)' }}>{selectedPrepGuide.ctc}</div>
              </div>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Interview Rounds Breakdown
              </h4>
              <ul style={{ fontSize: '12.5px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPrepGuide.rounds.map((r, i) => (
                  <li key={i}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Key Technical Focus Topics
              </h4>
              <ul style={{ fontSize: '12.5px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPrepGuide.focusTopics.map((t, i) => (
                  <li key={i}>{t}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '13px', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
                Recommended Practice Sets
              </h4>
              <ul style={{ fontSize: '12.5px', color: 'var(--text-secondary)', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPrepGuide.recommendedPractice.map((p, i) => (
                  <li key={i}>{p}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '6px' }}>
              <Button variant="primary" size="md" onClick={() => setSelectedPrepGuide(null)}>
                Got It
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
