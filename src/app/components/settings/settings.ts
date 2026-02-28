import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-settings',
  imports: [CommonModule, FormsModule],
  templateUrl: './settings.html',
  styleUrl: './settings.css',
})
export class Settings implements OnInit {
  activeTab = 'profile';
  
  // Profile settings
  name = '';
  email = '';
  timezone = 'America/New_York';
  
  // Availability settings
  workingHours = {
    start: '09:00',
    end: '17:00'
  };
  workingDays = {
    monday: true,
    tuesday: true,
    wednesday: true,
    thursday: true,
    friday: true,
    saturday: false,
    sunday: false
  };
  
  // Notification settings
  notifications = {
    email: true,
    sms: false,
    reminders: true,
    conflicts: true
  };

  saving = false;

  constructor(private auth: Auth) {}

  ngOnInit(): void {
    const user = this.auth.getUser();
    if (user) {
      this.name = user.name;
      this.email = user.email;
      this.timezone = user.timezone;
    }
  }

  setTab(tab: string): void {
    this.activeTab = tab;
  }

  saveSettings(): void {
    this.saving = true;
    setTimeout(() => {
      this.saving = false;
      alert('Settings saved successfully!');
    }, 1000);
  }
}
