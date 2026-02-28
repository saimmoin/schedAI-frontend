import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

// Core interfaces matching backend schema
export interface User {
  id: string;
  name: string;
  email: string;
  slug: string;
  timezone: string;
  createdAt: Date;
}

export interface Workspace {
  id: string;
  name: string;
  createdBy: string;
  inviteCode: string;
  createdAt: Date;
}

export interface WorkspaceMember {
  id: string;
  workspaceId: string;
  userId: string;
  role: 'owner' | 'member';
  user: User;
  freeBusyStatus?: 'free' | 'busy';
}

export interface AvailabilityRule {
  id: string;
  userId: string;
  dayOfWeek: number; // 0-6
  startTime: string; // HH:mm
  endTime: string; // HH:mm
  bufferMinutes: number;
  isBookable: boolean;
}

export interface Appointment {
  id: string;
  workspaceId: string;
  hostUserId: string;
  hostName?: string;
  guestName: string;
  guestEmail: string;
  title: string;
  reason: string;
  startTime: Date;
  endTime: Date;
  status: 'scheduled' | 'completed' | 'cancelled';
  createdAt: Date;
  transcript?: string;
}

export interface Transcript {
  id: string;
  appointmentId: string;
  content: string;
  createdAt: Date;
}

export interface AIDebrief {
  id: string;
  appointmentId: string;
  summary: string;
  actionItems: string[];
  suggestedFollowupDate: Date | null;
  createdAt: Date;
}

export interface WaitlistEntry {
  id: string;
  hostUserId: string;
  guestName: string;
  guestEmail: string;
  guestReason: string;
  preferredStart: Date;
  preferredEnd: Date;
  status: 'waiting' | 'booked' | 'expired';
  createdAt: Date;
}

export interface TimeSlot {
  id: string;
  start: Date;
  end: Date;
  available: boolean;
  score?: number; // AI scoring 0-100
}

export interface Conflict {
  conflict: boolean;
  type: 'double_booking' | 'back_to_back' | 'focus_clash' | null;
  suggestion: string;
}

export interface WeekEfficiency {
  score: number; // 0-100
  totalMeetings: number;
  backToBackCount: number;
  avgGapMinutes: number;
  focusTimeHours: number;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  private currentUser: User = {
    id: '1',
    name: 'Sarah Johnson',
    email: 'sarah@schedai.app',
    slug: 'sarah',
    timezone: 'America/New_York',
    createdAt: new Date(2026, 1, 1)
  };

  private mockWorkspace: Workspace = {
    id: 'ws1',
    name: 'My Team',
    createdBy: '1',
    inviteCode: 'TEAM2026',
    createdAt: new Date(2026, 1, 1)
  };

  private mockMembers: WorkspaceMember[] = [
    {
      id: 'm1',
      workspaceId: 'ws1',
      userId: '1',
      role: 'owner',
      user: {
        id: '1',
        name: 'Sarah Johnson',
        email: 'sarah@schedai.app',
        slug: 'sarah',
        timezone: 'America/New_York',
        createdAt: new Date(2026, 1, 1)
      },
      freeBusyStatus: 'busy'
    },
    {
      id: 'm2',
      workspaceId: 'ws1',
      userId: '2',
      role: 'member',
      user: {
        id: '2',
        name: 'John Doe',
        email: 'john@schedai.app',
        slug: 'john',
        timezone: 'America/New_York',
        createdAt: new Date(2026, 1, 5)
      },
      freeBusyStatus: 'free'
    },
    {
      id: 'm3',
      workspaceId: 'ws1',
      userId: '3',
      role: 'member',
      user: {
        id: '3',
        name: 'Jane Smith',
        email: 'jane@schedai.app',
        slug: 'jane',
        timezone: 'America/Los_Angeles',
        createdAt: new Date(2026, 1, 10)
      },
      freeBusyStatus: 'busy'
    },
    {
      id: 'm4',
      workspaceId: 'ws1',
      userId: '4',
      role: 'member',
      user: {
        id: '4',
        name: 'Bob Wilson',
        email: 'bob@schedai.app',
        slug: 'bob',
        timezone: 'Europe/London',
        createdAt: new Date(2026, 1, 15)
      },
      freeBusyStatus: 'free'
    }
  ];

