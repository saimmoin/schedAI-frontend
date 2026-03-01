import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';


export interface Appointment {
  id: string;
  workspace_id: string;   workspaceId: string;
  host_user_id: string;   hostUserId: string;
  guest_name: string;     guestName: string;
  guest_email: string;    guestEmail: string;
  title: string;
  reason: string;
  start_time: string;     startTime: string;
  end_time: string;       endTime: string;
  type: 'meeting' | 'focus' | 'external';
  status: 'scheduled' | 'completed' | 'cancelled' | 'confirmed';
  transcript?: string;
  hostName?: string;
}

export interface TimeSlot {
  id: string;
  start: string;
  end: string;
  score?: number;
  available: boolean;
}
export interface Conflict {
  conflict: boolean;
  type: 'double_booking' | 'back_to_back' | 'focus_clash' | null;
  suggestion?: string;   // ADD THIS
}

export interface AvailabilityRule {
  day_of_week: number;
  start_time: string;
  end_time: string;
  buffer_minutes: number;
  is_bookable: boolean;
}

export interface WaitlistEntry {
  id: string;
  guest_name: string;       guestName: string;
  guest_email: string;      guestEmail: string;
  guest_reason: string;     guestReason: string;
  preferred_start: string;  preferredStart: string;
  preferred_end: string;    preferredEnd: string;
  status: 'waiting' | 'booked' | 'expired';
  created_at: string;       createdAt: string;
}

export interface AIDebrief {
  summary: string;
  action_items: string[];             actionItems: string[];
  suggested_followup_date: string | null; suggestedFollowupDate: string | null;
}

export interface Conflict {
  conflict: boolean;
  type: 'double_booking' | 'back_to_back' | 'focus_clash' | null;
}

export interface WeekEfficiency {
  score: number;
  totalMeetings: number;
  backToBackCount: number;
  avgGapMinutes: number;
  focusTimeHours: number;
}

export interface WorkspaceMember {
  id: string;
  user_id: string;
  workspace_id: string;
  name: string;
  email: string;
  user: { name: string; email: string };
  freeBusyStatus?: 'free' | 'busy' | string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  timezone: string;
  
}

