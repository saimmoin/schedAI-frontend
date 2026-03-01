import { useNavigate } from 'react-router-dom';
import { Brain, Zap, Calendar, Users, ArrowRight, CheckCircle, Clock, BarChart3 } from 'lucide-react';

const FEATURES = [
  {
    icon: Brain,
    title: 'AI-Powered Scheduling',
    desc: 'Claude analyzes your week and scores every slot — so you always schedule at peak efficiency.',
  },
  {
    icon: Zap,
    title: 'Smart Optimization',
    desc: 'One click reshuffles your entire week for maximum focus time and minimum context switching.',
  },
  {
    icon: Calendar,
    title: 'Auto Waitlist',
    desc: 'When a slot opens up, the right person gets booked automatically. Zero manual work.',
  },
  {
    icon: Users,
    title: 'Team Visibility',
    desc: 'See your whole workspace free/busy at a glance. No more back-and-forth coordination.',
  },
];

const STATS = [
  { value: '74%', label: 'Avg efficiency gain' },
  { value: '< 30s', label: 'Setup time' },
  { value: '0', label: 'Scheduling conflicts' },
];

export default function LandingPage() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen relative z-10 font-body">
      {/* Nav */}
      <nav className="border-b border-bg-border glass fixed top-0 w-full z-50">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src="/logo.png" alt="SchedAI" className="w-8 h-8 rounded-xl shadow-glow-sm" />
            <span className="font-display font-bold text-lg text-text-primary">SchedAI</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/auth')}
              className="text-text-secondary hover:text-text-primary transition-colors text-sm font-medium px-4 py-2"
            >
              Sign in
            </button>
            <button onClick={() => navigate('/auth')} className="btn-primary text-sm">
              Get started free
            </button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="pt-32 pb-24 px-6 text-center">
        <div className="max-w-4xl mx-auto">
          <h1 className="font-display font-extrabold text-6xl md:text-7xl text-text-primary leading-none mb-6 animate-slide-up">
            Schedule smarter.
            <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-accent-primary to-accent-secondary">
              Think less.
            </span>
          </h1>

          <p className="text-text-secondary text-xl max-w-2xl mx-auto mb-10 leading-relaxed animate-fade-in">
            SchedAI uses AI to score your time slots, auto-book your waitlist, and optimize your entire week — so you spend more time doing, less time scheduling.
          </p>

          <div className="flex items-center justify-center gap-4 flex-wrap animate-fade-in">
            <button
              onClick={() => navigate('/auth')}
              className="btn-primary flex items-center gap-2 text-base px-7 py-3"
            >
              Start free in 30 seconds
              <ArrowRight size={18} />
            </button>
            <button
              onClick={() => navigate('/book/demo')}
              className="btn-secondary flex items-center gap-2 text-base"
            >
              <Calendar size={18} />
              See booking page
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="max-w-2xl mx-auto mt-20 grid grid-cols-3 gap-6">
          {STATS.map((s) => (
            <div key={s.value} className="card p-6 text-center">
              <p className="font-display font-extrabold text-4xl text-accent-primary mb-1">{s.value}</p>
              <p className="text-text-secondary text-sm">{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-6 border-t border-bg-border">
        <div className="max-w-5xl mx-auto">
          <h2 className="font-display font-bold text-4xl text-text-primary text-center mb-3">
            Everything you need
          </h2>
          <p className="text-text-secondary text-center mb-14 text-lg">
            Built for people who hate managing their calendar
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {FEATURES.map(({ icon: Icon, title, desc }) => (
              <div key={title} className="card p-6 hover:border-accent-primary hover:border-opacity-30 transition-all duration-300 group">
                <div className="w-10 h-10 rounded-xl bg-accent-primary bg-opacity-10 flex items-center justify-center mb-4 group-hover:bg-opacity-20 transition-all">
                  <Icon size={20} className="text-accent-primary" />
                </div>
                <h3 className="font-display font-semibold text-lg text-text-primary mb-2">{title}</h3>
                <p className="text-text-secondary text-sm leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 px-6 border-t border-bg-border">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="font-display font-bold text-4xl text-text-primary mb-14">
            Up and running in 3 steps
          </h2>
          <div className="space-y-6 text-left">
            {[
              { n: '01', title: 'Create your account', desc: 'Sign up and connect your workspace in under 30 seconds.' },
              { n: '02', title: 'Set your availability', desc: 'Tell SchedAI when you work. We handle the rest — buffers, slots, conflicts.' },
              { n: '03', title: 'Share your booking link', desc: 'Send schedai.app/yourname to anyone. They book, you get notified. Simple.' },
            ].map((step) => (
              <div key={step.n} className="flex gap-5 card p-5">
                <span className="font-mono font-bold text-accent-primary text-2xl flex-shrink-0 opacity-60">{step.n}</span>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <CheckCircle size={16} className="text-accent-success" />
                    <h3 className="font-display font-semibold text-text-primary">{step.title}</h3>
                  </div>
                  <p className="text-text-secondary text-sm">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24 px-6 border-t border-bg-border text-center">
        <div className="max-w-xl mx-auto">
          <h2 className="font-display font-extrabold text-5xl text-text-primary mb-4">
            Ready to reclaim
            <br />
            your time?
          </h2>
          <p className="text-text-secondary mb-8 text-lg">
            Join teams using SchedAI to schedule smarter.
          </p>
          <button
            onClick={() => navigate('/auth')}
            className="btn-primary flex items-center gap-2 mx-auto text-base px-8 py-3"
          >
            Get started — it's free
            <ArrowRight size={18} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-bg-border px-6 py-8">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="SchedAI" className="w-4 h-4 rounded" />
              <span className="font-display font-bold text-text-secondary text-sm">SchedAI</span>
            </div>
            <p className="text-text-muted text-xs font-mono">
              © {new Date().getFullYear()} SchedAI. All rights reserved.
            </p>
          </div>
          <div className="text-center pt-3 border-t border-bg-border">
            <p className="text-text-muted text-xs font-body">
              Developed by <span className="text-accent-primary font-medium">Emaan Arif Khan</span>, <span className="text-accent-primary font-medium">Fatima Azfar</span> & <span className="text-accent-primary font-medium">Saim Saqib Moin</span>
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
