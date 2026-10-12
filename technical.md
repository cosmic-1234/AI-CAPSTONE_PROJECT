# Sahayata (सहायता) – Technical Architecture & System Design

**Indian Institute of Management Bodh Gaya (IIM Bodh Gaya)**  
*MBA Capstone Project: Enterprise Financial Assistance & Scholarship Portal*  
*Architecture Specification & Engineering Reference*

---

## 1. System Overview & Monorepo Architecture

Sahayata is architected as a high-performance, decoupled monorepo structured via standard **npm workspaces**. It isolates backend domain logic, LangGraph workflows, and database layers from the presentation layer while sharing configuration schemas.

```
AI_CAPSTONE_PROJECT/
├── api/                           # Backend Node.js / Express / LangGraph / RAG API
│   ├── src/
│   │   ├── agent/                 # LangGraph.js Agent Graph & State Machine
│   │   ├── db/                    # Better-SQLite3 Schema & Seed Scripts
│   │   ├── guardrails/            # Input & Output Guardrail Evaluators
│   │   ├── llm/                   # Gemini 1.5 Flash Client & Cache Layer
│   │   ├── rag/                   # Chunker, Embeddings, Vector & BM25 Stores
│   │   ├── routes/                # Express Route Handlers (Auth, Agent, Traces)
│   │   ├── scripts/               # Ingest, Evaluation & Load-Test Scripts
│   │   ├── tools/                 # Deterministic Tool Execution Engine
│   │   ├── tracing/               # Audit Logging & Latency Breakdown
│   │   ├── config.ts              # Environment & Configuration Loader
│   │   └── server.ts              # Express Server Entry Point (Port 4000)
│   ├── package.json
│   └── tsconfig.json
├── web/                           # Frontend Next.js 14 App Router Portal
│   ├── src/
│   │   ├── app/                   # App Router Pages & API Proxies
│   │   │   ├── accounts/          # Disbursement & Adjustment Desk
│   │   │   ├── admin/             # Hardening, Traces, KB & Red-Team Pages
│   │   │   ├── applications/      # Student & Staff Application Tracker
│   │   │   ├── chat/              # Bilingual Policy Chat Interface
│   │   │   ├── check-eligibility/ # Rules Pre-Screening Evaluation Form
│   │   │   ├── committee/         # Two-Tier Approval Console
│   │   │   ├── rag-preview/       # Real-Time Chunk & Citation Inspector
│   │   │   ├── upload/            # Document Upload Checklist
│   │   │   ├── layout.tsx         # Root Layout & Institute Header/Footer
│   │   │   └── globals.css        # Vanilla CSS Design System (Lora Typography)
│   │   └── lib/                   # Session, User Cookies & API Client
│   ├── next.config.mjs            # Webpack Path Aliasing & Build Optimizations
│   ├── package.json
│   └── tsconfig.json
├── config/                        # Shared Institutional Governance Policies (YAML)
│   ├── brand.yaml                 # IIM Bodh Gaya Visual Identity, Calendar & Offices
│   ├── hardening.yaml             # Real-Time Policy Guardrail Toggles
│   ├── pricing.yaml               # Token & INR Pricing Configurations
│   └── schemes.yaml               # Financial Aid Eligibility Criteria & Slabs
├── knowledge_base/                # Official Institutional Policy Documents (PDF/MD)
├── data/                          # CSV Data Seeds (students.csv, applications.csv)
├── package.json                   # Root Workspace Config
├── render.yaml                    # Render Cloud Deployment Blueprint
└── tsconfig.json                  # Root Monorepo TypeScript Resolver
```

---

## 2. Technology Stack & Component Matrix

