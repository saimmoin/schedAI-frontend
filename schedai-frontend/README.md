# SchedAI Frontend

React + Vite + TypeScript + TailwindCSS frontend for SchedAI.

## Setup

```bash
npm install
npm run dev
```

Opens on http://localhost:3000

## Stack
- **React 18** + **Vite**
- **TypeScript**
- **TailwindCSS** (custom dark theme)
- **TanStack Query** — API state management
- **Zustand** — Auth/global state (JWT stored in memory + localStorage)
- **React Router v6** — Client-side routing
- **date-fns** — Date handling
- **Axios** — HTTP client
- **Lucide React** — Icons

## Backend URL
Set in `src/core/api.ts`:
```ts
const BASE_URL = 'http://10.1.1.3:5000';
```

## Pages
| Route | Description |
|-------|-------------|
| `/` | Landing page |
| `/auth` | Login / Register |
| `/onboarding` | 3-step onboarding (account → workspace → seed calendar) |
| `/dashboard` | Efficiency score, today's meetings, team free/busy |
| `/calendar` | Week view with drag-drop reschedule + conflict detection |
| `/optimize` | AI optimization side-by-side before/after |
| `/availability` | Set working hours + buffer + booking link |
| `/settings` | Profile, workspace, email template, waitlist management |
| `/meeting/:id` | Live transcript recording (Web Speech API) |
| `/debrief/:id` | AI debrief — summary, action items, follow-up date |
| `/book/:slug` | **Public** booking page (no auth) |

## Notes
- Drag to reschedule: drag any appointment block to a new slot
- Right-click appointment to delete it
- Waitlist auto-book triggers toast notification
- Web Speech API: Chrome/Edge recommended for transcript recording
- Mock calendar: use the seed endpoint in onboarding for demo data
