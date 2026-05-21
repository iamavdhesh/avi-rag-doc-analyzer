import React, { useState } from 'react';
import { useApp } from '../AppContext';
import { Citation } from '../mockData';
import { Database, Search, Target, Award, Compass, HelpCircle } from 'lucide-react';

interface RAGInsightsProps {
  citations: Citation[];
  agentSteps: string[];
}

export const RAGInsights: React.FC<RAGInsightsProps> = ({ citations, agentSteps }) => {
  const { documents } = useApp();
  const [semanticQuery, setSemanticQuery] = useState('');
  const [semanticResults, setSemanticResults] = useState<any[]>([]);
  const [searching, setSearching] = useState(false);

  // Execute a mock semantic vector search
  const handleSemanticSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!semanticQuery.trim()) return;

    setSearching(true);
    setTimeout(() => {
      const queryLower = semanticQuery.toLowerCase();
      const results: any[] = [];

      documents.forEach((doc) => {
        if (doc.status !== 'Ready') return;

        // Mock chunks based on keyword matching
        if (queryLower.includes('retry') || queryLower.includes('gateway') || queryLower.includes('backoff')) {
          if (doc.id === 'doc-3') {
            results.push({
              docName: doc.name,
              score: 0.98,
              chunkId: `chunk-3-1`,
              text: 'Retry configuration variables: max_retry_attempts=3, base_backoff_seconds=1.5, backoff_factor=2.0. On exhaustion, route to payment-retry-dlq topic.',
              dimensions: 1536
            });
            results.push({
              docName: doc.name,
              score: 0.89,
              chunkId: `chunk-3-2`,
              text: 'Exponential backoff schedules calculate subsequent latency retry durations dynamically with random Jitter modifiers added.',
              dimensions: 1536
            });
          }
        } else if (queryLower.includes('financial') || queryLower.includes('risk') || queryLower.includes('dollar') || queryLower.includes('margin')) {
          if (doc.id === 'doc-1') {
            results.push({
              docName: doc.name,
              score: 0.95,
              chunkId: `chunk-1-12`,
              text: 'Foreign currency fluctuation details: EUR to USD volatility net exposure calculated at $1,200,000 adverse variance.',
              dimensions: 1536
            });
            results.push({
              docName: doc.name,
              score: 0.91,
              chunkId: `chunk-1-19`,
              text: 'SaaS computing costs increased from $4.2M to $4.79M (up 14%) driven by RAG vector store scale and heavy embedding generations.',
              dimensions: 1536
            });
          }
        } else if (queryLower.includes('security') || queryLower.includes('compliance') || queryLower.includes('ciso')) {
          if (doc.id === 'doc-2') {
            results.push({
              docName: doc.name,
              score: 0.97,
              chunkId: `chunk-2-4`,
              text: 'Zero Trust Access: IAM role rotation policy requires maximum 240-minute tokens for console access.',
              dimensions: 1536
            });
            results.push({
              docName: doc.name,
              score: 0.93,
              chunkId: `chunk-2-8`,
              text: 'Remediation times: Critical vulnerabilities = 48h, High vulnerabilities = 7 days. Automatic quarantine is enforced.',
              dimensions: 1536
            });
          }
        }
      });

      // Default result if nothing specific is found
      if (results.length === 0) {
        const doc = documents.find((d) => d.status === 'Ready') || documents[0];
        if (doc) {
          results.push({
            docName: doc.name,
            score: 0.82,
            chunkId: `chunk-gen-1`,
            text: `Evaluated semantic vector match for: "${semanticQuery}" inside namespace. Character offset: 120-430.`,
            dimensions: 1536
          });
        }
      }

      setSemanticResults(results);
      setSearching(false);
    }, 600);
  };

  return (
    <div className="space-y-5 h-full flex flex-col">
      
      {/* Title */}
      <div>
        <h3 className="font-bold text-xs text-slate-400 uppercase tracking-widest flex items-center gap-1.5 mb-1">
          <Database className="w-3.5 h-3.5 text-teal-500" /> RAG Grounding Engine
        </h3>
        <p className="text-[10px] text-slate-500">Vector similarity inspect control panel</p>
      </div>

      {/* Semantic Search Sandbox */}
      <div className="bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-xl p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1">
            <Compass className="w-3.5 h-3.5 text-teal-400" /> Vector Space Sandbox
          </span>
          <span className="text-[9px] font-mono text-slate-500 bg-slate-200 dark:bg-slate-800 px-1.5 py-0.5 rounded">Ada-002</span>
        </div>

        <form onSubmit={handleSemanticSearch} className="relative">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          <input
            type="text"
            value={semanticQuery}
            onChange={(e) => setSemanticQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-950 border border-slate-250 dark:border-slate-850 hover:border-slate-350 focus:border-teal-500 rounded-lg py-1.5 pl-8 pr-4 text-[11px] text-slate-800 dark:text-slate-250 focus:outline-none transition"
            placeholder="Type query to test index similarity..."
          />
        </form>

        <div className="space-y-2 max-h-44 overflow-y-auto text-[10px]">
          {searching ? (
            <div className="text-center py-4 text-slate-500 flex items-center justify-center gap-1.5">
              <svg className="animate-spin h-3.5 w-3.5 text-teal-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
              Executing Cosine Distance search...
            </div>
          ) : semanticResults.length > 0 ? (
            semanticResults.map((r, i) => (
              <div key={i} className="p-2 border border-slate-200 dark:border-slate-800 rounded bg-white dark:bg-slate-950/40 space-y-1">
                <div className="flex items-center justify-between text-[9px] font-semibold text-slate-500">
                  <span className="truncate max-w-[100px] text-teal-500 font-bold">{r.docName}</span>
                  <span className="flex items-center gap-0.5 text-emerald-500 bg-emerald-500/10 px-1 rounded">
                    <Target className="w-2.5 h-2.5" />
                    Score: {r.score.toFixed(2)}
                  </span>
                </div>
                <p className="text-slate-600 dark:text-slate-300 leading-normal line-clamp-2">{r.text}</p>
                <div className="text-[8px] text-slate-500 flex justify-between font-mono">
                  <span>ID: {r.chunkId}</span>
                  <span>Dim: {r.dimensions}</span>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-4 text-slate-400">
              No sandboxed vector searches run yet. Type e.g. "retry rules" above to test.
            </div>
          )}
        </div>
      </div>

      {/* RAG Citations Panel (Active Query) */}
      <div className="flex-1 flex flex-col min-h-0">
        <span className="text-xs font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1 mb-2">
          <Award className="w-3.5 h-3.5 text-indigo-400" /> Active Citation Chunks
        </span>

        {citations.length === 0 ? (
          <div className="flex-1 bg-slate-50 dark:bg-slate-900/30 border border-slate-200 dark:border-slate-800 rounded-xl p-4 flex flex-col items-center justify-center text-center">
            <HelpCircle className="w-6 h-6 text-slate-400 mb-2" />
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">No Citations Retreived</span>
            <p className="text-[10px] text-slate-500 max-w-[160px] mt-1">
              Submit a prompt about indexed files to view source embedding vectors.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 text-[11px]">
            
            {/* Agent steps checklist */}
            {agentSteps.length > 0 && (
              <div className="p-3 bg-indigo-500/5 border border-indigo-500/10 rounded-xl space-y-2">
                <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider block">Agent Query Workflow:</span>
                <div className="space-y-1.5 text-[10px] text-slate-400">
                  {agentSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-1.5">
                      <span className="text-indigo-400 font-bold">{idx + 1}.</span>
                      <span className="leading-tight">{step}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Citations List */}
            {citations.map((cite, idx) => (
              <div
                key={idx}
                className="p-3 border border-slate-200 dark:border-slate-800 rounded-xl bg-white dark:bg-slate-900/60 shadow-sm space-y-2"
              >
                <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-1.5">
                  <div className="min-w-0 pr-2">
                    <span className="font-bold text-slate-800 dark:text-white block truncate">{cite.filename}</span>
                    <span className="text-[9px] text-slate-500">Page {cite.page} • Ada-002 Ada embedding</span>
                  </div>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-extrabold text-[10px] whitespace-nowrap">
                    Score: {cite.score.toFixed(2)}
                  </span>
                </div>

                <blockquote className="text-slate-600 dark:text-slate-300 italic leading-relaxed pl-2.5 border-l-2 border-teal-500/60 bg-slate-50 dark:bg-slate-950/20 py-1">
                  "{cite.text}"
                </blockquote>

                <div className="flex items-center justify-between text-[9px] text-slate-500 font-mono">
                  <span>Chunk Reference: idx-{idx + 1}</span>
                  <span>Distance: Cosine</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
