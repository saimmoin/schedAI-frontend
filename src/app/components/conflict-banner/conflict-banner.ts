import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-conflict-banner',
  imports: [CommonModule],
  templateUrl: './conflict-banner.html',
  styleUrl: './conflict-banner.css',
})
export class ConflictBanner {
  // This component is now handled inline in calendar component
  // Keeping for backward compatibility
}
