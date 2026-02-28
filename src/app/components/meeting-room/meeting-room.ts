import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { Api, Appointment } from '../../core/api';

@Component({
  selector: 'app-meeting-room',
  imports: [CommonModule],
  templateUrl: './meeting-room.html',
  styleUrl: './meeting-room.css',
})
export class MeetingRoom implements OnInit {
  appointment: Appointment | null = null;
  meetingStarted = false;
  duration = 0;
  transcript = '';
  recordingSaved = false;
  private timer: any;
  private mediaStream: MediaStream | null = null;
  private recognition: any;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private api: Api
  ) {}

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.api.getAppointment(id).subscribe(apt => {
        this.appointment = apt || null;
      });
    }
    this.initSpeechRecognition();
  }

  private initSpeechRecognition(): void {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      this.recognition = new SpeechRecognition();
      this.recognition.continuous = true;
      this.recognition.interimResults = true;
      this.recognition.lang = 'en-US';

      this.recognition.onresult = (event: any) => {
        let interimTranscript = '';
        let finalTranscript = '';

        for (let i = event.resultIndex; i < event.results.length; ++i) {
          if (event.results[i].isFinal) {
            finalTranscript += event.results[i][0].transcript;
          } else {
            interimTranscript += event.results[i][0].transcript;
          }
        }
        
        if (finalTranscript) {
          this.transcript += (this.transcript ? ' ' : '') + finalTranscript;
        }
      };

      this.recognition.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
      };
    }
  }

  async startMeeting(): Promise<void> {
    try {
      this.mediaStream = await navigator.mediaDevices.getDisplayMedia({
        video: true,
        audio: true
      });

      this.meetingStarted = true;
      this.recordingSaved = false;
      
      if (this.recognition) {
        this.recognition.start();
      }

      this.timer = setInterval(() => {
        this.duration++;
      }, 1000);

      // Handle stream stopping from browser UI
      this.mediaStream.getVideoTracks()[0].onended = () => {
        this.endMeeting();
      };
    } catch (err) {
      console.error('Error starting screen share:', err);
      alert('Screen sharing is required to start the meeting recording.');
    }
  }

  endMeeting(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
    
    if (this.recognition) {
      this.recognition.stop();
    }

    if (this.mediaStream) {
      this.mediaStream.getTracks().forEach(track => track.stop());
      this.mediaStream = null;
    }

    // Save transcript
    if (this.appointment && this.transcript) {
      this.api.saveTranscript(this.appointment.id, this.transcript).subscribe(() => {
        this.recordingSaved = true;
      });
    } else if (this.appointment) {
      this.recordingSaved = true;
    }
  }

  goToDebrief(): void {
    if (this.appointment) {
      this.router.navigate(['/debrief', this.appointment.id]);
    }
  }

  formatDuration(): string {
    const minutes = Math.floor(this.duration / 60);
    const seconds = this.duration % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  }

  ngOnDestroy(): void {
    if (this.timer) {
      clearInterval(this.timer);
    }
  }
}
