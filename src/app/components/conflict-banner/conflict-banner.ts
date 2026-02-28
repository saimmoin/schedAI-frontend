import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Api, Conflict } from '../../core/api';

@Component({
  selector: 'app-conflict-banner',
  imports: [CommonModule],
  templateUrl: './conflict-banner.html',
  styleUrl: './conflict-banner.css',
})
export class ConflictBanner implements OnInit {
  conflicts: Conflict[] = [];
  dismissed = false;

  constructor(private api: Api) {}

  ngOnInit(): void {
    this.api.getConflicts().subscribe(conflicts => {
      this.conflicts = conflicts;
    });
  }

  dismiss(): void {
    this.dismissed = true;
  }
}
