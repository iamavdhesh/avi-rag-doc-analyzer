export interface DocumentItem {
  id: string;
  name: string;
  size: string;
  type: 'pdf' | 'docx' | 'txt';
  status: 'Ready' | 'Kafka Ingesting' | 'Chunking' | 'Vector Indexing' | 'Failed';
  progress: number; // 0 to 100
  kafkaTopic: string;
  chunksCount: number;
  uploadedAt: string;
  uploadedBy: string;
  vectorStatus: 'Synchronized' | 'Pending' | 'Failed';
}

export interface Citation {
  documentId: string;
  filename: string;
  text: string;
  score: number;
  page: number;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  text: string;
  timestamp: string;
  modelUsed?: string;
  confidenceScore?: number;
  latency?: number; // in seconds
  tokensUsed?: number;
  citations?: Citation[];
  agentSteps?: string[];
}

export interface ChatSession {
  id: string;
  title: string;
  updatedAt: string;
  messages: ChatMessage[];
  model: string;
}

export interface KafkaTopicStatus {
  name: string;
  partitions: number;
  consumers: number;
  throughputRate: number; // messages/sec
  lag: number;
  dlqCount: number;
  status: 'Healthy' | 'Degraded' | 'Critical';
}

export interface ModelConfig {
  id: string;
  name: string;
  provider: string;
  contextWindow: string;
  latency: string;
  costPer1k: number; // USD
  active: boolean;
}

export interface PromptTemplate {
  id: string;
  name: string;
  systemPrompt: string;
  category: 'RAG' | 'Summarization' | 'Compliance' | 'Extraction';
  lastModified: string;
}

// Initial uploaded documents
export const INITIAL_DOCUMENTS: DocumentItem[] = [
  {
    id: 'doc-1',
    name: 'Q4_Financial_Report_2025.pdf',
    size: '4.2 MB',
    type: 'pdf',
    status: 'Ready',
    progress: 100,
    kafkaTopic: 'document-ingestion-v1',
    chunksCount: 142,
    uploadedAt: '2026-02-10 09:15',
    uploadedBy: 'Elena Vance (Finance Admin)',
    vectorStatus: 'Synchronized'
  },
  {
    id: 'doc-2',
    name: 'Enterprise_Security_Protocol_v4.docx',
    size: '1.8 MB',
    type: 'docx',
    status: 'Ready',
    progress: 100,
    kafkaTopic: 'document-ingestion-v1',
    chunksCount: 68,
    uploadedAt: '2026-02-12 14:30',
    uploadedBy: 'Marcus Kane (CISO DevSecOps)',
    vectorStatus: 'Synchronized'
  },
  {
    id: 'doc-3',
    name: 'API_Gateway_Retry_Flow.txt',
    size: '350 KB',
    type: 'txt',
    status: 'Ready',
    progress: 100,
    kafkaTopic: 'document-ingestion-v1',
    chunksCount: 15,
    uploadedAt: '2026-02-14 11:05',
    uploadedBy: 'Devon Miller (Tech Lead)',
    vectorStatus: 'Synchronized'
  },
  {
    id: 'doc-4',
    name: 'Legal_Compliance_Auditing_2026.pdf',
    size: '8.4 MB',
    type: 'pdf',
    status: 'Vector Indexing',
    progress: 75,
    kafkaTopic: 'document-ingestion-v1',
    chunksCount: 210,
    uploadedAt: '2026-02-15 16:45',
    uploadedBy: 'Sarah Connor (Legal Lead)',
    vectorStatus: 'Pending'
  },
  {
    id: 'doc-5',
    name: 'Standard_Operating_Procedures_SOP.docx',
    size: '12.1 MB',
    type: 'docx',
    status: 'Kafka Ingesting',
    progress: 25,
    kafkaTopic: 'document-ingestion-v1',
    chunksCount: 0,
    uploadedAt: '2026-02-15 17:01',
    uploadedBy: 'Elena Vance (Finance Admin)',
    vectorStatus: 'Pending'
  }
];