  private mockAppointments: Appointment[] = [
    {
      id: '1',
      workspaceId: 'ws1',
      hostUserId: '1',
      hostName: 'Sarah Johnson',
      guestName: 'Alice Chen',
      guestEmail: 'alice@example.com',
      title: 'Product Demo',
      reason: 'Interested in enterprise plan',
      startTime: new Date(2026, 2, 3, 10, 0),
      endTime: new Date(2026, 2, 3, 10, 30),
      status: 'scheduled',
      createdAt: new Date(2026, 2, 1)
    },
    {
      id: '2',
      workspaceId: 'ws1',
      hostUserId: '1',
      hostName: 'Sarah Johnson',
      guestName: 'Bob Martinez',
      guestEmail: 'bob@example.com',
      title: 'Strategy Call',
      reason: 'Q1 planning discussion',
      startTime: new Date(2026, 2, 3, 14, 0),
      endTime: new Date(2026, 2, 3, 14, 30),
      status: 'scheduled',
      createdAt: new Date(2026, 2, 1)
    },
    {
      id: '3',
      workspaceId: 'ws1',
      hostUserId: '1',
      hostName: 'Sarah Johnson',
      guestName: 'Carol Davis',
      guestEmail: 'carol@example.com',
      title: 'Follow-up Meeting',
      reason: 'Review action items',
      startTime: new Date(2026, 2, 2, 15, 0),
      endTime: new Date(2026, 2, 2, 15, 30),
      status: 'completed',
      createdAt: new Date(2026, 1, 28),
      transcript: 'This is a sample transcript of the meeting...'
    }
  ];

  private mockWaitlist: WaitlistEntry[] = [
    {
      id: 'w1',
      hostUserId: '1',
      guestName: 'David Lee',
      guestEmail: 'david@example.com',
      guestReason: 'Want to discuss partnership',
      preferredStart: new Date(2026, 2, 4, 9, 0),
      preferredEnd: new Date(2026, 2, 4, 17, 0),
      status: 'waiting',
      createdAt: new Date(2026, 2, 2)
    },
    {
      id: 'w2',
      hostUserId: '1',
      guestName: 'Emma Wilson',
      guestEmail: 'emma@example.com',
      guestReason: 'Product inquiry',
      preferredStart: new Date(2026, 2, 5, 10, 0),
      preferredEnd: new Date(2026, 2, 5, 12, 0),
      status: 'waiting',
      createdAt: new Date(2026, 2, 2)
    }
  ];

  private mockAvailability: AvailabilityRule[] = [
    { id: 'a1', userId: '1', dayOfWeek: 1, startTime: '09:00', endTime: '17:00', bufferMinutes: 10, isBookable: true },
    { id: 'a2', userId: '1', dayOfWeek: 2, startTime: '09:00', endTime: '17:00', bufferMinutes: 10, isBookable: true },
    { id: 'a3', userId: '1', dayOfWeek: 3, startTime: '09:00', endTime: '17:00', bufferMinutes: 10, isBookable: true },
    { id: 'a4', userId: '1', dayOfWeek: 4, startTime: '09:00', endTime: '17:00', bufferMinutes: 10, isBookable: true },
    { id: 'a5', userId: '1', dayOfWeek: 5, startTime: '09:00', endTime: '17:00', bufferMinutes: 10, isBookable: true }
  ];

  // Auth
  getCurrentUser(): User {
    return this.currentUser;
  }

  // Workspaces
  createWorkspace(name: string): Observable<Workspace> {
    const workspace: Workspace = {
      id: `ws${Date.now()}`,
      name,
      createdBy: this.currentUser.id,
      inviteCode: this.generateInviteCode(),
      createdAt: new Date()
    };
    return of(workspace).pipe(delay(300));
  }

  joinWorkspace(inviteCode: string): Observable<Workspace> {
    return of(this.mockWorkspace).pipe(delay(300));
  }

  getWorkspaceMembers(workspaceId: string): Observable<WorkspaceMember[]> {
    return of(this.mockMembers).pipe(delay(200));
  }

