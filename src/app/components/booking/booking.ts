import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { Api, TimeSlot } from '../../core/api';
import { SlotGrid } from '../slot-grid/slot-grid';

@Component({
  selector: 'app-booking',
  imports: [CommonModule, FormsModule, SlotGrid, RouterLink],
  templateUrl: './booking.html',
  styleUrl: './booking.css',
})
export class Booking implements OnInit {
  step = 1;
  
  // Form data
  clientName = '';
  clientEmail = '';
  appointmentType: 'initial' | 'follow-up' | 'emergency' = 'initial';
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
      if (params['date']) {
        this.selectedDate = new Date(params['date']);
        this.step = 2;
        this.loadSlots();
      }
    });
  }

  nextStep(): void {
    if (this.step === 1 && this.clientName && this.clientEmail) {
      this.step = 2;
    } else if (this.step === 2 && this.selectedSlot) {
      this.step = 3;
    }
  }

  prevStep(): void {
    if (this.step > 1) {
      this.step--;
    }
  }

  onDateChange(event: any): void {
    this.selectedDate = new Date(event.target.value);
    this.loadSlots();
  }

  loadSlots(): void {
    if (!this.selectedDate) return;
    
    this.loading = true;
    this.api.getAvailableSlots(this.selectedDate).subscribe(slots => {
      this.availableSlots = slots;
      this.loading = false;
    });
  }

  selectSlot(slot: TimeSlot): void {
    this.selectedSlot = slot;
  }

  async submitBooking(): Promise<void> {
    if (!this.selectedSlot) return;

    this.submitting = true;

    try {
      await this.api.createAppointment({
        clientName: this.clientName,
        clientEmail: this.clientEmail,
        hostId: '1',
        hostName: 'Dr. Sarah Johnson',
        start: this.selectedSlot.start,
        end: this.selectedSlot.end,
        status: 'scheduled',
        type: this.appointmentType,
        notes: this.notes,
        roomUrl: `/meeting/${Date.now()}`
      }).toPromise();

      this.router.navigate(['/dashboard']);
    } catch (error) {
      alert('Failed to book appointment');
    } finally {
      this.submitting = false;
    }
  }
}
