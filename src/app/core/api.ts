import { Injectable } from '@angular/core';
import { Observable, of, delay } from 'rxjs';

export interface Appointment {
  id: string;
  clientName: string;
  clientEmail: string;
  therapistId: string;
  therapistName: string;
  start: Date;
  end: Date;
  status: 'scheduled' | 'completed' | 'cancelled' | 'no-show';
  type: 'initial' | 'follow-up' | 'emergency';
  notes?: string;
  roomUrl?: string;
}

export interface TimeSlot {
  id: string;
  therapistId: string;
  start: Date;
  end: Date;
  available: boolean;
}

export interface Conflict {
  id: string;
  type: 'double-booking' | 'overlap' | 'outside-hours';
  appointments: string[];
  message: string;
}

export interface WaitlistEntry {
  id: string;
  clientName: string;
  clientEmail: string;
  preferredTimes: string[];
  priority: 'high' | 'medium' | 'low';
  addedDate: Date;
}

@Injectable({
  providedIn: 'root',
})
export class Api {
  // Mock data
  private mockAppointments: Appointment[] = [
    {
      id: '1',
      clientName: 'John Doe',
      clientEmail: 'john@example.com',
      therapistId: '1',
      therapistName: 'Dr. Sarah Johnson',
      start: new Date(2026, 2, 3, 10, 0),
      end: new Date(2026, 2, 3, 11, 0),
      status: 'scheduled',
      type: 'initial',
      roomUrl: '/meeting/abc123'
    },
    {
      id: '2',
      clientName: 'Jane Smith',
      clientEmail: 'jane@example.com',
      therapistId: '1',
      therapistName: 'Dr. Sarah Johnson',
      start: new Date(2026, 2, 3, 14, 0),
      end: new Date(2026, 2, 3, 15, 0),
      status: 'scheduled',
      type: 'follow-up'
    },
    {
      id: '3',
      clientName: 'Bob Wilson',
      clientEmail: 'bob@example.com',
      therapistId: '1',
      therapistName: 'Dr. Sarah Johnson',
      start: new Date(2026, 2, 4, 9, 0),
      end: new Date(2026, 2, 4, 10, 0),
      status: 'completed',
      type: 'follow-up'
    }
  ];

  private mockWaitlist: WaitlistEntry[] = [
    {
      id: '1',
      clientName: 'Alice Brown',
      clientEmail: 'alice@example.com',
      preferredTimes: ['Monday 2pm', 'Wednesday 10am'],
      priority: 'high',
      addedDate: new Date(2026, 2, 1)
    },
    {
      id: '2',
      clientName: 'Charlie Davis',
      clientEmail: 'charlie@example.com',
      preferredTimes: ['Friday afternoon'],
      priority: 'medium',
      addedDate: new Date(2026, 2, 2)
    }
  ];

  getAppointments(): Observable<Appointment[]> {
    return of(this.mockAppointments).pipe(delay(300));
  }

  getAppointment(id: string): Observable<Appointment | undefined> {
    return of(this.mockAppointments.find(a => a.id === id)).pipe(delay(200));
  }

  createAppointment(appointment: Partial<Appointment>): Observable<Appointment> {
    const newAppointment: Appointment = {
      id: Date.now().toString(),
      ...appointment
    } as Appointment;
    this.mockAppointments.push(newAppointment);
    return of(newAppointment).pipe(delay(300));
  }

  updateAppointment(id: string, updates: Partial<Appointment>): Observable<Appointment> {
    const index = this.mockAppointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockAppointments[index] = { ...this.mockAppointments[index], ...updates };
      return of(this.mockAppointments[index]).pipe(delay(300));
    }
    throw new Error('Appointment not found');
  }

  deleteAppointment(id: string): Observable<boolean> {
    const index = this.mockAppointments.findIndex(a => a.id === id);
    if (index !== -1) {
      this.mockAppointments.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  getAvailableSlots(date: Date): Observable<TimeSlot[]> {
    const slots: TimeSlot[] = [];
    const baseDate = new Date(date);
    for (let hour = 9; hour < 17; hour++) {
      slots.push({
        id: `slot-${hour}`,
        therapistId: '1',
        start: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour, 0),
        end: new Date(baseDate.getFullYear(), baseDate.getMonth(), baseDate.getDate(), hour + 1, 0),
        available: Math.random() > 0.3
      });
    }
    return of(slots).pipe(delay(300));
  }

  getConflicts(): Observable<Conflict[]> {
    return of([]).pipe(delay(200));
  }

  getWaitlist(): Observable<WaitlistEntry[]> {
    return of(this.mockWaitlist).pipe(delay(300));
  }

  addToWaitlist(entry: Partial<WaitlistEntry>): Observable<WaitlistEntry> {
    const newEntry: WaitlistEntry = {
      id: Date.now().toString(),
      addedDate: new Date(),
      ...entry
    } as WaitlistEntry;
    this.mockWaitlist.push(newEntry);
    return of(newEntry).pipe(delay(300));
  }

  removeFromWaitlist(id: string): Observable<boolean> {
    const index = this.mockWaitlist.findIndex(w => w.id === id);
    if (index !== -1) {
      this.mockWaitlist.splice(index, 1);
      return of(true).pipe(delay(300));
    }
    return of(false).pipe(delay(300));
  }

  optimizeSchedule(): Observable<{ saved: number; suggestions: string[] }> {
    return of({
      saved: 3,
      suggestions: [
        'Consolidate appointments on Tuesday afternoon',
        'Move 2pm slot to fill morning gap',
        'Batch similar appointment types'
      ]
    }).pipe(delay(1000));
  }
}
