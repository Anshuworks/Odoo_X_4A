import React, { useState } from 'react';
import { Eye, EyeOff, Zap, ArrowRight } from 'lucide-react';

const AuthPage = ({ onLogin }) => {
  const [mode, setMode] = useState('login'); // 'login' | 'signup'
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [showPass, setShowPass] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleSubmit = () => {
    if (!form.email || !form.password) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      // Determine role from email for demo
      let role = 'employee';
      if (form.email.includes('admin')) role = 'admin';
      else if (form.email.includes('manager')) role = 'manager';
      else if (form.role === 'admin') role = 'admin';
      else if (form.role === 'manager') role = 'manager';

      const name = form.name || (role === 'admin' ? 'Dana Kim' : role === 'manager' ? 'Sarah Chen' : 'Alex Morgan');
      onLogin({ name, email: form.email, role });
    }, 800);
  };

  return (
    <div className="min-h-screen flex">
      {/* Left – Branding */}
      <div className="hidden lg:flex w-[45%] gradient-bg flex-col justify-between p-12 relative overflow-hidden">
        {/* Background decoration */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-black/10 rounded-full translate-y-1/3 -translate-x-1/3" />

        {/* Logo */}
        <div className="relative flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur flex items-center justify-center">
            <Zap size={20} className="text-white" />
          </div>
          <span className="font-display text-xl font-bold text-white">MoneyMatters</span>
        </div>

        {/* Center copy */}
        <div className="relative">
          <div className="inline-block bg-white/10 backdrop-blur text-white/80 text-xs font-semibold px-3 py-1.5 rounded-lg mb-6 uppercase tracking-wider">
            Reimbursement Platform
          </div>
          <h2 className="font-display text-4xl font-bold text-white leading-tight mb-4">
            Expense claims,<br />
            handled effortlessly.
          </h2>
          <p className="text-white/70 text-base leading-relaxed max-w-xs">
            Submit, approve, and track reimbursements — all in one place. Fast, transparent, and painless.
          </p>
        </div>

        {/* Stats */}
        <div className="relative flex gap-6">
          {[['2.4k', 'Expenses processed'], ['98%', 'On-time approvals'], ['< 2d', 'Avg. turnaround']].map(([val, label]) => (
            <div key={label}>
              <p className="font-display text-2xl font-bold text-white">{val}</p>
              <p className="text-white/60 text-xs mt-0.5">{label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Right – Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-slate-50">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <div className="lg:hidden flex items-center gap-2 mb-8">
            <div className="w-8 h-8 rounded-xl gradient-bg flex items-center justify-center">
              <Zap size={16} className="text-white" />
            </div>
            <span className="font-display text-lg font-bold text-slate-800">MoneyMatters</span>
          </div>

          <div className="card p-8">
            {/* Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-xl mb-8">
              {['login', 'signup'].map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                    mode === m
                      ? 'bg-white text-slate-800 shadow-sm'
                      : 'text-slate-500 hover:text-slate-700'
                  }`}
                >
                  {m === 'login' ? 'Sign in' : 'Create account'}
                </button>
              ))}
            </div>

            <div>
              <h3 className="font-display text-2xl font-bold text-slate-800 mb-1">
                {mode === 'login' ? 'Welcome back' : 'Join your team'}
              </h3>
              <p className="text-sm text-slate-500 mb-6">
                {mode === 'login'
                  ? 'Enter your credentials to continue'
                  : 'Your company account will be set up automatically'}
              </p>

              <div className="space-y-4">
                {mode === 'signup' && (
                  <div>
                    <label className="label">Full name</label>
                    <input
                      type="text"
                      placeholder="Jane Smith"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="input"
                    />
                  </div>
                )}

                <div>
                  <label className="label">Email address</label>
                  <input
                    type="email"
                    placeholder="you@company.com"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="input"
                  />
                </div>

                <div>
                  <label className="label">Password</label>
                  <div className="relative">
                    <input
                      type={showPass ? 'text' : 'password'}
                      placeholder="••••••••"
                      value={form.password}
                      onChange={(e) => setForm({ ...form, password: e.target.value })}
                      className="input pr-10"
                      onKeyDown={(e) => e.key === 'Enter' && handleSubmit()}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPass(!showPass)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                    >
                      {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                    </button>
                  </div>
                </div>

                {mode === 'signup' && (
                  <div>
                    <label className="label">Role</label>
                    <select
                      value={form.role}
                      onChange={(e) => setForm({ ...form, role: e.target.value })}
                      className="input"
                    >
                      <option value="employee">Employee</option>
                      <option value="manager">Manager</option>
                      <option value="admin">Admin</option>
                    </select>
                  </div>
                )}
              </div>

              {mode === 'login' && (
                <div className="flex justify-end mt-2">
                  <button className="text-xs text-brand-500 hover:text-brand-600 font-medium">
                    Forgot password?
                  </button>
                </div>
              )}

              <button
                onClick={handleSubmit}
                disabled={loading}
                className="btn-primary w-full justify-center mt-6 py-3"
              >
                {loading ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    {mode === 'login' ? 'Signing in…' : 'Creating account…'}
                  </span>
                ) : (
                  <>
                    {mode === 'login' ? 'Sign in' : 'Create account'}
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              {mode === 'login' && (
                <div className="mt-6 p-3 bg-slate-50 rounded-xl border border-slate-100">
                  <p className="text-xs text-slate-500 font-medium mb-1.5">Demo accounts (any password):</p>
                  <div className="space-y-1">
                    {[
                      ['admin@acme.com', 'Admin'],
                      ['manager@acme.com', 'Manager'],
                      ['employee@acme.com', 'Employee'],
                    ].map(([email, role]) => (
                      <button
                        key={email}
                        onClick={() => setForm({ ...form, email, password: 'demo123' })}
                        className="flex items-center justify-between w-full text-xs px-2 py-1.5 rounded-lg hover:bg-slate-100 transition-colors text-slate-600"
                      >
                        <span className="font-mono">{email}</span>
                        <span className="text-slate-400">{role}</span>
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
