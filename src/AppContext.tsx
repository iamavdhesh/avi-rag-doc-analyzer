import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  DocumentItem,
  ChatSession,
  ChatMessage,
  Citation,
  KafkaTopicStatus,
  ModelConfig,
  PromptTemplate,
  INITIAL_DOCUMENTS,
  INITIAL_CONVERSATIONS,
  INITIAL_KAFKA_TOPICS,
  MODEL_CONFIGS,
  PROMPT_TEMPLATES
} from './mockData';

export interface UserProfile {
  username: string;
  email: string;
  role: 'Admin' | 'Compliance Officer' | 'Data Engineer' | 'General User';
  token: string;
  avatar: string;
}

interface AppContextType {
  // Auth
  user: UserProfile | null;
  login: (username: string, role: string) => Promise<boolean>;
  logout: () => void;

  // Documents
  documents: DocumentItem[];
  uploadDocuments: (files: File[]) => void;
  deleteDocument: (id: string) => void;
  triggerIngestionRetry: (id: string) => void;

  // Chat
  conversations: ChatSession[];
  activeChatId: string;
  setActiveChatId: (id: string) => void;
  createConversation: (title?: string) => string;
  deleteConversation: (id: string) => void;
  sendChatMessage: (text: string) => Promise<void>;
  regenerateResponse: (messageId: string) => Promise<void>;
  activeModelId: string;
  setActiveModelId: (id: string) => void;
  isStreaming: boolean;
  streamingText: string;
  currentCitations: Citation[];
  currentAgentSteps: string[];

  // Kafka & System
  kafkaTopics: KafkaTopicStatus[];
  kafkaRateLimit: number; // requests/sec
  setKafkaRateLimit: (rate: number) => void;
  systemMetrics: {
    totalQueries: number;
    totalTokens: number;
    avgLatency: number;
    totalEmbeddings: number;
  };
  kafkaLogs: string[];
  triggerSimulatedFailure: () => void;
  redriveDLQ: () => void;

  // Models & Prompts
  models: ModelConfig[];
  toggleModelActive: (id: string) => void;
  promptTemplates: PromptTemplate[];
  updatePromptTemplate: (id: string, text: string) => void;
  activePromptTemplateId: string;
  setActivePromptTemplateId: (id: string) => void;

