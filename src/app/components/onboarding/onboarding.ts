import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-onboarding',
  imports: [CommonModule],
  templateUrl: './onboarding.html',
  styleUrl: './onboarding.css',
})
export class Onboarding {
  step = 1;
  totalSteps = 3;

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

  complete(): void {
    this.router.navigate(['/dashboard']);
  }
}