| Tier | Technology | Version | Purpose |
| :--- | :--- | :--- | :--- |
| **Frontend Framework** | Next.js (App Router) | `14.2.35` | SSR/SSG rendering, React Server Components, routing |
| **Frontend Library** | React & React DOM | `18.3.1` | Declarative UI rendering, hooks, state handling |
| **Styling & Design** | Vanilla CSS + Design Tokens | Custom | Lightweight, zero-runtime CSS, fluid responsiveness |
| **Typography** | Google Fonts (Lora, Inter) | Web Fonts | Editorial academic aesthetic with optimal readability |
| **Backend Runtime** | Node.js | `20.x` / `24.x` | Asynchronous I/O runtime environment |
| **Backend Server** | Express.js | `4.21.2` | REST API routing, middleware chaining, JSON parsing |
| **Language** | TypeScript | `5.7.3` | End-to-end type safety across both workspaces |
| **Orchestration / Agent** | LangGraph.js (`@langchain/langgraph`) | `1.4.21` | Cyclic state-graph execution and multi-step reasoning |
| **LLM Provider** | Google Generative AI (`@google/generative-ai`) | `0.21.0` | Gemini 1.5 Flash live inference engine |
| **Database Engine** | SQLite3 via `better-sqlite3` | `11.8.1` | High-throughput, zero-latency synchronous database |
| **Vector Search** | In-Memory Dense Cosine Similarity | Custom | Fast dot-product vector search across 384 dimensions |
| **Keyword Search** | MiniSearch | `7.1.1` | BM25 sparse full-text search with prefix matching |
| **Security & Headers** | Helmet | `8.0.0` | CSP, XSS protection, MIME sniffing prevention |
| **Logging** | Pino & Pino-Pretty | `9.6.0` | High-speed structured JSON audit logging |
| **Document Parsers** | `pdf-parse` & `mammoth` | `1.1.1` / `1.9.0` | Text extraction from PDF policies and Word handbooks |

---

## 3. Backend Architecture & API Specifications

### 3.1 Server Pipeline & Middleware Stack (`api/src/server.ts`)

Every HTTP request to `sahayata-api` flows through a structured middleware chain:
1. **Helmet Middleware**: Enforces secure HTTP headers (`X-Content-Type-Options: nosniff`, `X-Frame-Options: SAMEORIGIN`, strict Content Security Policy).
2. **Dynamic CORS Middleware**: Permits cross-origin requests from `http://localhost:3000`, `*.onrender.com` subdomains, and designated production domains while supporting cookie credentials.
3. **Body Parser**: Handles incoming JSON payloads up to `10MB` for document metadata and agent messages.
4. **IP Rate Limiter**: Implements a sliding window rate limiter (max 300 requests per 15-minute window per IP) using `express-rate-limit`.
5. **Pino Request Logger**: Tracks method, URL path, HTTP status code, and latency in milliseconds.

### 3.2 REST API Endpoints Catalog

#### System & Configuration
- `GET /health`: Health-check endpoint verifying database connectivity, institute branding, and server uptime.
- `GET /api/brand`: Returns institutional metadata (IIM Bodh Gaya name, primary color `#9C2720`, official calendar deadlines, programmes).
- `GET /api/hardening/config`: Returns the current states of all 14 active policy guardrails.
- `POST /api/hardening/config`: Updates guardrail configurations in real time (persisted to `config/hardening.yaml`).

#### Agent & Inference
- `POST /api/agent/chat`: Primary endpoint for student and staff queries.
  - **Payload**: `{ message: string, role: string, studentId?: string, sessionId?: string }`
  - **Response**: Full agent state execution result including `finalOutput`, `route`, `guardsFired`, `retrievedChunks`, `costInr`, and `runId`.
- `GET /api/agent/diagram`: Returns the Mermaid graph string of the LangGraph state machine.
- `POST /api/agent/tool`: Directly executes an institutional tool with provided arguments for administrative testing.
- `GET /api/agent/tools`: Returns the catalog of all allowlisted tools and parameter schemas.

#### Retrieval & Knowledge Base
- `POST /api/rag/query`: Queries the hybrid search engine (Dense Cosine + BM25 RRF) directly without invoking the LLM generation step.
- `GET /api/rag/manifest`: Returns all indexed policy documents, file sizes, and verification statuses.

#### Traces & Observability
- `GET /api/traces`: Fetches paginated execution traces from SQLite (`audit_traces`), complete with latency breakdowns and guard firing records.

---

## 4. Relational Database Architecture (`sahayata.db`)

Sahayata utilizes **SQLite 3** operating in **Write-Ahead Logging (WAL)** mode (`PRAGMA journal_mode = WAL`). WAL enables concurrent readers to access data without locking out writing transactions, delivering sub-millisecond query performance.

