import React, { useState, useRef, useEffect } from 'react';
import { useApp } from '../AppContext';
import { RAGInsights } from './RAGInsights';
import {
  Plus,
  Trash2,
  Bot,
  User,
  Copy,
  RotateCcw,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  Download,
  Share2,
  ChevronDown,
  Clock,
  Layers,
  Award,
  Check,
  SendHorizontal
} from 'lucide-react';

export const AIChatWorkspace: React.FC = () => {
  const {
    conversations,
    activeChatId,
    setActiveChatId,
    createConversation,
    deleteConversation,
    sendChatMessage,
    regenerateResponse,
    models,
    activeModelId,
    setActiveModelId,
    promptTemplates,
    activePromptTemplateId,
    setActivePromptTemplateId,
    isStreaming,
    streamingText,
    currentCitations,
    currentAgentSteps,
    addNotification
  } = useApp();

  const [inputMessage, setInputMessage] = useState('');
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [speakingId, setSpeakingId] = useState<string | null>(null);
  const [isRecording, setIsRecording] = useState(false);
  const [showRAGInsights, setShowRAGInsights] = useState(true);
  const [showSlackModal, setShowSlackModal] = useState(false);
  const [showAgentPathId, setShowAgentPathId] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const synthRef = useRef<SpeechSynthesis | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      synthRef.current = window.speechSynthesis;
    }
    return () => {
      if (synthRef.current) {
        synthRef.current.cancel();
      }
    };
  }, []);

  // Scroll to bottom when messages or streaming text updates
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [conversations, streamingText, isStreaming]);

  const activeChat = conversations.find((c) => c.id === activeChatId);

  // Send message
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!inputMessage.trim() || isStreaming) return;

    const textToSend = inputMessage;
    setInputMessage('');
    await sendChatMessage(textToSend);
  };

  // Suggestions
  const handleSuggestionClick = (prompt: string) => {
    if (isStreaming) return;
    setInputMessage(prompt);
  };

  // Copy to clipboard
  const handleCopy = (id: string, text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedId(id);
    addNotification('Response copied to clipboard', 'success');
    setTimeout(() => setCopiedId(null), 2000);
  };

  // Text to speech toggle
  const handleSpeech = (id: string, text: string) => {
    if (!synthRef.current) {
      addNotification('Speech synthesis not supported in this browser', 'error');
      return;
    }

    if (speakingId === id) {
      synthRef.current.cancel();
      setSpeakingId(null);
      return;
    }

    synthRef.current.cancel();
    const cleanText = text.replace(/[*#`_\-]/g, ''); // strip markdown syntax
    const utterance = new SpeechSynthesisUtterance(cleanText);
    
    utterance.onend = () => {
      setSpeakingId(null);
    };

    setSpeakingId(id);
    synthRef.current.speak(utterance);
  };

  // Simulated Voice Dictation Input
  const handleVoiceInput = () => {
    if (isRecording) {
      setIsRecording(false);
      return;
    }

    addNotification('Listening via corporate gateway microphone...', 'info');
    setIsRecording(true);

    // Check if webkitSpeechRecognition exists
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.lang = 'en-US';
      recognition.interimResults = false;

      recognition.onresult = (event: any) => {
        const transcript = event.results[0][0].transcript;
        setInputMessage((prev) => prev + (prev ? ' ' : '') + transcript);
        setIsRecording(false);
        addNotification(`Voice captured: "${transcript.substring(0, 30)}..."`, 'success');
      };

      recognition.onerror = () => {
        setIsRecording(false);
        addNotification('Speech recognition encountered an access error.', 'warning');
      };

      recognition.onend = () => {
        setIsRecording(false);
      };

      recognition.start();
    } else {
      // Simulate voice input fallback
      setTimeout(() => {
        setIsRecording(false);
        const presets = [
          'What are the core risks listed for EUR margin fluctuations?',
          'Explain how the Kafka retry schedules operate.',
          'Identify security mandates for secrets management.'
        ];
        const randomPreset = presets[Math.floor(Math.random() * presets.length)];
        setInputMessage(randomPreset);
        addNotification(`Voice Simulation: "${randomPreset}"`, 'success');
      }, 2500);
    }
  };

  // Export chat log
  const handleExport = () => {
    if (!activeChat || activeChat.messages.length === 0) {
      addNotification('Cannot export empty conversation log.', 'warning');
      return;
    }

    let textContent = `AVI RAG EXPORT\n`;
    textContent += `Session: ${activeChat.title}\n`;
    textContent += `Timestamp: ${new Date().toUTCString()}\n`;
    textContent += `Model Routing: ${activeChat.model}\n`;
    textContent += `==========================================\n\n`;

    activeChat.messages.forEach((m) => {
      const role = m.sender === 'user' ? 'USER' : 'AI RETRIEVAL';
      textContent += `[${role}] (${m.timestamp}):\n${m.text}\n`;
      if (m.citations && m.citations.length > 0) {
        textContent += `Citations:\n`;
        m.citations.forEach((c) => {
          textContent += `- File: ${c.filename} | Score: ${c.score} | Page: ${c.page}\n`;
        });
      }
      textContent += `------------------------------------------\n\n`;
    });

    const element = document.createElement('a');
    const file = new Blob([textContent], { type: 'text/plain' });
    element.href = URL.createObjectURL(file);
    element.download = `${activeChat.title.replace(/\s+/g, '_')}_transcript.txt`;
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
    
    addNotification('Conversation transcript downloaded successfully', 'success');
  };

  // Share to Slack Simulation
  const handleSlackShare = () => {
    setShowSlackModal(false);
    addNotification('Successfully posted context citation card to #security-alerts Slack channel', 'success');
  };

  // Suggested prompt chips
  const suggestedPrompts = [
    'Explain API Gateway retry parameters',
    'What are the EUR-USD financial risks?',
    'List SOC2 Zero-Trust audit guidelines',
    'Summarize current vector space coverage'
  ];

  return (
    <div id="chat-redirect" className="flex-1 flex overflow-hidden h-[calc(100vh-4rem)]">
      
      {/* 1. Conversations Sidebar (Left side of chat) */}
      <div className="w-64 border-r border-slate-200 dark:border-slate-800/80 bg-slate-50 dark:bg-slate-900/40 flex flex-col flex-shrink-0">
        
        {/* New chat trigger */}
        <div className="p-4">
          <button
            onClick={() => createConversation()}
            className="w-full flex items-center justify-center gap-2 px-3 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 transition cursor-pointer shadow-sm active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            New Exploration
          </button>
        </div>

        {/* Conversation archive items list */}
        <div className="flex-1 overflow-y-auto px-2 space-y-1">
          {conversations.length === 0 ? (
            <div className="text-center py-8 text-xs text-slate-400 dark:text-slate-500">
              No active explorations
            </div>
          ) : (
            conversations.map((c) => {
              const isActive = c.id === activeChatId;
              return (
                <div
                  key={c.id}
                  className={`group flex items-center justify-between rounded-lg p-2 text-xs font-semibold transition cursor-pointer relative ${
                    isActive
                      ? 'bg-slate-200 dark:bg-slate-800/80 text-slate-900 dark:text-white'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-800/30 text-slate-500 dark:text-slate-400'
                  }`}
                  onClick={() => setActiveChatId(c.id)}
                >
                  <div className="min-w-0 flex-1 pr-4">
                    <span className="block truncate font-bold">{c.title}</span>
                    <span className="text-[9px] text-slate-400 block mt-0.5">{c.updatedAt}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      deleteConversation(c.id);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition rounded hover:bg-slate-300 dark:hover:bg-slate-700 absolute right-2"
                    title="Archive Chat"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })
          )}
        </div>

        {/* Left footer: model settings info */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-white/40 dark:bg-slate-950/20 text-[10px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-between">
            <span>Model:</span>
            <span className="font-bold text-slate-600 dark:text-slate-200 capitalize">
              {models.find((m) => m.id === activeModelId)?.name || activeModelId}
            </span>
          </div>
          <div className="flex items-center justify-between">
            <span>Grounding Prompt:</span>
            <span className="font-bold text-slate-600 dark:text-slate-200 truncate max-w-[100px]">
              {promptTemplates.find((t) => t.id === activePromptTemplateId)?.name || 'Default'}
            </span>
          </div>
        </div>
      </div>

      {/* 2. Main Chat Area */}
      <div className="flex-1 flex flex-col bg-white dark:bg-slate-950 min-w-0 relative">
        
        {/* Chat Control Toolbar (Model Selection / Configuration) */}
        <div className="p-3 border-b border-slate-200 dark:border-slate-800/80 bg-slate-50/60 dark:bg-slate-900/30 flex flex-wrap items-center justify-between gap-3 text-xs">
          
          <div className="flex items-center gap-3">
            {/* Model Selector dropdown */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">Model Routing:</span>
              <div className="relative">
                <select
                  value={activeModelId}
                  onChange={(e) => setActiveModelId(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-lg py-1 px-2.5 pr-6 appearance-none font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {models.map((m) => (
                    <option key={m.id} value={m.id} disabled={!m.active}>
                      {m.name} {!m.active ? '(Inactive)' : ''}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>

            {/* Prompt Template Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-slate-500 font-semibold">System Directives:</span>
              <div className="relative">
                <select
                  value={activePromptTemplateId}
                  onChange={(e) => setActivePromptTemplateId(e.target.value)}
                  className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 rounded-lg py-1 px-2.5 pr-6 appearance-none font-bold text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer"
                >
                  {promptTemplates.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
                <ChevronDown className="w-3 h-3 text-slate-400 absolute right-2 top-2 pointer-events-none" />
              </div>
            </div>
          </div>

          {/* Action buttons (Export, show RAG panel) */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleExport}
              disabled={!activeChat || activeChat.messages.length === 0}
              className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition cursor-pointer"
              title="Download Session Log"
            >
              <Download className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowSlackModal(true)}
              disabled={!activeChat || activeChat.messages.length === 0}
              className="p-1.5 rounded-lg border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-500 dark:text-slate-400 disabled:opacity-40 transition cursor-pointer"
              title="Push to Slack"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>

            <button
              onClick={() => setShowRAGInsights(!showRAGInsights)}
              className={`px-2.5 py-1.5 rounded-lg font-semibold transition cursor-pointer ${
                showRAGInsights
                  ? 'bg-teal-500/10 text-teal-400 border border-teal-500/25'
                  : 'border border-slate-250 dark:border-slate-850 text-slate-500 dark:text-slate-400'
              }`}
            >
              {showRAGInsights ? 'Hide Insights' : 'Inspect RAG'}
            </button>
          </div>
        </div>

        {/* Message Log */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!activeChat || activeChat.messages.length === 0 ? (
            /* Empty state Workspace */
            <div className="h-full flex flex-col items-center justify-center max-w-xl mx-auto text-center space-y-6">
              <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/25 flex items-center justify-center text-teal-400 glow-teal animate-pulse">
                <Bot className="w-8 h-8" />
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-800 dark:text-white">AVI Cognitive Retrieval Engine</h3>
                <p className="text-xs text-slate-500 mt-2 leading-relaxed">
                  Welcome to the Grounded AI Workspace. Ask technical or financial questions referencing your files. Under active configuration, the assistant utilizes **Strict RAG constraints** to cite document nodes.
                </p>
              </div>

              {/* Suggestions chips */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 w-full">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => handleSuggestionClick(prompt)}
                    className="p-3 text-left rounded-xl border border-slate-200 dark:border-slate-800/85 bg-slate-55/30 dark:bg-slate-900/30 hover:bg-slate-100/60 dark:hover:bg-slate-900/60 text-slate-600 dark:text-slate-300 transition text-xs font-semibold cursor-pointer"
                  >
                    "{prompt}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            /* Messages list */
            <div className="space-y-6 max-w-3xl mx-auto">
              {activeChat.messages.map((m) => (
                <div
                  key={m.id}
                  className={`flex gap-4 ${
                    m.sender === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  {/* Sender Avatar */}
                  {m.sender === 'assistant' && (
                    <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-500/5">
                      <Bot className="w-4 h-4" />
                    </div>
                  )}

                  {/* Message Bubble */}
                  <div className="max-w-[85%] space-y-2">
                    <div
                      className={`p-4 rounded-2xl text-xs leading-relaxed space-y-3 ${
                        m.sender === 'user'
                          ? 'bg-slate-900 border border-slate-800 text-white rounded-tr-none'
                          : 'bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none'
                      }`}
                    >
                      {/* Formatted body paragraph content */}
                      <p className="whitespace-pre-wrap">{m.text}</p>

                      {/* Display response parameters info */}
                      {m.sender === 'assistant' && (
                        <div className="flex flex-wrap items-center gap-3 pt-2.5 border-t border-slate-200 dark:border-slate-800/60 text-[10px] text-slate-400 font-medium">
                          <div className="flex items-center gap-1">
                            <Layers className="w-3.5 h-3.5 text-indigo-400" />
                            <span>Model: {m.modelUsed}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Award className="w-3.5 h-3.5 text-emerald-500" />
                            <span>Confidence: {m.confidenceScore ? `${(m.confidenceScore * 100).toFixed(0)}%` : '95%'}</span>
                          </div>

                          <div className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5 text-slate-500" />
                            <span>Time: {m.latency}s</span>
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Citations & Agent steps expander */}
                    {m.sender === 'assistant' && (
                      <div className="flex flex-col gap-2">
                        {/* Agent Steps Trigger */}
                        {m.agentSteps && m.agentSteps.length > 0 && (
                          <div>
                            <button
                              onClick={() => setShowAgentPathId(showAgentPathId === m.id ? null : m.id)}
                              className="text-[10px] text-teal-400 font-bold hover:underline flex items-center gap-1 cursor-pointer"
                            >
                              <span>{showAgentPathId === m.id ? 'Hide Agent Steps' : 'View Ingestion Agent Steps'}</span>
                              <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAgentPathId === m.id ? 'rotate-180' : ''}`} />
                            </button>
                            {showAgentPathId === m.id && (
                              <div className="p-3 mt-1.5 bg-slate-900 border border-slate-800 rounded-xl space-y-1.5 text-[10px] text-slate-400 font-mono">
                                {m.agentSteps.map((step, sIdx) => (
                                  <div key={sIdx} className="flex gap-2">
                                    <span className="text-teal-400 font-semibold">{sIdx + 1}.</span>
                                    <span>{step}</span>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        )}

                        {/* Quick Citation Reference Tags */}
                        {m.citations && m.citations.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 items-center">
                            <span className="text-[10px] text-slate-400 font-semibold">Citations:</span>
                            {m.citations.map((cite, cIdx) => (
                              <span
                                key={cIdx}
                                className="px-2 py-0.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-900/60 text-[9px] text-slate-600 dark:text-slate-300 font-bold"
                                title={cite.text}
                              >
                                {cite.filename} (p. {cite.page})
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Controls (Copy, Speak, Regenerate) */}
                        <div className="flex items-center gap-1.5 justify-end">
                          <button
                            onClick={() => handleCopy(m.id, m.text)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
                            title="Copy response"
                          >
                            {copiedId === m.id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => handleSpeech(m.id, m.text)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
                            title="Speech toggle"
                          >
                            {speakingId === m.id ? <VolumeX className="w-3.5 h-3.5 text-rose-500" /> : <Volume2 className="w-3.5 h-3.5" />}
                          </button>

                          <button
                            onClick={() => regenerateResponse(m.id)}
                            className="p-1 rounded text-slate-400 hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-850 transition cursor-pointer"
                            title="Regenerate"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {m.sender === 'user' && (
                    <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 text-white flex items-center justify-center flex-shrink-0 shadow-sm">
                      <User className="w-4 h-4" />
                    </div>
                  )}
                </div>
              ))}

              {/* Streaming Assistant Response Mock */}
              {isStreaming && streamingText && (
                <div className="flex gap-4 justify-start">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 shadow-sm shadow-teal-500/5">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="max-w-[85%] space-y-2">
                    <div className="p-4 rounded-2xl text-xs bg-slate-50 dark:bg-slate-900/40 border border-slate-200 dark:border-slate-800 text-slate-800 dark:text-slate-100 rounded-tl-none font-medium leading-relaxed blink-cursor">
                      <p className="whitespace-pre-wrap">{streamingText}</p>
                    </div>

                    {/* Streaming Agent progress log */}
                    <div className="flex items-center gap-1.5 text-[9px] text-slate-400 font-semibold">
                      <span className="w-1.5 h-1.5 rounded-full bg-teal-500 animate-ping"></span>
                      <span>Synthesis in progress...</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Loading Agent steps simulator */}
              {isStreaming && !streamingText && (
                <div className="flex gap-4 justify-start max-w-lg">
                  <div className="w-8 h-8 rounded-lg bg-teal-500/15 border border-teal-500/20 text-teal-400 flex items-center justify-center flex-shrink-0 shadow-sm animate-pulse">
                    <Bot className="w-4 h-4" />
                  </div>

                  <div className="space-y-2">
                    <div className="p-4 rounded-2xl border border-slate-250 dark:border-slate-850/50 bg-slate-50/50 dark:bg-slate-900/20 space-y-2">
                      <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                        <svg className="animate-spin h-3 w-3 text-teal-500" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        <span>Agent Routing Pipeline:</span>
                      </div>
                      <div className="space-y-1 text-[9px] text-slate-400 font-mono">
                        {currentAgentSteps.map((step, idx) => (
                          <div key={idx} className="flex gap-1.5">
                            <span className="text-teal-400 font-bold">✓</span>
                            <span>{step}</span>
                          </div>
                        ))}
                        <div className="flex items-center gap-1 text-[9px] text-slate-500 animate-pulse font-mono">
                          <span>⋯ Generating embeddings search results...</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>
          )}
        </div>

        {/* Input Controls Panel */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800/80 bg-white/60 dark:bg-slate-950/40">
          <form onSubmit={handleSend} className="max-w-3xl mx-auto space-y-3">
            
            {/* Suggested quick Prompts under text area if not empty */}
            {activeChat && activeChat.messages.length > 0 && (
              <div className="flex gap-2 items-center overflow-x-auto pb-1 text-[10px]">
                <span className="text-slate-400 flex-shrink-0 font-semibold">Suggested:</span>
                {suggestedPrompts.slice(0, 3).map((prompt) => (
                  <button
                    key={prompt}
                    type="button"
                    onClick={() => handleSuggestionClick(prompt)}
                    className="px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-300 font-semibold transition whitespace-nowrap cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Input area wrapper */}
            <div className="relative border border-slate-250 dark:border-slate-800/85 focus-within:border-teal-500/80 focus-within:ring-2 focus-within:ring-teal-500/10 rounded-2xl bg-white dark:bg-slate-900/60 p-1.5 transition">
              <textarea
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                rows={2}
                className="w-full bg-transparent resize-none focus:outline-none text-xs p-2.5 text-slate-800 dark:text-slate-100 placeholder:text-slate-400"
                placeholder="Ask AI a question about your uploaded corporate archives..."
              />

              <div className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/50 pt-2 px-1">
                
                {/* Voice/Mic Indicator */}
                <button
                  type="button"
                  onClick={handleVoiceInput}
                  className={`p-2 rounded-xl transition cursor-pointer flex items-center justify-center ${
                    isRecording
                      ? 'bg-rose-500/15 text-rose-500 border border-rose-500/20 hover:bg-rose-500/25 animate-pulse'
                      : 'hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-400 hover:text-slate-200'
                  }`}
                  title="Simulate speech to text input"
                >
                  {isRecording ? <MicOff className="w-3.5 h-3.5" /> : <Mic className="w-3.5 h-3.5" />}
                </button>

                {/* Send Button */}
                <button
                  type="submit"
                  disabled={!inputMessage.trim() || isStreaming}
                  className="p-2 bg-teal-500 hover:bg-teal-400 disabled:opacity-40 transition text-slate-950 font-bold rounded-xl flex items-center justify-center cursor-pointer shadow-md shadow-teal-500/10 active:scale-[0.98]"
                >
                  <SendHorizontal className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="text-[10px] text-center text-slate-400 dark:text-slate-500 leading-tight">
              AVI RAG may display filtered chunks based on semantic thresholds. Confirm citations inside the RAG Insights inspect menu.
            </div>
          </form>
        </div>
      </div>

      {/* 3. Collapsible RAG Insights (Right side of Workspace) */}
      {showRAGInsights && (
        <div className="w-80 border-l border-slate-200 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-950/20 flex-shrink-0 h-full p-4 overflow-y-auto hidden md:block">
          <RAGInsights
            citations={activeChat?.messages[activeChat.messages.length - 1]?.citations || currentCitations}
            agentSteps={activeChat?.messages[activeChat.messages.length - 1]?.agentSteps || currentAgentSteps}
          />
        </div>
      )}

      {/* Slack Share Modal simulation */}
      {showSlackModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/65 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div>
              <h3 className="font-bold text-sm text-slate-800 dark:text-white">Share Grounding Context via Slack</h3>
              <p className="text-xs text-slate-500 mt-1">Distribute AI response metadata cards directly into team slack channels.</p>
            </div>

            <div className="space-y-3 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold">Slack Channel Workspace</span>
                <select className="w-full bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-2.5 rounded-xl text-slate-700 dark:text-slate-200 focus:outline-none">
                  <option>#security-alerts (DevSecOps compliance)</option>
                  <option>#finances-q4-hedging (Q4 financial audits)</option>
                  <option>#dev-api-gateway-logs (API specifications)</option>
                </select>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 block font-semibold">Message Citation Attachment Preview</span>
                <div className="p-3 border border-slate-100 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/40 rounded-xl space-y-1 leading-normal font-mono text-[9px] text-slate-400">
                  <span className="text-teal-400 block font-bold">AVI RAG Grounding Summary:</span>
                  <span>Payload reference: {activeChat?.title || 'Exploration'}</span>
                  <span>Confidence score: 96% Ada-002 alignment</span>
                </div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2.5 pt-3">
              <button
                onClick={() => setShowSlackModal(false)}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl border border-slate-250 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-850 text-slate-600 dark:text-slate-400 transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={handleSlackShare}
                className="px-3.5 py-2 text-xs font-semibold rounded-xl bg-teal-500 text-slate-950 hover:bg-teal-400 transition cursor-pointer font-bold"
              >
                Distribute Card
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
