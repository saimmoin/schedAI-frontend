import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { availabilityApi, workspaceApi } from '../core/api';
import { useAuthStore } from '../core/authStore';
import { toast, ToastContainer } from '../components/shared/Toast';
import { Clock, Users, Link as LinkIcon, Copy, Check } from 'lucide-react';
import clsx from 'clsx';

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export default function SettingsPage() {
  const { user, workspace } = useAuthStore();
  const qc = useQueryClient();
  const [copied, setCopied] = useState(false);
  const [rules, setRules] = useState<any[]>([]);

  const { data: availData } = useQuery({
    queryKey: ['availability', user?.id],
    queryFn: () => availabilityApi.get(user!.id).then((r) => {
      const data = r.data;
      if (data.length > 0) {
        setRules(data);
      } else {
        // Default rules
        setRules(DAYS.map((_, i) => ({
          day_of_week: i,
          start_time: '09:00',
          end_time: '17:00',
          buffer_minutes: 10,
          is_bookable: i < 5
        })));
      }
      return data;
    }),
    enabled: !!user?.id,
  });

  const { data: members = [] } = useQuery({
    queryKey: ['workspace-members', workspace?.id],
    queryFn: () => workspaceApi.getMembers(workspace!.id).then((r) => r.data),
    enabled: !!workspace?.id,
  });

  const saveMutation = useMutation({
    mutationFn: () => availabilityApi.save(rules),
    onSuccess: () => {
      toast('Availability saved!', 'success');
      qc.invalidateQueries({ queryKey: ['availability'] });
    },
    onError: () => toast('Failed to save', 'error'),
  });

  const bookingLink = `${window.location.origin}/book/${user?.slug}`;

  const copyLink = () => {
    navigator.clipboard.writeText(bookingLink);
    setCopied(true);
    toast('Link copied!', 'success');
    setTimeout(() => setCopied(false), 2000);
  };

  const updateRule = (index: number, field: string, value: any) => {
    const newRules = [...rules];
    newRules[index] = { ...newRules[index], [field]: value };
    setRules(newRules);
  };

  return (
    <div className="p-8 space-y-8 relative z-10 animate-fade-in max-w-5xl mx-auto">
      <ToastContainer />

      {/* Header */}
      <div>
        <h1 className="font-display font-bold text-3xl text-text-primary">Settings</h1>
        <p className="text-text-secondary mt-1">Manage your availability and workspace</p>
      </div>

      {/* Booking link */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <LinkIcon size={18} className="text-accent-primary" />
          <h2 className="font-display font-semibold text-text-primary">Your Booking Link</h2>
        </div>
        <p className="text-text-secondary text-sm font-body mb-4">
          Share this link with anyone to let them book time with you
        </p>
        <div className="flex items-center gap-3">
          <div className="flex-1 bg-bg-secondary rounded-xl px-4 py-3 border border-bg-border font-mono text-sm text-text-primary">
            {bookingLink}
          </div>
          <button onClick={copyLink} className="btn-primary flex items-center gap-2">
            {copied ? <Check size={16} /> : <Copy size={16} />}
            {copied ? 'Copied!' : 'Copy'}
          </button>
        </div>
      </div>

      {/* Availability */}
      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Clock size={18} className="text-accent-secondary" />
            <h2 className="font-display font-semibold text-text-primary">Availability Rules</h2>
          </div>
          <button
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
            className="btn-primary text-sm"
          >
            {saveMutation.isPending ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

        <div className="space-y-3">
          {rules.map((rule, i) => (
            <div key={i} className="grid grid-cols-12 gap-3 items-center bg-bg-secondary rounded-xl p-4">
              <div className="col-span-2">
                <p className="text-text-primary font-medium text-sm">{DAYS[rule.day_of_week]}</p>
              </div>
              <div className="col-span-3">
                <input
                  type="time"
                  value={rule.start_time}
                  onChange={(e) => updateRule(i, 'start_time', e.target.value)}
                  className="input text-sm"
                />
              </div>
              <div className="col-span-3">
                <input
                  type="time"
                  value={rule.end_time}
                  onChange={(e) => updateRule(i, 'end_time', e.target.value)}
                  className="input text-sm"
                />
              </div>
              <div className="col-span-2">
                <input
                  type="number"
                  value={rule.buffer_minutes}
                  onChange={(e) => updateRule(i, 'buffer_minutes', parseInt(e.target.value))}
                  min="0"
                  max="60"
                  className="input text-sm"
                  placeholder="Buffer"
                />
              </div>
              <div className="col-span-2 flex justify-end">
                <button
                  onClick={() => updateRule(i, 'is_bookable', !rule.is_bookable)}
                  className={clsx(
                    'w-12 h-6 rounded-full transition-all duration-200 relative',
                    rule.is_bookable ? 'bg-accent-success' : 'bg-bg-border'
                  )}
                >
                  <div className={clsx(
                    'w-4 h-4 rounded-full bg-white absolute top-1 transition-all duration-200',
                    rule.is_bookable ? 'left-7' : 'left-1'
                  )} />
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-4 flex items-center gap-4 text-text-muted text-xs">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-accent-success" />
            <span>Bookable</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-bg-border" />
            <span>Disabled</span>
          </div>
        </div>
      </div>

      {/* Workspace members */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-6">
          <Users size={18} className="text-accent-warn" />
          <h2 className="font-display font-semibold text-text-primary">Workspace Members</h2>
        </div>

        {workspace && (
          <div className="mb-6 p-4 bg-bg-secondary rounded-xl">
            <p className="text-text-muted text-sm mb-2">Invite Code</p>
            <div className="flex items-center gap-3">
              <div className="flex-1 font-mono text-2xl font-bold text-accent-primary tracking-wider">
                {workspace.invite_code || workspace.inviteCode}
              </div>
              <button
                onClick={() => {
                  navigator.clipboard.writeText(workspace.invite_code || workspace.inviteCode);
                  toast('Invite code copied!', 'success');
                }}
                className="btn-secondary text-sm"
              >
                <Copy size={14} />
              </button>
            </div>
          </div>
        )}

        {members.length === 0 ? (
          <div className="text-center py-8 text-text-muted">
            <Users size={32} className="mx-auto mb-2 opacity-30" />
            <p className="text-sm">No team members yet</p>
            <p className="text-xs mt-1">Share your invite code to add teammates</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 p-4 bg-bg-secondary rounded-xl">
                <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-primary to-accent-secondary flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-sm font-bold">{m.name?.[0]?.toUpperCase()}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-text-primary font-medium text-sm truncate">{m.name}</p>
                  <p className="text-text-muted text-xs truncate">{m.email}</p>
                </div>
                <span className={clsx(
                  'badge text-xs',
                  m.role === 'owner' ? 'bg-accent-primary bg-opacity-10 text-accent-primary' : 'bg-bg-hover text-text-muted'
                )}>
                  {m.role}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
