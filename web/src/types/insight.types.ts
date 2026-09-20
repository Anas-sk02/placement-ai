import { OpportunityTypeEnum, UrgencyLevelEnum } from './database.types';

export interface OpportunityCriteria {
  min_cgpa?: number | null;
  min_percentage?: number | null;
  batch_years?: number[];
  allowed_branches?: string[];
  max_active_backlogs?: number | null;
  max_history_backlogs?: number | null;
  gender_preference?: string | null;
}

export interface ExtractedPlacementData {
  is_placement_related?: boolean;
  company_name: string;
  role_title?: string;
  opportunity_type: OpportunityTypeEnum;
  batch_year?: string;
  salary_or_stipend?: string;
  min_cgpa?: number;
  allowed_branches?: string[];
  max_active_backlogs?: number;
  registration_deadline?: string;
  event_timestamp?: string;
  application_url?: string;
  action_required?: string;
  eligibility_raw?: string;
  urgency: UrgencyLevelEnum;
  confidence_score: number;
}

export interface PlacementInsight extends ExtractedPlacementData {
  id?: string;
  user_id?: string;
  group_id?: string;
  group_name?: string;
  source_message_id?: string;
  raw_message_text?: string;
  extraction_provider: 'GEMINI' | 'RULE_FALLBACK';
  is_dismissed?: boolean;
  is_bookmarked?: boolean;
  created_at?: string;
}
