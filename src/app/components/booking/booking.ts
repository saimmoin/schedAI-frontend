import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Api, TimeSlot } from '../../core/api';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  // Form data
  clientName = '';
  clientEmail = '';
  selectedDate: Date | null = null;
  selectedSlot: TimeSlot | null = null;
  notes = '';

  availableSlots: TimeSlot[] = [];
  loading = false;
  submitting = false;

  constructor(
    private api: Api,
    private router: Router,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    // Check for pre-selected date from query params
    this.route.queryParams.subscribe(params => {
      if (params['start']) {
        this.selectedDate = new Date(params['start']);
        this.loadSlots();
      } else {
        // Default to today
        this.selectedDate = new Date();
        this.loadSlots();
      }
    });
  }

  onDateChange(event: any): void {
    this.selectedDate = new Date(event.target.value);
    this.selectedSlot = null; // Reset selected slot
    this.loadSlots();
  }

  loadSlots(): void {
    if (!this.selectedDate) return;
    
    this.loading = true;
   this.api.getSlots(1, this.selectedDate.toISOString().split('T')[0]).subscribe((slots: TimeSlot[]) => {
      this.availableSlots = slots;
      this.loading = false;
    });
  }

  selectSlot(slot: TimeSlot): void {
    if (slot.available) {
      this.selectedSlot = slot;
    }
  }

  async submitBooking(): Promise<void> {
    if (!this.selectedSlot || !this.clientName || !this.clientEmail) return;

    this.submitting = true;

    try {
      const endTime = new Date(this.selectedSlot.start);
      endTime.setMinutes(endTime.getMinutes() + 30);

      const result = await this.api.createAppointment({
        guest_name: this.clientName,
        guest_email: this.clientEmail,
        title: this.notes || 'Meeting',
        reason: 'Scheduled meeting',
        start_time: this.selectedSlot.start,
        end_time: endTime,
        workspace_id: 1,
        host_user_id: 1
      }).toPromise();

      console.log('Appointment created:', result);
      // Navigate to calendar to see the new appointment
      this.router.navigate(['/calendar']);
    } catch (error) {
      console.error('Failed to create appointment:', error);
      alert('Failed to create appointment');
    } finally {
      this.submitting = false;
    }
  }
}
