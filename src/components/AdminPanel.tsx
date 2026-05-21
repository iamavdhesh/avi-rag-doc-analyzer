import React, { useState } from 'react';
import { useApp } from '../AppContext';
import {
  Cpu,
  Save,
  ShieldAlert,
  Code,
  Key,
  HelpCircle,
  TrendingUp
} from 'lucide-react';

export const AdminPanel: React.FC = () => {
  const {
    models,
    toggleModelActive,
    promptTemplates,
    updatePromptTemplate,
    systemMetrics,
    user
  } = useApp();

  const [selectedTemplateId, setSelectedTemplateId] = useState<string>(promptTemplates[0]?.id || '');
  const [promptText, setPromptText] = useState<string>(
    promptTemplates.find((t) => t.id === promptTemplates[0]?.id)?.systemPrompt || ''
  );

  const canModifyConfig = user?.role === 'Admin' || user?.role === 'Compliance Officer';

  // Handle template switch
  const handleTemplateSelect = (id: string) => {
    setSelectedTemplateId(id);
    const tmpl = promptTemplates.find((t) => t.id === id);
    if (tmpl) {
      setPromptText(tmpl.systemPrompt);
    }
  };

  // Save template prompt
  const handleSavePrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canModifyConfig) return;
    updatePromptTemplate(selectedTemplateId, promptText);
  };

  const selectedTemplate = promptTemplates.find((t) => t.id === selectedTemplateId);

  // Calculate mock token expenditure costs
  const totalCost = (systemMetrics.totalTokens / 1000) * 0.012; // average rate

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Title */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">System Settings & Prompt Policy Router</h2>
          <p className="text-xs text-slate-500">Configure LLM routing weights, manage RAG grounding templates, and inspect corporate quotas.</p>
        </div>
      </div>

      {/* Permissions Guard Banner */}
      {!canModifyConfig && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">Policy Read-Only State ({user?.role})</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Only **System Administrators** and **Compliance Officers** have write-access authorization to update RAG prompt directives or disable live LLM models.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Col: Prompt Template Directive Manager */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Code className="w-5 h-5 text-teal-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">RAG Grounding Prompt Templates</h3>
            </div>

            <p className="text-xs text-slate-500">
              Select and modify the system instruct template injected into the prompt context payload. Updates take effect immediately for new explorations.
            </p>

            {/* Template Selector Row */}
            <div className="flex gap-2 items-center overflow-x-auto pb-1">
              {promptTemplates.map((t) => (
                <button
                  key={t.id}
                  onClick={() => handleTemplateSelect(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-semibold border transition whitespace-nowrap cursor-pointer ${
                    selectedTemplateId === t.id
                      ? 'bg-teal-500/10 border-teal-500/40 text-teal-400 font-bold'
                      : 'border-slate-200 dark:border-slate-800 text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {t.name}
                </button>
              ))}
            </div>

            {/* System Prompt Form */}
            <form onSubmit={handleSavePrompt} className="space-y-4">
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-[11px] font-semibold text-slate-400">
                  <span>SYSTEM SYSTEM DIRECTIVE PROMPT</span>
                  <span>Last Modified: {selectedTemplate?.lastModified}</span>
                </div>

                <textarea
                  value={promptText}
                  onChange={(e) => setPromptText(e.target.value)}
                  disabled={!canModifyConfig}
                  rows={6}
                  className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-250 dark:border-slate-855 rounded-xl p-3 text-xs leading-relaxed focus:outline-none focus:border-teal-500/80 text-slate-800 dark:text-slate-100 disabled:opacity-60"
                  placeholder="System prompts instruct the LLM on grounding behavior..."
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1 text-[10px] text-slate-500 font-semibold">
                  <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
                  <span>Citations are auto-embedded regardless of custom prompt variables.</span>
                </div>

                <button
                  type="submit"
                  disabled={!canModifyConfig || promptText === selectedTemplate?.systemPrompt}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold bg-teal-500 text-slate-950 hover:bg-teal-400 disabled:opacity-40 transition cursor-pointer shadow-md font-bold"
                >
                  <Save className="w-3.5 h-3.5" />
                  Save Directive
                </button>
              </div>
            </form>
          </div>

          {/* Model Status Config panel */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-indigo-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Active LLM Model Configuration</h3>
            </div>
            
            <p className="text-xs text-slate-500">
              Toggle models to enable or disable routing availability. Disabled models will be greyed out in the AI Workspace.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {models.map((m) => (
                <div
                  key={m.id}
                  className={`p-3.5 rounded-xl border transition-all ${
                    m.active
                      ? 'bg-slate-50/50 dark:bg-slate-950/20 border-slate-200 dark:border-slate-800'
                      : 'bg-slate-100/40 dark:bg-slate-900/10 border-slate-100 dark:border-slate-800/40 opacity-60'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="font-bold text-xs text-slate-800 dark:text-white block">{m.name}</span>
                      <span className="text-[10px] text-slate-500">{m.provider} • Context: {m.contextWindow}</span>
                    </div>

                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={m.active}
                        disabled={!canModifyConfig}
                        onChange={() => toggleModelActive(m.id)}
                        className="sr-only peer"
                      />
                      <div className="w-9 h-5 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:height-4 after:w-4 after:transition-all dark:border-slate-600 peer-checked:bg-teal-500"></div>
                    </label>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800/60 flex items-center justify-between text-[9px] text-slate-500 font-semibold">
                    <span>Est Cost: ${m.costPer1k}/1K tokens</span>
                    <span>Latency: {m.latency}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Col: Token Statistics & Metrics */}
        <div className="lg:col-span-1 space-y-4">
          
          {/* Token Analytics Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-violet-500" />
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Corporate Resource Budget</h3>
            </div>

            <p className="text-xs text-slate-500">
              Aggregated API expenses derived from dynamic vector searches and synthetic completions.
            </p>

            <div className="space-y-4 text-xs">
              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Accumulated Tokens</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  {systemMetrics.totalTokens.toLocaleString()}
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Token Expense Estimate</span>
                <span className="font-mono font-bold text-emerald-500">
                  ${totalCost.toFixed(3)} USD
                </span>
              </div>

              <div className="flex items-center justify-between p-2.5 bg-slate-50 dark:bg-slate-950/40 rounded-xl border border-slate-100 dark:border-slate-800/50">
                <span className="text-slate-500 font-medium">Daily API Inquiries</span>
                <span className="font-mono font-bold text-slate-800 dark:text-white">
                  {systemMetrics.totalQueries} calls
                </span>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-150 dark:border-slate-800 text-[10px] text-slate-500 leading-normal">
              Rate Limit Threshold: **20 requests/minute** per corporate security policy parameters. Quotas rotate monthly.
            </div>
          </div>

          {/* Policy access permissions summary */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 shadow-sm space-y-3 font-mono text-xs">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-2">
              <Key className="w-4 h-4 text-teal-400" />
              <h3 className="text-xs font-bold text-white uppercase tracking-wider">Access Scope Router</h3>
            </div>
            
            <div className="space-y-2 text-[10px] text-slate-400">
              <div className="flex items-center justify-between">
                <span>Admin Settings</span>
                <span className="text-teal-400 font-bold">Granted</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Vector Index Redrive</span>
                <span className="text-teal-400 font-bold">Granted</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Prompt Injection Override</span>
                <span className={`font-bold ${canModifyConfig ? 'text-teal-400' : 'text-amber-500'}`}>
                  {canModifyConfig ? 'Granted' : 'Read Only'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
