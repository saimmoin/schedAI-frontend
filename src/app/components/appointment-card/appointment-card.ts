import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Appointment } from '../../core/api';

@Component({
  selector: 'app-appointment-card',
  imports: [CommonModule, RouterLink],
  templateUrl: './appointment-card.html',
  styleUrl: './appointment-card.css',
})
export class AppointmentCard {
  @Input() appointment!: Appointment;

  getStatusClass(): string {
    return `status-${this.appointment.status}`;
  }

  getTypeLabel(): string {
    const labels: Record<string, string> = {
      'initial': 'Initial Consultation',
      'follow-up': 'Follow-up',
      'emergency': 'Emergency'
    };
    return labels[this.appointment.type] || this.appointment.type;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }
}
