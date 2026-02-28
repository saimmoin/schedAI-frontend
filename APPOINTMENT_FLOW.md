# New Appointment Flow Guide

## Quick Start

### From Dashboard:
```
Dashboard → "New Appointment" button → Fill form → Create → See on Calendar
```

### From Calendar:
```
Calendar → "New Appointment" button → Fill form → Create → Appointment appears
```

## Step-by-Step Guide

### Step 1: Access Booking Form
**Two ways to start:**

1. **Dashboard**: Click the blue "New Appointment" button in the header
2. **Calendar**: Click the blue "New Appointment" button in the header

### Step 2: Fill Guest Information
**Required fields:**
- **Guest Name**: Full name of the person you're meeting
  - Example: "Alice Chen"
- **Guest Email**: Their email address
  - Example: "alice@company.com"

### Step 3: Select Date
- Click the date picker
- Choose any date (defaults to today)
- Available slots load automatically

### Step 4: Pick Time Slot
**Slot Grid Display:**
- **Green slots** = Available (click to select)
- **Gray slots** = Unavailable (already booked)
- **Blue slot** = Your selection

**Time slots:**
- 30-minute duration
- 9:00 AM to 5:00 PM
- Displayed in 30-min intervals

### Step 5: Add Meeting Title (Optional)
- Brief description of the meeting
- Examples:
  - "Product Demo"
  - "Strategy Call"
  - "Follow-up Meeting"
  - "Q1 Planning"

### Step 6: Create Appointment
- Click "Create Appointment" button
- System checks for conflicts
- Appointment is saved
- Redirects to calendar

### Step 7: View on Calendar
- Appointment appears immediately
- Shows guest name and title
- Color-coded by status
- Click to join or manage

## Visual Flow

```
┌─────────────────────────────────────────────────────────┐
│                      DASHBOARD                          │
│  ┌─────────────────────────────────────────────────┐   │
│  │  [New Appointment]  [View Calendar]             │   │
│  └─────────────────────────────────────────────────┘   │
│                         ↓                               │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                  NEW APPOINTMENT FORM                   │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Guest Name: [John Doe____________]             │   │
│  │  Guest Email: [john@example.com___]             │   │
│  │  Date: [2026-03-03_____]                        │   │
│  │                                                  │   │
│  │  Select Time Slot:                              │   │
│  │  [9:00] [9:30] [10:00] [10:30] [11:00]         │   │
│  │  [11:30] [12:00] [12:30] [1:00] [1:30]         │   │
│  │  [2:00] [2:30] [3:00] [3:30] [4:00]            │   │
│  │                                                  │   │
│  │  Meeting Title: [Product Demo_____]             │   │
│  │                                                  │   │
│  │  [Cancel]  [Create Appointment]                 │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
                          ↓
┌─────────────────────────────────────────────────────────┐
│                    CALENDAR VIEW                        │
│  ┌─────────────────────────────────────────────────┐   │
│  │  Mon    Tue    Wed    Thu    Fri    Sat   Sun  │   │
│  │  ─────────────────────────────────────────────  │   │
│  │  9:00                                           │   │
│  │  9:30                                           │   │
│  │  10:00  [John Doe - Product Demo]  ← NEW!      │   │
│  │  10:30                                          │   │
│  │  11:00                                          │   │
│  └─────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────┘
```

## Features

### Real-Time Availability
- Slots update based on existing appointments
- Conflict detection prevents double-booking
- Buffer time automatically applied

### Smart Defaults
- Date defaults to today
- Time slots show next 7 days
- Business hours only (9 AM - 5 PM)
- Weekends excluded

### Validation
- Required fields marked with *
- Email format validation
- Slot availability check
- Conflict detection

### User Feedback
- Loading states while fetching slots
- Disabled state for unavailable slots
- Success redirect to calendar
- Error messages if booking fails

## Calendar Features

### View Appointments
- **Week View**: See all appointments for the week
- **Day View**: Focus on single day
- **Month View**: Overview of entire month

### Interact with Appointments
- **Click**: Open meeting room or debrief
- **Drag**: Reschedule (with conflict check)
- **Hover**: See full details

### Color Coding
- **Blue (#3b82f6)**: Scheduled
- **Green (#10b981)**: Completed
- **Red (#ef4444)**: Cancelled

## Example Scenarios

### Scenario 1: Quick Meeting
```
1. Click "New Appointment"
2. Name: "Bob Smith"
3. Email: "bob@company.com"
4. Date: Today
5. Time: Next available slot (e.g., 2:00 PM)
6. Title: "Quick Sync"
7. Create → Done in 30 seconds!
```

### Scenario 2: Scheduled Demo
```
1. Click "New Appointment"
2. Name: "Sarah Johnson"
3. Email: "sarah@prospect.com"
4. Date: Next Tuesday
5. Time: 10:00 AM
6. Title: "Product Demo - Enterprise Plan"
7. Create → Appears on calendar
```

### Scenario 3: Follow-up Meeting
```
1. From debrief screen, click "Book Follow-Up"
2. Pre-filled with guest info
3. Select date and time
4. Create → Linked to previous meeting
```

## Tips

### Best Practices
- ✅ Add descriptive meeting titles
- ✅ Double-check guest email
- ✅ Select appropriate time zones
- ✅ Leave buffer time between meetings

### Keyboard Shortcuts
- `Tab`: Navigate between fields
- `Enter`: Submit form (when valid)
- `Esc`: Cancel and return

### Mobile Usage
- Responsive design works on all devices
- Touch-friendly slot selection
- Optimized for small screens

## Troubleshooting

### "No slots available"
- Try a different date
- Check availability settings
- Verify business hours configured

### "Slot already taken"
- Refresh and try another slot
- System shows 3 alternatives
- Option to join waitlist

### Appointment not showing
- Refresh calendar view
- Check date range
- Verify appointment was created

## Next Steps

After creating an appointment:
1. **View on Calendar** - See it in context
2. **Join Meeting** - When time comes
3. **Record Session** - Capture transcript
4. **Generate Debrief** - AI summary
5. **Book Follow-up** - One-click scheduling

## Support

For issues or questions:
- Check console for errors
- Verify mock API is working
- Ensure dev server is running
- Review browser console logs
