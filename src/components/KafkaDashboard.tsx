import React from 'react';
import { useApp } from '../AppContext';
import {
  Server,
  AlertTriangle,
  Play,
  Cpu,
  Gauge
} from 'lucide-react';

export const KafkaDashboard: React.FC = () => {
  const {
    kafkaTopics,
    kafkaRateLimit,
    setKafkaRateLimit,
    kafkaLogs,
    triggerSimulatedFailure,
    redriveDLQ,
    user
  } = useApp();

  const totalLag = kafkaTopics.reduce((acc, t) => acc + t.lag, 0);
  const totalDlq = kafkaTopics.reduce((acc, t) => acc + t.dlqCount, 0);

  const canModifyConfig = user?.role === 'Admin' || user?.role === 'Data Engineer';

  // Custom SVG Chart data for throughput fluctuations
  const systemHourTicks = ['10 AM', '11 AM', '12 PM', '01 PM', '02 PM', '03 PM', '04 PM', '05 PM'];
  const eventRates = [140, 190, 260, 240, 310, 480, 410, 520];
  const lagRates = [45, 60, 95, 70, 110, 240, 190, 14];

  // Render SVG charts
  const width = 500;
  const height = 180;
  
  const getCoordinates = (data: number[], max: number) => {
    return data.map((val, idx) => {
      const x = (idx / (data.length - 1)) * (width - 60) + 40;
      const y = height - 30 - (val / max) * (height - 50);
      return `${x},${y}`;
    }).join(' ');
  };

  const throughputCoords = getCoordinates(eventRates, 600);
  const lagCoords = getCoordinates(lagRates, 300);

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      {/* Page Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Distributed Kafka Broker & Stream Monitor</h2>
          <p className="text-xs text-slate-500">Real-time inspection of file chunk ingestion buffers, consumer lag, and inference logs.</p>
        </div>

        {/* Global Cluster Stats */}
        <div className="flex items-center gap-3">
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
            Broker Nodes: <span className="text-teal-500">3 Active</span>
          </div>
          <div className="px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-800">
            Zookeeper Mode: <span className="text-indigo-400">KRaft Sync</span>
          </div>
        </div>
      </div>

      {/* Role Action Alert Banner */}
      {!canModifyConfig && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">Restricted Operations Context ({user?.role})</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Only **System Administrators** and **Data Engineers** can manipulate active Kakfa rate limits, execute DLQ redrive queries, or inject lag failures.
            </p>
          </div>
        </div>
      )}

      {/* Quick Config / Rate limits row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Rate limits card */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center gap-2">
            <Gauge className="w-5 h-5 text-teal-500" />
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Ingestion Rate Limiting</h3>
          </div>
          <p className="text-xs text-slate-500 leading-normal">
            Adjust the sliding rate-limit configuration to throttle consumer thread pools during peak LLM API usage.
          </p>

          <div className="space-y-2.5">
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-slate-400">Maximum Ingest Rate:</span>
              <span className="text-slate-800 dark:text-white">{kafkaRateLimit} msg/sec</span>
            </div>
            <input
              type="range"
              min="50"
              max="1000"
              step="50"
              value={kafkaRateLimit}
              disabled={!canModifyConfig}
              onChange={(e) => setKafkaRateLimit(parseInt(e.target.value))}
              className="w-full h-1.5 bg-slate-250 dark:bg-slate-800 rounded-lg appearance-none cursor-pointer accent-teal-500 disabled:opacity-40"
            />
            <div className="flex justify-between text-[10px] text-slate-400 font-semibold">
              <span>50 msg/s</span>
              <span>500 msg/s</span>
              <span>1000 msg/s</span>
            </div>
          </div>

          <div className="p-3 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-850 flex items-center justify-between text-xs">
            <div className="space-y-0.5">
              <span className="text-slate-500 font-medium">Thread Congestion:</span>
              <span className="text-emerald-500 font-bold block">Optimized (Low)</span>
            </div>
            <span className="font-mono text-[10px] text-slate-400 bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded">
              Quota: Unlimited
            </span>
          </div>
        </div>

        {/* DLQ redrive dashboard card */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-500" />
                <h3 className="font-bold text-sm text-slate-800 dark:text-white">Dead Letter Queue (DLQ) Recovery</h3>
              </div>
              {totalDlq > 0 && (
                <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-500 font-bold text-[10px]">
                  Unparseable payloads detected
                </span>
              )}
            </div>
            <p className="text-xs text-slate-500 leading-normal">
              When documents trigger parsing timeouts (e.g. unencrypted PDFs or legacy DOC formats), they are quarantined inside the `dlq-unparseable-files` topic. Press Redrive below to submit quarantined payloads for re-evaluation once credentials check completes.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 mt-4 justify-between">
            <div className="flex items-center gap-6 text-xs font-semibold">
              <div className="space-y-0.5">
                <span className="text-slate-400 block">Total Quarantined</span>
                <span className={`text-lg font-bold ${totalDlq > 0 ? 'text-rose-500' : 'text-slate-700 dark:text-slate-300'}`}>
                  {totalDlq} events
                </span>
              </div>
              <div className="space-y-0.5">
                <span className="text-slate-400 block">System Congestion Lag</span>
                <span className="text-lg font-bold text-slate-700 dark:text-slate-300">{totalLag} msg</span>
              </div>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <button
                onClick={triggerSimulatedFailure}
                disabled={!canModifyConfig}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-400 transition cursor-pointer disabled:opacity-40"
              >
                Inject Failure
              </button>
              <button
                onClick={redriveDLQ}
                disabled={!canModifyConfig || totalDlq === 0}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 transition font-bold disabled:opacity-40 cursor-pointer shadow-md"
              >
                <Play className="w-3.5 h-3.5" />
                Redrive DLQ
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Kafka Topics Table status */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between">
          <div>
            <h3 className="font-bold text-sm text-slate-800 dark:text-white">Kafka Cluster Topic Registry</h3>
            <p className="text-xs text-slate-500">Consumer group statistics, offsets committed, and lags</p>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <span>All consumer loops active</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                <th className="py-3 px-4">Topic Name</th>
                <th className="py-3 px-4">Partitions</th>
                <th className="py-3 px-4">Consumers</th>
                <th className="py-3 px-4">Throughput (msg/s)</th>
                <th className="py-3 px-4">Offset Lag</th>
                <th className="py-3 px-4">DLQ Status</th>
                <th className="py-3 px-4 text-right">Topology state</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
              {kafkaTopics.map((topic) => {
                const isHealthy = topic.status === 'Healthy';
                const isDegraded = topic.status === 'Degraded';
                
                return (
                  <tr key={topic.name} className="hover:bg-slate-50/50 dark:hover:bg-slate-950/20 transition">
                    {/* Topic Name */}
                    <td className="py-3.5 px-4 font-mono font-bold text-slate-800 dark:text-white flex items-center gap-2">
                      <Server className="w-3.5 h-3.5 text-slate-400" />
                      {topic.name}
                    </td>

                    {/* Partitions */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {topic.partitions}
                    </td>

                    {/* Consumers */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {topic.consumers}
                    </td>

                    {/* Throughput */}
                    <td className="py-3.5 px-4 font-semibold text-slate-800 dark:text-slate-200">
                      {topic.throughputRate} msg/s
                    </td>

                    {/* Offset Lag */}
                    <td className="py-3.5 px-4">
                      <span className={`font-semibold ${topic.lag > 100 ? 'text-amber-500 font-bold animate-pulse' : 'text-slate-800 dark:text-slate-200'}`}>
                        {topic.lag} msg
                      </span>
                    </td>

                    {/* DLQ Count */}
                    <td className="py-3.5 px-4">
                      {topic.dlqCount > 0 ? (
                        <span className="px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/25 text-rose-500 font-bold text-[10px]">
                          {topic.dlqCount} quarantined
                        </span>
                      ) : (
                        <span className="text-slate-400 text-[10px] font-semibold">0 failed</span>
                      )}
                    </td>

                    {/* Topology State */}
                    <td className="py-3.5 px-4 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isHealthy
                          ? 'bg-emerald-500/10 text-emerald-500 border border-emerald-500/20'
                          : isDegraded
                          ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20'
                          : 'bg-rose-500/10 text-rose-500 border border-rose-500/20'
                      }`}>
                        {topic.status}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* SVG charts: Event throughput and Processing latency */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Chart 1 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Active Event Throughput</h3>
            <p className="text-[11px] text-slate-500">Aggregation metrics of consumers over standard time interval</p>
          </div>

          <div className="relative p-2 border border-slate-100 dark:border-slate-800/50 rounded-xl bg-slate-55/30 dark:bg-slate-950/40">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 text-[9px] font-mono text-slate-400">
              {/* Grid lines */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const yVal = height - 30 - ratio * (height - 50);
                const displayVal = Math.round(600 * ratio);
                return (
                  <g key={idx} className="opacity-30 dark:opacity-10">
                    <line x1="40" y1={yVal} x2={width - 20} y2={yVal} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="35" y={yVal + 3} textAnchor="end">{displayVal}</text>
                  </g>
                );
              })}

              {/* Labels */}
              {systemHourTicks.map((tick, idx) => {
                const x = (idx / (systemHourTicks.length - 1)) * (width - 60) + 40;
                return (
                  <text key={idx} x={x} y={height - 8} textAnchor="middle" className="opacity-60 font-semibold">{tick}</text>
                );
              })}

              {/* coordinates line */}
              <polyline fill="none" strokeWidth="2.5" points={throughputCoords} className="stroke-teal-500" />
            </svg>
          </div>
        </div>

        {/* Chart 2 */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div>
            <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest">Consumer Ingestion Lag Trend</h3>
            <p className="text-[11px] text-slate-500">Unprocessed logs backlog rate inside synchronization segments</p>
          </div>

          <div className="relative p-2 border border-slate-100 dark:border-slate-800/50 rounded-xl bg-slate-55/30 dark:bg-slate-950/40">
            <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-44 text-[9px] font-mono text-slate-400">
              {/* Grid lines */}
              {[0, 0.5, 1].map((ratio, idx) => {
                const yVal = height - 30 - ratio * (height - 50);
                const displayVal = Math.round(300 * ratio);
                return (
                  <g key={idx} className="opacity-30 dark:opacity-10">
                    <line x1="40" y1={yVal} x2={width - 20} y2={yVal} stroke="currentColor" strokeWidth="1" strokeDasharray="3 3" />
                    <text x="35" y={yVal + 3} textAnchor="end">{displayVal}</text>
                  </g>
                );
              })}

              {/* Labels */}
              {systemHourTicks.map((tick, idx) => {
                const x = (idx / (systemHourTicks.length - 1)) * (width - 60) + 40;
                return (
                  <text key={idx} x={x} y={height - 8} textAnchor="middle" className="opacity-60 font-semibold">{tick}</text>
                );
              })}

              {/* coordinates line */}
              <polyline fill="none" strokeWidth="2.5" points={lagCoords} className="stroke-indigo-500" />
            </svg>
          </div>
        </div>
      </div>

      {/* Scrolling terminal logs inside Broker */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Cpu className="w-4 h-4 text-indigo-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Active Kafka Producer Log Stream</h3>
          </div>
          <span className="text-[10px] text-slate-500">Connected Bootstrap: broker-1:9092</span>
        </div>

        <div className="h-44 overflow-y-auto space-y-2 text-xs pr-2">
          {kafkaLogs.map((log, index) => {
            let logColor = 'text-slate-400';
            if (log.includes('[ERROR]')) logColor = 'text-rose-400 font-bold';
            else if (log.includes('[WARNING]')) logColor = 'text-amber-400 font-bold';
            else if (log.includes('[SYSTEM]')) logColor = 'text-teal-400';
            
            return (
              <div key={index} className={`flex items-start gap-1.5 ${logColor}`}>
                <span className="text-slate-500 font-bold">↳</span>
                <span className="break-all">{log}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
