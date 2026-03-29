import React, { useState } from 'react';
import { Eye, EyeOff, Zap, ArrowRight, Loader2 } from 'lucide-react';
import { login, signup } from '../api';

const AuthPage = ({ onLogin }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee'
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const response = isLogin 
        ? await login({ email: formData.email, password: formData.password })
        : await signup(formData);

      if (response.data.token) {
        onLogin(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full bg-white rounded-[24px] shadow-2xl overflow-hidden flex min-h-[600px]">
        
        {/* Left Side - Visual */}
        <div className="hidden md:flex w-1/2 gradient-bg p-12 flex-col justify-between relative overflow-hidden">
          {/* Subtle Blob SVG */}
          <svg className="absolute top-0 right-0 w-full h-full opacity-20" viewBox="0 0 400 400" xmlns="http://www.w3.org/2000/svg">
            <path fill="#FFFFFF" d="M44.7,-76.4C58.3,-69.2,70.1,-57.4,78.2,-43.8C86.3,-30.2,90.7,-15.1,89.5,-0.7C88.3,13.7,81.5,27.4,72.2,39.6C62.9,51.8,51.1,62.5,37.3,70.6C23.5,78.7,7.7,84.2,-8.1,82.4C-23.9,80.6,-39.7,71.5,-53.4,60.2C-67.1,48.9,-78.7,35.4,-84.6,19.8C-90.5,4.2,-90.7,-13.5,-84.4,-29C-78.1,-44.5,-65.3,-57.8,-50.8,-64.8C-36.3,-71.8,-20.1,-72.5,-3.5,-66.4C13.1,-60.3,26.2,-47.4,44.7,-76.4Z" transform="translate(200 200)" />
          </svg>

          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-8">
              <div className="w-10 h-10 rounded-xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                <Zap size={20} className="text-white" />
              </div>
              <span className="text-xl font-bold text-white font-display">MoneyMatters</span>
            </div>
            
            <h1 className="text-4xl font-bold text-white leading-tight mb-4">
              {isLogin ? 'Welcome back to your team.' : 'Manage expenses with zero friction.'}
            </h1>
            <p className="text-white/70 text-lg">
              The smartest way for teams to handle reimbursements and bills.
            </p>
          </div>

          <div className="relative z-10 bg-white/10 backdrop-blur-lg rounded-2xl p-6 border border-white/20">
            <p className="text-white text-sm font-medium italic">
              "MoneyMatters saved our finance team 20 hours a week on manual approvals. It's a game changer."
            </p>
            <div className="flex items-center gap-3 mt-4">
              <div className="w-8 h-8 rounded-full bg-slate-200" />
              <div>
                <p className="text-white text-xs font-bold">Sarah Jenkins</p>
                <p className="text-white/60 text-[10px]">Head of Finance, Vercel</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side - Form */}
        <div className="w-full md:w-1/2 p-8 md:p-12 flex flex-col justify-center">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-slate-800 mb-2">
              {isLogin ? 'Welcome back' : 'Join your team'}
            </h2>
            <p className="text-slate-500">
              {isLogin 
                ? 'Great to see you again!' 
                : 'Your company account will be set up automatically.'}
            </p>
          </div>

          {/* Toggle Tabs */}
          <div className="flex bg-slate-100 p-1 rounded-xl mb-8">
            <button 
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${isLogin ? 'bg-white text-[#6C47FF] shadow-sm' : 'text-slate-500'}`}
            >
              Sign In
            </button>
            <button 
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 text-sm font-semibold rounded-lg transition-all ${!isLogin ? 'bg-white text-[#6C47FF] shadow-sm' : 'text-slate-500'}`}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-red-50 border border-red-100 rounded-xl text-red-600 text-sm font-medium">
                {error}
              </div>
            )}

            {!isLogin && (
              <div>
                <label className="label">Full Name</label>
                <input 
                  type="text" 
                  placeholder="John Doe"
                  className="input"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            )}

            <div>
              <label className="label">Email Address</label>
              <input 
                type="email" 
                placeholder="you@company.com"
                className="input"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
              />
            </div>

            <div>
              <label className="label">Password</label>
              <div className="relative">
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  placeholder="••••••••"
                  className="input pr-12"
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="label">I am a...</label>
                <select 
                  className="input"
                  value={formData.role}
                  onChange={(e) => setFormData({...formData, role: e.target.value})}
                >
                  <option value="employee">Employee</option>
                  <option value="manager">Manager</option>
                  <option value="admin">System Admin</option>
                </select>
              </div>
            )}

            <button 
              type="submit" 
              disabled={loading}
              className="btn-primary w-full justify-center mt-4"
            >
              {loading ? <Loader2 className="animate-spin" size={20} /> : (
                <>
                  {isLogin ? 'Sign In' : 'Create account'} 
                  <ArrowRight size={18} className="ml-2" />
                </>
              )}
            </button>
          </form>

          <p className="text-center text-slate-400 text-xs mt-8">
            By signing in, you agree to our <span className="underline cursor-pointer">Terms of Service</span> and <span className="underline cursor-pointer">Privacy Policy</span>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default AuthPage;