@Injectable({ providedIn: 'root' })
export class Api {
  private base = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient) {}

  private mapAppointment(raw: any): Appointment {
    return {
      ...raw,
      guestName: raw.guest_name,
      guestEmail: raw.guest_email,
      startTime: raw.start_time,
      endTime: raw.end_time,
      workspaceId: raw.workspace_id,
      hostUserId: raw.host_user_id,
    };
  }

  private mapWaitlistEntry(raw: any): WaitlistEntry {
    return {
      ...raw,
      guestName: raw.guest_name,
      guestEmail: raw.guest_email,
      guestReason: raw.guest_reason,
      preferredStart: raw.preferred_start,
      preferredEnd: raw.preferred_end,
      createdAt: raw.created_at,
    };
  }

  private mapTimeSlot(raw: any): TimeSlot {
    return {
      id: raw.id ?? `${raw.start}-${raw.end}`,
      start: raw.start,
      end: raw.end,
      score: raw.score,
      available: raw.available ?? true,
    };
  }

  private mapDebrief(raw: any): AIDebrief {
    return {
      ...raw,
      actionItems: raw.action_items,
      suggestedFollowupDate: raw.suggested_followup_date,
    };
  }

  getAppointment(id: string): Observable<Appointment> {
    return this.http.get<any>(`${this.base}/appointments/${id}`).pipe(
      map(raw => this.mapAppointment(raw))
    );
  }

  getWeekEfficiency(): Observable<WeekEfficiency> {
    return this.getAppointments().pipe(
      map(apts => ({
        score: 74,
        totalMeetings: apts.length,
        backToBackCount: 0,
        avgGapMinutes: 30,
        focusTimeHours: 4
      }))
    );
  }

  addToWaitlist(slug: string, data: any): Observable<any> {
    return this.joinWaitlist(slug, data);
  }

  // Auth
  register(name: string, email: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/auth/register`, { name, email, password });
  }

  login(email: string, password: string): Observable<any> {
    return this.http.post(`${this.base}/auth/login`, { email, password });
  }

  // Workspaces
  createWorkspace(name: string): Observable<any> {
    return this.http.post(`${this.base}/workspaces`, { name });
  }

  joinWorkspace(invite_code: string): Observable<any> {
    return this.http.post(`${this.base}/workspaces/join`, { invite_code });
  }

  getWorkspaceMembers(ws_id: string | number): Observable<WorkspaceMember[]> {
    return this.http.get<WorkspaceMember[]>(`${this.base}/workspaces/${ws_id}/members`);
  }

  seedCalendar(): Observable<any> {
    return this.http.post(`${this.base}/workspaces/seed-calendar`, {});
  }

  // Availability
  saveAvailability(rules: AvailabilityRule[]): Observable<any> {
    return this.http.post(`${this.base}/availability`, { rules });
  }

  getAvailability(user_id: number): Observable<AvailabilityRule[]> {
    return this.http.get<AvailabilityRule[]>(`${this.base}/availability/${user_id}`);
  }

  getSlots(user_id: number, date: string): Observable<TimeSlot[]> {
    return this.http.get<any[]>(`${this.base}/availability/${user_id}/slots?date=${date}`).pipe(
      map(slots => slots.map(s => this.mapTimeSlot(s)))
    );
  }

  // Appointments
  getAppointments(week?: string): Observable<Appointment[]> {
    const params = week ? `?week=${week}` : '';
    return this.http.get<any[]>(`${this.base}/appointments${params}`).pipe(
      map(apts => apts.map(a => this.mapAppointment(a)))
    );
  }

  createAppointment(data: any): Observable<Appointment> {
    return this.http.post<any>(`${this.base}/appointments`, data).pipe(
      map(raw => this.mapAppointment(raw))
    );
  }

  updateAppointment(id: string | number, data: any): Observable<any> {
    return this.http.patch(`${this.base}/appointments/${id}`, data);
  }

  deleteAppointment(id: string | number): Observable<any> {
    return this.http.delete(`${this.base}/appointments/${id}`);
  }

  saveTranscript(appointment_id: string | number, content: string): Observable<any> {
    return this.http.post(`${this.base}/appointments/${appointment_id}/transcript`, { content });
  }

  getICS(appointment_id: string | number): string {
    return `${this.base}/appointments/${appointment_id}/ics`;
  }

  // Public booking (no auth needed)
  getPublicSlots(slug: string): Observable<any> {
    return this.http.get(`${this.base}/public/slots/${slug}`);
  }

  publicBook(slug: string, data: any): Observable<any> {
    return this.http.post(`${this.base}/public/book/${slug}`, data);
  }

  joinWaitlist(slug: string, data: any): Observable<any> {
    return this.http.post(`${this.base}/public/waitlist/${slug}`, data);
  }

  // Waitlist
  getWaitlist(): Observable<WaitlistEntry[]> {
    return this.http.get<any[]>(`${this.base}/waitlist`).pipe(
      map(entries => entries.map(e => this.mapWaitlistEntry(e)))
    );
  }

  removeFromWaitlist(id: string | number): Observable<any> {
    return this.http.delete(`${this.base}/waitlist/${id}`);
  }

  // AI
  generateDebrief(appointment_id: string | number): Observable<AIDebrief> {
    return this.http.post<any>(`${this.base}/ai/debrief`, { appointment_id }).pipe(
      map(raw => this.mapDebrief(raw))
    );
  }

  scoreSlots(slots: TimeSlot[]): Observable<TimeSlot[]> {
    return this.http.post<any[]>(`${this.base}/ai/score-slots`, { slots }).pipe(
      map(results => results.map(s => this.mapTimeSlot(s)))
    );
  }

  optimizeWeek(week?: string): Observable<any> {
    const params = week ? `?week=${week}` : '';
    return this.http.post(`${this.base}/ai/optimize${params}`, {});
  }
}