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
    // Mock: Load next 7 days of slots
    const slots: TimeSlot[] = [];
    const today = new Date();
    
    for (let dayOffset = 0; dayOffset < 7; dayOffset++) {
      const date = new Date(today);
      date.setDate(date.getDate() + dayOffset);
      
      // Skip weekends for demo
      if (date.getDay() === 0 || date.getDay() === 6) continue;
      
      // Generate slots for 9am-5pm
      for (let hour = 9; hour < 17; hour++) {
        const start = new Date(date);
        start.setHours(hour, 0, 0, 0);
        const end = new Date(start);
        end.setMinutes(30);
        
        slots.push({
          id: `slot-${dayOffset}-${hour}`,
          hostId: '1',
          start,
          end,
          available: Math.random() > 0.3 // 70% available
        });
      }
    }
    
    this.availableSlots = slots;
    this.loading = false;
  }

  selectSlot(slot: TimeSlot): void {
    if (!slot.available) return;
    this.selectedSlot = slot;
    this.step = 'form';
  }

  async submitBooking(): Promise<void> {
    if (!this.selectedSlot || !this.guestName || !this.guestEmail) return;

    this.submitting = true;

    // Simulate API call with random conflict chance
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const hasConflict = Math.random() < 0.2; // 20% chance of conflict
    
    if (hasConflict) {
      // Slot was just taken - show alternatives
      this.alternativeSlots = this.availableSlots
        .filter(s => s.available && s.id !== this.selectedSlot?.id)
        .slice(0, 3);
      this.step = 'conflict';
    } else {
      // Success
      this.step = 'success';
    }
    
    this.submitting = false;
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
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    alert('You\'ve been added to the waitlist! We\'ll email you when a slot opens up.');
    this.submitting = false;
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
