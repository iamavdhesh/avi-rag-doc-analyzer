import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { ShieldCheck, Cpu, Terminal, Users, Lock, User, Eye, EyeOff } from 'lucide-react';

export const LoginScreen: React.FC = () => {
  const { login } = useApp();
  const [username, setUsername] = useState('alex.mercer');
  const [password, setPassword] = useState('••••••••••••');
  const [role, setRole] = useState('Admin');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    await login(username, role);
    setLoading(false);
  };

  const roles = [
    { name: 'Admin', icon: <ShieldCheck className="w-4 h-4 text-emerald-500" />, desc: 'System tuning, analytics, and prompts' },
    { name: 'Data Engineer', icon: <Cpu className="w-4 h-4 text-violet-500" />, desc: 'Kafka streams, DLQ, and indexing monitoring' },
    { name: 'Compliance Officer', icon: <Terminal className="w-4 h-4 text-amber-500" />, desc: 'Strict RAG citation reviews and security' },
    { name: 'General User', icon: <Users className="w-4 h-4 text-sky-500" />, desc: 'Doc search and question answering' }
  ];

  return (
    <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-slate-900 bg-grid-pattern p-4">
      {/* Abstract Glowing Blobs */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-teal-500/10 rounded-full blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-500/10 rounded-full blur-[120px] pointer-events-none"></div>

      <div className="max-w-md w-full glass-panel dark:bg-slate-900/80 border dark:border-slate-800 p-8 rounded-2xl shadow-2xl relative z-10">
        
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-teal-500/10 border border-teal-500/20 text-teal-400 text-xs font-semibold tracking-wider uppercase mb-3">
            <Cpu className="w-3.5 h-3.5" /> Enterprise Control Plane
          </div>
          <h2 className="text-2xl font-bold text-white tracking-tight">AVI RAG PLATFORM</h2>
          <p className="text-xs text-slate-400 mt-1">Grounding Generative AI with Distributed Ingestion Pipelines</p>
        </div>

        {/* Quick Presets */}
        <div className="mb-6">
          <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-2">Select Access Persona</label>
          <div className="grid grid-cols-2 gap-2">
            {roles.map((r) => (
              <button
                key={r.name}
                type="button"
                onClick={() => {
                  setRole(r.name);
                  if (r.name === 'Admin') setUsername('alex.mercer');
                  else if (r.name === 'Data Engineer') setUsername('devon.miller');
                  else if (r.name === 'Compliance Officer') setUsername('sarah.connor');
                  else setUsername('elena.vance');
                }}
                className={`p-2.5 text-left rounded-xl border transition-all ${
                  role === r.name
                    ? 'bg-slate-800 border-teal-500 text-white shadow-md shadow-teal-500/5'
                    : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800/80 text-slate-300'
                }`}
              >
                <div className="flex items-center gap-1.5 font-semibold text-xs mb-0.5">
                  {r.icon}
                  {r.name}
                </div>
                <div className="text-[10px] text-slate-400 line-clamp-1 leading-tight">{r.desc}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Credentials Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Corporate ID</label>
            <div className="relative">
              <User className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-2.5 pl-10 pr-4 text-sm text-white focus:outline-none transition-all"
                placeholder="First.Last (e.g. alex.mercer)"
              />
            </div>
          </div>

          <div>
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider block mb-1">Enterprise SSO Password</label>
            <div className="relative">
              <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <input
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 focus:border-teal-500 rounded-xl py-2.5 pl-10 pr-10 text-sm text-white focus:outline-none transition-all"
                placeholder="SSO Password key"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 text-slate-500 hover:text-slate-300"
              >
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-teal-500 hover:bg-teal-600 disabled:bg-teal-500/40 text-slate-950 font-semibold py-2.5 rounded-xl text-sm transition-all flex items-center justify-center gap-2 cursor-pointer shadow-lg shadow-teal-500/10 active:scale-[0.98]"
          >
            {loading ? (
              <>
                <svg className="animate-spin h-4 w-4 text-slate-950" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                Synchronizing tokens...
              </>
            ) : (
              'Authenticate Secure Gate'
            )}
          </button>
        </form>

        {/* Security Compliance Footer */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center">
          <p className="text-[10px] text-slate-500 leading-relaxed">
            SECURE VPN MANDATORY. Access restricted to AVI Enterprise Employees. All vector queries and document embedding logs are actively audited for compliance metrics under SOC2 policy constraints.
          </p>
        </div>
      </div>
    </div>
  );
};
