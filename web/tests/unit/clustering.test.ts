import { describe, it, expect } from 'vitest';
import { clusterPlacementInsights } from '../../src/lib/business/clustering';
import { PlacementInsight } from '../../src/types/insight.types';

describe('Multi-Channel Notice Clustering Engine', () => {
  it('groups notices for the same company and role posted across 3 different channels', () => {
    const rawNotices: PlacementInsight[] = [
      {
        id: '1',
        company_name: 'Goldman Sachs',
        role_title: 'Summer Analyst',
        opportunity_type: 'JOB',
        group_name: 'TPO Official 2026',
        salary_or_stipend: '₹24 LPA',
        urgency: 'HIGH',
        confidence_score: 0.95,
        extraction_provider: 'GEMINI',
      },
      {
        id: '2',
        company_name: 'Goldman Sachs India',
        role_title: 'Summer Analyst 2026',
        opportunity_type: 'JOB',
        group_name: 'CSE Placement Group',
        salary_or_stipend: '₹24 - 30 LPA',
        urgency: 'CRITICAL',
        confidence_score: 0.98,
        extraction_provider: 'GEMINI',
      },
      {
        id: '3',
        company_name: 'Amazon India',
        role_title: 'SDE-1',
        opportunity_type: 'JOB',
        group_name: 'TPO Official 2026',
        salary_or_stipend: '₹44 LPA',
        urgency: 'MEDIUM',
        confidence_score: 0.92,
        extraction_provider: 'GEMINI',
      },
    ];

    const clusters = clusterPlacementInsights(rawNotices);

    // 2 Goldman Sachs notices clustered into 1 + 1 Amazon notice = 2 distinct clusters
    expect(clusters.length).toBe(2);

    const gsCluster = clusters.find((c) => c.company_name.includes('Goldman Sachs'));
    expect(gsCluster).toBeDefined();
    expect(gsCluster?.duplicate_count).toBe(2);
    expect(gsCluster?.sources.length).toBe(2);
    expect(gsCluster?.urgency).toBe('CRITICAL');
  });
});
