import React from 'react';
import { useApp } from '../AppContext';
import { HardDrive, Wifi, Bell, RefreshCw } from 'lucide-react';

interface HeaderProps {
  activeTab: string;
}

export const Header: React.FC<HeaderProps> = ({ activeTab }) => {
  const { user, login, kafkaTopics, systemMetrics } = useApp();

  const getBreadcrumb = () => {
    switch (activeTab) {
      case 'dashboard':
        return 'Control Panel / Analytical Analytics';
      case 'documents':
        return 'Ingestion Portal / Document Store';
      case 'chat':
        return 'AI Workspace / Knowledge Retrieval RAG';
      case 'kafka':
        return 'Distributed Stream / Kafka Logs Monitor';
      case 'admin':
        return 'System Configuration / Policy Router';
      default:
        return 'Home';
    }
  };

  const dlqAlertCount = kafkaTopics.reduce((acc, t) => acc + t.dlqCount, 0);

  return (
    <header className="h-16 border-b border-slate-200 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/60 backdrop-blur-md px-6 flex items-center justify-between sticky top-0 z-10">
      
      {/* Breadcrumb path */}
      <div className="flex items-center gap-2">
        <HardDrive className="w-4 h-4 text-slate-400 dark:text-slate-500" />
        <span className="text-xs text-slate-400 dark:text-slate-500">AVI_CORE</span>
        <span className="text-slate-300 dark:text-slate-700">/</span>
        <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">{getBreadcrumb()}</span>
      </div>

      {/* Cluster status telemetry */}
      <div className="flex items-center gap-6">
        
        {/* Real-time Ingestion Telemetry */}
        <div className="hidden lg:flex items-center gap-4 text-xs">
          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
            <Wifi className="w-3.5 h-3.5 text-teal-500 animate-pulse" />
            <span className="text-slate-500 dark:text-slate-400">Broker Stream:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">
              {kafkaTopics.reduce((acc, t) => acc + t.throughputRate, 0)} msg/s
            </span>
          </div>

          <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-800 px-2.5 py-1 rounded-lg">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-500" />
            <span className="text-slate-500 dark:text-slate-400">Total Chunks:</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200">{systemMetrics.totalEmbeddings} nodes</span>
          </div>

          {dlqAlertCount > 0 && (
            <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/25 px-2.5 py-1 rounded-lg text-rose-500 font-semibold animate-pulse">
              <span>DLQ Alert:</span>
              <span>{dlqAlertCount} quarantined</span>
            </div>
          )}
        </div>

        {/* Dynamic Persona Swapper for demo purposes */}
        <div className="flex items-center gap-2 border-l border-slate-200 dark:border-slate-800 pl-6">
          <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider hidden sm:inline">Demo Persona:</span>
          <select
            value={user?.role || 'Admin'}
            onChange={(e) => {
              if (user) {
                login(user.username, e.target.value);
              }
            }}
            className="bg-slate-100 dark:bg-slate-850 hover:bg-slate-200 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800/80 rounded-lg text-xs font-semibold px-2 py-1 focus:outline-none cursor-pointer text-slate-700 dark:text-slate-200"
          >
            <option value="Admin">Administrator</option>
            <option value="Data Engineer">Data Engineer</option>
            <option value="Compliance Officer">Compliance Officer</option>
            <option value="General User">General User</option>
          </select>
        </div>

        {/* Audit Log / Alerts panel indicator */}
        <div className="relative">
          <button className="p-2 rounded-lg bg-slate-100 dark:bg-slate-800/60 hover:bg-slate-200 dark:hover:bg-slate-800 text-slate-500 dark:text-slate-400 transition relative">
            <Bell className="w-4 h-4" />
            {dlqAlertCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500"></span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
