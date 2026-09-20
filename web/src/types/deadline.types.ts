import { DeadlineStatusEnum, ReminderStatusEnum } from './database.types';

export interface DeadlineItem {
  id: string;
  user_id: string;
  insight_id?: string | null;
  application_id?: string | null;
  title: string;
  company_name: string;
  deadline_at: string;
  status: DeadlineStatusEnum;
  action_url?: string | null;
  notes?: string | null;
  created_at?: string;
  updated_at?: string;
  reminders?: ReminderItem[];
}

export interface ReminderItem {
  id: string;
  deadline_id: string;
  scheduled_for: string;
  offset_hours: number;
  status: ReminderStatusEnum;
}
