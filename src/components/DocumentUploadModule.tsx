import React, { useState, useRef } from 'react';
import { useApp } from '../AppContext';
import {
  Upload,
  Search,
  Trash2,
  RefreshCcw,
  FileText,
  CheckCircle2,
  AlertCircle,
  Database,
  Cpu,
  Clock,
  ExternalLink,
  ShieldAlert,
  Info
} from 'lucide-react';

export const DocumentUploadModule: React.FC = () => {
  const {
    documents,
    uploadDocuments,
    deleteDocument,
    triggerIngestionRetry,
    user,
    addNotification
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Ready' | 'Kafka Ingesting' | 'Chunking' | 'Vector Indexing' | 'Failed'>('All');
  const [dragActive, setDragActive] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const canModifyDocs = user?.role === 'Admin' || user?.role === 'Data Engineer';

  // Handle Drag Events
  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  // Handle Drop Event
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (!canModifyDocs) {
      addNotification('Access Denied: Ingestion permissions restricted to Admin/Data Engineer roles.', 'error');
      return;
    }

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const filesArray = Array.from(e.dataTransfer.files);
      const validFiles = filesArray.filter((file) => {
        const ext = file.name.split('.').pop()?.toLowerCase();
        return ext === 'pdf' || ext === 'docx' || ext === 'txt';
      });

      if (validFiles.length === 0) {
        addNotification('Unsupported file type. Please upload PDF, DOCX or TXT files only.', 'error');
        return;
      }

      uploadDocuments(validFiles);
    }
  };

  // Handle file input selection
  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!canModifyDocs) {
      addNotification('Access Denied: Ingestion permissions restricted to Admin/Data Engineer roles.', 'error');
      return;
    }

    if (e.target.files && e.target.files[0]) {
      const filesArray = Array.from(e.target.files);
      uploadDocuments(filesArray);
    }
  };

  // Filter Documents
  const filteredDocs = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'All' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      
      {/* Module Title / Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-800 dark:text-white">Ingestion Portal & Document Store</h2>
          <p className="text-xs text-slate-500">Configure corporate records, analyze index progress and audit vector database mappings.</p>
        </div>

        {/* Status quick stats */}
        <div className="flex items-center gap-3">
          <div className="text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-800 px-3 py-1.5 rounded-xl">
            <span className="text-slate-500">Total Store Size:</span>{' '}
            <span className="font-bold text-slate-800 dark:text-slate-200">
              {(documents.reduce((acc, doc) => acc + (parseFloat(doc.size) || 0), 0)).toFixed(1)} MB
            </span>
          </div>
        </div>
      </div>

      {/* Role Restriction Alert Banner */}
      {!canModifyDocs && (
        <div className="p-3.5 bg-amber-500/10 border border-amber-500/25 rounded-xl flex items-start gap-3">
          <ShieldAlert className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5" />
          <div>
            <h4 className="text-xs font-bold text-amber-600 dark:text-amber-400">Read-Only Session Mode ({user?.role})</h4>
            <p className="text-[11px] text-slate-500 mt-0.5">
              Your profile is granted read-only viewing permissions. To upload documents, ingest vectors, or purge index contents, swap to an **Administrator** or **Data Engineer** persona via the dropdown in the header control bar.
            </p>
          </div>
        </div>
      )}

      {/* Upload Drag & Drop Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Side: Upload zone and configuration */}
        <div className="lg:col-span-1 space-y-4">
          <div
            onDragEnter={handleDrag}
            onDragOver={handleDrag}
            onDragLeave={handleDrag}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-2xl p-6 text-center transition-all flex flex-col items-center justify-center min-h-[220px] relative ${
              dragActive
                ? 'border-teal-500 bg-teal-500/5'
                : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700/80 bg-white dark:bg-slate-900/60'
            } ${!canModifyDocs ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileInput}
              multiple
              accept=".pdf,.docx,.txt"
              className="hidden"
              disabled={!canModifyDocs}
            />

            <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl mb-4">
              <Upload className="w-6 h-6 text-slate-500 dark:text-slate-400" />
            </div>

            <h3 className="font-bold text-sm text-slate-800 dark:text-white">
              Drag & Drop file payload here
            </h3>
            <p className="text-xs text-slate-500 mt-1 max-w-[200px]">
              Supports standard formats: PDF, DOCX, or TXT up to 25MB
            </p>

            <button
              type="button"
              disabled={!canModifyDocs}
              onClick={() => fileInputRef.current?.click()}
              className={`mt-4 px-4 py-2 text-xs font-semibold rounded-xl transition ${
                canModifyDocs
                  ? 'bg-teal-500 text-slate-950 hover:bg-teal-400 cursor-pointer shadow-md'
                  : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
              }`}
            >
              Select Corporate File
            </button>
          </div>

          {/* Quick Upload guidelines card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-4 space-y-3 shadow-sm">
            <h4 className="text-xs font-bold text-slate-800 dark:text-white flex items-center gap-1.5">
              <Info className="w-4 h-4 text-teal-500" /> RAG Ingestion Guidelines
            </h4>
            <ul className="space-y-2 text-[11px] text-slate-500 list-disc list-inside">
              <li>PDF pages are automatically segmented into 500-character segments.</li>
              <li>Text embeddings are processed utilizing OpenAI Ada-002 model vectors.</li>
              <li>Ingestion rates are governed by global Kafka cluster configuration.</li>
              <li>Ensure files do not contain unencrypted PII credentials.</li>
            </ul>
          </div>
        </div>

        {/* Right Side: Document Inventory Grid */}
        <div className="lg:col-span-2 space-y-4">
          
          {/* Controls Bar */}
          <div className="flex flex-col sm:flex-row items-center gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-850 hover:border-slate-300 focus:border-teal-500 focus:outline-none rounded-xl py-2 pl-9 pr-4 text-xs text-slate-800 dark:text-white transition"
                placeholder="Search index database by document name..."
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-1 bg-slate-100 dark:bg-slate-850 border border-slate-200 dark:border-slate-800 p-0.5 rounded-xl w-full sm:w-auto overflow-x-auto">
              {(['All', 'Ready', 'Kafka Ingesting', 'Failed'] as const).map((tab) => (
                <button
                  key={tab}
                  onClick={() => setStatusFilter(tab as any)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap cursor-pointer ${
                    (statusFilter === tab)
                      ? 'bg-white dark:bg-slate-800 text-slate-900 dark:text-white shadow-sm'
                      : 'text-slate-500 hover:text-slate-700 dark:hover:text-slate-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="bg-slate-50 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 text-slate-400 font-bold uppercase tracking-wider text-[9px]">
                    <th className="py-3 px-4">Document Details</th>
                    <th className="py-3 px-4">Kafka status / Progress</th>
                    <th className="py-3 px-4">Embedding Nodes</th>
                    <th className="py-3 px-4">Sync state</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-slate-700 dark:text-slate-200">
                  {filteredDocs.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="py-8 text-center text-slate-400">
                        No corporate files matched the selected search configurations.
                      </td>
                    </tr>
                  ) : (
                    filteredDocs.map((doc) => {
                      const isReady = doc.status === 'Ready';
                      const isFailed = doc.status === 'Failed';

                      const statusColors: Record<string, string> = {
                        Ready: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
                        'Kafka Ingesting': 'bg-indigo-500/10 text-indigo-500 border-indigo-500/20',
                        Chunking: 'bg-violet-500/10 text-violet-500 border-violet-500/20',
                        'Vector Indexing': 'bg-teal-500/10 text-teal-500 border-teal-500/20',
                        Failed: 'bg-rose-500/10 text-rose-500 border-rose-500/20'
                      };

                      return (
                        <tr
                          key={doc.id}
                          onClick={() => setSelectedDoc(doc)}
                          className={`hover:bg-slate-50/50 dark:hover:bg-slate-950/20 cursor-pointer transition ${
                            selectedDoc?.id === doc.id ? 'bg-slate-100/50 dark:bg-slate-950/40' : ''
                          }`}
                        >
                          {/* Col 1: Details */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-3">
                              <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-lg flex-shrink-0">
                                <FileText className="w-4 h-4 text-slate-400" />
                              </div>
                              <div className="min-w-0 max-w-[180px]">
                                <span className="font-bold text-slate-800 dark:text-white block truncate">
                                  {doc.name}
                                </span>
                                <span className="text-[10px] text-slate-400 block">
                                  {doc.size} • uploaded by {doc.uploadedBy.split(' ')[0]}
                                </span>
                              </div>
                            </div>
                          </td>

                          {/* Col 2: Ingestion status */}
                          <td className="py-3.5 px-4">
                            <div className="space-y-1 max-w-[140px]">
                              <div className="flex items-center justify-between text-[10px]">
                                <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold ${statusColors[doc.status]}`}>
                                  {doc.status}
                                </span>
                                {!isReady && !isFailed && (
                                  <span className="font-semibold text-slate-400">{doc.progress}%</span>
                                )}
                              </div>
                              {!isReady && !isFailed && (
                                <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-1">
                                  <div
                                    className="bg-teal-500 h-full rounded-full transition-all duration-300"
                                    style={{ width: `${doc.progress}%` }}
                                  />
                                </div>
                              )}
                            </div>
                          </td>

                          {/* Col 3: Embedding count */}
                          <td className="py-3.5 px-4">
                            <div className="flex items-center gap-1.5">
                              <Database className="w-3.5 h-3.5 text-slate-400" />
                              <span className="font-semibold text-slate-800 dark:text-slate-200">
                                {doc.chunksCount > 0 ? `${doc.chunksCount} chunks` : '--'}
                              </span>
                            </div>
                          </td>

                          {/* Col 4: Vector Sync status */}
                          <td className="py-3.5 px-4">
                            {doc.vectorStatus === 'Synchronized' ? (
                              <div className="flex items-center gap-1 text-emerald-500 text-[10px] font-bold">
                                <CheckCircle2 className="w-3.5 h-3.5" />
                                <span>Synchronized</span>
                              </div>
                            ) : doc.vectorStatus === 'Failed' ? (
                              <div className="flex items-center gap-1 text-rose-500 text-[10px] font-bold">
                                <AlertCircle className="w-3.5 h-3.5" />
                                <span>Failed</span>
                              </div>
                            ) : (
                              <div className="flex items-center gap-1 text-amber-500 text-[10px] font-bold animate-pulse">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Indexing...</span>
                              </div>
                            )}
                          </td>

                          {/* Col 5: Actions */}
                          <td className="py-3.5 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              {isFailed && (
                                <button
                                  onClick={() => triggerIngestionRetry(doc.id)}
                                  className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-teal-500 transition cursor-pointer"
                                  title="Retry Ingestion Queue"
                                >
                                  <RefreshCcw className="w-3.5 h-3.5" />
                                </button>
                              )}
                              <button
                                onClick={() => deleteDocument(doc.id)}
                                disabled={!canModifyDocs}
                                className={`p-1.5 rounded-lg transition ${
                                  canModifyDocs
                                    ? 'hover:bg-rose-500/10 text-slate-400 hover:text-rose-500 cursor-pointer'
                                    : 'text-slate-600/30 cursor-not-allowed'
                                }`}
                                title="Delete Document & Clear Embedding Chunks"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Selected Document Details Inspector Drawer */}
      {selectedDoc && (
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-5 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-850 pb-3">
            <h3 className="font-bold text-sm text-slate-850 dark:text-white flex items-center gap-2">
              <Cpu className="w-4 h-4 text-teal-500" />
              Document Pipeline Details: {selectedDoc.name}
            </h3>
            <button
              onClick={() => setSelectedDoc(null)}
              className="text-xs font-semibold text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
            >
              Close Details
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-xs">
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Kafka Topic Destination</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 block bg-slate-100 dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800/50 truncate">
                {selectedDoc.kafkaTopic}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Creation Timestamp</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 block bg-slate-100 dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800/50">
                {selectedDoc.uploadedAt}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Metadata Submitter</span>
              <span className="font-semibold text-slate-700 dark:text-slate-300 block truncate">
                {selectedDoc.uploadedBy}
              </span>
            </div>
            <div className="space-y-1">
              <span className="text-slate-400 block font-semibold">Vector Store ID Namespace</span>
              <span className="font-mono text-slate-700 dark:text-slate-300 block bg-slate-100 dark:bg-slate-950 p-1.5 rounded border border-slate-200 dark:border-slate-800/50 truncate">
                avi-rag-vector-db-{selectedDoc.id}
              </span>
            </div>
          </div>

          <div className="bg-slate-50 dark:bg-slate-950/40 p-4 rounded-xl border border-slate-100 dark:border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <div className="space-y-1">
              <h4 className="font-bold text-slate-700 dark:text-slate-200">Index Grounding Analysis</h4>
              <p className="text-[11px] text-slate-500">
                This document is segmented into {selectedDoc.chunksCount || 0} discrete nodes for semantic analysis. Similarity queries will evaluate individual paragraph vectors.
              </p>
            </div>
            {selectedDoc.status === 'Ready' && (
              <a
                href="#chat-redirect"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-500/10 text-teal-400 border border-teal-500/20 font-bold hover:bg-teal-500/20 transition"
              >
                Query Document
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
