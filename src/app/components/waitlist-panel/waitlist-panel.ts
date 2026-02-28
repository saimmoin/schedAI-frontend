import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api, WaitlistEntry } from '../../core/api';

@Component({
  selector: 'app-waitlist-panel',
  imports: [CommonModule],
  templateUrl: './waitlist-panel.html',
  styleUrl: './waitlist-panel.css',
})
export class WaitlistPanel implements OnInit {
  waitlist: WaitlistEntry[] = [];
  loading = true;

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.loadWaitlist();
  }

  loadWaitlist(): void {
    this.api.getWaitlist().subscribe(entries => {
      this.waitlist = entries;
      this.loading = false;
    });
  }

  getPriorityClass(priority: string): string {
    return `priority-${priority}`;
  }

  formatDate(date: Date): string {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric'
    });
  }
}
