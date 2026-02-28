import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { Api, Appointment, AIDebrief } from '../../core/api';

@Component({
  selector: 'app-debrief',
  imports: [CommonModule, FormsModule],
  templateUrl: './debrief.html',
  styleUrl: './debrief.css',
})
export class Debrief implements OnInit {
  appointment: Appointment | null = null;
  debrief: AIDebrief | null = null;
  generating = false;
  hasTranscript = false;

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
        this.hasTranscript = !!(apt?.transcript);
      });
    }
  }

  generateDebrief(): void {
    if (!this.appointment) return;

    this.generating = true;
    this.api.generateDebrief(this.appointment.id).subscribe(debrief => {
      this.debrief = debrief;
      this.generating = false;
    });
  }

  bookFollowUp(): void {
    if (!this.debrief?.suggestedFollowupDate) return;

    const followUpDate = this.debrief.suggestedFollowupDate;
    const endDate = new Date(followUpDate);
    endDate.setMinutes(endDate.getMinutes() + 30);

    this.api.createAppointment({
      guestName: this.appointment!.guestName,
      guestEmail: this.appointment!.guestEmail,
      title: 'Follow-up Meeting',
      reason: 'Follow-up from previous meeting',
      startTime: followUpDate,
      endTime: endDate,
      workspaceId: this.appointment!.workspaceId,
      hostUserId: this.appointment!.hostUserId
    }).subscribe(() => {
      alert('Follow-up meeting booked!');
      this.router.navigate(['/calendar']);
    });
  }

  backToDashboard(): void {
    this.router.navigate(['/dashboard']);
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit'
    });
  }
}
