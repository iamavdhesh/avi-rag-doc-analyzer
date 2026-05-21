import React from 'react';
import { useApp } from '../AppContext';
import {
  LayoutDashboard,
  FileText,
  MessageSquare,
  Activity,
  Settings,
  LogOut,
  Moon,
  Sun,
  Shield,
  Cpu,
  Terminal,
  Database
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ activeTab, setActiveTab }) => {
  const { user, logout, theme, toggleTheme, kafkaTopics } = useApp();

  if (!user) return null;

  const getRoleIcon = (role: string) => {
    switch (role) {
      case 'Admin':
        return <Shield className="w-3.5 h-3.5 text-emerald-400" />;
      case 'Compliance Officer':
        return <Terminal className="w-3.5 h-3.5 text-amber-400" />;
      case 'Data Engineer':
        return <Cpu className="w-3.5 h-3.5 text-violet-400" />;
      default:
        return <Database className="w-3.5 h-3.5 text-sky-400" />;
    }
  };

  const navItems = [
    { id: 'dashboard', label: 'Control Panel', icon: <LayoutDashboard className="w-4 h-4" />, roles: ['Admin', 'Data Engineer', 'Compliance Officer', 'General User'] },
    { id: 'documents', label: 'Ingestion Portal', icon: <FileText className="w-4 h-4" />, roles: ['Admin', 'Data Engineer', 'Compliance Officer', 'General User'] },
    { id: 'chat', label: 'AI Q&A Workspace', icon: <MessageSquare className="w-4 h-4" />, roles: ['Admin', 'Data Engineer', 'Compliance Officer', 'General User'] },
    { id: 'kafka', label: 'Kafka Monitor', icon: <Activity className="w-4 h-4" />, roles: ['Admin', 'Data Engineer'] },
    { id: 'admin', label: 'System Configuration', icon: <Settings className="w-4 h-4" />, roles: ['Admin', 'Compliance Officer'] }
  ];

  // Calculate Kafka Cluster Health indicator
  const healthyCount = kafkaTopics.filter(t => t.status === 'Healthy').length;
  const isHealthy = healthyCount === kafkaTopics.length;

  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 text-slate-300 flex flex-col h-screen sticky top-0 flex-shrink-0 z-20">
      
      {/* Platform Branding */}
      <div className="p-6 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-teal-500 flex items-center justify-center text-slate-950 font-extrabold text-sm tracking-wider shadow-lg shadow-teal-500/10">
            V
          </div>
          <div>
            <h1 className="font-extrabold text-sm tracking-widest text-white uppercase">AVI RAG</h1>
            <p className="text-[10px] text-teal-400 font-semibold tracking-wider">ENTERPRISE OS</p>
          </div>
        </div>
        
        {/* Connection Pulse */}
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-[10px] text-emerald-400 font-medium">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
          LIVE
        </div>
      </div>

      {/* Corporate User profile */}
      <div className="p-4 mx-3 my-4 bg-slate-800/40 border border-slate-800/80 rounded-xl flex items-center gap-3">
        <img
          src={user.avatar}
          alt={user.username}
          className="w-9 h-9 rounded-full object-cover ring-2 ring-slate-800"
        />
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold text-white truncate">{user.username}</p>
          <div className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700/60 text-[9px] text-slate-300 font-medium mt-0.5">
            {getRoleIcon(user.role)}
            <span className="truncate max-w-[100px]">{user.role}</span>
          </div>
        </div>
      </div>

      {/* Navigation Menu */}
      <nav className="flex-1 px-3 space-y-1 overflow-y-auto">
        <div className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider px-3 mb-2">Navigation Node</div>
        {navItems
          .filter((item) => item.roles.includes(user.role))
          .map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-all relative cursor-pointer ${
                  isActive
                    ? 'bg-teal-500/10 text-teal-400 border-l-2 border-teal-500'
                    : 'hover:bg-slate-800/40 text-slate-400 hover:text-slate-200'
                }`}
              >
                {item.icon}
                {item.label}
                {item.id === 'kafka' && kafkaTopics.some(t => t.dlqCount > 0) && (
                  <span className="absolute right-3 w-2 h-2 rounded-full bg-amber-500 animate-pulse"></span>
                )}
              </button>
            );
          })}
      </nav>

      {/* Kafka Status Indicators */}
      <div className="p-4 mx-3 my-4 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-2 text-[11px] text-slate-400">
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-500 uppercase tracking-wider text-[9px]">Cluster Topology</span>
          <span className={`px-1.5 py-0.5 rounded-full text-[9px] font-bold ${isHealthy ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            {isHealthy ? 'Operational' : 'Degraded'}
          </span>
        </div>
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Active Partitions</span>
            <span className="font-semibold text-slate-300">30</span>
          </div>
          <div className="flex items-center justify-between">
            <span>Inference Lag</span>
            <span className={`font-semibold ${kafkaTopics.some(t => t.lag > 200) ? 'text-amber-400' : 'text-slate-300'}`}>
              {kafkaTopics.reduce((acc, t) => acc + t.lag, 0)} events
            </span>
          </div>
        </div>
      </div>

      {/* Footer Controls */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between gap-2 mt-auto">
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg bg-slate-800/60 hover:bg-slate-800 text-slate-400 hover:text-slate-200 transition cursor-pointer"
          title="Toggle Light/Dark Theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>

        <button
          onClick={logout}
          className="flex-1 flex items-center justify-center gap-2 px-3 py-2 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 border border-rose-500/20 hover:border-rose-500/30 text-rose-400 hover:text-rose-300 text-xs font-semibold transition cursor-pointer"
        >
          <LogOut className="w-3.5 h-3.5" />
          Logout
        </button>
      </div>
    </aside>
  );
};
