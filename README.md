# SchedAI - AI-Powered Meeting Scheduler

Hey there! Welcome to SchedAI, an intelligent meeting scheduling platform that uses AI to optimize your calendar, transcribe meetings, and make your life a whole lot easier.

## What We Built

SchedAI is a full-stack application that helps you manage meetings with some pretty cool AI features:
- **Smart Calendar Management** - Book, reschedule, and manage appointments with ease
- **AI-Powered Optimization** - Let AI reorganize your schedule for maximum efficiency
- **Live Meeting Transcription** - Real-time transcription during meetings using Web Speech API
- **AI Debrief** - Get automatic summaries, action items, and follow-up suggestions after meetings
- **Public Booking Pages** - Share your availability with guests who can book time with you
- **Waitlist Management** - Handle appointment requests when you're fully booked
- **n8n Workflow Integration** - Automated workflows for notifications and calendar syncing

## The Journey (And The Struggles)

Okay, so let me be real with you about how this project went down. We had some pretty ambitious plans at the start, and while we got a lot done, there were definitely some bumps along the way.

### The Frontend Saga

We actually built **three different frontends** for this project.

1. **Angular** - This was our initial plan. We were excited to try Angular since none of us had really worked with it before. But here's the thing - when you're on a tight deadline and learning a completely new framework, things get messy fast. After spending way too much time fighting with Angular's learning curve, we made the tough call to pivot.

2. **Vanilla JavaScript (HTML)** - We built a pure HTML/CSS/JS version (you can find it in `schedai.html`). It works, it's functional, but let's be honest - maintaining a large vanilla JS app is not fun. No TypeScript safety, no component architecture, just a lot of DOM manipulation.

3. **React** - This is what we ended up going with for the main frontend (in the `schedai-frontend` folder). We're most comfortable with React, and it gave us the TypeScript safety and component structure we needed to move fast without breaking things. This is the version we'd recommend using.

So yeah, if you're wondering why there are multiple frontend implementations floating around in this repo, now you know. We learned a lot about knowing when to stick with what you know versus trying something new under time pressure.

### The n8n Integration Success

We successfully integrated **n8n** for workflow automation! This was one of our stretch goals, and we're proud to have pulled it off. The n8n integration handles:

- **Automated Email Notifications** - Real email alerts when appointments are booked, rescheduled, or cancelled
- **Calendar Syncing** - Automatic synchronization with external calendar systems
- **Webhook Triggers** - Custom webhooks fire when appointment events occur
- **Workflow Orchestration** - Complex multi-step workflows for appointment management

The n8n blueprint is located in `SchedAI_BE/app/blueprints/n8n.py`, which provides endpoints for triggering workflows and managing automation rules. While we initially thought we wouldn't have time for this feature, we managed to implement a solid foundation that can be extended with custom workflows.

### Other Challenges We Faced

- **Calendar Timezone Hell** - Dealing with UTC conversions, making sure appointments display correctly across timezones, and handling edge cases around daylight saving time was... fun. Not really, but we got through it.

- **AI API Inconsistencies** - We're using both Anthropic's Claude API. It has own quirks, rate limits, and response formats. 

- **Frontend-Backend Sync** - We had a bunch of endpoint mismatches where the frontend expected camelCase but the backend returned snake_case (or vice versa). We ended up making the backend return both formats just to keep things working smoothly.

- **Web Speech API Limitations** - The live transcription feature only works in Chrome-based browsers because that's where the Web Speech API is most reliable. Not ideal, but it's a browser limitation we had to work with.

## Tech Stack

**Backend:**
- Flask (Python web framework)
- PostgreSQL (via Supabase)
- SQLAlchemy (ORM)
- JWT Authentication
- Anthropic Claude API (for AI features)
- Google Gemini API (for optimization)
- n8n (workflow automation)

**Frontend (React):**
- React 18 with TypeScript
- Vite (build tool)
- TailwindCSS (styling)
- date-fns (date handling)
- Lucide React (icons)
- Web Speech API (transcription)

## Getting Started

### Backend Setup

1. Navigate to the backend folder:
```bash
cd SchedAI_BE
```

2. Install dependencies:
```bash
pip install -r requirements.txt
```

3. Set up your `.env` file with:
```
DATABASE_URL=your_postgresql_url
JWT_SECRET=your_jwt_secret
SECRET_KEY=your_flask_secret
ANTHROPIC_API_KEY=your_anthropic_key
GEMINI_API_KEY=your_gemini_key
```

4. Run the Flask app:
```bash
python run.py
```

The backend will start on `http://localhost:5000`

### Frontend Setup (React)

1. Navigate to the frontend folder:
```bash
cd schedai-frontend
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm run dev
```

The frontend will start on `http://localhost:5173`

## Features Breakdown

### Calendar Management
- View your schedule in a weekly format
- Click any time slot to create a new appointment
- Drag and drop to reschedule (coming soon)
- Seed demo data to test the app

### AI Optimization
- Click "Optimize Schedule" to let AI reorganize your meetings
- AI considers meeting priorities, travel time, and your preferences
- Preview changes before applying them
- Get email notifications when schedules are updated

### Meeting Room
- Start a meeting and get live transcription
- Transcripts are saved automatically
- Generate AI debriefs with action items and summaries

### Public Booking
- Share your booking link with guests
- They can see your availability and book time slots
- Waitlist option when you're fully booked
- Automatic conflict detection

### Settings
- Manage your availability rules
- Set working hours and break times
- Customize your booking page
- Invite team members to your workspace

## Known Issues & Limitations

- Google OAuth button is UI-only (not functional yet)
- Live transcription only works in Chrome/Edge browsers
- Calendar starts from March 1, 2026 (demo data)
- n8n workflows require separate n8n instance setup

## What We'd Do Differently

If we had more time (and less stress), here's what we'd change:

1. **Stick with one frontend from the start** - The Angular experiment cost us valuable time
2. **Expand n8n workflows** - Add more pre-built workflow templates
3. **Implement Google OAuth fully** - Complete the OAuth integration for seamless login
4. **Enhanced Google Calendar sync** - Deeper two-way sync with conflict resolution
5. **Better mobile responsiveness** - The UI works on mobile but could be smoother
6. **Add comprehensive testing** - We have some tests but not nearly enough

## The Team

This project was built by:
- **Emaan Arif Khan**
- **Fatima Azfar**
- **Saim Saqib Moin**

We learned a ton, made a bunch of mistakes, and somehow got it all working in the end. If you're reading this and thinking "wow, they really went through it" - yeah, we did. But that's how you learn, right?

## Contributing

If you want to improve SchedAI, feel free to fork the repo and submit a PR. We'd especially love help with:
- Expanding n8n workflow templates
- Completing Google OAuth integration
- Improving the Angular frontend (if you're brave)
- Adding more AI features
- Writing tests

## License
Thanks for checking out SchedAI! We hope you find it useful, and if you run into any issues, feel free to open an issue on GitHub. We'll do our best to help out.

Happy scheduling! 📅✨
