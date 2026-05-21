import React, { useState } from 'react';
import { useApp } from '../AppContext';
import {
  FileText,
  Activity,
  Server,
  AlertTriangle,
  Play,
  Clock,
  ChevronRight,
  Sparkles
} from 'lucide-react';

export const DashboardModule: React.FC = () => {
  const {
    documents,
    systemMetrics,
    kafkaTopics,
    kafkaLogs,
    triggerSimulatedFailure,
    redriveDLQ
  } = useApp();

  const [activeChart, setActiveChart] = useState<'throughput' | 'latency' | 'queries'>('throughput');

  const totalDocsCount = documents.length;
  const readyDocsCount = documents.filter((d) => d.status === 'Ready').length;
  const pendingDocsCount = totalDocsCount - readyDocsCount;

  const totalLag = kafkaTopics.reduce((acc, t) => acc + t.lag, 0);
  const totalDlq = kafkaTopics.reduce((acc, t) => acc + t.dlqCount, 0);

  // SVG Chart Mock Datasets
  const chartsData = {
    throughput: {
      title: 'Kafka Ingestion Throughput (msg/s)',
      points: [120, 180, 240, 210, 310, 480, 420, 510, 490, 610, 540, 590],
      labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      color: 'stroke-teal-500',
      fill: 'fill-teal-500/10'
    },
    latency: {
      title: 'AI Processing Latency (ms)',
      points: [1800, 1650, 1420, 1580, 1450, 1220, 1310, 1150, 1080, 950, 1100, 1020],
      labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      color: 'stroke-indigo-500',
      fill: 'fill-indigo-500/10'
    },
    queries: {
      title: 'AI Query Volume (queries/hr)',
      points: [15, 24, 38, 42, 65, 88, 72, 95, 110, 145, 120, 138],
      labels: ['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00', '18:00', '19:00'],
      color: 'stroke-violet-500',
      fill: 'fill-violet-500/10'
    }
  };

  const currentChart = chartsData[activeChart];
  const maxVal = Math.max(...currentChart.points) * 1.15;
  const svgWidth = 600;
  const svgHeight = 220;

  // Calculate SVG graph line coordinates
  const svgPoints = currentChart.points
    .map((val, idx) => {
      const x = (idx / (currentChart.points.length - 1)) * (svgWidth - 60) + 40;
      const y = svgHeight - 40 - (val / maxVal) * (svgHeight - 60);
      return `${x},${y}`;
    })
    .join(' ');

  const areaPoints = `40,${svgHeight - 40} ${svgPoints} ${svgWidth - 20},${svgHeight - 40}`;

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Welcome Banner */}
      <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
        <div className="absolute top-[-20%] right-[-10%] w-[40%] h-[150%] bg-teal-500/5 rounded-full blur-[80px] pointer-events-none"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-2 text-xs font-semibold text-teal-400 uppercase tracking-widest mb-1.5">
            <Sparkles className="w-4 h-4" /> Cognitive Search Control Plane
          </div>
          <h2 className="text-xl font-bold text-white">System Operations Overview</h2>
          <p className="text-xs text-slate-400 mt-1 max-w-xl">
            Monitor distributed Kafka file routing ingestion, check text embedding alignment metrics, and inspect dynamic vector-retrieval latency thresholds.
          </p>
        </div>
        
        {/* Fast Action Buttons */}
        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={triggerSimulatedFailure}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-amber-500/10 border border-amber-500/25 hover:bg-amber-500/20 text-amber-400 hover:text-amber-300 transition cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Inject Kafka Lag
          </button>
          
          <button
            onClick={redriveDLQ}
            className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 transition cursor-pointer font-bold shadow-md shadow-teal-500/15"
          >
            <Play className="w-3.5 h-3.5" />
            Redrive DLQ Queue
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Documents */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Indexed Documents</span>
            <div className="flex items-baseline gap-2">
              <span className="text-2xl font-bold text-slate-800 dark:text-white">{readyDocsCount}</span>
              {pendingDocsCount > 0 && (
                <span className="text-xs font-semibold text-teal-500 bg-teal-500/15 px-1.5 py-0.5 rounded">
                  +{pendingDocsCount} pipeline
                </span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block">Total registered size: {totalDocsCount} items</span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <FileText className="w-6 h-6 text-teal-500" />
          </div>
        </div>

        {/* Card 2: AI Queries */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">AI Inquiries</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{systemMetrics.totalQueries}</span>
            <span className="text-[10px] text-emerald-500 font-semibold block">Grounding validation active</span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Activity className="w-6 h-6 text-indigo-500" />
          </div>
        </div>

        {/* Card 3: Processing Delay */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">Avg Latency</span>
            <span className="text-2xl font-bold text-slate-800 dark:text-white">{systemMetrics.avgLatency}s</span>
            <span className="text-[10px] text-slate-500 block">Vector search + Synthesis</span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Clock className="w-6 h-6 text-violet-500" />
          </div>
        </div>

        {/* Card 4: Kafka Status */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 p-5 rounded-2xl flex items-center justify-between shadow-sm">
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">DLQ & Lag status</span>
            <div className="flex items-center gap-1.5">
              <span className={`text-2xl font-bold ${totalDlq > 0 || totalLag > 100 ? 'text-amber-500' : 'text-slate-800 dark:text-white'}`}>
                {totalDlq} / {totalLag}
              </span>
              {totalDlq > 0 && (
                <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span>
              )}
            </div>
            <span className="text-[10px] text-slate-500 block">Dead letter / Consumer lag</span>
          </div>
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <Server className="w-6 h-6 text-pink-500" />
          </div>
        </div>
      </div>

      {/* Main Analytical Chart & Ingestion Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Analytics Graph */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Telemetry & Compute Logs</h3>
              <p className="text-xs text-slate-500">Live reporting aggregated across active cluster brokers</p>
            </div>
            <div className="flex items-center gap-1 p-0.5 bg-slate-100 dark:bg-slate-850 rounded-lg border border-slate-200 dark:border-slate-800/80">
              {(['throughput', 'latency', 'queries'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setActiveChart(tab)}
                  className={`px-3 py-1.5 rounded-md text-[11px] font-semibold transition cursor-pointer capitalize ${
                    activeChart === tab
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* SVG Line/Area Graph */}
          <div className="relative p-2 border border-slate-100 dark:border-slate-800/50 rounded-xl bg-slate-50/50 dark:bg-slate-950/40">
            <h4 className="text-[11px] font-semibold text-slate-400 absolute top-3 left-4 tracking-wider uppercase">
              {currentChart.title}
            </h4>

            <svg
              viewBox={`0 0 ${svgWidth} ${svgHeight}`}
              className="w-full h-56 font-mono text-[9px] text-slate-400"
            >
              {/* Y Axis grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                const yVal = svgHeight - 40 - ratio * (svgHeight - 60);
                const displayVal = Math.round(maxVal * ratio);
                return (
                  <g key={idx} className="opacity-40 dark:opacity-20">
                    <line
                      x1="40"
                      y1={yVal}
                      x2={svgWidth - 20}
                      y2={yVal}
                      stroke="currentColor"
                      strokeWidth="1"
                      strokeDasharray="4 4"
                    />
                    <text x="35" y={yVal + 3} textAnchor="end">
                      {displayVal}
                    </text>
                  </g>
                );
              })}

              {/* X Axis labels */}
              {currentChart.labels.map((lbl, idx) => {
                const x = (idx / (currentChart.labels.length - 1)) * (svgWidth - 60) + 40;
                return (
                  <text
                    key={idx}
                    x={x}
                    y={svgHeight - 15}
                    textAnchor="middle"
                    className="opacity-60 dark:opacity-40 font-semibold"
                  >
                    {lbl}
                  </text>
                );
              })}

              {/* Filled Area */}
              <polygon points={areaPoints} className={`${currentChart.fill} transition-all duration-300`} />

              {/* Line */}
              <polyline
                fill="none"
                strokeWidth="2.5"
                points={svgPoints}
                className={`${currentChart.color} transition-all duration-300`}
              />

              {/* Dots on points */}
              {currentChart.points.map((val, idx) => {
                const x = (idx / (currentChart.points.length - 1)) * (svgWidth - 60) + 40;
                const y = svgHeight - 40 - (val / maxVal) * (svgHeight - 60);
                return (
                  <circle
                    key={idx}
                    cx={x}
                    cy={y}
                    r="4"
                    className={`fill-white dark:fill-slate-900 stroke-2 cursor-pointer transition ${
                      activeChart === 'throughput'
                        ? 'stroke-teal-500'
                        : activeChart === 'latency'
                        ? 'stroke-indigo-500'
                        : 'stroke-violet-500'
                    }`}
                  />
                );
              })}
            </svg>
          </div>
        </div>

        {/* Live Vector Ingesting Monitor */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm flex flex-col justify-between">
          <div className="space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Active Ingestion Inboxes</h3>
              <p className="text-xs text-slate-500">Live status of documents processing inside Kafka partitions</p>
            </div>

            <div className="space-y-3.5">
              {documents.slice(0, 4).map((doc) => {
                const statuses = {
                  Ready: { color: 'bg-emerald-500', text: 'Ready', bg: 'bg-emerald-500/10 text-emerald-500' },
                  'Kafka Ingesting': { color: 'bg-indigo-500', text: 'Kafka Queue', bg: 'bg-indigo-500/10 text-indigo-500' },
                  Chunking: { color: 'bg-violet-500', text: 'Chunking', bg: 'bg-violet-500/10 text-violet-500' },
                  'Vector Indexing': { color: 'bg-teal-500', text: 'Indexing', bg: 'bg-teal-500/10 text-teal-500' },
                  Failed: { color: 'bg-rose-500', text: 'Failed', bg: 'bg-rose-500/10 text-rose-500' }
                };

                const currentStatus = statuses[doc.status];

                return (
                  <div key={doc.id} className="p-2.5 rounded-xl border border-slate-100 dark:border-slate-800/40 bg-slate-50/40 dark:bg-slate-950/20 space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="min-w-0 flex-1 pr-2">
                        <span className="font-bold text-xs text-slate-700 dark:text-slate-200 block truncate">
                          {doc.name}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          Size: {doc.size} • {doc.chunksCount || 0} chunks
                        </span>
                      </div>
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${currentStatus.bg}`}>
                        {currentStatus.text}
                      </span>
                    </div>

                    {/* Progress Bar */}
                    {doc.status !== 'Ready' && doc.status !== 'Failed' && (
                      <div className="space-y-1">
                        <div className="flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                          <span>Progress:</span>
                          <span>{doc.progress}%</span>
                        </div>
                        <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div
                            className={`h-full transition-all duration-300 rounded-full ${currentStatus.color}`}
                            style={{ width: `${doc.progress}%` }}
                          />
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 mt-4 flex justify-between items-center text-xs">
            <span className="text-slate-500 font-semibold">Kafka Topic: document-ingestion-v1</span>
            <div className="flex items-center gap-1 text-teal-500 font-bold">
              <span>Dynamic scale</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </div>
          </div>
        </div>
      </div>

      {/* Live Kafka Ingestion Log Terminal Console */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-lg space-y-3 font-mono">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div className="flex items-center gap-2">
            <Server className="w-4 h-4 text-teal-400" />
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">AVI RAG Core Log Console (Kafka Stream)</h3>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-widest">Listening</span>
          </div>
        </div>

        <div className="h-44 overflow-y-auto space-y-1.5 text-xs text-slate-300 pr-2">
          {kafkaLogs.map((log, index) => {
            let color = 'text-slate-300';
            if (log.includes('[ERROR]')) color = 'text-rose-400 font-semibold';
            else if (log.includes('[WARNING]')) color = 'text-amber-400';
            else if (log.includes('[SYSTEM]')) color = 'text-teal-400';
            else if (log.includes('[METRICS]')) color = 'text-violet-400';
            else if (log.includes('[KAFKA]')) color = 'text-sky-400';

            return (
              <div key={index} className={`flex items-start gap-1 ${color}`}>
                <span className="text-slate-500 flex-shrink-0">[{10 - (index % 10)}s ago]</span>
                <span className="break-all">{log}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
