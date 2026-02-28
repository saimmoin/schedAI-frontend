import { Routes } from '@angular/router';
import { authGuard } from './core/auth-guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    loadComponent: () => import('./components/auth/auth').then(m => m.AuthComponent)
  },
  {
    path: 'onboarding',
    loadComponent: () => import('./components/onboarding/onboarding').then(m => m.Onboarding),
    canActivate: [authGuard]
  },
  {
    path: 'dashboard',
    loadComponent: () => import('./components/dashboard/dashboard').then(m => m.Dashboard),
    canActivate: [authGuard]
  },
  {
    path: 'calendar',
    loadComponent: () => import('./components/calendar/calendar').then(m => m.Calendar),
    canActivate: [authGuard]
  },
  {
    path: 'availability',
    loadComponent: () => import('./components/availability/availability').then(m => m.Availability),
    canActivate: [authGuard]
  },
  {
    path: 'book/:slug',
    loadComponent: () => import('./components/public-booking/public-booking').then(m => m.PublicBooking)
    // NO AUTH GUARD - Public route
  },
  {
    path: 'meeting/:id',
    loadComponent: () => import('./components/meeting-room/meeting-room').then(m => m.MeetingRoom),
    canActivate: [authGuard]
  },
  {
    path: 'debrief/:id',
    loadComponent: () => import('./components/debrief/debrief').then(m => m.Debrief),
    canActivate: [authGuard]
  },
  {
    path: 'optimize',
    loadComponent: () => import('./components/optimize/optimize').then(m => m.Optimize),
    canActivate: [authGuard]
  },
  {
    path: 'settings',
    loadComponent: () => import('./components/settings/settings').then(m => m.Settings),
    canActivate: [authGuard]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
