# FluxMedia - Distributed Media Task Queue

FluxMedia is a full-stack distributed media processing task queue built with **FastAPI**, **Celery**, **Redis**, and **Next.js (App Router)** on macOS. It is designed to handle asynchronous, CPU-intensive media processing workloads (such as FFmpeg H.264 video compression) with an elegant **Onyx & Alabaster** user interface.

---

## Project Structure

```text
FluxMedia/
├── app/
│   ├── __init__.py        # App package marker
│   ├── main.py            # FastAPI API gateway (UploadFile, CORS, Download, Status)
│   └── worker.py          # Celery worker (FFmpeg H.264 transcoding, solo pool)
├── frontend/              # Next.js App Router Frontend
│   ├── src/
│   │   ├── app/
│   │   │   ├── layout.tsx # Root layout with Onyx & Alabaster ThemeProvider
│   │   │   ├── page.tsx   # Interactive pipeline UI (Upload, Track, Result)
│   │   │   └── globals.css# Tailwind theme styles
│   │   ├── components/
│   │   │   ├── Navbar.tsx        # Header with branding & theme toggle
│   │   │   ├── UploadZone.tsx    # Minimalist drag-and-drop video uploader
│   │   │   ├── StatusTracker.tsx # 2-second polling with Framer Motion animations
│   │   │   ├── SpotlightCard.tsx # Cursor-tracking spotlight illumination card
│   │   │   ├── ResultCard.tsx    # Completion card with instant download CTA
│   │   │   ├── ThemeProvider.tsx # Client theme provider wrapper
│   │   │   └── ThemeToggle.tsx   # Dark/light theme switch
│   │   └── lib/
│   │       ├── api.ts     # API client connecting to FastAPI backend
│   │       └── utils.ts   # Helper utilities (cn, formatBytes)
│   ├── tailwind.config.ts # Onyx (#09090B) & Alabaster (#FAFAFA) palette
│   └── package.json       # Frontend dependencies (Framer Motion, Lucide, Tailwind)
├── uploads/               # Shared storage for original & compressed media
├── main.py                # Root-level entrypoint alias for uvicorn
├── requirements.txt       # Python dependencies (FastAPI, Celery, Redis, python-multipart)
├── .gitignore             # Git ignore patterns for Python, Node & macOS
└── README.md              # Full-stack documentation
```

---

## Prerequisites (macOS)

1. **Python 3.10+**: Python virtual environment (`venv`).
2. **Node.js 18+ & npm**: For running the Next.js frontend.
3. **Redis**: Installed via Homebrew (`brew install redis`).
4. **FFmpeg**: Installed via Homebrew (`brew install ffmpeg`).

---

## Installation & Setup

### 1. Backend Setup
```bash
cd /Users/sreerag/projects/FluxMedia
source venv/bin/activate
pip install -r requirements.txt
```

### 2. Frontend Setup
```bash
cd /Users/sreerag/projects/FluxMedia/frontend
npm install
```

---

## Running the Application (macOS Terminal Tabs)

To run the complete full-stack architecture locally, open separate terminal tabs:

### Tab 1: Start Redis
```bash
redis-server
# Or as a background service:
# brew services start redis
```
> **Verify Redis:** Run `redis-cli ping` (should output `PONG`).

---

### Tab 2: Start the Celery Worker
```bash
cd /Users/sreerag/projects/FluxMedia
source venv/bin/activate
celery -A app.worker.celery_app worker --loglevel=info
```
> *(On macOS, the worker automatically defaults to `--pool=solo` to ensure safe single-process execution without spawn/billiard errors)*

---

### Tab 3: Start the FastAPI Server
```bash
cd /Users/sreerag/projects/FluxMedia
source venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
- **Backend API Base**: `http://127.0.0.1:8000`
- **Interactive API Docs**: `http://127.0.0.1:8000/docs`

---

### Tab 4: Start the Next.js Frontend
```bash
cd /Users/sreerag/projects/FluxMedia/frontend
npm run dev
```
- **Frontend URL**: [http://localhost:3000](http://localhost:3000)

---

## Architecture & Data Flow

1. **File Upload (`POST /upload`)**:
   - The user drops a video file into the Next.js **UploadZone**.
   - The browser streams `multipart/form-data` to FastAPI at `http://localhost:8000/upload`.
   - The backend saves the raw file to `/uploads` with a collision-resistant unique prefix and immediately dispatches a task to Celery using `.delay(saved_filepath)`.
   - FastAPI returns HTTP 202 with `task_id`.

2. **Active Status Polling (`GET /status/{task_id}`)**:
   - The frontend transitions to the **StatusTracker** view.
   - It polls `http://localhost:8000/status/{task_id}` every 2 seconds.
   - Displays real-time animated radar and elapsed timer via Framer Motion.

3. **FFmpeg Transcoding & Background Processing**:
   - Celery worker receives the message from Redis.
   - Executes:
     ```bash
     ffmpeg -y -i /uploads/<input> -vcodec libx264 -crf 28 /uploads/compressed_<input>
     ```
   - Writes the compressed artifact directly into `/uploads` and sets the task state to `"COMPLETED"`.

4. **Result & Download (`GET /download/{filename}`)**:
   - Once the status reaches `"COMPLETED"`, the frontend transitions to the **ResultCard** (featuring a cursor-tracking Spotlight effect).
   - Clicking **Download Compressed Video** triggers `GET http://localhost:8000/download/compressed_<filename>` which delivers the file via FastAPI `FileResponse`.

---

## Design System: Onyx & Alabaster

- **Dual-Theme Support**:
  - **Dark Mode (Onyx)**: Background `#09090B`, Surface cards `#121214`, Border `rgba(255, 255, 255, 0.10)`.
  - **Light Mode (Alabaster)**: Background `#FAFAFA`, Surface cards `#FFFFFF`, Border `rgba(0, 0, 0, 0.06)`.
- **Spotlight Cards**: Dynamic radial gradient illumination following cursor coordinates.
- **Typography**: Inter font with high-contrast headers, muted slate subtext, and monospaced badges.
