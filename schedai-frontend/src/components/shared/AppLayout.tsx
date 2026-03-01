import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { LayoutDashboard, Calendar, Zap, Clock, Settings, LogOut, Brain } from 'lucide-react';
import { useAuthStore } from '../../core/authStore';
import clsx from 'clsx';

const NAV = [
  { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { to: '/calendar', icon: Calendar, label: 'Calendar' },
  { to: '/optimize', icon: Zap, label: 'Optimize' },
  { to: '/availability', icon: Clock, label: 'Availability' },
  { to: '/settings', icon: Settings, label: 'Settings' },
];

export default function AppLayout() {
  const { user, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/auth');
  };

  return (
    <div className="flex min-h-screen relative z-10">
      {/* Sidebar */}
      <aside className="w-64 flex-shrink-0 flex flex-col border-r border-bg-border bg-bg-secondary">
        {/* Logo */}
        <div className="px-6 py-6 border-b border-bg-border">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SchedAI" className="w-9 h-9 rounded-xl shadow-glow-sm" />
            <span className="font-display font-bold text-xl text-text-primary tracking-tight">
              SchedAI
            </span>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1">
          {NAV.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl transition-all duration-200 group',
                  isActive
                    ? 'bg-accent-primary bg-opacity-15 text-accent-primary'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-hover'
                )
              }
            >
              {({ isActive }) => (
                <>
                  <Icon size={18} className={clsx(isActive ? 'text-accent-primary' : 'text-text-muted group-hover:text-text-secondary')} />
                  <span className="font-body font-medium text-sm">{label}</span>
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* User */}
        <div className="px-3 py-4 border-t border-bg-border">
          <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-bg-hover">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
              <span className="text-white font-display font-bold text-sm">
                {user?.name?.[0]?.toUpperCase() ?? 'U'}
              </span>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-text-primary text-sm font-medium truncate font-body">{user?.name}</p>
              <p className="text-text-muted text-xs truncate font-mono">{user?.slug}</p>
            </div>
            <button
              onClick={handleLogout}
              className="text-text-muted hover:text-accent-danger transition-colors p-1 rounded"
              title="Logout"
            >
              <LogOut size={14} />
            </button>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
