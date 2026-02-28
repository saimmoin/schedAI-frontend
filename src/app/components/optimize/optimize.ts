import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { Api, WeekEfficiency } from '../../core/api';

interface OptimizationChange {
  appointmentId: string;
  from: Date;
  to: Date;
  reason: string;
}

@Component({
  selector: 'app-optimize',
  imports: [CommonModule],
  templateUrl: './optimize.html',
  styleUrl: './optimize.css',
})
export class Optimize {
  analyzing = false;
  currentWeek: WeekEfficiency | null = null;
  optimizedWeek: WeekEfficiency | null = null;
  changes: OptimizationChange[] = [];
  hasResults = false;

  constructor(private api: Api, private router: Router) {}

  runOptimization(): void {
    this.analyzing = true;
    this.hasResults = false;

    this.api.optimizeWeek('2026-03-01').subscribe(result => {
      this.currentWeek = result.current;
      this.optimizedWeek = result.optimized;
      this.changes = result.changes;
      this.hasResults = true;
      this.analyzing = false;
    });
  }

  applyOptimization(): void {
    if (!this.changes.length) return;

    // Apply all changes
    const updates = this.changes.map(change =>
      this.api.updateAppointment(change.appointmentId, {
        startTime: change.to,
        endTime: new Date(change.to.getTime() + 30 * 60000) // 30 min duration
      }).toPromise()
    );

    Promise.all(updates).then(() => {
      alert('Optimization applied! Your schedule has been updated.');
      this.router.navigate(['/calendar']);
    });
  }

  rejectOptimization(): void {
    this.hasResults = false;
    this.currentWeek = null;
    this.optimizedWeek = null;
    this.changes = [];
  }

  getScoreColor(score: number): string {
    if (score >= 80) return '#10b981';
    if (score >= 60) return '#f59e0b';
    return '#ef4444';
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
