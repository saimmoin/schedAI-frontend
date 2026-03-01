import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api, Appointment, WeekEfficiency, WorkspaceMember, WaitlistEntry } from '../../core/api';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  todayAppointments: Appointment[] = [];
  weekEfficiency: WeekEfficiency | null = null;
  teammates: WorkspaceMember[] = [];
  waitlistCount = 0;
  loading = true;
  showWaitlist = false;
  waitlistEntries: WaitlistEntry[] = [];

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    // Load today's appointments
    this.api.getAppointments().subscribe(appointments => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const tomorrow = new Date(today);
      tomorrow.setDate(tomorrow.getDate() + 1);

      this.todayAppointments = appointments.filter(apt => {
        const aptDate = new Date(apt.startTime);
        aptDate.setHours(0, 0, 0, 0);
        return aptDate.getTime() === today.getTime() && apt.status === 'scheduled';
      }).sort((a, b) => new Date(a.startTime).getTime() - new Date(b.startTime).getTime());
    });

    // Load week efficiency
    this.api.getWeekEfficiency().subscribe(efficiency => {
      this.weekEfficiency = efficiency;
      this.loading = false;
    });

    // Load workspace teammates
    this.api.getWorkspaceMembers('ws1').subscribe(members => {
      this.teammates = members;
    });

    // Load waitlist count
    this.api.getWaitlist().subscribe(entries => {
      this.waitlistCount = entries.length;
      this.waitlistEntries = entries;
    });
  }

  toggleWaitlist(): void {
    this.showWaitlist = !this.showWaitlist;
  }

  formatTime(date: Date | string): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  getEfficiencyColor(score: number): string {
    if (score >= 80) return '#10b981'; // green
    if (score >= 60) return '#f59e0b'; // yellow
    return '#ef4444'; // red
  }

  getFreeBusyColor(status?: string): string {
    return status === 'free' ? '#10b981' : '#9ca3af';
  }

  removeFromWaitlist(id: string): void {
    this.api.removeFromWaitlist(id).subscribe(success => {
      if (success) {
        this.waitlistEntries = this.waitlistEntries.filter(w => w.id !== id);
        this.waitlistCount--;
      }
    });
  }

  formatDate(date: Date | string): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
