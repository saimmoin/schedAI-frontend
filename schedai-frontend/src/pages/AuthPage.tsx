import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Brain, Eye, EyeOff, ArrowRight } from 'lucide-react';
import { authApi } from '../core/api';
import { useAuthStore } from '../core/authStore';
import { toast } from '../components/shared/Toast';
import { ToastContainer } from '../components/shared/Toast';

export default function AuthPage() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const { setAuth } = useAuthStore();
  const navigate = useNavigate();

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (mode === 'register') {
        const res = await authApi.register({ name, email, password });
        setAuth(res.data.token, res.data.user);
        navigate('/onboarding');
      } else {
        const res = await authApi.login({ email, password });
        setAuth(res.data.token, res.data.user);
        navigate('/dashboard');
      }
    } catch (err: any) {
      toast(err.response?.data?.message ?? 'Something went wrong', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen relative z-10 flex items-center justify-center px-4">
      <ToastContainer />

      <div className="w-full max-w-md animate-slide-up">
        {/* Logo */}
        <div className="flex items-center justify-center gap-3 mb-8">
          <img src="/logo.png" alt="SchedAI" className="w-10 h-10 rounded-xl shadow-glow" />
          <span className="font-display font-bold text-2xl text-text-primary">SchedAI</span>
        </div>

        <div className="card p-8">
          {/* Toggle */}
          <div className="flex bg-bg-secondary rounded-xl p-1 mb-8">
            {(['login', 'register'] as const).map((m) => (
              <button
                key={m}
                onClick={() => setMode(m)}
                className={`flex-1 py-2 rounded-lg text-sm font-display font-semibold transition-all duration-200 ${
                  mode === m
                    ? 'bg-accent-primary text-white shadow-glow-sm'
                    : 'text-text-secondary hover:text-text-primary'
                }`}
              >
                {m === 'login' ? 'Sign in' : 'Create account'}
              </button>
            ))}
          </div>

          <form onSubmit={submit} className="space-y-5">
            {mode === 'register' && (
              <div>
                <label className="label">Full name</label>
                <input
                  className="input"
                  type="text"
                  placeholder="Alex Johnson"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div>
              <label className="label">Email</label>
              <input
                className="input"
                type="email"
                placeholder="alex@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="label">Password</label>
                {mode === 'login' && (
                  <button
                    type="button"
                    onClick={() => toast('Password reset link sent to your email', 'info')}
                    className="text-accent-primary text-xs font-body hover:underline"
                  >
                    Forgot password?
                  </button>
                )}
              </div>
              <div className="relative">
                <input
                  className="input pr-11"
                  type={showPass ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                />
                <button
                  type="button"
                  onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-secondary transition-colors"
                >
                  {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary w-full flex items-center justify-center gap-2 mt-2"
            >
              {loading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  {mode === 'login' ? 'Sign in' : 'Create account'}
                  <ArrowRight size={16} />
                </>
              )}
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-bg-border" />
              </div>
              <div className="relative flex justify-center text-xs">
                <span className="bg-bg-card px-3 text-text-muted font-body">or continue with</span>
              </div>
            </div>

            {/* Google OAuth Button */}
            <button
              type="button"
              onClick={() => toast('Google OAuth coming soon!', 'info')}
              className="w-full flex items-center justify-center gap-3 px-4 py-3 rounded-xl border border-bg-border bg-bg-secondary hover:bg-bg-hover transition-all duration-200 group"
            >
              <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              <span className="text-text-primary font-body font-medium text-sm group-hover:text-text-primary transition-colors">
                Continue with Google
              </span>
            </button>
          </form>
        </div>

        <p className="text-center text-text-muted text-xs mt-6 font-mono">
          By continuing you agree to our terms of service
        </p>
      </div>
    </div>
  );
}