  // Theme & Notifications
  theme: 'dark' | 'light';
  toggleTheme: () => void;
  notifications: Array<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; message: string }>;
  addNotification: (message: string, type?: 'success' | 'info' | 'warning' | 'error') => void;
  removeNotification: (id: string) => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  // Theme
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');

  // Auth State
  const [user, setUser] = useState<UserProfile | null>({
    username: 'alex.mercer',
    email: 'alex.mercer@avi-enterprise.ai',
    role: 'Admin',
    token: 'jwt-mock-secret-key-102938',
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80'
  });

  // Main Lists
  const [documents, setDocuments] = useState<DocumentItem[]>(INITIAL_DOCUMENTS);
  const [conversations, setConversations] = useState<ChatSession[]>(INITIAL_CONVERSATIONS);
  const [activeChatId, setActiveChatId] = useState<string>(INITIAL_CONVERSATIONS[0]?.id || '');
  const [kafkaTopics, setKafkaTopics] = useState<KafkaTopicStatus[]>(INITIAL_KAFKA_TOPICS);
  const [models, setModels] = useState<ModelConfig[]>(MODEL_CONFIGS);
  const [promptTemplates, setPromptTemplates] = useState<PromptTemplate[]>(PROMPT_TEMPLATES);
  const [activePromptTemplateId, setActivePromptTemplateId] = useState<string>(PROMPT_TEMPLATES[0].id);
  const [activeModelId, setActiveModelId] = useState<string>('gpt-4o-enterprise');
  
  // Rate Limit & Alerts
  const [kafkaRateLimit, setKafkaRateLimit] = useState<number>(250);
  const [systemMetrics, setSystemMetrics] = useState({
    totalQueries: 1420,
    totalTokens: 948200,
    avgLatency: 1.48,
    totalEmbeddings: 435 // total number of chunks synchronized
  });
  
  // Notifications
  const [notifications, setNotifications] = useState<Array<{ id: string; type: 'success' | 'info' | 'warning' | 'error'; message: string }>>([]);

  const addNotification = useCallback((message: string, type: 'success' | 'info' | 'warning' | 'error' = 'success') => {
    const id = Math.random().toString(36).substr(2, 9);
    setNotifications((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setNotifications((prev) => prev.filter((n) => n.id !== id));
    }, 4000);
  }, []);

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  // Theme toggler
  const toggleTheme = () => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Auth Operations
  const login = async (username: string, role: string): Promise<boolean> => {
    // Simulate JWT Authentication
    return new Promise((resolve) => {
      setTimeout(() => {
        const avatars: Record<string, string> = {
          'Admin': 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&q=80',
          'Compliance Officer': 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=100&q=80',
          'Data Engineer': 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=100&q=80',
          'General User': 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&w=100&q=80'
        };
        setUser({
          username: username || 'guest.user',
          email: `${username || 'guest'}@avi-enterprise.ai`,
          role: role as any,
          token: `jwt-mock-key-${Math.floor(Math.random() * 100000)}`,
          avatar: avatars[role] || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
        });
        addNotification(`Successfully authenticated as ${role}`, 'success');
        resolve(true);
      }, 800);
    });
  };

  const logout = () => {
    setUser(null);
    addNotification('Logged out from enterprise control plane', 'info');
  };

  // Kafka Simulated Ingestion Stream logs
  const [kafkaLogs, setKafkaLogs] = useState<string[]>([
    '[SYSTEM] Kafka Broker active. Connected to Bootstrap Servers: broker-1:9092, broker-2:9092',
    '[INFO] Topic [document-ingestion-v1] re-balanced. 8 partitions assigned to 4 consumers.',
    '[INFO] Ingestion processor active. Waiting for raw file payloads.',
    '[METRICS] Vector storage usage metrics published: 435 nodes synchronized.'
  ]);

  const addKafkaLog = useCallback((log: string) => {
    setKafkaLogs((prev) => [log, ...prev].slice(0, 50));
  }, []);

  // Simulation of documents progress
  useEffect(() => {
    const timer = setInterval(() => {
      setDocuments((prevDocs) => {
        let changed = false;
        const newDocs = prevDocs.map((doc): DocumentItem => {
          if (doc.status === 'Kafka Ingesting') {
            changed = true;
            const newProgress = doc.progress + 15;
            if (newProgress >= 100) {
              addKafkaLog(`[KAFKA] Ingestion complete for ${doc.name}. Offsetting committed offset to partition 3.`);
              addKafkaLog(`[SYSTEM] Starting chunking service for document ${doc.name}. Chunk size: 500 chars.`);
              return { ...doc, progress: 0, status: 'Chunking', vectorStatus: 'Pending' };
            }
            return { ...doc, progress: newProgress, status: 'Kafka Ingesting', vectorStatus: 'Pending' };
          }
          if (doc.status === 'Chunking') {
            changed = true;
            const newProgress = doc.progress + 20;
            const simulatedChunks = Math.floor((parseFloat(doc.size) || 1) * 35);
            if (newProgress >= 100) {
              addKafkaLog(`[SYSTEM] Chunking complete for ${doc.name}. Total chunks generated: ${simulatedChunks}.`);
              addKafkaLog(`[VECTOR] Initiating text embedding sync with ada-002 model.`);
              return { ...doc, progress: 0, status: 'Vector Indexing', chunksCount: simulatedChunks, vectorStatus: 'Pending' };
            }
            return { ...doc, progress: newProgress, status: 'Chunking', chunksCount: Math.floor(simulatedChunks * (newProgress / 100)), vectorStatus: 'Pending' };
          }
          if (doc.status === 'Vector Indexing') {
            changed = true;
            const newProgress = doc.progress + 10;
            if (newProgress >= 100) {
              addKafkaLog(`[VECTOR] Vector Database indexed successfully for ${doc.name}. Vector synchronization status: Synchronized.`);
              addNotification(`Document "${doc.name}" is fully indexed and ready for AI queries!`, 'success');
              
              // Increment global system metrics
              setSystemMetrics(prev => ({
                ...prev,
                totalEmbeddings: prev.totalEmbeddings + (doc.chunksCount || 20)
              }));

              return { ...doc, progress: 100, status: 'Ready', vectorStatus: 'Synchronized' };
            }
            return { ...doc, progress: newProgress, status: 'Vector Indexing', vectorStatus: 'Pending' };
          }
          return doc;
        });
        return changed ? newDocs : prevDocs;
      });
    }, 3000);

    return () => clearInterval(timer);
  }, [addKafkaLog, addNotification]);

  // Simulation of dynamic Kafka throughput rates
  useEffect(() => {
    const timer = setInterval(() => {
      // Fluctuations in message rates
      setKafkaTopics((prevTopics) =>
        prevTopics.map((topic) => {
          if (topic.status === 'Critical') return topic;
          const fluctuation = Math.floor((Math.random() - 0.5) * 20);
          const currentThroughput = Math.max(0, topic.throughputRate + fluctuation);
          
          // Random consumer lag adjustments
          const lagDiff = Math.floor((Math.random() - 0.5) * 4);
          const currentLag = Math.max(0, topic.lag + lagDiff);

          return {
            ...topic,
            throughputRate: topic.throughputRate > 0 ? currentThroughput : 0,
            lag: currentLag
          };
        })
      );

      // Random active log
      if (Math.random() > 0.6) {
        const operations = ['ADA_EMBEDDINGS', 'CHUNK_STORE', 'VECTOR_SEARCH', 'LLM_SYNTHESIS'];
        const op = operations[Math.floor(Math.random() * operations.length)];
        const rate = (Math.random() * 3 + 0.5).toFixed(2);
        addKafkaLog(`[METRICS] Active ${op} throughput computed: ${rate} ms latency threshold.`);
      }
    }, 4000);

    return () => clearInterval(timer);
  }, [addKafkaLog]);

  // Upload Documents API Action
  const uploadDocuments = (files: File[]) => {
    const newItems: DocumentItem[] = files.map((file, idx) => {
      const extension = file.name.split('.').pop()?.toLowerCase();
      const type = (extension === 'pdf' ? 'pdf' : extension === 'docx' ? 'docx' : 'txt') as 'pdf' | 'docx' | 'txt';
      const sizeStr = (file.size / (1024 * 1024)).toFixed(1) + ' MB';
      
      addKafkaLog(`[PRODUCER] Publishing document upload event to Kafka topic [document-ingestion-v1] for file ${file.name}.`);
      
      return {
        id: `uploaded-${Date.now()}-${idx}`,
        name: file.name,
        size: sizeStr,
        type,
        status: 'Kafka Ingesting',
        progress: 10,
        kafkaTopic: 'document-ingestion-v1',
        chunksCount: 0,
        uploadedAt: new Date().toISOString().replace('T', ' ').substring(0, 16),
        uploadedBy: user ? `${user.username} (${user.role})` : 'Anonymous System',
        vectorStatus: 'Pending'
      };
    });

    setDocuments((prev) => [...newItems, ...prev]);
    addNotification(`Queued ${files.length} document(s) in Kafka ingestion pipeline`, 'info');
  };

  // Delete Document
  const deleteDocument = (id: string) => {
    const docToDelete = documents.find((d) => d.id === id);
    setDocuments((prev) => prev.filter((doc) => doc.id !== id));
    addKafkaLog(`[CLEANUP] Deleted document ${docToDelete?.name || id} from index. Re-indexing partitions.`);
    addNotification(`Document "${docToDelete?.name || 'Deleted'}" removed from platform`, 'warning');
  };

  // Trigger Ingestion Retry (e.g. from failed status)
  const triggerIngestionRetry = (id: string) => {
    setDocuments((prev) =>
      prev.map((doc) => {
        if (doc.id === id) {
          addKafkaLog(`[REDRIVE] Restarting ingestion flow for failed document: ${doc.name}.`);
          return { ...doc, status: 'Kafka Ingesting', progress: 10, vectorStatus: 'Pending' };
        }
        return doc;
      })
    );
    addNotification('Re-submitted document to Kafka broker', 'info');
  };

  // Create Chat Conversation
  const createConversation = (title?: string): string => {
    const newId = `chat-${Date.now()}`;
    const newSession: ChatSession = {
      id: newId,
      title: title || 'New AI Exploration',
      updatedAt: 'Just now',
      model: activeModelId,
      messages: []
    };
    setConversations((prev) => [newSession, ...prev]);
    setActiveChatId(newId);
    return newId;
  };

  // Delete Chat Conversation
  const deleteConversation = (id: string) => {
    setConversations((prev) => prev.filter((c) => c.id !== id));
    addNotification('Conversation archive cleared', 'info');
    if (activeChatId === id) {
      const remaining = conversations.filter((c) => c.id !== id);
      if (remaining.length > 0) {
        setActiveChatId(remaining[0].id);
      } else {
        setActiveChatId('');
      }
    }
  };

  // Chat Streaming parameters
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [currentCitations, setCurrentCitations] = useState<Citation[]>([]);
  const [currentAgentSteps, setCurrentAgentSteps] = useState<string[]>([]);

  // Generate Answer simulation logic based on query
  const getSimulatedRAGAnswer = (query: string): {
    answer: string;
    citations: Citation[];
    agentSteps: string[];
    confidence: number;
    latency: number;
  } => {
    const textLower = query.toLowerCase();
    
    // Check if we have documents indexed
    const readyDocs = documents.filter(d => d.status === 'Ready');

    if (textLower.includes('retry') || textLower.includes('gateway') || textLower.includes('payment')) {
      const doc = documents.find(d => d.id === 'doc-3') || readyDocs[0];
      const docName = doc ? doc.name : 'API_Gateway_Retry_Flow.txt';
      const docId = doc ? doc.id : 'doc-3';
      
      return {
        answer: `Under the API Gateway parameters, the retry architecture employs an **exponential backoff schedule** to manage downstream load spikes during provider blackouts:\n\n1. **Base Backoff Interval**: Configured at \`1.5 seconds\`. \n2. **Backoff Multiplier Factor**: Defaults to \`2.0\` for each sequential attempt.\n3. **Maximum Retry Cap**: Set to a hard threshold of \`30.0 seconds\` to prevent indefinite backoff growth.\n4. **Maximum Attempts**: Restricted to \`3 retries\`. If all attempts fail, the API gateway triggers an alert and pushes the failed request context into the Kafka Dead-Letter Queue: \`payment-retry-dlq\`.\n\nThis mitigates cascading failure events on our Core Ledger services.`,
        citations: [
          {
            documentId: docId,
            filename: docName,
            text: 'max_retry_attempts=3, base_backoff_seconds=1.5, backoff_factor=2.0. On exhaustion, route to payment-retry-dlq topic.',
            score: 0.98,
            page: 1
          },
          {
            documentId: docId,
            filename: docName,
            text: 'Maximum backup timer threshold set at 30 seconds to cap latency overhead for frontfacing gateway interfaces.',
            score: 0.89,
            page: 2
          }
        ],
        agentSteps: [
          'Rewrote query: "api gateway retry rules exponential backoff payment limit"',
          `Queried Pinecone Vector Database with ada-002 embeddings on index: document-ingestion-v1.`,
          `Retrieved 2 relevant document chunks matching: ${docName}.`,
          `Selected Prompt Template: "${promptTemplates.find(t => t.id === activePromptTemplateId)?.name || 'Grounding'}"`,
          'Structured final response citing specific document guidelines.'
        ],
        confidence: 0.97,
        latency: 1.25
      };
    }

    if (textLower.includes('risk') || textLower.includes('financial') || textLower.includes('margin') || textLower.includes('currency') || textLower.includes('q4')) {
      const doc = documents.find(d => d.id === 'doc-1') || readyDocs[0];
      const docName = doc ? doc.name : 'Q4_Financial_Report_2025.pdf';
      const docId = doc ? doc.id : 'doc-1';

      return {
        answer: `Based on the **Q4 2025 Financial Report**, three primary enterprise financial risks were outlined for our operational ledger:\n\n* **Exchange Rate Risks**: High exposure to Euro-to-USD fluctuations resulted in a **$1.2M gross margin reduction** on European digital distribution channels.\n* **Infrastructural Resource Costs**: Computing costs spiked by **14%** due to elastic indexer allocation in our secondary vector store cluster.\n* **Renewal Risks**: Two enterprise SaaS contracts representing an aggregate ARR of **$950K** are scheduled for renewal negotiations in early 2026, posing client retention risk if negotiation features are delayed.\n\nManagement plans to implement currency hedging options to lock in foreign exchange targets for fiscal year 2026.`,
        citations: [
          {
            documentId: docId,
            filename: docName,
            text: 'Foreign currency fluctuation details: EUR to USD volatility net exposure calculated at $1,200,000 adverse variance.',
            score: 0.95,
            page: 14
          },
          {
            documentId: docId,
            filename: docName,
            text: 'SaaS computing costs increased from $4.2M to $4.79M (up 14%) driven by RAG vector store scale and heavy embedding generations.',
            score: 0.91,
            page: 19
          }
        ],
        agentSteps: [
          'Parsed query: "financial risk items Q4 currency overhead revenue variance"',
          'Retrieved chunks using cosine similarity from vector namespace: Q4_Financial_Report.',
          'Detected 2 relevant sections with similarity threshold > 0.85.',
          'Formulated response emphasizing figures in bold according to strict grounding instructions.'
        ],
        confidence: 0.94,
        latency: 1.82
      };
    }

    if (textLower.includes('security') || textLower.includes('ciso') || textLower.includes('devsecops') || textLower.includes('protocol')) {
      const doc = documents.find(d => d.id === 'doc-2') || readyDocs[0];
      const docName = doc ? doc.name : 'Enterprise_Security_Protocol_v4.docx';
      const docId = doc ? doc.id : 'doc-2';

      return {
        answer: `According to the **Enterprise Security Protocol v4**, the DevSecOps compliance framework enforces key security mandates:\n\n1. **Zero-Trust Network Access (ZTNA)**: Access to all staging and production databases is routed via temporary IAM roles limited to 4-hour lease cycles.\n2. **Artifact Signing**: All code deployments must contain an validated Sigstore signature before passing the internal Jenkins deploy gate.\n3. **Secrets Management**: Plaintext API keys are strictly forbidden. All variables must pull dynamically from our HashiCorp Vault cluster.\n4. **Vulnerability Remediation**: Critical security CVEs must be patched within **48 hours**, while High severity CVEs are allocated a maximum of **7 days** before automatic build quarantine takes effect.`,
        citations: [
          {
            documentId: docId,
            filename: docName,
            text: 'Zero Trust Access: IAM role rotation policy requires maximum 240-minute tokens for console access.',
            score: 0.97,
            page: 4
          },
          {
            documentId: docId,
            filename: docName,
            text: 'Remediation times: Critical vulnerabilities = 48h, High vulnerabilities = 7 days. Automatic quarantine is enforced.',
            score: 0.93,
            page: 8
          }
        ],
        agentSteps: [
          'Rewrote prompt to look up "security protocols secrets compliance devsecops"',
          'Retrieved 3 chunks from Enterprise_Security_Protocol_v4.docx.',
          'Parsed requirements from page 4 and 8. Computed similarity score: 0.95 avg.'
        ],
        confidence: 0.96,
        latency: 1.35
      };
    }

    // Default Fallback
    const randomDoc = readyDocs[Math.floor(Math.random() * readyDocs.length)] || documents[0];
    const docName = randomDoc ? randomDoc.name : 'Platform Knowledge Base';
    const docId = randomDoc ? randomDoc.id : 'doc-generic';

    return {
      answer: `Based on a scan of the uploaded document database (specifically looking at **${docName}**), I generated the following context-aware answer for your query: "${query}"\n\n* The system successfully queried the active vector indices matching your prompt terms.\n* For enterprise security, please confirm that your access token level allows full visibility into policy metadata.\n* If you need specific figures or step-by-step instructions, please try referencing the file name directly (e.g. "What does the financial report say about cost spikes?").`,
      citations: [
        {
          documentId: docId,
          filename: docName,
          text: `Retrieved general chunk matching: "${query.substring(0, 40)}..." for compliance evaluation.`,
          score: 0.81,
          page: 1
        }
      ],
      agentSteps: [
        `Parsed generic query: "${query.substring(0, 30)}"`,
        `Scanned active Vector Index namespaces. Found closest match in: ${docName}.`,
        'Ranked chunks using cosine-distance. Synthesized default grounded response.'
      ],
      confidence: 0.84,
      latency: 1.6
    };
  };

  // Send message Action (Streaming simulation)
  const sendChatMessage = async (text: string) => {
    if (!text.trim() || isStreaming) return;

    // Check if active chat session exists, if not create one
    let targetChatId = activeChatId;
    if (!targetChatId) {
      targetChatId = createConversation(text.substring(0, 30) + '...');
    }

    // Create User Message
    const userMsg: ChatMessage = {
      id: `user-msg-${Date.now()}`,
      sender: 'user',
      text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    // Update conversation with user message
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === targetChatId) {
          // Auto rename title if it was default
          const title = c.title === 'New AI Exploration' ? text.substring(0, 32) + (text.length > 32 ? '...' : '') : c.title;
          return {
            ...c,
            title,
            updatedAt: 'Just now',
            messages: [...c.messages, userMsg]
          };
        }
        return c;
      })
    );

    setIsStreaming(true);
    setStreamingText('');
    
    // Set simulated agents steps
    const simulatedAnswer = getSimulatedRAGAnswer(text);
    setCurrentAgentSteps(simulatedAnswer.agentSteps);
    setCurrentCitations([]);

    // 1. First state: Agent steps progress
    addKafkaLog(`[RAG-AGENT] Received query: "${text.substring(0, 40)}...". Triggering vector search.`);
    await new Promise((resolve) => setTimeout(resolve, 800));
    
    addKafkaLog(`[RAG-AGENT] Retrieved relevant chunks. Similarity confidence: ${(simulatedAnswer.confidence * 100).toFixed(0)}%. Routing to LLM.`);
    await new Promise((resolve) => setTimeout(resolve, 600));

    // 2. Set Citations
    setCurrentCitations(simulatedAnswer.citations);

    // 3. Stream letters
    const fullText = simulatedAnswer.answer;
    let index = 0;
    
    const streamInterval = setInterval(() => {
      if (index < fullText.length) {
        // Stream chunk by chunk (1 to 4 characters at a time for realism)
        const step = Math.floor(Math.random() * 3) + 2;
        const nextChars = fullText.substring(index, index + step);
        setStreamingText((prev) => prev + nextChars);
        index += step;
      } else {
        clearInterval(streamInterval);

        // Finalize assistant message
        const assistantMsg: ChatMessage = {
          id: `ai-msg-${Date.now()}`,
          sender: 'assistant',
          text: fullText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          modelUsed: models.find((m) => m.id === activeModelId)?.name || 'Default Model',
          confidenceScore: simulatedAnswer.confidence,
          latency: simulatedAnswer.latency,
          tokensUsed: Math.floor(fullText.length * 0.45) + 280,
          citations: simulatedAnswer.citations,
          agentSteps: simulatedAnswer.agentSteps
        };

        setConversations((prev) =>
          prev.map((c) => {
            if (c.id === targetChatId) {
              return {
                ...c,
                messages: [...c.messages, assistantMsg]
              };
            }
            return c;
          })
        );

        // Update system statistics
        setSystemMetrics((prev) => ({
          ...prev,
          totalQueries: prev.totalQueries + 1,
          totalTokens: prev.totalTokens + (assistantMsg.tokensUsed || 0) + 120,
          avgLatency: parseFloat(((prev.avgLatency * prev.totalQueries + simulatedAnswer.latency) / (prev.totalQueries + 1)).toFixed(2))
        }));

        addKafkaLog(`[INFERENCE] Streaming completed for query. Prompt Tokens: 120, Completion Tokens: ${Math.floor(fullText.length * 0.45)}.`);

        setIsStreaming(false);
        setStreamingText('');
        setCurrentCitations([]);
        setCurrentAgentSteps([]);
      }
    }, 15);
  };

  // Regenerate Response Action
  const regenerateResponse = async (messageId: string) => {
    // Find the message in the active chat and the query before it
    const activeChat = conversations.find((c) => c.id === activeChatId);
    if (!activeChat || isStreaming) return;

    const messageIndex = activeChat.messages.findIndex((m) => m.id === messageId);
    if (messageIndex === -1) return;

    // The user query is the message right before
    const prevMessage = activeChat.messages[messageIndex - 1];
    if (!prevMessage || prevMessage.sender !== 'user') return;

    // Delete all messages from the target index forward
    setConversations((prev) =>
      prev.map((c) => {
        if (c.id === activeChatId) {
          return {
            ...c,
            messages: c.messages.slice(0, messageIndex)
          };
        }
        return c;
      })
    );

    // Re-trigger query
    await sendChatMessage(prevMessage.text);
  };

  // Toggle dynamic active configuration of model
  const toggleModelActive = (id: string) => {
    setModels((prev) =>
      prev.map((m) => {
        if (m.id === id) {
          const newStatus = !m.active;
          addNotification(`${m.name} model status updated to ${newStatus ? 'ENABLED' : 'DISABLED'}`, 'info');
          addKafkaLog(`[ADMIN] User config change: model ${m.name} activeState is now ${newStatus}`);
          return { ...m, active: newStatus };
        }
        return m;
      })
    );
  };

  // Update prompt template text
  const updatePromptTemplate = (id: string, text: string) => {
    setPromptTemplates((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          addNotification(`System instructions updated for template "${t.name}"`, 'success');
          addKafkaLog(`[ADMIN] Prompt system instruction overwritten for [${t.name}].`);
          return { ...t, systemPrompt: text, lastModified: new Date().toISOString().replace('T', ' ').substring(0, 16) };
        }
        return t;
      })
    );
  };

  // Trigger Simulated Kafka Broker Failure
  const triggerSimulatedFailure = () => {
    setKafkaTopics((prev) =>
      prev.map((t) => {
        if (t.name === 'dlq-unparseable-files') {
          return {
            ...t,
            status: 'Critical',
            dlqCount: t.dlqCount + 12,
            lag: 185
          };
        }
        if (t.name === 'vector-embeddings-sync') {
          return {
            ...t,
            status: 'Degraded',
            lag: 340,
            throughputRate: 85
          };
        }
        return t;
      })
    );
    addKafkaLog('[ALERT] Kafka Broker 2 socket timeout on write segment. Re-routing queue to partition standby.');
    addKafkaLog('[WARNING] Topic vector-embeddings-sync consumer lag exceeded threshold (300 messages).');
    addKafkaLog('[ERROR] DLQ count spiked on topic dlq-unparseable-files. 12 payloads quarantined.');
    addNotification('Kafka Consumer Lag Alert triggered! Check Monitoring Dashboard.', 'error');
  };

  // Re-drive DLQ Messages
  const redriveDLQ = () => {
    setKafkaTopics((prev) =>
      prev.map((t) => {
        if (t.name === 'dlq-unparseable-files') {
          if (t.dlqCount === 0) return t;
          addKafkaLog(`[REDRIVE] Re-submitting ${t.dlqCount} failed events back into vector-embeddings-sync topic.`);
          return { ...t, dlqCount: 0, status: 'Healthy', lag: 0 };
        }
        if (t.name === 'vector-embeddings-sync') {
          return { ...t, status: 'Healthy', lag: Math.max(0, t.lag - 40) };
        }
        return t;
      })
    );
    addNotification('DLQ Redrive request completed. 100% of quarantined events re-queued.', 'success');
  };

  return (
    <AppContext.Provider
      value={{
        user,
        login,
        logout,
        documents,
        uploadDocuments,
        deleteDocument,
        triggerIngestionRetry,
        conversations,
        activeChatId,
        setActiveChatId,
        createConversation,
        deleteConversation,
        sendChatMessage,
        regenerateResponse,
        activeModelId,
        setActiveModelId,
        isStreaming,
        streamingText,
        currentCitations,
        currentAgentSteps,
        kafkaTopics,
        kafkaRateLimit,
        setKafkaRateLimit,
        systemMetrics,
        kafkaLogs,
        triggerSimulatedFailure,
        redriveDLQ,
        models,
        toggleModelActive,
        promptTemplates,
        updatePromptTemplate,
        activePromptTemplateId,
        setActivePromptTemplateId,
        theme,
        toggleTheme,
        notifications,
        addNotification,
        removeNotification
      }}
    >
      <div className={theme === 'dark' ? 'dark' : ''}>
        <div className="bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 min-h-screen transition-colors duration-250 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
          {children}
        </div>
      </div>
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
