# FluxMedia - Distributed Media Task Queue

FluxMedia is a distributed media processing task queue backend built with **FastAPI**, **Celery**, and **Redis** on macOS. It is designed to handle asynchronous, CPU-intensive media processing workloads (such as FFmpeg video compression using H.264, audio transcoding, and media transformation) without blocking HTTP API requests.

---

## Project Structure

```text
FluxMedia/
├── app/
│   ├── __init__.py        # App package marker
│   ├── main.py            # FastAPI API gateway & route handlers
│   └── worker.py          # Celery worker with FFmpeg compression & dummy tasks
├── main.py                # Root-level entrypoint alias for uvicorn
├── requirements.txt       # Project dependencies
├── .gitignore             # Git ignore patterns for Python & macOS
└── README.md              # Setup and execution guide
```

---

## Prerequisites (macOS)

1. **Python 3.10+**: Ensure Python is installed.
2. **Redis**: Installed via Homebrew (`brew install redis`).
3. **FFmpeg**: Installed via Homebrew (`brew install ffmpeg`).

---

## Installation & Setup

1. **Navigate to the project directory**:
   ```bash
   cd /Users/sreerag/projects/FluxMedia
   ```

2. **Activate the Virtual Environment**:
   ```bash
   source venv/bin/activate
   ```
   *(If creating a new virtual environment: `python3 -m venv venv && source venv/bin/activate`)*

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

---

## Running the Application (macOS Terminal Tabs)

To run the complete distributed stack locally, open three separate terminal tabs (or windows):

### Tab 1: Start Redis

Ensure Redis is running locally on default port `6379`.

- **Option A (Foreground Process):**
  ```bash
  redis-server
  ```
- **Option B (Homebrew Service):**
  ```bash
  brew services start redis
  ```

> **Verify Redis:** Run `redis-cli ping` in your terminal. It should respond with `PONG`.

---

### Tab 2: Start the Celery Worker

Navigate to the project root, activate your virtual environment, and launch the Celery worker:

```bash
cd /Users/sreerag/projects/FluxMedia
source venv/bin/activate
celery -A app.worker.celery_app worker --loglevel=info
```
*(You can also run `celery -A app.worker worker --loglevel=info`)*

> **macOS Note:** On macOS, Python multiprocessing uses `spawn` instead of `fork` by default, and macOS security checks may occasionally trigger fork-safety warnings. If you encounter any fork-safety issues on macOS, run the worker with the `solo` pool:
> ```bash
> celery -A app.worker.celery_app worker --loglevel=info --pool=solo
> ```
> Or export the macOS fork-safety environment variable before starting:
> ```bash
> export OBJC_DISABLE_INITIALIZE_FORK_SAFETY=YES
> celery -A app.worker.celery_app worker --loglevel=info
> ```

---

### Tab 3: Start the FastAPI Server

Navigate to the project root, activate your virtual environment, and launch the Uvicorn ASGI server:

```bash
cd /Users/sreerag/projects/FluxMedia
source venv/bin/activate
uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
```
*(Or simply `uvicorn main:app --reload`)*

The FastAPI application will be available at:
- **API Base URL**: `http://127.0.0.1:8000`
- **Interactive Swagger Docs**: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- **ReDoc Documentation**: [http://127.0.0.1:8000/redoc](http://127.0.0.1:8000/redoc)

---

## Testing the Media Task Queue

### 1. Dispatch an FFmpeg Video Compression Job

When you have a video file (e.g. `sample.mp4`) in your workspace or specify its path:

```bash
curl -X POST "http://127.0.0.1:8000/upload/sample.mp4"
```

**Response (Instant):**
```json
{
  "job_id": "c1f7b029-7953-4dc9-980f-fa562919d363",
  "task_id": "c1f7b029-7953-4dc9-980f-fa562919d363",
  "filename": "sample.mp4",
  "status": "Task dispatched"
}
```

The Celery worker in Tab 2 will pick up the task and run:
`ffmpeg -y -i sample.mp4 -vcodec libx264 -crf 28 compressed_sample.mp4`

---

### 2. Dispatch a Simulated 10-Second Delay Job

If you want to test queue concurrency without an actual video file on disk, call `/simulate/{filename}`:

```bash
curl -X POST "http://127.0.0.1:8000/simulate/test_video.mp4"
```

---

### 3. Poll Task Status

Check the status and result of any job using its `job_id`:

```bash
curl "http://127.0.0.1:8000/task/<YOUR_JOB_ID>"
```

- **While processing:**
  ```json
  {
    "task_id": "<YOUR_JOB_ID>",
    "status": "PENDING",
    "result": null
  }
  ```

- **When completed (FFmpeg compression):**
  ```json
  {
    "task_id": "<YOUR_JOB_ID>",
    "status": "SUCCESS",
    "result": {
      "status": "success",
      "file": "compressed_sample.mp4"
    }
  }
  ```
