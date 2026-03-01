import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { appointmentsApi, aiApi } from '../core/api';
import { format, parseISO, addMinutes } from 'date-fns';
import { Brain, Zap, CheckSquare, Calendar, ArrowRight, Loader2, FileText, Clock } from 'lucide-react';
import { toast } from '../components/shared/Toast';
import { ToastContainer } from '../components/shared/Toast';
import clsx from 'clsx';

interface DebriefResult {
  summary: string;
  action_items: string[];
  suggested_followup_date: string;
}

export default function DebriefPage() {
  const { appointmentId } = useParams<{ appointmentId: string }>();
  const navigate = useNavigate();
  const qc = useQueryClient();

  const [debrief, setDebrief] = useState<DebriefResult | null>(null);
  const [generating, setGenerating] = useState(false);
  const [followupBooked, setFollowupBooked] = useState(false);

  // Load appointment + transcript
  const { data: transcriptData, isLoading } = useQuery({
    queryKey: ['transcript', appointmentId],
    queryFn: () =>
      fetch(`http://127.0.0.1:5000/appointments/${appointmentId}/transcript`, {
        headers: { Authorization: `Bearer ${localStorage.getItem('schedai_token')}` },
      }).then((r) => r.json()),
    enabled: !!appointmentId,
  });

  const bookFollowup = useMutation({
    mutationFn: () => {
      if (!debrief) throw new Error();
      const start = parseISO(debrief.suggested_followup_date);
      const end = addMinutes(start, 30);
      return appointmentsApi.create({
        title: 'Follow-up meeting',
        guest_name: 'TBD',
        guest_email: '',
        reason: 'AI-suggested follow-up from debrief',
        start_time: start.toISOString(),
        end_time: end.toISOString(),
      });
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['appointments'] });
      setFollowupBooked(true);
      toast('Follow-up booked!', 'success');
    },
    onError: () => toast('Failed to book follow-up', 'error'),
  });

  const generateDebrief = async () => {
    if (!appointmentId) return;
    setGenerating(true);
    try {
      const res = await aiApi.debrief(parseInt(appointmentId));
      setDebrief(res.data);
    } catch (err: any) {
      if (err.response?.status === 404) {
        toast('No transcript found. Save a transcript first.', 'warn');
      } else {
        toast('AI debrief failed — check backend connection', 'error');
      }
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10 flex flex-col">
      <ToastContainer />

      {/* Header */}
      <div className="border-b border-bg-border bg-bg-secondary px-8 py-4 flex items-center gap-3 flex-shrink-0">
        <img src="/logo.png" alt="SchedAI" className="w-8 h-8 rounded-xl shadow-glow-sm" />
        <span className="font-display font-bold text-text-primary">AI Debrief</span>
        <span className="text-text-muted text-sm font-mono ml-2">· Meeting #{appointmentId}</span>
      </div>

      <div className="flex-1 p-8 max-w-3xl mx-auto w-full space-y-6 animate-fade-in">
        {/* Transcript preview */}
        {!isLoading && transcriptData && (
          <div className="card p-5">
            <div className="flex items-center gap-2 mb-3">
              <FileText size={16} className="text-text-muted" />
              <h2 className="font-display font-semibold text-text-secondary text-sm">Transcript</h2>
            </div>
            <div className="bg-bg-secondary rounded-xl p-4 max-h-36 overflow-y-auto text-text-secondary text-sm font-body leading-relaxed">
              {transcriptData.content ?? transcriptData.transcript ?? 'No transcript available.'}
            </div>
          </div>
        )}

        {/* Generate button */}
        {!debrief && (
          <div className="card p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-accent-primary bg-opacity-10 border border-accent-primary border-opacity-20 flex items-center justify-center mx-auto">
              <Brain size={28} className={clsx('text-accent-primary', generating && 'animate-pulse-soft')} />
            </div>
            <div>
              <h2 className="font-display font-bold text-xl text-text-primary">Generate AI Debrief</h2>
              <p className="text-text-secondary text-sm font-body mt-1 max-w-sm mx-auto">
                Claude will analyze the transcript and extract a summary, action items, and suggest the ideal follow-up date.
              </p>
            </div>
            <button
              onClick={generateDebrief}
              disabled={generating}
              className="btn-primary flex items-center gap-2 mx-auto"
            >
              {generating ? (
                <><Loader2 size={16} className="animate-spin" />Analyzing with Claude...</>
              ) : (
                <><Zap size={16} />Generate Debrief</>
              )}
            </button>
          </div>
        )}

        {/* Debrief result */}
        {debrief && (
          <div className="space-y-5 animate-slide-up">
            {/* Summary */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent-primary bg-opacity-10 flex items-center justify-center">
                  <Brain size={16} className="text-accent-primary" />
                </div>
                <h3 className="font-display font-semibold text-text-primary">Meeting Summary</h3>
              </div>
              <p className="text-text-secondary font-body leading-relaxed">{debrief.summary}</p>
            </div>

            {/* Action items */}
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent-warn bg-opacity-10 flex items-center justify-center">
                  <CheckSquare size={16} className="text-accent-warn" />
                </div>
                <h3 className="font-display font-semibold text-text-primary">Action Items</h3>
                <span className="badge bg-accent-warn bg-opacity-10 text-accent-warn ml-auto">{debrief.action_items?.length || 0}</span>
              </div>
              <ul className="space-y-2">
                {(debrief.action_items || []).map((item, i) => (
                  <li key={i} className="flex items-start gap-3 py-2 border-b border-bg-border last:border-0">
                    <div className="w-5 h-5 rounded border border-accent-primary border-opacity-30 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <span className="text-accent-primary text-xs font-mono">{i + 1}</span>
                    </div>
                    <span className="text-text-primary text-sm font-body">{item}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Suggested follow-up */}
            {debrief.suggested_followup_date && (
            <div className="card p-6">
              <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-lg bg-accent-secondary bg-opacity-10 flex items-center justify-center">
                  <Calendar size={16} className="text-accent-secondary" />
                </div>
                <h3 className="font-display font-semibold text-text-primary">Suggested Follow-Up</h3>
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-bg-secondary border border-bg-border">
                    <Clock size={14} className="text-accent-secondary" />
                    <span className="text-text-primary font-mono text-sm">
                      {format(parseISO(debrief.suggested_followup_date), 'EEEE, MMMM d · h:mm a')}
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => bookFollowup.mutate()}
                  disabled={bookFollowup.isPending || followupBooked}
                  className={clsx(
                    'flex items-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-display font-semibold transition-all',
                    followupBooked
                      ? 'border-accent-success border-opacity-30 bg-accent-success bg-opacity-10 text-accent-success'
                      : 'btn-primary'
                  )}
                >
                  {bookFollowup.isPending ? <Loader2 size={14} className="animate-spin" /> : <Calendar size={14} />}
                  {followupBooked ? 'Booked!' : 'Book This Slot'}
                </button>
              </div>
            </div>
            )}

            {/* Navigate back */}
            <div className="flex justify-end">
              <button onClick={() => navigate('/calendar')} className="btn-secondary flex items-center gap-2 text-sm">
                Back to Calendar <ArrowRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
