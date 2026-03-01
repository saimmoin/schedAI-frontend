import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { publicApi } from '../core/api';
import { format, parseISO, addDays, startOfDay } from 'date-fns';
import { Calendar, Clock, User, Mail, FileText, ChevronRight, CheckCircle, Users, Brain, ArrowLeft } from 'lucide-react';
import { ToastContainer, toast } from '../components/shared/Toast';
import clsx from 'clsx';

type Step = 'slots' | 'form' | 'confirm' | 'taken' | 'waitlist' | 'waitlist-confirm';

interface SlotData { start: string; end: string; }

export default function PublicBookingPage() {
  const { slug } = useParams<{ slug: string }>();
  const [step, setStep] = useState<Step>('slots');
  const [selectedSlot, setSelectedSlot] = useState<SlotData | null>(null);
  const [guestName, setGuestName] = useState('');
  const [guestEmail, setGuestEmail] = useState('');
  const [guestReason, setGuestReason] = useState('');
  const [alternativeSlots, setAlternativeSlots] = useState<SlotData[]>([]);
  const [waitlistPrefStart, setWaitlistPrefStart] = useState('');
  const [waitlistPrefEnd, setWaitlistPrefEnd] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const { data: slotsData = [], isLoading } = useQuery<SlotData[]>({
    queryKey: ['public-slots', slug],
    queryFn: () => publicApi.getSlots(slug!).then((r) => {
      // Handle both array and nested object response
      const data = r.data;
      return Array.isArray(data) ? data : (data.slots || []);
    }),
    enabled: !!slug,
  });

  const slots = Array.isArray(slotsData) ? slotsData : [];

  // Group slots by date
  const slotsByDate = slots.reduce<Record<string, SlotData[]>>((acc, slot) => {
    const date = format(parseISO(slot.start), 'yyyy-MM-dd');
    if (!acc[date]) acc[date] = [];
    acc[date].push(slot);
    return acc;
  }, {});

  const submitBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlot) return;
    setSubmitting(true);
    try {
      await publicApi.book(slug!, {
        start_time: selectedSlot.start,
        end_time: selectedSlot.end,
        guest_name: guestName,
        guest_email: guestEmail,
        reason: guestReason,
      });
      setStep('confirm');
    } catch (err: any) {
      const data = err.response?.data;
      if (data?.available === false) {
        setAlternativeSlots(data.next_slots ?? []);
        setStep('taken');
      } else {
        toast('Booking failed. Please try again.', 'error');
      }
    } finally {
      setSubmitting(false);
    }
  };

  const submitWaitlist = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      await publicApi.joinWaitlist(slug!, {
        guest_name: guestName,
        guest_email: guestEmail,
        guest_reason: guestReason,
        preferred_start: waitlistPrefStart,
        preferred_end: waitlistPrefEnd,
      });
      setStep('waitlist-confirm');
    } catch {
      toast('Failed to join waitlist', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10 flex items-start justify-center py-12 px-4">
      <ToastContainer />
      <div className="mesh-bg" />

      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <img src="/logo.png" alt="SchedAI" className="w-8 h-8 rounded-xl shadow-glow-sm" />
            <span className="font-display font-bold text-lg text-text-primary">SchedAI</span>
          </div>
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center mx-auto mb-3 shadow-glow">
            <User size={28} className="text-white" />
          </div>
          <h1 className="font-display font-bold text-2xl text-text-primary">Book a meeting</h1>
          <p className="text-text-muted font-mono text-sm mt-1">with /{slug}</p>
        </div>

        {/* Step: pick a slot */}
        {step === 'slots' && (
          <div className="card p-6 space-y-5">
            <div className="flex items-center gap-2">
              <Calendar size={18} className="text-accent-primary" />
              <h2 className="font-display font-semibold text-text-primary">Choose a time</h2>
              <span className="text-text-muted text-xs font-mono ml-auto">30 min · UTC</span>
            </div>

            {isLoading ? (
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-12 bg-bg-hover rounded-xl animate-pulse" />
                ))}
              </div>
            ) : Object.keys(slotsByDate).length === 0 ? (
              <div className="text-center py-8 text-text-muted space-y-3">
                <Clock size={32} className="mx-auto opacity-30" />
                <p className="font-body text-sm">No available slots in the next 7 days</p>
                <button onClick={() => setStep('waitlist')} className="btn-secondary text-sm flex items-center gap-2 mx-auto">
                  <Users size={16} />Join Waitlist
                </button>
              </div>
            ) : (
              Object.entries(slotsByDate).map(([date, daySlots]) => (
                <div key={date}>
                  <p className="text-text-secondary text-sm font-display font-medium mb-2">
                    {format(parseISO(date), 'EEEE, MMMM d')}
                  </p>
                  <div className="grid grid-cols-3 gap-2">
                    {daySlots.map((slot) => (
                      <button
                        key={slot.start}
                        onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                        className={clsx(
                          'py-2.5 px-3 rounded-xl border text-sm font-mono transition-all duration-200',
                          'border-bg-border bg-bg-secondary text-text-primary hover:border-accent-primary hover:border-opacity-50 hover:bg-accent-primary hover:bg-opacity-10'
                        )}
                      >
                        {format(parseISO(slot.start), 'h:mm a')}
                      </button>
                    ))}
                  </div>
                </div>
              ))
            )}

            {/* Waitlist option */}
            {Object.keys(slotsByDate).length > 0 && (
              <div className="pt-4 border-t border-bg-border text-center">
                <p className="text-text-muted text-sm mb-3">Can't find a time that works?</p>
                <button onClick={() => setStep('waitlist')} className="btn-secondary flex items-center gap-2 mx-auto text-sm">
                  <Users size={16} />Join Waitlist Instead
                </button>
              </div>
            )}
          </div>
        )}

        {/* Step: fill form */}
        {step === 'form' && selectedSlot && (
          <div className="card p-6 space-y-5">
            <button onClick={() => setStep('slots')} className="flex items-center gap-1 text-text-muted hover:text-text-primary text-sm transition-colors">
              <ArrowLeft size={14} /> Back
            </button>

            <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-accent-primary bg-opacity-10 border border-accent-primary border-opacity-20">
              <Calendar size={16} className="text-accent-primary" />
              <div>
                <p className="text-text-primary font-medium text-sm font-display">
                  {format(parseISO(selectedSlot.start), 'EEEE, MMMM d')}
                </p>
                <p className="text-text-secondary text-xs font-mono">
                  {format(parseISO(selectedSlot.start), 'h:mm a')} – {format(parseISO(selectedSlot.end), 'h:mm a')}
                </p>
              </div>
            </div>

            <form onSubmit={submitBooking} className="space-y-4">
              <div>
                <label className="label">Your name</label>
                <input className="input" placeholder="Jane Doe" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Your email</label>
                <input className="input" type="email" placeholder="jane@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
              </div>
              <div>
                <label className="label">Reason for meeting</label>
                <textarea className="input resize-none" rows={3} placeholder="Tell us briefly what you'd like to discuss..." value={guestReason} onChange={(e) => setGuestReason(e.target.value)} required />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><CheckCircle size={16} />Confirm Booking</>}
              </button>
            </form>
          </div>
        )}

        {/* Step: confirmed */}
        {step === 'confirm' && (
          <div className="card p-8 text-center space-y-4 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-accent-success bg-opacity-10 border border-accent-success border-opacity-20 flex items-center justify-center mx-auto">
              <CheckCircle size={28} className="text-accent-success" />
            </div>
            <h2 className="font-display font-bold text-2xl text-text-primary">You're booked!</h2>
            <p className="text-text-secondary font-body">
              A confirmation will be sent to <span className="text-accent-primary font-mono">{guestEmail}</span>
            </p>
            {selectedSlot && (
              <div className="flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-bg-secondary border border-bg-border text-sm font-mono text-text-secondary">
                <Calendar size={14} className="text-accent-primary" />
                {format(parseISO(selectedSlot.start), 'EEEE, MMM d')} · {format(parseISO(selectedSlot.start), 'h:mm a')}
              </div>
            )}
            <p className="text-text-muted text-sm">You'll receive a reminder email the night before. See you then!</p>
          </div>
        )}

        {/* Step: slot just taken */}
        {step === 'taken' && (
          <div className="card p-6 space-y-5 animate-slide-up">
            <div className="text-center space-y-2">
              <div className="w-12 h-12 rounded-xl bg-accent-warn bg-opacity-10 border border-accent-warn border-opacity-20 flex items-center justify-center mx-auto">
                <Clock size={22} className="text-accent-warn" />
              </div>
              <h2 className="font-display font-bold text-xl text-text-primary">This slot was just booked</h2>
              <p className="text-text-secondary text-sm font-body">But we found some alternatives:</p>
            </div>

            {alternativeSlots.length > 0 ? (
              <div className="space-y-2">
                {alternativeSlots.map((slot) => (
                  <button
                    key={slot.start}
                    onClick={() => { setSelectedSlot(slot); setStep('form'); }}
                    className="w-full flex items-center justify-between px-4 py-3 rounded-xl border border-bg-border bg-bg-secondary hover:border-accent-primary hover:border-opacity-40 hover:bg-accent-primary hover:bg-opacity-5 transition-all group"
                  >
                    <span className="text-text-primary text-sm font-mono">
                      {format(parseISO(slot.start), 'EEEE, MMM d · h:mm a')}
                    </span>
                    <ChevronRight size={14} className="text-text-muted group-hover:text-accent-primary transition-colors" />
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-text-muted text-sm text-center font-body">No alternatives available right now.</p>
            )}

            <div className="pt-2 border-t border-bg-border text-center">
              <p className="text-text-secondary text-sm mb-3">None of these work?</p>
              <button onClick={() => setStep('waitlist')} className="btn-secondary flex items-center gap-2 mx-auto text-sm">
                <Users size={16} />Join the Waitlist
              </button>
            </div>
          </div>
        )}

        {/* Step: waitlist form */}
        {step === 'waitlist' && (
          <div className="card p-6 space-y-5 animate-slide-up">
            <button onClick={() => setStep('slots')} className="flex items-center gap-1 text-text-muted hover:text-text-primary text-sm transition-colors">
              <ArrowLeft size={14} />Back
            </button>
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary">Join the Waitlist</h2>
              <p className="text-text-secondary text-sm font-body mt-1">We'll email you the moment a slot opens up</p>
            </div>
            <form onSubmit={submitWaitlist} className="space-y-4">
              <div>
                <label className="label">Your name</label>
                <input className="input" placeholder="Jane Doe" value={guestName} onChange={(e) => setGuestName(e.target.value)} required />
              </div>
              <div>
                <label className="label">Your email</label>
                <input className="input" type="email" placeholder="jane@example.com" value={guestEmail} onChange={(e) => setGuestEmail(e.target.value)} required />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="label">Preferred window — from</label>
                  <input className="input" type="datetime-local" value={waitlistPrefStart} onChange={(e) => setWaitlistPrefStart(e.target.value)} required />
                </div>
                <div>
                  <label className="label">To</label>
                  <input className="input" type="datetime-local" value={waitlistPrefEnd} onChange={(e) => setWaitlistPrefEnd(e.target.value)} required />
                </div>
              </div>
              <div>
                <label className="label">Reason for meeting</label>
                <textarea className="input resize-none" rows={2} value={guestReason} onChange={(e) => setGuestReason(e.target.value)} placeholder="Brief description..." />
              </div>
              <button type="submit" disabled={submitting} className="btn-primary w-full flex items-center justify-center gap-2">
                {submitting ? <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Users size={16} />Join Waitlist</>}
              </button>
            </form>
          </div>
        )}

        {/* Step: waitlist confirmed */}
        {step === 'waitlist-confirm' && (
          <div className="card p-8 text-center space-y-4 animate-slide-up">
            <div className="w-16 h-16 rounded-2xl bg-accent-secondary bg-opacity-10 border border-accent-secondary border-opacity-20 flex items-center justify-center mx-auto">
              <Users size={28} className="text-accent-secondary" />
            </div>
            <h2 className="font-display font-bold text-2xl text-text-primary">You're on the waitlist!</h2>
            <p className="text-text-secondary font-body">
              We'll email <span className="text-accent-primary font-mono">{guestEmail}</span> the moment a slot opens up in your preferred window.
            </p>
            <p className="text-text-muted text-sm font-body">No action needed — sit tight and we'll take care of the rest.</p>
          </div>
        )}
      </div>
    </div>
  );
}
