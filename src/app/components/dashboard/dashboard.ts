import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { Api, Appointment } from '../../core/api';
import { AppointmentCard } from '../appointment-card/appointment-card';
import { ConflictBanner } from '../conflict-banner/conflict-banner';
import { WaitlistPanel } from '../waitlist-panel/waitlist-panel';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, RouterLink, AppointmentCard, ConflictBanner, WaitlistPanel],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class Dashboard implements OnInit {
  appointments: Appointment[] = [];
  todayAppointments: Appointment[] = [];
  upcomingAppointments: Appointment[] = [];
  loading = true;

  stats = {
    today: 0,
    thisWeek: 0,
    conflicts: 0,
    waitlist: 0
  };

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadDashboard();
  }

  loadDashboard(): void {
    this.api.getAppointments().subscribe(appointments => {
      this.appointments = appointments;
      this.filterAppointments();
      this.calculateStats();
      this.loading = false;
    });
  }

  filterAppointments(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    this.todayAppointments = this.appointments.filter(apt => {
      const aptDate = new Date(apt.start);
      aptDate.setHours(0, 0, 0, 0);
      return aptDate.getTime() === today.getTime() && apt.status === 'scheduled';
    });

    this.upcomingAppointments = this.appointments
      .filter(apt => new Date(apt.start) >= tomorrow && apt.status === 'scheduled')
      .slice(0, 5);
  }

  calculateStats(): void {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const weekFromNow = new Date(today);
    weekFromNow.setDate(weekFromNow.getDate() + 7);

    this.stats.today = this.todayAppointments.length;
    this.stats.thisWeek = this.appointments.filter(apt => {
      const aptDate = new Date(apt.start);
      return aptDate >= today && aptDate < weekFromNow && apt.status === 'scheduled';
    }).length;
  }
}