  // Availability
  saveAvailability(rules: Partial<AvailabilityRule>[]): Observable<AvailabilityRule[]> {
    return of(this.mockAvailability).pipe(delay(300));
  }

  getAvailability(userId: string): Observable<AvailabilityRule[]> {
    return of(this.mockAvailability).pipe(delay(200));
  }

  getAvailableSlots(userId: string, date: Date): Observable<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const baseDate = new Date(date);
    baseDate.setHours(0, 0, 0, 0);

    // Generate 30-min slots from 9am to 5pm
    for (let hour = 9; hour < 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const start = new Date(baseDate);
        start.setHours(hour, minute, 0, 0);
        const end = new Date(start);
        end.setMinutes(start.getMinutes() + 30);

        // Check if slot conflicts with existing appointments
        const hasConflict = this.mockAppointments.some(apt => {
          const aptStart = new Date(apt.startTime);
          const aptEnd = new Date(apt.endTime);
          return (start >= aptStart && start < aptEnd) || (end > aptStart && end <= aptEnd);
        });

        slots.push({
          id: `slot-${hour}-${minute}`,
          start,
          end,
          available: !hasConflict && Math.random() > 0.2 // 80% available
        });
      }
    }

    return of(slots).pipe(delay(300));
  }

  // Public booking (no auth)
  getPublicSlots(slug: string, startDate?: Date): Observable<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const today = startDate || new Date();
    
    // Generate slots for next 7 days
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      
      // Skip weekends
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate 30-min slots from 9am to 5pm
      for (let hour = 9; hour < 17; hour++) {
        for (let minute = 0; minute < 60; minute += 30) {
          const start = new Date(date);
          start.setHours(hour, minute, 0, 0);
          const end = new Date(start);
          end.setMinutes(30);
          
          slots.push({
            id: `slot-${dayOffset}-${hour}-${minute}`,
            start,
            end,
            available: Math.random() > 0.3 // 70% available
          });
        }
      }
    }
    
    return of(slots).pipe(delay(500));
  }

  publicBook(slug: string, booking: {
    guestName: string;
    guestEmail: string;
    reason: string;
    slotId: string;
    startTime: Date;
    endTime: Date;
  }): Observable<{ success: boolean; appointment?: Appointment; available?: boolean; nextSlots?: TimeSlot[] }> {
    // 20% chance of conflict
    const hasConflict = Math.random() < 0.2;
    
    if (hasConflict) {
      // Return alternative slots
      return this.getPublicSlots(slug).pipe(
        delay(800),
        map(slots => ({
          success: false,
          available: false,
          nextSlots: slots.filter(s => s.available).slice(0, 3)
        }))
      );
    }
    
    const appointment: Appointment = {
      id: `apt${Date.now()}`,
      workspaceId: 'ws1',
      hostUserId: '1',
      hostName: 'Sarah Johnson',
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      title: 'Meeting',
      reason: booking.reason,
      startTime: booking.startTime,
      endTime: booking.endTime,
      status: 'scheduled',
      createdAt: new Date()
    };
    
    this.mockAppointments.push(appointment);
    
    return of({ success: true, appointment, available: true }).pipe(delay(800));
  }

  addToWaitlist(slug: string, entry: {
    guestName: string;
    guestEmail: string;
    guestReason: string;
    preferredStart: Date;
    preferredEnd: Date;
  }): Observable<WaitlistEntry> {
    const waitlistEntry: WaitlistEntry = {
      id: `w${Date.now()}`,
      hostUserId: '1',
      guestName: entry.guestName,
      guestEmail: entry.guestEmail,
      guestReason: entry.guestReason,
      preferredStart: entry.preferredStart,
      preferredEnd: entry.preferredEnd,
      status: 'waiting',
      createdAt: new Date()
    };
    
    this.mockWaitlist.push(waitlistEntry);
    return of(waitlistEntry).pipe(delay(500));
  }

  // Appointments
  getAppointments(week?: string): Observable<Appointment[]> {
    return of(this.mockAppointments).pipe(delay(300));
  }

  getAppointment(id: string): Observable<Appointment | undefined> {
    return of(this.mockAppointments.find(a => a.id === id)).pipe(delay(200));
  }

  createAppointment(appointment: Partial<Appointment>): Observable<{ appointment: Appointment; conflict?: Conflict }> {
    const newAppointment: Appointment = {
      id: `apt${Date.now()}`,
      workspaceId: 'ws1',
      hostUserId: this.currentUser.id,
      hostName: this.currentUser.name,
      status: 'scheduled',
      createdAt: new Date(),
      ...appointment
    } as Appointment;
    
    this.mockAppointments.push(newAppointment);
    
    // Check for conflicts
    const conflict = this.checkConflict(newAppointment);
    
    return of({ appointment: newAppointment, conflict }).pipe(delay(400));
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Observable<{ appointment: Appointment; conflict?: Conflict }> {
    const index = this.mockAppointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockAppointments[index] = { ...this.mockAppointments[index], ...updates };
      const conflict = this.checkConflict(this.mockAppointments[index]);
      
      // Check waitlist if slot was freed
      if (updates.status === 'cancelled') {
        this.checkWaitlistForSlot(this.mockAppointments[index]);
      }
      
      return of({ appointment: this.mockAppointments[index], conflict }).pipe(delay(400));
    }
    throw new Error('Appointment not found');
  }

  deleteAppointment(id: string): Observable<{ success: boolean; waitlistBooked?: string }> {
    const index = this.mockAppointments.findIndex(a => a.id === id);
    if (index !== -1) {
      const deleted = this.mockAppointments[index];
      this.mockAppointments.splice(index, 1);
      
      // Check waitlist
      const bookedGuest = this.checkWaitlistForSlot(deleted);
      
      return of({ success: true, waitlistBooked: bookedGuest }).pipe(delay(400));
    }
    return of({ success: false }).pipe(delay(400));
  }

  saveTranscript(appointmentId: string, content: string): Observable<Transcript> {
    const transcript: Transcript = {
      id: `t${Date.now()}`,
      appointmentId,
      content,
      createdAt: new Date()
    };
    
    // Update appointment with transcript
    const apt = this.mockAppointments.find(a => a.id === appointmentId);
    if (apt) {
      apt.transcript = content;
    }
    
    return of(transcript).pipe(delay(500));
  }

  // Conflict detection
  private checkConflict(appointment: Appointment): Conflict {
    const start = new Date(appointment.startTime);
    const end = new Date(appointment.endTime);
    
    // Check double booking
    const doubleBooked = this.mockAppointments.some(apt => {
      if (apt.id === appointment.id) return false;
      const aptStart = new Date(apt.startTime);
      const aptEnd = new Date(apt.endTime);
      return (start >= aptStart && start < aptEnd) || (end > aptStart && end <= aptEnd);
    });
    
    if (doubleBooked) {
      return {
        conflict: true,
        type: 'double_booking',
        suggestion: 'This slot is already booked. Try the next available slot.'
      };
    }
    
    // Check back-to-back (3+ consecutive meetings)
    const dayAppointments = this.mockAppointments
      .filter(apt => {
        const aptDate = new Date(apt.startTime);
        return aptDate.toDateString() === start.toDateString();
      })
      .sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    
    let consecutiveCount = 1;
    for (let i = 0; i < dayAppointments.length - 1; i++) {
      const current = new Date(dayAppointments[i].endTime);
      const next = new Date(dayAppointments[i + 1].startTime);
      if (current.getTime() === next.getTime()) {
        consecutiveCount++;
        if (consecutiveCount >= 3) {
          return {
            conflict: true,
            type: 'back_to_back',
            suggestion: 'You have 3+ back-to-back meetings. Consider adding buffer time.'
          };
        }
      } else {
        consecutiveCount = 1;
      }
    }
    
    return { conflict: false, type: null, suggestion: '' };
  }

  private checkWaitlistForSlot(freedAppointment: Appointment): string | undefined {
    const freedStart = new Date(freedAppointment.startTime);
    const freedEnd = new Date(freedAppointment.endTime);
    
    // Find matching waitlist entry
    const match = this.mockWaitlist.find(w => {
      if (w.status !== 'waiting') return false;
      const prefStart = new Date(w.preferredStart);
      const prefEnd = new Date(w.preferredEnd);
      return freedStart >= prefStart && freedEnd <= prefEnd;
    });
    
    if (match) {
      // Auto-book
      this.mockAppointments.push({
        id: `apt${Date.now()}`,
        workspaceId: freedAppointment.workspaceId,
        hostUserId: freedAppointment.hostUserId,
        hostName: freedAppointment.hostName,
        guestName: match.guestName,
        guestEmail: match.guestEmail,
        title: 'Meeting',
        reason: match.guestReason,
        startTime: freedAppointment.startTime,
        endTime: freedAppointment.endTime,
        status: 'scheduled',
        createdAt: new Date()
      });
      
      match.status = 'booked';
      return match.guestName;
    }
    
    return undefined;
  }

  // Waitlist
  getWaitlist(): Observable<WaitlistEntry[]> {
    return of(this.mockWaitlist.filter(w => w.status === 'waiting')).pipe(delay(300));
  }

  removeFromWaitlist(id: string): Observable<boolean> {
    const index = this.mockWaitlist.findIndex(w => w.id === id);
    if (index !== -1) {
      this.mockWaitlist.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  // AI endpoints (mocked)
  generateDebrief(appointmentId: string): Observable<AIDebrief> {
    const debrief: AIDebrief = {
      id: `d${Date.now()}`,
      appointmentId,
      summary: 'Discussed Q1 goals and project timeline. Client is interested in enterprise features and wants a follow-up demo.',
      actionItems: [
        'Send enterprise pricing sheet',
        'Schedule technical demo with engineering team',
        'Prepare case study examples',
        'Follow up on integration requirements'
      ],
      suggestedFollowupDate: new Date(2026, 2, 10, 14, 0),
      createdAt: new Date()
    };
    
    return of(debrief).pipe(delay(2000)); // Simulate AI processing
  }

  scoreSlots(slots: TimeSlot[]): Observable<TimeSlot[]> {
    // Mock AI scoring: prefer morning slots, penalize late afternoon
    const scored = slots.map(slot => {
      const hour = new Date(slot.start).getHours();
      let score = 50;
      
      if (hour >= 9 && hour < 12) score = 90; // Morning preference
      else if (hour >= 12 && hour < 14) score = 70; // Early afternoon
      else if (hour >= 14 && hour < 16) score = 60; // Late afternoon
      else score = 40; // End of day
      
      return { ...slot, score };
    });
    
    return of(scored.sort((a, b) => (b.score || 0) - (a.score || 0))).pipe(delay(1000));
  }

  optimizeWeek(week: string): Observable<{
    current: WeekEfficiency;
    optimized: WeekEfficiency;
    changes: Array<{ appointmentId: string; from: Date; to: Date; reason: string }>;
  }> {
    const current: WeekEfficiency = {
      score: 58,
      totalMeetings: 12,
      backToBackCount: 5,
      avgGapMinutes: 15,
      focusTimeHours: 2.5
    };
    
    const optimized: WeekEfficiency = {
      score: 84,
      totalMeetings: 12,
      backToBackCount: 1,
      avgGapMinutes: 45,
      focusTimeHours: 6
    };
    
    const changes = [
      {
        appointmentId: '1',
        from: new Date(2026, 2, 3, 10, 0),
        to: new Date(2026, 2, 3, 14, 0),
        reason: 'Consolidate afternoon meetings'
      },
      {
        appointmentId: '2',
        from: new Date(2026, 2, 3, 14, 0),
        to: new Date(2026, 2, 3, 14, 30),
        reason: 'Create morning focus block'
      }
    ];
    
    return of({ current, optimized, changes }).pipe(delay(2500));
  }

  // Week efficiency calculation
  getWeekEfficiency(week?: string): Observable<WeekEfficiency> {
    const efficiency: WeekEfficiency = {
      score: 74,
      totalMeetings: this.mockAppointments.length,
      backToBackCount: 2,
      avgGapMinutes: 35,
      focusTimeHours: 4.5
    };
    
    return of(efficiency).pipe(delay(300));
  }

  // Helpers
  private generateInviteCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }
}

// Import map for rxjs operators
import { map } from 'rxjs/operators';
