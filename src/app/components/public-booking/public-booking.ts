import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Api, TimeSlot } from '../../core/api';

@Component({
  selector: 'app-public-booking',
  imports: [CommonModule, FormsModule],
  templateUrl: './public-booking.html',
  styleUrl: './public-booking.css',
})
export class PublicBooking implements OnInit {
  slug = '';
  hostName = 'Dr. Sarah Johnson';
  hostPhoto = '👩‍⚕️';
  
  // Booking flow state
  step: 'slots' | 'form' | 'conflict' | 'waitlist' | 'success' = 'slots';
  
  // Available slots
  availableSlots: TimeSlot[] = [];
  selectedSlot: TimeSlot | null = null;
  
  // Form data
  guestName = '';
  guestEmail = '';
  reason = '';
  
  // Conflict handling
  alternativeSlots: TimeSlot[] = [];
  
  // Waitlist
  preferredTimeWindow = '';
  
  loading = false;
  submitting = false;

  constructor(
    private route: ActivatedRoute,
    private api: Api
  ) {}

  ngOnInit(): void {
    this.slug = this.route.snapshot.paramMap.get('slug') || '';
    this.loadSlots();
  }

  loadSlots(): void {
    this.loading = true;
    this.api.getPublicSlots(this.slug).subscribe(slots => {
      this.availableSlots = slots;
      this.loading = false;
    });
  }

  selectSlot(slot: TimeSlot): void {
    if (!slot.available) return;
    this.selectedSlot = slot;
    this.step = 'form';
  }

  async submitBooking(): Promise<void> {
    if (!this.selectedSlot || !this.guestName || !this.guestEmail) return;

    this.submitting = true;

    this.api.publicBook(this.slug, {
      guestName: this.guestName,
      guestEmail: this.guestEmail,
      reason: this.reason,
      slotId: this.selectedSlot.id,
      startTime: this.selectedSlot.start,
      endTime: this.selectedSlot.end
    }).subscribe(result => {
      if (!result.available && result.nextSlots) {
        // Slot was just taken - show alternatives
        this.alternativeSlots = result.nextSlots;
        this.step = 'conflict';
      } else if (result.success) {
        // Success
        this.step = 'success';
      }
      this.submitting = false;
    });
  }

  selectAlternative(slot: TimeSlot): void {
    this.selectedSlot = slot;
    this.step = 'form';
  }

  showWaitlist(): void {
    this.step = 'waitlist';
  }

  async submitWaitlist(): Promise<void> {
    if (!this.guestName || !this.guestEmail || !this.preferredTimeWindow) return;

    this.submitting = true;
    
    // Parse preferred time window (simplified)
    const now = new Date();
    const preferredStart = new Date(now);
    preferredStart.setHours(9, 0, 0, 0);
    const preferredEnd = new Date(now);
    preferredEnd.setHours(17, 0, 0, 0);
    
    this.api.addToWaitlist(this.slug, {
      guestName: this.guestName,
      guestEmail: this.guestEmail,
      guestReason: this.reason,
      preferredStart,
      preferredEnd
    }).subscribe(() => {
      alert('You\'ve been added to the waitlist! We\'ll email you when a slot opens up.');
      this.submitting = false;
      this.step = 'success';
    });
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric'
    });
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }

  groupSlotsByDate(): { date: string; slots: TimeSlot[] }[] {
    const grouped = new Map<string, TimeSlot[]>();
    
    this.availableSlots.forEach(slot => {
      const dateKey = this.formatDate(slot.start);
      if (!grouped.has(dateKey)) {
        grouped.set(dateKey, []);
      }
      grouped.get(dateKey)!.push(slot);
    });
    
    return Array.from(grouped.entries()).map(([date, slots]) => ({ date, slots }));
  }
}
