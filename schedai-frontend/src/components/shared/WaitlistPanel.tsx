import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { waitlistApi, appointmentsApi } from '../../core/api';
import { WaitlistEntry } from '../../types';
import { X, Clock, Mail, UserCheck, Trash2, Calendar } from 'lucide-react';
import { format, parseISO } from 'date-fns';
import { toast } from './Toast';
import clsx from 'clsx';

interface WaitlistPanelProps {
  onClose: () => void;
}

export default function WaitlistPanel({ onClose }: WaitlistPanelProps) {
  const qc = useQueryClient();
  const { data, isLoading } = useQuery({
    queryKey: ['waitlist'],
    queryFn: () => waitlistApi.getAll().then((r) => r.data as WaitlistEntry[]),
  });

  const removeMutation = useMutation({
    mutationFn: (id: number) => waitlistApi.remove(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['waitlist'] });
      toast('Removed from waitlist', 'success');
    },
  });

  const bookMutation = useMutation({
    mutationFn: (entry: WaitlistEntry) =>
      appointmentsApi.create({
        guest_name: entry.guest_name,
        guest_email: entry.guest_email,
        title: `Meeting with ${entry.guest_name}`,
        reason: entry.guest_reason,
        start_time: entry.preferred_start,
        end_time: entry.preferred_end,
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['waitlist'] });
      qc.invalidateQueries({ queryKey: ['appointments'] });
      toast('Guest booked successfully!', 'success');
    },
  });

  const waiting = data?.filter((e) => e.status === 'waiting') ?? [];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-end bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-96 h-full bg-bg-secondary border-l border-bg-border flex flex-col animate-slide-up"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-bg-border flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-lg text-text-primary">Waitlist</h2>
            <p className="text-text-secondary text-sm font-body mt-0.5">
              {waiting.length} people waiting
            </p>
          </div>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary transition-colors p-1 rounded-lg hover:bg-bg-hover">
            <X size={18} />
          </button>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {isLoading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="card p-4 animate-pulse">
                  <div className="h-4 bg-bg-hover rounded w-3/4 mb-2" />
                  <div className="h-3 bg-bg-hover rounded w-1/2" />
                </div>
              ))}
            </div>
          ) : waiting.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-48 text-text-muted">
              <UserCheck size={32} className="mb-3 opacity-30" />
              <p className="font-body text-sm">No one on the waitlist</p>
            </div>
          ) : (
            waiting.map((entry) => (
              <div key={entry.id} className="card p-4 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <p className="font-display font-semibold text-text-primary text-sm">{entry.guest_name}</p>
                    <div className="flex items-center gap-1 mt-0.5">
                      <Mail size={11} className="text-text-muted" />
                      <p className="text-text-muted text-xs font-mono">{entry.guest_email}</p>
                    </div>
                  </div>
                  <span className="badge bg-accent-warn bg-opacity-10 text-accent-warn border border-accent-warn border-opacity-20">
                    waiting
                  </span>
                </div>

                {entry.guest_reason && (
                  <p className="text-text-secondary text-xs font-body italic">"{entry.guest_reason}"</p>
                )}

                <div className="flex items-center gap-1 text-text-muted text-xs">
                  <Clock size={11} />
                  <span className="font-mono">
                    {format(parseISO(entry.preferred_start), 'MMM d, h:mm a')} –{' '}
                    {format(parseISO(entry.preferred_end), 'h:mm a')}
                  </span>
                </div>

                <div className="flex gap-2 pt-1">
                  <button
                    onClick={() => bookMutation.mutate(entry)}
                    disabled={bookMutation.isPending}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 rounded-lg bg-accent-primary bg-opacity-10 border border-accent-primary border-opacity-20 text-accent-primary text-xs font-medium hover:bg-opacity-20 transition-all"
                  >
                    <Calendar size={12} />
                    Book Now
                  </button>
                  <button
                    onClick={() => removeMutation.mutate(entry.id)}
                    disabled={removeMutation.isPending}
                    className="p-1.5 rounded-lg text-text-muted hover:text-accent-danger hover:bg-accent-danger hover:bg-opacity-10 transition-all"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
