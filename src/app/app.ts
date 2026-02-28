import { Component } from '@angular/core';
import { RouterOutlet, RouterLink, Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { Auth } from './core/auth';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, CommonModule],
  templateUrl: './app.html',
  styleUrl: './app.css'
})
export class App {
  constructor(public auth: Auth, private router: Router) {}

  logout(): void {
    this.auth.logout();
  }

  isAuthPage(): boolean {
    return this.router.url === '/auth' || this.router.url === '/onboarding';
  }
}
