export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type OpportunityTypeEnum =
  | 'JOB'
  | 'INTERNSHIP'
  | 'ASSESSMENT'
  | 'CODING_TEST'
  | 'CAMPUS_DRIVE'
  | 'HACKATHON'
  | 'WORKSHOP_TRAINING'
  | 'OTHER'

export type UrgencyLevelEnum = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export type DeadlineStatusEnum =
  | 'UPCOMING'
  | 'URGENT'
  | 'COMPLETED'
  | 'OVERDUE'
  | 'DISMISSED'

export type ReminderStatusEnum = 'PENDING' | 'SENT' | 'FAILED' | 'CANCELLED'

export type ApplicationStatusEnum =
  | 'SAVED'
  | 'APPLIED'
  | 'ASSESSMENT'
  | 'INTERVIEW'
  | 'SELECTED'
  | 'REJECTED'
  | 'WITHDRAWN'

export type EligibilityStatusEnum = 'ELIGIBLE' | 'NOT_ELIGIBLE' | 'NEEDS_REVIEW'

export type TelegramChatTypeEnum = 'CHANNEL' | 'SUPERGROUP' | 'GROUP'

export interface Database {
  public: {
    Tables: {
      student_profiles: {
        Row: {
          user_id: string
          full_name: string
          college_name: string | null
          degree: string | null
          branch: string | null
          graduation_year: number
          cgpa: number | null
          percentage: number | null
          active_backlogs: number
          history_backlogs: number
          tenth_percentage: number | null
          twelfth_percentage: number | null
          skills: string[]
          resume_url: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          full_name: string
          college_name?: string | null
          degree?: string | null
          branch?: string | null
          graduation_year: number
          cgpa?: number | null
          percentage?: number | null
          active_backlogs?: number
          history_backlogs?: number
          tenth_percentage?: number | null
          twelfth_percentage?: number | null
          skills?: string[]
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          full_name?: string
          college_name?: string | null
          degree?: string | null
          branch?: string | null
          graduation_year?: number
          cgpa?: number | null
          percentage?: number | null
          active_backlogs?: number
          history_backlogs?: number
          tenth_percentage?: number | null
          twelfth_percentage?: number | null
          skills?: string[]
          resume_url?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      student_preferences: {
        Row: {
          user_id: string
          auto_run_insights: boolean
          auto_create_deadlines: boolean
          message_analysis_count: number
          reminder_offsets_hours: number[]
          push_notifications_enabled: boolean
          fcm_token: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          user_id: string
          auto_run_insights?: boolean
          auto_create_deadlines?: boolean
          message_analysis_count?: number
          reminder_offsets_hours?: number[]
          push_notifications_enabled?: boolean
          fcm_token?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          user_id?: string
          auto_run_insights?: boolean
          auto_create_deadlines?: boolean
          message_analysis_count?: number
          reminder_offsets_hours?: number[]
          push_notifications_enabled?: boolean
          fcm_token?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      telegram_connections: {
        Row: {
          id: string
          user_id: string
          telegram_user_id: number
          phone_number: string
          username: string | null
          first_name: string | null
          encrypted_session_string: string
          is_active: boolean
          last_synced_at: string
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          telegram_user_id: number
          phone_number: string
          username?: string | null
          first_name?: string | null
          encrypted_session_string: string
          is_active?: boolean
          last_synced_at?: string
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          telegram_user_id?: number
          phone_number?: string
          username?: string | null
          first_name?: string | null
          encrypted_session_string?: string
          is_active?: boolean
          last_synced_at?: string
          created_at?: string
          updated_at?: string
        }
      }
      telegram_groups: {
        Row: {
          id: string
          telegram_id: number
          title: string
          username: string | null
          chat_type: TelegramChatTypeEnum
          total_members: number | null
          last_message_at: string | null
          last_discovered_at: string
          created_at: string
        }
        Insert: {
          id?: string
          telegram_id: number
          title: string
          username?: string | null
          chat_type?: TelegramChatTypeEnum
          total_members?: number | null
          last_message_at?: string | null
          last_discovered_at?: string
          created_at?: string
        }
        Update: {
          id?: string
          telegram_id?: number
          title?: string
          username?: string | null
          chat_type?: TelegramChatTypeEnum
          total_members?: number | null
          last_message_at?: string | null
          last_discovered_at?: string
          created_at?: string
        }
      }
      user_monitored_groups: {
        Row: {
          id: string
          user_id: string
          group_id: string
          is_monitored: boolean
          auto_analyze: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          is_monitored?: boolean
          auto_analyze?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          is_monitored?: boolean
          auto_analyze?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      telegram_messages: {
        Row: {
          id: string
          group_id: string
          telegram_message_id: number
          sender_id: number | null
          sender_name: string | null
          message_text: string
          media_url: string | null
          message_timestamp: string
          message_hash: string
          has_links: boolean
          raw_payload: Json | null
          created_at: string
        }
        Insert: {
          id?: string
          group_id: string
          telegram_message_id: number
          sender_id?: number | null
          sender_name?: string | null
          message_text: string
          media_url?: string | null
          message_timestamp: string
          message_hash: string
          has_links?: boolean
          raw_payload?: Json | null
          created_at?: string
        }
        Update: {
          id?: string
          group_id?: string
          telegram_message_id?: number
          sender_id?: number | null
          sender_name?: string | null
          message_text?: string
          media_url?: string | null
          message_timestamp?: string
          message_hash?: string
          has_links?: boolean
          raw_payload?: Json | null
          created_at?: string
        }
      }
      ai_insights: {
        Row: {
          id: string
          user_id: string
          group_id: string
          source_message_id: string | null
          company_name: string
          role_title: string | null
          opportunity_type: OpportunityTypeEnum
          eligibility_raw: string | null
          eligibility_criteria: Json | null
          salary_or_stipend: string | null
          batch_year: string | null
          deadline_timestamp: string | null
          event_timestamp: string | null
          application_url: string | null
          action_required: string | null
          urgency: UrgencyLevelEnum
          confidence_score: number | null
          extraction_provider: string
          is_dismissed: boolean
          is_bookmarked: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          group_id: string
          source_message_id?: string | null
          company_name: string
          role_title?: string | null
          opportunity_type?: OpportunityTypeEnum
          eligibility_raw?: string | null
          eligibility_criteria?: Json | null
          salary_or_stipend?: string | null
          batch_year?: string | null
          deadline_timestamp?: string | null
          event_timestamp?: string | null
          application_url?: string | null
          action_required?: string | null
          urgency?: UrgencyLevelEnum
          confidence_score?: number | null
          extraction_provider?: string
          is_dismissed?: boolean
          is_bookmarked?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          group_id?: string
          source_message_id?: string | null
          company_name?: string
          role_title?: string | null
          opportunity_type?: OpportunityTypeEnum
          eligibility_raw?: string | null
          eligibility_criteria?: Json | null
          salary_or_stipend?: string | null
          batch_year?: string | null
          deadline_timestamp?: string | null
          event_timestamp?: string | null
          application_url?: string | null
          action_required?: string | null
          urgency?: UrgencyLevelEnum
          confidence_score?: number | null
          extraction_provider?: string
          is_dismissed?: boolean
          is_bookmarked?: boolean
          created_at?: string
          updated_at?: string
        }
      }
      companies: {
        Row: {
          id: string
          name: string
          domain: string | null
          logo_url: string | null
          career_portal_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          name: string
          domain?: string | null
          logo_url?: string | null
          career_portal_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          name?: string
          domain?: string | null
          logo_url?: string | null
          career_portal_url?: string | null
          created_at?: string
        }
      }
      opportunities: {
        Row: {
          id: string
          company_id: string | null
          company_name: string
          role: string
          opportunity_type: OpportunityTypeEnum
          batch_year: string | null
          eligibility_json: Json | null
          ctc_or_stipend: string | null
          registration_deadline: string | null
          assessment_date: string | null
          apply_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          company_id?: string | null
          company_name: string
          role: string
          opportunity_type: OpportunityTypeEnum
          batch_year?: string | null
          eligibility_json?: Json | null
          ctc_or_stipend?: string | null
          registration_deadline?: string | null
          assessment_date?: string | null
          apply_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          company_id?: string | null
          company_name?: string
          role?: string
          opportunity_type?: OpportunityTypeEnum
          batch_year?: string | null
          eligibility_json?: Json | null
          ctc_or_stipend?: string | null
          registration_deadline?: string | null
          assessment_date?: string | null
          apply_url?: string | null
          created_at?: string
        }
      }
      applications: {
        Row: {
          id: string
          user_id: string
          opportunity_id: string | null
          insight_id: string | null
          company_name: string
          role_title: string
          status: ApplicationStatusEnum
          applied_at: string | null
          assessment_date: string | null
          interview_date: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          opportunity_id?: string | null
          insight_id?: string | null
          company_name: string
          role_title: string
          status?: ApplicationStatusEnum
          applied_at?: string | null
          assessment_date?: string | null
          interview_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          opportunity_id?: string | null
          insight_id?: string | null
          company_name?: string
          role_title?: string
          status?: ApplicationStatusEnum
          applied_at?: string | null
          assessment_date?: string | null
          interview_date?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      deadlines: {
        Row: {
          id: string
          user_id: string
          insight_id: string | null
          application_id: string | null
          title: string
          company_name: string
          deadline_at: string
          status: DeadlineStatusEnum
          action_url: string | null
          notes: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          insight_id?: string | null
          application_id?: string | null
          title: string
          company_name: string
          deadline_at: string
          status?: DeadlineStatusEnum
          action_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          insight_id?: string | null
          application_id?: string | null
          title?: string
          company_name?: string
          deadline_at?: string
          status?: DeadlineStatusEnum
          action_url?: string | null
          notes?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      reminders: {
        Row: {
          id: string
          user_id: string
          deadline_id: string
          scheduled_for: string
          offset_hours: number
          status: ReminderStatusEnum
          sent_at: string | null
          error_message: string | null
          created_at: string
        }
        Insert: {
          id?: string
          user_id: string
          deadline_id: string
          scheduled_for: string
          offset_hours: number
          status?: ReminderStatusEnum
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          deadline_id?: string
          scheduled_for?: string
          offset_hours?: number
          status?: ReminderStatusEnum
          sent_at?: string | null
          error_message?: string | null
          created_at?: string
        }
      }
    }
  }
}
