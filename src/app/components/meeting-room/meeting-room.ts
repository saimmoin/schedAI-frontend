import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Api, Appointment } from '../../core/api';

@Component({
  selector: 'app-meeting-room',
  imports: [CommonModule],
  templateUrl: './meeting-room.html',
  styleUrl: './meeting-room.css',
})
export class MeetingRoom implements OnInit {
  appointment: Appointment | null = null;
  meetingStarted = false;
  duration = 0;
  private timer: any;

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
      });
    }
  }

  startMeeting(): void {
    this.meetingStarted = true;
    this.timer = setInterval(() => {
      this.duration++;
    }, 1000);
  }

  endMeeting(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    if (this.appointment) {
      this.router.navigate(['/debrief', this.appointment.id]);
    }
  }

  formatDuration(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