// Initial Chat Sessions
export const INITIAL_CONVERSATIONS: ChatSession[] = [
  {
    id: 'chat-1',
    title: 'Payment retry architecture',
    updatedAt: '10 minutes ago',
    model: 'gpt-4o-enterprise',
    messages: [
      {
        id: 'm1',
        sender: 'user',
        text: 'Explain payment retry flow described in the API Gateway document.',
        timestamp: '2:14 PM'
      },
      {
        id: 'm2',
        sender: 'assistant',
        text: 'According to the **API_Gateway_Retry_Flow.txt** document, the payment retry architecture utilizes an exponential backoff system with a jitter modifier to distribute load on gateway recovery.\n\n### Key Components:\n1. **Initial Trigger**: Upon receipt of an HTTP 502/503/504 error code from the payment provider (Stripe/Adyen), the API Gateway intercepts the response.\n2. **Backoff Formula**: The system calculates retry delay using: \n   `Delay = Min(Base * Factor^Attempt + Jitter, MaxDelay)` where `Base = 1.5s`, `Factor = 2`, and `MaxDelay = 30s`.\n3. **Queue Redirection**: After **3 failed attempts**, the message is pushed to the Kafka queue `payment-retry-dlq` for async processing.\n\nThis guarantees high availability without causing a denial-of-service on upstream ledger services.',
        timestamp: '2:15 PM',
        modelUsed: 'GPT-4o Enterprise',
        confidenceScore: 0.96,
        latency: 1.45,
        tokensUsed: 420,
        citations: [
          {
            documentId: 'doc-3',
            filename: 'API_Gateway_Retry_Flow.txt',
            text: 'Retry configuration: initial_backoff=1.5s, factor=2, max_retry_attempts=3. Redirect to payment-retry-dlq after exhaustion.',
            score: 0.98,
            page: 1
          },
          {
            documentId: 'doc-3',
            filename: 'API_Gateway_Retry_Flow.txt',
            text: 'To avoid thundering herd issues, Jitter is calculated as random value between 100ms and 500ms added to current interval.',
            score: 0.91,
            page: 2
          }
        ],
        agentSteps: [
          'Rewrote prompt to: "payment retry parameters API gateway backoff retry limits"',
          'Queried Vector Store index: document-ingestion-v1 (Top-k: 3 docs retrieved)',
          'Filter applied: score >= 0.80. Identified API_Gateway_Retry_Flow.txt as relevant.',
          'Synthesized response using model context windows (2,400 prompt tokens).'
        ]
      }
    ]
  },
  {
    id: 'chat-2',
    title: 'Financial Q4 Review summary',
    updatedAt: '2 hours ago',
    model: 'claude-3-5-sonnet',
    messages: [
      {
        id: 'm3',
        sender: 'user',
        text: 'What are the main financial risks identified for Q4 2025?',
        timestamp: '11:02 AM'
      },
      {
        id: 'm4',
        sender: 'assistant',
        text: 'Based on **Q4_Financial_Report_2025.pdf**, the primary risks are related to currency headwinds and international transaction costs:\n\n* **Foreign Exchange Volatility**: A 4.2% shift in the EUR-USD exchange rate affected our overseas profit margin by $1.2M.\n* **Vendor Supply Costs**: SaaS operational infrastructure costs rose by 14% due to unexpected compute demand from cloud indexer scaling.\n* **Client Retention**: 2 major enterprise contracts are up for renewal in Q1 2026, posing a potential $950K recurring revenue risk if negotiations stall.\n\nThe mitigation strategies are detailed in Section 4.3 (Hedging operations) and Section 5.1 (Reserved Instance purchasing).',
        timestamp: '11:03 AM',
        modelUsed: 'Claude 3.5 Sonnet RAG',
        confidenceScore: 0.92,
        latency: 2.10,
        tokensUsed: 680,
        citations: [
          {
            documentId: 'doc-1',
            filename: 'Q4_Financial_Report_2025.pdf',
            text: 'Forex exposure on Eurozone operations remains high. Net margin declined by 1.2M USD due to euro devaluation.',
            score: 0.94,
            page: 12
          },
          {
            documentId: 'doc-1',
            filename: 'Q4_Financial_Report_2025.pdf',
            text: 'Infrastructure overhead increased 14% on higher database read replicas and embedding storage costs.',
            score: 0.87,
            page: 18
          }
        ],
        agentSteps: [
          'Rewrote prompt to: "Q4 2025 financial risks currency headwinds vendor costs"',
          'Retrieved 4 chunks from Vector DB (Indexed 2026-02-10)',
          'Model routing selected: Claude 3.5 Sonnet'
        ]
      }
    ]
  }
];