### 4.1 Schema Definitions

```sql
-- 1. Institutional Users Table
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT NOT NULL UNIQUE,
  role TEXT NOT NULL CHECK(role IN ('student', 'staff', 'committee', 'admin')),
  programme TEXT,
  batch TEXT,
  annual_family_income REAL,
  cgpa REAL,
  category TEXT,
  phone TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 2. Financial Aid Applications Table
CREATE TABLE IF NOT EXISTS applications (
  id TEXT PRIMARY KEY,
  student_id TEXT NOT NULL REFERENCES users(id),
  scheme_id TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('draft', 'submitted', 'under_verification', 'committee_review', 'approved', 'rejected', 'disbursed')),
  requested_amount REAL NOT NULL,
  recommended_amount REAL NOT NULL,
  approved_amount REAL NOT NULL,
  submitted_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  verification_status TEXT,
  committee_decision TEXT,
  decision_rationale TEXT
);

-- 3. Knowledge Base Chunks Table
CREATE TABLE IF NOT EXISTS kb_chunks (
  id TEXT PRIMARY KEY,
  doc_id TEXT NOT NULL,
  title TEXT NOT NULL,
  section TEXT NOT NULL,
  version TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('current', 'superseded')),
  access_level TEXT NOT NULL CHECK(access_level IN ('public', 'staff', 'committee')),
  token_count INTEGER NOT NULL,
  content TEXT NOT NULL,
  heading_hierarchy TEXT
);

-- 4. Dense Vector Embeddings Table
CREATE TABLE IF NOT EXISTS kb_vectors (
  chunk_id TEXT PRIMARY KEY REFERENCES kb_chunks(id),
  dimensions INTEGER NOT NULL,
  vector_json TEXT NOT NULL
);

-- 5. BM25 Inverted Term Index Table
CREATE TABLE IF NOT EXISTS kb_keyword_terms (
  term TEXT NOT NULL,
  chunk_id TEXT NOT NULL REFERENCES kb_chunks(id),
  term_frequency REAL NOT NULL,
  PRIMARY KEY (term, chunk_id)
);

-- 6. Zero-Cost LLM Response Cache Table
CREATE TABLE IF NOT EXISTS llm_cache (
  prompt_hash TEXT PRIMARY KEY,
  provider TEXT NOT NULL,
  model TEXT NOT NULL,
  response_text TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 7. Audit & Observability Traces Table
CREATE TABLE IF NOT EXISTS audit_traces (
  run_id TEXT PRIMARY KEY,
  session_id TEXT,
  timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
  role TEXT NOT NULL,
  masked_input TEXT NOT NULL,
  route TEXT NOT NULL,
  status TEXT NOT NULL,
  failure_id TEXT,
  guards_fired TEXT,
  prompt_tokens INTEGER,
  completion_tokens INTEGER,
  latency_ms REAL,
  latency_breakdown TEXT,
  inr_cost REAL,
  output TEXT,
  retrieved_chunks TEXT
);

-- 8. Human-in-the-Loop Action Proposals Table
CREATE TABLE IF NOT EXISTS action_proposals (
  id TEXT PRIMARY KEY,
  action_type TEXT NOT NULL,
  target_id TEXT NOT NULL,
  payload_json TEXT,
  status TEXT NOT NULL CHECK(status IN ('pending_approval', 'approved', 'rejected', 'sent')),
  created_by TEXT NOT NULL,
  approved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  sent_at DATETIME
);

-- 9. Idempotent Disbursement Notes Table
CREATE TABLE IF NOT EXISTS disbursement_notes (
  id TEXT PRIMARY KEY,
  idempotency_key TEXT UNIQUE NOT NULL,
  application_id TEXT NOT NULL REFERENCES applications(id),
  amount REAL NOT NULL,
  remarks TEXT NOT NULL,
  status TEXT NOT NULL CHECK(status IN ('pending_approval', 'approved', 'rejected', 'disbursed')),
  created_by TEXT NOT NULL,
  approved_by TEXT,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  disbursed_at DATETIME
);
```

---

## 5. Tool Registry & Deterministic Execution

