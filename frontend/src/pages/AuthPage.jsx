import React, { useState } from 'react';
import { Eye, EyeOff, Zap, ArrowRight, Loader2, Building, UserPlus, XCircle } from 'lucide-react';
import { login, createCompany, joinCompany } from '../api';

const AuthPage = ({ onLogin }) => {
  const [authMode, setAuthMode] = useState('login'); // 'login' | 'create_company' | 'join_company'
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    role: 'employee',
    companyName: '',
    inviteCode: ''
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      let response;
      if (authMode === 'login') {
        response = await login({ email: formData.email, password: formData.password });
      } else if (authMode === 'create_company') {
        response = await createCompany({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          companyName: formData.companyName 
        });
      } else {
        response = await joinCompany({ 
          name: formData.name, 
          email: formData.email, 
          password: formData.password, 
          role: formData.role, 
          inviteCode: formData.inviteCode 
        });
      }

      if (response.data.token) {
        onLogin(response.data.user, response.data.token);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Authentication failed. Please check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const isLogin = authMode === 'login';

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-[1100px] bg-white rounded-3xl shadow-xl overflow-hidden flex flex-col md:flex-row border border-slate-200/60">
        
        {/* Left Panel - Branding & Social Proof */}
        <div className="hidden md:flex w-[40%] bg-indigo-600 p-12 flex-col justify-between relative overflow-hidden">
          <div className="absolute top-0 right-0 w-80 h-80 bg-white/10 rounded-full blur-[80px] -translate-y-1/2 translate-x-1/2" />
          
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-10">
              <div className="w-10 h-10 rounded-xl bg-white shadow-xl flex items-center justify-center overflow-hidden">
                <img src="/logo.png" alt="MoneyMatters" className="w-full h-full object-cover" />
              </div>
              <span className="text-xl font-black text-white tracking-tight uppercase">MoneyMatters</span>
            </div>
            
            <h1 className="text-3xl font-black text-white leading-tight tracking-tight mb-4">
              {isLogin ? "Reimagine your financial workflow." : "The nucleus of your company spend."}
            </h1>
            <p className="text-indigo-100/80 text-base font-medium leading-relaxed max-w-xs">
              Streamline reimbursements and automate compliance with AI-powered simplicity.
            </p>
          </div>

          <div className="relative z-10 space-y-4">
            <div className="bg-white/10 backdrop-blur-md p-6 rounded-2xl border border-white/10 shadow-xl">
              <div className="flex gap-1 mb-3">
                {[1,2,3,4,5].map(i => <div key={i} className="w-1 h-1 rounded-full bg-emerald-400" />)}
              </div>
              <p className="text-white text-sm font-bold leading-snug tracking-tight">
                "Zero manual entry. MoneyMatters is the most intuitive expense platform I've ever deployed."
              </p>
              <div className="flex items-center gap-3 mt-4">
                <div className="w-8 h-8 rounded-lg bg-indigo-400 border border-white/20" />
                <div>
                  <p className="text-white text-xs font-black tracking-tight">Marcus Thorne</p>
                  <p className="text-indigo-200/60 text-[9px] font-bold uppercase tracking-widest mt-0.5">CTO @ Innovate</p>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-4 pl-2">
                <p className="text-indigo-100/60 text-[10px] font-bold uppercase tracking-widest leading-none">Trusted by 2k+ Teams</p>
            </div>
          </div>
        </div>

        {/* Right Panel - Content */}
        <div className="flex-1 p-6 sm:p-12 flex flex-col items-center justify-center bg-white relative">
          <div className="w-full max-w-[380px]">
            <div className="text-center mb-8">
              <h2 className="text-2xl font-black text-slate-800 tracking-tight mb-2">
                {authMode === 'login' && "Welcome Back"}
                {authMode === 'create_company' && "Scale your Org"}
                {authMode === 'join_company' && "Join your Team"}
              </h2>
              <p className="text-sm text-slate-400 font-medium">
                {authMode === 'login' && "Access your secure financial dashboard"}
                {authMode === 'create_company' && "Initialize your premium workspace"}
                {authMode === 'join_company' && "Enter your unique access code below"}
              </p>
            </div>

            {/* Mode Switcher */}
            <div className="flex p-1 bg-slate-100/80 rounded-xl mb-8 border border-slate-200/60">
              <button 
                onClick={() => setAuthMode('login')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode === 'login' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Sign In
              </button>
              <button 
                onClick={() => setAuthMode('create_company')}
                className={`flex-1 py-2 text-[10px] font-black uppercase tracking-widest rounded-lg transition-all ${authMode !== 'login' ? 'bg-white text-indigo-600 shadow-sm border border-slate-200/50' : 'text-slate-400 hover:text-slate-600'}`}
              >
                Sign Up
              </button>
            </div>

            {/* Sub-modes for Register */}
            {!isLogin && (
              <div className="flex gap-2 mb-6 bg-slate-50/50 p-1 rounded-lg border border-dashed border-slate-200">
                <button 
                  onClick={() => setAuthMode('create_company')}
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md flex items-center justify-center gap-2 transition-all ${authMode === 'create_company' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  <Building size={12} /> Startup
                </button>
                <button 
                  onClick={() => setAuthMode('join_company')}
                  className={`flex-1 py-1.5 text-[9px] font-black uppercase tracking-widest rounded-md flex items-center justify-center gap-2 transition-all ${authMode === 'join_company' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-400 hover:bg-slate-100'}`}
                >
                  <UserPlus size={12} /> Associate
                </button>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 bg-rose-50 border border-rose-100 rounded-xl text-rose-500 text-[11px] font-bold flex items-center gap-2">
                    <XCircle size={14} />
                    {error}
                </div>
              )}

              {!isLogin && (
                <div className="space-y-1 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Full Name</label>
                  <input 
                    type="text" 
                    placeholder="Enter your name"
                    className="input py-2 h-10"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              )}

              <div className="space-y-1 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Institutional Email</label>
                <input 
                  type="email" 
                  placeholder="you@company.com"
                  className="input py-2 h-10"
                  required
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>

              <div className="space-y-1 group">
                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Secure Password</label>
                <div className="relative">
                  <input 
                    type={showPassword ? 'text' : 'password'} 
                    placeholder="••••••••"
                    className="input py-2 h-10"
                    required
                    minLength={4}
                    value={formData.password}
                    onChange={(e) => setFormData({...formData, password: e.target.value})}
                  />
                  <button 
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-300 hover:text-indigo-600 transition-colors focus:outline-none"
                  >
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>

              {authMode === 'create_company' && (
                <div className="space-y-1 group">
                  <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Organization Name</label>
                  <input 
                    type="text" 
                    placeholder="E.g. Acme Industries"
                    className="input py-2 h-10"
                    required
                    value={formData.companyName}
                    onChange={(e) => setFormData({...formData, companyName: e.target.value})}
                  />
                </div>
              )}

              {authMode === 'join_company' && (
                <div className="space-y-4">
                  <div className="space-y-1 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Invitation Code</label>
                    <input 
                      type="text" 
                      placeholder="8-ALPHANUMERIC"
                      className="input py-2 h-10 font-bold tracking-widest text-center uppercase font-mono"
                      required
                      value={formData.inviteCode}
                      onChange={(e) => setFormData({...formData, inviteCode: e.target.value.toUpperCase()})}
                    />
                  </div>
                  <div className="space-y-1 group">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Company Access Tier</label>
                    <select 
                      className="input py-2 h-10 text-xs font-bold"
                      value={formData.role}
                      onChange={(e) => setFormData({...formData, role: e.target.value})}
                    >
                      <option value="employee">Standard Employee</option>
                      <option value="manager">Lead/Manager</option>
                    </select>
                  </div>
                </div>
              )}

              <button 
                type="submit" 
                disabled={loading}
                className="w-full btn-primary h-11 flex items-center justify-center gap-2 mt-4 uppercase tracking-widest font-black text-[10px] group"
              >
                {loading ? <Loader2 className="animate-spin" size={16} /> : (
                  <>
                    <span>
                        {authMode === 'login' && "Sign-In to Node"}
                        {authMode === 'create_company' && "Deploy Workspace"}
                        {authMode === 'join_company' && "Establish Link"}
                    </span>
                    <ArrowRight size={14} className="transition-transform group-hover:translate-x-1" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-8 pt-6 border-t border-slate-100 text-center">
                <p className="text-[9px] text-slate-400 font-bold tracking-tight">
                    Secured by RSA-4096 and OAuth 2.0 Compliance
                </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};


export default AuthPage;
