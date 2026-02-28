import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg, EventDropArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Router } from '@angular/router';
import { Api, Appointment, Conflict } from '../../core/api';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule, RouterLink],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
  conflict: Conflict | null = null;
  showConflictBanner = false;
  waitlistNotification: string | null = null;

  calendarOptions = signal<CalendarOptions>({
    plugins: [dayGridPlugin, timeGridPlugin, interactionPlugin],
    initialView: 'timeGridWeek',
    headerToolbar: {
      left: 'prev,next today',
      center: 'title',
      right: 'dayGridMonth,timeGridWeek,timeGridDay'
    },
    editable: true,
    selectable: true,
    selectMirror: true,
    dayMaxEvents: true,
    weekends: true,
    slotMinTime: '08:00:00',
    slotMaxTime: '20:00:00',
    slotDuration: '00:30:00',
    events: [],
    eventClick: this.handleEventClick.bind(this),
    eventDrop: this.handleEventDrop.bind(this),
    select: this.handleDateSelect.bind(this)
  });

  constructor(private api: Api, private router: Router) {}

  ngOnInit(): void {
    this.loadAppointments();
  }

  loadAppointments(): void {
    this.api.getAppointments().subscribe(appointments => {
      const events = appointments.map(apt => ({
        id: apt.id,
        title: `${apt.guestName} - ${apt.title}`,
        start: apt.startTime,
        end: apt.endTime,
        backgroundColor: this.getEventColor(apt.status),
        borderColor: this.getEventColor(apt.status),
        extendedProps: {
          appointment: apt
        }
      }));

      this.calendarOptions.update(options => ({
        ...options,
        events: events
      }));
    });
  }

  getEventColor(status: string): string {
    const colors: Record<string, string> = {
      'scheduled': '#3b82f6',
      'completed': '#10b981',
      'cancelled': '#ef4444'
    };
    return colors[status] || '#6b7280';
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const appointment = clickInfo.event.extendedProps['appointment'] as Appointment;
    if (appointment.status === 'completed') {
      this.router.navigate(['/debrief', appointment.id]);
    } else {
      this.router.navigate(['/meeting', appointment.id]);
    }
  }

  handleEventDrop(dropInfo: EventDropArg): void {
    const appointment = dropInfo.event.extendedProps['appointment'] as Appointment;
    const newStart = dropInfo.event.start!;
    const newEnd = dropInfo.event.end!;

    // Update appointment
    this.api.updateAppointment(appointment.id, {
      startTime: newStart,
      endTime: newEnd
    }).subscribe(result => {
      if (result.conflict && result.conflict.conflict) {
        this.conflict = result.conflict;
        this.showConflictBanner = true;
        
        // Revert the event
        dropInfo.revert();
      } else {
        // Check if waitlist was auto-booked
        if (result.appointment) {
          this.loadAppointments();
        }
      }
    });
  }

  handleDateSelect(selectInfo: any): void {
    this.router.navigate(['/booking'], {
      queryParams: {
        start: selectInfo.startStr,
        end: selectInfo.endStr
      }
    });
  }

  deleteAppointment(id: string): void {
    if (confirm('Are you sure you want to delete this appointment?')) {
      this.api.deleteAppointment(id).subscribe(result => {
        if (result.success) {
          this.loadAppointments();
          
          if (result.waitlistBooked) {
            this.waitlistNotification = `${result.waitlistBooked} was auto-booked into this slot`;
            setTimeout(() => {
              this.waitlistNotification = null;
            }, 5000);
          }
        }
      });
    }
  }

  resolveConflict(): void {
    this.showConflictBanner = false;
    this.conflict = null;
  }

  dismissConflict(): void {
    this.showConflictBanner = false;
    this.conflict = null;
  }
}
