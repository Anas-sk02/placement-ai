import { PlacementInsight } from '@/types/insight.types';
import { calculateTextSimilarity } from './deduplication';

export interface ClusteredOpportunity extends PlacementInsight {
  cluster_id: string;
  duplicate_count: number;
  sources: { group_id?: string; group_name?: string; message_id?: string; timestamp?: string }[];
}

/**
 * Multi-Channel Notice Clustering Engine
 * Groups identical placement broadcasts forwarded across 5+ groups into a unified drive entity.
 */
export function clusterPlacementInsights(insights: PlacementInsight[]): ClusteredOpportunity[] {
  const clusters: ClusteredOpportunity[] = [];

  for (const item of insights) {
    const normCompany = item.company_name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
    const normRole = (item.role_title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');

    // Look for existing matching cluster
    const matchingCluster = clusters.find((c) => {
      const clusterCompany = c.company_name.toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      const isCompanyMatch =
        clusterCompany === normCompany ||
        clusterCompany.includes(normCompany) ||
        normCompany.includes(clusterCompany);

      if (!isCompanyMatch) return false;

      // If roles exist, compare role similarity
      const clusterRole = (c.role_title || '').toLowerCase().trim().replace(/[^a-z0-9]/g, '');
      if (clusterRole && normRole) {
        if (clusterRole === normRole || clusterRole.includes(normRole) || normRole.includes(clusterRole)) {
          return true;
        }
      }

      // If raw messages exist, check text similarity
      if (c.raw_message_text && item.raw_message_text) {
        const similarity = calculateTextSimilarity(c.raw_message_text, item.raw_message_text);
        if (similarity >= 0.6) return true;
      }

      return true;
    });

    const sourceEntry = {
      group_id: item.group_id,
      group_name: item.group_name || 'TPO Channel',
      message_id: item.source_message_id,
      timestamp: item.created_at,
    };

    if (matchingCluster) {
      matchingCluster.duplicate_count += 1;
      matchingCluster.sources.push(sourceEntry);

      // Merge highest confidence & more specific fields
      if ((item.confidence_score || 0) > (matchingCluster.confidence_score || 0)) {
        matchingCluster.confidence_score = item.confidence_score;
      }
      if (!matchingCluster.salary_or_stipend && item.salary_or_stipend) {
        matchingCluster.salary_or_stipend = item.salary_or_stipend;
      }
      if (!matchingCluster.application_url && item.application_url) {
        matchingCluster.application_url = item.application_url;
      }
      if (item.urgency === 'CRITICAL') {
        matchingCluster.urgency = 'CRITICAL';
      }
    } else {
      clusters.push({
        ...item,
        cluster_id: `cluster-${item.id || Math.random().toString(36).substring(2, 9)}`,
        duplicate_count: 1,
        sources: [sourceEntry],
      });
    }
  }

  return clusters;
}
