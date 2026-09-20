import { TelegramChatTypeEnum } from './database.types';

export interface TelegramDiscoveredGroup {
  id: string;
  telegram_id: number;
  title: string;
  username: string | null;
  chat_type: TelegramChatTypeEnum;
  total_members: number | null;
  last_message_at: string | null;
  last_discovered_at: string;
  is_monitored?: boolean;
  auto_analyze?: boolean;
}

export interface TelegramAuthRequest {
  phone_number: string;
  phone_code_hash?: string;
  code?: string;
  password?: string; // For 2FA
}

export interface TelegramMessagePayload {
  group_id: string;
  telegram_message_id: number;
  sender_id?: number;
  sender_name?: string;
  message_text: string;
  media_url?: string;
  message_timestamp: string;
  raw_payload?: Record<string, unknown>;
}
