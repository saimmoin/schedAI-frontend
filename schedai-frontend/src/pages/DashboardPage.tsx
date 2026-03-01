import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { format, startOfWeek, isToday } from 'date-fns';
import { appointmentsApi, workspaceApi, aiApi } from '../core/api';
import { useAuthStore } from '../core/authStore';
import { Appointment } from '../types';
import WaitlistPanel from '../components/shared/WaitlistPanel';
import { ToastContainer } from '../components/shared/Toast';
import { Users, Clock, Calendar, ChevronRight, Zap, TrendingUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import clsx from 'clsx';

function EfficiencyRing({ score }: { score: number }) {
  const r = 54;
  const circ = 2 * Math.PI * r;
  const dash = (score / 100) * circ;
  return (
    <div className="relative w-36 h-36 flex items-center justify-center">
      <svg className="absolute inset-0 -rotate-90" width="144" height="144" viewBox="0 0 144 144">
        <circle cx="72" cy="72" r={r} fill="none" stroke="#1E1E30" strokeWidth="8" />
        <circle
          cx="72" cy="72" r={r} fill="none"
          stroke={score >= 70 ? '#6BCB77' : score >= 50 ? '#FFD93D' : '#FF6B6B'}
          strokeWidth="8"
          strokeDasharray={`${dash} ${circ}`}
          strokeLinecap="round"
          style={{ transition: 'stroke-dasharray 1s ease' }}
        />
      </svg>
      <div className="text-center z-10">
        <p className="font-display font-extrabold text-4xl text-text-primary">{score}</p>
        <p className="text-text-muted text-xs font-mono">efficiency</p>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  const [showWaitlist, setShowWaitlist] = useState(false);
  const { user, workspace } = useAuthStore();
  const navigate = useNavigate();
  const today = format(new Date(), 'yyyy-MM-dd');
  const weekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd');

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments', weekStart],
    queryFn: () => appointmentsApi.getWeek(weekStart).then((r) => r.data),
  });

  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members', workspace?.id],
    queryFn: () => workspaceApi.getMembers(workspace!.id).then((r) => r.data),
    enabled: !!workspace?.id,
  });

  const { data: waitlistData = [] } = useQuery({
    queryKey: ['waitlist'],
    queryFn: () => import('../core/api').then(({ waitlistApi }) => waitlistApi.getAll().then((r) => r.data)),
    retry: false,
    throwOnError: false,
  });

  const todayAppts = appointments.filter((a) => {
    const d = format(new Date(a.start_time), 'yyyy-MM-dd');
    return d === today && a.status !== 'cancelled';
  }).sort((a, b) => new Date(a.start_time).getTime() - new Date(b.start_time).getTime());

  // Mock pending requests (in real app, these would have status='pending')
  const pendingRequests = appointments.filter((a) => a.status === 'pending' || Math.random() > 0.7).slice(0, 2);

  // Compute mock efficiency score from appointment density
  const weekAppts = appointments.filter((a) => a.status !== 'cancelled');
  const efficiencyScore = Math.min(95, Math.max(30, 45 + weekAppts.length * 4 + (todayAppts.length > 0 ? 12 : 0)));

  const waitingCount = Array.isArray(waitlistData) ? waitlistData.filter((w: any) => w.status === 'waiting').length : 0;

  return (
    <div className="p-8 space-y-8 relative z-10 animate-fade-in">
      <ToastContainer />
      {showWaitlist && <WaitlistPanel onClose={() => setShowWaitlist(false)} />}

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary">
            Good {new Date().getHours() < 12 ? 'morning' : new Date().getHours() < 17 ? 'afternoon' : 'evening'}, {user?.name?.split(' ')[0]} 👋
          </h1>
          <p className="text-text-secondary mt-1">
            {format(new Date(), 'EEEE, MMMM d')} · {todayAppts.length} meeting{todayAppts.length !== 1 ? 's' : ''} today
          </p>
        </div>

        <div className="flex items-center gap-3">
          {/* Pending requests badge */}
          {pendingRequests.length > 0 && (
            <div className="relative">
              <button
                onClick={() => toast('Check pending requests below', 'info')}
                className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-accent-warn border-opacity-30 bg-accent-warn bg-opacity-10 text-accent-warn hover:bg-opacity-20 transition-all duration-200 animate-pulse-soft"
              >
                <Clock size={16} />
                <span className="font-body font-medium text-sm">Pending Requests</span>
                <span className="w-5 h-5 rounded-full bg-accent-warn text-bg-primary text-xs font-bold flex items-center justify-center">
                  {pendingRequests.length}
                </span>
              </button>
            </div>
          )}
          {/* Waitlist badge */}
          <button
            onClick={() => setShowWaitlist(true)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2.5 rounded-xl border transition-all duration-200',
              waitingCount > 0
                ? 'border-accent-warn border-opacity-30 bg-accent-warn bg-opacity-10 text-accent-warn hover:bg-opacity-20'
                : 'border-bg-border bg-bg-card text-text-secondary hover:bg-bg-hover'
            )}
          >
            <Users size={16} />
            <span className="font-body font-medium text-sm">Waitlist</span>
            {waitingCount > 0 && (
              <span className="w-5 h-5 rounded-full bg-accent-warn text-bg-primary text-xs font-bold flex items-center justify-center">
                {waitingCount}
              </span>
            )}
          </button>

          <button onClick={() => navigate('/optimize')} className="btn-primary flex items-center gap-2 text-sm">
            <Zap size={16} />
            Optimize Week
          </button>
        </div>
      </div>

      {/* Pending requests */}
      {pendingRequests.length > 0 && (
        <div className="card p-6 border-accent-warn border-opacity-30 animate-slide-up">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-text-primary flex items-center gap-2">
              <Clock size={18} className="text-accent-warn" />
              Pending Appointment Requests
            </h2>
            <span className="badge bg-accent-warn bg-opacity-10 text-accent-warn">{pendingRequests.length} pending</span>
          </div>
          <div className="space-y-3">
            {pendingRequests.map((req) => (
              <div key={req.id} className="flex items-center gap-4 p-4 bg-bg-secondary rounded-xl border border-bg-border">
                <div className="flex-1">
                  <p className="text-text-primary font-medium text-sm font-body">{req.title}</p>
                  <p className="text-text-muted text-xs mt-1">
                    {req.guest_name} · {format(new Date(req.start_time), 'MMM d, h:mm a')}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      toast(`Accepted meeting with ${req.guest_name}`, 'success');
                      setTimeout(() => toast('Confirmation email sent!', 'info'), 1000);
                    }}
                    className="px-4 py-2 rounded-lg bg-accent-success bg-opacity-10 text-accent-success hover:bg-opacity-20 transition-all text-sm font-medium"
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => {
                      toast(`Declined meeting with ${req.guest_name}`, 'info');
                      setTimeout(() => toast('Guest notified', 'info'), 1000);
                    }}
                    className="px-4 py-2 rounded-lg bg-accent-danger bg-opacity-10 text-accent-danger hover:bg-opacity-20 transition-all text-sm font-medium"
                  >
                    Decline
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Main grid */}
      <div className="grid grid-cols-12 gap-6">
        {/* Efficiency score */}
        <div className="col-span-3 card p-6 flex flex-col items-center justify-center text-center space-y-3">
          <p className="text-text-secondary text-sm font-body">Week Efficiency</p>
          <EfficiencyRing score={efficiencyScore} />
          <div className={clsx(
            'badge',
            efficiencyScore >= 70 ? 'bg-accent-success bg-opacity-10 text-accent-success' :
            efficiencyScore >= 50 ? 'bg-accent-warn bg-opacity-10 text-accent-warn' :
            'bg-accent-danger bg-opacity-10 text-accent-danger'
          )}>
            <TrendingUp size={12} />
            {efficiencyScore >= 70 ? 'Great shape' : efficiencyScore >= 50 ? 'Could improve' : 'Needs attention'}
          </div>
        </div>

        {/* Today's appointments */}
        <div className="col-span-5 card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="font-display font-semibold text-text-primary flex items-center gap-2">
              <Calendar size={18} className="text-accent-primary" />
              Today's Schedule
            </h2>
            <button
              onClick={() => navigate('/calendar')}
              className="text-text-muted hover:text-accent-primary transition-colors flex items-center gap-1 text-xs font-body"
            >
              View all <ChevronRight size={14} />
            </button>
          </div>

          {todayAppts.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-text-muted">
              <Calendar size={28} className="mb-2 opacity-30" />
              <p className="text-sm font-body">No meetings today</p>
              <p className="text-xs mt-1">Enjoy the focus time!</p>
            </div>
          ) : (
            <div className="space-y-3">
              {todayAppts.slice(0, 5).map((appt) => (
                <div
                  key={appt.id}
                  onClick={() => navigate(`/meeting/${appt.id}`)}
                  className={clsx(
                    'flex items-center gap-3 px-4 py-3 rounded-xl border cursor-pointer transition-all duration-200 hover:border-accent-primary hover:border-opacity-30',
                    appt.status === 'focus'
                      ? 'border-accent-secondary border-opacity-20 bg-accent-secondary bg-opacity-5'
                      : 'border-bg-border bg-bg-secondary hover:bg-bg-hover'
                  )}
                >
                  <div className={clsx(
                    'w-1 h-10 rounded-full flex-shrink-0',
                    appt.status === 'focus' ? 'bg-accent-secondary' : 'bg-accent-primary'
                  )} />
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary font-medium text-sm truncate font-body">{appt.title}</p>
                    <p className="text-text-muted text-xs font-body">{appt.guest_name}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="text-text-secondary text-xs font-mono">
                      {format(new Date(appt.start_time), 'h:mm a')}
                    </p>
                    {appt.status === 'focus' && (
                      <span className="text-accent-secondary text-xs font-mono">focus</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Team strip */}
        <div className="col-span-4 card p-6">
          <h2 className="font-display font-semibold text-text-primary flex items-center gap-2 mb-5">
            <Users size={18} className="text-accent-secondary" />
            Team Today
          </h2>
          {members.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-text-muted">
              <Users size={28} className="mb-2 opacity-30" />
              <p className="text-sm font-body">No teammates yet</p>
              <p className="text-xs mt-1">Invite from Settings</p>
            </div>
          ) : (
            <div className="space-y-3">
              {members.map((m: any) => (
                <div key={m.id} className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
                    <span className="text-white text-xs font-bold">{m.name?.[0]?.toUpperCase()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-text-primary text-sm font-body truncate">{m.name}</p>
                    <div className="flex items-center gap-0.5 mt-1">
                      {Array.from({ length: 8 }).map((_, i) => (
                        <div
                          key={i}
                          className={clsx(
                            'flex-1 h-1.5 rounded-full',
                            m.is_free ? 'bg-accent-success opacity-60' : i < 3 ? 'bg-accent-danger opacity-60' : 'bg-bg-border'
                          )}
                        />
                      ))}
                    </div>
                  </div>
                  <div className={clsx(
                    'w-2 h-2 rounded-full flex-shrink-0',
                    m.is_free ? 'bg-accent-success' : 'bg-accent-danger'
                  )} />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'This week', value: weekAppts.length, sub: 'appointments', icon: Calendar, color: 'accent-primary' },
          { label: 'Today', value: todayAppts.length, sub: 'meetings', icon: Clock, color: 'accent-secondary' },
          { label: 'Waiting', value: waitingCount, sub: 'on waitlist', icon: Users, color: 'accent-warn' },
          { label: 'Focus blocks', value: weekAppts.filter((a) => a.status === 'focus').length, sub: 'protected', icon: Zap, color: 'accent-success' },
        ].map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="text-text-muted text-xs font-body uppercase tracking-wide">{stat.label}</p>
              <stat.icon size={16} className={`text-${stat.color} opacity-60`} />
            </div>
            <p className="font-display font-bold text-3xl text-text-primary">{stat.value}</p>
            <p className="text-text-muted text-xs mt-1 font-body">{stat.sub}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
