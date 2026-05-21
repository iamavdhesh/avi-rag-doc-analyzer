import React from 'react';
import { useApp } from '../AppContext';
import { CheckCircle2, AlertTriangle, AlertCircle, Info, X } from 'lucide-react';

export const NotificationCenter: React.FC = () => {
  const { notifications, removeNotification } = useApp();

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3 max-w-sm w-full">
      {notifications.map((n) => {
        const icons = {
          success: <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />,
          info: <Info className="w-5 h-5 text-sky-500 flex-shrink-0" />,
          warning: <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0" />,
          error: <AlertCircle className="w-5 h-5 text-rose-500 flex-shrink-0" />
        };

        const bgColors = {
          success: 'bg-white dark:bg-slate-900 border-emerald-500/30 dark:border-emerald-500/25',
          info: 'bg-white dark:bg-slate-900 border-sky-500/30 dark:border-sky-500/25',
          warning: 'bg-white dark:bg-slate-900 border-amber-500/30 dark:border-amber-500/25',
          error: 'bg-white dark:bg-slate-900 border-rose-500/30 dark:border-rose-500/25'
        };

        return (
          <div
            key={n.id}
            className={`flex items-start gap-3 p-4 rounded-xl border shadow-lg animate-slide-in backdrop-blur-md transition-all duration-300 ${bgColors[n.type]}`}
          >
            {icons[n.type]}
            <div className="flex-1 text-sm font-medium text-slate-800 dark:text-slate-200">
              {n.message}
            </div>
            <button
              onClick={() => removeNotification(n.id)}
              className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-100 p-0.5 rounded-lg transition"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
