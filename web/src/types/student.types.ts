import { EligibilityStatusEnum } from './database.types';
import { OpportunityCriteria } from './insight.types';

export interface StudentProfile {
  user_id: string;
  full_name: string;
  college_name?: string | null;
  degree?: string | null;
  branch?: string | null;
  graduation_year: number;
  cgpa?: number | null;
  percentage?: number | null;
  active_backlogs?: number;
  history_backlogs?: number;
  tenth_percentage?: number | null;
  twelfth_percentage?: number | null;
  skills: string[];
  resume_url?: string | null;
}

export interface EligibilityResult {
  status: EligibilityStatusEnum;
  reasons: string[];
  confidence: number;
}

export { type OpportunityCriteria };
