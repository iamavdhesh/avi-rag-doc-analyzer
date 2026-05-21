# AVI RAG Document Platform

## Overview

`AVI RAG Document Platform` is a polished React + Vite frontend prototype for an enterprise AI document intelligence workspace. It combines document ingestion, Kafka-style stream monitoring, RAG-augmented conversational search, and system configuration controls in a single dashboard experience.

This app is designed to showcase:

- Document upload and ingestion pipeline status
- Kafka and stream processing health monitoring
- AI conversation workspace with retrieval-augmented generation (RAG) features
- Model routing and prompt template management
- Role-based interface states and permission-aware actions
- Real-time notifications and telemetry dashboards

## Key Features

- **Dashboard Control Panel**
  - System analytics with document, query, latency, and Kafka status KPIs
  - Interactive metric visualizations for throughput, latency, and query volume
  - Simulated failure injection and DLQ redrive actions

- **Document Ingestion Portal**
  - Drag-and-drop PDF / DOCX / TXT upload UI
  - Document status stages: Kafka ingestion, chunking, vector indexing, ready
  - Search and filter by document name or pipeline status
  - Role-based editing restrictions (Admin / Data Engineer vs General User)

- **AI Chat Workspace**
  - Persistent conversation sessions with model selection
  - Chat suggestions, speech synthesis, voice input fallback, and transcript export
  - RAG insights, citations, and agent step logging for retrieval transparency
  - Model and prompt template routing for enterprise compliance

- **Kafka Monitor**
  - Topic-level throughput, consumer lag, DLQ count, and cluster health
  - Rate limit slider for ingestion control (Admin/Data Engineer only)
  - Simulated operational events and broker log feed

- **Admin Panel**
  - Model activation toggle for routing available LLMs
  - Prompt template management for RAG system directives
  - Token usage and cost estimates for enterprise budget tracking
  - Permission-aware controls for compliance and policy roles

## Technologies

- React 19
- Vite 7
- TypeScript 5
- Tailwind CSS 4
- lucide-react icon library
- clsx and tailwind-merge utilities

## Project Structure

- `src/App.tsx` — main layout and tab rendering
- `src/AppContext.tsx` — app state, mock backend simulation, auth and notification logic
- `src/mockData.ts` — sample documents, conversations, Kafka topics, models, and prompts
- `src/components/` — UI modules for dashboard, upload, chat, Kafka, admin, header, sidebar, and notifications

## Getting Started

### Install dependencies

```bash
npm install
```

### Run development server

```bash
npm run dev
```

Open the local Vite URL shown in the terminal to use the app.

### Build for production

```bash
npm run build
```

### Preview production build

```bash
npm run preview
```

## Usage Notes

- The app is currently a frontend prototype with mock data and simulated pipeline behavior.
- Authentication is demo-style and supports multiple persona modes via the header selector.
- Admin and Data Engineer roles unlock ingestion and Kafka controls; Compliance unlocks policy routing.
- Documents uploaded from the UI are processed in-memory with status transitions simulated over time.

## Customization

To extend the platform:

- Add backend integrations for real document storage, vector databases, and AI APIs
- Replace mock Kafka topic state with a real Kafka or event-streaming backend
- Wire the chat workspace to a real LLM provider and vector retrieval service
- Add persistent storage for prompt templates and user profiles

## License

This repository currently does not include a license file. If you want to open-source it, add a suitable license such as MIT.

---

`AVI RAG Document Platform` is intended as a design-first enterprise AI dashboard prototype for knowledge retrieval, document operations, and observability.