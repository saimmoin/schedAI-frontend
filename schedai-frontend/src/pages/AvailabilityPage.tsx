import { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { availabilityApi } from '../core/api';
import { useAuthStore } from '../core/authStore';
import { AvailabilityRule } from '../types';
import { Clock, Copy, Check, Save, Loader2 } from 'lucide-react';
import { toast } from '../components/shared/Toast';
import { ToastContainer } from '../components/shared/Toast';
import clsx from 'clsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
const BUFFERS = [0, 5, 10, 15, 30];

const defaultRules = (): AvailabilityRule[] =>
  DAYS.map((_, i) => ({
    day_of_week: i,
    start_time: '09:00',
    end_time: '17:00',
    buffer_minutes: 10,
    is_bookable: i < 5,
  }));

export default function AvailabilityPage() {
  const { user } = useAuthStore();
  const [rules, setRules] = useState<AvailabilityRule[]>(defaultRules());
  const [copied, setCopied] = useState(false);

  const { data: savedRules, isLoading } = useQuery({
    queryKey: ['availability', user?.id],
    queryFn: () => availabilityApi.get(user!.id).then((r) => r.data),
    enabled: !!user?.id,
  });

  useEffect(() => {
    if (savedRules && savedRules.length > 0) setRules(savedRules);
  }, [savedRules]);

  const saveMutation = useMutation({
    mutationFn: () => availabilityApi.save(rules),
    onSuccess: () => toast('Availability saved!', 'success'),
    onError: () => toast('Failed to save', 'error'),
  });

  const toggleDay = (i: number) => {
    setRules((prev) => prev.map((r, idx) => idx === i ? { ...r, is_bookable: !r.is_bookable } : r));
  };

  const updateRule = (i: number, field: keyof AvailabilityRule, value: any) => {
    setRules((prev) => prev.map((r, idx) => idx === i ? { ...r, [field]: value } : r));
  };

  const bookingLink = `schedai.app/${user?.slug ?? 'yourname'}`;

  const copyLink = async () => {
    await navigator.clipboard.writeText(`https://${bookingLink}`);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast('Booking link copied!', 'success');
  };

  return (
    <div className="p-8 space-y-8 relative z-10 animate-fade-in">
      <ToastContainer />

      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="font-display font-bold text-3xl text-text-primary flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-accent-secondary bg-opacity-10 border border-accent-secondary border-opacity-20 flex items-center justify-center">
              <Clock size={20} className="text-accent-secondary" />
            </div>
            Availability
          </h1>
          <p className="text-text-secondary mt-2 ml-14">Set your working hours and buffer time between meetings</p>
        </div>
        <button
          onClick={() => saveMutation.mutate()}
          disabled={saveMutation.isPending}
          className="btn-primary flex items-center gap-2"
        >
          {saveMutation.isPending ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
          Save Changes
        </button>
      </div>

      {/* Booking link */}
      <div className="card p-5">
        <p className="text-text-secondary text-sm font-body mb-3">Your public booking link</p>
        <div className="flex items-center gap-3">
          <div className="flex-1 flex items-center gap-2 bg-bg-secondary border border-bg-border rounded-xl px-4 py-3">
            <span className="text-text-muted text-sm font-mono">https://</span>
            <span className="text-accent-primary font-mono text-sm font-medium">{bookingLink}</span>
          </div>
          <button onClick={copyLink} className={clsx('flex items-center gap-2 px-4 py-3 rounded-xl border transition-all duration-200 text-sm font-medium', copied ? 'border-accent-success border-opacity-30 bg-accent-success bg-opacity-10 text-accent-success' : 'border-bg-border bg-bg-card text-text-secondary hover:bg-bg-hover')}>
            {copied ? <><Check size={15} />Copied!</> : <><Copy size={15} />Copy</>}
          </button>
        </div>
      </div>

      {/* Day rules */}
      {isLoading ? (
        <div className="space-y-3">
          {DAYS.map((d) => <div key={d} className="card p-4 h-16 animate-pulse" />)}
        </div>
      ) : (
        <div className="card divide-y divide-bg-border overflow-hidden">
          {DAYS.map((day, i) => {
            const rule = rules[i];
            return (
              <div key={day} className={clsx('px-6 py-4 flex items-center gap-4 transition-all duration-200', !rule.is_bookable && 'opacity-50')}>
                {/* Toggle */}
                <button
                  onClick={() => toggleDay(i)}
                  className={clsx(
                    'w-10 h-6 rounded-full transition-all duration-300 flex items-center px-1 flex-shrink-0',
                    rule.is_bookable ? 'bg-accent-primary' : 'bg-bg-border'
                  )}
                >
                  <div className={clsx('w-4 h-4 rounded-full bg-white shadow transition-transform duration-300', rule.is_bookable ? 'translate-x-4' : 'translate-x-0')} />
                </button>

                <span className={clsx('w-24 font-display font-semibold text-sm flex-shrink-0', rule.is_bookable ? 'text-text-primary' : 'text-text-muted')}>
                  {day}
                </span>

                {rule.is_bookable ? (
                  <div className="flex items-center gap-3 flex-1 flex-wrap">
                    <div className="flex items-center gap-2">
                      <label className="text-text-muted text-xs font-mono">from</label>
                      <input
                        type="time"
                        value={rule.start_time}
                        onChange={(e) => updateRule(i, 'start_time', e.target.value)}
                        className="input py-1.5 w-28 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <label className="text-text-muted text-xs font-mono">to</label>
                      <input
                        type="time"
                        value={rule.end_time}
                        onChange={(e) => updateRule(i, 'end_time', e.target.value)}
                        className="input py-1.5 w-28 text-sm"
                      />
                    </div>
                    <div className="flex items-center gap-2 ml-auto">
                      <label className="text-text-muted text-xs font-mono">buffer</label>
                      <select
                        value={rule.buffer_minutes}
                        onChange={(e) => updateRule(i, 'buffer_minutes', parseInt(e.target.value))}
                        className="input py-1.5 w-24 text-sm"
                      >
                        {BUFFERS.map((b) => (
                          <option key={b} value={b}>{b === 0 ? 'None' : `${b} min`}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                ) : (
                  <span className="text-text-muted text-sm font-body italic">Not available for booking</span>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
