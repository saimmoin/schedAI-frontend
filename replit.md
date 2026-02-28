# SchedAI (code-pulse)

## Overview
An Angular-based appointment scheduling application called **SchedAI**. It provides a full-featured scheduling interface with calendar views, booking management, availability settings, and more.

## Tech Stack
- **Framework**: Angular 20 (standalone components)
- **Language**: TypeScript 5.9
- **Calendar**: FullCalendar 6 (@fullcalendar/angular, daygrid, timegrid, interaction)
- **Styles**: Plain CSS
- **Build**: @angular/build (esbuild-based)

## Project Structure
```
src/
  app/
    components/    - Shared/reusable UI components
    core/          - Services, guards, models
    app.routes.ts  - Route definitions
    app.config.ts  - App configuration
  main.ts          - Entry point
  styles.css       - Global styles
  index.html       - HTML shell
angular.json       - Angular CLI configuration
```

## Routes (Lazy-loaded)
- `/auth` - Authentication (login)
- `/dashboard` - Main dashboard
- `/calendar` - Calendar view
- `/booking` - Booking management
- `/public-booking` - Public booking page
- `/onboarding` - Onboarding flow
- `/availability` - Availability settings
- `/settings` - App settings
- `/optimize` - Schedule optimization
- `/debrief` - Meeting debrief
- `/meeting-room` - Meeting room view

## Replit Configuration
- **Dev server**: `ng serve` on `0.0.0.0:5000`
- **allowedHosts**: `true` (set in angular.json for Replit proxy compatibility)
- **Workflow**: "Start application" → `npm run start` (port 5000, webview)
- **Deployment**: Static site — `npm run build` → `dist/code-pulse/browser`

## Demo Credentials
Any email/password combination works (demo mode).