The agent does not perform direct database manipulation or mathematical evaluation via prompt guessing. Instead, it relies on a strict catalog of deterministic TypeScript tools in `api/src/tools/index.ts`:

1. **`check_eligibility_rules`**:
   - Evaluates a student's profile (income, CGPA, programme, category) against `config/schemes.yaml`.
   - Returns boolean eligibility status, maximum coverage, required documents, and policy citations.
2. **`lookup_student_record`**:
   - Retrieves enrolled student records from `users` (scrubbed of sensitive bank details).
3. **`query_application_status`**:
   - Queries `applications` table to track progress, committee notes, and recommended amounts.
4. **`calculate_waiver_slab`**:
   - Computes exact rupee figures based on annual tuition fee schedules for PGP and IPM.
5. **`generate_disbursement_note`**:
   - Generates an idempotent adjustment voucher record for the Accounts Office.
6. **`emergency_welfare_handoff`**:
   - Issues immediate triage notices to the Student Welfare Officer and Counselling Cell.

---

## 6. Frontend Architecture & Design System (`web`)

### 6.1 Next.js 14 App Router Hierarchy
- **Server Components (RSC)**: Used by default for all page entry points (`/chat`, `/applications`, `/committee`, `/admin`) to perform fast initial data fetching and read session cookies on the server before client hydration.
- **Client Components (`'use client'`)**: Isolated to interactive UI widgets (such as `ChatInterface.tsx` and interactive toggle panels).
- **Session Bridge (`web/src/lib/session.ts`)**: Reads HTTP-only session cookies and exports self-healing API URLs that automatically clean accidental formatting errors.

### 6.2 Vanilla CSS & Design Tokens (`web/src/app/globals.css`)
Sahayata intentionally uses pure, hand-crafted Vanilla CSS with CSS custom properties rather than heavy CSS-in-JS or Tailwind dependencies:
- **Brand Colors**:
  - Primary Academic Crimson: `#9C2720` (`--primary`)
  - Deep Navy Slate: `#1B365D` (`--navy`)
  - Warm Parchment Surface: `#F9F8F6` (`--surface-warm`)
  - Border Accents: `#E8E4DD` (`--border`)
- **Typography Tokens**:
  - Editorial Headings: `'Lora', Georgia, serif`
  - Crisp System Body: `'Inter', -apple-system, sans-serif`
- **Visual Polish**:
  - Glassmorphic card surfaces (`backdrop-filter: blur(8px)`)
  - Subtle hover elevation transforms (`transform: translateY(-2px)`)
  - Smooth micro-animations for message streaming and status badges.

---

## 7. Cloud Deployment & DevOps Specification (Render)

The project is configured for cloud deployment via a unified **Render Blueprint** (`render.yaml`).

### 7.1 Infrastructure Topology
- **`sahayata-api`**:
  - Environment: Node.js Web Service
  - Build Command: `npm install --include=dev && npm run build --workspace=api`
  - Start Command: `npm run start --workspace=api`
  - Port Binding: Listens on `0.0.0.0:$PORT`
  - Health Check: `/health`
- **`sahayata-web`**:
  - Environment: Node.js Web Service
  - Build Command: `npm install --include=dev && npm run build --workspace=web`
  - Start Command: `npm run start --workspace=web`
  - Internal Connection: References `sahayata-api` via `INTERNAL_API_URL` and `NEXT_PUBLIC_API_URL`.

### 7.2 Memory-Constrained Optimizations (512MB RAM)
On Render's free tier (512MB RAM limit), standard Node.js applications that load PyTorch or ONNX runtimes frequently crash due to Linux Out-Of-Memory (`SIGKILL`) termination. 

Sahayata prevents this through two specific optimizations:
1. **Adaptive Transformer Bypassing**: In production (`NODE_ENV === 'production'`), `getLocalPipeline()` avoids loading the 250MB+ `@xenova/transformers` model into RAM, immediately utilizing the high-speed 384-dimensional deterministic dense vector generator or Google Gemini's cloud embedding endpoint.
2. **Next.js Production Build Flags**: In `web/next.config.mjs`, `typescript: { ignoreBuildErrors: true }` and `eslint: { ignoreDuringBuilds: true }` skip duplicate type-checking passes during production bundling, allowing the build worker to stay well within memory limits.
