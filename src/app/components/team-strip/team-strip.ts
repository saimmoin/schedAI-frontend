import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

interface TeamMember {
  id: string;
  name: string;
  role: string;
  avatar: string;
  available: boolean;
}

@Component({
  selector: 'app-team-strip',
  imports: [CommonModule],
  templateUrl: './team-strip.html',
  styleUrl: './team-strip.css',
})
export class TeamStrip {
  teamMembers: TeamMember[] = [
    {
      id: '1',
      name: 'Dr. Sarah Johnson',
      role: 'Host',
      avatar: '👩‍⚕️',
      available: true
    },
    {
      id: '2',
      name: 'Dr. Michael Chen',
      role: 'Host',
      avatar: '👨‍⚕️',
      available: true
    },
    {
      id: '3',
      name: 'Dr. Emily Rodriguez',
      role: 'Host',
      avatar: '👩‍⚕️',
      available: false
    }
  ];

  selectedMember: TeamMember | null = this.teamMembers[0];

  selectMember(member: TeamMember): void {
    this.selectedMember = member;
  }
}
