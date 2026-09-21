'use client';

import React, { useState } from 'react';
import {
  TrendingUp,
  BarChart3,
  Award,
  Target,
  Clock,
  Sparkles,
  BookOpen,
  CheckCircle2,
  ChevronRight,
  ExternalLink,
  Layers,
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
          marginBottom: '28px',
          flexWrap: 'wrap',
          gap: '16px',
        }}
      >
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800 }}>Placement Analytics & Preparation Hub</h1>
          <p style={{ fontSize: '13.5px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Application conversion funnels, benchmark CTC metrics, and tailored company roadmaps
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
        <Card hoverable={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Tracked Applications</span>
            <TrendingUp size={18} color="var(--status-eligible)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--status-eligible)' }}>
            {totalDrives} Drives
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Active on your Kanban board
          </div>
        </Card>

        <Card hoverable={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Offers Secured</span>
            <Award size={18} color="#ec4899" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: '#ec4899' }}>
            {offerCount} {offerCount === 1 ? 'Offer' : 'Offers'}
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {offerCount > 0 ? 'Congratulations! 🎉' : 'In active recruitment cycles'}
          </div>
        </Card>

        <Card hoverable={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Placement Profile</span>
            <Target size={18} color="var(--primary-light)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--primary-light)' }}>
            {profile.cgpa || 8.0} CGPA
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {profile.branch || 'CSE'} Batch of {profile.graduation_year || 2028}
          </div>
        </Card>

        <Card hoverable={false}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>Interview Conversion</span>
            <Clock size={18} color="var(--status-info)" />
          </div>
          <div style={{ fontSize: '28px', fontWeight: 800, marginTop: '8px', color: 'var(--status-info)' }}>
            {getPct(interviewCount)}% Rate
          </div>
          <div style={{ fontSize: '12px', color: 'var(--text-secondary)', marginTop: '4px' }}>
            {interviewCount} Advanced to Technical/HR
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
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <BarChart3 size={20} color="var(--primary-light)" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Application Conversion Funnel</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {[
              { label: 'Tracked on Kanban', count: totalDrives, pct: 100, color: 'var(--primary)' },
              { label: 'Applied on Form / Portal', count: appliedCount, pct: getPct(appliedCount), color: '#38bdf8' },
              { label: 'Online Assessments (OA)', count: oaCount, pct: getPct(oaCount), color: '#f59e0b' },
              { label: 'Technical Interviews', count: interviewCount, pct: getPct(interviewCount), color: '#a855f7' },
              { label: 'Offers Received 🎉', count: offerCount, pct: getPct(offerCount), color: '#10b981' },
            ].map((f) => (
              <div key={f.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '12.5px', marginBottom: '4px' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{f.label}</span>
                  <strong style={{ color: f.color }}>{f.count} ({totalDrives > 0 ? f.pct : 0}%)</strong>
                </div>
                <div
                  style={{
                    width: '100%',
                    height: '8px',
                    borderRadius: '999px',
                    backgroundColor: 'rgba(255, 255, 255, 0.05)',
                    overflow: 'hidden',
                  }}
                >
                  <div
                    style={{
                      width: `${totalDrives > 0 ? Math.max(5, f.pct) : 0}%`,
                      height: '100%',
                      backgroundColor: f.color,
                      borderRadius: '999px',
                      transition: 'width 0.5s ease-out',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Compensation Tiers Breakdown */}
        <div className="glass-card" style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
            <Award size={20} color="#ec4899" />
            <h2 style={{ fontSize: '16px', fontWeight: 700 }}>Package Tier Distribution</h2>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(236, 72, 153, 0.1)',
                border: '1px solid rgba(236, 72, 153, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '14px', color: '#ec4899' }}>Super Dream Tier (&gt; ₹30 LPA)</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Microsoft, Amazon, Uber, Atlassian</div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>8 Drives</div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(99, 102, 241, 0.1)',
                border: '1px solid rgba(99, 102, 241, 0.3)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--primary-light)' }}>Dream Tier (₹15 - 30 LPA)</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Goldman Sachs, Cisco, Oracle, Morgan Stanley</div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>18 Drives</div>
            </div>

            <div
              style={{
                padding: '14px 16px',
                borderRadius: '10px',
                backgroundColor: 'rgba(255, 255, 255, 0.03)',
                border: '1px solid var(--border-subtle)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <strong style={{ fontSize: '14px', color: 'var(--text-primary)' }}>Standard Tier (&lt; ₹15 LPA)</strong>
                <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Mass Recruiters, Early Tech Startups</div>
              </div>
              <div style={{ fontSize: '20px', fontWeight: 800, color: '#ffffff' }}>12 Drives</div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Interview Preparation Roadmaps */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '16px' }}>
          <Sparkles size={20} color="var(--primary-light)" />
          <h2 style={{ fontSize: '18px', fontWeight: 700 }}>
            AI-Tailored Company Interview Preparation Roadmaps
          </h2>
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
            gap: '20px',
          }}
        >
          {PREP_GUIDES.map((guide) => (
            <div
              key={guide.company}
              className="glass-card"
              style={{
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                gap: '16px',
              }}
            >
              <div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                  <h3 style={{ fontSize: '17px', fontWeight: 700 }}>{guide.company}</h3>
                  <Badge variant="eligible">{guide.ctc}</Badge>
                </div>
                <div style={{ fontSize: '12.5px', color: 'var(--text-secondary)', marginBottom: '14px' }}>
                  {guide.role}
                </div>

                <div style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '6px' }}>
                  Core Interview Focus Areas:
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  {guide.focusTopics.map((topic, i) => (
                    <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12.5px', color: 'var(--text-primary)' }}>
                      <CheckCircle2 size={13} color="var(--status-eligible)" />
                      <span>{topic}</span>
                    </div>
                  ))}
                </div>
              </div>

              <Button
                variant="secondary"
                size="sm"
                onClick={() => setSelectedPrepGuide(guide)}
                rightIcon={<ChevronRight size={14} />}
                style={{ width: '100%', marginTop: '8px' }}
              >
                View Full Interview Roadmap
              </Button>
            </div>
          ))}
        </div>
      </div>

      {/* Prep Guide Modal */}
      {selectedPrepGuide && (
        <Modal
          isOpen={Boolean(selectedPrepGuide)}
          onClose={() => setSelectedPrepGuide(null)}
          title={`Interview Roadmap: ${selectedPrepGuide.company}`}
          maxWidth="640px"
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--primary-light)', marginBottom: '8px' }}>
                Hiring Rounds & Evaluation Format
              </h4>
              <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPrepGuide.rounds.map((r, idx) => (
                  <li key={idx}>{r}</li>
                ))}
              </ul>
            </div>

            <div>
              <h4 style={{ fontSize: '14px', fontWeight: 700, color: 'var(--status-info)', marginBottom: '8px' }}>
                Recommended DSA & System Practice
              </h4>
              <ul style={{ fontSize: '13px', color: 'var(--text-secondary)', paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '6px' }}>
                {selectedPrepGuide.recommendedPractice.map((p, idx) => (
                  <li key={idx}>{p}</li>
                ))}
              </ul>
            </div>

            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '10px' }}>
              <Button variant="primary" size="md" onClick={() => setSelectedPrepGuide(null)}>
                Got it
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
