import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TimeSlot } from '../../core/api';

@Component({
  selector: 'app-slot-grid',
  imports: [CommonModule],
  templateUrl: './slot-grid.html',
  styleUrl: './slot-grid.css',
})
export class SlotGrid {
  @Input() slots: TimeSlot[] = [];
  @Input() selectedSlot: TimeSlot | null = null;
  @Output() slotSelected = new EventEmitter<TimeSlot>();

  selectSlot(slot: TimeSlot): void {
    if (slot.available) {
      this.slotSelected.emit(slot);
    }
  }

  isSelected(slot: TimeSlot): boolean {
    return this.selectedSlot?.id === slot.id;
  }

  formatTime(date: Date): string {
    return new Date(date).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  }
}
