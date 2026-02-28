import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api, Appointment } from '../../core/api';

@Component({
  selector: 'app-debrief',
  imports: [CommonModule, FormsModule],
  templateUrl: './debrief.html',
  styleUrl: './debrief.css',
})
export class Debrief implements OnInit {
  appointment: Appointment | null = null;
  notes = '';
  sessionRating = 0;
  followUpNeeded = false;
  saving = false;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getAppointment(id).subscribe(apt => {
        this.appointment = apt || null;
        this.notes = apt?.notes || '';
      });
    }
  }

  setRating(rating: number): void {
    this.sessionRating = rating;
  }

  async saveNotes(): Promise<void> {
    if (!this.appointment) return;

    this.saving = true;
    try {
      await this.api.updateAppointment(this.appointment.id, {
        notes: this.notes,
        status: 'completed'
      }).toPromise();

      this.router.navigate(['/dashboard']);
    } catch (error) {
      alert('Failed to save notes');
    } finally {
      this.saving = false;
    }
  }

  cancel(): void {
    this.router.navigate(['/dashboard']);
  }
}
