import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays, addWeeks, subWeeks, parseISO, differenceInMinutes, setHours, setMinutes } from 'date-fns';
import { appointmentsApi, workspaceApi } from '../core/api';
import { Appointment } from '../types';
import { ChevronLeft, ChevronRight, Plus, Zap, AlertTriangle, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { toast } from '../components/shared/Toast';
import { ToastContainer } from '../components/shared/Toast';
import WaitlistPanel from '../components/shared/WaitlistPanel';
import clsx from 'clsx';

const HOURS = Array.from({ length: 13 }, (_, i) => i + 8);
const DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const COLOR_MAP: Record<string, string> = {
  confirmed: 'bg-accent-primary bg-opacity-20 border-accent-primary border-opacity-40 text-accent-primary',
  focus: 'bg-accent-secondary bg-opacity-20 border-accent-secondary border-opacity-40 text-accent-secondary',
  cancelled: 'bg-bg-hover border-bg-border text-text-muted',
};

interface ConflictBanner { type: string; suggestion: string | null; }

function AddModal({ onClose, qc, prefilledDate, prefilledTime }: { onClose: () => void; qc: ReturnType<typeof useQueryClient>; prefilledDate?: string; prefilledTime?: string }) {
  const [title, setTitle] = useState('');
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [reason, setReason] = useState('');
  const [date, setDate] = useState(prefilledDate || format(new Date(), 'yyyy-MM-dd'));
  const [startTime, setStartTime] = useState(prefilledTime || '09:00');
  const [duration, setDuration] = useState('30');
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const start = new Date(`${date}T${startTime}:00`);
      const end = new Date(start.getTime() + parseInt(duration) * 60000);
      console.log('Creating appointment:', { date, startTime, start: start.toISOString(), end: end.toISOString() });
      const res = await appointmentsApi.create({ title, guest_name: guestName, guest_email: guestEmail, reason, start_time: start.toISOString(), end_time: end.toISOString(), type: 'meeting', workspace_id: null });
      console.log('Response:', res.data);
      if (res.data.conflict) {
        toast(`Conflict: ${res.data.type}${res.data.suggestion ? ` → try ${res.data.suggestion}` : ''}`, 'warn');
      } else {
        toast('Appointment created!', 'success');
        await qc.invalidateQueries({ queryKey: ['appointments'] });
        onClose();
      }
    } catch (err) { 
      console.error('Create error:', err);
      toast('Failed to create', 'error'); 
    }
    finally { setLoading(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md card p-6 mx-4 animate-slide-up" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display font-bold text-xl text-text-primary">New Appointment</h2>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary p-1 rounded-lg hover:bg-bg-hover"><X size={18} /></button>
        </div>
        <form onSubmit={submit} className="space-y-4">
          <div><label className="label">Title</label><input className="input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Meeting title" required /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Guest name</label><input className="input" value={guestName} onChange={(e) => setGuestName(e.target.value)} placeholder="Jane Doe" /></div>
            <div><label className="label">Guest email</label><input className="input" type="email" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} placeholder="jane@..." /></div>
          </div>
          <div className="grid grid-cols-3 gap-3">
            <div><label className="label">Date</label><input className="input" type="date" value={date} onChange={(e) => setDate(e.target.value)} required /></div>
            <div><label className="label">Start</label><input className="input" type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} required /></div>
            <div><label className="label">Duration</label><select className="input" value={duration} onChange={(e) => setDuration(e.target.value)}><option value="30">30 min</option><option value="60">60 min</option><option value="90">90 min</option></select></div>
          </div>
          <div><label className="label">Reason</label><textarea className="input resize-none" rows={2} value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Brief reason..." /></div>
          <div className="flex gap-3 pt-1">
            <button type="button" onClick={onClose} className="btn-secondary flex-1">Cancel</button>
            <button type="submit" disabled={loading} className="btn-primary flex-1 flex items-center justify-center gap-2">
              {loading ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Plus size={16} />Create</>}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function CalendarPage() {
  const [weekStart, setWeekStart] = useState(() => {
    const march1 = new Date(2026, 2, 1);
    return startOfWeek(march1, { weekStartsOn: 0 });
  });
  const [dragging, setDragging] = useState<Appointment | null>(null);
  const [conflict, setConflict] = useState<ConflictBanner | null>(null);
  const [showWaitlist, setShowWaitlist] = useState(false);
  const [showAdd, setShowAdd] = useState(false);
  const [clickedSlot, setClickedSlot] = useState<{ date: string; time: string } | null>(null);
  const navigate = useNavigate();
  const qc = useQueryClient();
  const weekKey = format(weekStart, 'yyyy-MM-dd');

  const { data: appointments = [], refetch } = useQuery<Appointment[]>({
    queryKey: ['appointments', weekKey],
    queryFn: () => {
      console.log('Fetching appointments for week:', weekKey);
      return appointmentsApi.getWeek(weekKey).then((r) => {
        console.log('Appointments received:', r.data);
        return r.data;
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }: { id: number; data: object }) => appointmentsApi.update(id, data),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      if (res.data.conflict) setConflict({ type: res.data.type, suggestion: res.data.suggestion ?? null });
      else if (res.data.waitlist_booked) toast(`${res.data.waitlist_booked} was auto-booked!`, 'success');
    },
    onError: () => toast('Failed to update', 'error'),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: number) => appointmentsApi.delete(id),
    onSuccess: (res) => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      if (res.data?.waitlist_booked) toast(`${res.data.waitlist_booked} auto-booked into freed slot!`, 'success');
      else toast('Appointment deleted', 'info');
    },
  });

  const getStyle = (appt: Appointment) => {
  if (!appt?.start_time || !appt?.end_time) return { top: 0, height: 24 };
  const start = parseISO(appt.start_time);
  const end = parseISO(appt.end_time);
  const top = (start.getHours() + start.getMinutes() / 60 - 8) * 48;
  const height = Math.max((differenceInMinutes(end, start) / 60) * 48, 24);
  return { top, height };
};

  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));

  return (
    <div className="flex flex-col h-screen relative z-10 animate-fade-in">
      <ToastContainer />
      {showWaitlist && <WaitlistPanel onClose={() => setShowWaitlist(false)} />}
      {showAdd && <AddModal onClose={() => { setShowAdd(false); setClickedSlot(null); }} qc={qc} prefilledDate={clickedSlot?.date} prefilledTime={clickedSlot?.time} />}

      {/* Toolbar */}
      <div className="flex items-center justify-between px-8 py-4 border-b border-bg-border bg-bg-secondary flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-display font-bold text-2xl text-text-primary">Calendar</h1>
          <div className="flex items-center gap-1 bg-bg-hover rounded-xl p-1">
            <button onClick={() => setWeekStart(subWeeks(weekStart, 1))} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors"><ChevronLeft size={15} /></button>
            <span className="text-text-secondary text-sm font-mono px-2">{format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d')}</span>
            <button onClick={() => setWeekStart(addWeeks(weekStart, 1))} className="p-1.5 rounded-lg text-text-muted hover:text-text-primary transition-colors"><ChevronRight size={15} /></button>
          </div>
          <button onClick={() => { const march1 = new Date(2026, 2, 1); setWeekStart(startOfWeek(march1, { weekStartsOn: 0 })); }} className="text-xs font-mono text-accent-primary px-2 py-1 rounded-lg bg-accent-primary bg-opacity-10 hover:bg-opacity-20 transition-all">March 1</button>
        </div>
        <div className="flex gap-2">
          <button onClick={async () => {
            try {
              await workspaceApi.seedCalendar();
              toast('Added 15 meetings!', 'success');
              qc.invalidateQueries({ queryKey: ['appointments'] });
            } catch { toast('Failed to seed', 'error'); }
          }} className="btn-secondary text-sm py-2">🌱 Seed Calendar</button>
          <button onClick={() => setShowWaitlist(true)} className="btn-secondary text-sm py-2">Waitlist</button>
          <button onClick={() => navigate('/optimize')} className="btn-secondary text-sm py-2 flex items-center gap-1.5"><Zap size={14} className="text-accent-warn" />Optimize</button>
          <button onClick={() => setShowAdd(true)} className="btn-primary text-sm py-2 flex items-center gap-1.5"><Plus size={14} />New</button>
        </div>
      </div>

      {/* Conflict banner */}
      {conflict && (
        <div className="mx-6 mt-3 flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-danger bg-opacity-10 border border-accent-danger border-opacity-30 animate-slide-up flex-shrink-0">
          <AlertTriangle size={15} className="text-accent-danger" />
          <p className="flex-1 text-sm font-body">
            <span className="text-accent-danger font-semibold">{conflict.type === 'double_booking' ? 'Double booking' : conflict.type === 'back_to_back' ? '3+ back-to-back meetings' : 'Focus clash'}</span>
            {conflict.suggestion && <span className="text-text-secondary ml-2">→ Next free: {conflict.suggestion}</span>}
          </p>
          {conflict.suggestion && <button className="text-xs text-accent-primary font-mono border border-accent-primary border-opacity-30 px-3 py-1.5 rounded-lg hover:bg-accent-primary hover:bg-opacity-10 transition-all">Move there</button>}
          <button onClick={() => setConflict(null)} className="text-text-muted hover:text-text-primary"><X size={13} /></button>
        </div>
      )}

      {/* Grid */}
      <div className="flex-1 overflow-auto">
        <div className="flex" style={{ minWidth: '700px', height: `${48 + HOURS.length * 48}px` }}>
          {/* Time gutter */}
          <div className="w-16 flex-shrink-0 border-r border-bg-border sticky left-0 bg-bg-primary z-10">
            <div className="h-12 border-b border-bg-border" />
            {HOURS.map((h) => (
              <div key={h} className="h-12 border-b border-bg-border flex items-start pt-1 px-2">
                <span className="text-text-muted text-xs font-mono">{h < 12 ? `${h}AM` : h === 12 ? '12PM' : `${h-12}PM`}</span>
              </div>
            ))}
          </div>

          {/* Day columns */}
          {days.map((day, di) => {
            const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
            const dayAppts = appointments.filter((a) =>
  a?.start_time && format(parseISO(a.start_time), 'yyyy-MM-dd') === format(day, 'yyyy-MM-dd') && a.status !== 'cancelled'
);
            return (
              <div key={di} className={clsx('flex-1 border-r border-bg-border relative', isToday && 'bg-accent-primary bg-opacity-[0.02]')}>
                {/* Header */}
                <div className={clsx('h-12 border-b border-bg-border flex flex-col items-center justify-center sticky top-0 z-10', isToday ? 'bg-accent-primary bg-opacity-15' : 'bg-bg-secondary')}>
                  <span className="text-text-muted text-[11px] font-mono">{DAYS[di]}</span>
                  <span className={clsx('font-display font-bold text-sm', isToday ? 'text-accent-primary' : 'text-text-primary')}>{format(day, 'd')}</span>
                </div>

                {/* Hour cells */}
                {HOURS.map((h) => (
                  <div key={h} className="h-12 border-b border-bg-border hover:bg-bg-hover transition-colors cursor-pointer"
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={() => handleDrop(di, h)}
                    onClick={() => {
                      const clickedDate = format(day, 'yyyy-MM-dd');
                      const clickedTime = `${h.toString().padStart(2, '0')}:00`;
                      setClickedSlot({ date: clickedDate, time: clickedTime });
                      setShowAdd(true);
                    }} />
                ))}

                {/* Appointment blocks */}
                {dayAppts.map((appt) => {
                  const { top, height } = getStyle(appt);
                  return (
                    <div
                      key={appt.id}
                      draggable
                      onDragStart={() => setDragging(appt)}
                      style={{ top: top + 48, height, position: 'absolute', left: 3, right: 3, zIndex: 5 }}
                      className={clsx('rounded-lg border px-2 py-1 cursor-grab active:cursor-grabbing overflow-hidden transition-all hover:brightness-125 select-none', COLOR_MAP[appt.status] ?? COLOR_MAP.confirmed)}
                      onClick={(e) => { e.stopPropagation(); navigate(`/meeting/${appt.id}`); }}
                      onContextMenu={(e) => { e.preventDefault(); if (window.confirm('Delete this appointment?')) deleteMutation.mutate(appt.id); }}
                      title="Click to open · Right-click to delete · Drag to reschedule"
                    >
                      <p className="text-xs font-display font-semibold truncate leading-tight">{appt.title}</p>
                      {height > 36 && <p className="text-xs opacity-60 font-mono truncate">{appt.guest_name}</p>}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );

  function handleDrop(di: number, h: number) {
    if (!dragging) return;
    const newDay = addDays(weekStart, di);
    const newStart = setMinutes(setHours(newDay, h), 0);
    const dur = differenceInMinutes(parseISO(dragging.end_time), parseISO(dragging.start_time));
    const newEnd = new Date(newStart.getTime() + dur * 60000);
    updateMutation.mutate({ id: dragging.id, data: { start_time: newStart.toISOString(), end_time: newEnd.toISOString() } });
    setDragging(null);
    setConflict(null);
  }
}
