import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FullCalendarModule } from '@fullcalendar/angular';
import { CalendarOptions, EventClickArg } from '@fullcalendar/core';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import { Router } from '@angular/router';
import { Api, Appointment } from '../../core/api';

@Component({
  selector: 'app-calendar',
  imports: [CommonModule, FullCalendarModule, RouterLink],
  templateUrl: './calendar.html',
  styleUrl: './calendar.css',
})
export class Calendar implements OnInit {
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
    events: [],
    eventClick: this.handleEventClick.bind(this),
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
        title: apt.clientName,
        start: apt.start,
        end: apt.end,
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
      'cancelled': '#ef4444',
      'no-show': '#f59e0b'
    };
    return colors[status] || '#6b7280';
  }

  handleEventClick(clickInfo: EventClickArg): void {
    const appointment = clickInfo.event.extendedProps['appointment'] as Appointment;
    if (appointment.status === 'completed') {
      this.router.navigate(['/debrief', appointment.id]);
    } else if (appointment.roomUrl) {
      this.router.navigate([appointment.roomUrl]);
    }
  }

  handleDateSelect(selectInfo: any): void {
    this.router.navigate(['/booking'], {
      queryParams: {
        date: selectInfo.startStr
      }
    });
  }
}
