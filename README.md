# SchedAI - AI-Powered Scheduling Assistant

A modern Angular-based application for intelligent appointment scheduling with AI-powered optimization.

## Features

### 🔐 Authentication
- Secure login system with JWT token management
- Auth guard protection for routes
- Mock authentication (accepts any credentials for demo)

### 📊 Dashboard
- Today's appointments overview
- Upcoming appointments list
- Statistics cards (today, this week, conflicts, waitlist)
- Conflict detection banner
- Waitlist panel

### 📅 Calendar
- Full calendar view with FullCalendar integration
- Day, week, and month views
- Interactive appointment management
- Color-coded appointment statuses
- Click to view/edit appointments

### 📝 Booking System
- 3-step booking wizard
- Client information collection
- Date and time slot selection
- Visual slot availability grid
- Booking confirmation

### 🎥 Meeting Room
- Virtual meeting interface
- Session timer
- Mock video grid
- Meeting controls (mute, video, chat, notes)
- End session with automatic debrief redirect

### 📋 Session Debrief
- Post-session notes
- Session rating system
- Follow-up tracking
- Save notes to appointment

### 🤖 Schedule Optimization
- AI-powered schedule analysis
- Efficiency metrics dashboard
- Optimization suggestions
- One-click schedule improvements

### ⚙️ Settings
- Profile management
- Working hours configuration
- Working days selection
- Notification preferences
- Timezone settings

### 🎯 Onboarding
- 3-step welcome flow
- Feature introduction
- Skip option available

## Tech Stack

- **Framework**: Angular 20.3.0
- **Calendar**: FullCalendar 6.1.11
- **Styling**: Custom CSS with modern design
- **State Management**: Angular Signals
- **Routing**: Angular Router with lazy loading
- **HTTP**: Angular HttpClient with JWT interceptor

## Project Structure

```
src/
├── app/
│   ├── components/
│   │   ├── auth/              # Login screen
│   │   ├── dashboard/         # Main dashboard
│   │   ├── calendar/          # Calendar view
│   │   ├── booking/           # Appointment booking
│   │   ├── meeting-room/      # Virtual meeting
│   │   ├── debrief/           # Session notes
│   │   ├── optimize/          # Schedule optimization
│   │   ├── settings/          # User settings
│   │   ├── onboarding/        # Welcome flow
│   │   ├── appointment-card/  # Reusable appointment card
│   │   ├── conflict-banner/   # Conflict alerts
│   │   ├── waitlist-panel/    # Waitlist display
│   │   ├── slot-grid/         # Time slot selector
│   │   └── team-strip/        # Team member list
│   ├── core/
│   │   ├── api.ts             # API service with mock data
│   │   ├── auth.ts            # Authentication service
│   │   ├── auth-guard.ts      # Route guard
│   │   └── jwt-interceptor.ts # HTTP interceptor
│   ├── app.config.ts          # App configuration
│   └── app.routes.ts          # Route definitions
└── styles.css                 # Global styles
```

## Getting Started

### Prerequisites
- Node.js (v18 or higher)
- npm

### Installation

1. Install dependencies:
```bash
npm install
```

2. Start the development server:
```bash
npm start
```

3. Open your browser to `http://localhost:4200`

### Demo Credentials
- Email: any email
- Password: any password

## Available Scripts

- `npm start` - Start development server
- `npm run build` - Build for production
- `npm test` - Run unit tests
- `npm run watch` - Build in watch mode

## Features in Detail

### Mock Data
The application uses mock data for demonstration purposes. All API calls are simulated with RxJS observables and delays to mimic real API behavior.

### Authentication Flow
1. User logs in with any credentials
2. JWT token is stored in localStorage
3. Auth guard protects all routes except /auth
4. Token is automatically added to HTTP requests via interceptor

### Appointment Management
- Create new appointments with client details
- View appointments in calendar or list view
- Join virtual meetings
- Complete sessions and add notes
- Track appointment status (scheduled, completed, cancelled, no-show)

### Schedule Optimization
- Analyzes current schedule
- Identifies gaps and inefficiencies
- Suggests improvements
- Calculates time savings

## Design System

### Colors
- Primary: Blue (#3b82f6)
- Success: Green (#10b981)
- Warning: Yellow (#f59e0b)
- Error: Red (#ef4444)
- Background: Light Gray (#f8fafc)

### Typography
- System fonts for optimal performance
- Clear hierarchy with size and weight
- Accessible contrast ratios

### Components
- Consistent border radius (8-12px)
- Subtle shadows for depth
- Smooth transitions and hover states
- Responsive design

## Future Enhancements

- Real backend API integration
- Video conferencing integration (Zoom, Teams, etc.)
- Email/SMS notifications
- Advanced analytics and reporting
- Multi-therapist support
- Client portal
- Payment processing
- Insurance integration

## License

MIT

## Author

Built with Angular and ❤️
