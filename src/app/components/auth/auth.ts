import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Auth } from '../../core/auth';

@Component({
  selector: 'app-auth',
  imports: [CommonModule, FormsModule],
  templateUrl: './auth.html',
  styleUrl: './auth.css',
})
export class AuthComponent {
  email = '';
  password = '';
  name = '';
  isSignUp = false;
  loading = false;
  error = '';

  constructor(private authService: Auth, private router: Router) {
    if (this.authService.isAuthenticated()) {
      this.router.navigate(['/dashboard']);
    }
  }

  async onSubmit(): Promise<void> {
    if (!this.email || !this.password) {
      this.error = 'Please enter email and password';
      return;
    }
    if (this.isSignUp && !this.name) {
      this.error = 'Please enter your name';
      return;
    }

    this.loading = true;
    this.error = '';

    try {
      const success = this.isSignUp
        ? await this.authService.register(this.name, this.email, this.password)
        : await this.authService.login(this.email, this.password);

      if (success) {
        this.router.navigate(['/onboarding']);
      } else {
        this.error = this.isSignUp ? 'Registration failed' : 'Invalid credentials';
      }
    } catch (err) {
      this.error = 'Something went wrong. Please try again.';
    } finally {
      this.loading = false;
    }
  }
}