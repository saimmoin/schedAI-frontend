import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/auth';

interface DayAvailability {
  day: string;
  enabled: boolean;
  startTime: string;
  endTime: string;
}

@Component({
  selector: 'app-availability',
  imports: [CommonModule, FormsModule],
  templateUrl: './availability.html',
  styleUrl: './availability.css',
})
export class Availability implements OnInit {
  bookingSlug = '';
  bufferMinutes = 10;
  
  days: DayAvailability[] = [
    { day: 'Monday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Tuesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Wednesday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Thursday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Friday', enabled: true, startTime: '09:00', endTime: '17:00' },
    { day: 'Saturday', enabled: false, startTime: '09:00', endTime: '17:00' },
    { day: 'Sunday', enabled: false, startTime: '09:00', endTime: '17:00' }
  ];

  bufferOptions = [
    { value: 0, label: 'No buffer' },
    { value: 5, label: '5 minutes' },
    { value: 10, label: '10 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' }
  ];

  saving = false;
  bookingLink = '';
  copied = false;

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user) {
      // Generate slug from name (e.g., "Dr. Sarah Johnson" -> "sarah-johnson")
      this.bookingSlug = user.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      this.updateBookingLink();
    }
  }

  updateBookingLink(): void {
    this.bookingLink = `${window.location.origin}/book/${this.bookingSlug}`;
  }

  onSlugChange(): void {
    this.updateBookingLink();
  }

  copyLink(): void {
    navigator.clipboard.writeText(this.bookingLink).then(() => {
      this.copied = true;
      setTimeout(() => this.copied = false, 2000);
    });
  }

  saveAvailability(): void {
    this.saving = true;
    // Mock save - in real app would call API
    setTimeout(() => {
      this.saving = false;
      alert('Availability settings saved!');
    }, 1000);
  }
}
