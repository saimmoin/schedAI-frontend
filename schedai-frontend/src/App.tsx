import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthGuard, PublicGuard } from './core/AuthGuard';
import LandingPage from './pages/LandingPage';
import AuthPage from './pages/AuthPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import CalendarPage from './pages/CalendarPage';
import OptimizePage from './pages/OptimizePage';
import AvailabilityPage from './pages/AvailabilityPage';
import SettingsPage from './pages/SettingsPage';
import MeetingRoomPage from './pages/MeetingRoomPage';
import DebriefPage from './pages/DebriefPage';
import PublicBookingPage from './pages/PublicBookingPage';
import AppLayout from './components/shared/AppLayout';

export default function App() {
  return (
    <BrowserRouter>
      <div className="mesh-bg" />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth" element={<PublicGuard><AuthPage /></PublicGuard>} />
        <Route path="/book/:slug" element={<PublicBookingPage />} />

        {/* Protected */}
        <Route path="/onboarding" element={<AuthGuard><OnboardingPage /></AuthGuard>} />
        <Route path="/" element={<AuthGuard><AppLayout /></AuthGuard>}>
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="optimize" element={<OptimizePage />} />
          <Route path="availability" element={<AvailabilityPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
        <Route path="/meeting/:appointmentId" element={<AuthGuard><MeetingRoomPage /></AuthGuard>} />
        <Route path="/debrief/:appointmentId" element={<AuthGuard><DebriefPage /></AuthGuard>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
