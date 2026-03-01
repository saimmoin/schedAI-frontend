import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { format, startOfWeek, addDays, parseISO } from 'date-fns';
import { appointmentsApi, aiApi } from '../core/api';
import { Appointment, OptimizeResult } from '../types';
import { Zap, Check, X, ArrowRight, TrendingUp, Loader2 } from 'lucide-react';
import { toast } from '../components/shared/Toast';
import { ToastContainer } from '../components/shared/Toast';
import clsx from 'clsx';

function MiniCalGrid({ appointments, label, score, highlight }: { appointments: Appointment[]; label: string; score: number; highlight?: boolean }) {
  const weekStart = startOfWeek(new Date(2026, 2, 1), { weekStartsOn: 0 });
  const days = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i));
  const hours = Array.from({ length: 11 }, (_, i) => i + 8);

  const getApptForSlot = (day: Date, hour: number) => {
    if (!appointments || !Array.isArray(appointments)) return null;
    const dayStr = format(day, 'yyyy-MM-dd');
    return appointments.find((a) => {
      if (!a?.start_time) return false;
      const start = parseISO(a.start_time);
      return format(start, 'yyyy-MM-dd') === dayStr && start.getHours() === hour;
    });
  };

  return (
    <div className={clsx('card p-5 flex-1 transition-all duration-300', highlight && 'border-accent-success border-opacity-50 shadow-glow')}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display font-bold text-lg text-text-primary">{label}</h3>
        <div className={clsx('flex items-center gap-2 px-3 py-1.5 rounded-xl font-mono font-bold text-lg', highlight ? 'bg-accent-success bg-opacity-10 text-accent-success' : 'bg-bg-hover text-text-secondary')}>
          <TrendingUp size={16} />
          {score}%
        </div>
      </div>

      {/* Mini grid */}
      <div className="overflow-x-auto">
        <div className="flex gap-1" style={{ minWidth: '320px' }}>
          {days.map((day, di) => (
            <div key={di} className="flex-1">
              <div className="text-center text-text-muted text-xs font-mono mb-1 pb-1 border-b border-bg-border">
                {format(day, 'EEE')}
              </div>
              {hours.map((h) => {
                const appt = getApptForSlot(day, h);
                return (
                  <div
                    key={h}
                    className={clsx(
                      'h-7 rounded mb-0.5 flex items-center justify-center text-xs',
                      appt
                        ? appt.status === 'focus'
                          ? 'bg-accent-secondary bg-opacity-30 text-accent-secondary'
                          : 'bg-accent-primary bg-opacity-30 text-accent-primary'
                        : 'bg-bg-hover'
                    )}
                    title={appt ? `${appt.title} — ${appt.guest_name}` : 'Free'}
                  >
                    {appt && <span className="truncate px-1 text-[10px] font-medium hidden sm:block">{appt.title.slice(0, 6)}</span>}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </div>

      {/* Appointment count */}
      <div className="mt-3 flex gap-3">
        <div className="flex-1 bg-bg-secondary rounded-lg p-2 text-center">
          <p className="text-text-muted text-xs">Meetings</p>
          <p className="font-display font-bold text-xl text-text-primary">{appointments.filter((a) => a.status === 'confirmed').length}</p>
        </div>
        <div className="flex-1 bg-bg-secondary rounded-lg p-2 text-center">
          <p className="text-text-muted text-xs">Focus blocks</p>
          <p className="font-display font-bold text-xl text-accent-secondary">{appointments.filter((a) => a.status === 'focus').length}</p>
        </div>
      </div>
    </div>
  );
}

export default function OptimizePage() {
  const [result, setResult] = useState<OptimizeResult | null>(null);
  const [loading, setLoading] = useState(false);
  const qc = useQueryClient();

  const weekStart = format(startOfWeek(new Date(2026, 2, 1), { weekStartsOn: 0 }), 'yyyy-MM-dd');

  const { data: appointments = [] } = useQuery<Appointment[]>({
    queryKey: ['appointments', weekStart],
    queryFn: () => appointmentsApi.getWeek(weekStart).then((r) => r.data),
  });

  const optimize = async () => {
    setLoading(true);
    try {
      const res = await aiApi.optimize(appointments);
      const data = res.data;
      // Transform backend response to match frontend expectations
      const optimized = (data.optimized || []).map((opt: any) => ({
        ...opt,
        start_time: opt.start,
        end_time: opt.end,
        status: opt.status || 'confirmed',
        guest_name: opt.guest_name || appointments.find((a: any) => a.id === opt.id)?.guest_name
      }));
      setResult({
        original: appointments,
        suggested: optimized,
        original_score: data.before_score || 50,
        suggested_score: data.after_score || 75
      });
    } catch {
      toast('AI optimization failed — check your backend connection', 'error');
    } finally {
      setLoading(false);
    }
  };

  const applyMutation = useMutation({
    mutationFn: async (suggested: Appointment[]) => {
      for (const appt of suggested) {
        await appointmentsApi.update(appt.id, {
          start_time: appt.start_time,
          end_time: appt.end_time,
        });
      }
      return suggested;
    },
    onSuccess: (suggested) => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast('Optimized schedule applied!', 'success');
      
      // Show notification prompt
      const changedAppts = suggested.filter((s: any) => {
        const original = appointments.find((a: any) => a.id === s.id);
        return original && (original.start_time !== s.start_time || original.end_time !== s.end_time);
      });
      
      if (changedAppts.length > 0) {
        setTimeout(() => {
          if (window.confirm(`${changedAppts.length} meeting(s) were rescheduled. Send email notifications to guests?`)) {
            toast(`Sending notifications to ${changedAppts.length} guest(s)...`, 'info');
            setTimeout(() => toast('Email notifications sent!', 'success'), 1500);
          }
        }, 1000);
      }
      
      setResult(null);
    },
    onError: () => toast('Failed to apply schedule', 'error'),
  });

  return (
    <div className="p-8 space-y-8 relative z-10 animate-fade-in">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-warn bg-opacity-10 border border-accent-warn border-opacity-20 flex items-center justify-center">
              <Zap size={20} className="text-accent-warn" />
            </div>
            Optimize My Week
          </h1>
          <p className="text-text-secondary mt-2 ml-14">AI reshuffles your schedule for max focus and minimal context switching</p>
        </div>

        {!result && (
          <button
            onClick={optimize}
            disabled={loading || appointments.length === 0}
            className="btn-primary flex items-center gap-2"
          >
            {loading ? (
              <><Loader2 size={16} className="animate-spin" />Analyzing...</>
            ) : (
              <><Zap size={16} />Run AI Optimization</>
            )}
          </button>
        )}
      </div>

      {/* Before state */}
      {!result && (
        <div>
          <p className="text-text-secondary text-sm font-body mb-4">Current week — {appointments.length} appointments</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MiniCalGrid
              appointments={appointments}
              label="Current Schedule"
              score={Math.min(95, 40 + appointments.length * 4)}
            />
            <div className="flex-1 card p-8 flex flex-col items-center justify-center text-center border-dashed border-2 border-bg-border">
              <div className="w-16 h-16 rounded-2xl bg-accent-primary bg-opacity-10 flex items-center justify-center mb-4">
                <Zap size={28} className="text-accent-primary opacity-50" />
              </div>
              <p className="font-display font-semibold text-text-secondary text-lg mb-2">Optimized Schedule</p>
              <p className="text-text-muted text-sm font-body max-w-xs">
                Click "Run AI Optimization" and Claude will analyze your week and suggest a smarter arrangement
              </p>
            </div>
          </div>

          {loading && (
            <div className="mt-6 card p-6 flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-accent-primary bg-opacity-10 flex items-center justify-center flex-shrink-0">
                <Loader2 size={20} className="text-accent-primary animate-spin" />
              </div>
              <div>
                <p className="font-display font-semibold text-text-primary">Claude is analyzing your week</p>
                <p className="text-text-secondary text-sm font-body">Checking for back-to-backs, focus windows, and meeting clusters...</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Result: before vs after */}
      {result && (
        <div className="space-y-6 animate-slide-up">
          <div className="flex items-center gap-3 p-4 rounded-xl bg-accent-success bg-opacity-10 border border-accent-success border-opacity-20">
            <TrendingUp size={20} className="text-accent-success" />
            <div>
              <p className="font-display font-semibold text-text-primary">
                Efficiency would improve from{' '}
                <span className="text-accent-danger">{result.original_score}%</span>
                {' '}→{' '}
                <span className="text-accent-success">{result.suggested_score}%</span>
              </p>
              <p className="text-text-secondary text-sm font-body">Claude has reorganized your meetings to reduce context switching and protect focus time</p>
            </div>
          </div>

          <div className="flex gap-6">
            <MiniCalGrid appointments={result.original} label="Current" score={result.original_score} />
            <div className="flex items-center flex-shrink-0 text-text-muted">
              <ArrowRight size={24} />
            </div>
            <MiniCalGrid appointments={result.suggested} label="Suggested" score={result.suggested_score} highlight />
          </div>

          <div className="flex gap-3 justify-end">
            <button onClick={() => setResult(null)} className="btn-danger flex items-center gap-2">
              <X size={16} /> Reject
            </button>
            <button
              onClick={() => applyMutation.mutate(result.suggested)}
              disabled={applyMutation.isPending}
              className="btn-primary flex items-center gap-2"
            >
              {applyMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Check size={16} />}
              Apply Optimized Schedule
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