// Kafka Topic Statuses
export const INITIAL_KAFKA_TOPICS: KafkaTopicStatus[] = [
  {
    name: 'document-ingestion-v1',
    partitions: 8,
    consumers: 4,
    throughputRate: 145, // m/s
    lag: 12,
    dlqCount: 0,
    status: 'Healthy'
  },
  {
    name: 'vector-embeddings-sync',
    partitions: 16,
    consumers: 8,
    throughputRate: 320,
    lag: 48,
    dlqCount: 2,
    status: 'Healthy'
  },
  {
    name: 'ai-inference-logs',
    partitions: 4,
    consumers: 2,
    throughputRate: 12,
    lag: 0,
    dlqCount: 0,
    status: 'Healthy'
  },
  {
    name: 'dlq-unparseable-files',
    partitions: 2,
    consumers: 1,
    throughputRate: 0,
    lag: 0,
    dlqCount: 8,
    status: 'Degraded'
  }
];

// Model configurations
export const MODEL_CONFIGS: ModelConfig[] = [
  {
    id: 'gpt-4o-enterprise',
    name: 'GPT-4o Enterprise',
    provider: 'OpenAI',
    contextWindow: '128k',
    latency: '1.2s - 1.8s',
    costPer1k: 0.015,
    active: true
  },
  {
    id: 'claude-3-5-sonnet',
    name: 'Claude 3.5 Sonnet',
    provider: 'Anthropic',
    contextWindow: '200k',
    latency: '1.8s - 2.5s',
    costPer1k: 0.020,
    active: true
  },
  {
    id: 'llama3-70b-internal',
    name: 'Llama 3.1 70B (Internal)',
    provider: 'Self-Hosted (VLLM)',
    contextWindow: '32k',
    latency: '0.8s - 1.2s',
    costPer1k: 0.002,
    active: true
  },
  {
    id: 'deepseek-r1-distilled',
    name: 'DeepSeek R1 Distilled',
    provider: 'Together AI',
    contextWindow: '64k',
    latency: '2.5s - 4.0s',
    costPer1k: 0.005,
    active: false
  }
];

// Prompt Templates
export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: 'tmpl-rag',
    name: 'Strict RAG Grounding Prompt',
    systemPrompt: 'You are an advanced enterprise AI assistant. Your main task is to synthesize answers using the retrieved document context. ALWAYS cite the document name and page number. If the retrieved context does not contain the answer, state that you cannot find the answer based on the provided material.',
    category: 'RAG',
    lastModified: '2026-01-20 10:00'
  },
  {
    id: 'tmpl-sum',
    name: 'Executive Summary Generator',
    systemPrompt: 'Summarize the provided context in three paragraphs: 1) Executive Summary, 2) Core Findings, 3) Actionable Next Steps. Highlight figures and risks in bold formatting.',
    category: 'Summarization',
    lastModified: '2026-02-05 13:12'
  },
  {
    id: 'tmpl-compliance',
    name: 'SOC2/HIPAA Auditing Guard',
    systemPrompt: 'Evaluate the retrieved security policies against SOC2 Trust Security Principles. Flag any compliance gaps, outdated versions, or missing backup definitions immediately.',
    category: 'Compliance',
    lastModified: '2026-02-11 08:30'
  }
];

// Suggested prompt suggestions
export const SUGGESTED_PROMPTS = [
  'Explain payment retry flow details.',
  'What are the foreign exchange risks in Q4 2025?',
  'List all security measures for CISO DevSecOps.',
  'Summarize the API Gateway configuration values.'
];
