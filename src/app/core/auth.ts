import { Injectable, signal } from '@angular/core';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'therapist' | 'admin';
  timezone: string;
}

@Injectable({
  providedIn: 'root',
})
export class Auth {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);

  constructor(private router: Router) {
    // Load from localStorage on init
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      this.token.set(storedToken);
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Promise<boolean> {
    // Mock login - in real app this would call API
    return new Promise((resolve) => {
      setTimeout(() => {
        const mockUser: User = {
          id: '1',
          email: email,
          name: 'Dr. Sarah Johnson',
          role: 'therapist',
          timezone: 'America/New_York'
        };
        const mockToken = 'mock-jwt-token-' + Date.now();
        
        this.token.set(mockToken);
        this.currentUser.set(mockUser);
        localStorage.setItem('token', mockToken);
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        resolve(true);
      }, 500);
    });
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean {
    return !!this.token();
  }

  getToken(): string | null {
    return this.token();
  }

  getUser(): User | null {
    return this.currentUser();
  }
}
