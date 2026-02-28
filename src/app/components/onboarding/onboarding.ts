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
  totalSteps = 2;

  // Step 1: Welcome
  // Step 2: Calendar sync
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
