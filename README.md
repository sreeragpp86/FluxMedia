# FluxMedia

**A Fault-Tolerant Asynchronous Media Processing Pipeline**

FluxMedia is a decoupled backend architecture designed to handle heavy, concurrent video transcoding workloads. By utilizing FastAPI, Redis, and Celery, this system offloads CPU-intensive FFmpeg tasks from the main event loop to distributed worker nodes, ensuring high-performance API responsiveness and zero thread starvation.

---

## 🏗️ System Architecture

The core philosophy of FluxMedia is to strictly separate the ingestion API from the processing execution layer.

```text
[ Client (Next.js) ]
         │  POST /upload (multipart/form-data)
         ▼
[ FastAPI Gateway ] ──(Enqueues Task)──► [ Redis Broker ]
         │ (Returns task_id: HTTP 202)          │
         │                                      │ (Pulls Task)
         │                                      ▼
         │                             [ Celery Worker Node ]
         │                                      │
         │                              [ FFmpeg Subprocess ]
         │                              (H.264 Transcoding)
         ▼                                      │
[ Polling /status ] ◄──(Job State & Output)─────┘
```

1. **FastAPI (Ingestion Layer):** Receives large media files, validates payloads against security policies, persists raw media to disk with sanitized identifiers, and immediately dispatches an execution ticket to the queue.
2. **Redis (Message Broker & Result Store):** Acts as the low-latency transport layer, queuing task payloads and caching real-time job execution states.
3. **Celery (Worker Nodes):** Pulls tasks asynchronously from Redis and executes isolated video transcoding subprocesses outside the API event loop.
4. **FFmpeg Processing Engine (Hardware-Aware):** Executes H.264 video compression (`libx264` or macOS `videotoolbox` hardware acceleration), enforcing strict rate controls and output integrity checks.

---

## ⚙️ Tech Stack

* **Backend Framework:** Python 3.10+, FastAPI, Uvicorn
* **Task Queue & Broker:** Celery, Redis
* **Media Processing Engine:** FFmpeg (H.264 `libx264` / `videotoolbox`)
* **Frontend Dashboard:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS, Framer Motion
* **Design System:** Onyx & Alabaster (Monochrome Enterprise UI)
* **Infrastructure:** Docker (Optional for containerized Redis deployment)

---

## 🚀 Key Features

* **Non-Blocking Ingestion:** The FastAPI server instantly returns a `task_id` (HTTP 202 Accepted) upon upload, keeping the async event loop free for subsequent requests.
* **Real-Time Status Polling:** A dedicated `/status/{task_id}` endpoint allows client frontends to track job progression (`PENDING` ➔ `PROCESSING` ➔ `COMPLETED` / `ERROR`) without persistent WebSocket overhead.
* **Hardware-Aware Compression:** FFmpeg worker tasks utilize adaptive rate factor encoding with configurable CRF boundaries (18–35) and hardware encoder hooks.
* **Enterprise Security Measures:** File sanitization guards against directory traversal attacks (`../`), strict extension allowlists (`.mp4`, `.mov`, `.webm`, etc.), and a 500MB upload threshold.
* **Onyx & Alabaster UI:** A sleek, distraction-free monochrome interface with micro-interactions, Bento grid telemetry, and cursor-following spotlight shaders.

---

## 📁 Repository Structure

```text
FluxMedia/
├── app/
│   ├── __init__.py        # Application package marker
│   ├── main.py            # FastAPI ingestion gateway & REST routes
│   └── worker.py          # Celery worker task definitions & FFmpeg pipeline
├── frontend/              # Next.js App Router frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx # Root layout with theme provider
│   │   │   ├── page.tsx   # Bento-box dashboard (Upload, Polling, Results)
│   │   │   ├── loading.tsx# Native skeleton loading state
│   │   │   ├── not-found.tsx # High-contrast 404 page
│   │   │   └── terms/     # Technical demonstration terms & disclaimer
│   │   ├── components/    # Reusable UI components
│   │   └── lib/           # Client API layer & utilities
│   ├── tailwind.config.ts # Onyx (#09090B) & Alabaster (#FAFAFA) configuration
│   └── package.json
├── uploads/               # Ephemeral storage for raw & processed media
├── requirements.txt       # Python backend dependencies
└── README.md
```

---

## 🛠️ Local Development Setup

To run the complete distributed system locally, open separate terminal windows or tabs from the project root.

### Prerequisites

Ensure you have the following installed on your system:
* **Python 3.10+**
* **Node.js 18+** and **npm**
* **FFmpeg** (`brew install ffmpeg` on macOS, or `apt install ffmpeg` on Linux)
* **Redis** (via Docker or native service)

---

### Step 1: Start the Redis Broker

**Option A — Via Docker (Recommended):**
```bash
docker run -d -p 6379:6379 --name fluxmedia-redis redis:alpine
```

**Option B — Native Service (macOS / Homebrew):**
```bash
brew services start redis
# Or run in foreground:
redis-server
```
> Verify Redis is running by checking `redis-cli ping` (should respond with `PONG`).

---

### Step 2: Set Up Backend Virtual Environment

```bash
# From the repository root
python3 -m venv venv
source venv/bin/activate
pip install -r requirements.txt
```

---

### Step 3: Start the Celery Worker

Open **Terminal Tab 1**:
```bash
# Ensure virtual environment is active
source venv/bin/activate

# Start worker (solo pool is recommended for macOS)
celery -A app.worker.celery_app worker --loglevel=info
```

---

### Step 4: Start the FastAPI Server

Open **Terminal Tab 2**:
```bash
# Ensure virtual environment is active
source venv/bin/activate

# Launch the API with auto-reload
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
* **API Endpoint:** `http://127.0.0.1:8000`
* **Interactive Swagger Documentation:** `http://127.0.0.1:8000/docs`
* **Health Check:** `http://127.0.0.1:8000/health`

---

### Step 5: Start the Next.js Frontend

Open **Terminal Tab 3**:
```bash
cd frontend
npm install
npm run dev
```
* **Frontend Dashboard:** [http://localhost:3000](http://localhost:3000)

---

## 📡 API Specification

| Method | Endpoint | Description | Status Code |
| :--- | :--- | :--- | :--- |
| `POST` | `/upload` | Ingests video file via `multipart/form-data`, returns Celery `task_id` | `202 Accepted` |
| `GET` | `/status/{task_id}` | Polls the current state of a task (`PENDING`, `PROCESSING`, `COMPLETED`, `ERROR`) | `200 OK` |
| `GET` | `/download/{filename}` | Streams processed media back to the client | `200 OK` |
| `GET` | `/health` | Verifies API and worker process readiness | `200 OK` |
| `GET` | `/docs` | OpenAPI / Swagger interactive documentation interface | `200 OK` |

---

## 🔒 Data Retention & Security

* **Ephemeral Storage:** This application is configured for asynchronous technical demonstrations. Files processed in `uploads/` should be treated as ephemeral.
* **Input Sanitization:** Uploaded filenames are stripped of path separators and non-standard characters to neutralize directory traversal vulnerabilities.
* **Payload Limits:** Request bodies exceeding 500MB are rejected at the gateway level.

---

## 📄 License & Attribution

Designed and engineered by **Sreerag P P** as an enterprise-grade reference architecture for distributed media orchestration.
