import { Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';

export interface User {
  id: string;
  email: string;
  name: string;
  timezone: string;
  slug: string;
}

@Injectable({ providedIn: 'root' })
export class Auth {
  private currentUser = signal<User | null>(null);
  private token = signal<string | null>(null);
  private base = 'http://127.0.0.1:5000';

  constructor(private http: HttpClient, private router: Router) {
    const storedToken = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (storedToken && storedUser) {
      this.token.set(storedToken);
      this.currentUser.set(JSON.parse(storedUser));
    }
  }

  login(email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<any>(`${this.base}/auth/login`, { email, password }).subscribe({
        next: (res) => {
          this.token.set(res.token);
          this.currentUser.set(res.user);
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          resolve(true);
        },
        error: () => resolve(false)
      });
    });
  }

  register(name: string, email: string, password: string): Promise<boolean> {
    return new Promise((resolve) => {
      this.http.post<any>(`${this.base}/auth/register`, { name, email, password }).subscribe({
        next: (res) => {
          this.token.set(res.token);
          this.currentUser.set(res.user);
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
          resolve(true);
        },
        error: () => resolve(false)
      });
    });
  }

  logout(): void {
    this.token.set(null);
    this.currentUser.set(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    this.router.navigate(['/auth']);
  }

  isAuthenticated(): boolean { return !!this.token(); }
  getToken(): string | null { return this.token(); }
  getUser(): User | null { return this.currentUser(); }
}