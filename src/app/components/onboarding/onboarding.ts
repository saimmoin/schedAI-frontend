import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule, FormsModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  step = 1;
  totalSteps = 3;

  // Step 1: Account (already done in auth)
  // Step 2: Workspace
  workspaceMode: 'create' | 'join' = 'create';
  workspaceName = '';
  inviteCode = '';

  // Step 3: Calendar sync
  calendarSyncing = false;

  constructor(private router: Router) {}

  nextStep(): void {
    if (this.step < this.totalSteps) {
      this.step++;
    } else {
      this.complete();
    }
  }

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  skip(): void {
    this.router.navigate(['/dashboard']);
  }

  canProceedStep2(): boolean {
    if (this.workspaceMode === 'create') {
      return this.workspaceName.trim().length > 0;
    } else {
      return this.inviteCode.trim().length > 0;
    }
  }

  async syncCalendar(): Promise<void> {
    this.calendarSyncing = true;
    // Mock Google Calendar sync - seed fake appointments
    await new Promise(resolve => setTimeout(resolve, 2000));
    this.calendarSyncing = false;
    this.nextStep();
  }

  complete(): void {
    this.router.navigate(['/dashboard']);
  }
}
