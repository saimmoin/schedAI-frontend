export interface User {
  id: number;
  name: string;
  email: string;
  slug: string;
  created_at: string;
}

export interface Workspace {
  id: number;
  name: string;
  created_by: number;
  invite_code: string;
  created_at: string;
}

export interface WorkspaceMember {
  id: number;
  user_id: number;
  name: string;
  email: string;
  role: 'owner' | 'member';
  is_free: boolean;
}

export interface AvailabilityRule {
  id?: number;
  user_id?: number;
  day_of_week: number; // 0=Mon, 6=Sun
  start_time: string; // "09:00"
  end_time: string;   // "17:00"
  buffer_minutes: number;
  is_bookable: boolean;
}

export interface Appointment {
  id: number;
  workspace_id: number;
  host_user_id: number;
  guest_name: string;
  guest_email: string;
  title: string;
  reason: string;
  start_time: string;
  end_time: string;
  status: 'confirmed' | 'cancelled' | 'focus';
  created_at: string;
}

export interface Transcript {
  id: number;
  appointment_id: number;
  content: string;
  created_at: string;
}

export interface AiDebrief {
  id: number;
  appointment_id: number;
  summary: string;
  action_items: string[];
  suggested_followup_date: string;
  created_at: string;
}

export interface WaitlistEntry {
  id: number;
  host_user_id: number;
  guest_name: string;
  guest_email: string;
  guest_reason: string;
  preferred_start: string;
  preferred_end: string;
  status: 'waiting' | 'booked' | 'expired';
  created_at: string;
}

export interface Slot {
  start: string;
  end: string;
}

export interface ConflictResult {
  conflict: boolean;
  type?: 'double_booking' | 'back_to_back' | 'focus_clash';
  suggestion?: string;
}

export interface ScoredSlot extends Slot {
  score: number;
  label: string;
}

export interface OptimizeResult {
  original: Appointment[];
  suggested: Appointment[];
  original_score: number;
  suggested_score: number;
}
