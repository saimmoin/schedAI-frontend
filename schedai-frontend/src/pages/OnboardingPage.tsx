import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Check, Plus, Users, Calendar, ArrowRight, Loader2 } from 'lucide-react';
import { workspaceApi } from '../core/api';
import { useAuthStore } from '../core/authStore';
import { toast } from '../components/shared/Toast';
import { ToastContainer } from '../components/shared/Toast';

const STEPS = ['Account', 'Workspace', 'Calendar'];

export default function OnboardingPage() {
  const [step, setStep] = useState(0);
  const [mode, setMode] = useState<'create' | 'join'>('create');
  const [workspaceName, setWorkspaceName] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [seeded, setSeeded] = useState(false);

  const { user, setWorkspace } = useAuthStore();
  const navigate = useNavigate();

  const handleWorkspace = async () => {
    setLoading(true);
    try {
      let res;
      if (mode === 'create') {
        res = await workspaceApi.create(workspaceName);
      } else {
        res = await workspaceApi.join(inviteCode);
      }
      setWorkspace(res.data.workspace);
      setStep(2);
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Workspace error', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleSeed = async () => {
    setLoading(true);
    try {
      await workspaceApi.seedCalendar();
      setSeeded(true);
      toast('Calendar seeded with demo appointments!', 'success');
    } catch {
      toast('Seeding skipped — you can add appointments manually', 'info');
      setSeeded(true);
    } finally {
      setLoading(false);
    }
  };

  const finish = () => navigate('/dashboard');

  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center px-4">
      <ToastContainer />

      <div className="w-full max-w-lg animate-slide-up">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-xl bg-accent-primary flex items-center justify-center shadow-glow">
              <Brain size={20} className="text-white" />
            </div>
            <span className="font-display font-bold text-2xl text-text-primary">SchedAI</span>
          </div>
          <h1 className="font-display font-bold text-3xl text-text-primary mb-2">
            Let's get you set up
          </h1>
          <p className="text-text-secondary">Under 30 seconds, we promise</p>
        </div>

        {/* Progress */}
        <div className="flex items-center gap-2 mb-8">
          {STEPS.map((s, i) => (
            <div key={s} className="flex items-center gap-2 flex-1">
              <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${i <= step ? 'bg-accent-primary' : 'bg-bg-border'}`} />
              {i === STEPS.length - 1 && (
                <div className={`flex-1 h-1 rounded-full transition-all duration-500 ${step === 2 && seeded ? 'bg-accent-primary' : 'bg-bg-border'}`} />
              )}
            </div>
          ))}
        </div>

        <div className="card p-8">
          {/* Step 0: Account done */}
          {step === 0 && (
            <div className="text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-accent-success bg-opacity-10 border border-accent-success border-opacity-20 flex items-center justify-center mx-auto">
                <Check size={28} className="text-accent-success" />
              </div>
              <div>
                <h2 className="font-display font-bold text-2xl text-text-primary mb-2">
                  Welcome, {user?.name}! 👋
                </h2>
                <p className="text-text-secondary">Your account is ready. Now let's set up your workspace.</p>
              </div>
              <button onClick={() => setStep(1)} className="btn-primary w-full flex items-center justify-center gap-2">
                Continue <ArrowRight size={16} />
              </button>
            </div>
          )}

          {/* Step 1: Workspace */}
          {step === 1 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent-primary bg-opacity-10 flex items-center justify-center">
                  <Users size={20} className="text-accent-primary" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-text-primary">Workspace</h2>
                  <p className="text-text-secondary text-sm">Create new or join existing</p>
                </div>
              </div>

              {/* Toggle */}
              <div className="flex bg-bg-secondary rounded-xl p-1">
                {(['create', 'join'] as const).map((m) => (
                  <button
                    key={m}
                    onClick={() => setMode(m)}
                    className={`flex-1 py-2 rounded-lg text-sm font-semibold transition-all duration-200 font-display ${
                      mode === m ? 'bg-accent-primary text-white shadow-glow-sm' : 'text-text-secondary hover:text-text-primary'
                    }`}
                  >
                    {m === 'create' ? (
                      <span className="flex items-center justify-center gap-1"><Plus size={14} /> Create</span>
                    ) : (
                      <span className="flex items-center justify-center gap-1"><Users size={14} /> Join</span>
                    )}
                  </button>
                ))}
              </div>

              {mode === 'create' ? (
                <div>
                  <label className="label">Workspace name</label>
                  <input
                    className="input"
                    placeholder="Acme Design Team"
                    value={workspaceName}
                    onChange={(e) => setWorkspaceName(e.target.value)}
                  />
                </div>
              ) : (
                <div>
                  <label className="label">Invite code</label>
                  <input
                    className="input font-mono tracking-wider uppercase"
                    placeholder="ABC-123"
                    value={inviteCode}
                    onChange={(e) => setInviteCode(e.target.value)}
                  />
                </div>
              )}

              <button
                onClick={handleWorkspace}
                disabled={loading || (mode === 'create' ? !workspaceName : !inviteCode)}
                className="btn-primary w-full flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <><span>{mode === 'create' ? 'Create Workspace' : 'Join Workspace'}</span><ArrowRight size={16} /></>}
              </button>
            </div>
          )}

          {/* Step 2: Calendar seed */}
          {step === 2 && (
            <div className="space-y-6">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 rounded-xl bg-accent-secondary bg-opacity-10 flex items-center justify-center">
                  <Calendar size={20} className="text-accent-secondary" />
                </div>
                <div>
                  <h2 className="font-display font-bold text-xl text-text-primary">Mock Calendar</h2>
                  <p className="text-text-secondary text-sm">Populate demo appointments to explore</p>
                </div>
              </div>

              {!seeded ? (
                <div className="border border-bg-border rounded-xl p-5 space-y-3">
                  <p className="text-text-secondary text-sm">
                    We'll seed your calendar with realistic demo appointments so you can immediately explore the dashboard, conflict detection, and AI optimization.
                  </p>
                  <ul className="space-y-1.5">
                    {['6 appointments this week', 'Mixed guest names & reasons', 'One focus block included'].map((f) => (
                      <li key={f} className="flex items-center gap-2 text-text-secondary text-sm">
                        <Check size={14} className="text-accent-success flex-shrink-0" />
                        {f}
                      </li>
                    ))}
                  </ul>
                  <button
                    onClick={handleSeed}
                    disabled={loading}
                    className="btn-primary w-full flex items-center justify-center gap-2"
                  >
                    {loading ? <Loader2 size={16} className="animate-spin" /> : <><Calendar size={16} />Connect Mock Calendar</>}
                  </button>
                </div>
              ) : (
                <div className="text-center space-y-4">
                  <div className="w-14 h-14 rounded-2xl bg-accent-success bg-opacity-10 border border-accent-success border-opacity-20 flex items-center justify-center mx-auto">
                    <Check size={24} className="text-accent-success" />
                  </div>
                  <p className="text-text-secondary">Calendar seeded! You're all set.</p>
                  <button onClick={finish} className="btn-primary w-full flex items-center justify-center gap-2">
                    Go to Dashboard <ArrowRight size={16} />
                  </button>
                </div>
              )}

              <button onClick={finish} className="w-full text-center text-text-muted text-sm hover:text-text-secondary transition-colors py-1">
                Skip — I'll add appointments manually
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
