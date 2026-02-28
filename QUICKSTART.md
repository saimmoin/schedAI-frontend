# TherapySync - Quick Start Guide

## 🚀 Get Started in 3 Steps

### 1. Install Dependencies
```bash
npm install
```

### 2. Start Development Server
```bash
npm start
```

### 3. Open Browser
Navigate to: `http://localhost:4200`

## 🔐 Login

Use any credentials to login:
- **Email**: test@example.com (or any email)
- **Password**: password (or any password)

## 🎯 Features to Explore

### 1. Dashboard (`/dashboard`)
- View today's appointments
- Check upcoming sessions
- Monitor waitlist
- See schedule statistics

### 2. Calendar (`/calendar`)
- Switch between Day/Week/Month views
- Click on appointments to view details
- Select time slots to create new appointments
- Color-coded by status

### 3. Book Appointment (`/booking`)
- Step 1: Enter client information
- Step 2: Select date and time slot
- Step 3: Confirm booking

### 4. Virtual Meeting (`/meeting/:id`)
- Start a session
- View session timer
- End session to add notes

### 5. Session Notes (`/debrief/:id`)
- Rate the session (1-5 stars)
- Add detailed notes
- Mark if follow-up needed

### 6. Optimize Schedule (`/optimize`)
- View efficiency metrics
- Run AI analysis
- Get optimization suggestions
- Apply improvements

### 7. Settings (`/settings`)
- Update profile information
- Configure working hours
- Set working days
- Manage notifications

## 📱 Navigation

The sidebar provides quick access to all features:
- Dashboard
- Calendar
- Book Appointment
- Optimize Schedule
- Settings

## 🎨 UI Features

- **Responsive Design**: Works on desktop and mobile
- **Dark Sidebar**: Easy navigation
- **Color-Coded Status**: 
  - Blue: Scheduled
  - Green: Completed
  - Red: Cancelled
  - Yellow: No-show
- **Smooth Animations**: Hover effects and transitions
- **Loading States**: Visual feedback for async operations

## 🔄 Workflow Example

1. **Login** → Use any credentials
2. **Onboarding** → Quick 3-step intro (or skip)
3. **Dashboard** → See overview
4. **Book Appointment** → Create new appointment
5. **Calendar** → View in calendar
6. **Join Meeting** → Click "Join" button
7. **End Session** → Add notes and rating
8. **Optimize** → Analyze and improve schedule

## 📊 Mock Data

The app comes with pre-populated mock data:
- 3 sample appointments
- 2 waitlist entries
- Available time slots
- User profile

## 🛠️ Development Commands

```bash
# Start dev server
npm start

# Build for production
npm run build

# Run tests
npm test

# Watch mode
npm run watch
```

## 🌐 Routes

- `/auth` - Login page
- `/onboarding` - Welcome flow
- `/dashboard` - Main dashboard
- `/calendar` - Calendar view
- `/booking` - Book appointment
- `/meeting/:id` - Virtual meeting room
- `/debrief/:id` - Session notes
- `/optimize` - Schedule optimization
- `/settings` - User settings

## 💡 Tips

1. **Quick Booking**: Click any date in the calendar to start booking
2. **Appointment Details**: Click appointment cards to view details
3. **Logout**: Use the logout button in the sidebar
4. **Navigation**: All routes are protected - login required

## 🎯 What's Next?

This is a fully functional frontend with mock data. To connect to a real backend:

1. Update `src/app/core/api.ts` with real API endpoints
2. Configure environment variables
3. Update auth service for real authentication
4. Add error handling for network requests

## 📝 Notes

- All data is stored in memory (resets on refresh)
- Authentication uses localStorage for demo
- No actual video conferencing (mock interface)
- Optimization suggestions are pre-defined

## 🆘 Troubleshooting

### Port Already in Use
```bash
# Use different port
ng serve --port 4201
```

### Build Errors
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
```

### Browser Not Opening
Manually navigate to `http://localhost:4200`

## 🎉 Enjoy!

You're all set! Explore the features and customize as needed.
